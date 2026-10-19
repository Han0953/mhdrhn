import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/Editorial";
import { experiences } from "@/lib/content";
export const metadata: Metadata = { title: "Experience", description: "Pengalaman organisasi, laboratorium, kepanitiaan, dan pengujian aplikasi mobile Muhammad Rehan." };
export default function Experience() {
  return <div className="wrap"><PageHeading eyebrow="Experience" description="Pengalaman tumbuh lewat keterlibatan: di organisasi, laboratorium, acara, dan pengujian aplikasi.">Belajar, terlibat,<br/>bertumbuh</PageHeading>{experiences.map(group => <section className="section experience-group" key={group.group}><h2>{group.group}.</h2>{group.items.map(item => <article key={`${item.organization}-${item.role}`} className="timeline-row"><span className="meta">{item.period}</span><div><h3>{item.role}</h3><p>{item.organization}</p></div></article>)}</section>)}</div>;
}
