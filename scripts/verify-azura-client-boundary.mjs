import fs from 'node:fs';
import path from 'node:path';
// Read the local credential only to compare bytes; never print its value.
if(fs.existsSync('.env.local'))process.loadEnvFile('.env.local');
const key=process.env.GEMINI_API_KEY?.trim();
if(!key)throw Error('No configured key available for the client-bundle boundary check.');
let count=0;
function scan(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())scan(file);else{count++;if(fs.readFileSync(file).includes(Buffer.from(key)))throw Error('Credential found in a browser asset; do not deploy.');}}}
scan('.next/static');
console.log(JSON.stringify({browserAssetsScanned:count,credentialExposed:false}));
