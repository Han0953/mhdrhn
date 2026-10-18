"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // Click outside handler for mobile/desktop
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return <div className="h-9 w-9" />;

  const options = [
    { value: "light", label: "Light", icon: Sun, color: "text-amber-500 hover:text-amber-600" },
    { value: "dark", label: "Dark", icon: Moon, color: "text-electric hover:text-cyan-brand" },
    { value: "system", label: "System", icon: Monitor, color: "text-muted-foreground hover:text-foreground" },
  ];

  const currentOption = options.find((opt) => opt.value === theme) || options[2];
  const CurrentIcon = currentOption.icon;

  return (
    <div
      ref={dropdownRef}
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl border border-border/30 bg-card/40 backdrop-blur-md transition-all duration-300 hover:bg-primary/10 hover:border-primary/30",
          isOpen && "bg-primary/10 border-primary/30"
        )}
        aria-label="Theme selector"
        aria-expanded={isOpen}
      >
        <CurrentIcon className={cn("h-[18px] w-[18px] transition-all duration-300", currentOption.color)} />
      </button>

      {/* Dropdown Menu */}
      <div
        className={cn(
          "absolute right-0 top-full pt-2 w-32 transition-all duration-200 z-50 origin-top-right",
          isOpen
            ? "pointer-events-auto scale-100 opacity-100 translate-y-0"
            : "pointer-events-none scale-95 opacity-0 -translate-y-2"
        )}
      >
        <div className="rounded-xl border border-border/50 bg-popover text-popover-foreground p-1.5 shadow-xl backdrop-blur-md">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isActive = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-all duration-200 hover:bg-muted hover:text-foreground",
                  isActive
                    ? "bg-muted text-electric dark:text-cyan-brand font-bold"
                    : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? (theme === "light" ? "text-amber-500" : "text-cyan-brand") : opt.color)} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
