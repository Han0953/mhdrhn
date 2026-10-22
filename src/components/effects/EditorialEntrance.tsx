import type { ReactNode } from "react";

/** Selective, once-only movement. Text remains visible even without JS or WAAPI. */
export function EditorialEntrance({ children }: { children: ReactNode }) {
  return <div className="editorial-entrance" data-editorial-entrance>{children}</div>;
}
