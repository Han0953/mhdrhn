/** Public editorial subset of DATA.md v0.2.1. Unknown fields stay in the source document.
 * A published summary does not certify deployment functionality. */
export const categories = ["Semua", "Web", "IoT", "Research"] as const;
export type Category = (typeof categories)[number];
export interface Project {
  slug: string; title: string; subtitle: string; summary: string;
  categories: Exclude<Category, "Semua">[]; year?: number; context: string; role?: string;
  technologies: string[]; approach: string; limitation: string; featured?: number;
  visual: "circuit" | "aura" | "portal" | "research"; link?: string;
}
const projects: readonly Project[] = [
  {
    slug: "vircuit", title: "Vircuit", subtitle: "Virtual electronics laboratory",
    summary: "Laboratorium virtual berbasis web untuk mengeksplorasi elektronika, mikrokontroler, dan IoT. Belajar dengan mencoba, merangkai, dan memahami kesalahan.",
    categories: ["Web"], year: 2026, context: "Trio Hengker Enjoyer", role: "Anggota tim pengembangan",
    technologies: ["Next.js", "TypeScript", "React Flow", "Web Worker", "Supabase"],
    approach: "Vircuit mempertemukan perancangan rangkaian, editor kode, dan pengalaman debugging dalam satu ruang belajar. Pendekatannya adalah Learning by Doing & Learning from Mistakes.",
    limitation: "Karya ini dikembangkan bersama tim. Rincian modul kontribusi pribadi belum dipublikasikan. Cakupan simulasi dan kompatibilitas firmware tidak dinyatakan setara dengan perangkat fisik.",
    featured: 1, visual: "circuit", link: "https://vircuit.vercel.app/",
  },
  {
    slug: "aura-pod", title: "AURA POD", subtitle: "Electronics for a lower-carbon future",
    summary: "Inovasi tim ALGA NOVA yang menghubungkan fotobioreaktor mikroalga, elektronika, dan IoT untuk mendukung transisi industri rendah karbon.",
    categories: ["IoT", "Web"], year: 2026, context: "ALGA NOVA", role: "Anggota tim · bidang elektronika dan IoT",
    technologies: ["React", "TypeScript", "Blynk Cloud", "Recharts"],
    approach: "Komponen digital AURA POD berupa dashboard monitoring dan kontrol dengan integrasi Blynk Cloud HTTP API. Dashboard menjadi bagian dari inovasi fotobioreaktor yang dikembangkan bersama tim.",
    limitation: "Penghargaan diberikan kepada inovasi tim secara keseluruhan. Keterhubungan perangkat pada deployment dan kontribusi kode individual belum diverifikasi dalam portfolio ini.",
    featured: 2, visual: "aura", link: "https://aura-pod-dashboard.vercel.app/",
  },
  {
    slug: "website-pvte-himpteka", title: "PVTE + HIMPTEKA", subtitle: "Satu sistem, dua ruang informasi",
    summary: "Website Program Studi Pendidikan Vokasional Teknik Elektronika dan HIMPTEKA UMRI. Informasi akademik dan organisasi dalam satu sistem web.",
    categories: ["Web"], year: 2026, context: "PVTE · Universitas Muhammadiyah Riau", role: "Full Stack Web Developer",
    technologies: ["React", "Laravel", "MySQL", "Tailwind CSS"],
    approach: "Frontend interaktif dipadukan dengan backend Laravel dan panel pengelolaan konten. PVTE dan HIMPTEKA adalah dua bagian dari satu website, dengan kebutuhan informasi yang berbeda.",
    limitation: "Website telah online menurut pemilik; pengembangan lanjutan dapat tetap berjalan. Ketersediaan semua fitur pada deployment tidak diaudit melalui portfolio ini.",
    featured: 3, visual: "portal", link: "https://pvte.fkip.umri.ac.id/",
  },
  {
    slug: "iot-egg-incubator-research", title: "Inkubator penelitian MQTT", subtitle: "ESP32 · kendali suhu dan kelembaban",
    summary: "Penelitian dosen mengenai sistem penetasan telur ayam kate berbasis ESP32, dengan kendali otomatis dan komunikasi MQTT tanpa tombol fisik.",
    categories: ["IoT", "Research"], year: 2026, context: "Penelitian dosen", role: "IoT Engineer",
    technologies: ["ESP32", "MQTT", "DHT22", "LCD I2C"],
    approach: "Rancangan mengatur pemanas melalui histeresis dan pembalikan telur secara terjadwal. MQTT digunakan dalam rancangan komunikasi dan monitoring sistem.",
    limitation: "Hasil akhir pengujian MQTT, data eksperimen, dan tingkat keberhasilan penetasan belum tersedia. Proyek ini berbeda dari inkubator Blynk dengan tombol fisik.", visual: "research",
  },
  {
    slug: "iot-egg-incubator-blynk", title: "Inkubator Blynk", subtitle: "Interaksi jarak jauh dan kontrol lokal",
    summary: "Inkubator telur IoT dengan integrasi Blynk dan tombol fisik untuk interaksi lokal.",
    categories: ["IoT"], context: "Pengembangan sistem IoT", technologies: ["Blynk", "Tombol fisik"],
    approach: "Rancangan menggabungkan interaksi melalui Blynk dengan tombol kontrol pada perangkat. Kedua cara interaksi menjadi pembeda dari inkubator penelitian berbasis MQTT.",
    limitation: "Status penyelesaian, jenis board dan sensor, serta rincian kontribusi belum dipublikasikan. Spesifikasi inkubator MQTT tidak diwariskan ke proyek ini.", visual: "research",
  },
  {
    slug: "website-lazismu-kuansing", title: "LAZISMU Kuansing", subtitle: "Website & pendampingan digital",
    summary: "Pembuatan dan pelatihan pengoperasian website LAZISMU Kabupaten Kuantan Singingi sebagai media informasi dan komunikasi.",
    categories: ["Web"], year: 2024, context: "Pengabdian kepada masyarakat", role: "Full Stack Web Developer",
    technologies: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
    approach: "Pengembangan website disertai pelatihan pengoperasian untuk mendukung pengelolaan informasi oleh organisasi.",
    limitation: "Ringkasan mengikuti catatan proyek. Metrik penggunaan dan dampak layanan tidak tersedia untuk dipublikasikan.", visual: "portal", link: "https://lazismukuansing.org/",
  },
];
export const profile = {
  name: "Muhammad Rehan", brand: "mhdrhn.", location: "Pekanbaru, Indonesia", github: "https://github.com/Han0953",
  bio: "Mahasiswa Pendidikan Vokasional Teknik Elektronika di Universitas Muhammadiyah Riau. Mengeksplorasi Internet of Things, embedded systems, pengembangan perangkat lunak, dan penelitian teknologi.",
};
export const navigation = [
  { href: "/", label: "Home" }, { href: "/projects", label: "Projects" }, { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" }, { href: "/lab", label: "Lab" },
  { href: "/achievements", label: "Achievements" }, { href: "/contact", label: "Contact" },
] as const;
export const experiences = [
  { group: "Organisasi & laboratorium", items: [
    { period: "2025–2026", role: "Wakil Bupati", organization: "HIMPTEKA UMRI" },
    { period: "2024–2025", role: "Anggota KOMINFO", organization: "HIMPTEKA UMRI" },
    { period: "2026", role: "Asisten Laboratorium", organization: "Laboratorium Elektronika" },
  ] },
  { group: "Kepanitiaan", items: [
    { period: "2026", role: "Dokumentasi", organization: "E2ID VII · Electronic Education Innovation Day" },
    { period: "2025–2026", role: "Dokumentasi", organization: "MILAD PVTE Ke-8" },
    { period: "2024", role: "Ketua Pelaksana", organization: "Kuliah Umum · Tantangan dan Peluang Implementasi Artificial Intelligence" },
  ] },
  { group: "Pengujian aplikasi mobile", items: [
    { period: "2026", role: "Software Tester", organization: "Velotow · aplikasi mobile" },
    { period: "2022", role: "Alpha Tester & Bug Hunter", organization: "War Thunder Mobile · game mobile" },
    { period: "2020–2021", role: "Alpha Tester & Bug Hunter", organization: "Modern Warships · game mobile" },
  ] },
] as const;
export const achievements = [
  { id: "aura-2026", result: "Juara 1", additional: "& Most Favorite", event: "BPDC · SiCheCo UNSRI", year: 2026, team: "ALGA NOVA", projectSlug: "aura-pod", source: "https://www.umri.ac.id/artikel/baca/2026-09-30-1790769863-usung-inovasi-dekarbonisasi-industri-mahasiswa-umri-raih-juara-1-dan-most-favorite-sicheco-2026" },
  { id: "vircuit-2026", result: "Juara 3", additional: "Web Development", event: "FESTRA UNRI", year: 2026, team: "Trio Hengker Enjoyer", projectSlug: "vircuit", source: "https://pvte.fkip.umri.ac.id/artikel/baca/mahasiswa-pvte-umri-raih-juara-3-web-development-festra-2026-melalui-inovasi-laboratorium-virtual-berbasis-iot-dan-ai" },
] as const;
export function getPublishedProjects(): readonly Project[] { return projects; }
export function getProjectBySlug(slug: string): Project | undefined { return projects.find(project => project.slug === slug); }
export function getFeaturedProjects(): Project[] { return projects.filter(project => project.featured !== undefined).sort((a, b) => a.featured! - b.featured!); }
export function filterProjects(category: string, query: string): readonly Project[] {
  const search = query.trim().toLocaleLowerCase("id");
  return projects.filter(project => (category === "Semua" || project.categories.includes(category as Exclude<Category, "Semua">)) && `${project.title} ${project.summary} ${project.technologies.join(" ")}`.toLocaleLowerCase("id").includes(search));
}
