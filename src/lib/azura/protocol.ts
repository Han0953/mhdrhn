export type ChatTurn = { role:"user"|"model"; text:string };
export type ChatInput = {question:string;locale:"id"|"en";history:ChatTurn[]};
export const AI_ERRORS = {
  invalid:"Pertanyaan tidak valid. Gunakan maksimal 500 karakter.",
  not_configured:"Azura belum dapat terhubung. Silakan coba lagi nanti.",
  rate_limit:"Terlalu banyak permintaan. Tunggu sebentar sebelum mencoba lagi.",
  timeout:"Azura membutuhkan waktu lebih lama. Silakan kirim ulang pertanyaanmu.",
  upstream:"Jawaban belum tersedia. Silakan coba lagi sebentar lagi.",
  interrupted:"Permintaan terhenti. Kirim ulang pertanyaanmu untuk melanjutkan.",
} as const;
export type AiError = keyof typeof AI_ERRORS;
export function isAiError(value:unknown):value is AiError { return typeof value==="string"&&Object.hasOwn(AI_ERRORS,value); }
export function parseChatInput(value:unknown):ChatInput|null {
  if(!value||typeof value!=="object")return null;
  const v=value as Record<string,unknown>;
  if(typeof v.question!=="string"||!v.question.trim()||v.question.length>500||(v.locale!=='id'&&v.locale!=='en')||!Array.isArray(v.history)||v.history.length>4)return null;
  let total=v.question.length;
  const history:ChatTurn[]=[];
  for(const [index,turn] of v.history.entries()){
    if(!turn||typeof turn!=="object")return null;
    const entry=turn as Record<string,unknown>;
    const role:ChatTurn['role']=index%2===0?'user':'model';
    if(entry.role!==role||typeof entry.text!=="string"||!entry.text.trim()||entry.text.length>(role==='user'?500:3500))return null;
    total+=entry.text.length; history.push({role,text:entry.text});
  }
  if(history.length%2||total>8500)return null;
  return {question:v.question.trim(),locale:v.locale,history};
}
