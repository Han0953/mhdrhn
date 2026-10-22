"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, type ReactNode } from "react";
import { mountThemeMotion } from "@/lib/motion/theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => mountThemeMotion(document.documentElement), []);
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      {children}
    </NextThemesProvider>
  );
}
