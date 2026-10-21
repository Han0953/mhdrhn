/** Generation checks reject stale finish callbacks; disposal is idempotent. */
export function createMotionLifetime() {
  let generation = 0;
  let disposed = false;
  const cleanups = new Set<() => void>();
  return {
    advance: () => ++generation,
    current: (token: number) => !disposed && token === generation,
    onCleanup(cleanup: () => void) { if (disposed) cleanup(); else cleanups.add(cleanup); },
    dispose() {
      if (disposed) return;
      disposed = true; generation++;
      for (const cleanup of cleanups) cleanup();
      cleanups.clear();
    },
  };
}
