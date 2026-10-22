import type { Metadata } from "next";
import { PageMotion } from "@/components/motion/PageMotion";
import { PageHeading, Arrow } from "@/components/ui/Editorial";
import { profile } from "@/lib/content";
export const metadata: Metadata = { title: "Kontak", description: "Temukan profil GitHub Muhammad Rehan dan telusuri karya yang ia bagikan. Kenali aktivitas pengembangannya sebagai awal untuk menjajaki gagasan atau kolaborasi." };
export default function Contact() {
  return <div className="wrap contact-page"><PageMotion profile="contact"/><PageHeading eyebrow="Contact">Mari<br/>terhubung</PageHeading><section className="section contact-layout"><h2>Tentang karya<br/>atau kolaborasi.</h2><div className="reading"><p>Ingin mengenal pekerjaan saya lebih jauh? Kunjungi profil GitHub untuk melihat repositori dan aktivitas pengembangan yang saya bagikan.</p><a className="contact-link" href={profile.github} target="_blank" rel="noopener noreferrer"><span><span className="eyebrow">GitHub</span><strong>Han0953</strong></span><Arrow/></a><p className="meta">{profile.location}</p></div></section></div>;
}
