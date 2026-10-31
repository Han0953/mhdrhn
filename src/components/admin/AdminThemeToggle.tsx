'use client';

import React, { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

interface AdminThemeToggleProps {
  compact?: boolean;
}

const emptySubscribe = () => () => {};

export function AdminThemeToggle({ compact = false }: AdminThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded border border-border/60 flex items-center justify-center text-ink/40">
        <Sun size={14} />
      </div>
    );
  }

  const currentTheme = theme || 'system';

  if (compact) {
    // Cycle between light, dark, system on click
    const nextTheme =
      currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'system' : 'light';
    const Icon = currentTheme === 'light' ? Sun : currentTheme === 'dark' ? Moon : Monitor;

    return (
      <button
        type="button"
        onClick={() => setTheme(nextTheme)}
        className="w-9 h-9 rounded border border-border/80 bg-surface/80 hover:border-accent hover:text-accent flex items-center justify-center text-ink transition-colors cursor-pointer"
        title={`Tema saat ini: ${currentTheme.toUpperCase()} (Klik untuk ganti)`}
        aria-label="Ganti Tema Tampilan"
      >
        <Icon size={16} />
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Pilihan Tema Tampilan"
      className="inline-flex items-center border border-border bg-surface/70 p-0.5 rounded font-mono text-xs"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`px-2.5 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer rounded-xs ${
          currentTheme === 'light'
            ? 'bg-canvas text-accent font-semibold shadow-xs border border-border/60'
            : 'text-ink/60 hover:text-ink'
        }`}
        title="Tema Terang"
        aria-label="Aktifkan Tema Terang"
        aria-pressed={currentTheme === 'light'}
      >
        <Sun size={13} />
        <span className="text-[10px] tracking-wide">TERANG</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`px-2.5 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer rounded-xs ${
          currentTheme === 'dark'
            ? 'bg-canvas text-accent font-semibold shadow-xs border border-border/60'
            : 'text-ink/60 hover:text-ink'
        }`}
        title="Tema Gelap"
        aria-label="Aktifkan Tema Gelap"
        aria-pressed={currentTheme === 'dark'}
      >
        <Moon size={13} />
        <span className="text-[10px] tracking-wide">GELAP</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('system')}
        className={`px-2.5 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer rounded-xs ${
          currentTheme === 'system'
            ? 'bg-canvas text-accent font-semibold shadow-xs border border-border/60'
            : 'text-ink/60 hover:text-ink'
        }`}
        title="Ikuti Tema Sistem Operasi"
        aria-label="Ikuti Tema Sistem Operasi"
        aria-pressed={currentTheme === 'system'}
      >
        <Monitor size={13} />
        <span className="text-[10px] tracking-wide">SISTEM</span>
      </button>
    </div>
  );
}
