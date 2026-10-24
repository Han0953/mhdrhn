type Checkpoint = { played: Set<string>; portraitUnlocked: boolean };
const readers = new Map<HTMLElement, { profile: string; read: () => Checkpoint }>();
let checkpoints: Map<string, Checkpoint> | undefined;

/** Structural identity survives translated copy and a locale segment remount. */
export function motionElementKey(node: Element, root: Element): string {
  const parts: number[] = [];
  for (let current: Element | null = node; current && current !== root; current = current.parentElement) {
    const parent: Element | null = current.parentElement;
    if (!parent) break;
    parts.push(Array.prototype.indexOf.call(parent.children, current));
  }
  return parts.reverse().join(".");
}
export function registerLanguageCheckpoint(root: HTMLElement, profile: string, read: () => Checkpoint) {
  readers.set(root, { profile, read });
  return () => { readers.delete(root); };
}
export function captureLanguageCheckpoints() {
  checkpoints = new Map();
  for (const [root, {profile, read}] of readers) if (root.isConnected && root.getClientRects().length) checkpoints.set(profile, read());
}
export function languageCheckpoint(profile: string) { return checkpoints?.get(profile); }
export function languageMotionActive() { return checkpoints !== undefined; }
export function releaseLanguageCheckpoints() {
  if (!checkpoints) return;
  checkpoints = undefined;
  window.dispatchEvent(new Event("mhdrhn:language-complete"));
}
