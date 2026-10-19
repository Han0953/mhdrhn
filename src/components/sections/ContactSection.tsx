"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { personalInfo } from "@/lib/data";
import { MapPin, Mail, Send } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function ContactSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(".contact-card", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const contactItems: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    href: string | null;
    color: string;
    bg: string;
  }[] = [
    {
      icon: MapPin,
      label: "Location",
      value: personalInfo.location,
      href: null,
      color: "text-electric",
      bg: "bg-electric/10",
    },
    {
      icon: GithubIcon,
      label: "GitHub",
      value: personalInfo.github.username,
      href: personalInfo.github.url,
      color: "text-foreground",
      bg: "bg-muted",
    },
    {
      icon: Mail,
      label: "Email",
      value: personalInfo.email,
      href: null,
      color: "text-emerald-brand",
      bg: "bg-emerald-brand/10",
    },
    {
      icon: LinkedinIcon,
      label: "LinkedIn",
      value: personalInfo.linkedin,
      href: null,
      color: "text-electric",
      bg: "bg-electric/10",
    },
  ];

  return (
    <section
      id="contact"
      className="section-padding relative"
      aria-label="Contact"
    >
      <div className="container-main" ref={containerRef}>
        <SectionHeading
          number="07"
          title="Get In Touch"
          subtitle="Let's connect and build something together"
          gradient="accent"
        />

        <div className="mx-auto max-w-2xl">
          {/* Contact Info Cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const isPlaceholder =
                item.value === "Belum Ditambahkan" ||
                item.value === "Opsional";

              const content = (
                <div className="contact-card card-hover flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-4 sm:p-5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p
                      className={`mt-0.5 truncate text-sm font-semibold ${
                        isPlaceholder
                          ? "text-muted-foreground italic"
                          : "text-foreground"
                      }`}
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              );

              if (item.href) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-transform hover:-translate-y-1"
                  >
                    {content}
                  </a>
                );
              }

              return <div key={item.label}>{content}</div>;
            })}
          </div>

          {/* CTA */}
          <div className="contact-card mt-16 rounded-2xl border border-electric/20 bg-gradient-to-br from-electric/5 to-cyan-brand/5 p-6 text-center sm:p-8">
            <Send className="mx-auto mb-3 h-8 w-8 text-electric" />
            <h3 className="text-lg font-bold text-foreground sm:text-xl">
              Interested in collaboration?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              I&apos;m always open to discussing new projects, research
              opportunities, and innovative ideas.
            </p>
            <a
              href={personalInfo.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-electric px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-electric/25 transition-all duration-300 hover:shadow-xl hover:shadow-electric/30 hover:-translate-y-0.5"
            >
              <GithubIcon className="h-4 w-4" />
              Connect on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
