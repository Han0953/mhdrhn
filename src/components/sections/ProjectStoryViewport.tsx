"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { mountProjectStory } from "@/lib/project-story-motion";
import { List, PanelsTopLeft } from "lucide-react";

export function ProjectStoryViewport({ children, overview, id, titles }: { children: ReactNode; overview: ReactNode; id: string; titles: readonly string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [list, setList] = useState(false);
  useEffect(() => root.current ? mountProjectStory(root.current) : undefined, []);
  return <div className="story-root" ref={root} data-view={list ? "list" : "scroll"}>
    <div className="story-sticky">
      <div className="story-overview">{overview}</div>
      <div className="story-stage">
      {children}
      <div className="story-controls">
        <div className="story-steps" role="group" aria-label={`Pilih karya ${id === "latest" ? "terbaru" : "elektronika"}`}>{titles.map((title, index) => <button type="button" key={title} data-story-target={index} aria-controls={`${id}-project-${index}`} aria-label={`Tampilkan ${title}`}>{String(index + 1).padStart(2, "0")}</button>)}</div>
        <button type="button" className="text-link story-view-toggle" aria-label={list ? "Gunakan tampilan geser" : "Gunakan tampilan daftar"} aria-pressed={list} onClick={() => setList(value => !value)}><span className="story-view-label">{list ? "Tampilan geser" : "Tampilan daftar"}</span>{list ? <PanelsTopLeft className="story-view-icon" size={18} aria-hidden="true"/> : <List className="story-view-icon" size={18} aria-hidden="true"/>}</button>
      </div>
      <div className="story-progress" aria-hidden="true"><span/></div>
      </div>
    </div>
  </div>;
}
