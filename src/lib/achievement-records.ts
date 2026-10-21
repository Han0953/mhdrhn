/** Public records only. Candidate/review reconciliation lives in docs, not this module. */
export const featuredAchievements = [
  { id: "aura-2026", result: "Juara 1", additional: "& Most Favorite", outcomes: ["Juara 1", "Most Favorite"], event: "BPDC · SiCheCo UNSRI", organizer: "Universitas Sriwijaya", category: "Business Product and Design Competition", year: 2026, team: "ALGA NOVA", projectSlug: "aura-pod", publication: "PUBLIC", provenance: "DATA §11.1 / §9.1", source: "https://www.umri.ac.id/artikel/baca/2026-09-30-1790769863-usung-inovasi-dekarbonisasi-industri-mahasiswa-umri-raih-juara-1-dan-most-favorite-sicheco-2026" },
  { id: "vircuit-2026", result: "Juara 3", additional: "Web Development", outcomes: ["Juara 3 Web Development"], event: "FESTRA UNRI", organizer: "FESTRA UNRI", category: "Web Development", year: 2026, team: "Trio Hengker Enjoyer", projectSlug: "vircuit", publication: "PUBLIC", provenance: "DATA §11.2 / §9.2", source: "https://pvte.fkip.umri.ac.id/artikel/baca/mahasiswa-pvte-umri-raih-juara-3-web-development-festra-2026-melalui-inovasi-laboratorium-virtual-berbasis-iot-dan-ai" },
] as const;

/** The education period is not an invented award date. No certificate/media is implied. */
export const educationAchievements = [
  { id: "school-best-graduate", result: "Lulusan Terbaik", context: "Pendidikan SMKS Bina Profesi Pekanbaru", period: "2021–2024", publication: "PUBLIC", provenance: "DATA §2.2; legacy education.achievements[0]" },
  { id: "school-rank-grade-12", result: "Juara 3 Kelas 12", context: "Pendidikan SMKS Bina Profesi Pekanbaru", period: "2021–2024", publication: "PUBLIC", provenance: "DATA §2.2; legacy education.achievements[3]" },
  { id: "school-rank-grade-11", result: "Juara 2 Kelas 11", context: "Pendidikan SMKS Bina Profesi Pekanbaru", period: "2021–2024", publication: "PUBLIC", provenance: "DATA §2.2; legacy education.achievements[2]" },
  { id: "school-rank-grade-10", result: "Juara 1 Kelas 10", context: "Pendidikan SMKS Bina Profesi Pekanbaru", period: "2021–2024", publication: "PUBLIC", provenance: "DATA §2.2; legacy education.achievements[1]" },
] as const;

// Owner confirmed both outcomes. Category/round relationships remain unspecified.
export const festivalAchievements = [{
  id: "esf-2025", event: "Economic and Social Festival", year: 2025,
  organizer: "Dewan Eksekutif Mahasiswa Fakultas Ekonomi dan Ilmu Sosial UIN SUSKA Riau",
  outcomes: ["Juara 3", "Finalis Top 10 Essay"], publication: "PUBLIC",
  provenance: "DATA §11.3 · konfirmasi pemilik, 19 Oktober 2026",
  evidence: "Dokumen sedang ditinjau untuk publikasi.",
}] as const;
export const publicAchievementOutcomeCount = featuredAchievements.reduce((count, record) => count + record.outcomes.length, 0) + educationAchievements.length + festivalAchievements.reduce((count, record) => count + record.outcomes.length, 0);
