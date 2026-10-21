import type { Metadata } from "next";
import { PageHeading, Arrow } from "@/components/ui/Editorial";
import { SiteLink } from "@/components/layout/RouteTransition";
import { getProjectBySlug } from "@/lib/content";
import { educationAchievements, featuredAchievements, festivalAchievements } from "@/lib/achievement-records";
import { CertificatePreview } from "@/components/sections/CertificatePreview";
import { getAchievementMedia } from "@/lib/media";
import { MediaGallery } from "@/components/media/MediaGallery";
export const metadata: Metadata = { title: "Pencapaian", description: "Pencapaian Muhammad Rehan sebagai bagian dari perjalanan belajar dan berkarya. Kenali hasil yang diraih beserta kegiatan serta latar belakangnya." };
export default function Achievements() {
  return <div className="wrap">
    <PageHeading eyebrow="Achievements" description="Saya melihat pencapaian sebagai bagian dari proses belajar dan berkarya. Pengakuan yang diterima juga menjadi kesempatan untuk menghargai usaha serta dukungan orang-orang yang terlibat.">Pencapaian<br/>saya</PageHeading>
    <p className="section-note">Telusuri pencapaian beserta kegiatan dan latar belakangnya.</p>
    <nav className="section-jumps" aria-label="Arsip pencapaian"><a href="#featured-achievements">Karya tim</a><a href="#festival-achievements">Jejak kompetisi</a><a href="#education-achievements">Pencapaian pendidikan</a><a href="#certificates">Sertifikat</a></nav>
    <section className="section awards" id="featured-achievements" aria-labelledby="team-awards-heading">
      <p className="eyebrow accent">01 / Team recognition</p><h2 id="team-awards-heading">Karya tim.</h2>
      {featuredAchievements.map(award => <article className="award-row" key={award.id} data-achievement-id={award.id}>
        <div><p className="award-result">{award.result}</p><p className="meta">{award.additional}</p></div>
        <div><h3>{getProjectBySlug(award.projectSlug)?.title}</h3><p>{award.event}</p><p className="meta">Kategori: {award.category}</p><p className="meta">Penghargaan tim · {award.team}</p><p className="meta">Ajang: {award.organizer}</p><MediaGallery items={getAchievementMedia(award.id)} label={`Sertifikat ${award.event}`} compact/><div className="actions"><SiteLink href={`/projects/${award.projectSlug}`} className="text-link">Jelajahi proyek <Arrow/></SiteLink><a href={award.source} className="text-link" target="_blank" rel="noopener noreferrer">Baca liputan <Arrow/></a></div></div>
        <span className="meta">{award.year}</span>
      </article>)}
    </section>
    <section className="section" id="festival-achievements" aria-labelledby="festival-awards-heading">
      <p className="eyebrow accent">02 / Festival archive</p><h2 id="festival-awards-heading">Jejak kompetisi.</h2>
      {festivalAchievements.map(award => <article className="award-row" key={award.id} data-achievement-id={award.id}><div>{award.outcomes.map(outcome => <p key={outcome} className="award-result">{outcome}</p>)}</div><div><h3>{award.event}</h3><p>{award.organizer}</p><MediaGallery items={getAchievementMedia(award.id)} label={award.event} compact/><p className="meta">{award.evidence}</p></div><span className="meta">{award.year}</span></article>)}
    </section>
    <section className="section" id="education-achievements" aria-labelledby="education-awards-heading">
      <p className="eyebrow accent">03 / Education archive</p><h2 id="education-awards-heading">Dari ruang kelas.</h2>
      <p className="section-note">Catatan pencapaian yang menyertai perjalanan pendidikan saya.</p>
      {educationAchievements.map((award, index) => <article className="education-award" key={award.id} data-achievement-id={award.id}><span className="eyebrow accent">0{index + 1}</span><div><h3>{award.result}</h3><p>{award.context}</p></div><span className="meta">Periode sekolah<br/>{award.period}</span></article>)}
      <SiteLink className="text-link" href="/about">Pendidikan & kemampuan <Arrow/></SiteLink>
    </section>
    <section className="section" id="certificates" aria-labelledby="certificate-archive-heading"><p className="eyebrow accent">04 / Certificates</p><h2 id="certificate-archive-heading">Arsip sertifikat.</h2><CertificatePreview/></section>
  </div>;
}
