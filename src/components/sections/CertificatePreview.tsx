import { FileCheck2 } from "lucide-react";
import { certificateCategories } from "@/lib/home-content";

const certificateDescriptions: Record<typeof certificateCategories[number], string> = {
  AI: "Pembelajaran seputar kecerdasan buatan dan penerapannya.",
  Organisasi: "Kegiatan kemahasiswaan, kepanitiaan, dan pengembangan organisasi.",
  AWS: "Pembelajaran layanan dan teknologi cloud AWS.",
};

export function CertificatePreview() {
  return <div className="certificate-preview">
    <p className="section-note">Sertifikat menjadi dokumentasi atas kesempatan belajar dan kegiatan yang saya ikuti. Saat ini belum ada dokumen yang dapat ditampilkan.</p>
    <ul className="certificate-categories">{certificateCategories.map(category => <li key={category} data-certificate-category={category}>
      <FileCheck2 size={26} strokeWidth={1.5} aria-hidden="true"/><h3>{category}</h3><p className="meta">Dokumen belum tersedia</p><p>{certificateDescriptions[category]}</p>
    </li>)}</ul>
    <p className="meta">Nama pelatihan, penerbit, dan tanggal akan menyertai setiap dokumen yang ditampilkan.</p>
  </div>;
}
