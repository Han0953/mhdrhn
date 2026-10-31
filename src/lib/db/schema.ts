import type { Category, ProjectStatus } from "@/lib/project-taxonomy";

export type ProjectCategory = Exclude<Category, "Semua">;

export interface DbProject {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  categories: ProjectCategory[];
  year?: number;
  context: string;
  role?: string;
  technologies: string[];
  approach: string;
  limitation: string;
  featured?: number;
  visual: "circuit" | "aura" | "portal" | "research";
  link?: string;
  source: string;
  status?: ProjectStatus;
  format?: "summary";
  coverImage?: string;
  homeCollection?: "latest" | "electronics" | "none";
  orderIndex: number;
  visible: boolean;
  updatedAt?: number;
}

export interface DbExperience {
  id: string;
  period?: string;
  role: string;
  organization: string;
  source: string;
  context: string;
  group: "laboratorium" | "organisasi" | "kepanitiaan" | "mobile-testing";
  orderIndex: number;
  visible: boolean;
  updatedAt?: number;
}

export interface DbSkillItem {
  name: string;
  learning?: boolean;
}

export interface DbSkillGroup {
  id: string;
  title: string;
  description: string;
  skills: DbSkillItem[];
  projectSlug?: string;
  projectLabel?: string;
  orderIndex: number;
  visible: boolean;
  updatedAt?: number;
}

export interface DbCertificate {
  id: string;
  title: string;
  organizer?: string;
  year?: number;
  verificationUrl?: string;
  documentUrl?: string;
  description?: string;
  category?: string;
  visibleOnHome: boolean;
  orderIndex: number;
  updatedAt?: number;
}

export interface DbHomeSettings {
  heroRoles: { label: string; source: string }[];
  latestIntro: string;
  electronicsIntro: string;
  sectionOrder: string[];
  latestProjectSlugs: string[];
  electronicsProjectSlugs: string[];
  updatedAt?: number;
}

export const DEFAULT_SECTION_ORDER = [
  'hero',
  'intro',
  'technologies',
  'latest-projects',
  'electronics-projects',
  'experience',
  'achievements',
  'certificates',
  'closing',
];
