import type { Project } from "@/lib/content";

/** Decorative project-specific artwork; the adjacent heading supplies the name. */
export function ProjectGraphic({ project }: { project: Project }) {
  const kind = project.slug === "air-quality-monitoring" ? "air"
    : project.slug === "smart-home-iot" ? "home"
    : project.slug === "drone-stm32" ? "drone" : "circuit";

  return <div className="project-graphic" data-project-graphic={kind} aria-hidden="true">
    <svg viewBox="0 0 700 390" focusable="false" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path className="graphic-grid" d="M80 65H620V325H80ZM80 130H620M80 195H620M80 260H620M170 65V325M260 65V325M350 65V325M440 65V325M530 65V325"/>
      {kind === "air" ? <>
        <rect x="265" y="125" width="170" height="170" rx="12"/>
        <path d="M300 225H400M300 245H400M300 265H360"/>
        <circle cx="350" cy="175" r="22"/>
        <path className="graphic-accent" d="M240 180H165C125 180 125 125 165 125M460 210H535C575 210 575 155 535 155M310 90C310 45 390 45 390 90"/>
      </> : kind === "home" ? <>
        <path d="M205 190L350 75L495 190M235 170V310H465V170M320 310V230H380V310"/>
        <path className="graphic-accent" d="M285 165Q350 105 415 165M315 190Q350 155 385 190M145 280H205M495 280H555"/>
        <circle className="graphic-accent" cx="350" cy="207" r="6"/>
        <circle cx="135" cy="280" r="10"/><circle cx="565" cy="280" r="10"/>
      </> : kind === "drone" ? <>
        <path d="M320 165L235 100M380 165L465 100M320 225L235 290M380 225L465 290" strokeWidth="12"/>
        <rect x="310" y="150" width="80" height="90" rx="16"/>
        <g className="graphic-accent"><ellipse cx="225" cy="90" rx="65" ry="22"/><ellipse cx="475" cy="90" rx="65" ry="22"/><ellipse cx="225" cy="300" rx="65" ry="22"/><ellipse cx="475" cy="300" rx="65" ry="22"/></g>
        <path d="M340 180H360M340 195H360M340 210H360"/>
      </> : <>
        <path className="graphic-accent" d="M115 275H210V110H390V235H580" strokeWidth="10"/>
        <rect x="285" y="145" width="130" height="130" fill="var(--surface)"/>
        <circle cx="115" cy="275" r="16" fill="var(--surface)"/><circle cx="580" cy="235" r="16" fill="var(--surface)"/>
        <path d="M320 180H380V240H320ZM335 145V125M365 145V125M335 295V275M365 295V275M265 190H285M265 225H285M415 190H435M415 225H435"/>
      </>}
    </svg>
  </div>;
}
