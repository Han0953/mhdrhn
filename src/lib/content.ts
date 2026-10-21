/** Public editorial subset of DATA.md v0.2.1. Unknown fields stay in the source document.
 * A published summary does not certify deployment functionality. */
import { archiveProjects } from "./project-archive";
import { experienceGroups } from "./portfolio";
import { featuredAchievements } from "./achievement-records";

export const categories = ["Semua", "Web", "IoT", "Electronics", "Embedded", "Research", "AI"] as const;
export type Category = (typeof categories)[number];
export const projectStatuses = ["Semua", "Online", "Dalam pengembangan", "Belum dipublikasikan"] as const;
// Public wording is separate from stable filter/query values.
export const projectStatusLabels: Record<typeof projectStatuses[number], string> = {
  Semua: "Semua status", Online: "Online", "Dalam pengembangan": "Dalam pengembangan", "Belum dipublikasikan": "Belum diinformasikan",
};
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
    slug: "vircuit", title: "Vircuit", subtitle: "Belajar elektronika melalui laboratorium virtual", source: "DATA §9.2",
    summary: "Vircuit menyediakan ruang belajar elektronika, mikrokontroler, dan IoT melalui simulasi di browser. Pengguna dapat menyusun rangkaian, menulis kode, dan memahami kesalahan saat mencoba.",
    categories: ["Web"], year: 2026, context: "Trio Hengker Enjoyer", role: "Anggota tim pengembangan",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui", "Radix UI", "GSAP", "Lenis", "Three.js", "React Three Fiber", "React Flow / XYFlow", "Monaco Editor", "Zustand", "Web Worker", "Supabase", "Google Gemini / Cirra", "React Hook Form", "Zod", "Vitest", "Playwright", "PGlite", "pnpm"],
    approach: "Pembelajaran dimulai dengan memilih komponen dan menghubungkan pin pada kanvas rangkaian. Editor Arduino C/C++, simulasi edukatif Arduino Uno/ESP32, serta serial monitor membantu pengguna mencoba dan menelusuri kode. Logika simulasi berjalan melalui Web Worker, sementara asisten Cirra menggunakan Google Gemini.",
    limitation: "Vircuit dikembangkan bersama tim Trio Hengker Enjoyer. Pembagian modul yang saya kerjakan belum diuraikan di sini. Simulasinya ditujukan untuk pembelajaran; kesetaraan dengan perangkat fisik dan kompatibilitas firmware penuh belum dibuktikan.",
    featured: 1, visual: "circuit", link: "https://vircuit.vercel.app/",
  },
  {
    slug: "aura-pod", title: "AURA POD", subtitle: "Fotobioreaktor mikroalga dengan dukungan elektronika dan IoT", source: "DATA §9.1",
    summary: "AURA POD adalah inovasi fotobioreaktor mikroalga dari tim ALGA NOVA untuk mendukung transisi industri rendah karbon. Dashboard web menjadi bagian dari sistem pemantauan dan kontrolnya.",
    categories: ["IoT", "Web"], year: 2026, context: "ALGA NOVA", role: "Anggota tim · bidang elektronika dan IoT",
    technologies: ["React", "TypeScript", "JavaScript", "Vite", "Tailwind CSS", "React Router", "GSAP", "Recharts", "Lucide React", "Blynk Cloud HTTP API", "Google Gemini / Aira", "Vercel Serverless", "npm"],
    approach: "Dashboard menampilkan data sensor dan menyediakan antarmuka kontrol melalui Blynk Cloud HTTP API. Asisten Aira menggunakan Google Gemini melalui endpoint serverless. Peran saya dalam tim berada pada bidang elektronika dan IoT.",
    limitation: "Penghargaan AURA POD diraih oleh inovasi tim secara keseluruhan. Pembagian kontribusi kode belum dijelaskan secara rinci, dan koneksi perangkat pada dashboard online belum diverifikasi. Penerapan industri penuh belum dapat disimpulkan dari proyek ini.",
    featured: 2, visual: "aura", link: "https://aura-pod-dashboard.vercel.app/",
  },
  {
    slug: "website-pvte-himpteka", title: "PVTE + HIMPTEKA", subtitle: "Informasi program studi dan organisasi dalam satu website", source: "DATA §9.3", status: "Online",
    summary: "Website untuk menyajikan informasi Program Studi Pendidikan Vokasional Teknik Elektronika dan HIMPTEKA UMRI. Dua portal berbagi satu sistem untuk kebutuhan akademik dan organisasi.",
    categories: ["Web"], year: 2026, context: "PVTE · Universitas Muhammadiyah Riau", role: "Full Stack Web Developer",
    technologies: ["React", "JavaScript / JSX", "Vite", "Tailwind CSS", "React Router", "GSAP", "Framer Motion", "Lenis", "Laravel", "PHP", "MySQL", "REST API", "Laravel Sanctum", "Blade", "TF-IDF / cosine similarity", "Google Gemini / Vira", "PHPUnit", "Laravel Pint"],
    approach: "Saya berperan sebagai Full Stack Web Developer. Antarmuka React terhubung dengan backend Laravel dan panel pengelolaan konten berbasis Blade. Asisten Vira memakai pencarian informasi lokal dengan TF-IDF/cosine similarity serta Google Gemini.",
    limitation: "Website sudah online dan masih dapat dikembangkan lebih lanjut. Uraian ini belum mencakup pemeriksaan seluruh fitur pada website aktif maupun alur integrasi Vira secara terperinci.",
    featured: 3, visual: "portal", link: "https://pvte.fkip.umri.ac.id/",
  },
  {
    slug: "iot-egg-incubator-research", title: "Inkubator penelitian MQTT", subtitle: "Kendali penetasan telur ayam kate berbasis ESP32", source: "DATA §8.1 / §9.4",
    summary: "Proyek penelitian dosen tentang inkubator telur ayam kate dengan kendali otomatis berbasis ESP32. MQTT digunakan dalam rancangan komunikasi sistem, tanpa tombol kontrol fisik.",
    categories: ["IoT", "Research"], year: 2026, context: "Penelitian dosen", role: "IoT Engineer",
    technologies: ["ESP32", "MQTT", "DHT22", "LCD I2C"],
    approach: "Sebagai IoT Engineer, saya terlibat pada rancangan kendali dan komunikasi perangkat. Pemanas diatur berdasarkan batas suhu melalui histeresis, sedangkan pembalikan telur dijadwalkan oleh sistem. MQTT menjadi jalur komunikasi untuk kebutuhan pemantauan.",
    limitation: "Hasil akhir pengujian MQTT, data eksperimen, dan tingkat keberhasilan penetasan belum tersedia untuk ditampilkan. Inkubator ini merupakan proyek penelitian yang berbeda dari versi Blynk dengan tombol fisik.", visual: "research",
  },
  {
    slug: "iot-egg-incubator-blynk", title: "Inkubator Blynk", subtitle: "Kendali inkubator melalui Blynk dan tombol fisik", source: "DATA §9.5",
    summary: "Proyek inkubator telur yang menggabungkan integrasi IoT melalui Blynk dengan tombol kendali pada perangkat.",
    categories: ["IoT"], context: "Pengembangan sistem IoT", technologies: ["Blynk", "Tombol fisik"],
    approach: "Blynk menjadi antarmuka kendali jarak jauh, sementara tombol fisik menyediakan interaksi langsung pada inkubator. Pendekatan ini berbeda dari inkubator penelitian MQTT yang bekerja tanpa tombol fisik.",
    limitation: "Rincian board, sensor, kontribusi pribadi, dan tahap penyelesaian belum tersedia. Spesifikasi versi penelitian MQTT tidak digunakan untuk menjelaskan perangkat pada proyek ini.", visual: "research",
  },
  {
    slug: "website-lazismu-kuansing", title: "LAZISMU Kuansing", subtitle: "Website informasi dan pelatihan pengelolaannya", source: "DATA §7.2 / §9.6",
    summary: "Website LAZISMU Kabupaten Kuantan Singingi sebagai media informasi dan komunikasi. Pengembangannya disertai pelatihan pengoperasian dalam kegiatan pengabdian masyarakat.",
    categories: ["Web"], year: 2024, context: "Pengabdian kepada masyarakat", role: "Full Stack Web Developer",
    technologies: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
    approach: "Saya berperan sebagai Full Stack Web Developer pada pembuatan website. Pelatihan pengoperasian menjadi bagian dari kegiatan agar pengelolaan informasi dapat dipahami oleh pihak organisasi.",
    limitation: "Halaman ini menjelaskan pengembangan dan pelatihan website. Data penggunaan serta evaluasi dampak layanan belum tersedia.", visual: "portal", link: "https://lazismukuansing.org/",
  },
  ...archiveProjects,
];
export const profile = {
  name: "Muhammad Rehan", brand: "mhdrhn.", location: "Pekanbaru, Indonesia", github: "https://github.com/Han0953",
  bio: "Saya Muhammad Rehan, mahasiswa S1 Pendidikan Vokasional Teknik Elektronika di Universitas Muhammadiyah Riau. Berangkat dari latar Teknik Komputer dan Jaringan, saya mendalami teknologi lewat proyek dan pengalaman langsung. Saya belajar memahami cara kerja sebuah sistem, mencoba menerapkan gagasan, dan mengerjakannya secara mandiri maupun bersama tim. Proses itu menjadi bagian dari cara saya memperdalam kemampuan, terutama dalam elektronika dan pengembangan perangkat lunak.",
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
