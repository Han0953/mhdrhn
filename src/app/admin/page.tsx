import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FolderKanban,
  History,
  Cpu,
  FileBadge,
  SlidersHorizontal,
  Plus,
  Sparkles,
} from 'lucide-react';
import {
  fetchRawProjectsDb,
  fetchRawExperiencesDb,
  fetchRawSkillGroupsDb,
  fetchRawCertificatesDb,
} from '@/lib/db/repository';
import { getPublishedProjects } from '@/lib/content';
import { experienceGroups, skillGroups } from '@/lib/portfolio';
import { certificates, getProjectMedia } from '@/lib/media';

export default async function AdminOverviewPage() {
  const dbProjects = await fetchRawProjectsDb().catch(() => []);
  const dbExperiences = await fetchRawExperiencesDb().catch(() => []);
  const dbSkills = await fetchRawSkillGroupsDb().catch(() => []);
  const dbCerts = await fetchRawCertificatesDb().catch(() => []);

  const hasDbData = dbProjects.length > 0;

  const projects = hasDbData
    ? dbProjects
    : getPublishedProjects().map((p, idx) => ({
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle || '',
        summary: p.summary,
        year: p.year,
        coverImage: getProjectMedia(p.slug)[0]?.src || '/project/web/vircuit.webp',
        categories: p.categories,
        context: p.context || '',
        role: p.role || '',
        technologies: p.technologies || [],
        approach: p.approach || '',
        limitation: p.limitation || '',
        featured: p.featured || idx + 1,
        visual: p.visual || 'circuit',
        link: p.link || '',
        source: p.source || '',
        status: p.status,
        homeCollection: (idx < 5 ? 'latest' : 'none') as 'latest' | 'electronics' | 'none',
        orderIndex: idx,
        visible: true,
        updatedAt: 0,
      }));

  const projectCount = projects.length;
  const homeProjectsCount = projects.filter(
    (p) => p.homeCollection && p.homeCollection !== 'none'
  ).length;

  const expCount = hasDbData
    ? dbExperiences.length
    : experienceGroups.flatMap((g) => g.items).length;

  const skillGroupCount = hasDbData ? dbSkills.length : skillGroups.length;
  const certCount = hasDbData ? dbCerts.length : certificates.length;

  return (
    <div className="space-y-8">
      {/* ============================================================ */}
      {/* OPERATOR PROFILE & TELEMETRY BANNER */}
      {/* ============================================================ */}
      <div className="border border-border/80 bg-surface/70 backdrop-blur-xs p-6 sm:p-8 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Operator Identity */}
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 border-2 border-accent p-0.5 bg-canvas shadow-md">
              <Image
                src="/foto-profile.webp"
                alt="Muhammad Rehan"
                width={80}
                height={80}
                className="w-full h-full object-cover"
                priority
              />
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-canvas"
                title="Sistem Siap Operasi"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] sm:text-[11px] text-accent font-bold tracking-widest uppercase">
                  [SYSTEM_OPERATOR]
                </span>
                <span className="font-mono text-[10px] text-ink/60 border border-border/60 px-1.5 py-0.2 bg-canvas/40">
                  FIRESTORE NODE
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                Muhammad Rehan
              </h1>
              <p className="text-xs sm:text-sm text-ink/70 font-sans max-w-xl">
                Pusat Kendali Portofolio · Kelola rekaman proyek, pengalaman, keahlian, dan tata letak dinamis halaman utama.
              </p>
            </div>
          </div>

          {/* Telemetry Status Beacon */}
          <div className="flex flex-col sm:items-end justify-center font-mono text-xs space-y-1.5 border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-6 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              <span className="font-bold text-ink">
                STATUS: {hasDbData ? 'CLOUD FIRESTORE' : 'LOCAL FALLBACK'}
              </span>
            </div>
            <div className="text-[11px] text-ink/60">
              PROYEK: <span className="text-accent font-semibold">{projectCount}</span> · DI HOME: <span className="text-accent font-semibold">{homeProjectsCount}</span>
            </div>
            <div className="text-[11px] text-ink/50">
              SESI: AES-GCM ENCRYPTED
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* METRIC OVERVIEW CARDS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects */}
        <Link
          href="/admin/projects"
          className="border border-border/80 p-5 bg-surface/50 hover:border-accent hover:bg-surface transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-start font-mono text-xs text-ink/60">
            <div className="flex items-center gap-2">
              <FolderKanban size={15} className="text-accent" />
              <span className="font-bold">01 // PROYEK</span>
            </div>
            <span className="text-accent group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
          <div className="mt-4 font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            {projectCount}
          </div>
          <div className="mt-2 text-xs font-mono text-accent flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>{homeProjectsCount} aktif di Home</span>
          </div>
        </Link>

        {/* Experiences */}
        <Link
          href="/admin/experiences"
          className="border border-border/80 p-5 bg-surface/50 hover:border-accent hover:bg-surface transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-start font-mono text-xs text-ink/60">
            <div className="flex items-center gap-2">
              <History size={15} className="text-accent" />
              <span className="font-bold">02 // PENGALAMAN</span>
            </div>
            <span className="text-accent group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
          <div className="mt-4 font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            {expCount}
          </div>
          <div className="mt-2 text-xs font-mono text-ink/70">
            Lab · Riset · Organisasi
          </div>
        </Link>

        {/* Skills */}
        <Link
          href="/admin/skills"
          className="border border-border/80 p-5 bg-surface/50 hover:border-accent hover:bg-surface transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-start font-mono text-xs text-ink/60">
            <div className="flex items-center gap-2">
              <Cpu size={15} className="text-accent" />
              <span className="font-bold">03 // KEAHLIAN</span>
            </div>
            <span className="text-accent group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
          <div className="mt-4 font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            {skillGroupCount}
          </div>
          <div className="mt-2 text-xs font-mono text-ink/70">
            Hardware · IoT · Web Dev
          </div>
        </Link>

        {/* Certificates */}
        <Link
          href="/admin/certificates"
          className="border border-border/80 p-5 bg-surface/50 hover:border-accent hover:bg-surface transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-start font-mono text-xs text-ink/60">
            <div className="flex items-center gap-2">
              <FileBadge size={15} className="text-accent" />
              <span className="font-bold">04 // SERTIFIKAT</span>
            </div>
            <span className="text-accent group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
          <div className="mt-4 font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            {certCount}
          </div>
          <div className="mt-2 text-xs font-mono text-accent">
            Pratinjau Berkas & URL
          </div>
        </Link>
      </div>

      {/* ============================================================ */}
      {/* QUICK ACTIONS & PRIMARY CONTROLS */}
      {/* ============================================================ */}
      <div className="border border-border/80 bg-surface/60 p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-accent" />
              <span className="font-mono text-xs text-accent font-bold uppercase tracking-wider">
                [HOME_LAYOUT_ORCHESTRATOR]
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight">
              Kustomisasi Tata Letak & Urutan Halaman Utama
            </h2>
            <p className="text-xs sm:text-sm text-ink/70 font-sans max-w-2xl leading-relaxed">
              Atur urutan penayangan section (Hero, Proyek Pilihan, Elektronika & IoT, Rekam Jejak, Sertifikat), serta sesuaikan teks rotating roles di Hero utama.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/admin/home-layout"
              className="inline-flex items-center gap-2 px-5 py-3 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-xs"
            >
              <span>Atur Layout Home</span>
              <span>→</span>
            </Link>

            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-2 px-5 py-3 border border-border bg-canvas hover:border-accent text-ink hover:text-accent font-mono text-xs uppercase tracking-wider font-semibold transition-all"
            >
              <Plus size={14} />
              <span>Tambah Proyek Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RECENT PROJECTS MEDIA SHOWCASE */}
      {/* ============================================================ */}
      <div className="border border-border/80 bg-surface/50 p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-accent" />
              <span className="font-mono text-[11px] text-accent font-bold tracking-widest uppercase">
                [PROJECT_REGISTRY]
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-ink mt-0.5">
              Pratinjau Proyek & Sampul Visual
            </h3>
          </div>

          <Link
            href="/admin/projects"
            className="font-mono text-xs text-ink/70 hover:text-accent flex items-center gap-1 transition-colors"
          >
            <span>Semua Proyek ({projects.length})</span>
            <span>→</span>
          </Link>
        </div>

        {/* Project Thumbnail Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.slice(0, 6).map((proj) => {
            const cover = proj.coverImage || '/project/web/vircuit.webp';
            return (
              <div
                key={proj.slug}
                className="border border-border/70 bg-canvas/70 hover:border-accent transition-all overflow-hidden flex flex-col group"
              >
                {/* Media Image Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/10 border-b border-border/60">
                  <Image
                    src={cover}
                    alt={proj.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    {proj.homeCollection && proj.homeCollection !== 'none' && (
                      <span className="bg-accent text-white font-mono text-[9px] uppercase px-1.5 py-0.5 font-bold tracking-wide shadow-xs">
                        HOME: {proj.homeCollection === 'latest' ? 'RAIL 1' : 'RAIL 2'}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white font-mono text-[10px] px-2 py-0.5">
                    {proj.year || '2026'}
                  </div>
                </div>

                {/* Metadata & Actions */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-display font-bold text-sm text-ink group-hover:text-accent transition-colors line-clamp-1">
                      {proj.title}
                    </h4>
                    <p className="font-mono text-[11px] text-ink/60 mt-0.5">
                      /{proj.slug}
                    </p>
                    <p className="font-sans text-xs text-ink/70 mt-1.5 line-clamp-2">
                      {proj.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 font-mono text-xs">
                    <div className="flex gap-1 text-[10px] text-ink/60">
                      {proj.categories?.slice(0, 2).map((cat) => (
                        <span key={cat} className="px-1.5 py-0.5 border border-border">
                          {cat}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/admin/projects/${proj.slug}`}
                      className="text-accent hover:underline font-semibold"
                    >
                      EDIT →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
