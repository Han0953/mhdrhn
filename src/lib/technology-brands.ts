/** Curated monochrome assets; see public/brand-icons/manifest.json for source and hashes. */
export const technologyBrandAssets = {
  cpp: "cplusplus.svg", javascript: "javascript.svg", typescript: "typescript.svg", php: "php.svg",
  python: "python.svg", micropython: "micropython.svg", dart: "dart.svg", html5: "html5.svg", css3: "css3.svg",
  react: "react.svg", "next-js": "nextjs.svg", vite: "vite.svg", "tailwind-css": "tailwindcss.svg", laravel: "laravel.svg",
  mysql: "mysql.svg", postgresql: "postgresql.svg", supabase: "supabase.svg", gsap: "gsap.svg", "three-js": "threejs.svg",
  "framer-motion": "framermotion.svg", flutter: "flutter.svg", firebase: "firebase.svg", vitest: "vitest.svg", playwright: "playwright.svg",
  "arduino-uno": "arduino.svg", "arduino-nano": "arduino.svg", "arduino-ide": "arduino.svg",
  esp8266: "espressif.svg", esp32: "espressif.svg", stm32: "stmicroelectronics.svg", mqtt: "mqtt.svg",
  "blynk-blynk-cloud-http-api": "blynk.svg", "antigravity-ide": "antigravity.svg", canva: "canva.svg", "android-studio": "androidstudio.svg",
  git: "git.svg", wokwi: "wokwi.svg", autocad: "autocad.svg", "cirkit-designer-ide": "cirkit-designer.png",
  "open-code": "opencode.svg", "claude-code": "claudecode.svg",
} as const;

/** Product policies or missing distinct assets: keep a generic symbol instead of guessing. */
export const technologyBrandFallbacks: Record<string, string> = {
  codex: "No distinct Codex product asset verified; retain the generic terminal symbol.",
  "vs-code": "Official guidance forbids recoloring; retain the generic editor symbol.",
  "raspberry-pi": "Published logo usage is restricted; retain the generic board symbol.",
  "microsoft-office": "No licensed monochrome Office product asset supplied; retain the generic document symbol.",
  sql: "Language family, not a specific database product.",
  "rest-api": "Architecture style, not a brand.",
  "web-worker": "Web platform capability, not a brand.",
  "remote-monitoring": "General capability, not a brand.",
  "smart-automation": "General capability, not a brand.",
  "sensor-monitoring": "General capability, not a brand.",
  lenis: "A distinct, suitable monochrome asset has not been verified.",
  "react-three-fiber": "Do not substitute the React logo for this separate project.",
  "react-flow-xyflow": "A suitable project-specific asset has not been verified.",
  "monaco-editor": "Do not substitute the VS Code product logo for its editor library.",
  "laravel-pint": "Do not substitute Laravel's framework mark for this separate tool.",
  "mit-app-inventor": "A suitable monochrome product asset has not been verified.",
};

export function brandFilesForTechnology(id?: string): readonly string[] {
  if (id === "postgresql-supabase") return [technologyBrandAssets.postgresql, technologyBrandAssets.supabase];
  if (!id) return [];
  const asset = technologyBrandAssets[id as keyof typeof technologyBrandAssets];
  return asset ? [asset] : [];
}
