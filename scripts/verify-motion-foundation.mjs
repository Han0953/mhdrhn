import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadMotion } from './motion-test-support.mjs';

const results = [];
function check(name, test) { test(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); }
function emitter(initial = {}) {
  const listeners = new Map();
  return Object.assign(initial, { listeners,
    addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); },
    removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
    emit(type, event = {}) { for (const callback of [...(listeners.get(type) ?? [])]) callback(event); },
    count() { return [...listeners.values()].reduce((sum, set) => sum + set.size, 0); },
  });
}
function environment() {
  let stored = null, failRead = false, failWrite = false, serial = 0;
  const timers = new Map(), frames = new Map(), observers = [];
  const media = emitter({ matches: false });
  const window = emitter({ matchMedia: () => media, localStorage: {
    getItem() { if (failRead) throw Error('read blocked'); return stored; },
    setItem(_key, value) { if (failWrite) throw Error('write blocked'); stored = value; },
  } });
  const document = emitter({ hidden: false, activeElement: null, documentElement: { dataset: {} } });
  class ResizeObserver { constructor(fn) { this.fn = fn; observers.push(this); } observe() {} disconnect() { this.disconnected = true; } }
  const globals = { window, document, ResizeObserver,
    setTimeout(fn, delay) { const id = ++serial; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    requestAnimationFrame(fn) { const id = ++serial; frames.set(id, fn); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
  };
  const cache = new Map();
  const preference = loadMotion('src/lib/motion/preferences.ts', globals, cache);
  const disclosure = loadMotion('src/lib/motion/disclosure.ts', globals, cache);
  const dialogMotion = loadMotion('src/lib/motion/dialog.ts', globals, cache);
  return { ...globals, media, timers, frames, observers, preference, disclosure, dialogMotion,
    get stored() { return stored; },
    store(value) { stored = value; },
    block(read, write) { failRead = read; failWrite = write; },
    flushFrames() { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()); },
  };
}
function fixture({ waapi = true, throws = false } = {}) {
  const e = environment();
  let height = 120, visual;
  const animations = [];
  const summary = emitter({ focus() { e.document.activeElement = summary; } });
  const body = { getBoundingClientRect: () => ({ height }) };
  const style = { removeProperty(key) { delete this[key]; } };
  const child = {};
  const content = { style, inert: false, contains: node => node === child,
    getBoundingClientRect: () => ({ height: visual ?? (details.open ? height : 0) }),
  };
  if (waapi) content.animate = (keyframes, options) => {
    if (throws) throw Error('WAAPI failed');
    const animation = { keyframes, options, cancel() { this.cancelled = true; this.oncancel?.(); } };
    animations.push(animation); return animation;
  };
  const details = emitter({ open: false, dataset: {}, querySelector(selector) { return { summary, '.disclosure-content': content, '.disclosure-body': body }[selector]; } });
  const cleanup = e.disclosure.mountDisclosure(details);
  return { ...e, details, summary, content, body, animations, cleanup, child,
    click() { const event = { button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } }; summary.emit('click', event); if (!event.defaultPrevented) { details.open = !details.open; details.emit('toggle'); } return event; },
    finish() { animations.at(-1)?.onfinish?.(); },
    resize(value) { height = value; e.observers[0].fn(); e.flushFrames(); },
    visual(value) { visual = value; },
  };
}

check('server preference is system with reduced enhancement and no browser access', () => {
  const store = loadMotion('src/lib/motion/preferences.ts');
  assert.equal(store.getMotionPreference(), 'system'); assert.equal(store.prefersReducedMotion(), true);
});
check('minimal persists and wins over a motion-enabled OS', () => {
  const e = environment(); const off = e.preference.subscribeMotion(() => {});
  e.preference.setMotionPreference('minimal'); assert.equal(e.stored, 'minimal');
  assert.equal(e.preference.prefersReducedMotion(), true); assert.equal(e.document.documentElement.dataset.motion, 'minimal'); off();
});
check('system follows live OS preference without changing the stored setting', () => {
  const e = environment(); let calls = 0; const off = e.preference.subscribeMotion(() => calls++);
  e.media.matches = true; e.media.emit('change'); assert.equal(e.preference.prefersReducedMotion(), true);
  e.media.matches = false; e.media.emit('change'); assert.equal(e.preference.prefersReducedMotion(), false);
  assert.equal(calls, 2); assert.equal(e.stored, null); off();
});
check('cross-tab storage changes and clear update the root and subscribed snapshot', () => {
  const e = environment(); let calls = 0; const off = e.preference.subscribeMotion(() => calls++);
  e.store('minimal'); e.window.emit('storage', { key: 'mhdrhn-motion' });
  assert.equal(e.document.documentElement.dataset.motion, 'minimal');
  e.store(null); e.window.emit('storage', { key: null }); assert.equal(e.preference.getMotionPreference(), 'system');
  e.window.emit('storage', { key: 'unrelated' }); assert.equal(calls, 2); off();
});
check('invalid storage is ignored; both blocked reads and blocked writes retain session choice', () => {
  const e = environment(); e.store('invalid'); assert.equal(e.preference.getMotionPreference(), 'system');
  e.block(false, true); e.preference.setMotionPreference('minimal'); assert.equal(e.preference.getMotionPreference(), 'minimal');
  e.block(true, true); e.preference.setMotionPreference('system'); assert.equal(e.preference.getMotionPreference(), 'system');
  e.block(false, false); e.preference.setMotionPreference('minimal'); assert.equal(e.stored, 'minimal');
});
check('twenty subscription cycles share one OS/storage listener and release both', () => {
  const e = environment();
  for (let i = 0; i < 20; i++) { const a = e.preference.subscribeMotion(() => {}), b = e.preference.subscribeMotion(() => {});
    assert.equal(e.media.count(), 1); assert.equal(e.window.count(), 1); a(); assert.equal(e.media.count(), 1); b(); assert.equal(e.media.count(), 0); assert.equal(e.window.count(), 0); }
});
check('generation invalidates stale callbacks; disposal is idempotent and late cleanup runs', () => {
  const { createMotionLifetime } = loadMotion('src/lib/motion/lifecycle.ts'); const lifetime = createMotionLifetime(); let calls = 0;
  const first = lifetime.advance(), second = lifetime.advance(); assert.equal(lifetime.current(first), false); assert.equal(lifetime.current(second), true);
  lifetime.onCleanup(() => calls++); lifetime.dispose(); lifetime.dispose(); lifetime.onCleanup(() => calls++);
  assert.equal(lifetime.current(second), false); assert.equal(calls, 2);
});
check('disclosure starts closed; opening settles to intrinsic height with no retained clipping', () => {
  const t = fixture(); assert.equal(t.details.open, false); assert.equal(t.click().defaultPrevented, true);
  assert.equal(t.details.open, true); assert.equal(t.details.dataset.motionState, 'opening');
  assert.equal(t.animations[0].options.duration, 480); t.finish();
  assert.equal(t.content.style.height, undefined); assert.equal(t.content.style.overflow, undefined); assert.equal(t.content.inert, false); assert.equal(t.timers.size, 0); t.cleanup();
});
check('closing returns focus to summary and prevents focus entering collapsing content', () => {
  const t = fixture(); t.click(); t.finish(); t.document.activeElement = t.child; t.click();
  assert.equal(t.content.inert, true); assert.equal(t.document.activeElement, t.summary); assert.equal(t.details.open, true);
  assert.equal(t.animations.at(-1).options.duration, 380); t.finish(); assert.equal(t.details.open, false); assert.equal(t.content.inert, false); t.cleanup();
});
check('twenty rapid reversals preserve visual height and reject stale animation finishes', () => {
  const t = fixture(); t.click(); const stale = t.animations[0].onfinish; t.visual(47);
  for (let i = 0; i < 20; i++) t.click(); stale();
  assert.equal(t.details.dataset.motionState, 'opening'); assert.equal(t.animations.at(-1).keyframes[0].height, '47px');
  assert.equal(t.timers.size, 1); t.finish(); assert.equal(t.details.open, true); t.cleanup();
});
check('body resize retargets open content and coalesces observer callbacks into one RAF', () => {
  const t = fixture(); t.click(); t.finish(); t.observers[0].fn(); t.observers[0].fn(); assert.equal(t.frames.size, 1); t.flushFrames();
  assert.equal(t.animations.length, 1); t.resize(220); assert.equal(t.animations.at(-1).keyframes[1].height, '220px');
  t.finish(); assert.equal(t.details.open, true); assert.equal(t.content.style.height, undefined); t.cleanup();
});
check('switching to Minimal during animation settles the requested state immediately', () => {
  const t = fixture(); t.click(); t.preference.setMotionPreference('minimal');
  assert.equal(t.details.open, true); assert.equal(t.details.dataset.motionState, 'idle'); assert.equal(t.timers.size, 0);
  const count = t.animations.length; assert.equal(t.click().defaultPrevented, false); assert.equal(t.details.open, false); assert.equal(t.animations.length, count); t.cleanup();
});
check('hidden documents settle pending close and clear its watchdog', () => {
  const t = fixture(); t.click(); t.finish(); t.click(); t.document.hidden = true; t.document.emit('visibilitychange');
  assert.equal(t.details.open, false); assert.equal(t.timers.size, 0); assert.equal(t.content.style.height, undefined); t.cleanup();
});
check('no WAAPI preserves native disclosure; thrown WAAPI settles without losing content', () => {
  const native = fixture({ waapi: false }); assert.equal(native.click().defaultPrevented, false); assert.equal(native.details.open, true); native.cleanup();
  const broken = fixture({ throws: true }); broken.click(); assert.equal(broken.details.open, true); assert.equal(broken.content.style.height, undefined); assert.equal(broken.content.inert, false); broken.cleanup();
});
check('native external toggles (including browser find) take precedence while idle or closing', () => {
  const t = fixture(); t.details.open = true; t.details.emit('toggle'); assert.equal(t.details.dataset.motionState, 'idle');
  t.click(); t.details.open = false; t.details.emit('toggle'); assert.equal(t.timers.size, 0); assert.equal(t.content.inert, false); t.cleanup();
});
check('watchdog recovers a missing WAAPI finish without retaining fixed height', () => {
  const t = fixture(); t.click(); const task = [...t.timers.values()][0]; assert.equal(task.delay, 600); task.fn();
  assert.equal(t.details.open, true); assert.equal(t.content.style.height, undefined); assert.equal(t.timers.size, 0); t.cleanup();
});
check('twenty mount/unmount cycles release animations, RAF, observers, timers and subscriptions', () => {
  for (let i = 0; i < 20; i++) { const t = fixture(); t.click(); const stale = t.animations[0].onfinish; t.observers[0].fn(); t.cleanup(); stale();
    assert.equal(t.animations[0].cancelled, true); assert.equal(t.timers.size, 0); assert.equal(t.frames.size, 0);
    assert.equal(t.observers[0].disconnected, true); assert.equal(t.window.count(), 0); assert.equal(t.media.count(), 0);
    assert.equal(t.document.count(), 0); assert.equal(t.summary.count(), 0); assert.equal(t.details.count(), 0); assert.equal(t.details.dataset.motionState, undefined); assert.equal(t.content.inert, false); }
});

function panel({waapi=true,throws=false}={}) {
  const e=environment(),animations=[];
  const dialog=emitter({open:false,dataset:{},showModal(){this.open=true;},close(){this.open=false;this.emit('close');}});
  if(waapi)dialog.animate=(frames,options)=>{if(throws)throw Error('WAAPI');const a={frames,options,cancel(){this.cancelled=true;}};animations.push(a);return a;};
  return {...e,dialog,animations,controller:e.dialogMotion.mountDialog(dialog,true),finish(){animations.at(-1)?.onfinish?.();}};
}
check('menu panel uses native modal, bounded entrance and exit, releasing native close at completion',()=>{
 const t=panel();t.controller.open();assert.equal(t.dialog.open,true);assert.equal(t.animations[0].frames[0].transform,'translateX(40px)');t.finish();assert.equal(t.dialog.dataset.motionState,undefined);t.controller.close();assert.equal(t.dialog.open,true);assert.equal(t.dialog.dataset.motionState,'closing');t.finish();assert.equal(t.dialog.open,false);assert.equal(t.timers.size,0);t.controller.dispose();
});
check('twenty panel reversals and stale exit finishes cannot close a reopened modal',()=>{
 const t=panel();t.controller.open();t.finish();t.controller.close();const old=t.animations.at(-1).onfinish;for(let i=0;i<20;i++){t.controller.open();t.controller.close();}t.controller.open();old();assert.equal(t.dialog.open,true);t.finish();assert.equal(t.timers.size,0);t.controller.dispose();
});
check('navigation native-close cancels panel exit, its watchdog and stale completion',()=>{
 const t=panel();t.controller.open();t.finish();t.controller.close();const old=t.animations.at(-1).onfinish;t.dialog.close();old();assert.equal(t.dialog.open,false);assert.equal(t.timers.size,0);assert.equal(t.dialog.dataset.motionState,undefined);t.controller.dispose();
});
check('Minimal and hidden-document transitions settle panels without a delayed close',()=>{
 for(const mode of ['minimal','hidden']){const t=panel();t.controller.open();t.finish();t.controller.close();if(mode==='minimal')t.preference.setMotionPreference('minimal');else{t.document.hidden=true;t.document.emit('visibilitychange');}assert.equal(t.dialog.open,false);assert.equal(t.timers.size,0);t.controller.dispose();}
});
check('missing or throwing WAAPI keeps native panel open/close usable',()=>{
 for(const options of [{waapi:false},{throws:true}]){const t=panel(options);t.controller.open();assert.equal(t.dialog.open,true);t.controller.close();assert.equal(t.dialog.open,false);assert.equal(t.timers.size,0);t.controller.dispose();}
});
check('twenty panel unmounts release preference/document/native listeners and animations',()=>{
 for(let i=0;i<20;i++){const t=panel();t.controller.open();const old=t.animations.at(-1).onfinish;t.controller.dispose();old();assert.equal(t.timers.size,0);assert.equal(t.document.count(),0);assert.equal(t.window.count(),0);assert.equal(t.media.count(),0);assert.equal(t.dialog.count(),0);assert.equal(t.animations[0].cancelled,true);}
});
const directory = process.env.MHDRHN_QA_MOTION_EVIDENCE || 'docs/execution/evidence/p2-a-2026-10-21';
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(`${directory}/motion-foundation-checks.json`, JSON.stringify({ method: 'Real TypeScript controllers with deterministic DOM/storage/WAAPI/OS doubles; does not prove browser rendering or frame performance.', results }, null, 2));
console.log(`${results.length} motion foundation checks passed.`);
