"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

export function RotatingRoles({ roles }: { roles: readonly string[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    let visible = true;
    function sync() {
      clearInterval(timer);
      timer = undefined;
      if (!paused && !media.matches && !document.hidden && visible && roles.length > 1) {
        timer = setInterval(() => setIndex(current => (current + 1) % roles.length), 2000);
      }
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    if (root.current) observer.observe(root.current);
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      clearInterval(timer);
      observer.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused, roles.length]);

  return <div className="rotating-roles" ref={root}>
    <p className="sr-only">Fokus dan peran: {roles.join(" ")}</p>
    <div className="role-stage" aria-hidden="true">
      {/* All labels reserve the same responsive footprint before hydration. No clipping mask. */}
      {roles.map((role, i) => <span key={role} className={i === index ? "role-visible" : "role-reserve"}>{role}</span>)}
    </div>
    <button type="button" className="role-toggle" aria-label={paused ? "Lanjutkan pergantian subtitle" : "Jeda pergantian subtitle"} aria-pressed={paused} onClick={() => setPaused(value => !value)}>
      {paused ? <Play size={14} aria-hidden="true"/> : <Pause size={14} aria-hidden="true"/>}<span>{paused ? "Lanjutkan" : "Jeda"}</span>
    </button>
    <span className="role-reduced-note meta">Fokus kreatif & rekayasa</span>
  </div>;
}
