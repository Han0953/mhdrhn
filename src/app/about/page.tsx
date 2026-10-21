import type { Metadata } from "next";
import { MediaImage } from "@/components/media/MediaImage";
import { mediaAssets } from "@/lib/media";
import { TechnologyShowcase } from "@/components/sections/TechnologyShowcase";
import { TechnologyLogoGrid } from "@/components/sections/TechnologyLogoGrid";
import { EducationRecords } from "@/components/sections/EducationRecords";
import { PageHeading, Arrow } from "@/components/ui/Editorial";
import { SiteLink } from "@/components/layout/RouteTransition";
import { hobbies, interests, skillGroups } from "@/lib/portfolio";
export const metadata: Metadata = { title: "Tentang Muhammad Rehan", description: "Kenali Muhammad Rehan melalui latar pendidikan, minat, dan perjalanan belajarnya. Profil personal beserta keterampilan yang dikembangkan melalui praktik." };
export default function About() {
  return <div className="wrap"><PageHeading eyebrow="Tentang / Muhammad Rehan">Mengenal<br/>Muhammad Rehan</PageHeading>
    <section className="about-intro"><div className="reading"><p className="intro-copy">Saya Muhammad Rehan. Bagi saya, belajar teknologi terasa lebih dekat ketika bisa dicoba dan dikerjakan secara langsung.</p><p>Saya menempuh pendidikan Teknik Komputer dan Jaringan di SMKS Bina Profesi Pekanbaru sebelum melanjutkan studi S1 Pendidikan Vokasional Teknik Elektronika di Universitas Muhammadiyah Riau. Latar ini menjadi bekal untuk mendalami cara kerja perangkat dan perangkat lunak, sekaligus mencari kesempatan untuk menerapkan apa yang saya pelajari.</p><p>Proyek dan kegiatan di luar kelas memberi saya ruang untuk belajar bekerja secara mandiri maupun bersama tim. Dari pengalaman itu, saya memahami bahwa mengembangkan kemampuan juga membutuhkan ketelitian, komunikasi, dan kemauan untuk memperbaiki hasil. Saya ingin terus belajar dengan tetap terbuka pada hal baru.</p><SiteLink href="/experience" className="text-link">Telusuri pengalaman <Arrow/></SiteLink></div><figure className="portrait"><MediaImage media={mediaAssets.portrait} sizes="(min-width: 1024px) 38vw, (min-width: 768px) 45vw, 90vw" fallback={<span className="portrait-fallback" role="img" aria-label="Foto Muhammad Rehan belum dapat dimuat"><span aria-hidden="true">MR</span><span>Foto belum dapat dimuat.</span></span>}/><figcaption>Muhammad Rehan · Pekanbaru, Riau</figcaption></figure></section>
    <section className="section about-education" aria-labelledby="education-heading"><p className="eyebrow accent">Learning path</p><h2 id="education-heading">Pendidikan.</h2><EducationRecords/><SiteLink href="/achievements#education-achievements" className="text-link">Pencapaian semasa sekolah <Arrow/></SiteLink></section>
    <section className="section" aria-labelledby="interests-heading"><p className="eyebrow accent">Interests & everyday practice</p><h2 id="interests-heading">Minat & keseharian.</h2><div className="interest-columns"><div><h3>Minat.</h3><ul className="plain-list">{interests.map(interest => <li key={interest}>{interest}</li>)}</ul></div><div><h3>Kegiatan lain.</h3><ul className="plain-list">{hobbies.map(hobby => <li key={hobby}>{hobby}</li>)}</ul><SiteLink href="/lab" className="text-link">Penelitian & pengabdian <Arrow/></SiteLink></div></div></section>
    <section className="section about-skills" aria-labelledby="skills-heading">
      <p className="eyebrow accent">Skills & technologies</p><h2 id="skills-heading">Teknologi &amp;<br/>kemampuan.</h2>
      <TechnologyLogoGrid/>
      <h3 className="inventory-heading">Bidang yang saya tekuni.</h3>
      <nav className="section-jumps" aria-label="Kategori kompetensi">{skillGroups.map(group => <a key={group.id} href={`#skills-${group.id}`}>{group.title}</a>)}</nav>
      <div className="skill-groups">{skillGroups.map(group => <article key={group.id} id={`skills-${group.id}`} className="skill-group"><h3>{group.title}</h3><p>{group.description}</p>{group.projectSlug && <SiteLink href={`/projects/${group.projectSlug}`} className="text-link">{group.projectLabel} <Arrow/></SiteLink>}</article>)}</div>
      <details className="technology-context"><summary>Penerapan dalam proyek &amp; kegiatan</summary><TechnologyShowcase/></details>
    </section>
  </div>;
}
