"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionReveal } from "@/components/effects/SectionReveal";
import { skillCategories } from "@/lib/data";
import {
  Cpu,
  Wifi,
  Code2,
  Globe,
  Smartphone,
  Bug,
  Camera,
  CircuitBoard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Cpu,
  Microchip: CircuitBoard,
  Wifi,
  Code2,
  Globe,
  Smartphone,
  Bug,
  Camera,
};

const colorMap: Record<string, { text: string; bg: string; border: string }> = {
  primary: {
    text: "text-electric",
    bg: "bg-electric/10",
    border: "border-electric/20",
  },
  secondary: {
    text: "text-cyan-brand",
    bg: "bg-cyan-brand/10",
    border: "border-cyan-brand/20",
  },
  accent: {
    text: "text-emerald-brand",
    bg: "bg-emerald-brand/10",
    border: "border-emerald-brand/20",
  },
  research: {
    text: "text-research",
    bg: "bg-research/10",
    border: "border-research/20",
  },
};

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="section-padding relative"
      aria-label="Technical Skills"
    >
      <div className="container-main">
        <SectionReveal>
          <SectionHeading
            number="05"
            title="Technical Skills"
            subtitle="Technologies and competencies across multiple domains"
          />
        </SectionReveal>

        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skillCategories.map((category, index) => {
            const Icon = iconMap[category.icon] || Cpu;
            const colors = colorMap[category.color] || colorMap.primary;
            return (
              <SectionReveal key={category.category} delay={index * 0.05}>
                <div
                  className={cn(
                    "card-hover h-full rounded-2xl border bg-card p-5",
                    colors.border
                  )}
                >
                  {/* Header */}
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        colors.bg
                      )}
                    >
                      <Icon className={cn("h-5 w-5", colors.text)} />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      {category.category}
                    </h3>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {category.skills.map((skill) => (
                      <span
                        key={skill}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-medium",
                          colors.bg,
                          colors.text
                        )}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
