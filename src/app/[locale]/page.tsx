import { serverTranslator } from "@/i18n/server";
import { translateTree } from "@/i18n/translate";
import { requireLocale } from "@/i18n/config";
import { DisplayLines } from "@/components/motion/DisplayLines";
import { HeroSection } from "@/components/sections/HeroSection";
import { PageMotion } from "@/components/motion/PageMotion";
import { TechnologyLogoGrid } from "@/components/sections/TechnologyLogoGrid";
import { ProjectStory } from "@/components/sections/ProjectStory";
import { CertificatePreview } from "@/components/sections/CertificatePreview";
import { EducationRecords } from "@/components/sections/EducationRecords";
import { EditorialEntrance } from "@/components/effects/EditorialEntrance";
import { SiteLink } from "@/components/layout/RouteTransition";
import { Arrow } from "@/components/ui/Editorial";
import { experienceHighlights, focusAreas, profile } from "@/lib/content";
import { electronicsProjects, homeAchievements, projectSectionIntros, latestProjects } from "@/lib/home-content";

export default async function Home({ params: localeParams }: { params: Promise<{locale:string}> }) {
  const locale=requireLocale((await localeParams).locale); const t=serverTranslator(locale);
  return translateTree(<div className="wrap home-page">
    <PageMotion profile="home"/>
    <HeroSection locale={locale}/>
    <section className="section home-introduction" data-home-section="introduction" aria-labelledby="intro-heading">
      <p className="eyebrow accent">02 / Introduction</p>
      <EditorialEntrance><h2 id="intro-heading"><DisplayLines>Elektronika,<br/>software,<br/><span className="accent">dan riset.</span></DisplayLines></h2></EditorialEntrance>
      <div className="intro-aside"><p>{profile.bio}</p><ul className="home-domain-list" aria-label="Bidang eksplorasi">{focusAreas.map(area => <li key={area.title}>{area.title}</li>)}</ul><SiteLink href="/about" className="text-link">Kenali Rehan <Arrow/></SiteLink></div>
    </section>
    <section className="section home-technologies" data-home-section="technology" aria-labelledby="technology-heading">
      <div className="section-heading"><div><p className="eyebrow accent">03 / Technology & capabilities</p><h2 id="technology-heading">Teknologi &amp;<br/>alat kerja.</h2></div></div>
      <TechnologyLogoGrid locale={locale} preview/>
    </section>
    <ProjectStory locale={locale} id="latest" number="04" title="Proyek terbaru." intro={projectSectionIntros.latest} projects={latestProjects} href="/projects" linkLabel="Seluruh proyek"/>
    <ProjectStory locale={locale} id="electronics" number="05" title="Elektronika & IoT." intro={projectSectionIntros.electronics} projects={electronicsProjects} href="/lab" linkLabel="Lab & Research"/>
    <section className="section home-education" data-home-section="education" aria-labelledby="education-heading">
      <div className="section-heading"><div><p className="eyebrow accent">06 / Education</p><h2 id="education-heading">Riwayat<br/>pendidikan.</h2></div><SiteLink href="/about#education-heading" className="text-link">Pendidikan &amp; profil <Arrow/></SiteLink></div>
      <p className="section-note">Pendidikan menjadi dasar untuk memahami hal baru dan mengembangkan keterampilan. Berikut perjalanan akademik yang saya tempuh.</p>
      <EducationRecords locale={locale}/>
    </section>
    <section className="section home-experience" data-home-section="experience" aria-labelledby="experience-heading">
      <div className="section-heading"><div><p className="eyebrow accent">07 / Experience highlights</p><h2 id="experience-heading">Pengalaman<br/>dan peran.</h2></div><SiteLink href="/experience" className="text-link">Seluruh pengalaman <Arrow/></SiteLink></div>
      <p className="section-note">Pengalaman memberi ruang untuk mengembangkan keterampilan dan belajar bekerja bersama orang lain. Saya merangkum beberapa peran yang ikut membentuk cara saya bekerja.</p>
      <div className="home-experience-list">{experienceHighlights.map(item => <article className="timeline-row" key={`${item.role}-${item.organization}`}><span className="meta home-entry-year">{item.period}</span><div><h3>{item.role}</h3><p>{item.organization}</p></div></article>)}</div>
    </section>
    <section className="section home-recognition" data-home-section="recognition" aria-labelledby="recognition-heading">
      <div className="section-heading"><div><p className="eyebrow accent">08 / Recognition</p><h2 id="recognition-heading">{locale==="en"?"What I have":"Pencapaian"}<br/>yang saya raih.</h2></div><SiteLink href="/achievements" className="text-link">Seluruh pencapaian <Arrow/></SiteLink></div>
      <p className="section-note">Pencapaian menjadi kesempatan untuk melihat kembali proses yang sudah dijalani. Ada usaha pribadi, kerja bersama, dan pelajaran yang saya bawa setelahnya.</p>
      <ol className="home-achievement-list">{homeAchievements.map(award => <li key={award.id} data-home-achievement={award.id}><span className="meta home-entry-year">{award.year}</span><div><h3>{award.result}</h3><p>{award.event}</p><p className="meta">{award.context}</p></div><SiteLink className="text-link" href={award.href} aria-label={`Lihat pencapaian ${award.result} — ${award.event}`}>Lihat pencapaian <Arrow/></SiteLink></li>)}</ol>
    </section>
    <section className="section home-certificates" data-home-section="certificates" aria-labelledby="certificates-heading">
      <div className="section-heading"><div><p className="eyebrow accent">09 / Certificates</p><h2 id="certificates-heading">{locale==="en"?"Learning":"Sertifikat"}<br/>pembelajaran.</h2></div><SiteLink href="/achievements#certificates" className="text-link">Arsip sertifikat <Arrow/></SiteLink></div>
      <CertificatePreview locale={locale} preview/>
    </section>
    <section className="section home-closing" data-home-section="closing" aria-labelledby="closing-heading">
      <p className="eyebrow">10 / The next conversation</p>
      <EditorialEntrance><h2 id="closing-heading"><DisplayLines>Ada gagasan<br/>yang ingin<br/>dibahas?</DisplayLines></h2></EditorialEntrance>
      <div className="closing-bottom"><p>Jika ada karya yang menarik perhatianmu atau topik yang ingin dibicarakan, temukan profil saya di halaman Contact.</p><div className="actions"><SiteLink href="/contact" className="button-primary">Mari terhubung <Arrow/></SiteLink><SiteLink href="/projects" className="text-link">Lihat karya lainnya <Arrow/></SiteLink></div></div>
    </section>
  </div>,t,locale);
}
