import { FileCheck2 } from "lucide-react";
import { certificateCategories } from "@/lib/home-content";

export function CertificatePreview() {
  return <div className="certificate-preview">
    <p className="section-note">Tiga kategori untuk arsip sertifikat. Detail dan dokumennya belum tersedia untuk ditampilkan.</p>
    <ul className="certificate-categories">{certificateCategories.map(category => <li key={category} data-certificate-category={category}>
      <FileCheck2 size={26} strokeWidth={1.5} aria-hidden="true"/><h3>{category}</h3><p className="meta">Metadata belum tersedia</p><p>Nama sertifikat, penerbit, tanggal, dan dokumen belum diberikan.</p>
    </li>)}</ul>
    <p className="meta">Kategori ini belum menyatakan sertifikasi yang telah diraih. Dokumen akan ditampilkan setelah datanya tersedia dan disetujui.</p>
  </div>;
}
