import {
  Activity, Asterisk, Atom, Bot, Box, Braces, Bug, Camera, CircuitBoard,
  ClipboardCheck, Cloud, CodeXml, Cpu, Database, Eye, Files, FileText,
  FlaskConical, Gauge, GitBranch, Layers, Monitor, Network, Orbit,
  Palette, PanelLeft, Radio, Ruler, SquareCode, Terminal,
  Theater, Video, Waves, Wind, Workflow, Wrench, Zap, type LucideIcon,
} from "lucide-react";
import type { InventoryIcon } from "@/lib/technology-inventory";

// Local geometric identifiers and ISC-licensed Lucide symbols, not official brand assets.
// The visible name is the accessible label; marks never invent proficiency or endorsements.
const symbols: Record<InventoryIcon, LucideIcon> = {
  cpp: CodeXml, typescript: CodeXml, javascript: CodeXml, php: CodeXml, python: CodeXml, micropython: CodeXml, dart: CodeXml, sql: Database,
  react: Atom, flutter: Layers, code: CodeXml, web: Monitor, database: Database, layers: Layers, wind: Wind, bolt: Zap, waves: Waves, box: Box,
  network: Network, panels: PanelLeft, worker: Workflow, cpu: Cpu, arduino: CircuitBoard, raspberry: CircuitBoard, radio: Radio, cloud: Cloud,
  monitor: Monitor, automation: Workflow, sensor: Activity, circuit: CircuitBoard, wrench: Wrench, flask: FlaskConical, gauge: Gauge,
  testing: ClipboardCheck, bug: Bug, eye: Eye, camera: Camera, video: Video, file: FileText, ide: SquareCode, orbit: Orbit, terminal: Terminal,
  palette: Palette, office: Files, android: Bot, git: GitBranch, ruler: Ruler, asterisk: Asterisk, theater: Theater, braces: Braces,
};
const languageMarks: Partial<Record<InventoryIcon, string>> = { cpp: "C++", typescript: "TS", javascript: "JS", php: "PHP", python: "Py", micropython: "µPy", dart: "Dt", sql: "SQL" };

export function TechnologyMark({ icon }: { icon: InventoryIcon }) {
  const label = languageMarks[icon];
  if (label) return <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d={icon === "cpp" ? "M24 2 44 13v22L24 46 4 35V13Z" : "M3 3h42v42H3Z"} fill="none" stroke="currentColor" strokeWidth="2"/><text x="24" y="30" textAnchor="middle" fill="currentColor" fontFamily="Arial,sans-serif" fontWeight="700" fontSize={label.length > 2 ? "16" : "22"}>{label}</text></svg>;
  if (icon === "react") return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="3" fill="currentColor"/>{[0, 60, 120].map(angle => <ellipse key={angle} cx="24" cy="24" rx="21" ry="8" transform={`rotate(${angle} 24 24)`}/>)}</svg>;
  if (icon === "flutter") return <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" focusable="false"><path d="m29 3-23 23 8 8L45 3Zm1 19L17 35l10 10h16L30 32l10-10Z"/></svg>;
  if (icon === "arduino") return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M24 24C18 8 2 12 2 24s16 16 22 0 22-12 22 0-16 16-22 0Z"/><path d="M8 24h8m16 0h8m-4-4v8"/></svg>;
  const Icon = symbols[icon];
  return <Icon size={32} strokeWidth={1.5} aria-hidden="true" focusable="false"/>;
}
