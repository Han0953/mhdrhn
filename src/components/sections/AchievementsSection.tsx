"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionReveal } from "@/components/effects/SectionReveal";
import { achievements, certificates } from "@/lib/data";
import { Trophy, Calendar, Building, Award, Clock } from "lucide-react";

export function AchievementsSection() {
  return (
    <section
      id="achievements"
      className="section-padding relative"
      aria-label="Achievements & Certificates"
    >
      <div className="container-main">
        <SectionReveal>
          <SectionHeading
            title="Achievements"
            subtitle="Recognitions and accomplishments"
            gradient="accent"
          />
        </SectionReveal>

        {/* Achievements */}
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 grid gap-4 sm:grid-cols-2">
            {achievements.map((achievement, index) => (
              <SectionReveal key={achievement.title} delay={index * 0.1}>
                <div className="card-hover rounded-2xl border border-amber-500/20 bg-card p-5 sm:p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                      <Trophy className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {achievement.title}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      {achievement.event}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-3.5 w-3.5" />
                      <span className="line-clamp-2 text-xs">
                        {achievement.organizer}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {achievement.year}
                    </div>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>

          {/* Certificates placeholder */}
          <SectionReveal>
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">
                Certificates
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {certificates.status}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {certificates.futureContent.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
