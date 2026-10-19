import { technologyInventoryGroups } from "@/lib/technology-inventory";
import { TechnologyMark } from "@/components/ui/TechnologyMark";

/** Complete, server-rendered Home inventory. Deliberately no links, buttons or hover actions. */
export function TechnologyLogoGrid() {
  return <div className="technology-logo-showcase">
    <p className="section-note">Teknologi, perangkat, aplikasi, dan bidang yang saya gunakan atau pelajari. Learning menandai yang masih dipelajari; Team Stack menunjukkan teknologi pada karya tim.</p>
    {technologyInventoryGroups.map(group => <div className="logo-group" key={group.id} data-inventory-group={group.id}>
      <div className="logo-group-heading"><h3>{group.title}</h3><p>{group.description}</p></div>
      <ul className="technology-logo-grid" aria-label={group.title}>{group.items.map(item => <li key={item.id} className="technology-item" data-technology={item.id}>
        <span className="technology-mark"><TechnologyMark icon={item.icon}/></span>
        <span className="technology-label"><span>{item.name}</span>{item.learning && <> <span className="technology-badge" data-basis="learning">Learning</span></>}{item.basis && <> <span className="technology-badge" data-basis={item.basis}>{item.basis === "team" ? "Team Stack" : "Project"}</span></>}</span>
      </li>)}</ul>
    </div>)}
  </div>;
}
