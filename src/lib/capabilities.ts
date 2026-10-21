export type CapabilityBasis = "recorded" | "project" | "team" | "learning" | "experience";
export interface Capability { id: string; name: string; basis: CapabilityBasis; context: string; source: string; href: string }
export interface CapabilityGroup { id: "tech" | "tools" | "practice"; title: string; description: string; items: readonly Capability[] }
export const capabilityBasisLabels: Record<CapabilityBasis, string> = { recorded: "Teknologi", project: "Penerapan proyek", team: "Kolaborasi tim", learning: "Learning", experience: "Pengalaman" };
export const capabilityGroups: readonly CapabilityGroup[] = [
  { id: "tech", title: "Tech Stack & Engineering", description: "Teknologi yang menjadi dasar untuk merancang dan mengembangkan sebuah sistem.", items: [
    { id: "esp32", name: "ESP32", basis: "recorded", context: "Embedded systems", source: "DATA §12.2", href: "/about#skills-embedded" },
    { id: "mqtt", name: "MQTT", basis: "recorded", context: "Komunikasi IoT", source: "DATA §12.3", href: "/projects/iot-egg-incubator-research" },
    { id: "cpp", name: "C++", basis: "recorded", context: "Programming languages", source: "DATA §12.4", href: "/about#skills-languages" },
    { id: "react", name: "React", basis: "recorded", context: "Web development", source: "DATA §12.5", href: "/about#skills-web" },
    { id: "typescript", name: "TypeScript", basis: "team", context: "Vircuit · karya tim", source: "DATA §12.4 / §9.2", href: "/projects/vircuit" },
    { id: "flutter", name: "Flutter", basis: "learning", context: "Mobile development", source: "DATA §12.6", href: "/about#skills-mobile" },
  ] },
  { id: "tools", title: "Tools & Workflow", description: "Alat bantu yang saya gunakan untuk mengerjakan dan memeriksa hasil pengembangan.", items: [
    { id: "monaco", name: "Monaco Editor", basis: "team", context: "Vircuit · editor", source: "DATA §9.2", href: "/projects/vircuit" },
    { id: "react-flow", name: "React Flow", basis: "team", context: "Vircuit · kanvas rangkaian", source: "DATA §9.2", href: "/projects/vircuit" },
    { id: "vitest", name: "Vitest", basis: "team", context: "Vircuit · testing stack", source: "DATA §9.2", href: "/projects/vircuit" },
    { id: "playwright", name: "Playwright", basis: "team", context: "Vircuit · testing stack", source: "DATA §9.2", href: "/projects/vircuit" },
    { id: "laravel-pint", name: "Laravel Pint", basis: "project", context: "PVTE + HIMPTEKA", source: "DATA §9.3", href: "/projects/website-pvte-himpteka" },
  ] },
  { id: "practice", title: "Professional Capabilities", description: "Keterampilan yang digunakan saat bekerja dengan orang lain dan menjalani tanggung jawab.", items: [
    { id: "event-coordination", name: "Koordinasi acara", basis: "experience", context: "Ketua Pelaksana · Kuliah Umum 2024", source: "DATA §4.1", href: "/experience#kuliah-umum-ai-2024" },
    { id: "team-collaboration", name: "Kolaborasi tim", basis: "experience", context: "ALGA NOVA · AURA POD", source: "DATA §9.1", href: "/projects/aura-pod" },
    { id: "documentation", name: "Dokumentasi", basis: "experience", context: "E2ID VII · 2026", source: "DATA §4.2 / §12.8", href: "/experience#e2id-vii-2026" },
    { id: "website-training", name: "Pendampingan web", basis: "experience", context: "Pengabdian LAZISMU · 2024", source: "DATA §7.2", href: "/lab#pkm-lazismu-2024" },
  ] },
];
