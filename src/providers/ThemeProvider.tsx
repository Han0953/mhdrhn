"use client";
import {useLocale} from "@/i18n/LocaleProvider";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { mountThemeMotion } from "@/lib/motion/theme";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
const inertBootstrap = { type: "text/plain" };

export function ThemeProvider({ children }: { children: ReactNode }) {
  const locale=useLocale();
  const clientMounted=useSyncExternalStore(subscribe,clientSnapshot,serverSnapshot);
  useEffect(() => mountThemeMotion(document.documentElement), [locale]);
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // next-themes' inline bootstrap is for initial HTML parsing only. A
      // locale layout can mount this provider again during client navigation;
      // its effects handle the theme then, without a new executable script.
      scriptProps={clientMounted ? inertBootstrap : undefined}
    >
      {children}
    </NextThemesProvider>
  );
}
