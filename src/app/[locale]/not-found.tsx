"use client";
import { OriginLink } from "@/components/ui/OriginAction";
import {useTranslation} from "@/i18n/LocaleProvider";
import {translateTree} from "@/i18n/translate";
import {DisplayLines} from "@/components/motion/DisplayLines";
import type {ReactNode} from "react";

import { PageMotion } from "@/components/motion/PageMotion";
import { SiteLink, RouteReady } from "@/components/layout/RouteTransition";
function PageHeading({eyebrow,description,children}:{eyebrow:string;description:string;children:ReactNode}){const {locale,t}=useTranslation(); return translateTree(<header className="page-heading"><p className="eyebrow accent">{eyebrow}</p><h1 tabIndex={-1}><DisplayLines>{children}<span className="accent">.</span></DisplayLines></h1><p className="page-description">{description}</p></header>,t,locale);}
export default function NotFound() {
const {locale,t}=useTranslation();
  return translateTree(<div className="wrap recovery"><PageMotion profile="recovery"/><RouteReady error/><PageHeading eyebrow="404 / Halaman tidak ditemukan" description="Alamat yang kamu buka tidak tersedia. Kembali ke Home atau telusuri proyek yang ada.">Halaman tidak<br/>ditemukan</PageHeading><div className="actions"><OriginLink href="/">Kembali ke Home</OriginLink><SiteLink className="text-link" href="/projects">Jelajahi karya ↗</SiteLink></div></div>,t,locale);
}
