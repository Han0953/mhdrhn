"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { ProfileCard } from "@/components/ui/ProfileCard";
import {
  bioShort,
  bioExtended,
  interests,
  hobbies,
  quickStats,
} from "@/lib/data";
import {
  GraduationCap,
  FolderKanban,
  FlaskConical,
  HeartHandshake,
  Users,
  Timer,
  Sparkles,
  Heart,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  FolderKanban,
  FlaskConical,
  HeartHandshake,
  Users,
  Timer,
};

export function AboutSection() {
  return (
    <section id="about" className="relative py-12 sm:py-16 lg:py-24" aria-label="About Me">
      {/* Premium Container */}
      <SectionContainer particleVariant="about" className="p-6 sm:p-10 lg:p-14">
        
        {/* Seq Reveal 1: Heading */}
        <div className="seq-reveal mb-10 lg:mb-16">
          <SectionHeading
            number="01"
            title="About Me"
            subtitle="Electronic Engineering Student & IoT Engineer"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          {/* Left: Bio + Interests + Hobbies — 2 cols */}
          <div className="lg:col-span-2">
            
            {/* Seq Reveal 2: Content */}
            <div className="seq-reveal">
              <p className="text-base leading-relaxed text-foreground sm:text-lg lg:text-xl font-medium">
                {bioShort}
              </p>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {bioExtended}
              </p>
            </div>

            {/* Seq Reveal 3: Interests */}
            <div className="seq-reveal mt-10">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-widest text-electric uppercase">
                <Sparkles className="h-4 w-4" />
                Interests
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full border border-electric/20 bg-electric/5 px-4 py-1.5 text-xs font-medium text-electric sm:text-sm hover:bg-electric/10 transition-colors"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Seq Reveal 4: Hobbies */}
            <div className="seq-reveal mt-8">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-widest text-emerald-brand uppercase">
                <Heart className="h-4 w-4" />
                Hobbies
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {hobbies.map((hobby) => (
                  <span
                    key={hobby}
                    className="rounded-full border border-emerald-brand/20 bg-emerald-brand/5 px-4 py-1.5 text-xs font-medium text-emerald-brand sm:text-sm hover:bg-emerald-brand/10 transition-colors"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Profile Card — 1 col */}
          <div className="lg:col-span-1 seq-reveal">
            <ProfileCard />
          </div>
        </div>

        {/* Quick Stats — below bio, inside container */}
        <div className="seq-reveal mt-12 pt-10 border-t border-border/30">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 sm:gap-6">
            {quickStats.map((stat) => {
              const Icon = iconMap[stat.icon];
              return (
                <div
                  key={stat.label}
                  className="group rounded-2xl border border-border/30 bg-card/40 dark:bg-white/[0.02] p-4 sm:p-5 text-center transition-all duration-300 hover:border-electric/40 hover:bg-electric/[0.08] hover:shadow-lg hover:shadow-electric/10 backdrop-blur-sm"
                >
                  {Icon && (
                    <Icon className="mx-auto mb-2.5 h-5 w-5 text-electric transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6 group-hover:text-cyan-brand" />
                  )}
                  <div className="text-xl font-bold text-foreground sm:text-2xl tracking-tight">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
