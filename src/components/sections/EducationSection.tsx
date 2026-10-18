"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionReveal } from "@/components/effects/SectionReveal";
import { education } from "@/lib/data";
import { GraduationCap, Award, Calendar, TrendingUp } from "lucide-react";

export function EducationSection() {
  return (
    <section
      id="education"
      className="section-padding relative"
      aria-label="Education"
    >
      <div className="container-main">
        <SectionReveal>
          <SectionHeading
            number="02"
            title="Education"
            subtitle="Academic background and achievements"
          />
        </SectionReveal>

        <div className="mx-auto max-w-3xl">
          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-white via-purple-500 to-cyan-brand sm:block"
              aria-hidden="true"
            />

            {education.map((edu, index) => (
              <SectionReveal
                key={edu.institution}
                delay={index * 0.15}
                className="mb-14 last:mb-0"
              >
                <div className="relative sm:pl-16">
                  {/* Timeline dot */}
                  <div
                    className="absolute left-4 top-6 hidden h-5 w-5 items-center justify-center rounded-full border-2 border-electric bg-background sm:flex"
                    aria-hidden="true"
                  >
                    <div className="h-2 w-2 rounded-full bg-electric" />
                  </div>

                  <div className="card-hover rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-electric/10">
                          <GraduationCap className="h-5 w-5 text-electric" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {edu.institution}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {edu.program}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:shrink-0">
                        <span className="flex items-center gap-1 rounded-full bg-electric/10 px-3 py-1 text-xs font-medium text-electric">
                          <Calendar className="h-3 w-3" />
                          {edu.period}
                        </span>
                        {edu.gpa && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-brand/10 px-3 py-1 text-xs font-medium text-emerald-brand">
                            <TrendingUp className="h-3 w-3" />
                            IPK {edu.gpa}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          edu.status === "Sedang Berjalan"
                            ? "bg-emerald-brand/10 text-emerald-brand"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            edu.status === "Sedang Berjalan"
                              ? "bg-emerald-brand animate-pulse"
                              : "bg-muted-foreground"
                          }`}
                        />
                        {edu.status}
                      </span>
                    </div>

                    {/* Achievements */}
                    {edu.achievements && edu.achievements.length > 0 && (
                      <div className="mt-4 border-t border-border/50 pt-4">
                        <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-amber-500 uppercase dark:text-amber-400">
                          <Award className="h-3.5 w-3.5" />
                          Achievements
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {edu.achievements.map((achievement) => (
                            <span
                              key={achievement}
                              className="rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs text-amber-700 dark:text-amber-400"
                            >
                              {achievement}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
