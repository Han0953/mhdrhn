"use client";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
const subscribe = () => () => {};
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return <div className="theme-controls" role="group" aria-label="Tema tampilan">
    {[{ value: "light", label: "Tema terang", Icon: Sun }, { value: "dark", label: "Tema gelap", Icon: Moon }, { value: "system", label: "Ikuti tema sistem", Icon: Monitor }].map(({ value, label, Icon }) =>
      <button key={value} type="button" className="icon-button" aria-label={label} title={label} aria-pressed={mounted && theme === value} onClick={() => setTheme(value)}><Icon size={17} aria-hidden="true" /></button>
    )}
  </div>;
}
