import { SiteLink } from "@/components/layout/RouteTransition";
import { Arrow } from "@/components/ui/Editorial";
import { profile, engineeringSteps } from "@/lib/content";
import { SignalDiagram } from "./SignalDiagram";
import { RotatingRoles } from "./RotatingRoles";
import { heroRoles } from "@/lib/home-content";
export function HeroSection() {
  return (
    <section data-home-section="hero" className="home-hero" aria-labelledby="home-title">
      <div className="hero-top"><p className="eyebrow">Electronics · Code · Research</p><span className="meta">{profile.location}</span></div>
      <div className="hero-grid"><div className="hero-identity"><h1 id="home-title" tabIndex={-1}><span>Muhammad</span><span>Rehan<span className="accent">.</span></span></h1><RotatingRoles roles={heroRoles.map(role => role.label)}/></div>
        <SignalDiagram steps={engineeringSteps}/>
      </div>
      <div className="hero-bottom"><p>Mengeksplorasi hubungan antara elektronika, perangkat lunak, dan gagasan yang bisa diwujudkan.</p><div className="actions"><SiteLink className="button-primary" href="/projects">Jelajahi karya <Arrow/></SiteLink><SiteLink className="text-link" href="/about">Tentang Rehan <Arrow/></SiteLink></div></div>
    </section>
  );
}
