import type { Metadata } from "next";
import { PageHeading, Arrow } from "@/components/ui/Editorial";
import { SiteLink } from "@/components/layout/RouteTransition";
import { communityService, research, type LabRecord } from "@/lib/portfolio";
import { getProjectBySlug } from "@/lib/content";
export const metadata: Metadata = { title: "Lab & Research", description: "Catatan penelitian, eksperimen IoT, dan pengabdian kepada masyarakat." };
function LabEntry({ record }: { record: LabRecord }) {
  return <article className="timeline-row" id={record.id}><div className="meta"><p>{record.year}</p>{record.role && <p>{record.role}</p>}</div><div><h3>{record.title}</h3><p>{record.summary}</p><details className="context-disclosure"><summary>Status & batas catatan</summary><p>{record.note}</p></details>{record.projectSlug && <SiteLink href={`/projects/${record.projectSlug}`} className="text-link">Lihat proyek terkait <Arrow/></SiteLink>}</div></article>;
}
export default function Lab() {
  const experiment = getProjectBySlug("iot-egg-incubator-blynk")!;
  return <div className="wrap"><PageHeading eyebrow="Lab & Research" description="Ruang untuk mencoba, mengamati, dan menyusun pertanyaan berikutnya.">Pertanyaan yang<br/>layak dicoba</PageHeading>
    <nav className="section-jumps" aria-label="Kelompok Lab"><a href="#research">Penelitian</a><a href="#experiments">Eksperimen</a><a href="#community">Pengabdian masyarakat</a></nav>
    <section className="section lab-records" id="research" aria-labelledby="research-heading"><p className="eyebrow accent">01 / Research</p><h2 id="research-heading">Penelitian.</h2><p className="section-note">Catatan penelitian tidak otomatis berarti artikel ilmiah telah terbit atau hasil pengujian sudah tervalidasi.</p>{research.map(record => <LabEntry key={record.id} record={record}/>)}</section>
    <section className="section lab-records" id="experiments" aria-labelledby="experiments-heading"><p className="eyebrow accent">02 / Experiments</p><h2 id="experiments-heading">Interaksi dengan benda.</h2><div className="timeline-row"><span className="meta">IoT · Blynk</span><div><h3>{experiment.title}</h3><p>{experiment.summary}</p><p className="meta section-note">Proyek ini berbeda dari inkubator penelitian MQTT. Status penyelesaian dan rincian perangkat belum dipublikasikan.</p><SiteLink href={`/projects/${experiment.slug}`} className="text-link">Lihat ringkasan <Arrow/></SiteLink></div></div><SiteLink href="/projects?category=Embedded" className="text-link">Jelajahi arsip embedded <Arrow/></SiteLink></section>
    <section className="section lab-records" id="community" aria-labelledby="community-heading"><p className="eyebrow accent">03 / Community service</p><h2 id="community-heading">Teknologi bertemu<br/>keseharian.</h2>{communityService.map(record => <LabEntry key={record.id} record={record}/>)}</section>
  </div>;
}
