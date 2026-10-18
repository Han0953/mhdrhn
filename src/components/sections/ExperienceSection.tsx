"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { experiences } from "@/lib/data";
import {
  Users,
  Calendar as CalendarIcon,
  Briefcase,
  Bug,
  FlaskConical,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryConfig = {
  organization: {
    label: "Organization",
    icon: Users,
    color: "text-electric",
    bgColor: "bg-electric/10",
    borderColor: "border-electric/20",
  },
  committee: {
    label: "Committee",
    icon: Award,
    color: "text-cyan-brand",
    bgColor: "bg-cyan-brand/10",
    borderColor: "border-cyan-brand/20",
  },
  professional: {
    label: "Professional",
    icon: Briefcase,
    color: "text-emerald-brand",
    bgColor: "bg-emerald-brand/10",
    borderColor: "border-emerald-brand/20",
  },
  testing: {
    label: "Software Testing",
    icon: Bug,
    color: "text-research",
    bgColor: "bg-research/10",
    borderColor: "border-research/20",
  },
  lab: {
    label: "Laboratory",
    icon: FlaskConical,
    color: "text-emerald-brand",
    bgColor: "bg-emerald-brand/10",
    borderColor: "border-emerald-brand/20",
  },
} as const;

type CategoryKey = keyof typeof categoryConfig;

const filterOptions: { key: CategoryKey | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "organization", label: "Organization" },
  { key: "committee", label: "Committee" },
  { key: "professional", label: "Professional" },
  { key: "testing", label: "Testing" },
  { key: "lab", label: "Lab" },
];

export function ExperienceSection() {
  const [activeFilter, setActiveFilter] = useState<CategoryKey | "all">("all");

  const filtered =
    activeFilter === "all"
      ? experiences
      : experiences.filter((exp) => exp.category === activeFilter);

  return (
    <section
      id="experience"
      className="relative py-12 sm:py-16 lg:py-24"
      aria-label="Experience"
    >
      {/* Premium Container */}
      <SectionContainer particleVariant="experience" className="p-6 sm:p-10 lg:p-14">
        
        {/* Seq Reveal 1: Heading */}
        <div className="seq-reveal mb-10 lg:mb-16">
          <SectionHeading
            number="03"
            title="Experience"
            subtitle="Organizational, professional, and technical experience"
            gradient="accent"
          />
        </div>

        {/* Seq Reveal 2: Filters */}
        <div className="seq-reveal mb-10 flex flex-wrap justify-center gap-2.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setActiveFilter(opt.key)}
              className={cn(
                "rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-300 sm:text-sm tracking-wide",
                activeFilter === opt.key
                  ? "bg-electric text-white shadow-lg shadow-electric/30 scale-105"
                  : "border border-border/50 bg-card/40 text-muted-foreground hover:border-electric/40 hover:text-foreground hover:bg-card/80 backdrop-blur-sm"
              )}
              aria-pressed={activeFilter === opt.key}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Seq Reveal 3: Grid */}
        <div className="seq-reveal mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exp, index) => {
            const config = categoryConfig[exp.category];
            const Icon = config.icon;
            return (
              <div
                key={`${exp.organization}-${exp.role}-${index}`}
                className="group card-hover h-full rounded-2xl border border-border/30 bg-card/40 dark:bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-500 hover:border-electric/30 hover:bg-card/60 hover:shadow-xl hover:shadow-electric/5"
              >
                {/* Category badge */}
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                      config.bgColor,
                      config.color
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {exp.period}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-foreground group-hover:text-electric transition-colors duration-300">
                  {exp.organization}
                </h3>
                <p className={cn("mt-1.5 text-sm font-semibold", config.color)}>
                  {exp.role}
                </p>

                {exp.event && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {exp.event}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </SectionContainer>
    </section>
  );
}
