import {
  Activity, Asterisk, Atom, Bot, Box, Braces, Bug, Camera, CircuitBoard,
  ClipboardCheck, Cloud, CodeXml, Cpu, Database, Eye, Files, FileText,
  FlaskConical, Gauge, GitBranch, Layers, Monitor, Network, Orbit,
  Palette, PanelLeft, Puzzle, Radio, Ruler, SquareCode, Terminal, Users,
  Theater, Video, Waves, Wind, Workflow, Wrench, Zap, type LucideIcon,
} from "lucide-react";
import type { InventoryIcon } from "@/lib/technology-inventory";
import { brandFilesForTechnology } from "@/lib/technology-brands";

// Local source-verified artwork for brands; Lucide remains the honest generic fallback.
// Names provide accessible labels, while decorative marks stay hidden from screen readers.
const symbols: Record<InventoryIcon, LucideIcon> = {
  cpp: CodeXml, typescript: CodeXml, javascript: CodeXml, php: CodeXml, python: CodeXml, micropython: CodeXml, dart: CodeXml, sql: Database,
  react: Atom, flutter: Layers, code: CodeXml, web: Monitor, database: Database, layers: Layers, wind: Wind, bolt: Zap, waves: Waves, box: Box,
  network: Network, panels: PanelLeft, worker: Workflow, cpu: Cpu, arduino: CircuitBoard, raspberry: CircuitBoard, radio: Radio, cloud: Cloud,
  monitor: Monitor, automation: Workflow, sensor: Activity, circuit: CircuitBoard, wrench: Wrench, flask: FlaskConical, gauge: Gauge,
  testing: ClipboardCheck, bug: Bug, eye: Eye, camera: Camera, video: Video, file: FileText, ide: SquareCode, orbit: Orbit, terminal: Terminal,
  palette: Palette, office: Files, android: Bot, git: GitBranch, ruler: Ruler, asterisk: Asterisk, theater: Theater, braces: Braces,
  puzzle: Puzzle, users: Users,
};
export function TechnologyMark({ icon, itemId }: { icon: InventoryIcon; itemId?: string }) {
  const files = brandFilesForTechnology(itemId);
  if (files.length) return <span className="technology-brand-set" data-count={files.length} aria-hidden="true">{files.map(file => file.endsWith(".png")
    ? <span key={file} className="technology-brand technology-brand-raster" data-brand-asset={file} style={{ maskImage: `url("/brand-icons/${file}"), linear-gradient(white, white), url("/brand-icons/${file}")`, WebkitMaskImage: `url("/brand-icons/${file}"), linear-gradient(white, white), url("/brand-icons/${file}")` }}/>
    : <span key={file} className="technology-brand" data-brand-asset={file} style={{ maskImage: `url("/brand-icons/${file}")`, WebkitMaskImage: `url("/brand-icons/${file}")` }}/>)}</span>;
  const Icon = symbols[icon];
  return <Icon size={32} strokeWidth={1.5} aria-hidden="true" focusable="false"/>;
}
