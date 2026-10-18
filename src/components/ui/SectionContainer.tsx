"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionParticles } from "@/components/effects/SectionParticles";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  particleVariant?: "about" | "experience" | "projects";
}

export function SectionContainer({
  children,
  className,
  particleVariant = "about",
}: SectionContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;
    
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Container Expansion (Scroll-Linked Scrub)
      gsap.fromTo(
        containerRef.current,
        {
          scale: 0.88,
          borderRadius: "40px",
          opacity: 0.5,
        },
        {
          scale: 1,
          borderRadius: "24px",
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 95%",
            end: "top 40%",
            scrub: 0.5, // Smooth scrubbing
          },
        }
      );

      // Sequential Content Reveal
      // We look for elements with specific classes or just direct children to stagger
      const revealElements = contentRef.current?.querySelectorAll(".seq-reveal");
      if (revealElements && revealElements.length > 0) {
        gsap.fromTo(
          revealElements,
          {
            y: 30,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 60%", // Start revealing when container is somewhat expanded
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full flex justify-center overflow-visible py-10">
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden border mx-auto",
          // Width classes for dominant size
          "w-[96vw] sm:w-[94vw] lg:w-[94vw] xl:w-[92vw] max-w-[1600px]",
          // Light mode
          "bg-white/80 border-border/40 shadow-xl shadow-electric/[0.04]",
          // Dark mode
          "dark:bg-[#080d19]/80 dark:border-white/[0.06] dark:shadow-electric/[0.05]",
          // Hover glow
          "transition-shadow duration-500 hover:shadow-2xl hover:shadow-electric/[0.08] dark:hover:shadow-electric/[0.12]",
          className
        )}
      >
        {/* Particle Layer */}
        <SectionParticles variant={particleVariant} />

        {/* Content Layer */}
        <div ref={contentRef} className="relative z-10 w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
