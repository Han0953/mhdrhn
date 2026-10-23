import { homeTechnologyGroups, technologyInventoryGroups } from "@/lib/technology-inventory";
import { TechnologyMark } from "@/components/ui/TechnologyMark";

/** One inventory, two editorial scopes. Items are informational, never navigation. */
export function TechnologyLogoGrid({ preview = false }: { preview?: boolean }) {
  return <div className="technology-logo-showcase">
    <p className="section-note">{preview ? "Pilihan teknologi dan alat yang membantu saya belajar serta mengerjakan proyek. Learning menandai yang masih saya pelajari." : "Alat yang tepat membantu saya mencoba pendekatan baru dan menyelesaikan pekerjaan. Learning menandai teknologi yang masih saya pelajari."}</p>
    {(preview ? homeTechnologyGroups : technologyInventoryGroups).map(group => <div className="logo-group" key={group.id} data-inventory-group={group.id}>
      <div className="logo-group-heading"><h3>{group.title}</h3><p>{group.description}</p></div>
      <ul className="technology-logo-grid" aria-label={group.title}>{group.items.map(item => <li key={item.id} className="technology-item" data-technology={item.id}>
        <span className="technology-mark"><TechnologyMark icon={item.icon} itemId={item.id}/></span>
        <span className="technology-label"><span>{item.name}</span>{item.learning && <> <span className="technology-badge" data-basis="learning">Learning</span></>}</span>
      </li>)}</ul>
    </div>)}
  </div>;
}
