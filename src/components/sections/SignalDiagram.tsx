"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import type { EngineeringStep } from "@/lib/content";

export function SignalDiagram({ steps, story = false }: { steps: readonly EngineeringStep[]; story?: boolean }) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const signal = useRef<SVGPathElement>(null);
  const progress = useRef(1 / 3);
  const animation = useRef<Animation | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const running = useRef(false);

  const clear = useCallback(() => {
    animation.current?.cancel();
    animation.current = null;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    running.current = false;
  }, []);

  const select = useCallback((index: number) => {
    const next = (index + 1) / steps.length;
    const previous = progress.current;
    progress.current = next;
    setActive(index);
    animation.current?.cancel();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !signal.current?.animate) return;
    try {
      animation.current = signal.current.animate([
        { strokeDashoffset: String(1 - previous) }, { strokeDashoffset: String(1 - next) },
      ], { duration: 280, easing: "ease-out" });
    } catch { /* The static SVG and selected node already describe the state. */ }
  }, [steps.length]);

  function choose(index: number) { clear(); select(index); }
  function run() {
    clear();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { select(2); return; }
    running.current = true;
    select(0);
    timers.current = [
      setTimeout(() => select(1), 300),
      setTimeout(() => { select(2); running.current = false; }, 600),
    ];
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreference = () => {
      if (!media.matches) return;
      const wasRunning = running.current;
      clear();
      if (wasRunning) select(2);
    };
    const onHidden = () => { if (document.hidden) clear(); };
    media.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onHidden);
    const observer = story && typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(entries => {
      const entry = entries.filter(item => item.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (entry) { clear(); select(Number((entry.target as HTMLElement).dataset.step)); }
    }, { threshold: [0.5, 0.9] }) : null;
    root.current?.querySelectorAll("[data-step]").forEach(node => observer?.observe(node));
    return () => {
      clear(); observer?.disconnect();
      media.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [clear, select, story]);

  return <div className={`signal-widget${story ? " signal-story" : ""}`} ref={root} data-active-step={steps[active].id}>
    <figure className="redline-probe">
      <div className="probe-heading"><span className="eyebrow">{story ? "Dari gagasan ke sistem" : "Dari sinyal ke sistem"}</span><span className="meta">{story ? "FIG. 02" : "FIG. 01"}</span></div>
      <svg viewBox="0 0 440 250" aria-hidden="true" focusable="false">
        <path d="M35 205H400M120 35V215M260 35V215" fill="none" stroke="currentColor" opacity=".2"/>
        <path className="signal-track" d="M35 160H120V70H260V160H400" strokeWidth="9"/>
        <path ref={signal} className="diagram-line" d="M35 160H120V70H260V160H400" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - (active + 1) / steps.length} strokeWidth="9"/>
        <g className="probe-nodes" strokeWidth="4"><circle className={active === 0 ? "node-active" : ""} cx="35" cy="160" r="13"/><rect className={active === 1 ? "node-active" : ""} x="102" y="52" width="36" height="36"/><circle className={active === 1 ? "node-active" : ""} cx="260" cy="160" r="13"/><circle className={active === 2 ? "node-active" : ""} cx="400" cy="160" r="13"/></g>
        <text x="155" y="105" fill="currentColor" fontSize="12">01 → 02 → 03</text>
      </svg>
      {!story && <div className="probe-controls" role="group" aria-label="Jelajahi alur engineering">{steps.map((step, index) => <button key={step.id} type="button" aria-pressed={active === index} onClick={() => choose(index)}>{step.title}</button>)}</div>}
      <figcaption>{story ? "Alur konseptual untuk menjelaskan proses kreatif." : steps[active].short}</figcaption>
      <button type="button" className="signal-replay" onClick={run} aria-label="Jalankan alur Sense, Compute, Build"><Play size={13} aria-hidden="true"/> Jalankan alur</button>
    </figure>
    {story && <ol className="process-steps">{steps.map((step, index) => <li key={step.id} data-step={index} data-selected={active === index}>
      <h3><button type="button" aria-pressed={active === index} onClick={() => choose(index)}><span className="eyebrow">0{index + 1}</span>{step.title}<span aria-hidden="true">↗</span></button></h3>
      <p className="process-short">{step.short}</p><p>{step.description}</p>
    </li>)}</ol>}
  </div>;
}
