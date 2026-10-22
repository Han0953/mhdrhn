import { PageHeading } from "@/components/ui/Editorial";
import { PageMotion } from "@/components/motion/PageMotion";
import { SiteLink, RouteReady } from "@/components/layout/RouteTransition";
export default function NotFound() {
  return <div className="wrap recovery"><PageMotion profile="recovery"/><RouteReady error/><PageHeading eyebrow="404 / Halaman tidak ditemukan" description="Alamat yang kamu buka tidak tersedia. Kembali ke Home atau telusuri proyek yang ada.">Halaman tidak<br/>ditemukan</PageHeading><div className="actions"><SiteLink className="button-primary" href="/">Kembali ke Home</SiteLink><SiteLink className="text-link" href="/projects">Jelajahi karya ↗</SiteLink></div></div>;
}
