"use client";
import { SiteLink } from "@/components/layout/RouteTransition";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="wrap recovery"><header className="page-heading"><p className="eyebrow accent">Ada kendala</p><h1 tabIndex={-1}>Halaman belum<br/>bisa dimuat.</h1><p>Silakan coba memuat ulang halaman ini. Kamu juga bisa kembali ke Home dan melanjutkan dari sana.</p></header><div className="actions"><button className="button-primary" type="button" onClick={reset}>Coba lagi</button><SiteLink className="text-link" href="/">Kembali ke Home ↗</SiteLink></div></div>;
}
