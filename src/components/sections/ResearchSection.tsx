"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionReveal } from "@/components/effects/SectionReveal";
import { researches, communityServices } from "@/lib/data";
import {
  FlaskConical,
  HeartHandshake,
  Calendar,
  User,
  ExternalLink,
} from "lucide-react";

export function ResearchSection() {
  return (
    <section
      id="research"
      className="section-padding relative"
      aria-label="Research & Community Service"
    >
      <div className="container-main">
        <SectionReveal>
          <SectionHeading
            number="04"
            title="Research & Innovation"
            subtitle="Contributing to knowledge and community through technology"
            gradient="research"
          />
        </SectionReveal>

        {/* Research */}
        <div className="mx-auto max-w-4xl">
          <SectionReveal>
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-foreground">
              <FlaskConical className="h-5 w-5 text-research" />
              Research Projects
            </h3>
          </SectionReveal>

          <div className="mb-12 space-y-4">
            {researches.map((research, index) => (
              <SectionReveal key={research.title} delay={index * 0.1}>
                <div className="card-hover rounded-2xl border border-research/20 bg-card p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                        {research.title}
                      </h4>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {research.roles.map((role) => (
                          <span
                            key={role}
                            className="flex items-center gap-1 rounded-full bg-research/10 px-3 py-1 text-xs font-medium text-research"
                          >
                            <User className="h-3 w-3" />
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {research.year}
                    </span>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>

          {/* Community Service */}
          <SectionReveal>
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-foreground">
              <HeartHandshake className="h-5 w-5 text-emerald-brand" />
              Community Service (PKM)
            </h3>
          </SectionReveal>

          <div className="space-y-4">
            {communityServices.map((service, index) => (
              <SectionReveal key={service.title} delay={index * 0.1}>
                <div className="card-hover rounded-2xl border border-emerald-brand/20 bg-card p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                        {service.title}
                      </h4>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 rounded-full bg-emerald-brand/10 px-3 py-1 text-xs font-medium text-emerald-brand">
                          <User className="h-3 w-3" />
                          {service.role}
                        </span>
                        {service.website && (
                          <a
                            href={service.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-full bg-electric/10 px-3 py-1 text-xs font-medium text-electric transition-colors hover:bg-electric/20"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {service.year}
                    </span>
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
