import { Children, isValidElement, type ReactNode } from "react";

/** Uses authored line breaks, not glyph splitting or a clipping mask. One semantic heading. */
export function DisplayLines({ children }: { children: ReactNode }) {
  const lines: ReactNode[][] = [[]];
  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === "br") lines.push([]);
    else lines[lines.length - 1].push(child);
  }
  return <>{lines.map((line, index) => <span className="display-line" key={index}><span className="display-line-content">{line}</span></span>)}</>;
}
