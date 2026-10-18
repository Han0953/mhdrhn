/**
 * Diagnostik B04. Menjalankan effect dari source aktual dengan scheduler dan DOM
 * terkontrol. Bukan renderer React/browser, profiler heap, atau tes 20 route.
 * Tidak mengubah source, memasang paket, maupun membuat file hasil.
 * Jalankan: node scripts/audit-motion-lifecycle.mjs
 * Exit 1 = invariant lifecycle gagal; exit 2 = harness gagal menjalankan source.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function createEnvironment({ reduced = false, desktop = true } = {}) {
  let nextId = 0;
  let mounted = false;
  let effects = [];
  let now = 0;
  const raf = new Map();
  const timers = new Map();
  const intervals = new Map();
  const listeners = new Map();
  const observers = new Set();
  const stats = { callbacksAfterDestroy: 0, stateUpdatesAfterCleanup: 0, contextReverts: 0 };
  const noop = () => {};
  function eventTarget() {
    const target = { style: {}, getBoundingClientRect: () => ({ width: 390, height: 800, top: 0, left: 0 }) };
    target.addEventListener = (type, fn) => {
      let registry = listeners.get(target);
      if (!registry) listeners.set(target, registry = new Map());
      let handlers = registry.get(type);
      if (!handlers) registry.set(type, handlers = new Set());
      handlers.add(fn);
    };
    target.removeEventListener = (type, fn) => listeners.get(target)?.get(type)?.delete(fn);
    target.querySelectorAll = () => [];
    target.getContext = () => new Proxy({}, { get: (_, key) => key === "canvas" ? target : noop });
    return target;
  }
  const document = eventTarget();
  const interactive = eventTarget();
  document.querySelectorAll = () => [interactive];
  const window = Object.assign(eventTarget(), {
    innerWidth: desktop ? 1280 : 390, innerHeight: 800, devicePixelRatio: 1, scrollY: 0,
    matchMedia: () => ({ matches: reduced, addEventListener: noop, removeEventListener: noop }),
  });
  class Observer {
    constructor(callback) { this.callback = callback; observers.add(this); }
    observe(target) { this.target = target; }
    disconnect() { observers.delete(this); }
  }
  class FakeLenis {
    destroyed = false;
    raf() { if (this.destroyed) stats.callbacksAfterDestroy++; }
    destroy() { this.destroyed = true; }
  }
  const react = {
    useRef: value => ({ current: value }),
    useEffect: setup => effects.push(setup),
    useCallback: fn => fn,
    useState: initial => [initial, () => { if (!mounted) stats.stateUpdatesAfterCleanup++; }],
  };
  const jsx = (type, props) => ({ type, props });
  const modules = {
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    lenis: FakeLenis,
    "@/hooks/useMediaQuery": { useMediaQuery: () => desktop },
    "next-themes": { useTheme: () => ({ resolvedTheme: "dark" }) },
    "next/image": noop,
    "lucide-react": new Proxy({}, { get: () => noop }),
    "@/lib/data": { personalInfo: { fullName: "Fixture", semester: 1, gpa: 0 } },
    "@/lib/utils": { cn: (...parts) => parts.filter(Boolean).join(" ") },
    "@/components/effects/SectionParticles": { SectionParticles: noop },
    gsap: { gsap: {
      registerPlugin: noop, from: noop, fromTo: noop,
      context: fn => { fn(); return { revert: () => stats.contextReverts++ }; },
    } },
    "gsap/ScrollTrigger": { ScrollTrigger: {} },
  };
  const fixedMath = Object.create(Math);
  fixedMath.random = () => 0.1; // Memicu cabang glitch secara deterministik.
  const sandbox = {
    console, window, document, Math: fixedMath,
    IntersectionObserver: Observer, ResizeObserver: Observer,
    requestAnimationFrame: fn => { raf.set(++nextId, fn); return nextId; },
    cancelAnimationFrame: id => raf.delete(id),
    setTimeout: fn => { timers.set(++nextId, fn); return nextId; },
    clearTimeout: id => timers.delete(id),
    setInterval: fn => { intervals.set(++nextId, fn); return nextId; },
    clearInterval: id => intervals.delete(id),
    require: name => {
      if (!(name in modules)) throw new Error(`Import belum dimodelkan: ${name}`);
      return modules[name];
    },
  };
  function frame() {
    now += 16;
    for (const [id, fn] of [...raf]) { raf.delete(id); fn(now); }
  }
  function attachRefs(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach(attachRefs); return; }
    if (node.props?.ref) node.props.ref.current = eventTarget();
    attachRefs(node.props?.children);
  }
  function mount(Component) {
    effects = [];
    mounted = true;
    attachRefs(Component({ children: null }));
    const cleanup = effects.map(fn => fn());
    return () => { cleanup.reverse().forEach(fn => { if (typeof fn === "function") fn(); }); mounted = false; };
  }
  function counts() {
    return {
      raf: raf.size, timeouts: timers.size, intervals: intervals.size, observers: observers.size,
      listeners: [...listeners.values()].reduce((total, types) => total + [...types.values()].reduce((n, set) => n + set.size, 0), 0),
    };
  }
  return {
    sandbox, stats, mount, frame, counts,
    intersect() { for (const observer of [...observers]) observer.callback([{ isIntersecting: true, target: observer.target }]); },
    tickIntervals() { for (const fn of [...intervals.values()]) fn(); },
    flushTimeouts() { for (const [id, fn] of [...timers]) { timers.delete(id); fn(); } },
  };
}

function loadComponent(file, name, env) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const result = ts.transpileModule(source, { fileName: file, compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } });
  const exports = {};
  vm.runInNewContext(result.outputText, { ...env.sandbox, exports }, { filename: file, timeout: 5000 });
  if (typeof exports[name] !== "function") throw new Error(`Komponen tidak ditemukan: ${name}`);
  return exports[name];
}

const cases = [
  { file: "src/providers/LenisProvider.tsx", name: "LenisProvider" },
  { file: "src/providers/LenisProvider.tsx", name: "LenisProvider", reduced: true },
  { file: "src/components/effects/CursorEffect.tsx", name: "CursorEffect" },
  { file: "src/components/effects/CursorEffect.tsx", name: "CursorEffect", reduced: true },
  { file: "src/components/effects/CursorEffect.tsx", name: "CursorEffect", desktop: false },
  { file: "src/components/effects/SectionParticles.tsx", name: "SectionParticles" },
  { file: "src/components/effects/SectionParticles.tsx", name: "SectionParticles", reduced: true },
  { file: "src/components/ui/ProfileCard.tsx", name: "ProfileCard" },
  { file: "src/components/ui/ProfileCard.tsx", name: "ProfileCard", reduced: true },
  { file: "src/components/ui/SectionContainer.tsx", name: "SectionContainer" },
  { file: "src/components/effects/SectionReveal.tsx", name: "SectionReveal" },
];

try {
  const results = cases.map(spec => {
    const env = createEnvironment(spec);
    const Component = loadComponent(spec.file, spec.name, env);
    let activeBeforeCleanup;
    for (let cycle = 0; cycle < 20; cycle++) {
      const cleanup = env.mount(Component);
      env.frame();
      if (spec.name === "ProfileCard") { env.intersect(); env.tickIntervals(); }
      activeBeforeCleanup = env.counts();
      cleanup();
      env.frame();
    }
    const afterCleanup = env.counts();
    env.flushTimeouts();
    const failures = [];
    if (Object.values(afterCleanup).some(count => count > 0)) failures.push("Resource tersisa sesudah cleanup");
    if (env.stats.callbacksAfterDestroy) failures.push("Callback memakai instance yang sudah destroy");
    if (env.stats.stateUpdatesAfterCleanup) failures.push("Callback state berjalan sesudah cleanup");
    if (spec.reduced && activeBeforeCleanup.raf) failures.push("RAF aktif saat reduced-motion");
    return {
      ...spec, cycles: 20, activeBeforeCleanup, afterCleanup, ...env.stats,
      cleanupInvariant: failures.length ? "FAIL" : "PASS", failures,
    };
  });
  console.log(JSON.stringify({
    method: "Effect source aktual; React hooks/DOM/Lenis/GSAP dan scheduler berupa test doubles; bukan profiling browser/heap atau route cycles",
    timestamp: new Date().toISOString(), results,
  }, null, 2));
  process.exitCode = results.some(r => r.failures.length) ? 1 : 0;
} catch (error) {
  console.error(error);
  process.exitCode = 2;
}
