import { certificates } from "@/lib/media";
import { MediaGallery } from "@/components/media/MediaGallery";
import { SiteLink } from "@/components/layout/RouteTransition";
import { Arrow } from "@/components/ui/Editorial";
import { ChevronDown } from "lucide-react";

export function CertificatePreview({ preview = false }: { preview?: boolean }) {
  const records = certificates.filter(certificate => certificate.media.publication === "PUBLIC");
  if (preview) return <ol className="certificate-title-list">{records.map(certificate => <li key={certificate.id} data-certificate-id={certificate.id}>
    <details><summary><h3>{certificate.title}<ChevronDown size={20} aria-hidden="true"/></h3></summary>
      <div className="certificate-description"><p>{certificate.description}</p><SiteLink className="text-link" href={`/achievements#certificate-${certificate.id}`}>Lihat sertifikat <Arrow/></SiteLink></div>
    </details>
  </li>)}</ol>;
  return <div className="certificate-preview">
    <p className="section-note">Sertifikat menjadi dokumentasi atas kesempatan belajar dan kegiatan yang saya ikuti.</p>
    <div className="certificate-collection">{records.map(certificate => <article className="certificate-record" id={`certificate-${certificate.id}`} key={certificate.id} data-certificate-id={certificate.id}>
        <h3>{certificate.title}</h3>
        <MediaGallery items={[certificate.media]} label={certificate.title} sizes="(max-width: 767px) 100vw, 33vw" compact/>
        <p className="certificate-summary">{certificate.description}</p>
        <p>{certificate.issuer}</p><p className="meta">Diterbitkan {certificate.issued}{certificate.expires && ` · Berlaku sampai ${certificate.expires}`}</p>
        {certificate.credentialId && <p className="meta">Nomor sertifikat: {certificate.credentialId}</p>}
        {certificate.verificationUrl && <a className="text-link" href={certificate.verificationUrl} rel="noopener noreferrer" target="_blank">Verifikasi sertifikat</a>}
      </article>)}</div>
  </div>;
}
