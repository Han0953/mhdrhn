export interface ExperienceRecord { id: string; period?: string; role: string; organization: string; source: string; context: string }
export interface ExperienceGroup { id: string; group: string; items: readonly ExperienceRecord[] }
export const experienceGroups: readonly ExperienceGroup[] = [
  { id: "laboratorium", group: "Laboratorium", items: [
    { id: "lab-electronics-2026", period: "2026", role: "Asisten Laboratorium", organization: "Laboratorium Elektronika", source: "DATA §5.1", context: "Peran ini menjadi bagian dari pengalaman saya di lingkungan laboratorium elektronika." },
    { id: "lab-automation-robotics-pvte", role: "Asisten Lab Otomasi Cerdas dan Robotika", organization: "PVTE", source: "DATA §5.2", context: "Saya membantu pengelolaan laboratorium melalui pengecekan barang, alat, dan komponen praktik elektronika, serta memberikan dukungan teknis." },
  ] },
  { id: "organisasi", group: "Organisasi", items: [
    { id: "himpteka-vice-2025", period: "2025–2026", role: "Wakil Bupati", organization: "HIMPTEKA UMRI", source: "DATA §3.1", context: "Pada kepengurusan 2025–2026, saya menjabat Wakil Bupati HIMPTEKA UMRI, organisasi mahasiswa Pendidikan Vokasional Teknik Elektronika." },
    { id: "himpteka-kominfo-2024", period: "2024–2025", role: "Anggota KOMINFO", organization: "HIMPTEKA UMRI", source: "DATA §3.2", context: "Saya bergabung dalam bidang KOMINFO HIMPTEKA UMRI pada periode 2024–2025." },
  ] },
  { id: "kepanitiaan", group: "Kepanitiaan", items: [
    { id: "e2id-vii-2026", period: "2026", role: "Dokumentasi", organization: "E2ID VII · Electronic Education Innovation Day", source: "DATA §4.2", context: "Bagian dari divisi dokumentasi Electronic Education Innovation Day (E2ID VII) pada 2026." },
    { id: "milad-pvte-8", period: "2025–2026", role: "Dokumentasi", organization: "MILAD PVTE Ke-8", source: "DATA §4.3", context: "Berkontribusi pada dokumentasi kegiatan MILAD PVTE Ke-8." },
    { id: "kuliah-umum-ai-2024", period: "2024", role: "Ketua Pelaksana", organization: "Kuliah Umum · Tantangan dan Peluang Implementasi Artificial Intelligence", source: "DATA §4.1", context: "Menjadi Ketua Pelaksana kuliah umum bertema Tantangan dan Peluang Implementasi Artificial Intelligence pada 2024." },
  ] },
  { id: "mobile-testing", group: "Pengujian aplikasi mobile", items: [
    { id: "velotow-2026", period: "2026", role: "Software Tester", organization: "Velotow · aplikasi mobile", source: "DATA §6", context: "Saya terlibat dalam pengujian aplikasi mobile Velotow sebagai Software Tester pada 2026." },
    { id: "war-thunder-mobile-2022", period: "2022", role: "Alpha Tester & Bug Hunter", organization: "War Thunder Mobile · game mobile", source: "DATA §6", context: "Pengalaman sebagai Alpha Tester & Bug Hunter pada War Thunder Mobile, dengan fokus pada pengujian game mobile dan identifikasi bug." },
    { id: "modern-warships-2020", period: "2020–2021", role: "Alpha Tester & Bug Hunter", organization: "Modern Warships · game mobile", source: "DATA §6", context: "Menguji game mobile Modern Warships sebagai Alpha Tester & Bug Hunter pada periode 2020–2021." },
  ] },
];

export const interests = ["Internet of Things (IoT)", "Embedded Systems", "Electronics", "Mobile Application Testing & Quality Assurance", "Educational Technology", "Mobile Technology", "Artificial Intelligence", "Research & Innovation"] as const;
export const hobbies = ["Project Development", "Photography", "Videography", "Reading", "Gaming"] as const;
export interface SkillGroup { id: string; title: string; description: string; skills: readonly { name: string; learning?: boolean }[]; projectSlug?: string; projectLabel?: string }
const skills = (...names: string[]) => names.map(name => ({ name }));
export const skillGroups: readonly SkillGroup[] = [
  { id: "electronics", title: "Electronics", description: "Perancangan rangkaian, pengukuran listrik, dan penggunaan komponen dalam praktik elektronika.", skills: skills("Circuit Design", "Electronics Troubleshooting", "Sensor Integration", "Laboratory Practice", "Electrical Measurement") },
  { id: "embedded", title: "Embedded Systems", description: "Mikrokontroler dan board untuk mempelajari kendali serta interaksi perangkat elektronik.", skills: [...skills("Arduino Uno", "Arduino Nano", "ESP8266", "ESP32"), { name: "STM32", learning: true }, { name: "Raspberry Pi", learning: true }], projectSlug: "iot-egg-incubator-research", projectLabel: "Inkubator penelitian MQTT" },
  { id: "iot", title: "Internet of Things", description: "Komunikasi antarpiranti, pemantauan sensor, dan pengendalian perangkat melalui jaringan.", skills: skills("MQTT", "Blynk / Blynk Cloud HTTP API", "Remote Monitoring", "Smart Automation", "Sensor Monitoring"), projectSlug: "aura-pod", projectLabel: "AURA POD" },
  { id: "languages", title: "Programming Languages", description: "Bahasa pemrograman untuk kebutuhan web, perangkat embedded, dan pembelajaran pengembangan aplikasi.", skills: [...skills("C++", "PHP", "JavaScript", "TypeScript"), { name: "Python", learning: true }, { name: "MicroPython", learning: true }, { name: "Dart", learning: true }, ...skills("SQL")] },
  { id: "web", title: "Web Development & Data", description: "Pengembangan antarmuka web, pengelolaan data, dan integrasi layanan pada proyek pribadi maupun bersama tim.", skills: skills("HTML5", "CSS3", "React", "Next.js", "Vite", "Tailwind CSS", "Laravel", "REST API", "MySQL", "PostgreSQL / Supabase", "GSAP", "Lenis", "Framer Motion", "Three.js", "React Three Fiber", "React Flow / XYFlow", "Monaco Editor", "Web Worker"), projectSlug: "website-pvte-himpteka", projectLabel: "PVTE + HIMPTEKA" },
  { id: "mobile", title: "Mobile Development", description: "Saya mempelajari pembuatan aplikasi mobile dan layanan pendukungnya.", skills: [{ name: "Flutter", learning: true }, { name: "Firebase", learning: true }, { name: "MIT App Inventor" }] },
  { id: "qa", title: "Mobile Application Testing & QA", description: "Pengujian fungsi dan antarmuka, identifikasi bug, serta perhatian pada pengalaman pengguna aplikasi mobile.", skills: skills("Mobile Application Software Testing", "Mobile App UI Testing", "Bug Hunting", "User Experience Testing") },
  { id: "media", title: "Design & Media", description: "Fotografi, videografi, dan dokumentasi kegiatan.", skills: skills("Photography", "Videography", "Documentation") },
];

export interface LabRecord { id: string; title: string; year?: number; role?: string; summary: string; note: string; source: string; projectSlug?: string }
export const research: readonly LabRecord[] = [
  { id: "research-mqtt-2026", title: "Evaluasi Kinerja Protokol MQTT pada Sistem Penetasan Telur Ayam Kate Berbasis ESP32 untuk Kendali Suhu dan Kelembaban Adaptif", year: 2026, role: "IoT Engineer", source: "DATA §8.1", projectSlug: "iot-egg-incubator-research", summary: "Penelitian dosen tentang inkubator telur ayam kate berbasis ESP32. Rancangannya mencakup kendali pemanas, pembalikan telur terjadwal, dan komunikasi MQTT tanpa tombol fisik.", note: "Hasil akhir pengujian dan validasi koneksi online belum tersedia. Belum ada publikasi ilmiah yang dapat ditautkan." },
  { id: "research-telehealth-2026", title: "Development and Validation of an IoT-Based Heart Rate and Oxygen Saturation Monitoring System for Telehealth Applications", year: 2026, source: "DATA §8.2", summary: "Penelitian mengenai pemantauan denyut jantung dan saturasi oksigen (SpO2) berbasis IoT untuk kebutuhan telehealth.", note: "Rincian metode, tahap penelitian, dan hasil validasi belum tersedia. Belum ada tautan publikasi ilmiah yang dapat dicantumkan." },
];
export const communityService: readonly LabRecord[] = [
  { id: "pkm-rengginang-2025", title: "Pemberdayaan UMKM Rengginang di Desa Bukit Payung Melalui Teknologi Pengering Berbasis IoT dan Pendampingan Usaha untuk Kemandirian Ekonomi Berkelanjutan", year: 2025, role: "IoT Engineer", source: "DATA §7.1", summary: "Pengabdian masyarakat di Desa Bukit Payung yang mencakup teknologi pengering berbasis IoT dan pendampingan usaha UMKM Rengginang.", note: "Data evaluasi hasil pengeringan dan dampak kegiatan terhadap usaha belum tersedia untuk ditampilkan." },
  { id: "pkm-lazismu-2024", title: "Transformasi Digital: Pembuatan dan Pelatihan Pengoperasian Website LAZISMU Kabupaten Kuantan Singingi Sebagai Media Informasi dan Komunikasi", year: 2024, role: "Full Stack Web Developer", source: "DATA §7.2", projectSlug: "website-lazismu-kuansing", summary: "Kegiatan pembuatan website dan pelatihan pengoperasiannya bagi LAZISMU Kabupaten Kuantan Singingi, sebagai media informasi dan komunikasi.", note: "Uraian pengembangan website tersedia pada halaman proyek LAZISMU Kuansing." },
];
