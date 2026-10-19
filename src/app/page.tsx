import { HeroSection } from "@/components/sections/HeroSection";
import { SignalDiagram } from "@/components/sections/SignalDiagram";
import { EditorialEntrance } from "@/components/effects/EditorialEntrance";
import { SiteLink } from "@/components/layout/RouteTransition";
import { Arrow, ProjectSpread } from "@/components/ui/Editorial";
import { achievements, engineeringSteps, experienceHighlights, focusAreas, getFeaturedProjects, getProjectBySlug, profile } from "@/lib/content";

export default function Home() {
  const [lead, ...supporting] = getFeaturedProjects().slice(0, 3);
  const experiments = ["iot-egg-incubator-research", "iot-egg-incubator-blynk"].map(getProjectBySlug).filter(project => project !== undefined);

  return <div className="wrap home-page">
    <HeroSection/>

    <section className="section home-introduction" data-home-section="introduction" aria-labelledby="intro-heading">
      <p className="eyebrow accent">02 / Introduction</p>
      <EditorialEntrance><h2 id="intro-heading">Benda punya sinyal.<br/>Kode memberinya<br/><span className="accent">kemungkinan.</span></h2></EditorialEntrance>
      <div className="intro-aside"><p>{profile.bio}</p><SiteLink href="/about" className="text-link">Kenali Rehan <Arrow/></SiteLink></div>
    </section>

    <section className="section home-selected" data-home-section="selected-works" aria-labelledby="selected-heading">
      <div className="section-heading"><div><p className="eyebrow accent">03 / Selected works</p><h2 id="selected-heading">Gagasan,<br/>dibangun.</h2></div><p>Karya pilihan yang mempertemukan elektronika, perangkat lunak, dan kolaborasi.</p></div>
      {lead && <ProjectSpread project={lead} number={1} className="home-lead-project" showRole/>}
      <div className="home-work-pair">{supporting.map((project, i) => <ProjectSpread key={project.slug} project={project} number={i + 2} className="home-support-project" showRole/>)}</div>
      <SiteLink className="text-link" href="/projects">Jelajahi seluruh karya <Arrow/></SiteLink>
    </section>

    <section className="section home-focus" data-home-section="what-i-do" aria-labelledby="focus-heading">
      <div className="section-heading"><div><p className="eyebrow accent">04 / What I do</p><h2 id="focus-heading">Lintas medium.<br/>Satu rasa ingin tahu.</h2></div><p>Bidang yang saya eksplorasi, dari benda fisik sampai pengalaman digital.</p></div>
      <ol className="home-focus-list">{focusAreas.map((area, index) => <li key={area.title}><span className="meta">0{index + 1}</span><h3>{area.title}</h3><p>{area.description}</p></li>)}</ol>
    </section>

    <section className="section home-process" data-home-section="engineering-process" aria-labelledby="process-heading">
      <div className="section-heading"><div><p className="eyebrow accent">05 / Engineering process</p><h2 id="process-heading">Dari pertanyaan<br/>ke bentuk.</h2></div><p>Sense → Compute → Build adalah cara kreatif menjelaskan alur gagasan. Sebuah analogi, bukan metodologi riset formal.</p></div>
      <SignalDiagram steps={engineeringSteps} story/>
    </section>

    <section className="section home-experience" data-home-section="experience" aria-labelledby="experience-heading">
      <div className="section-heading"><div><p className="eyebrow accent">06 / Experience highlights</p><h2 id="experience-heading">Belajar lewat<br/>keterlibatan.</h2></div><SiteLink href="/experience" className="text-link">Seluruh pengalaman <Arrow/></SiteLink></div>
      <div className="home-experience-list">{experienceHighlights.map(item => <article className="timeline-row" key={`${item.role}-${item.organization}`}><span className="meta">{item.period}</span><div><h3>{item.role}</h3><p>{item.organization}</p></div></article>)}</div>
    </section>

    <section className="section home-experiments" data-home-section="lab" aria-labelledby="lab-heading">
      <div className="section-heading"><div><p className="eyebrow accent">07 / Lab & experiments</p><h2 id="lab-heading">Ada pertanyaan<br/>di meja kerja.</h2></div><p>Eksplorasi IoT dan sistem kendali, dengan konteks yang tetap dibedakan.</p></div>
      <div className="home-lab-notes">{experiments.map((project, index) => <article key={project.slug}><div className="lab-note-index"><span className="eyebrow">Catatan 0{index + 1}</span><span className="meta">{index === 0 ? "Penelitian dosen · 2026" : "Blynk · Kontrol lokal"}</span></div><h3>{project.title}</h3><p>{project.summary}</p><p className="meta">{index === 0 ? "Peran: IoT Engineer. Hasil akhir validasi belum dipublikasikan." : "Status penyelesaian dan spesifikasi perangkat belum dipublikasikan."}</p><SiteLink href={`/projects/${project.slug}`} className="text-link">Baca catatan <Arrow/></SiteLink></article>)}</div>
      <SiteLink href="/lab" className="text-link">Masuk ke Lab & Research <Arrow/></SiteLink>
    </section>

    <section className="section home-recognition" data-home-section="recognition" aria-labelledby="recognition-heading">
      <div className="section-heading"><div><p className="eyebrow accent">08 / Recognition</p><h2 id="recognition-heading">Hasil bersama.<br/>Cerita yang berlanjut.</h2></div><SiteLink href="/achievements" className="text-link">Seluruh pencapaian <Arrow/></SiteLink></div>
      {achievements.map(award => <article className="award-row" key={award.id}><div><p className="award-result">{award.result}</p><p className="meta">{award.additional}</p></div><div><h3>{getProjectBySlug(award.projectSlug)?.title}</h3><p>{award.event} {award.year}</p><p className="meta">Hasil tim · {award.team}</p><a href={award.source} className="text-link" target="_blank" rel="noopener noreferrer">Baca publikasi <Arrow/></a></div><span className="meta">{award.year}</span></article>)}
    </section>

    <section className="section home-closing" data-home-section="closing" aria-labelledby="closing-heading">
      <p className="eyebrow">09 / The next conversation</p>
      <EditorialEntrance><h2 id="closing-heading">Pertanyaan bagus<br/>bisa jadi karya<br/>berikutnya.</h2></EditorialEntrance>
      <div className="closing-bottom"><p>Elektronika, software, atau sesuatu di antaranya. Mari mulai dengan gagasan yang jelas.</p><div className="actions"><SiteLink href="/contact" className="button-primary">Mari terhubung <Arrow/></SiteLink><SiteLink href="/projects" className="text-link">Lihat karya lainnya <Arrow/></SiteLink></div></div>
    </section>
  </div>;
}
