import React from 'react';
import Link from 'next/link';
import {
  fetchRawProjectsDb,
  fetchRawExperiencesDb,
  fetchRawSkillGroupsDb,
  fetchRawCertificatesDb,
} from '@/lib/db/repository';
import { getPublishedProjects } from '@/lib/content';
import { experienceGroups, skillGroups } from '@/lib/portfolio';
import { certificates } from '@/lib/media';

export default async function AdminOverviewPage() {
  // Try fetching from DB, fallback to static counts if DB is not yet populated
  const dbProjects = await fetchRawProjectsDb().catch(() => []);
  const dbExperiences = await fetchRawExperiencesDb().catch(() => []);
  const dbSkills = await fetchRawSkillGroupsDb().catch(() => []);
  const dbCerts = await fetchRawCertificatesDb().catch(() => []);

  const hasDbData = dbProjects.length > 0;

  const projectCount = hasDbData ? dbProjects.length : getPublishedProjects().length;
  const homeProjectsCount = hasDbData
    ? dbProjects.filter(p => p.homeCollection && p.homeCollection !== 'none').length
    : 10;

  const expCount = hasDbData
    ? dbExperiences.length
    : experienceGroups.flatMap(g => g.items).length;

  const skillGroupCount = hasDbData
    ? dbSkills.length
    : skillGroups.length;

  const certCount = hasDbData
    ? dbCerts.length
    : certificates.length;

  return (
    <div className="space-y-10">
      {/* Top Banner / Heading */}
      <div className="border border-border/80 bg-surface/60 p-6 sm:p-8 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] text-accent font-semibold tracking-wider uppercase block">
              [TELEMETRY_DASHBOARD]
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink mt-1">
              Pusat Kendali Portofolio
            </h1>
            <p className="text-sm text-ink/70 mt-1.5 max-w-2xl font-sans">
              Kelola data proyek, pengalaman, keahlian, sertifikasi, serta atur urutan dan posisi section di halaman utama (*Home*).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-xs text-ink/80 font-medium">
              STATUS: {hasDbData ? 'FIRESTORE ACTIVE' : 'LOCAL FALLBACK ACTIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/projects"
          className="border border-border p-5 bg-surface/40 hover:border-accent hover:bg-surface transition-all group"
        >
          <div className="flex justify-between items-start font-mono text-xs text-ink/60">
            <span>01 // PROYEK</span>
            <span className="text-accent group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
          <div className="mt-4 font-display text-3xl font-bold text-ink">
            {projectCount} <span className="text-sm font-sans font-normal text-ink/60">total</span>
          </div>
          <div className="mt-2 text-xs font-mono text-accent">
            {homeProjectsCount} aktif di Home
          </div>
        </Link>

        <Link
          href="/admin/experiences"
          className="border border-border p-5 bg-surface/40 hover:border-accent hover:bg-surface transition-all group"
        >
          <div className="flex justify-between items-start font-mono text-xs text-ink/60">
            <span>02 // PENGALAMAN</span>
            <span className="text-accent group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
          <div className="mt-4 font-display text-3xl font-bold text-ink">
            {expCount} <span className="text-sm font-sans font-normal text-ink/60">rekord</span>
          </div>
          <div className="mt-2 text-xs font-mono text-ink/70">
            Lab · Organisasi · QA
          </div>
        </Link>

        <Link
          href="/admin/skills"
          className="border border-border p-5 bg-surface/40 hover:border-accent hover:bg-surface transition-all group"
        >
          <div className="flex justify-between items-start font-mono text-xs text-ink/60">
            <span>03 // KEAHLIAN</span>
            <span className="text-accent group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
          <div className="mt-4 font-display text-3xl font-bold text-ink">
            {skillGroupCount} <span className="text-sm font-sans font-normal text-ink/60">grup</span>
          </div>
          <div className="mt-2 text-xs font-mono text-ink/70">
            Hardware · IoT · Web
          </div>
        </Link>

        <Link
          href="/admin/certificates"
          className="border border-border p-5 bg-surface/40 hover:border-accent hover:bg-surface transition-all group"
        >
          <div className="flex justify-between items-start font-mono text-xs text-ink/60">
            <span>04 // SERTIFIKAT</span>
            <span className="text-accent group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
          <div className="mt-4 font-display text-3xl font-bold text-ink">
            {certCount} <span className="text-sm font-sans font-normal text-ink/60">arsip</span>
          </div>
          <div className="mt-2 text-xs font-mono text-accent">
            Preview & Tautan Dokumen
          </div>
        </Link>
      </div>

      {/* Control Actions & Section Manager Shortcut */}
      <div className="border border-border p-6 bg-surface/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="font-mono text-xs text-accent font-semibold tracking-wide uppercase block">
              [PRIMARY_CONTROLS]
            </span>
            <h2 className="font-display text-xl font-bold text-ink mt-1">
              Atur Tata Letak & Urutan Halaman Utama (Home)
            </h2>
            <p className="text-xs text-ink/70 mt-1 max-w-xl font-sans">
              Kustomisasi urutan section (Hero, Proyek Terbaru, Proyek Elektronika, Pengalaman, Prestasi), serta teks peran yang berputar di Hero.
            </p>
          </div>

          <Link
            href="/admin/home-layout"
            className="inline-flex items-center justify-center px-6 py-3 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider font-semibold transition-colors shrink-0"
          >
            Buka Manajer Home →
          </Link>
        </div>
      </div>
    </div>
  );
}
