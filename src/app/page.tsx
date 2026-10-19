import { HeroSection } from "@/components/sections/HeroSection";
import { SiteLink } from "@/components/layout/RouteTransition";
import { Arrow, ProjectSpread } from "@/components/ui/Editorial";
import { getFeaturedProjects } from "@/lib/content";
export default function Home() {
  return <div className="wrap">
    <HeroSection/>
    <section className="section" aria-labelledby="selected-heading"><div className="section-heading"><div><p className="eyebrow accent">Selected works / 01–02</p><h2 id="selected-heading">Gagasan,<br/>dibangun.</h2></div><p>Karya pilihan dari elektronika, teknologi web, dan eksplorasi bersama tim.</p></div>{getFeaturedProjects().slice(0, 2).map((project, i) => <ProjectSpread key={project.slug} project={project} number={i + 1}/>)}<SiteLink className="text-link" href="/projects">Lihat seluruh karya <Arrow/></SiteLink></section>
    <section className="section home-lab"><div><p className="eyebrow accent">The ongoing curiosity</p><h2>Rasa ingin tahu<br/>punya ruang kerja.</h2></div><div><p>Catatan riset, eksperimen elektronika, dan teknologi yang bertemu kebutuhan sehari-hari.</p><SiteLink className="text-link" href="/lab">Masuk ke Lab & Research <Arrow/></SiteLink><SiteLink className="text-link" href="/achievements">Pengakuan untuk karya tim <Arrow/></SiteLink></div></section>
  </div>;
}
