import { HeroSection } from "@/components/sections/HeroSection";
import { TechnologyLogoGrid } from "@/components/sections/TechnologyLogoGrid";
import { ProjectStory } from "@/components/sections/ProjectStory";
import { CertificatePreview } from "@/components/sections/CertificatePreview";
import { EditorialEntrance } from "@/components/effects/EditorialEntrance";
import { SiteLink } from "@/components/layout/RouteTransition";
import { Arrow } from "@/components/ui/Editorial";
import { experienceHighlights, focusAreas, profile } from "@/lib/content";
import { electronicsProjects, homeAchievements, latestOrderingNote, latestProjects } from "@/lib/home-content";

export default function Home() {
  return <div className="wrap home-page">
    <HeroSection/>
    <section className="section home-introduction" data-home-section="introduction" aria-labelledby="intro-heading">
      <p className="eyebrow accent">02 / Introduction</p>
      <EditorialEntrance><h2 id="intro-heading">Benda punya sinyal.<br/>Kode memberinya<br/><span className="accent">kemungkinan.</span></h2></EditorialEntrance>
      <div className="intro-aside"><p>{profile.bio}</p><ul className="home-domain-list" aria-label="Bidang eksplorasi">{focusAreas.map(area => <li key={area.title}>{area.title}</li>)}</ul><SiteLink href="/about" className="text-link">Kenali Rehan <Arrow/></SiteLink></div>
    </section>
    <section className="section home-technologies" data-home-section="technology" aria-labelledby="technology-heading">
      <div className="section-heading"><div><p className="eyebrow accent">03 / Technology & capabilities</p><h2 id="technology-heading">Perangkat berpikir.<br/>Alat untuk berkarya.</h2></div></div>
      <TechnologyLogoGrid/>
    </section>
    <ProjectStory id="latest" number="04" title="Karya, dari waktu ke waktu." intro={latestOrderingNote} projects={latestProjects} href="/projects" linkLabel="Seluruh proyek"/>
    <ProjectStory id="electronics" number="05" title="Dari rangkaian ke kemungkinan." intro="Lima pilihan lain dari elektronika, embedded, dan IoT. Inkubator Blynk memakai kontrol lokal; berbeda dari inkubator penelitian MQTT di koleksi sebelumnya. Pilihan ini bukan urutan waktu." projects={electronicsProjects} href="/lab" linkLabel="Lab & Research"/>
    <section className="section home-experience" data-home-section="experience" aria-labelledby="experience-heading">
      <div className="section-heading"><div><p className="eyebrow accent">06 / Experience highlights</p><h2 id="experience-heading">Belajar lewat<br/>keterlibatan.</h2></div><SiteLink href="/experience" className="text-link">Seluruh pengalaman <Arrow/></SiteLink></div>
      <div className="home-experience-list">{experienceHighlights.map(item => <article className="timeline-row" key={`${item.role}-${item.organization}`}><span className="meta">{item.period}</span><div><h3>{item.role}</h3><p>{item.organization}</p></div></article>)}</div>
    </section>
    <section className="section home-recognition" data-home-section="recognition" aria-labelledby="recognition-heading">
      <div className="section-heading"><div><p className="eyebrow accent">07 / Recognition</p><h2 id="recognition-heading">Hasil bersama.<br/>Jejak belajar.</h2></div><SiteLink href="/achievements" className="text-link">Seluruh pencapaian <Arrow/></SiteLink></div>
      <p className="section-note">Lima hasil dari tiga ajang. AURA POD meraih dua penghargaan pada ajang yang sama. Dua hasil ESF ditampilkan tanpa mengasumsikan hubungan kategori atau tahap lomba.</p>
      <ol className="home-achievement-list">{homeAchievements.map(award => <li key={award.id} data-home-achievement={award.id}><span className="meta">{award.year}</span><div><h3>{award.result}</h3><p>{award.event}</p><p className="meta">{award.context}</p></div><SiteLink className="text-link" href={award.href} aria-label={`Lihat konteks ${award.result} — ${award.event}`}>Konteks <Arrow/></SiteLink></li>)}</ol>
    </section>
    <section className="section home-certificates" data-home-section="certificates" aria-labelledby="certificates-heading">
      <div className="section-heading"><div><p className="eyebrow accent">08 / Certificates</p><h2 id="certificates-heading">Ruang untuk<br/>rekam belajar.</h2></div><SiteLink href="/achievements#certificates" className="text-link">Arsip sertifikat <Arrow/></SiteLink></div>
      <CertificatePreview/>
    </section>
    <section className="section home-closing" data-home-section="closing" aria-labelledby="closing-heading">
      <p className="eyebrow">09 / The next conversation</p>
      <EditorialEntrance><h2 id="closing-heading">Pertanyaan bagus<br/>bisa jadi karya<br/>berikutnya.</h2></EditorialEntrance>
      <div className="closing-bottom"><p>Elektronika, software, atau sesuatu di antaranya. Mari mulai dengan gagasan yang jelas.</p><div className="actions"><SiteLink href="/contact" className="button-primary">Mari terhubung <Arrow/></SiteLink><SiteLink href="/projects" className="text-link">Lihat karya lainnya <Arrow/></SiteLink></div></div>
    </section>
  </div>;
}
