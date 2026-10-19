import type { Project } from "./content";

// Only retained identities are published. REVIEW status/hardware/roles stay in DATA.
const note = (slug: string, title: string, categories: Project["categories"], source: string): Project => ({
  slug, title, categories, source, format: "summary", subtitle: "Catatan proyek dari arsip portfolio",
  summary: `${title} tercatat dalam arsip karya Rehan.`, context: "Arsip portfolio", technologies: [],
  approach: "Identitas proyek dipertahankan dari catatan portfolio terdahulu.",
  limitation: "Uraian teknis, periode, kontribusi, status penyelesaian, dan dokumentasi belum dipublikasikan pada catatan ini.", visual: "circuit",
});

export const archiveProjects: readonly Project[] = [
  note("air-quality-monitoring", "Air Quality Monitoring System", ["IoT"], "DATA §9.7"),
  note("smart-home-iot", "Smart Home IoT", ["IoT"], "DATA §9.8"),
  note("industrial-machine-safety", "Industrial Machine Safety System", ["Electronics", "Embedded"], "DATA §9.9"),
  note("drone-stm32", "Drone STM32", ["Embedded"], "DATA §9.10"),
  note("zhy-ai", "Zhy AI", ["AI"], "DATA §9.11"),
  { slug: "mhdrhn-portfolio", title: "mhdrhn.", subtitle: "Personal website & creative engineering portfolio", source: "DATA §9.12; package.json", format: "summary", status: "Dalam pengembangan", categories: ["Web"], context: "Portfolio personal", summary: "Website personal multi-page yang mempertemukan elektronika, software, dan penelitian.", technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS"], approach: "Frontend dikembangkan secara mobile-first dengan data lokal. Azura masih berupa demo lokal, tanpa layanan AI live.", limitation: "Belum ada URL produksi yang dikonfirmasi. Pengembangan frontend dan pengujian masih berlangsung.", visual: "circuit" },
  note("running-text-display", "Running Text Display", ["Electronics"], "DATA §10"),
  note("robot-tank-wifi-esp8266", "Robot Tank WiFi ESP8266", ["Embedded"], "DATA §10"),
  note("robot-arm", "Robot Arm", ["Embedded"], "DATA §10"),
  note("robot-wifi-car-esp32", "Robot WiFi Car ESP32", ["Embedded"], "DATA §10"),
  note("automatic-plant-watering", "Automatic Plant Watering System", ["Embedded"], "DATA §10"),
  note("smart-reminder", "Smart Reminder", ["Embedded"], "DATA §10"),
  note("early-fire-detection", "Early Fire Detection System", ["IoT"], "DATA §10"),
  note("solar-tracking-system", "Solar Tracking System", ["Embedded"], "DATA §10"),
  note("mini-radar-detection", "Mini Radar Detection", ["Embedded"], "DATA §10"),
  note("academic-information-dashboard", "Academic Information Dashboard", ["Web"], "DATA §10"),
];
