import { serverTranslator } from "@/i18n/server";
import { translateTree } from "@/i18n/translate";
import { type Locale } from "@/i18n/config";
import { certificates } from "@/lib/media";
import { MediaGallery } from "@/components/media/MediaGallery";
import { SiteLink } from "@/components/layout/RouteTransition";
import { Arrow } from "@/components/ui/Editorial";
import { AnimatedDetails } from "@/components/motion/AnimatedDetails";

export function CertificatePreview({ locale="id", preview = false }: { locale?:Locale; preview?: boolean }) {
  const t=serverTranslator(locale);
  const records = certificates.filter(certificate => certificate.media.publication === "PUBLIC");
  if (preview) return translateTree(<ol className="certificate-title-list">{records.map(certificate => <li key={certificate.id} data-certificate-id={certificate.id}>
    <AnimatedDetails className="certificate-disclosure" summary={<h3>{certificate.title}</h3>}>
      <div className="certificate-description"><p>{certificate.description}</p><SiteLink className="text-link" href={`/achievements#certificate-${certificate.id}`}>Lihat sertifikat <Arrow/></SiteLink></div>
    </AnimatedDetails>
  </li>)}</ol>,t,locale);
  return translateTree(<div className="certificate-preview">
    <p className="section-note">Sertifikat menjadi dokumentasi atas kesempatan belajar dan kegiatan yang saya ikuti.</p>
    <div className="certificate-collection">{records.map(certificate => <article className="certificate-record" id={`certificate-${certificate.id}`} key={certificate.id} data-certificate-id={certificate.id}>
        <h3>{certificate.title}</h3>
        <MediaGallery items={[certificate.media]} label={certificate.title} sizes="(max-width: 767px) 100vw, 33vw" compact/>
        <p className="certificate-summary">{certificate.description}</p>
        <p>{certificate.issuer}</p><p className="meta">Diterbitkan {certificate.issued}{certificate.expires && ` · Berlaku sampai ${certificate.expires}`}</p>
        {certificate.credentialId && <p className="meta">Nomor sertifikat: {certificate.credentialId}</p>}
        {certificate.verificationUrl && <a className="text-link" href={certificate.verificationUrl} rel="noopener noreferrer" target="_blank">Verifikasi sertifikat</a>}
      </article>)}</div>
  </div>,t,locale);
}
