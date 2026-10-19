/** Public editorial subset of DATA.md v0.2.1. Unknown fields stay in the source document.
 * A published summary does not certify deployment functionality. */
import { archiveProjects } from "./project-archive";
import { experienceGroups } from "./portfolio";
import { featuredAchievements } from "./achievement-records";

export const categories = ["Semua", "Web", "IoT", "Electronics", "Embedded", "Research", "AI"] as const;
export type Category = (typeof categories)[number];
export const projectStatuses = ["Semua", "Online", "Dalam pengembangan", "Belum dipublikasikan"] as const;
export type ProjectStatus = Exclude<(typeof projectStatuses)[number], "Semua" | "Belum dipublikasikan">;
export interface Project {
  slug: string; title: string; subtitle: string; summary: string;
  categories: Exclude<Category, "Semua">[]; year?: number; context: string; role?: string;
  technologies: string[]; approach: string; limitation: string; featured?: number;
  visual: "circuit" | "aura" | "portal" | "research"; link?: string;
  source: string; status?: ProjectStatus; format?: "summary";
}
const projects: readonly Project[] = [
  {
    slug: "vircuit", title: "Vircuit", subtitle: "Virtual electronics laboratory", source: "DATA §9.2",
    summary: "Laboratorium virtual berbasis web untuk mengeksplorasi elektronika, mikrokontroler, dan IoT. Belajar dengan mencoba, merangkai, dan memahami kesalahan.",
    categories: ["Web"], year: 2026, context: "Trio Hengker Enjoyer", role: "Anggota tim pengembangan",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui", "Radix UI", "GSAP", "Lenis", "Three.js", "React Three Fiber", "React Flow / XYFlow", "Monaco Editor", "Zustand", "Web Worker", "Supabase", "Google Gemini / Cirra", "React Hook Form", "Zod", "Vitest", "Playwright", "PGlite", "pnpm"],
    approach: "Menurut deskripsi pemilik, Vircuit mempertemukan drag-and-drop komponen dan wiring antarpin, simulasi mikrokontroler edukatif Arduino Uno/ESP32, editor Arduino C/C++, serial monitor, dan debugging. Pendekatannya adalah Learning by Doing & Learning from Mistakes. Asisten Cirra menggunakan Google Gemini; logika simulasi custom berjalan melalui Web Worker.",
    limitation: "Karya ini dikembangkan bersama tim. Rincian modul kontribusi pribadi belum dipublikasikan. Cakupan simulasi dan kompatibilitas firmware tidak dinyatakan setara dengan perangkat fisik.",
    featured: 1, visual: "circuit", link: "https://vircuit.vercel.app/",
  },
  {
    slug: "aura-pod", title: "AURA POD", subtitle: "Electronics for a lower-carbon future", source: "DATA §9.1",
    summary: "Inovasi tim ALGA NOVA yang menghubungkan fotobioreaktor mikroalga, elektronika, dan IoT untuk mendukung transisi industri rendah karbon.",
    categories: ["IoT", "Web"], year: 2026, context: "ALGA NOVA", role: "Anggota tim · bidang elektronika dan IoT",
    technologies: ["React", "TypeScript", "JavaScript", "Vite", "Tailwind CSS", "React Router", "GSAP", "Recharts", "Lucide React", "Blynk Cloud HTTP API", "Google Gemini / Aira", "Vercel Serverless", "npm"],
    approach: "Komponen digital AURA POD berupa dashboard monitoring dan kontrol dengan integrasi Blynk Cloud HTTP API serta visualisasi sensor. Asisten Aira memakai Google Gemini melalui endpoint serverless. Dashboard menjadi bagian dari inovasi fotobioreaktor yang dikembangkan bersama tim; ini bukan klaim penerapan industri secara penuh.",
    limitation: "Penghargaan diberikan kepada inovasi tim secara keseluruhan. Keterhubungan perangkat pada deployment dan kontribusi kode individual belum diverifikasi dalam portfolio ini.",
    featured: 2, visual: "aura", link: "https://aura-pod-dashboard.vercel.app/",
  },
  {
    slug: "website-pvte-himpteka", title: "PVTE + HIMPTEKA", subtitle: "Satu sistem, dua ruang informasi", source: "DATA §9.3", status: "Online",
    summary: "Website Program Studi Pendidikan Vokasional Teknik Elektronika dan HIMPTEKA UMRI. Informasi akademik dan organisasi dalam satu sistem web.",
    categories: ["Web"], year: 2026, context: "PVTE · Universitas Muhammadiyah Riau", role: "Full Stack Web Developer",
    technologies: ["React", "JavaScript / JSX", "Vite", "Tailwind CSS", "React Router", "GSAP", "Framer Motion", "Lenis", "Laravel", "PHP", "MySQL", "REST API", "Laravel Sanctum", "Blade", "TF-IDF / cosine similarity", "Google Gemini / Vira", "PHPUnit", "Laravel Pint"],
    approach: "Frontend interaktif dipadukan dengan backend Laravel dan panel pengelolaan konten berbasis Blade. PVTE dan HIMPTEKA adalah dua bagian dari satu website. Menurut data pemilik, asisten Vira menggunakan pencarian lokal TF-IDF/cosine similarity dan Google Gemini; urutan integrasi teknisnya belum diaudit di portfolio ini.",
    limitation: "Website telah online menurut pemilik; pengembangan lanjutan dapat tetap berjalan. Ketersediaan semua fitur pada deployment tidak diaudit melalui portfolio ini.",
    featured: 3, visual: "portal", link: "https://pvte.fkip.umri.ac.id/",
  },
  {
    slug: "iot-egg-incubator-research", title: "Inkubator penelitian MQTT", subtitle: "ESP32 · kendali suhu dan kelembaban", source: "DATA §8.1 / §9.4",
    summary: "Penelitian dosen mengenai sistem penetasan telur ayam kate berbasis ESP32, dengan kendali otomatis dan komunikasi MQTT tanpa tombol fisik.",
    categories: ["IoT", "Research"], year: 2026, context: "Penelitian dosen", role: "IoT Engineer",
    technologies: ["ESP32", "MQTT", "DHT22", "LCD I2C"],
    approach: "Rancangan mengatur pemanas melalui histeresis dan pembalikan telur secara terjadwal. MQTT digunakan dalam rancangan komunikasi dan monitoring sistem.",
    limitation: "Hasil akhir pengujian MQTT, data eksperimen, dan tingkat keberhasilan penetasan belum tersedia. Proyek ini berbeda dari inkubator Blynk dengan tombol fisik.", visual: "research",
  },
  {
    slug: "iot-egg-incubator-blynk", title: "Inkubator Blynk", subtitle: "Interaksi jarak jauh dan kontrol lokal", source: "DATA §9.5",
    summary: "Inkubator telur IoT dengan integrasi Blynk dan tombol fisik untuk interaksi lokal.",
    categories: ["IoT"], context: "Pengembangan sistem IoT", technologies: ["Blynk", "Tombol fisik"],
    approach: "Rancangan menggabungkan interaksi melalui Blynk dengan tombol kontrol pada perangkat. Kedua cara interaksi menjadi pembeda dari inkubator penelitian berbasis MQTT.",
    limitation: "Status penyelesaian, jenis board dan sensor, serta rincian kontribusi belum dipublikasikan. Spesifikasi inkubator MQTT tidak diwariskan ke proyek ini.", visual: "research",
  },
  {
    slug: "website-lazismu-kuansing", title: "LAZISMU Kuansing", subtitle: "Website & pendampingan digital", source: "DATA §7.2 / §9.6",
    summary: "Pembuatan dan pelatihan pengoperasian website LAZISMU Kabupaten Kuantan Singingi sebagai media informasi dan komunikasi.",
    categories: ["Web"], year: 2024, context: "Pengabdian kepada masyarakat", role: "Full Stack Web Developer",
    technologies: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
    approach: "Pengembangan website disertai pelatihan pengoperasian untuk mendukung pengelolaan informasi oleh organisasi.",
    limitation: "Ringkasan mengikuti catatan proyek. Metrik penggunaan dan dampak layanan tidak tersedia untuk dipublikasikan.", visual: "portal", link: "https://lazismukuansing.org/",
  },
  ...archiveProjects,
];
export const profile = {
  name: "Muhammad Rehan", brand: "mhdrhn.", location: "Pekanbaru, Indonesia", github: "https://github.com/Han0953",
  bio: "Mahasiswa Pendidikan Vokasional Teknik Elektronika di Universitas Muhammadiyah Riau. Mengeksplorasi Internet of Things, embedded systems, pengembangan perangkat lunak, dan penelitian teknologi.",
};
export const experiences = experienceGroups;
// Compatibility for curated Home and project relations; the full archive also has education records.
export const achievements = featuredAchievements;

/** Editorial introductions derived from DATA sections 1, 5, 6, 8 and 12. */
export const focusAreas = [
  { title: "Electronics & Embedded Systems", description: "Menghubungkan sensor, mikrokontroler, dan komponen elektronik agar benda dapat berinteraksi dengan lingkungannya." },
  { title: "Internet of Things", description: "Mengeksplorasi komunikasi perangkat, monitoring, dan kendali melalui sistem yang terhubung." },
  { title: "Web & Software Development", description: "Mengembangkan antarmuka dan sistem informasi yang membantu orang menemukan, memahami, dan memakai informasi." },
  { title: "Research & Prototyping", description: "Membawa pertanyaan teknis ke eksperimen dan prototipe, lalu mencatat apa yang masih perlu dibuktikan." },
  { title: "Mobile Application Testing / QA", description: "Pengalaman menguji aplikasi dan game mobile, dengan perhatian pada perilaku serta masalah yang muncul saat digunakan." },
] as const;

export interface EngineeringStep {
  id: "sense" | "compute" | "build";
  title: string;
  short: string;
  description: string;
}

/** A creative analogy requested by the owner, not a formal research methodology. */
export const engineeringSteps: readonly EngineeringStep[] = [
  { id: "sense", title: "Sense", short: "Mulai dari pengamatan.", description: "Mengenali kebutuhan, memperhatikan konteks, dan merumuskan pertanyaan yang ingin dijawab." },
  { id: "compute", title: "Compute", short: "Susun logikanya.", description: "Menghubungkan informasi dengan konsep elektronika dan perangkat lunak untuk mengeksplorasi cara kerja yang mungkin." },
  { id: "build", title: "Build", short: "Beri bentuk pada gagasan.", description: "Membawa gagasan ke rangkaian, antarmuka, atau prototipe; mengujinya dan melihat apa yang perlu diperbaiki." },
];

export const experienceHighlights = ["lab-electronics-2026", "himpteka-vice-2025", "velotow-2026"].map(id => experiences.flatMap(group => group.items).find(item => item.id === id)).filter(item => item !== undefined);
export function getPublishedProjects(): readonly Project[] { return projects; }
export function getProjectBySlug(slug: string): Project | undefined { return projects.find(project => project.slug === slug); }
export function getFeaturedProjects(): Project[] { return projects.filter(project => project.featured !== undefined).sort((a, b) => a.featured! - b.featured!); }
export function filterProjects(category: string, query: string, status = "Semua"): readonly Project[] {
  const search = query.trim().toLocaleLowerCase("id");
  return projects.filter(project => (category === "Semua" || project.categories.includes(category as Exclude<Category, "Semua">)) && (status === "Semua" || (project.status ?? "Belum dipublikasikan") === status) && `${project.title} ${project.summary} ${project.technologies.join(" ")}`.toLocaleLowerCase("id").includes(search));
}
export function getRelatedProjects(project: Project) { return projects.filter(item => item.slug !== project.slug && item.categories.some(category => project.categories.includes(category))).slice(0, 2); }
