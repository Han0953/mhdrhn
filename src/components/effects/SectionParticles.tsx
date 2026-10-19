"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";

interface SectionParticlesProps {
  variant?: "about" | "experience" | "projects";
}

export function SectionParticles({ variant = "about" }: SectionParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const themeRef = useRef(resolvedTheme);
  const isVisibleRef = useRef(false);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const lastScrollY = useRef(0);
  const scrollOffset = useRef(0);

  // Smooth pitch and yaw values for mouse-tilt animation
  const currentPitch = useRef(0.8);
  const currentYaw = useRef(-0.3);

  useEffect(() => {
    themeRef.current = resolvedTheme;
  }, [resolvedTheme]);

  const getGridConfig = useCallback((w: number) => {
    if (w < 768) {
      return { cols: 15, rows: 12, spacingX: 28, spacingY: 24 };
    } else if (w < 1024) {
      return { cols: 25, rows: 18, spacingX: 36, spacingY: 30 };
    } else {
      return { cols: 38, rows: 22, spacingX: 44, spacingY: 34 };
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cw = 0;
    let ch = 0;
    const mouse = { x: -9999, y: -9999 };
    const isMobile = () => window.innerWidth < 768;

    const initCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = rect.width;
      ch = rect.height;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
    };

    const draw = () => {
      if (!isVisibleRef.current) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, cw, ch);
      const isDark = themeRef.current === "dark";

      // Time increment
      const speed = prefersReduced ? 0.005 : 0.015;
      timeRef.current += speed;
      const t = timeRef.current;

      // Scroll response
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;
      scrollOffset.current += (scrollDelta * 0.05 - scrollOffset.current) * 0.1;

      // Grid Configuration
      const { cols, rows, spacingX, spacingY } = getGridConfig(cw);

      // 3D Camera/View parameters
      const fov = 400;
      const cameraDistance = 300;
      
      // Default Base Pitch/Yaw depending on variant
      let basePitch = 0.8;
      let baseYaw = -0.3;

      if (variant === "experience") {
        basePitch = 0.9;
        baseYaw = 0.4;
      } else if (variant === "projects") {
        basePitch = 1.0;
        baseYaw = -0.5;
      }

      // Calculate Target Pitch/Yaw based on mouse offset relative to canvas center
      const centerX = cw / 2;
      const centerY = ch / 2 - 20;

      let targetPitch = basePitch;
      let targetYaw = baseYaw;

      if (!isMobile() && mouse.x > 0 && mouse.y > 0) {
        const mouseOffsetX = (mouse.x - centerX) / centerX; // -1.0 to 1.0
        const mouseOffsetY = (mouse.y - centerY) / centerY; // -1.0 to 1.0
        targetYaw = baseYaw + mouseOffsetX * 0.25; // follow mouse yaw
        targetPitch = basePitch + mouseOffsetY * 0.18; // follow mouse pitch
      }

      // Smooth interpolation (lerp)
      currentPitch.current += (targetPitch - currentPitch.current) * 0.08;
      currentYaw.current += (targetYaw - currentYaw.current) * 0.08;

      const pitch = currentPitch.current;
      const yaw = currentYaw.current;

      // Render grid points
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const gridX = (c - cols / 2) * spacingX;
          const gridY = (r - rows / 2) * spacingY;

          // Wave calculations
          let z = 0;
          if (!prefersReduced) {
            if (variant === "about") {
              z = Math.sin(gridX * 0.008 + t) * Math.cos(gridY * 0.006 + t) * 45;
            } else if (variant === "experience") {
              z = Math.sin((gridX + gridY) * 0.006 + t) * 55;
            } else {
              z = (Math.sin(gridX * 0.01 + t) * 35) + (Math.cos(gridY * 0.012 + t * 1.5) * 30);
            }

            // Scroll warp
            z += Math.sin(gridX * 0.015) * scrollOffset.current * 15;

            // Cursor indentation/warp
            if (!isMobile() && mouse.x > 0 && mouse.y > 0) {
              const mx = mouse.x - centerX;
              const my = mouse.y - centerY;
              const dx = gridX - mx;
              const dy = gridY - my;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 180) {
                const force = (180 - dist) / 180;
                z -= force * force * 40;
              }
            }
          }

          // Apply rotation math
          const x1 = gridX * Math.cos(yaw) - z * Math.sin(yaw);
          const z1 = z * Math.cos(yaw) + gridX * Math.sin(yaw);

          const y2 = gridY * Math.cos(pitch) - z1 * Math.sin(pitch);
          const z2 = z1 * Math.cos(pitch) + gridY * Math.sin(pitch);

          // Perspective Projection
          const scale = fov / (fov + z2 + cameraDistance);
          const projX = centerX + x1 * scale;
          const projY = centerY + y2 * scale;

          if (projX < -50 || projX > cw + 50 || projY < -50 || projY > ch + 50) {
            continue;
          }

          // Dist to mouse calculation (in projected space)
          let sizeMultiplier = 1.0;
          if (!isMobile() && mouse.x > 0 && mouse.y > 0) {
            const dxMouse = projX - mouse.x;
            const dyMouse = projY - mouse.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

            if (distMouse < 120) {
              // Close to cursor: shrink down
              sizeMultiplier = 0.25 + 0.75 * (distMouse / 120);
            } else if (distMouse < 320) {
              // Farther away: grow larger (peak of 1.45 size multiplier)
              const tScale = (distMouse - 120) / 200;
              sizeMultiplier = 1.0 + Math.sin(tScale * Math.PI) * 0.45;
            }
          }

          // Base dot size based on depth
          const baseRadius = variant === "projects" ? 1.8 : 1.5;
          const radius = Math.max(0.4, baseRadius * scale * sizeMultiplier);
          
          // Theme adaptation colors (highly saturated neon colors)
          let r_val = 14, g_val = 165, b_val = 233; // Electric blue #0EA5E9
          
          if (variant === "experience") {
            r_val = 6; g_val = 182; b_val = 212; // Cyan #06B6D4
          } else if (variant === "projects") {
            r_val = 99; g_val = 102; b_val = 241; // Indigo/Purple
          }

          // Highly saturated opacity (pekat, tidak soft)
          // Min opacity is 0.45 for dark mode and 0.35 for light mode
          const depthOpacity = Math.max(
            isDark ? 0.45 : 0.35, 
            Math.min(1.0, scale * (isDark ? 0.95 : 0.85))
          );
          
          // Draw the dot at pulled coordinates
          let finalX = projX;
          let finalY = projY;
          if (!isMobile() && mouse.x > 0 && mouse.y > 0) {
            const dxMouse = mouse.x - projX;
            const dyMouse = mouse.y - projY;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            if (distMouse < 220) {
              // Magnet pull force towards cursor
              const pullForce = Math.pow(1 - distMouse / 220, 1.8) * 0.22;
              finalX += dxMouse * pullForce;
              finalY += dyMouse * pullForce;
            }
          }

          ctx.beginPath();
          ctx.arc(finalX, finalY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r_val}, ${g_val}, ${b_val}, ${depthOpacity})`;
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const resizeObs = new ResizeObserver(() => {
      initCanvas();
    });
    resizeObs.observe(container);

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    initCanvas();
    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      resizeObs.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [getGridConfig, variant]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden rounded-[inherit] z-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
