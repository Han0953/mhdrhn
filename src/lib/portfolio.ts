export interface ExperienceRecord { id: string; period: string; role: string; organization: string; source: string; context: string }
export interface ExperienceGroup { id: string; group: string; items: readonly ExperienceRecord[] }
export const experienceGroups: readonly ExperienceGroup[] = [
  { id: "laboratorium", group: "Laboratorium", items: [{ id: "lab-electronics-2026", period: "2026", role: "Asisten Laboratorium", organization: "Laboratorium Elektronika", source: "DATA §5.1", context: "Pengalaman di laboratorium elektronika. Lingkup tugas terperinci belum dipublikasikan." }] },
  { id: "organisasi", group: "Organisasi", items: [
    { id: "himpteka-vice-2025", period: "2025–2026", role: "Wakil Bupati", organization: "HIMPTEKA UMRI", source: "DATA §3.1", context: "Peran organisasi di Himpunan Mahasiswa Pendidikan Vokasional Teknik Elektronika UMRI." },
    { id: "himpteka-kominfo-2024", period: "2024–2025", role: "Anggota KOMINFO", organization: "HIMPTEKA UMRI", source: "DATA §3.2", context: "Keterlibatan dalam bidang KOMINFO HIMPTEKA UMRI." },
  ] },
  { id: "kepanitiaan", group: "Kepanitiaan", items: [
    { id: "e2id-vii-2026", period: "2026", role: "Dokumentasi", organization: "E2ID VII · Electronic Education Innovation Day", source: "DATA §4.2", context: "Keterlibatan dokumentasi pada E2ID VII tahun 2026." },
    { id: "milad-pvte-8", period: "2025–2026", role: "Dokumentasi", organization: "MILAD PVTE Ke-8", source: "DATA §4.3", context: "Periode mengikuti catatan portfolio; tanggal acara harian tidak dicantumkan." },
    { id: "kuliah-umum-ai-2024", period: "2024", role: "Ketua Pelaksana", organization: "Kuliah Umum · Tantangan dan Peluang Implementasi Artificial Intelligence", source: "DATA §4.1", context: "Kepanitiaan kuliah umum mengenai tantangan dan peluang implementasi AI." },
  ] },
  { id: "mobile-testing", group: "Pengujian aplikasi mobile", items: [
    { id: "velotow-2026", period: "2026", role: "Software Tester", organization: "Velotow · aplikasi mobile", source: "DATA §6", context: "Pengalaman pengujian aplikasi mobile. Metode, OS, serta jumlah temuan tidak dipublikasikan. Ini bukan klaim hubungan kerja resmi dengan pengembang." },
    { id: "war-thunder-mobile-2022", period: "2022", role: "Alpha Tester & Bug Hunter", organization: "War Thunder Mobile · game mobile", source: "DATA §6", context: "Pengalaman pengujian game mobile dan bug hunting. Rincian program pengujian serta hubungan formal dengan publisher tidak dinyatakan." },
    { id: "modern-warships-2020", period: "2020–2021", role: "Alpha Tester & Bug Hunter", organization: "Modern Warships · game mobile", source: "DATA §6", context: "Pengalaman pengujian game mobile dan bug hunting. Rincian program pengujian serta hubungan formal dengan publisher tidak dinyatakan." },
  ] },
];

export const interests = ["Internet of Things (IoT)", "Embedded Systems", "Electronics", "Mobile Application Testing & Quality Assurance", "Educational Technology", "Mobile Technology", "Artificial Intelligence", "Research & Innovation"] as const;
export const hobbies = ["Project Development", "Photography", "Videography", "Reading", "Gaming"] as const;
export interface SkillGroup { id: string; title: string; description: string; skills: readonly { name: string; learning?: boolean }[]; projectSlug?: string; projectLabel?: string }
const skills = (...names: string[]) => names.map(name => ({ name }));
export const skillGroups: readonly SkillGroup[] = [
  { id: "electronics", title: "Electronics", description: "Rangkaian, pengukuran, dan praktik laboratorium.", skills: skills("Circuit Design", "Electronics Troubleshooting", "Sensor Integration", "Laboratory Practice", "Electrical Measurement") },
  { id: "embedded", title: "Embedded Systems", description: "Platform mikrokontroler yang tercatat dalam portfolio.", skills: skills("Arduino Uno", "Arduino Nano", "ESP8266", "ESP32", "STM32"), projectSlug: "iot-egg-incubator-research", projectLabel: "Inkubator penelitian MQTT" },
  { id: "iot", title: "Internet of Things", description: "Komunikasi, monitoring sensor, dan otomasi perangkat.", skills: skills("MQTT", "Blynk / Blynk Cloud HTTP API", "Remote Monitoring", "Smart Automation", "Sensor Monitoring"), projectSlug: "aura-pod", projectLabel: "AURA POD" },
  { id: "languages", title: "Programming Languages", description: "Bahasa yang tercatat dalam data portfolio dan proyek.", skills: skills("C++", "PHP", "JavaScript", "TypeScript", "Python", "Dart", "SQL") },
  { id: "web", title: "Web Development & Data", description: "Teknologi dalam karya personal dan kolaboratif; bukan klaim seluruh modul dikerjakan sendiri.", skills: skills("HTML5", "CSS3", "React", "Next.js", "Vite", "Tailwind CSS", "Laravel", "REST API", "MySQL", "PostgreSQL / Supabase", "GSAP", "Lenis", "Framer Motion", "Three.js", "React Three Fiber", "React Flow / XYFlow", "Monaco Editor", "Web Worker"), projectSlug: "website-pvte-himpteka", projectLabel: "PVTE + HIMPTEKA" },
  { id: "mobile", title: "Mobile Development", description: "Pembelajaran pengembangan aplikasi mobile.", skills: [{ name: "Flutter", learning: true }, { name: "Firebase", learning: true }, { name: "MIT App Inventor" }] },
  { id: "qa", title: "Mobile Application Testing & QA", description: "Bidang dari pengalaman pengujian aplikasi/game mobile; cakupan dan metode spesifik belum dirinci.", skills: skills("Mobile Application Software Testing", "Mobile App UI Testing", "Bug Hunting", "User Experience Testing") },
  { id: "media", title: "Design & Media", description: "Aktivitas kreatif dan dokumentasi.", skills: skills("Photography", "Videography", "Documentation") },
];

export interface LabRecord { id: string; title: string; year?: number; role?: string; summary: string; note: string; source: string; projectSlug?: string }
export const research: readonly LabRecord[] = [
  { id: "research-mqtt-2026", title: "Evaluasi Kinerja Protokol MQTT pada Sistem Penetasan Telur Ayam Kate Berbasis ESP32 untuk Kendali Suhu dan Kelembaban Adaptif", year: 2026, role: "IoT Engineer", source: "DATA §8.1", projectSlug: "iot-egg-incubator-research", summary: "Penelitian dosen mengenai kendali otomatis, pengaturan pemanas dan pembalikan telur, dengan rancangan komunikasi MQTT tanpa tombol fisik.", note: "Hasil akhir pengujian, validasi integrasi online, dan publikasi ilmiah belum dipublikasikan di portfolio ini." },
  { id: "research-telehealth-2026", title: "Development and Validation of an IoT-Based Heart Rate and Oxygen Saturation Monitoring System for Telehealth Applications", year: 2026, source: "DATA §8.2", summary: "Catatan penelitian mengenai monitoring heart rate dan SpO2 berbasis IoT untuk aplikasi telehealth.", note: "Judul penelitian berasal dari catatan portfolio terdahulu. Tahap penelitian, hasil validasi, rincian peran, dan bukti publikasi belum tersedia; ini tidak dinyatakan sebagai artikel jurnal terbit." },
];
export const communityService: readonly LabRecord[] = [
  { id: "pkm-rengginang-2025", title: "Pemberdayaan UMKM Rengginang di Desa Bukit Payung Melalui Teknologi Pengering Berbasis IoT dan Pendampingan Usaha untuk Kemandirian Ekonomi Berkelanjutan", year: 2025, role: "IoT Engineer", source: "DATA §7.1", summary: "Kegiatan pengabdian yang menghubungkan teknologi pengering berbasis IoT dengan pendampingan usaha UMKM Rengginang.", note: "Dicatat sebagai pengabdian masyarakat, bukan publikasi ilmiah atau klaim hasil pengukuran dampak." },
  { id: "pkm-lazismu-2024", title: "Transformasi Digital: Pembuatan dan Pelatihan Pengoperasian Website LAZISMU Kabupaten Kuantan Singingi Sebagai Media Informasi dan Komunikasi", year: 2024, role: "Full Stack Web Developer", source: "DATA §7.2", projectSlug: "website-lazismu-kuansing", summary: "Pembuatan website dan pelatihan pengoperasian untuk mendukung informasi serta komunikasi LAZISMU Kuantan Singingi.", note: "Kegiatan ini terkait proyek website LAZISMU yang sama, tidak dihitung sebagai proyek baru." },
];
