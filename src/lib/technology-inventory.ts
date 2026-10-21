import { skillGroups } from "./portfolio";
import { capabilityGroups } from "./capabilities";

export const inventoryIconNames = [
  "cpp", "typescript", "javascript", "php", "python", "micropython", "dart", "sql", "react", "flutter",
  "code", "web", "database", "layers", "wind", "bolt", "waves", "box", "network", "panels", "worker",
  "cpu", "arduino", "raspberry", "radio", "cloud", "monitor", "automation", "sensor", "circuit", "wrench", "flask", "gauge",
  "testing", "bug", "eye", "camera", "video", "file", "ide", "orbit", "terminal", "palette", "office", "android", "git", "ruler", "asterisk", "theater", "braces",
] as const;
export type InventoryIcon = typeof inventoryIconNames[number];
export interface InventoryItem {
  id: string; name: string; icon: InventoryIcon; source: string;
  learning?: boolean; basis?: "team" | "project";
}
export interface InventoryGroup { id: "tech" | "embedded" | "tools" | "capabilities"; title: string; description: string; items: readonly InventoryItem[] }

// Every DATA §12.1–8 inventory name is mapped explicitly. Missing identifiers fail closed.
const skillIcons: Record<string, InventoryIcon> = {
  "Circuit Design": "circuit", "Electronics Troubleshooting": "wrench", "Sensor Integration": "sensor", "Laboratory Practice": "flask", "Electrical Measurement": "gauge",
  "Arduino Uno": "arduino", "Arduino Nano": "arduino", ESP8266: "cpu", ESP32: "cpu", STM32: "cpu", "Raspberry Pi": "raspberry",
  MQTT: "radio", "Blynk / Blynk Cloud HTTP API": "cloud", "Remote Monitoring": "monitor", "Smart Automation": "automation", "Sensor Monitoring": "sensor",
  "C++": "cpp", PHP: "php", JavaScript: "javascript", TypeScript: "typescript", Python: "python", MicroPython: "micropython", Dart: "dart", SQL: "sql",
  HTML5: "code", CSS3: "palette", React: "react", "Next.js": "web", Vite: "bolt", "Tailwind CSS": "wind", Laravel: "layers", "REST API": "network", MySQL: "database", "PostgreSQL / Supabase": "database",
  GSAP: "bolt", Lenis: "waves", "Framer Motion": "layers", "Three.js": "box", "React Three Fiber": "react", "React Flow / XYFlow": "network", "Monaco Editor": "panels", "Web Worker": "worker",
  Flutter: "flutter", Firebase: "cloud", "MIT App Inventor": "android",
  "Mobile Application Software Testing": "testing", "Mobile App UI Testing": "panels", "Bug Hunting": "bug", "User Experience Testing": "eye",
  Photography: "camera", Videography: "video", Documentation: "file",
};
const itemId = (name: string) => name.toLowerCase().replaceAll("++", "pp").replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");
const capabilityBasis = new Map(capabilityGroups.flatMap(group => group.items).map(item => [item.name, item.basis]));
function fromSkills(ids: readonly string[], accept: (name: string) => boolean = () => true): InventoryItem[] {
  return ids.flatMap(id => {
    const index = skillGroups.findIndex(group => group.id === id);
    if (index < 0) throw new Error(`Unknown skill group ${id}`);
    return skillGroups[index].skills.filter(skill => accept(skill.name)).map(skill => {
      const icon = skillIcons[skill.name];
      if (!icon) throw new Error(`Missing inventory icon for ${skill.name}`);
      // A project stack is not a claim of sole authorship or formal proficiency.
      const basis = capabilityBasis.get(skill.name === "React Flow / XYFlow" ? "React Flow" : skill.name);
      return { id: itemId(skill.name), name: skill.name, icon, source: `DATA §12.${index + 1}`, learning: skill.learning, ...(basis === "team" || basis === "project" ? { basis } : {}) };
    });
  });
}

/** Owner-supplied software inventory, recorded verbatim in DATA §12.9. No product/version claims. */
export const ownerSoftware: readonly InventoryItem[] = [
  { id: "vs-code", name: "VS Code", icon: "ide", source: "DATA §12.9" },
  { id: "antigravity-ide", name: "Antigravity IDE", icon: "orbit", source: "DATA §12.9" },
  { id: "codex", name: "Codex", icon: "terminal", source: "DATA §12.9" },
  { id: "canva", name: "Canva", icon: "palette", source: "DATA §12.9" },
  { id: "microsoft-office", name: "Microsoft Office", icon: "office", source: "DATA §12.9" },
  { id: "arduino-ide", name: "Arduino IDE", icon: "arduino", source: "DATA §12.9" },
  { id: "android-studio", name: "Android Studio", icon: "android", source: "DATA §12.9" },
  { id: "git", name: "Git", icon: "git", source: "DATA §12.9" },
  { id: "wokwi", name: "Wokwi", icon: "circuit", source: "DATA §12.9" },
  { id: "autocad", name: "AutoCAD", icon: "ruler", source: "DATA §12.9" },
  { id: "cirkit-designer-ide", name: "Cirkit Designer IDE", icon: "circuit", source: "DATA §12.9" },
  { id: "open-code", name: "Open Code", icon: "code", source: "DATA §12.9" },
  { id: "claude-code", name: "Claude Code", icon: "asterisk", source: "DATA §12.9" },
];

// Keep previously shown project testing technologies; they belong with code, not the app inventory.
const projectTesting: readonly InventoryItem[] = [
  { id: "vitest", name: "Vitest", icon: "flask", basis: "team", source: "DATA §9.2" },
  { id: "playwright", name: "Playwright", icon: "theater", basis: "team", source: "DATA §9.2" },
  { id: "laravel-pint", name: "Laravel Pint", icon: "braces", basis: "project", source: "DATA §9.3" },
];

export const technologyInventoryGroups: readonly InventoryGroup[] = [
  { id: "tech", title: "Tech", description: "Bahasa dan teknologi untuk mengembangkan sistem serta aplikasi.", items: [...fromSkills(["languages", "web", "mobile"], name => name !== "MIT App Inventor"), ...projectTesting] },
  { id: "embedded", title: "Embedded & IoT", description: "Perangkat dan teknologi untuk mengolah masukan, menjalankan kendali, dan saling terhubung.", items: fromSkills(["embedded", "iot"]) },
  { id: "tools", title: "Tools & Software", description: "Aplikasi untuk menulis kode, merancang, dan mendokumentasikan pekerjaan.", items: [...ownerSoftware, ...fromSkills(["mobile"], name => name === "MIT App Inventor")] },
  { id: "capabilities", title: "Capabilities", description: "Keterampilan praktis yang saya gunakan saat mengerjakan dan memeriksa hasil pekerjaan.", items: fromSkills(["electronics", "qa", "media"]) },
];
export const technologyInventoryItems = technologyInventoryGroups.flatMap(group => group.items);

// Home introduces the practice; About owns the complete inventory. Both reuse the same records.
const homeSelection: Record<InventoryGroup["id"], readonly string[]> = {
  tech: ["cpp", "javascript", "typescript", "php", "sql", "react", "next-js", "tailwind-css", "laravel", "python", "micropython"],
  embedded: ["arduino-uno", "esp8266", "esp32", "stm32", "raspberry-pi", "mqtt", "blynk-blynk-cloud-http-api"],
  tools: ["vs-code", "codex", "git", "arduino-ide", "android-studio", "wokwi", "canva", "microsoft-office"],
  capabilities: ["circuit-design", "electronics-troubleshooting", "sensor-integration", "laboratory-practice", "mobile-application-software-testing", "documentation"],
};
export const homeTechnologyGroups: readonly InventoryGroup[] = technologyInventoryGroups.map(group => ({
  ...group,
  items: homeSelection[group.id].map(id => {
    const item = group.items.find(candidate => candidate.id === id);
    if (!item) throw new Error(`Unknown Home technology ${id}`);
    return item;
  }),
}));
