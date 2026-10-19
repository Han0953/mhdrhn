import type { Metadata } from "next";
import { PageHeading, Arrow } from "@/components/ui/Editorial";
import { SiteLink } from "@/components/layout/RouteTransition";
import { getProjectBySlug } from "@/lib/content";
import { educationAchievements, featuredAchievements, publicAchievementOutcomeCount } from "@/lib/achievement-records";
export const metadata: Metadata = { title: "Achievements", description: "Penghargaan karya tim dan catatan pencapaian pendidikan Muhammad Rehan." };
export default function Achievements() {
  return <div className="wrap">
    <PageHeading eyebrow="Achievements" description="Penghargaan tim dan catatan pendidikan, masing-masing dengan konteks dan asal datanya.">Hasil bersama,<br/>jejak belajar</PageHeading>
    <p className="section-note">{publicAchievementOutcomeCount} capaian publik dalam {featuredAchievements.length + educationAchievements.length} catatan. Juara 1 dan Most Favorite AURA POD berasal dari satu ajang yang sama.</p>
    <nav className="section-jumps" aria-label="Arsip pencapaian"><a href="#featured-achievements">Karya tim · 2026</a><a href="#education-achievements">Catatan pendidikan</a></nav>
    <section className="section awards" id="featured-achievements" aria-labelledby="team-awards-heading">
      <p className="eyebrow accent">01 / Team recognition</p><h2 id="team-awards-heading">Karya tim.</h2>
      {featuredAchievements.map(award => <article className="award-row" key={award.id} data-achievement-id={award.id}>
        <div><p className="award-result">{award.result}</p><p className="meta">{award.additional}</p></div>
        <div><h3>{getProjectBySlug(award.projectSlug)?.title}</h3><p>{award.event}</p><p className="meta">Kategori: {award.category}</p><p className="meta">Penghargaan tim · {award.team}</p><p className="meta">Penyelenggara/ajang: {award.organizer}</p><div className="actions"><SiteLink href={`/projects/${award.projectSlug}`} className="text-link">Lihat karya <Arrow/></SiteLink><a href={award.source} className="text-link" target="_blank" rel="noopener noreferrer">Publikasi <Arrow/></a></div><p className="record-provenance">Sumber data: {award.provenance}. Status: publik.</p></div>
        <span className="meta">{award.year}</span>
      </article>)}
    </section>
    <section className="section" id="education-achievements" aria-labelledby="education-awards-heading">
      <p className="eyebrow accent">02 / Education archive</p><h2 id="education-awards-heading">Dari ruang kelas.</h2>
      <p className="section-note">Catatan pendidikan dari data pemilik portfolio. 2021–2024 adalah periode sekolah, bukan tanggal tiap penghargaan. Sertifikat dan tanggal penghargaan belum dipublikasikan.</p>
      {educationAchievements.map((award, index) => <article className="education-award" key={award.id} data-achievement-id={award.id}><span className="eyebrow accent">0{index + 1}</span><div><h3>{award.result}</h3><p>{award.context}</p><p className="record-provenance">Sumber: catatan pendidikan pemilik. Disetujui untuk publikasi.</p></div><span className="meta">Periode sekolah<br/>{award.period}</span></article>)}
      <SiteLink className="text-link" href="/about">Kembali ke pendidikan & kemampuan <Arrow/></SiteLink>
    </section>
  </div>;
}
