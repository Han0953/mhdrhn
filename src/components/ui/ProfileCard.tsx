"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { personalInfo } from "@/lib/data";
import {
  MapPin,
  GraduationCap,
  BookOpen,
  Activity,
} from "lucide-react";

export function ProfileCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !revealed) {
          if (prefersReduced) {
            setRevealed(true);
          } else {
            setTimeout(() => setRevealed(true), 300);
          }
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [revealed]);

  // Periodic subtle tech glitch trigger
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const interval = setInterval(() => {
      // 40% chance to trigger glitch every 3 seconds
      if (Math.random() < 0.4) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 250);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const cardContent = (isClone = false, colorShift?: "cyan" | "red") => (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-700 h-full w-full ${
        isClone 
          ? "absolute inset-0 bg-transparent pointer-events-none select-none" 
          : "bg-card/45 dark:bg-[#070b14]/50 border-border/30 backdrop-blur-xl shadow-2xl"
      }`}
      style={
        isClone
          ? {
              borderColor: colorShift === "cyan" ? "rgba(6, 182, 212, 0.4)" : "rgba(239, 68, 68, 0.4)",
              color: colorShift === "cyan" ? "#06B6D4" : "#EF4444",
            }
          : {
              opacity: revealed ? 1 : 0.4,
              transform: revealed ? "translateY(0)" : "translateY(8px)",
            }
      }
    >
      {/* Profile Photo */}
      <div className={`relative mx-auto mb-5 h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-2xl border-2 ${
        isClone ? "border-transparent" : "border-electric/30"
      }`}>
        <Image
          src="/foto-profile.webp"
          alt={`Profile photo of ${personalInfo.fullName}`}
          fill
          className="object-cover"
          sizes="128px"
          priority
        />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
      </div>

      {/* Name */}
      <h3 className="text-center text-lg font-bold text-foreground sm:text-xl">
        {personalInfo.fullName}
      </h3>

      {/* Program */}
      <p className="mt-1 text-center text-xs font-semibold text-electric sm:text-sm">
        {personalInfo.program}
      </p>

      {/* Divider */}
      <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Info Grid */}
      <div className="space-y-3">
        <InfoRow
          icon={<GraduationCap className="h-4 w-4 text-electric" />}
          label="University"
          value={personalInfo.university}
        />
        <InfoRow
          icon={<BookOpen className="h-4 w-4 text-cyan-brand" />}
          label="Semester"
          value={`Semester ${personalInfo.semester}`}
        />
        <InfoRow
          icon={<Activity className="h-4 w-4 text-emerald-brand" />}
          label="IPK"
          value={String(personalInfo.gpa)}
        />
        <InfoRow
          icon={<MapPin className="h-4 w-4 text-research" />}
          label="Location"
          value={personalInfo.location}
        />
      </div>

      {/* Status Badge */}
      <div className="mt-5 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-brand/10 border border-emerald-brand/20 px-3 py-1 text-xs font-bold text-emerald-brand">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-brand opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-brand" />
          </span>
          {personalInfo.status}
        </span>
      </div>
    </div>
  );

  return (
    <div 
      ref={cardRef} 
      className="relative overflow-visible cursor-pointer"
      onMouseEnter={() => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200);
      }}
    >
      {/* Scan reveal overlay */}
      <div
        className="absolute inset-0 z-20 rounded-2xl pointer-events-none"
        style={{
          background: revealed
            ? "transparent"
            : "linear-gradient(180deg, rgba(14,165,233,0.15) 0%, rgba(6,182,212,0.08) 100%)",
          clipPath: revealed ? "inset(100% 0 0 0)" : "inset(0 0 0 0)",
          transition: "clip-path 0.8s cubic-bezier(0.65, 0, 0.35, 1), background 0.8s ease",
        }}
      />

      {/* Scan line */}
      <div
        className="absolute left-0 right-0 z-30 h-[2px] pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, #0EA5E9, #06B6D4, transparent)",
          boxShadow: "0 0 12px rgba(14,165,233,0.6)",
          top: revealed ? "100%" : "0%",
          opacity: revealed ? 0 : 1,
          transition: "top 0.8s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.6s ease 0.6s",
        }}
      />

      {/* Main Card Frame */}
      {cardContent()}

      {/* Dynamic Glitch Layers */}
      {isGlitching && (
        <>
          <div className="absolute inset-0 z-10 pointer-events-none opacity-80 glitch-overlay-1">
            {cardContent(true, "cyan")}
          </div>
          <div className="absolute inset-0 z-10 pointer-events-none opacity-80 glitch-overlay-2">
            {cardContent(true, "red")}
          </div>
        </>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-xs font-semibold text-foreground sm:text-sm break-words">
          {value}
        </div>
      </div>
    </div>
  );
}
