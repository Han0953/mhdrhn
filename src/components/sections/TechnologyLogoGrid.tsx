import { Cpu, Radio, Network, PanelLeft, FlaskConical, Theater, Braces } from "lucide-react";
import { capabilityGroups } from "@/lib/capabilities";
import { SiteLink } from "@/components/layout/RouteTransition";
import { Arrow } from "@/components/ui/Editorial";

// Locally authored geometric marks; remaining symbols use the existing ISC-licensed Lucide.
// These are visual identifiers, not official brand artwork or endorsements.
function TechnologyMark({ id }: { id: string }) {
  if (id === "react") return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="24" cy="24" r="3" fill="currentColor"/>{[0, 60, 120].map(angle => <ellipse key={angle} cx="24" cy="24" rx="21" ry="8" transform={`rotate(${angle} 24 24)`}/>)}</svg>;
  if (id === "typescript" || id === "cpp") return <svg viewBox="0 0 48 48" aria-hidden="true"><path d={id === "cpp" ? "M24 2 44 13v22L24 46 4 35V13Z" : "M3 3h42v42H3Z"} fill="none" stroke="currentColor" strokeWidth="2"/><text x="24" y="30" textAnchor="middle" fill="currentColor" fontFamily="Arial,sans-serif" fontWeight="700" fontSize={id === "cpp" ? "18" : "23"}>{id === "cpp" ? "C++" : "TS"}</text></svg>;
  if (id === "flutter") return <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true"><path d="m29 3-23 23 8 8L45 3Zm1 19L17 35l10 10h16L30 32l10-10Z"/></svg>;
  const Icon = ({ esp32: Cpu, mqtt: Radio, monaco: PanelLeft, "react-flow": Network, vitest: FlaskConical, playwright: Theater, "laravel-pint": Braces })[id];
  return Icon ? <Icon size={40} strokeWidth={1.5} aria-hidden="true"/> : null;
}

const groupings = [
  { title: "Web & Software", ids: ["react", "typescript", "cpp", "flutter"] },
  { title: "Embedded & IoT", ids: ["esp32", "mqtt"] },
  { title: "Tools & Workflow", ids: ["monaco", "react-flow", "vitest", "playwright", "laravel-pint"] },
];
const items = capabilityGroups.flatMap(group => group.items);
const badges = { recorded: "", project: "Project", team: "Team Stack", learning: "Learning", experience: "" };

export function TechnologyLogoGrid() {
  return <div className="technology-logo-showcase">
    <p className="section-note">Teknologi yang tercatat dalam portfolio. Team Stack menandai penggunaan pada karya tim; Learning berarti masih dipelajari.</p>
    {groupings.map(group => <div className="logo-group" key={group.title}><h3>{group.title}</h3><ul className="technology-logo-grid">{group.ids.map(id => {
      const item = items.find(item => item.id === id);
      if (!item) throw new Error(`Missing technology ${id}`);
      return <li key={id} data-technology={id}><SiteLink href={item.href}><span className="technology-mark"><TechnologyMark id={id}/></span><span className="technology-label">{item.name}{badges[item.basis] && <> <span className="technology-badge" data-basis={item.basis}>{badges[item.basis]}</span></>}</span></SiteLink></li>;
    })}</ul></div>)}
    <SiteLink href="/about#skills-heading" className="text-link">Seluruh bidang & kemampuan <Arrow/></SiteLink>
  </div>;
}
