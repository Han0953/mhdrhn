"use client";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateTree } from "@/i18n/translate";
import { cancelLanguageChange, languageChangePending } from "@/i18n/language-motion";


import { useTheme } from "next-themes";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { getMotionPreference, setMotionPreference, subscribeMotion } from "@/lib/motion/preferences";

const subscribe = () => () => {};
// Native focus can scroll a sticky header's ancestor even while the button is visible.
function focusWithoutScroll(event: ReactPointerEvent<HTMLButtonElement>) {
  if (event.button !== 0) return;
  event.preventDefault();
  event.currentTarget.focus({ preventScroll: true });
}
const options = [
  { value: "light", label: "Tema terang", Icon: Sun },
  { value: "dark", label: "Tema gelap", Icon: Moon },
  { value: "system", label: "Ikuti tema sistem", Icon: Monitor },
] as const;

export function ThemeToggle() {
  const {locale,t}=useTranslation();
  const id = useId();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const motion = useSyncExternalStore(subscribeMotion, getMotionPreference, () => "system");
  const [open, setOpen] = useState(false);
  useEffect(()=>{const other=(event:Event)=>{if((event as CustomEvent).detail=== "language")setOpen(false);};window.addEventListener("mhdrhn:popover",other);return()=>window.removeEventListener("mhdrhn:popover",other);},[]);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reason = useRef<"hover" | "control">("control");
  const selected = options.find(option => option.value === (mounted ? theme : "system")) ?? options[2];

  const cancelLeave = useCallback(() => {
    if (leaveTimer.current !== null) clearTimeout(leaveTimer.current);
    leaveTimer.current = null;
  }, []);
  const close = useCallback((restore = false) => {
    cancelLeave();
    setOpen(false);
    if (restore) trigger.current?.focus({ preventScroll: true });
  }, [cancelLeave]);
  function focusOption(last = false) {
    const buttons = root.current?.querySelectorAll<HTMLButtonElement>(".theme-options button");
    buttons?.[last ? buttons.length - 1 : 0]?.focus({ preventScroll: true });
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); close(true); }
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && event.target === trigger.current) {
      event.preventDefault(); cancelLeave(); reason.current = "control"; window.dispatchEvent(new CustomEvent("mhdrhn:popover",{detail:"theme"})); setOpen(true);
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

  return translateTree(<div className="theme-switcher" ref={root} onKeyDown={onKeyDown}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}
    onPointerEnter={event => {
      cancelLeave();
      if (event.pointerType === "mouse" && window.matchMedia("(hover: hover)").matches) {
        if (!open) { reason.current = "hover"; window.dispatchEvent(new CustomEvent("mhdrhn:popover",{detail:"theme"})); }
        setOpen(true);
      }
    }}
    onPointerLeave={() => {
      cancelLeave();
      leaveTimer.current = setTimeout(() => {
        if (reason.current === "hover" && !root.current?.contains(document.activeElement)) setOpen(false);
      }, 160);
    }}>
    <button ref={trigger} className="icon-button theme-trigger" type="button" aria-label="Pilihan tema" title={`Pilihan tema · ${selected.label}`} aria-expanded={open} aria-controls={`${id}-theme-options`} onPointerDown={focusWithoutScroll}
      onClick={event => {
        cancelLeave();
        if (open && reason.current === "hover") { reason.current = "control"; return; }
        reason.current = "control";
        if(!open)window.dispatchEvent(new CustomEvent("mhdrhn:popover",{detail:"theme"}));
        setOpen(!open);
        if (event.detail === 0) reason.current = "control";
      }}>
      {/* Both icons are SSR-stable; next-themes sets the root class before paint. */}
      <span className="theme-current-icon" aria-hidden="true"><Sun size={19} className="theme-icon-light"/><Moon size={19} className="theme-icon-dark"/></span>
    </button>
    <div id={`${id}-theme-options`} className="theme-options" data-open={open} role="group" aria-label="Preferensi tampilan" aria-hidden={!open} inert={!open}
      onKeyDown={event => {
        if (event.key === "Home") { event.preventDefault(); focusOption(); }
        if (event.key === "End") { event.preventDefault(); focusOption(true); }
      }}>
      <span className="preference-label" id={`${id}-theme-label`}>Tema</span>
      <div className="theme-choice-row" role="group" aria-labelledby={`${id}-theme-label`}>{options.map(({ value, label, Icon }) => <button key={value} type="button" className="icon-button" aria-label={label} title={label} aria-pressed={mounted && theme === value} onPointerDown={focusWithoutScroll}
        onClick={() => { if(languageChangePending())cancelLanguageChange(); setTheme(value); close(true); }}><Icon size={19} aria-hidden="true"/></button>)}</div>
      <span className="preference-label" id={`${id}-motion-label`}>Gerak</span>
      <div className="motion-choice-row" role="group" aria-labelledby={`${id}-motion-label`}>
        <button type="button" aria-label="Ikuti pengaturan gerak sistem" aria-pressed={motion === "system"} onPointerDown={focusWithoutScroll} onClick={() => { setMotionPreference("system"); close(true); }}>Sistem</button>
        <button type="button" aria-label="Kurangi gerakan" aria-pressed={motion === "minimal"} onPointerDown={focusWithoutScroll} onClick={() => { setMotionPreference("minimal"); close(true); }}>Minimal</button>
      </div>
      <p className="preference-hint">Minimal menghentikan animasi dan teks bergilir.</p>
    </div>
  </div>,t,locale);
}
