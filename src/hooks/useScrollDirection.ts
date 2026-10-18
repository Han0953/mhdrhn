"use client";

import { useState, useEffect } from "react";

type ScrollDirection = "up" | "down" | null;

export function useScrollDirection(threshold = 10) {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDir = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsAtTop(currentScrollY < 50);

      if (Math.abs(currentScrollY - lastScrollY) < threshold) {
        ticking = false;
        return;
      }

      setScrollDirection(currentScrollY > lastScrollY ? "down" : "up");
      lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { scrollDirection, scrollY, isAtTop };
}
