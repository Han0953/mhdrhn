import { serverTranslator } from "@/i18n/server";
import { translateTree } from "@/i18n/translate";
import { type Locale } from "@/i18n/config";
import { SiteLink } from "@/components/layout/RouteTransition";
import { Arrow } from "@/components/ui/Editorial";
import { HeroSignal3D } from "./HeroSignal3D";
import { RotatingRoles } from "./RotatingRoles";
import { heroRoles } from "@/lib/home-content";
import { OriginLink } from "@/components/ui/OriginAction";
export function HeroSection({locale="id", roles}: {locale?:Locale; roles?: string[]} = {}) {
  const t=serverTranslator(locale);
  const activeRoles = roles && roles.length > 0 ? roles : heroRoles.map(role => role.label);
  return translateTree((
    <section data-home-section="hero" className="home-hero" aria-labelledby="home-title">
      <noscript><style>{'.home-hero .hero-signal-frame{display:none}.home-hero .hero-grid{grid-template-columns:1fr}'}</style></noscript>
      <div className="hero-top"><p className="eyebrow">Electronics · Code · Research</p></div>
      <div className="hero-grid"><div className="hero-identity"><p className="hero-greeting accent">Hi, it’s me,</p><h1 id="home-title" tabIndex={-1}><span>Muhammad</span><span>Rehan<span className="accent">.</span></span></h1><RotatingRoles roles={activeRoles}/></div>
        <div className="hero-signal-frame"><HeroSignal3D/></div>
      </div>
      <div className="hero-bottom"><p>Saya mengerjakan proyek sambil mempelajari cara kerja teknologi yang ada di baliknya.</p><div className="actions"><OriginLink href="/projects">Jelajahi karya <Arrow/></OriginLink><SiteLink className="text-link" href="/about">Tentang Rehan <Arrow/></SiteLink></div></div>
    </section>
  ),t,locale);
}
