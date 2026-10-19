import { getProjectBySlug, getPublishedProjects, type Project } from "./content";
import { featuredAchievements, festivalAchievements } from "./achievement-records";

// Positioning, focus and roles already public in DATA. These are not new employment claims.
export const heroRoles = [
  { label: "Creative Engineering.", source: "DATA §1.2" },
  { label: "IoT Engineer.", source: "DATA §8.1 / §9.4" },
  { label: "Full Stack Web Developer.", source: "DATA §7.2 / §9.3" },
  { label: "Electronics & Embedded Systems.", source: "DATA §1.2 / §12.1–2" },
  { label: "Research & Prototyping.", source: "DATA §1.3 / §8" },
] as const;

// Year is the only available chronology. Stable source order breaks ties editorially.
export const latestProjects = getPublishedProjects()
  .filter((project): project is Project & { year: number } => project.year !== undefined)
  .sort((a, b) => b.year - a.year).slice(0, 5);
export const latestOrderingNote = "Dipilih berdasarkan tahun yang tercatat. Dalam tahun yang sama, urutannya bersifat editorial. Proyek tanpa tahun tersedia di arsip.";

// A complementary selection, not a second claim of recency. No overlap with latestProjects.
const electronicsSlugs = ["iot-egg-incubator-blynk", "air-quality-monitoring", "smart-home-iot", "industrial-machine-safety", "drone-stm32"] as const;
export const electronicsProjects = electronicsSlugs.map(slug => {
  const project = getProjectBySlug(slug);
  if (!project) throw new Error(`Missing public Home project: ${slug}`);
  return project;
});

export const homeAchievements = [
  ...featuredAchievements.flatMap(award => award.outcomes.map((outcome, index) => ({
    id: `${award.id}-${index}`, result: outcome, event: award.event, year: award.year,
    context: `${getProjectBySlug(award.projectSlug)?.title} · Tim ${award.team}`,
    href: "/achievements#featured-achievements", source: award.provenance,
  }))),
  ...festivalAchievements.flatMap(award => award.outcomes.map((outcome, index) => ({
    id: `${award.id}-${index}`, result: outcome, event: award.event, year: award.year,
    context: award.organizer, href: "/achievements#festival-achievements", source: award.provenance,
  }))),
];

// Explicitly requested category previews. These are not credential records.
export const certificateCategories = ["AI", "Organisasi", "AWS"] as const;
