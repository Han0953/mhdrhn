"use client";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateTree } from "@/i18n/translate";


import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { languageStoryList } from "@/i18n/language-context";
import { mountProjectStory } from "@/lib/project-story-motion";
import { List, PanelsTopLeft } from "lucide-react";

export function ProjectStoryViewport({ children, overview, id, titles }: { children: ReactNode; overview: ReactNode; id: string; titles: readonly string[] }) {
  const {locale,t}=useTranslation();
  const root = useRef<HTMLDivElement>(null);
  const [list, setList] = useState(false);
  const activeList=languageStoryList(id)??list;
  useLayoutEffect(() => {
    if(!root.current)return;
    return mountProjectStory(root.current);
  }, [locale]);
  useLayoutEffect(()=>{const restore=()=>{const saved=languageStoryList(id);if(saved!==undefined)setList(saved);};window.addEventListener('mhdrhn:language-complete',restore);return()=>window.removeEventListener('mhdrhn:language-complete',restore);},[id,locale]);
  return translateTree(<div className="story-root" ref={root} data-view={activeList ? "list" : "scroll"}>
    <div className="story-sticky">
      <div className="story-overview">{overview}</div>
      <div className="story-stage">
      {children}
      <div className="story-controls">
        <div className="story-steps" role="group" aria-label={`Pilih karya ${id === "latest" ? "terbaru" : "elektronika"}`}>{titles.map((title, index) => <button type="button" key={title} data-story-target={index} aria-controls={`${id}-project-${index}`} aria-label={`Tampilkan ${title}`}>{String(index + 1).padStart(2, "0")}</button>)}</div>
        <button type="button" className="text-link story-view-toggle" aria-label={activeList ? "Gunakan tampilan geser" : "Gunakan tampilan daftar"} aria-pressed={activeList} onClick={() => setList(value => !value)}><span className="story-view-label">{activeList ? "Tampilan geser" : "Tampilan daftar"}</span>{activeList ? <PanelsTopLeft className="story-view-icon" size={18} aria-hidden="true"/> : <List className="story-view-icon" size={18} aria-hidden="true"/>}</button>
      </div>
      <div className="story-progress" aria-hidden="true"><span/></div>
      </div>
    </div>
  </div>,t,locale);
}
