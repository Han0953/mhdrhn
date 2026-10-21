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

export const projectSectionIntros = {
  latest: "Pilihan karya untuk mengenal pendekatan saya dalam mengerjakan sebuah proyek, baik secara mandiri maupun bersama tim.",
  electronics: "Rangkaian dan perangkat memberi ruang untuk mencoba cara kerja teknologi secara langsung. Di sini saya membagikan sebagian eksplorasi tersebut.",
} as const;

// Concise Home copy from the published records; full context stays on each project page.
export const projectPreviewSummaries: Readonly<Partial<Record<string, string>>> = {
  vircuit: "Laboratorium virtual untuk belajar elektronika, mikrokontroler, dan IoT.",
  "aura-pod": "Fotobioreaktor mikroalga yang memadukan elektronika dan IoT untuk inovasi rendah karbon.",
  "website-pvte-himpteka": "Portal akademik dan organisasi untuk PVTE serta HIMPTEKA UMRI.",
  "iot-egg-incubator-research": "Penelitian inkubator telur ayam kate berbasis ESP32, kendali otomatis, dan MQTT.",
  "website-lazismu-kuansing": "Website informasi dan komunikasi LAZISMU Kabupaten Kuantan Singingi.",
  "iot-egg-incubator-blynk": "Inkubator telur IoT dengan integrasi Blynk dan tombol kendali lokal.",
  "air-quality-monitoring": "Pemantauan kualitas udara sebagai bagian dari eksplorasi IoT.",
  "smart-home-iot": "Perangkat IoT untuk mempelajari kendali pada lingkungan rumah.",
  "industrial-machine-safety": "Elektronika dan embedded systems dengan fokus pada keselamatan mesin.",
  "drone-stm32": "Pengembangan drone dengan STM32 sebagai platform embedded.",
};

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
