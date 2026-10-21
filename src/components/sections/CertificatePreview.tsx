import { FileCheck2 } from "lucide-react";
import { certificateCategories } from "@/lib/home-content";
import { certificates } from "@/lib/media";
import { MediaGallery } from "@/components/media/MediaGallery";

const certificateDescriptions: Record<typeof certificateCategories[number], string> = {
  AI: "Pembelajaran seputar kecerdasan buatan dan penerapannya.",
  Organisasi: "Kegiatan kemahasiswaan, kepanitiaan, dan pengembangan organisasi.",
  AWS: "Pembelajaran layanan dan teknologi cloud AWS.",
};

export function CertificatePreview() {
  return <div className="certificate-preview">
    <p className="section-note">Sertifikat menjadi dokumentasi atas kesempatan belajar dan kegiatan yang saya ikuti.</p>
    <div className="certificate-collection">{certificateCategories.map(category => <section key={category} data-certificate-category={category} className="certificate-group">
      <div className="certificate-group-heading"><FileCheck2 size={26} strokeWidth={1.5} aria-hidden="true"/><h3>{category}</h3><p>{certificateDescriptions[category]}</p></div>
      {certificates.filter(certificate => certificate.category === category).map(certificate => <article className="certificate-record" key={certificate.id} data-certificate-id={certificate.id}>
        <MediaGallery items={[certificate.media]} label={certificate.title} sizes="(max-width: 767px) 100vw, 33vw" compact/>
        <h4>{certificate.title}</h4><p>{certificate.issuer}</p><p className="meta">Diterbitkan {certificate.issued}{certificate.expires && ` · Berlaku sampai ${certificate.expires}`}</p>
        {certificate.credentialId && <p className="meta">Nomor sertifikat: {certificate.credentialId}</p>}
        {certificate.verificationUrl && <a className="text-link" href={certificate.verificationUrl} rel="noopener noreferrer" target="_blank">Verifikasi sertifikat</a>}
      </article>)}
      {!certificates.some(certificate => certificate.category === category) && <p className="meta certificate-empty">Dokumen belum tersedia</p>}
    </section>)}</div>
  </div>;
}
