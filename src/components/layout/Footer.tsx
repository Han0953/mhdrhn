import { serverTranslator } from "@/i18n/server";
import { translateTree } from "@/i18n/translate";
import { type Locale } from "@/i18n/config";
import { SiteLink } from "@/components/layout/RouteTransition";
import { Arrow } from "@/components/ui/Editorial";
import { profile } from "@/lib/content";
import { navigation } from "@/lib/navigation";
import { BackToTop } from "@/components/ui/BackToTop";
import { PageMotion } from "@/components/motion/PageMotion";
export function Footer({locale="id"}: {locale?:Locale} = {}) {
  const t=serverTranslator(locale);
  return translateTree(<footer className="site-footer"><div className="wrap">
    <PageMotion profile="footer"/>
    <div className="footer-top"><div><p className="eyebrow">Ingin membahas karya atau kolaborasi?</p><SiteLink className="footer-cta" href="/contact">Mari terhubung <Arrow/></SiteLink></div><p className="meta">Proyek, pengalaman,<br/>dan hal yang saya pelajari.</p></div>
    <nav className="footer-nav" aria-label="Navigasi footer">{navigation.map(item => <SiteLink key={item.href} href={item.href}>{item.label}</SiteLink>)}</nav>
    <BackToTop/>
    <SiteLink className="footer-wordmark" href="/" aria-label="mhdrhn. — Home">mhdrhn.</SiteLink>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Muhammad Rehan</span><span>{profile.location}</span><a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a></div>
  </div></footer>,t,locale);
}
