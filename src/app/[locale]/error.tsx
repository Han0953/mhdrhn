"use client";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateTree } from "@/i18n/translate";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PageMotion } from "@/components/motion/PageMotion";
import { SiteLink, RouteReady } from "@/components/layout/RouteTransition";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const {locale,t}=useTranslation();
  const router = useRouter();
  const [pending, retry] = useTransition();
  return translateTree(<div className="wrap recovery"><PageMotion profile="recovery"/><RouteReady error/><header className="page-heading"><p className="eyebrow accent">Ada kendala</p><h1 tabIndex={-1}>Halaman belum<br/>bisa dimuat.</h1><p>Silakan coba memuat ulang halaman ini. Kamu juga bisa kembali ke Home dan melanjutkan dari sana.</p></header><div className="actions"><button className="button-primary" type="button" disabled={pending} onClick={() => retry(() => { if (typeof document !== "undefined") document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true }); router.refresh(); reset(); })}>{pending ? "Memuat ulang…" : "Coba lagi"}</button><SiteLink className="text-link" href="/">Kembali ke Home ↗</SiteLink></div></div>,t,locale);
}
