import type { Metadata } from "next";
import Image from "next/image";
import { PageHeading, Arrow } from "@/components/ui/Editorial";
import { SiteLink } from "@/components/layout/RouteTransition";
import { profile } from "@/lib/content";
export const metadata: Metadata = { title: "About", description: profile.bio };
export default function About() {
  return <div className="wrap"><PageHeading eyebrow="Tentang / Muhammad Rehan">Di antara benda<br/>dan kemungkinan</PageHeading>
    <section className="about-intro"><div className="reading"><p className="intro-copy">Elektronika memberi bentuk. Kode memberi perilaku. Riset memberi pertanyaan berikutnya.</p><p>{profile.bio}</p><p>Ketertarikan itu juga membawa saya pada pengujian aplikasi mobile, kegiatan organisasi, dan pengabdian kepada masyarakat.</p><SiteLink href="/experience" className="text-link">Telusuri pengalaman <Arrow/></SiteLink></div><figure className="portrait"><Image src="/Foto%20Profile.jpg" alt="Muhammad Rehan" width={1856} height={2263} sizes="(min-width: 1024px) 38vw, (min-width: 768px) 45vw, 90vw"/><figcaption>Muhammad Rehan · Pekanbaru, Riau</figcaption></figure></section>
    <section className="section"><p className="eyebrow accent">Learning path</p><h2>Pendidikan.</h2><div className="timeline-row"><span className="meta">2024–sekarang</span><div><h3>Universitas Muhammadiyah Riau</h3><p>Pendidikan Vokasional Teknik Elektronika</p></div></div><div className="timeline-row"><span className="meta">2021–2024</span><div><h3>SMKS Bina Profesi Pekanbaru</h3><p>Teknik Komputer dan Jaringan</p></div></div></section>
    <section className="section"><p className="eyebrow accent">Areas of interest</p><h2>Ruang eksplorasi.</h2><div className="focus-list">{[["01", "Elektronika & embedded", "Integrasi sensor, mikrokontroler, dan sistem yang berinteraksi dengan dunia fisik."], ["02", "Web & software", "Antarmuka, sistem informasi, dan pengalaman digital untuk kebutuhan nyata."], ["03", "Riset & pengujian", "Eksperimen IoT, pengujian aplikasi mobile, dan proses memahami cara kerja teknologi."]].map(([number, title, description]) => <div className="focus-row" key={number}><span className="meta">{number}</span><h3>{title}</h3><p>{description}</p></div>)}</div></section>
  </div>;
}
