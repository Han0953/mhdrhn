import { capabilityBasisLabels, capabilityGroups } from "@/lib/capabilities";
import { SiteLink } from "@/components/layout/RouteTransition";
import { Arrow } from "@/components/ui/Editorial";

/** Server-rendered typographic links. Hash targets expose context without JS-only tabs. */
export function TechnologyShowcase({ preview = false }: { preview?: boolean }) {
  return <div className={`technology-showcase${preview ? " technology-preview" : ""}`}>
    {!preview && <nav className="section-jumps" aria-label="Kelompok teknologi dan kemampuan">{capabilityGroups.map(group => <a href={`#capabilities-${group.id}`} key={group.id}>{group.title}</a>)}</nav>}
    {capabilityGroups.map((group, index) => <section className="capability-group" key={group.id} id={preview ? undefined : `capabilities-${group.id}`} aria-labelledby={`${preview ? "home-" : ""}capability-${group.id}`}>
      <div className="capability-category"><span className="eyebrow accent">0{index + 1}</span>{preview ? <h4 id={`home-capability-${group.id}`}>{group.title}</h4> : <h3 id={`capability-${group.id}`}>{group.title}</h3>}<p>{group.description}</p></div>
      <ul className="capability-items">{group.items.slice(0, preview ? 3 : undefined).map(item => <li id={preview ? undefined : `capability-${item.id}`} key={item.id}><SiteLink href={item.href}><span className="capability-name">{item.name}<Arrow/></span><span className="capability-basis" data-basis={item.basis}>{capabilityBasisLabels[item.basis]}</span><span className="capability-context">{item.context}</span></SiteLink></li>)}</ul>
    </section>)}
    {preview && <SiteLink href="/about#skills-heading" className="text-link">Jelajahi seluruh kemampuan <Arrow/></SiteLink>}
  </div>;
}
