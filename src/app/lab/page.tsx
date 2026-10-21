import type { Metadata } from "next";
import { PageHeading, Arrow } from "@/components/ui/Editorial";
import { SiteLink } from "@/components/layout/RouteTransition";
import { communityService, research, type LabRecord } from "@/lib/portfolio";
import { getProjectBySlug } from "@/lib/content";
import { getProjectMedia } from "@/lib/media";
import { MediaGallery } from "@/components/media/MediaGallery";
export const metadata: Metadata = { title: "Lab & Riset", description: "Ruang penelitian dan praktik Muhammad Rehan. Kenali pertanyaan yang dipelajari, pendekatan yang dicoba, serta perkembangan yang dibagikan." };
function LabEntry({ record }: { record: LabRecord }) {
  return <article className="timeline-row" id={record.id}><div className="meta"><p>{record.year}</p>{record.role && <p>{record.role}</p>}</div><div><h3>{record.title}</h3><p>{record.summary}</p>{record.projectSlug && <MediaGallery items={getProjectMedia(record.projectSlug)} label={`Dokumentasi ${getProjectBySlug(record.projectSlug)?.title ?? "kegiatan"}`} compact/>}<details className="context-disclosure"><summary>Perkembangan &amp; dokumentasi</summary><p>{record.note}</p></details>{record.projectSlug && <SiteLink href={`/projects/${record.projectSlug}`} className="text-link">Lihat proyek terkait <Arrow/></SiteLink>}</div></article>;
}
export default function Lab() {
  const experiment = getProjectBySlug("iot-egg-incubator-blynk")!;
  return <div className="wrap"><PageHeading eyebrow="Lab & Research" description="Mencoba dan menguji membantu saya memahami hal yang belum saya ketahui. Di sini saya membagikan proses belajar melalui penelitian dan praktik, beserta perkembangan yang dapat didokumentasikan.">Penelitian<br/>dan praktik</PageHeading>
    <nav className="section-jumps" aria-label="Kelompok Lab"><a href="#research">Penelitian</a><a href="#experiments">Eksperimen</a><a href="#community">Pengabdian masyarakat</a></nav>
    <section className="section lab-records" id="research" aria-labelledby="research-heading"><p className="eyebrow accent">01 / Research</p><h2 id="research-heading">Penelitian.</h2><p className="section-note">Penelitian memberi ruang untuk mendalami pertanyaan dan menelaahnya dengan lebih terarah. Perkembangan, hasil, dan publikasi dibagikan sesuai informasi yang tersedia.</p>{research.map(record => <LabEntry key={record.id} record={record}/>)}</section>
    <section className="section lab-records" id="experiments" aria-labelledby="experiments-heading"><p className="eyebrow accent">02 / Experiments</p><h2 id="experiments-heading">Eksperimen perangkat.</h2><div className="timeline-row"><span className="meta">IoT · Blynk</span><div><h3>{experiment.title}</h3><p>{experiment.summary}</p><MediaGallery items={getProjectMedia(experiment.slug)} label={`Dokumentasi ${experiment.title}`} compact/><p className="meta section-note">Versi ini menggunakan Blynk dan tombol fisik, berbeda dari inkubator penelitian MQTT. Rincian perangkat dan tahap penyelesaiannya belum tersedia.</p><SiteLink href={`/projects/${experiment.slug}`} className="text-link">Jelajahi proyek <Arrow/></SiteLink></div></div><SiteLink href="/projects?category=Embedded" className="text-link">Proyek embedded lainnya <Arrow/></SiteLink></section>
    <section className="section lab-records" id="community" aria-labelledby="community-heading"><p className="eyebrow accent">03 / Community service</p><h2 id="community-heading">Pengabdian<br/>masyarakat.</h2>{communityService.map(record => <LabEntry key={record.id} record={record}/>)}</section>
  </div>;
}
