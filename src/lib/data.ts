// ============================================================
// PORTFOLIO DATA — Single Source of Truth from Data.md
// Jangan mengarang data. Semua konten berasal dari Data.md
// ============================================================

export const personalInfo = {
  fullName: "Muhammad Rehan",
  nickname: "Rehan",
  location: "Pekanbaru, Riau, Indonesia",
  status: "Mahasiswa Aktif",
  program: "Pendidikan Vokasional Teknik Elektronika",
  university: "Universitas Muhammadiyah Riau",
  batch: "2024",
  semester: 5,
  gpa: 3.85,
  github: {
    username: "Han0953",
    url: "https://github.com/Han0953",
  },
  linkedin: "Belum Ditambahkan",
  email: "Belum Ditambahkan",
  instagram: "Opsional",
} as const;

export const professionalHeadlines = [
  "Electronic Engineering Student",
  "IoT Engineer",
  "Research Enthusiast",
  "Software Tester",
  "Technology Developer",
] as const;

export const bioShort =
  "Mahasiswa Pendidikan Vokasional Teknik Elektronika Universitas Muhammadiyah Riau yang memiliki ketertarikan pada Internet of Things (IoT), Embedded Systems, Elektronika, Pengembangan Perangkat Lunak, Software Testing, serta Penelitian dan Inovasi Teknologi.";

export const bioExtended =
  "Aktif dalam kegiatan organisasi, penelitian, pengabdian kepada masyarakat, pengembangan sistem berbasis mikrokontroler, serta pengembangan website dan teknologi digital.";

export const heroQuote =
  "Building technology that connects electronics, software, and real-world solutions.";

export const interests = [
  "Internet of Things",
  "Embedded Systems",
  "Electronics",
  "Software Testing",
  "Educational Technology",
  "Mobile Technology",
  "Artificial Intelligence",
  "Research & Innovation",
] as const;

export const hobbies = [
  "Project Development",
  "Photography",
  "Videography",
  "Reading",
  "Gaming",
] as const;

export const quickStats = [
  { label: "IPK", value: "3.85", icon: "GraduationCap" },
  { label: "Projects", value: "18+", icon: "FolderKanban" },
  { label: "Research", value: "2+", icon: "FlaskConical" },
  { label: "Community Service", value: "2+", icon: "HeartHandshake" },
  { label: "Organizations", value: "5+", icon: "Users" },
  { label: "Tech Experience", value: "5+ Years", icon: "Timer" },
] as const;

// ============================================================
// EDUCATION
// ============================================================
export interface Education {
  institution: string;
  program: string;
  status: string;
  period: string;
  gpa?: number;
  achievements?: string[];
}

export const education: Education[] = [
  {
    institution: "Universitas Muhammadiyah Riau",
    program: "Pendidikan Vokasional Teknik Elektronika",
    status: "Sedang Berjalan",
    period: "2024 - Sekarang",
    gpa: 3.85,
  },
  {
    institution: "SMKS Bina Profesi Pekanbaru",
    program: "Teknik Komputer dan Jaringan",
    status: "Lulus",
    period: "2021 - 2024",
    achievements: [
      "Lulusan Terbaik",
      "Juara 1 Kelas 10",
      "Juara 2 Kelas 11",
      "Juara 3 Kelas 12",
    ],
  },
];

// ============================================================
// EXPERIENCE — Organisasi, Kepanitiaan, Profesional, Testing
// ============================================================
export interface Experience {
  organization: string;
  role: string;
  period: string;
  category: "organization" | "committee" | "professional" | "testing" | "lab";
  description?: string;
  event?: string;
  website?: string;
}

export const experiences: Experience[] = [
  // === Organisasi ===
  {
    organization: "HIMPTEKA UMRI",
    role: "Wakil Bupati",
    period: "2025 - 2026",
    category: "organization",
  },
  {
    organization: "HIMPTEKA UMRI",
    role: "Anggota KOMINFO",
    period: "2024 - 2025",
    category: "organization",
  },
  // === Kepanitiaan ===
  {
    organization: "Kuliah Umum",
    role: "Ketua Pelaksana",
    period: "2024",
    category: "committee",
    event: "Tantangan dan Peluang Implementasi Artificial Intelligence",
  },
  {
    organization: "E2ID VII",
    role: "Dokumentasi",
    period: "2026",
    category: "committee",
    event: "Electronic Education Innovation Day",
  },
  {
    organization: "MILAD PVTE Ke-8",
    role: "Dokumentasi",
    period: "2026",
    category: "committee",
  },
  // === Profesional ===
  {
    organization: "Pranala Institute",
    role: "Creative Communication & Digital Branding",
    period: "2026 - Sekarang",
    category: "professional",
  },
  {
    organization: "Laboratorium Elektronika",
    role: "Asisten Laboratorium",
    period: "2026",
    category: "lab",
  },
  // === Software Testing ===
  {
    organization: "ASUS ROG UI",
    role: "Software Tester & Bug Hunter",
    period: "2024 - 2026",
    category: "testing",
  },
  {
    organization: "Xiaomi HyperOS",
    role: "Software Tester & Bug Hunter",
    period: "2023 - 2025",
    category: "testing",
  },
  {
    organization: "Velotow",
    role: "Software Tester",
    period: "2026",
    category: "testing",
  },
  {
    organization: "War Thunder Mobile",
    role: "Alpha Tester & Bug Hunter",
    period: "2022",
    category: "testing",
  },
  {
    organization: "Modern Warships",
    role: "Alpha Tester & Bug Hunter",
    period: "2020 - 2021",
    category: "testing",
  },
];

// ============================================================
// COMMUNITY SERVICE (PKM)
// ============================================================
export interface CommunityService {
  title: string;
  role: string;
  year: string;
  website?: string;
}

export const communityServices: CommunityService[] = [
  {
    title:
      "Pemberdayaan UMKM Rengginang di Desa Bukit Payung Melalui Teknologi Pengering Berbasis IoT dan Pendampingan Usaha Untuk Kemandirian Ekonomi Berkelanjutan",
    role: "IoT Engineer",
    year: "2025",
  },
  {
    title:
      "Transformasi Digital: Pembuatan dan Pelatihan Pengoperasian Website LAZISMU Kabupaten Kuantan Singingi Sebagai Media Informasi dan Komunikasi",
    role: "Full Stack Web Developer",
    year: "2024",
    website: "https://lazismukuansing.org/",
  },
];

// ============================================================
// RESEARCH
// ============================================================
export interface Research {
  title: string;
  roles: string[];
  year: string;
}

export const researches: Research[] = [
  {
    title:
      "Evaluasi Kinerja Protokol MQTT pada Sistem Penetasan Telur Ayam Kate Berbasis ESP32 untuk Kendali Suhu dan Kelembaban Adaptif",
    roles: ["IoT Engineer", "Mobile Developer"],
    year: "2026",
  },
  {
    title:
      "Development and Validation of an IoT-Based Heart Rate and Oxygen Saturation Monitoring System for Telehealth Applications",
    roles: ["IoT Engineer", "Mobile Developer"],
    year: "2026",
  },
];

// ============================================================
// WEB DEVELOPMENT EXPERIENCE
// ============================================================
export interface WebDevExperience {
  project: string;
  role: string;
  year: string;
  technologies: string[];
  website?: string;
}

export const webDevExperiences: WebDevExperience[] = [
  {
    project: "Website LAZISMU Kuantan Singingi",
    role: "Full Stack Web Developer",
    year: "2024",
    technologies: ["HTML5", "CSS3", "JavaScript", "PHP", "MySQL"],
    website: "https://lazismukuansing.org/",
  },
  {
    project: "Website PVTE UMRI",
    role: "Full Stack Web Developer",
    year: "2026",
    technologies: [
      "React",
      "Vite",
      "Tailwind CSS",
      "Framer Motion",
      "Laravel 12",
      "PHP",
      "MySQL",
    ],
  },
];

// ============================================================
// SKILLS
// ============================================================
export interface SkillCategory {
  category: string;
  icon: string;
  skills: string[];
  color: string;
}

export const skillCategories: SkillCategory[] = [
  {
    category: "Electronics",
    icon: "Cpu",
    skills: [
      "Circuit Design",
      "Electronics Troubleshooting",
      "Sensor Integration",
      "Laboratory Practice",
      "Electrical Measurement",
    ],
    color: "primary",
  },
  {
    category: "Embedded Systems",
    icon: "Microchip",
    skills: ["Arduino Uno", "Arduino Nano", "ESP8266", "ESP32", "STM32"],
    color: "secondary",
  },
  {
    category: "Internet of Things",
    icon: "Wifi",
    skills: [
      "MQTT",
      "Blynk",
      "Remote Monitoring",
      "Smart Automation",
      "Sensor Monitoring",
    ],
    color: "accent",
  },
  {
    category: "Programming Languages",
    icon: "Code2",
    skills: ["C++", "PHP", "JavaScript", "Python", "Dart", "SQL"],
    color: "research",
  },
  {
    category: "Web Development",
    icon: "Globe",
    skills: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "React",
      "Vite",
      "Tailwind CSS",
      "Laravel",
      "MySQL",
    ],
    color: "primary",
  },
  {
    category: "Mobile Development",
    icon: "Smartphone",
    skills: ["Flutter (Learning)", "Firebase (Learning)", "MIT App Inventor"],
    color: "secondary",
  },
  {
    category: "Testing & QA",
    icon: "Bug",
    skills: [
      "Software Testing",
      "UI Testing",
      "Bug Hunting",
      "User Experience Testing",
    ],
    color: "accent",
  },
  {
    category: "Design & Media",
    icon: "Camera",
    skills: ["Photography", "Videography", "Documentation"],
    color: "research",
  },
];

// ============================================================
// FEATURED PROJECTS
// ============================================================
export interface FeaturedProject {
  name: string;
  status: "Completed" | "On Going";
  technologies: string[];
  category: "iot" | "web" | "embedded" | "ai" | "electronics";
}

export const featuredProjects: FeaturedProject[] = [
  {
    name: "IoT Egg Incubator MQTT",
    status: "Completed",
    technologies: ["ESP32", "MQTT", "DHT22", "OLED", "LED Matrix", "Relay", "Blynk"],
    category: "iot",
  },
  {
    name: "Air Quality Monitoring System",
    status: "Completed",
    technologies: ["ESP32", "DHT11", "MQ135", "OLED", "Blynk"],
    category: "iot",
  },
  {
    name: "Smart Home IoT",
    status: "Completed",
    technologies: ["ESP32", "Relay", "Mobile Control"],
    category: "iot",
  },
  {
    name: "Website LAZISMU Kuansing",
    status: "Completed",
    technologies: ["PHP", "MySQL", "JavaScript"],
    category: "web",
  },
  {
    name: "Industrial Machine Safety System",
    status: "Completed",
    technologies: ["Arduino Nano", "Ultrasonic Sensor", "DHT11", "LCD"],
    category: "electronics",
  },
  {
    name: "Website PVTE UMRI",
    status: "On Going",
    technologies: ["React", "Laravel 12", "Tailwind CSS", "Framer Motion"],
    category: "web",
  },
  {
    name: "Drone STM32",
    status: "On Going",
    technologies: ["STM32", "Gyroscope", "Embedded Programming"],
    category: "embedded",
  },
  {
    name: "Zhy AI",
    status: "On Going",
    technologies: ["Artificial Intelligence"],
    category: "ai",
  },
];

// ============================================================
// ALL PROJECTS
// ============================================================
export interface ProjectItem {
  name: string;
  tech: string;
  status: "Completed" | "On Going";
}

export const allProjects: ProjectItem[] = [
  { name: "Running Text Display", tech: "Arduino Uno + LED Matrix", status: "Completed" },
  { name: "Robot Tank WiFi ESP8266", tech: "ESP8266", status: "Completed" },
  { name: "Robot Arm", tech: "Arduino Uno + Servo", status: "Completed" },
  { name: "Robot WiFi Car ESP32", tech: "ESP32 + Mobile App", status: "Completed" },
  { name: "Automatic Plant Watering System", tech: "Arduino + Soil Moisture Sensor", status: "Completed" },
  { name: "Smart Reminder", tech: "Arduino / ESP8266", status: "Completed" },
  { name: "Automatic Egg Incubator", tech: "Arduino Uno", status: "Completed" },
  { name: "IoT Egg Incubator MQTT", tech: "ESP32", status: "Completed" },
  { name: "Air Quality Monitoring System", tech: "ESP32", status: "Completed" },
  { name: "Industrial Machine Safety System", tech: "Arduino Nano", status: "Completed" },
  { name: "Smart Home IoT", tech: "ESP32", status: "Completed" },
  { name: "Early Fire Detection System", tech: "ESP32", status: "Completed" },
  { name: "Solar Tracking System", tech: "ESP32", status: "Completed" },
  { name: "Mini Radar Detection", tech: "Arduino + Ultrasonic", status: "Completed" },
  { name: "Academic Information Dashboard", tech: "HTML + CSS + MySQL", status: "Completed" },
  { name: "Website LAZISMU Kuansing", tech: "PHP + MySQL", status: "Completed" },
  { name: "Website PVTE UMRI", tech: "React + Laravel", status: "On Going" },
  { name: "Drone STM32", tech: "STM32", status: "On Going" },
  { name: "Zhy AI", tech: "AI", status: "On Going" },
];

// ============================================================
// ACHIEVEMENTS
// ============================================================
export interface Achievement {
  title: string;
  event: string;
  organizer: string;
  year: string;
}

export const achievements: Achievement[] = [
  {
    title: "Juara 3",
    event: "Economic and Social Festival",
    organizer:
      "Dewan Eksekutif Mahasiswa Fakultas Ekonomi dan Ilmu Sosial UIN SUSKA Riau",
    year: "2025",
  },
  {
    title: "Finalis Top 10 Essay",
    event: "Economic and Social Festival",
    organizer:
      "Dewan Eksekutif Mahasiswa Fakultas Ekonomi dan Ilmu Sosial UIN SUSKA Riau",
    year: "2025",
  },
];

// ============================================================
// PLACEHOLDERS — Data belum tersedia
// ============================================================
export const certificates = {
  status: "Coming Soon",
  futureContent: [
    "Technical Certifications",
    "Workshop Certifications",
    "Competition Certifications",
    "Research Certifications",
  ],
};

export const publications = {
  status: "Coming Soon",
};

export const projectGallery = {
  status: "Coming Soon",
  futureContent: [
    "Project Photos",
    "Wiring Diagrams",
    "PCB Designs",
    "Prototype Documentation",
    "Project Videos",
  ],
};

// ============================================================
// NAVIGATION
// ============================================================
export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Education", href: "#education" },
  { label: "Experience", href: "#experience" },
  { label: "Research", href: "#research" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
] as const;

// ============================================================
// FOOTER
// ============================================================
export const footerData = {
  builtWith: "Built with Next.js, TypeScript, Tailwind CSS, GSAP, Lenis, and Vercel.",
  credit: "Designed and developed by Muhammad Rehan.",
  asciiSignature: "REHAN",
};
