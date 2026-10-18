"use client";

import { footerData, personalInfo, navLinks } from "@/lib/data";
import { Heart, ArrowUp } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer
      className="relative border-t border-border/50 bg-card/50 px-4 py-12 sm:px-6 md:py-16"
      role="contentinfo"
    >
      <div className="container-main">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <a href="#home" className="text-2xl font-bold">
              <span className="text-gradient">MR</span>
              <span className="text-foreground">.</span>
            </a>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {footerData.credit}
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href={personalInfo.github.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border transition-all duration-300 hover:border-electric/30 hover:bg-electric/5"
                aria-label="GitHub Profile"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-widest text-foreground uppercase">
              Quick Links
            </h3>
            <nav className="grid grid-cols-2 gap-2" aria-label="Footer navigation">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-electric"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-widest text-foreground uppercase">
              Built With
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {footerData.builtWith}
            </p>
          </div>
        </div>

        {/* Divider + Bottom row */}
        <div className="mt-10 border-t border-border/50 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Made with{" "}
              <Heart className="h-3 w-3 text-red-500 fill-red-500" /> by{" "}
              {personalInfo.nickname}
            </p>
          </div>
        </div>

      </div>

      {/* Full width Stylized Brand Name via SVG */}
      <div className="mt-12 w-full border-t border-border/40 pt-12 pb-4 opacity-15 hover:opacity-75 transition-opacity duration-700 overflow-hidden">
        <svg viewBox="0 0 1200 130" className="w-full select-none" aria-hidden="true">
          <text
            x="50%"
            y="70"
            dominantBaseline="middle"
            textAnchor="middle"
            className="font-mono font-black text-[155px] tracking-[0.05em] fill-none stroke-foreground stroke-2"
          >
            MHD.REHAN
          </text>
        </svg>
      </div>
    </footer>
  );
}
