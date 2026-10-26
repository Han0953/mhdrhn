"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useSyncExternalStore, type ReactNode, type PointerEvent, type FocusEvent, type MouseEventHandler } from "react";
import { SiteLink } from "@/components/layout/RouteTransition";
import { prefersReducedMotion, subscribeMotion } from "@/lib/motion/preferences";

/** Share the fill while keeping native link/button activation and route behavior. */
function useOriginFill(disabled = false) {
  const reduced = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [circle, setCircle] = useState({ x: 0, y: 0, diameter: 0 });
  const filled = !disabled && (hovered || focused || pressed);

  function measure(node: HTMLElement, x?: number, y?: number) {
    const rect = node.getBoundingClientRect();
    const cx = x === undefined ? rect.width / 2 : x - rect.left;
    const cy = y === undefined ? rect.height / 2 : y - rect.top;
    const diameter = Math.ceil(2 * Math.max(
      Math.hypot(cx, cy), Math.hypot(rect.width - cx, cy),
      Math.hypot(cx, rect.height - cy), Math.hypot(rect.width - cx, rect.height - cy),
    ));
    setCircle({ x: cx, y: cy, diameter });
  }

  function pointerOrigin(event: PointerEvent<HTMLElement>) {
    measure(event.currentTarget, event.clientX, event.clientY);
  }

  const interaction = {
    "data-filled": filled ? "true" : "false",
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      if (disabled || event.pointerType === "touch" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      pointerOrigin(event); setHovered(true);
    },
    onPointerLeave: () => { setHovered(false); setPressed(false); },
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (disabled || event.button !== 0) return;
      pointerOrigin(event); setPressed(true);
    },
    onPointerUp: () => setPressed(false),
    onPointerCancel: () => { setPressed(false); setHovered(false); },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (disabled || !event.currentTarget.matches(":focus-visible")) return;
      measure(event.currentTarget); setFocused(true);
    },
    onBlur: () => { setFocused(false); setPressed(false); setHovered(false); },
  };
  const fill = <motion.span aria-hidden="true" className="origin-fill" initial={false}
      animate={{ scale: filled ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ left: circle.x, top: circle.y, width: circle.diameter, height: circle.diameter }}/>;
  return { interaction, fill };
}

export function OriginLink({ href, children, transition = true }: { href: string; children: ReactNode; transition?: boolean }) {
  const { interaction, fill } = useOriginFill();
  const Component = transition ? SiteLink : Link;
  return <Component href={href} className="button-primary origin-action" {...interaction}>
    {fill}<span className="origin-label">{children}</span>
  </Component>;
}

export function OriginButton({ children, disabled = false, onClick }: { children: ReactNode; disabled?: boolean; onClick?: MouseEventHandler<HTMLButtonElement> }) {
  const { interaction, fill } = useOriginFill(disabled);
  return <button type="button" className="button-primary origin-action" disabled={disabled} onClick={onClick} {...interaction}>
    {fill}<span className="origin-label">{children}</span>
  </button>;
}
