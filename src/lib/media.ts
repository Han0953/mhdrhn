/** Owner-supplied assets, visually inspected. Paths are public URLs, never filesystem paths. */
export interface MediaAsset {
  id: string;
  src: string;
  width: number;
  height: number;
  kind: "screenshot" | "hardware" | "certificate" | "portrait";
  alt: string;
  caption: string;
  publication: "PUBLIC" | "REVIEW";
  credit: string;
}
const asset = (id: string, src: string, width: number, height: number, kind: MediaAsset["kind"], alt: string, caption: string, publication: MediaAsset["publication"] = "PUBLIC"): MediaAsset => ({ id, src, width, height, kind, alt, caption, publication, credit: "Dokumentasi Muhammad Rehan" });
export const mediaAssets = {
  portrait: asset("portrait", "/foto-profile.webp", 1680, 2048, "portrait", "Muhammad Rehan", "Muhammad Rehan · Pekanbaru, Riau"),
  vircuit: asset("vircuit", "/project/web/vircuit.webp", 1919, 971, "screenshot", "Halaman beranda Vircuit dengan antarmuka laboratorium virtual", "Beranda Vircuit."),
  auraDashboard: asset("aura-dashboard", "/project/web/aurapod.webp", 1919, 972, "screenshot", "Dashboard AURA POD dengan panel telemetri dan status perangkat offline", "Tampilan dashboard AURA POD; perangkat berstatus offline pada tangkapan layar ini."),
  auraHardware: asset("aura-hardware", "/project/hardware/aurapod-hardware.webp", 2048, 1536, "hardware", "Prototipe fotobioreaktor AURA POD di samping laptop yang menampilkan dashboard", "Prototipe AURA POD dan tampilan dashboard pendamping."),
  pvte: asset("pvte", "/project/web/web-pvte.webp", 1919, 973, "screenshot", "Beranda website Pendidikan Vokasional Teknik Elektronika UMRI", "Beranda website PVTE UMRI."),
  lazismu: asset("lazismu", "/project/web/lazismu-kuansing.webp", 1919, 973, "screenshot", "Beranda website LAZISMU Kabupaten Kuantan Singingi", "Tampilan website LAZISMU Kuansing."),
  mqtt: asset("incubator-mqtt", "/project/hardware/inkubator-mqtt.webp", 2048, 1536, "hardware", "Rangkaian ESP32, relay, dan layar inkubator penelitian MQTT", "Rangkaian dan layar inkubator penelitian MQTT."),
  blynk: asset("incubator-blynk", "/project/hardware/inkubator-blynk.webp", 2048, 1536, "hardware", "Inkubator Blynk dengan ruang penetasan, layar, dan tombol fisik", "Inkubator Blynk dengan tombol kendali lokal."),
  safety: asset("machine-safety", "/project/hardware/industrial-machine-safety-system.webp", 2048, 1536, "hardware", "Prototipe rangkaian keselamatan mesin dengan sensor dan layar peringatan", "Prototipe rangkaian Industrial Machine Safety System."),
  arm: asset("robot-arm", "/project/hardware/robot-arm.webp", 1536, 2048, "hardware", "Mekanisme lengan robot dan pengendali joystick", "Dokumentasi mekanik dan pengendali Robot Arm."),
  tank: asset("robot-tank", "/project/hardware/robot-tank-wifi-esp8266.webp", 2048, 1536, "hardware", "Prototipe robot tank beroda rantai dengan board ESP8266", "Prototipe Robot Tank WiFi ESP8266."),
  car: asset("robot-car", "/project/hardware/robot-wifi-car-esp32.webp", 1536, 2048, "hardware", "Prototipe robot mobil dengan rangkaian dan kabel pada sasis beroda", "Prototipe Robot WiFi Car ESP32."),
  aiAsean: asset("ai-asean", "/certificate/ai-ready-asean.webp", 997, 708, "certificate", "Certificate of Completion AI Ready ASEAN atas nama Muhammad Rehan", "AI Ready ASEAN · ASEAN Foundation · 17 Juli 2026."),
  gemini: asset("gemini", "/certificate/google-gemini-certified.webp", 1001, 768, "certificate", "Sertifikat Siswa Tersertifikasi Gemini atas nama Muhammad Rehan", "Siswa Tersertifikasi Gemini · Google for Education."),
  fillFeel: asset("fill-feel", "/certificate/google-fill-feel-festival.webp", 1027, 725, "certificate", "Sertifikat apresiasi peserta Google Fill & Feel Festival untuk Muhammad Rehan", "Peserta Google Fill & Feel Festival · 26 Juli 2026."),
  sicheco: asset("sicheco-winner", "/certificate/juara-1-sicheco-bpdc.webp", 1000, 708, "certificate", "Sertifikat 1st Winner BPDC SiCheCo untuk Muhammad Rehan, Alga Nova Team", "Juara 1 BPDC SiCheCo 2026 · ALGA NOVA.", "REVIEW"),
  essayThird: asset("essay-third", "/certificate/juara-3-essay-ecos-fest.webp", 1001, 711, "certificate", "Sertifikat Juara 3 Essay Economic and Social Festival untuk Muhammad Rehan", "Juara 3 Essay · Economic and Social Festival 2025.", "REVIEW"),
  essayFinalist: asset("essay-finalist", "/certificate/finalis-top-10-essay-ecos-fest.webp", 1001, 704, "certificate", "Sertifikat Finalis Top 10 Essay Economic and Social Festival untuk Muhammad Rehan", "Finalis Top 10 Essay · Economic and Social Festival 2025.", "REVIEW"),
} as const satisfies Record<string, MediaAsset>;

/** First asset is the cover; later assets form a gallery. No inferred technical specifications. */
export const projectMedia: Readonly<Record<string, readonly MediaAsset[]>> = {
  vircuit: [mediaAssets.vircuit],
  "aura-pod": [mediaAssets.auraHardware, mediaAssets.auraDashboard],
  "website-pvte-himpteka": [mediaAssets.pvte],
  "website-lazismu-kuansing": [mediaAssets.lazismu],
  "iot-egg-incubator-research": [mediaAssets.mqtt],
  "iot-egg-incubator-blynk": [mediaAssets.blynk],
  "industrial-machine-safety": [mediaAssets.safety],
  "robot-arm": [mediaAssets.arm],
  "robot-tank-wifi-esp8266": [mediaAssets.tank],
  "robot-wifi-car-esp32": [mediaAssets.car],
};
export function getProjectMedia(slug: string): readonly MediaAsset[] {
  return (projectMedia[slug] ?? []).filter(media => media.publication === "PUBLIC");
}
export const achievementMedia: Readonly<Record<string, readonly MediaAsset[]>> = {
  "aura-2026": [mediaAssets.sicheco],
  "esf-2025": [mediaAssets.essayThird, mediaAssets.essayFinalist],
};
export function getAchievementMedia(id: string): readonly MediaAsset[] {
  return (achievementMedia[id] ?? []).filter(media => media.publication === "PUBLIC");
}
export interface CertificateRecord {
  id: string;
  title: string;
  issuer: string;
  category: "AI" | "Organisasi" | "AWS";
  issued: string;
  expires?: string;
  credentialId?: string;
  verificationUrl?: string;
  media: MediaAsset;
}
export const certificates: readonly CertificateRecord[] = [
  { id: "ai-ready-asean", title: "Certificate of Completion — AI Ready ASEAN", issuer: "ASEAN Foundation", category: "AI", issued: "17 Juli 2026", media: mediaAssets.aiAsean },
  { id: "gemini-student", title: "Siswa Tersertifikasi Gemini", issuer: "Google for Education", category: "AI", issued: "03/08/2026", expires: "03/08/2029", media: mediaAssets.gemini },
  { id: "fill-feel-festival", title: "Sertifikat Apresiasi — Google Fill & Feel Festival", issuer: "Panitia Google Fill & Feel Festival", category: "Organisasi", issued: "26 Juli 2026", credentialId: "236/SER-KM/IBTPI/VII/2026", media: mediaAssets.fillFeel },
];
