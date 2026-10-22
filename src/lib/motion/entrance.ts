/** Route readiness and page choreography meet here, before the curtain is removed. */
type Entrance = { root: HTMLElement; prepare: () => void; start: (lead?: number) => void; settle: () => void };
const entrances = new Set<Entrance>();

export function registerEntrance(entrance: Entrance) {
  entrances.add(entrance);
  return () => { entrances.delete(entrance); };
}

export function prepareRouteEntrance(main: HTMLElement | null) {
  for (const entrance of entrances) if (main?.contains(entrance.root)) entrance.prepare();
  if (main) main.dataset.entrance = "prepared";
}

export function startRouteEntrance(main: HTMLElement | null) {
  for (const entrance of entrances) if (main?.contains(entrance.root)) entrance.start(.22);
  if (main) main.dataset.entrance = "playing";
}

export function settleRouteEntrance(main: HTMLElement | null) {
  for (const entrance of entrances) if (main?.contains(entrance.root)) entrance.settle();
  if (main) main.dataset.entrance = "settled";
}
