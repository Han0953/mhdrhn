"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks } from "@/lib/data";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useTheme } from "next-themes";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollDirection, isAtTop } = useScrollDirection();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Skip to content — Accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          // Hide on scroll down, show on scroll up
          scrollDirection === "down" && !isAtTop && !mobileOpen
            ? "-translate-y-full"
            : "translate-y-0",
          // Transparent at top, glass when scrolled
          isAtTop ? "py-5" : "py-3"
        )}
        role="banner"
      >
        <nav
          className={cn(
            "container-main mx-auto flex items-center justify-between rounded-2xl px-4 transition-all duration-500 sm:px-6",
            isAtTop
              ? "bg-transparent"
              : "glass mx-4 sm:mx-6 lg:mx-auto lg:max-w-6xl"
          )}
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, "#home")}
            className="group relative z-10 py-3 text-lg font-bold tracking-tight transition-colors duration-300 sm:text-xl font-mono"
            aria-label="Go to home"
          >
            <span className="text-cyan-brand">&lt;</span>
            <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent dark:text-white dark:bg-none transition-all duration-300 group-hover:from-cyan-brand group-hover:to-cyan-brand dark:group-hover:text-cyan-brand">MHD.REHAN</span>
            <span className="text-cyan-brand">&nbsp;/&gt;</span>
          </a>

          {/* Desktop Links */}
          <div className="hidden items-center gap-1 md:flex" role="menubar">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-primary/5 hover:text-foreground"
                role="menuitem"
              >
                {link.label}
              </a>
            ))}
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile: Theme + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-primary/10"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              id="mobile-menu-toggle"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <div
          className={cn(
            "fixed inset-0 z-40 transition-all duration-500 md:hidden",
            mobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          )}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Content */}
          <div
            className={cn(
              "absolute inset-x-4 top-20 rounded-2xl p-6 transition-all duration-500 glass",
              mobileOpen
                ? "translate-y-0 opacity-100"
                : "-translate-y-4 opacity-0"
            )}
            role="menu"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-foreground transition-all duration-300 hover:bg-primary/5 hover:pl-6"
                  role="menuitem"
                  style={{
                    transitionDelay: mobileOpen ? `${i * 50}ms` : "0ms",
                    opacity: mobileOpen ? 1 : 0,
                    transform: mobileOpen
                      ? "translateX(0)"
                      : "translateX(-10px)",
                  }}
                >
                  {link.label}
                </a>
              ))}

              {/* Mobile Theme Selector */}
              {mounted && (
                <div
                  className="mt-4 border-t border-border/30 pt-4"
                  style={{
                    transitionDelay: mobileOpen ? `${navLinks.length * 50}ms` : "0ms",
                    opacity: mobileOpen ? 1 : 0,
                    transform: mobileOpen ? "translateY(0)" : "translateY(10px)",
                    transition: "all 0.3s ease-out",
                  }}
                >
                  <p className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Theme Mode
                  </p>
                  <div className="grid grid-cols-3 gap-1 rounded-xl border border-border/30 bg-background/50 p-1">
                    <button
                      onClick={() => {
                        setTheme("light");
                        setTimeout(() => setMobileOpen(false), 150);
                      }}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200",
                        theme === "light"
                          ? "bg-card text-amber-500 shadow-md shadow-amber-500/5"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </button>
                    <button
                      onClick={() => {
                        setTheme("dark");
                        setTimeout(() => setMobileOpen(false), 150);
                      }}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200",
                        theme === "dark"
                          ? "bg-card text-electric shadow-md shadow-electric/5"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </button>
                    <button
                      onClick={() => {
                        setTheme("system");
                        setTimeout(() => setMobileOpen(false), 150);
                      }}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200",
                        theme === "system"
                          ? "bg-card text-foreground shadow-md shadow-foreground/5"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Monitor className="h-4 w-4" />
                      System
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
