import { SiteLink } from "@/components/layout/RouteTransition";
import { Arrow } from "@/components/ui/Editorial";
import { profile } from "@/lib/content";
export function HeroSection() {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="hero-top"><p className="eyebrow">Electronics · Code · Research</p><span className="meta">{profile.location}</span></div>
      <div className="hero-grid"><div className="hero-identity"><h1 id="home-title" tabIndex={-1}><span>Muhammad</span><span>Rehan<span className="accent">.</span></span></h1><p className="hero-role">Creative Engineering.</p></div>
        <figure className="redline-probe"><div className="probe-heading"><span className="eyebrow">Dari sinyal ke sistem</span><span className="meta">FIG. 01</span></div>
          <svg viewBox="0 0 440 250" aria-hidden="true"><path d="M35 205H400M120 35V215M260 35V215" fill="none" stroke="currentColor" opacity=".2"/><path className="diagram-line" d="M35 160H120V70H260V160H400" strokeWidth="9"/><g className="probe-nodes" strokeWidth="4"><circle cx="35" cy="160" r="13"/><rect x="102" y="52" width="36" height="36"/><circle cx="260" cy="160" r="13"/><circle cx="400" cy="160" r="13"/></g><text x="155" y="105" fill="currentColor" fontSize="12">01 → 02 → 03</text></svg>
          <div className="probe-labels"><span>Sense</span><span>Compute</span><span>Build</span></div><figcaption>Pengamatan. Logika. Gagasan yang diwujudkan.</figcaption>
        </figure>
      </div>
      <div className="hero-bottom"><p>Mengeksplorasi hubungan antara elektronika, perangkat lunak, dan gagasan yang bisa diwujudkan.</p><div className="actions"><SiteLink className="button-primary" href="/projects">Jelajahi karya <Arrow/></SiteLink><SiteLink className="text-link" href="/about">Tentang Rehan <Arrow/></SiteLink></div></div>
    </section>
  );
}
