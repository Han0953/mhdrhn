"use client";

import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ResearchSection } from "@/components/sections/ResearchSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { CursorEffect } from "@/components/effects/CursorEffect";
import { BackToTop } from "@/components/ui/BackToTop";

export default function Home() {
  return (
    <>
      <CursorEffect />
      <BackToTop />
      <Navbar />
      <main id="main-content" role="main">
        <HeroSection />
        <AboutSection />
        <EducationSection />
        <ExperienceSection />
        <ResearchSection />
        <SkillsSection />
        <ProjectsSection />
        <AchievementsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
