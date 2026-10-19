"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const subscribe = () => () => {};
const options = [
  { value: "light", label: "Tema terang", Icon: Sun },
  { value: "dark", label: "Tema gelap", Icon: Moon },
  { value: "system", label: "Ikuti tema sistem", Icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reason = useRef<"hover" | "control">("control");
  const selected = options.find(option => option.value === (mounted ? theme : "system")) ?? options[2];
  const CurrentIcon = selected.Icon;

  const cancelLeave = useCallback(() => {
    if (leaveTimer.current !== null) clearTimeout(leaveTimer.current);
    leaveTimer.current = null;
  }, []);
  const close = useCallback((restore = false) => {
    cancelLeave();
    setOpen(false);
    if (restore) trigger.current?.focus();
  }, [cancelLeave]);
  function focusOption(last = false) {
    const buttons = root.current?.querySelectorAll<HTMLButtonElement>(".theme-options button");
    buttons?.[last ? buttons.length - 1 : 0]?.focus();
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); close(true); }
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && event.target === trigger.current) {
      event.preventDefault(); cancelLeave(); reason.current = "control"; setOpen(true);
    }
  }

  useEffect(() => () => {
    if (leaveTimer.current !== null) clearTimeout(leaveTimer.current);
  }, []);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) close();
    };
    const history = () => close();
    document.addEventListener("pointerdown", outside);
    window.addEventListener("popstate", history);
    return () => { document.removeEventListener("pointerdown", outside); window.removeEventListener("popstate", history); };
  }, [open, close]);

  return <div className="theme-switcher" ref={root} onKeyDown={onKeyDown}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}
    onPointerEnter={event => {
      cancelLeave();
      if (event.pointerType === "mouse" && window.matchMedia("(hover: hover)").matches) {
        if (!open) reason.current = "hover";
        setOpen(true);
      }
    }}
    onPointerLeave={() => {
      cancelLeave();
      leaveTimer.current = setTimeout(() => {
        if (reason.current === "hover" && !root.current?.contains(document.activeElement)) setOpen(false);
      }, 160);
    }}>
    <button ref={trigger} className="icon-button theme-trigger" type="button" aria-label="Pilihan tema" title={`Pilihan tema · ${selected.label}`} aria-expanded={open} aria-controls="theme-options"
      onClick={event => {
        cancelLeave();
        if (open && reason.current === "hover") { reason.current = "control"; return; }
        reason.current = "control";
        setOpen(!open);
        if (event.detail === 0) reason.current = "control";
      }}>
      <CurrentIcon size={19} aria-hidden="true"/>
    </button>
    <div id="theme-options" className="theme-options" data-open={open} role="group" aria-label="Tema tampilan" aria-hidden={!open} inert={!open}
      onKeyDown={event => {
        if (event.key === "Home") { event.preventDefault(); focusOption(); }
        if (event.key === "End") { event.preventDefault(); focusOption(true); }
      }}>
      {options.map(({ value, label, Icon }) => <button key={value} type="button" className="icon-button" aria-label={label} title={label} aria-pressed={mounted && theme === value}
        onClick={() => { setTheme(value); close(true); }}><Icon size={19} aria-hidden="true"/></button>)}
    </div>
  </div>;
}
