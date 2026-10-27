import 'server-only';
import {createHash,createPrivateKey,sign,type KeyObject} from 'node:crypto';

type Credentials={project:string;email:string;key:KeyObject;identity:string};
type Event={token:string;at:number;client:string};
type Lease={token:string;until:number};
type State={version:1;events:Event[];leases:Lease[]};
type Decision={allowed:boolean;retryAfter:number;state:State};
const MINUTE=60000,HOUR=3600000,LEASE=60000;
const TOKEN_URL='https://oauth2.googleapis.com/token';
let cachedCredentials:Credentials|undefined;
let cachedToken:{identity:string;value:string;until:number}|undefined;
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);

export function firebaseCredentials():Credentials|null{
  const project=process.env.FIREBASE_PROJECT_ID?.trim(),email=process.env.FIREBASE_CLIENT_EMAIL?.trim(),pem=process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,'\n').trim();
  if(!project||!email||!pem||!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project)||!/^[a-z0-9._-]+@[a-z0-9-]+\.iam\.gserviceaccount\.com$/.test(email))return null;
  const identity=createHash('sha256').update(project+'\n'+email+'\n'+pem).digest('hex');
  if(cachedCredentials?.identity===identity)return cachedCredentials;
  try{
    const key=createPrivateKey(pem);
    if(key.asymmetricKeyType!=='rsa'||(key.asymmetricKeyDetails?.modulusLength??0)<2048)return null;
    return cachedCredentials={project,email,key,identity};
  }catch{return null;}
}

async function accessToken(config:Credentials,fetcher:typeof fetch,signal:AbortSignal){
  if(cachedToken?.identity===config.identity&&cachedToken.until>Date.now())return cachedToken.value;
  const seconds=Math.floor(Date.now()/1000);
  const encode=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString('base64url');
  const unsigned=encode({alg:'RS256',typ:'JWT'})+'.'+encode({iss:config.email,scope:'https://www.googleapis.com/auth/datastore',aud:TOKEN_URL,iat:seconds,exp:seconds+3600});
  const assertion=unsigned+'.'+sign('RSA-SHA256',Buffer.from(unsigned),config.key).toString('base64url');
  const response=await fetcher(TOKEN_URL,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}),cache:'no-store',redirect:'error',signal});
  if(!response.ok){await response.body?.cancel();throw Error('firebase_auth');}
  const data:unknown=await response.json();
  if(!record(data)||typeof data.access_token!=='string'||!data.access_token||data.access_token.length>8192||typeof data.expires_in!=='number'||data.expires_in<=60||data.expires_in>3600||typeof data.token_type!=='string'||data.token_type.toLowerCase()!=='bearer')throw Error('firebase_auth');
  cachedToken={identity:config.identity,value:data.access_token,until:Date.now()+(data.expires_in-60)*1000};
  return cachedToken.value;
}

function decodeState(raw:unknown):State{
  if(typeof raw!=='string'||raw.length>24000)throw Error('firebase_state');
  const data:unknown=JSON.parse(raw);
  if(!record(data)||data.version!==1||!Array.isArray(data.events)||data.events.length>60||!Array.isArray(data.leases)||data.leases.length>2)throw Error('firebase_state');
  const tokens=new Set<string>(),events:Event[]=[],leases:Lease[]=[];
  for(const event of data.events){
    if(!record(event)||typeof event.token!=='string'||!/^[a-f0-9-]{36}$/.test(event.token)||tokens.has(event.token)||typeof event.client!=='string'||!/^[a-f0-9]{64}$/.test(event.client)||typeof event.at!=='number'||!Number.isSafeInteger(event.at)||event.at<=0)throw Error('firebase_state');
    tokens.add(event.token);events.push({token:event.token,at:event.at,client:event.client});
  }
  const active=new Set<string>();
  for(const lease of data.leases){
    if(!record(lease)||typeof lease.token!=='string'||!/^[a-f0-9-]{36}$/.test(lease.token)||active.has(lease.token)||typeof lease.until!=='number'||!Number.isSafeInteger(lease.until)||lease.until<=0)throw Error('firebase_state');
    active.add(lease.token);leases.push({token:lease.token,until:lease.until});
  }
  return {version:1,events,leases};
}

function decide(state:State,now:number,client:string,token:string):Decision{
  const events=state.events.filter(e=>e.at>now-HOUR).sort((a,b)=>a.at-b.at),leases=state.leases.filter(l=>l.until>now);
  const minute=events.filter(e=>e.at>now-MINUTE),visitor=minute.filter(e=>e.client===client);
  const wait=Math.max(visitor.length>=6?visitor[0].at+MINUTE-now:0,minute.length>=10?minute[0].at+MINUTE-now:0,events.length>=60?events[0].at+HOUR-now:0,leases.length>=2?Math.min(...leases.map(l=>l.until))-now:0);
  if(wait>0)return {allowed:false,retryAfter:Math.max(1,Math.min(3600,Math.ceil(wait/1000))),state};
  return {allowed:true,retryAfter:0,state:{version:1,events:[...events,{token,at:now,client}],leases:[...leases,{token,until:now+LEASE}]}};
}

/** Strong read + conditional atomic commit (compare-and-swap); bounded conflict retries. */
export async function changeFirebaseQuota(config:Credentials,client:string,token:string,release:boolean,fetcher:typeof fetch,signal:AbortSignal):Promise<{allowed:boolean;retryAfter:number}>{
  const access=await accessToken(config,fetcher,signal),database=`projects/${config.project}/databases/(default)`,name=database+'/documents/azuraRateLimits/global-v1';
  async function call(method:'batchGet'|'commit',body:unknown){
    const response=await fetcher(`https://firestore.googleapis.com/v1/${database}/documents:${method}`,{method:'POST',headers:{Authorization:`Bearer ${access}`,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',redirect:'error',signal});
    if(response.status===401)cachedToken=undefined;
    return response;
  }
  for(let attempt=0;attempt<3;attempt++){
    signal.throwIfAborted();
    const response=await call('batchGet',{documents:[name]});
    if(!response.ok){await response.body?.cancel();throw Error('firebase_read');}
    const rows:unknown=await response.json();
    if(!Array.isArray(rows)||rows.length!==1||!record(rows[0])||typeof rows[0].readTime!=='string')throw Error('firebase_read');
    const row=rows[0],now=Date.parse(row.readTime as string);
    if(!Number.isSafeInteger(now)||now<=0)throw Error('firebase_clock');
    let state:State={version:1,events:[],leases:[]},precondition:unknown={exists:false};
    if(record(row.found)){
      const found=row.found;
      if(found.name!==name||typeof found.updateTime!=='string'||!Number.isFinite(Date.parse(found.updateTime))||!record(found.fields)||!record(found.fields.state))throw Error('firebase_state');
      state=decodeState(found.fields.state.stringValue);precondition={updateTime:found.updateTime};
    }else if(row.missing!==name)throw Error('firebase_state');
    const decision=release?{allowed:true,retryAfter:0,state:{version:1 as const,events:state.events.filter(e=>e.at>now-HOUR),leases:state.leases.filter(l=>l.until>now&&l.token!==token)}}:decide(state,now,client,token);
    if(!decision.allowed)return {allowed:false,retryAfter:decision.retryAfter};
    if(release&&!state.leases.some(l=>l.token===token))return {allowed:true,retryAfter:0};
    // A changed updateTime rejects the whole write; no partial admission or lost increment.
    const commit=await call('commit',{writes:[{update:{name,fields:{state:{stringValue:JSON.stringify(decision.state)}}},currentDocument:precondition}]});
    if(commit.status===409||commit.status===412||commit.status===400){
      const cause:unknown=await commit.json();
      if(record(cause)&&record(cause.error)&&['ABORTED','FAILED_PRECONDITION','ALREADY_EXISTS'].includes(String(cause.error.status)))continue;
      throw Error('firebase_commit');
    }
    if(!commit.ok){await commit.body?.cancel();throw Error('firebase_commit');}
    const result:unknown=await commit.json();
    if(!record(result)||!Array.isArray(result.writeResults)||result.writeResults.length!==1||!record(result.writeResults[0])||typeof result.writeResults[0].updateTime!=='string')throw Error('firebase_commit');
    return {allowed:true,retryAfter:0};
  }
  throw Error('firebase_conflict');
}
