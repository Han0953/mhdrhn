"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  radius: number;
  colorType: "primary" | "secondary" | "accent" | "research" | "warning";
  pulsePhase: number;
  pulseSpeed: number;
}

interface DataFlow {
  p1: Particle;
  p2: Particle;
  progress: number;
  speed: number;
}

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const themeRef = useRef(resolvedTheme);

  // Sync theme changes to ref so the animation loop always has the latest without restarting
  useEffect(() => {
    themeRef.current = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles: Particle[] = [];
    let dataFlows: DataFlow[] = [];
    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const mouse = { x: -1000, y: -1000, radius: 150 };
    const isMobile = () => window.innerWidth < 768;

    // Brand Colors
    const colors = {
      primary: { hex: "#0EA5E9", rgb: "14, 165, 233" }, // Electric Blue
      secondary: { hex: "#06B6D4", rgb: "6, 182, 212" }, // Cyan
      accent: { hex: "#10B981", rgb: "16, 185, 129" }, // Emerald
      research: { hex: "#8B5CF6", rgb: "139, 92, 246" }, // Purple
      warning: { hex: "#EF4444", rgb: "239, 68, 68" }, // Red
    };

    const initCanvas = () => {
      // Set actual size in memory (scaled to account for pixel ratio for retina displays)
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      initParticles();
    };

    const initParticles = () => {
      particles = [];
      dataFlows = [];
      let particleCount = 200; // Desktop default

      if (width < 768) particleCount = 60; // Mobile
      else if (width < 1024) particleCount = 120; // Tablet

      if (prefersReduced) particleCount = Math.floor(particleCount / 3);

      for (let i = 0; i < particleCount; i++) {
        // Distribution logic based on user prompt
        const rand = Math.random();
        let colorType: Particle["colorType"] = "primary";
        if (rand > 0.7 && rand <= 0.9) colorType = "secondary";
        else if (rand > 0.9 && rand <= 0.98) colorType = "accent";
        else if (rand > 0.98 && rand <= 0.995) colorType = "research";
        else if (rand > 0.995) colorType = "warning";

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (prefersReduced ? 0.2 : 0.8),
          vy: (Math.random() - 0.5) * (prefersReduced ? 0.2 : 0.8),
          baseX: 0,
          baseY: 0,
          radius: Math.random() * 1.5 + 1,
          colorType,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03,
        });
      }
    };

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const isDark = themeRef.current === "dark";
      const lineDist = isMobile() ? 100 : 150;
      
      // Update & Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Movement
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges smoothly
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse interaction (Repel slightly for network effect)
        if (!isMobile() && !prefersReduced) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const dirX = dx / distance;
            const dirY = dy / distance;
            p.x -= dirX * force * 2;
            p.y -= dirY * force * 2;
          }
        }

        p.pulsePhase += p.pulseSpeed;

        // Theming specific rendering
        const rgb = colors[p.colorType].rgb;
        const baseOpacity = isDark ? 0.6 : 0.3;
        const pulseOpacity = baseOpacity + Math.sin(p.pulsePhase) * (isDark ? 0.3 : 0.15);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${Math.max(0.1, pulseOpacity)})`;
        ctx.fill();

        // Active Node Glow (only in dark mode or slightly in light mode)
        if (isDark && (p.colorType === "secondary" || p.colorType === "accent")) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(${rgb}, 0.8)`;
          ctx.fill();
          ctx.shadowBlur = 0; // Reset
        }
      }

      // Draw Connections & Generate Data Flows
      ctx.lineWidth = isDark ? 0.6 : 0.8;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < lineDist) {
            // Draw Line
            const opacity = (1 - dist / lineDist) * (isDark ? 0.25 : 0.15);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${colors.primary.rgb}, ${opacity})`;
            ctx.stroke();

            // Randomly spawn data flow along active connection (rarely)
            if (!prefersReduced && Math.random() < 0.0005) {
              dataFlows.push({
                p1: particles[i],
                p2: particles[j],
                progress: 0,
                speed: 0.02 + Math.random() * 0.02,
              });
            }
          }
        }
      }

      // Draw Data Flows
      for (let i = dataFlows.length - 1; i >= 0; i--) {
        const flow = dataFlows[i];
        flow.progress += flow.speed;

        if (flow.progress >= 1) {
          dataFlows.splice(i, 1);
          continue;
        }

        const currentX = flow.p1.x + (flow.p2.x - flow.p1.x) * flow.progress;
        const currentY = flow.p1.y + (flow.p2.y - flow.p1.y) * flow.progress;

        const rgb = colors.secondary.rgb; // Cyan data flow
        ctx.beginPath();
        ctx.arc(currentX, currentY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${isDark ? 0.9 : 0.6})`;
        ctx.fill();

        if (isDark) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(${rgb}, 1)`;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      initCanvas();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);

    initCanvas();
    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Run once on mount

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
