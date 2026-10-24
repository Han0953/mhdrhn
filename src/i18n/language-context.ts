import { motionElementKey } from "@/lib/motion/language-checkpoint";

type Context = { disclosures: Map<string,boolean>; stories: Map<string,boolean> };
let context: Context | undefined;
let anchoringStyle: HTMLStyleElement | undefined;
function disclosureKey(details: HTMLDetailsElement) {
  const main=details.closest('main');
  return main ? motionElementKey(details,main) : '';
}
export function disclosureExpanded(details: HTMLDetailsElement) {
  return details.open && details.dataset.motionState !== 'closing';
}
export function captureLanguageContext(main: HTMLElement) {
  anchoringStyle?.remove();anchoringStyle=document.createElement('style');
  anchoringStyle.textContent='html,body{overflow-anchor:none!important;scroll-behavior:auto!important}';document.head.append(anchoringStyle);
  context={
    disclosures:new Map(Array.from(main.querySelectorAll('details')).map(node=>[disclosureKey(node),disclosureExpanded(node)])),
    stories:new Map(Array.from(main.querySelectorAll<HTMLElement>('[data-home-section] .story-root')).map(node=>[node.closest<HTMLElement>('[data-home-section]')!.dataset.homeSection!,node.dataset.view==='list'])),
  };
}
export function restoreLanguageDisclosure(details: HTMLDetailsElement) {
  const expanded=context?.disclosures.get(disclosureKey(details));
  if(expanded!==undefined) details.open=expanded;
}
export function languageStoryList(id: string) {
  return context?.stories.get(id==='latest'?'latest-projects':'electronics-projects');
}
export function clearLanguageContext() { context=undefined;anchoringStyle?.remove();anchoringStyle=undefined; }

/** Closed descriptions stay in the translated DOM, but never in a word overlay. */
export function disclosureTextHidden(parent: Element) {
  const closed=parent.closest('details:not([open]),details[data-motion-state="closing"]');
  if(!closed)return false;
  const summary=Array.from(closed.children).find(child=>child.tagName==='SUMMARY');
  return !summary?.contains(parent);
}
