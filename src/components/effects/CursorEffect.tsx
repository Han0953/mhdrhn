"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function CursorEffect() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (!isDesktop) return;

    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !dot) return;

    // Check for reduced motion preference
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      requestAnimationFrame(animate);
    };

    // Hover interactions
    const onMouseEnterInteractive = () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1.5)";
      cursor.style.borderColor = "var(--electric)";
      cursor.style.background = "rgba(14, 165, 233, 0.05)";
    };
    const onMouseLeaveInteractive = () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
      cursor.style.borderColor = "var(--electric)";
      cursor.style.background = "transparent";
    };

    document.addEventListener("mousemove", onMouseMove);
    requestAnimationFrame(animate);

    // Add hover effects to interactive elements
    const interactives = document.querySelectorAll(
      "a, button, input, textarea, [role='button']"
    );
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onMouseEnterInteractive);
      el.addEventListener("mouseleave", onMouseLeaveInteractive);
    });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnterInteractive);
        el.removeEventListener("mouseleave", onMouseLeaveInteractive);
      });
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <>
      {/* Outer ring */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed z-[9999] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-electric/40 transition-[transform,background,border-color] duration-200"
        style={{ left: "-100px", top: "-100px" }}
        aria-hidden="true"
      />
      {/* Inner dot */}
      <div
        ref={cursorDotRef}
        className="pointer-events-none fixed z-[9999] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric"
        style={{ left: "-100px", top: "-100px" }}
        aria-hidden="true"
      />
    </>
  );
}
