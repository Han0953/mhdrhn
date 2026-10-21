import type { Project } from "./content";

const archiveCopy: Record<string, Pick<Project, "subtitle" | "summary" | "approach" | "limitation">> = {
  "air-quality-monitoring": {
    subtitle: "Pemantauan kualitas udara berbasis IoT",
    summary: "Proyek IoT dengan fokus pada pemantauan kualitas udara dan pembacaan kondisi lingkungan.",
    approach: "Pembahasan proyek berpusat pada pemantauan udara melalui perangkat terhubung. Rincian sensor dan penyajian datanya belum dijabarkan di sini.",
    limitation: "Dokumentasi perangkat dan hasil pengukuran belum tersedia untuk ditampilkan.",
  },
  "smart-home-iot": {
    subtitle: "Perangkat terhubung untuk kebutuhan rumah",
    summary: "Smart Home IoT mengeksplorasi penggunaan perangkat terhubung dalam lingkungan rumah.",
    approach: "Fokusnya adalah kendali perangkat melalui sistem IoT. Uraian fungsi dan antarmuka pengendalian belum disertakan.",
    limitation: "Cakupan perangkat dan hasil pengujian belum tersedia pada halaman ini.",
  },
  "industrial-machine-safety": {
    subtitle: "Elektronika untuk keselamatan mesin",
    summary: "Proyek elektronika dan embedded systems dengan fokus pada keselamatan mesin industri.",
    approach: "Keselamatan pengoperasian mesin menjadi pokok proyek ini. Rincian mekanisme deteksi dan respons sistem belum dijelaskan.",
    limitation: "Belum ada hasil pengujian keandalan atau validasi keselamatan yang dapat ditampilkan.",
  },
  "drone-stm32": {
    subtitle: "Eksplorasi drone dengan STM32",
    summary: "Drone STM32 merupakan proyek embedded yang mempelajari penggunaan STM32 pada sistem drone.",
    approach: "Pembahasan berfokus pada platform STM32. Rancangan kendali dan komponen pendukung belum diuraikan.",
    limitation: "Tahap pengembangan dan hasil uji terbang belum tersedia untuk ditampilkan.",
  },
  "zhy-ai": {
    subtitle: "Proyek kecerdasan buatan",
    summary: "Zhy AI adalah salah satu proyek dalam bidang kecerdasan buatan. Tujuan dan fiturnya belum saya uraikan di sini.",
    approach: "Penjelasan model dan pendekatan teknis belum tersedia.",
    limitation: "Belum ada demo atau hasil pengujian yang dapat ditampilkan.",
  },
  "running-text-display": {
    subtitle: "Penyajian informasi melalui tampilan teks",
    summary: "Eksplorasi tampilan teks elektronik untuk menyampaikan informasi pada perangkat.",
    approach: "Proyek berfokus pada penyajian teks. Rangkaian dan cara pengoperasiannya belum dijelaskan secara rinci.",
    limitation: "Dokumentasi perangkat dan kode belum tersedia untuk dibagikan.",
  },
  "robot-tank-wifi-esp8266": {
    subtitle: "Kendali robot tank melalui WiFi",
    summary: "Eksplorasi kendali robot tank melalui komunikasi WiFi dengan ESP8266.",
    approach: "Komunikasi nirkabel menjadi bagian utama dari gagasan kendali robot ini. Rancangan mekanik dan antarmuka belum dijabarkan.",
    limitation: "Belum tersedia dokumentasi perakitan atau hasil pengujian kendali.",
  },
  "robot-arm": {
    subtitle: "Eksplorasi pergerakan lengan robot",
    summary: "Robot Arm merupakan proyek embedded yang berfokus pada lengan robot dan pergerakannya.",
    approach: "Uraian mekanisme gerak, kendali, dan perakitan belum disertakan pada halaman ini.",
    limitation: "Rincian perangkat serta hasil pengujian belum tersedia untuk ditampilkan.",
  },
  "robot-wifi-car-esp32": {
    subtitle: "Robot mobil dengan komunikasi WiFi",
    summary: "Proyek robot mobil berbasis ESP32 yang mengeksplorasi kendali melalui WiFi.",
    approach: "Peran komunikasi WiFi dalam kendali robot menjadi fokus proyek. Detail antarmuka dan rangkaian belum dijabarkan.",
    limitation: "Dokumentasi implementasi dan uji kendali belum tersedia untuk dibagikan.",
  },
  "automatic-plant-watering": {
    subtitle: "Penyiraman tanaman secara otomatis",
    summary: "Eksplorasi sistem embedded untuk kebutuhan penyiraman tanaman otomatis.",
    approach: "Proyek ini membahas otomasi penyiraman. Logika kendali, perangkat, dan kondisi pengoperasiannya belum dijelaskan secara rinci.",
    limitation: "Hasil uji penyiraman dan dokumentasi sistem belum tersedia.",
  },
  "smart-reminder": {
    subtitle: "Pengingat berbasis perangkat embedded",
    summary: "Smart Reminder merupakan proyek embedded dengan fokus pada fungsi pengingat.",
    approach: "Rancangan interaksi dan penggunaan pengingat belum diuraikan pada halaman ini.",
    limitation: "Detail fungsi, perangkat, serta dokumentasi pengembangan belum tersedia.",
  },
  "early-fire-detection": {
    subtitle: "Eksplorasi deteksi dini kebakaran",
    summary: "Proyek IoT yang mengangkat deteksi dini kebakaran sebagai fokus pengembangan.",
    approach: "Pembahasan berpusat pada pendeteksian kondisi yang berkaitan dengan kebakaran. Metode deteksi dan respons perangkat belum dijabarkan.",
    limitation: "Belum ada data pengujian keandalan atau validasi keselamatan yang dapat ditampilkan.",
  },
  "solar-tracking-system": {
    subtitle: "Sistem pelacakan arah matahari",
    summary: "Eksplorasi solar tracking dalam sistem embedded untuk mengikuti arah matahari.",
    approach: "Pelacakan arah matahari menjadi pokok rancangan ini. Uraian mekanisme penggerak dan kendalinya belum tersedia.",
    limitation: "Kinerja pelacakan dan data pengujiannya belum dapat ditampilkan.",
  },
  "mini-radar-detection": {
    subtitle: "Pendeteksian objek dalam proyek embedded",
    summary: "Mini Radar Detection mengeksplorasi pendeteksian objek dalam sebuah sistem embedded.",
    approach: "Rancangan pemindaian dan cara penyajian hasil deteksi belum dijabarkan pada halaman ini.",
    limitation: "Dokumentasi perangkat, jangkauan deteksi, dan hasil pengujian belum tersedia.",
  },
  "academic-information-dashboard": {
    subtitle: "Penyajian informasi akademik melalui dashboard",
    summary: "Proyek web dengan fokus pada penyajian informasi akademik dalam antarmuka dashboard.",
    approach: "Dashboard menjadi sarana untuk menampilkan informasi akademik. Cakupan data dan fitur pengelolaan belum dijelaskan lebih lanjut.",
    limitation: "Belum ada demo atau dokumentasi fungsi yang dapat ditautkan.",
  },
};

// Only retained identities are published. REVIEW status/hardware/roles stay in DATA.
const note = (slug: string, title: string, categories: Project["categories"], source: string): Project => ({
  slug, title, categories, source, format: "summary", ...archiveCopy[slug],
  context: "Arsip proyek", technologies: [], visual: "circuit",
});

export const archiveProjects: readonly Project[] = [
  note("air-quality-monitoring", "Air Quality Monitoring System", ["IoT"], "DATA §9.7"),
  note("smart-home-iot", "Smart Home IoT", ["IoT"], "DATA §9.8"),
  note("industrial-machine-safety", "Industrial Machine Safety System", ["Electronics", "Embedded"], "DATA §9.9"),
  note("drone-stm32", "Drone STM32", ["Embedded"], "DATA §9.10"),
  note("zhy-ai", "Zhy AI", ["AI"], "DATA §9.11"),
  { slug: "mhdrhn-portfolio", title: "mhdrhn.", subtitle: "Website personal untuk karya dan pengalaman saya", source: "DATA §9.12; package.json", format: "summary", status: "Dalam pengembangan", categories: ["Web"], context: "Portofolio pribadi", summary: "mhdrhn. adalah website personal tempat saya membagikan karya, pengalaman, dan hal-hal yang saya pelajari. Halamannya dirancang agar perjalanan tersebut mudah ditelusuri.", technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS"], approach: "Website dibagi menjadi beberapa halaman agar karya dan pengalaman mudah ditelusuri. Frontend menyesuaikan layar ponsel hingga desktop. Azura membantu navigasi melalui demo percakapan lokal.", limitation: "Website masih dalam pengembangan frontend dan pengujian. Alamat produksi belum diumumkan; Azura belum terhubung ke layanan AI.", visual: "circuit" },
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
