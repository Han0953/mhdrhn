"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { featuredProjects, allProjects } from "@/lib/data";
import {
  Wifi,
  Globe,
  Cpu,
  Brain,
  CircuitBoard,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, React.ElementType> = {
  iot: Wifi,
  web: Globe,
  embedded: Cpu,
  ai: Brain,
  electronics: CircuitBoard,
};

const categoryColors: Record<string, string> = {
  iot: "text-electric bg-electric/10 border-electric/20",
  web: "text-emerald-brand bg-emerald-brand/10 border-emerald-brand/20",
  embedded: "text-cyan-brand bg-cyan-brand/10 border-cyan-brand/20",
  ai: "text-research bg-research/10 border-research/20",
  electronics: "text-amber-500 bg-amber-500/10 border-amber-500/20",
};

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="relative py-12 sm:py-16 lg:py-24"
      aria-label="Projects"
    >
      {/* Premium Container */}
      <SectionContainer particleVariant="projects" className="p-6 sm:p-10 lg:p-14">
        
        {/* Seq Reveal 1: Heading */}
        <div className="seq-reveal mb-10 lg:mb-16">
          <SectionHeading
            number="06"
            title="Projects"
            subtitle="Featured projects and complete portfolio"
          />
        </div>

        {/* Featured Projects — flat grid like the original */}
        <div className="seq-reveal">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-foreground">
            <Layers className="h-5 w-5 text-electric" />
            Featured Projects
          </h3>

          <div className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProjects.map((project, index) => {
              const Icon = categoryIcons[project.category] || Cpu;
              const colorClass =
                categoryColors[project.category] || categoryColors.iot;

              return (
                <div
                  key={`${project.name}-${index}`}
                  className="group card-hover rounded-2xl border border-border/30 bg-card/40 dark:bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-500 hover:border-electric/40 hover:bg-card/60 hover:shadow-xl hover:shadow-electric/10"
                >
                  {/* Top row: category + status */}
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                        colorClass
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {project.category}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
                        project.status === "Completed"
                          ? "text-emerald-brand"
                          : "text-amber-500"
                      )}
                    >
                      {project.status === "Completed" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      {project.status}
                    </span>
                  </div>

                  {/* Name */}
                  <h4 className="mb-4 text-lg font-bold text-foreground group-hover:text-electric transition-colors duration-300">
                    {project.name}
                  </h4>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md bg-muted/80 dark:bg-white/[0.04] border border-border/20 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground transition-colors group-hover:bg-muted"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seq Reveal 2: Divider */}
        <div className="seq-reveal my-10 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Seq Reveal 3: All Projects List */}
        <div className="seq-reveal">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-foreground">
            <Layers className="h-5 w-5 text-cyan-brand" />
            All Projects
            <span className="ml-2 rounded-full bg-cyan-brand/10 border border-cyan-brand/20 px-3 py-0.5 text-xs font-bold text-cyan-brand">
              {allProjects.length}
            </span>
          </h3>

          <div className="rounded-2xl border border-border/30 bg-card/40 dark:bg-white/[0.01] overflow-hidden backdrop-blur-sm">
            {allProjects.map((project, index) => (
              <div
                key={`${project.name}-${index}`}
                className={cn(
                  "group flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/40 dark:hover:bg-white/[0.03]",
                  index !== allProjects.length - 1 && "border-b border-border/20"
                )}
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/80 dark:bg-white/[0.04] border border-border/20 text-xs font-bold text-muted-foreground group-hover:text-electric group-hover:border-electric/30 transition-colors">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="text-base font-semibold text-foreground group-hover:text-electric transition-colors">
                      {project.name}
                    </span>
                    <span className="ml-3 text-xs font-medium text-muted-foreground">
                      {project.tech}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-xs font-bold uppercase tracking-wider",
                    project.status === "Completed"
                      ? "text-emerald-brand"
                      : "text-amber-500"
                  )}
                >
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
