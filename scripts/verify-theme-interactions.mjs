// Deterministic component-handler tests. These do not replace pointer/keyboard browser QA.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const slots = [];
let cursor = 0;
let tree;
let theme = 'system';
let serial = 0;
let dirty = false;
const scheduled = new Map();
const effects = [];
const listeners = { document: new Map(), window: new Map() };
const results = [];
class TestNode {
  constructor(name) { this.name = name; }
  focus() { document.activeElement = this; }
}
const outside = new TestNode('outside');
const trigger = new TestNode('trigger');
const optionNodes = ['light', 'dark', 'system'].map(name => new TestNode(name));
const root = new TestNode('root');
root.contains = node => node === root || node === trigger || optionNodes.includes(node);
root.querySelectorAll = () => optionNodes;
function listen(target) {
  return {
    addEventListener(type, callback) { if (!listeners[target].has(type)) listeners[target].set(type, new Set()); listeners[target].get(type).add(callback); },
    removeEventListener(type, callback) { listeners[target].get(type)?.delete(callback); },
  };
}
const document = { activeElement: outside, ...listen('document') };
const window = { matchMedia: () => ({ matches: true }), ...listen('window') };
const changed = (a, b) => !a || a.length !== b.length || a.some((item, i) => !Object.is(item, b[i]));
const react = {
  useState(initial) {
    const index = cursor++;
    slots[index] ??= { value: initial };
    return [slots[index].value, value => {
      const next = typeof value === 'function' ? value(slots[index].value) : value;
      if (!Object.is(next, slots[index].value)) { slots[index].value = next; dirty = true; }
    }];
  },
  useRef(initial) { const index = cursor++; slots[index] ??= { current: initial }; return slots[index]; },
  useSyncExternalStore(_subscribe, snapshot) { return snapshot(); },
  useCallback(callback, deps) {
    const index = cursor++;
    if (changed(slots[index]?.deps, deps)) slots[index] = { deps, callback };
    return slots[index].callback;
  },
  useEffect(callback, deps) {
    const index = cursor++;
    if (changed(slots[index]?.deps, deps)) effects.push(() => {
      slots[index]?.cleanup?.(); slots[index] = { deps, cleanup: callback(), effect: true };
    });
  },
};
const jsx = (type, props) => ({ type, props });
const source = ts.transpileModule(fs.readFileSync('src/components/ui/ThemeToggle.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const sandbox = {
  exports: {}, document, window, Node: TestNode,
  setTimeout(callback, delay) { const id = ++serial; scheduled.set(id, { callback, delay }); return id; },
  clearTimeout(id) { scheduled.delete(id); },
  require(name) {
    if (name === 'react') return react;
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
    if (name === 'next-themes') return { useTheme: () => ({ theme, setTheme(value) { theme = value; } }) };
    if (name === 'lucide-react') return { Sun: 'Sun', Moon: 'Moon', Monitor: 'Monitor' };
    throw new Error(`Unexpected dependency ${name}`);
  },
};
vm.runInNewContext(source, sandbox, { timeout: 1000 });
function render() {
  let attempts = 0;
  do {
    dirty = false; cursor = 0; tree = sandbox.exports.ThemeToggle();
    tree.props.ref.current = root;
    tree.props.children[0].props.ref.current = trigger;
    effects.splice(0).forEach(run => run());
    assert.ok(++attempts < 10, 'unbounded render loop');
  } while (dirty);
}
const button = () => tree.props.children[0];
const popup = () => tree.props.children[1];
const event = key => ({ key, target: trigger, preventDefault() {}, stopPropagation() {} });
function check(name, test) { test(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); }
render();
check('one trigger, current System icon, closed inert options', () => {
  assert.equal(button().props.children.type, 'Monitor');
  assert.equal(button().props['aria-expanded'], false);
  assert.equal(popup().props.inert, true);
});
check('mouse enter opens three options and pointer bridge cancels pending close', () => {
  tree.props.onPointerEnter({ pointerType: 'mouse' }); render();
  assert.equal(button().props['aria-expanded'], true); assert.equal(popup().props.children.length, 3);
  tree.props.onPointerLeave(); assert.equal(scheduled.size, 1);
  tree.props.onPointerEnter({ pointerType: 'mouse' }); render(); assert.equal(scheduled.size, 0);
});
check('160ms hover tolerance closes when focus is outside', () => {
  tree.props.onPointerLeave(); const [id, task] = [...scheduled][0]; assert.equal(task.delay, 160);
  scheduled.delete(id); task.callback(); render(); assert.equal(button().props['aria-expanded'], false);
});
check('tap and keyboard activation toggle options without hover', () => {
  button().props.onClick({ detail: 1 }); render(); assert.equal(popup().props.inert, false);
  button().props.onClick({ detail: 1 }); render(); assert.equal(popup().props.inert, true);
  button().props.onClick({ detail: 0 }); render(); assert.equal(popup().props.inert, false);
});
check('selecting Dark calls next-themes, marks selection and returns focus', () => {
  popup().props.children[1].props.onClick(); render();
  assert.equal(theme, 'dark'); assert.equal(button().props.children.type, 'Moon');
  assert.equal(popup().props.children[1].props['aria-pressed'], true);
  assert.equal(button().props['aria-expanded'], false); assert.equal(document.activeElement, trigger);
});
check('ArrowDown opens; Escape closes and restores the trigger', () => {
  tree.props.onKeyDown(event('ArrowDown')); render(); assert.equal(popup().props.inert, false);
  tree.props.onKeyDown(event('Escape')); render(); assert.equal(popup().props.inert, true);
  assert.equal(document.activeElement, trigger);
});
check('internal focus stays open and Tab leaving the group closes it', () => {
  button().props.onClick({ detail: 0 }); render();
  tree.props.onBlur({ currentTarget: root, relatedTarget: optionNodes[0] }); render(); assert.equal(popup().props.inert, false);
  tree.props.onBlur({ currentTarget: root, relatedTarget: outside }); render(); assert.equal(popup().props.inert, true);
});
check('outside pointer and browser history close the popover', () => {
  button().props.onClick({ detail: 1 }); render();
  [...listeners.document.get('pointerdown')][0]({ target: outside }); render(); assert.equal(popup().props.inert, true);
  button().props.onClick({ detail: 1 }); render();
  [...listeners.window.get('popstate')][0](); render(); assert.equal(popup().props.inert, true);
});
check('unmount clears hover timeout and every owned listener', () => {
  document.activeElement = outside; tree.props.onPointerEnter({ pointerType: 'mouse' }); render(); tree.props.onPointerLeave();
  slots.filter(slot => slot?.effect).forEach(slot => slot.cleanup?.());
  assert.equal(scheduled.size, 0);
  [...listeners.document.values(), ...listeners.window.values()].forEach(set => assert.equal(set.size, 0));
});
const evidence = process.env.MHDRHN_QA_THEME_EVIDENCE || 'docs/execution/evidence/refinement-2026-10-19/theme-handler-checks.json';
fs.mkdirSync(evidence.slice(0, evidence.lastIndexOf('/')), { recursive: true });
fs.writeFileSync(evidence, JSON.stringify({ method: 'Actual component handlers with JSX, hooks, DOM and timer doubles; not browser QA or storage/system emulation.', results }, null, 2));
console.log(`${results.length} deterministic theme handler checks passed.`);
