"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // Initial check
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 z-45 flex h-10 w-10 items-center justify-center rounded-xl border border-electric/30 bg-card/85 text-electric shadow-lg shadow-electric/5 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-electric hover:bg-electric hover:text-white hover:shadow-electric/25 active:scale-95",
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      )}
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
