"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import {
  MapPin,
  Mail,
  ChevronDown,
} from "lucide-react";
import {
  personalInfo,
  professionalHeadlines,
  heroQuote,
} from "@/lib/data";
import { InteractiveBackground } from "@/components/effects/InteractiveBackground";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  
  // Typing Effect State
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // GSAP entrance animation
  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-greeting", {
        y: 20,
        opacity: 0,
        duration: 0.5,
      })
        .from(
          ".hero-name",
          { y: 30, opacity: 0, duration: 0.6 },
          "-=0.3"
        )
        .from(
          ".hero-title",
          { y: 20, opacity: 0, duration: 0.5 },
          "-=0.3"
        )
        .from(
          ".hero-quote",
          { y: 20, opacity: 0, duration: 0.5 },
          "-=0.2"
        )
        .from(
          ".hero-location",
          { y: 20, opacity: 0, duration: 0.5 },
          "-=0.2"
        )
        .from(
          ".hero-cta",
          { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 },
          "-=0.2"
        )
        .from(
          ".hero-socials",
          { y: 10, opacity: 0, duration: 0.5 },
          "-=0.1"
        )
        .from(
          ".hero-terminal",
          { x: 40, opacity: 0, duration: 0.8 },
          "-=1"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Typing Effect Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentString = professionalHeadlines[currentTitleIndex];

    if (isDeleting) {
      // Deleting character by character
      if (displayText === "") {
        setIsDeleting(false);
        setCurrentTitleIndex((prev) => (prev + 1) % professionalHeadlines.length);
      } else {
        timer = setTimeout(() => {
          setDisplayText(currentString.substring(0, displayText.length - 1));
        }, 40); // Delete speed
      }
    } else {
      // Typing character by character
      if (displayText === currentString) {
        timer = setTimeout(() => setIsDeleting(true), 2000); // Pause before delete
      } else {
        timer = setTimeout(() => {
          setDisplayText(currentString.substring(0, displayText.length + 1));
        }, 80); // Type speed
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentTitleIndex]);

  const scrollToSection = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      id="home"
      // Adjusted padding and margin to lift the section slightly upwards
      className="relative flex min-h-[90vh] items-center overflow-hidden pb-12 pt-24 lg:pb-24 lg:pt-12"
      aria-label="Hero section"
    >
      {/* Interactive Particle Network Background */}
      <InteractiveBackground />

      {/* Subtle background decoration (Gradient Blurs Overlay) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="absolute -top-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-electric/5 blur-[100px] dark:bg-electric/10" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[400px] w-[400px] rounded-full bg-cyan-brand/5 blur-[100px] dark:bg-cyan-brand/10" />
        
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--electric) 1px, transparent 1px), linear-gradient(90deg, var(--electric) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container-main section-padding relative z-10 mx-auto w-full">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 lg:items-center">
          
          {/* LEFT COLUMN: Content */}
          <div className="flex flex-col justify-center">
            {/* Greeting */}
            <div className="hero-greeting mb-4 flex items-center gap-2">
              <span className="text-xl">👋</span>
              <span className="text-sm font-medium tracking-widest text-electric uppercase sm:text-base">
                Hello, I&apos;m
              </span>
            </div>

            {/* Name with Gradient */}
            <h1 className="hero-name mb-2 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-white dark:via-cyan-brand dark:to-purple-500 bg-clip-text text-transparent pb-1">
                {personalInfo.fullName}
              </span>
            </h1>

            {/* Typewriter Title */}
            <div className="hero-title mb-6 flex h-8 items-center sm:h-10 md:h-12">
              <span className="text-lg font-bold text-cyan-brand sm:text-2xl md:text-3xl mr-3">
                &gt;
              </span>
              <span className="text-lg font-bold text-[#c084fc] sm:text-2xl md:text-3xl">
                {displayText}
                <span className="ml-1 inline-block w-2 sm:w-3 animate-pulse bg-[#c084fc] h-[1em] align-middle" />
              </span>
            </div>

            {/* Quote */}
            <p className="hero-quote mb-6 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg italic">
              &ldquo;{heroQuote}&rdquo;
            </p>

            {/* Location */}
            <div className="hero-location mb-8 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-cyan-brand" />
              {personalInfo.location}
            </div>

            {/* CTA Buttons */}
            <div className="hero-cta mb-8 flex flex-wrap gap-3">
              <button
                onClick={() => scrollToSection("#projects")}
                className="group flex items-center gap-2 rounded-xl border border-electric bg-transparent px-6 py-2.5 text-sm font-semibold text-electric transition-all duration-300 hover:bg-electric hover:text-white"
              >
                VIEW PROJECTS
                <ChevronDown className="h-4 w-4 -rotate-90 transition-transform group-hover:translate-x-1" />
              </button>
              
              <button
                onClick={() => scrollToSection("#contact")}
                className="rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-cyan-brand/50 hover:bg-cyan-brand/10"
              >
                CONTACT ME
              </button>
            </div>

            {/* Social Icons */}
            <div className="hero-socials flex gap-3">
              <a
                href={personalInfo.github.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-card transition-colors hover:border-foreground/30 hover:bg-muted"
                aria-label="GitHub Profile"
              >
                <GithubIcon className="h-4 w-4 text-foreground" />
              </a>
              <button
                onClick={() => scrollToSection("#contact")}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-card transition-colors hover:border-foreground/30 hover:bg-muted"
                aria-label="Email Contact"
              >
                <Mail className="h-4 w-4 text-foreground" />
              </button>
              <button
                onClick={() => scrollToSection("#contact")}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-card transition-colors hover:border-foreground/30 hover:bg-muted"
                aria-label="LinkedIn Profile"
              >
                <LinkedinIcon className="h-4 w-4 text-foreground" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Terminal Card */}
          <div className="hero-terminal hidden lg:block">
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-[#0d1117] shadow-2xl shadow-cyan-brand/10">
              {/* Terminal Header */}
              <div className="flex items-center justify-between border-b border-border/30 bg-[#161b22] px-4 py-3">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  rehan@dev ~ profile
                </div>
                <div className="w-12" /> {/* Spacer for centering */}
              </div>

              {/* Terminal Body */}
              <div className="p-6 font-mono text-sm leading-relaxed text-muted-foreground">
                <div className="mb-1 flex gap-2">
                  <span className="text-electric">&gt;</span>
                  <span className="text-cyan-brand">name:</span>
                  <span className="text-emerald-brand">&quot;{personalInfo.fullName}&quot;</span>
                </div>
                <div className="mb-1 flex gap-2">
                  <span className="text-electric">&gt;</span>
                  <span className="text-cyan-brand">role:</span>
                  <span className="text-emerald-brand">&quot;{professionalHeadlines[1]}&quot;</span>
                </div>
                <div className="mb-1 flex gap-2">
                  <span className="text-electric">&gt;</span>
                  <span className="text-cyan-brand">university:</span>
                  <span className="text-emerald-brand">&quot;UMRI&quot;</span>
                </div>
                <div className="mb-1 flex gap-2">
                  <span className="text-electric">&gt;</span>
                  <span className="text-cyan-brand">gpa:</span>
                  <span className="text-amber-500">{personalInfo.gpa}</span>
                </div>
                <div className="mb-1 flex gap-2">
                  <span className="text-electric">&gt;</span>
                  <span className="text-cyan-brand">predicate:</span>
                  <span className="text-emerald-brand">&quot;Cum Laude (Expected)&quot;</span>
                </div>
                <div className="mb-1 flex gap-2">
                  <span className="text-electric">&gt;</span>
                  <span className="text-cyan-brand">focus:</span>
                  <span className="text-foreground">[</span>
                </div>
                <div className="mb-1 flex gap-2 pl-6">
                  <span className="text-electric">&gt;</span>
                  <span className="text-emerald-brand">&quot;IoT&quot;</span>
                  <span className="text-foreground">, </span>
                  <span className="text-emerald-brand">&quot;Embedded Systems&quot;</span>
                  <span className="text-foreground">,</span>
                </div>
                <div className="mb-1 flex gap-2 pl-6">
                  <span className="text-electric">&gt;</span>
                  <span className="text-emerald-brand">&quot;Web Dev&quot;</span>
                  <span className="text-foreground">, </span>
                  <span className="text-emerald-brand">&quot;Software Testing&quot;</span>
                </div>
                <div className="mb-1 flex gap-2">
                  <span className="text-electric">&gt;</span>
                  <span className="text-foreground">]</span>
                </div>
                <div className="mb-1 flex gap-2">
                  <span className="text-electric">&gt;</span>
                  <span className="text-cyan-brand">available:</span>
                  <span className="text-amber-500">true</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="text-electric">&gt;</span>
                  <span className="animate-pulse text-foreground">_</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
