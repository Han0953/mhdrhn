import type {Metadata} from "next";
import {localeHref,type Locale} from "./config";
import {serverTranslator} from "./server";
export function configuredOrigin(){const value=process.env.SITE_ORIGIN;if(!value)return undefined;try{const url=new URL(value);return /^https?:$/.test(url.protocol)&&!url.username&&!url.password&&url.pathname==='/'?url.origin:undefined;}catch{return undefined;}}
// Vercel also builds previews with NODE_ENV=production. Only the actual
// production environment with an explicit canonical origin may be indexed.
export function indexingAllowed(){return process.env.VERCEL_ENV==='production'&&!!configuredOrigin();}
export function localizedMetadata(locale:Locale,path:string,base:Metadata):Metadata{
 const t=serverTranslator(locale),origin=configuredOrigin(),description=base.description?t(String(base.description)):undefined,title=typeof base.title==='string'?t(base.title):base.title;
 return {...base,title,description,...(origin?{metadataBase:new URL(origin),alternates:{canonical:localeHref(path,locale),languages:{id:localeHref(path,'id'),en:localeHref(path,'en'),'x-default':localeHref(path,'id')}}}:{}),openGraph:{...base.openGraph,title:typeof title==='string'?title:'Muhammad Rehan — Creative Engineering',description,locale:locale==='en'?'en_US':'id_ID',...(origin?{url:new URL(localeHref(path,locale),origin).href}:{})},twitter:{card:'summary',title:typeof title==='string'?title:undefined,description}};
}
