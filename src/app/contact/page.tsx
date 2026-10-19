import type { Metadata } from "next";
import { PageHeading, Arrow } from "@/components/ui/Editorial";
import { profile } from "@/lib/content";
export const metadata: Metadata = { title: "Contact", description: "Temukan Muhammad Rehan di GitHub. Elektronika, software, dan gagasan kolaborasi." };
export default function Contact() {
  return <div className="wrap contact-page"><PageHeading eyebrow="Contact">Let’s<br/>collaborate</PageHeading><section className="section contact-layout"><h2>Mulai dari<br/>sebuah gagasan.</h2><div className="reading"><p>Punya ketertarikan yang sama pada elektronika, pengembangan web, atau riset teknologi? Kenali karya dan aktivitas saya melalui GitHub.</p><a className="contact-link" href={profile.github} target="_blank" rel="noopener noreferrer"><span><span className="eyebrow">GitHub</span><strong>Han0953</strong></span><Arrow/></a><p className="meta">{profile.location}</p></div></section></div>;
}
