import { SiteLink } from "@/components/layout/RouteTransition";
import { Arrow } from "@/components/ui/Editorial";
import { navigation, profile } from "@/lib/content";
export function Footer() {
  return <footer className="site-footer"><div className="wrap">
    <div className="footer-top"><div><p className="eyebrow">Punya gagasan untuk dibicarakan?</p><SiteLink className="footer-cta" href="/contact">Mari terhubung <Arrow/></SiteLink></div><p className="meta">Elektronika, kode,<br/>dan pertanyaan berikutnya.</p></div>
    <nav className="footer-nav" aria-label="Navigasi footer">{navigation.map(item => <SiteLink key={item.href} href={item.href}>{item.label}</SiteLink>)}</nav>
    <SiteLink className="footer-wordmark" href="/" aria-label="mhdrhn. — Home">mhdrhn.</SiteLink>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Muhammad Rehan</span><span>{profile.location}</span><a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a></div>
  </div></footer>;
}
