import { Children, cloneElement, isValidElement, type ReactNode, type ReactElement } from "react";
import { localeHref, type Locale } from "./config";
export type Messages = Readonly<Record<string, string>>;
export type Translator = (source: string) => string;
/** Translation runs during React rendering, never as a DOM text mutation. */
export function makeTranslator(locale: Locale, messages: Messages): Translator {
  if (locale === "id") return value => value;
  const templates = Object.entries(messages).filter(([key])=>/\{\d+\}/.test(key)).map(([key,value])=>({
    pattern:new RegExp('^'+key.split(/(\{\d+\})/).map(part=>/^\{\d+\}$/.test(part)?'(.*?)':part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('')+'$'), value,
  }));
  const translate: Translator = source => {
    const key=source.replace(/\s+/g," ").trim();
    if (!key) return source;
    let result=messages[key];
    if (result === undefined) for(const template of templates){const match=key.match(template.pattern);if(match){result=template.value.replace(/\{(\d+)\}/g,(_,n)=>translate(match[Number(n)+1]));break;}}
    if(result===undefined) return source;
    return source.slice(0,source.search(/\S/))+result+(source.match(/\s*$/)?.[0]??"");
  };
  return translate;
}
const textProps=new Set(["title","label","description","summary","eyebrow","intro","linkLabel","alt","placeholder","aria-label","aria-description","aria-valuetext"]);
const recordText=new Set(["title","label","description","summary","alt","caption","credit","context","approach","limitation","short","note","period","level","program","recognition","scoreLabel","issued","expires"]);
function localizedData(value: unknown,t:Translator,key=""):unknown {
  if(typeof value==="string")return recordText.has(key)?t(value):value;
  if(Array.isArray(value))return value.map(item=>localizedData(item,t,key));
  if(value&&typeof value==="object"&&!isValidElement(value)){return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,localizedData(v,t,k)]));}
  return value;
}
/** Preserve element identity, refs and event handlers; translate only human-facing fields. */
export function translateTree(node: ReactNode, t: Translator, locale: Locale): ReactNode {
  if(typeof node==="string")return t(node);
  // JSX static children can be unkeyed. Cloning them loses React's static-child
  // validation metadata, so use React's traversal to retain stable child keys.
  if(Array.isArray(node))return Children.map(node,child=>translateTree(child,t,locale));
  if(!isValidElement(node))return node;
  const element=node as ReactElement<Record<string,unknown>>,props=element.props;
  // Framework bootstrap/resource elements are opaque, never editorial content.
  if(element.type==="script"||element.type==="style"||element.type==="link"||element.type==="meta")return node;
  if(props["data-no-translate"])return node;
  const next:Record<string,unknown>={};
  for(const [key,value] of Object.entries(props)){
    if(key==="children"||key==="fallback"||key==="overview"||key==="summary"&&typeof value!=="string")next[key]=translateTree(value as ReactNode,t,locale);
    else if(textProps.has(key)&&typeof value==="string")next[key]=t(value);
    else if((key==="href"||key==="action")&&typeof value==="string")next[key]=localeHref(value,locale);
    else if(key==="href"&&value&&typeof value==="object"&&"pathname" in value&&typeof value.pathname==="string"&&!("host" in value&&value.host)&&!("hostname" in value&&value.hostname)&&!("protocol" in value&&value.protocol))next[key]={...value,pathname:localeHref(value.pathname,locale)};
    else if(["media","items","steps","project"].includes(key))next[key]=localizedData(value,t);
  }
  return cloneElement(element,next);
}
