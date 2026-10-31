import React from 'react';
import { fetchRawProjectsDb } from '@/lib/db/repository';
import { getPublishedProjects } from '@/lib/content';
import type { DbProject } from '@/lib/db/schema';
import { ProjectsClient } from './ProjectsClient';

export default async function AdminProjectsPage() {
  const dbProjects = await fetchRawProjectsDb().catch(() => []);

  // Fallback to static projects if DB is not yet populated
  let projects: DbProject[] = dbProjects;
  if (projects.length === 0) {
    const fallbackProjects = getPublishedProjects();
    const electronicsSlugs = new Set(['iot-egg-incubator-blynk', 'air-quality-monitoring', 'smart-home-iot', 'industrial-machine-safety', 'drone-stm32']);

    projects = fallbackProjects.map((p, idx) => ({
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle || '',
      summary: p.summary,
      categories: p.categories,
      year: p.year || 2026,
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
      homeCollection: electronicsSlugs.has(p.slug) ? 'electronics' : (idx < 5 ? 'latest' : 'none'),
      orderIndex: idx,
      visible: true,
      updatedAt: 0,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="font-mono text-xs text-accent font-semibold tracking-wider uppercase block">
          [CATALOG_MANAGEMENT]
        </span>
        <h1 className="font-display text-2xl font-bold text-ink mt-0.5">
          Manajemen Proyek Portofolio
        </h1>
        <p className="text-xs text-ink/70 font-sans mt-1">
          Atur metadata proyek, urutan tampil, penempatan rail di halaman Home, serta status publikasi.
        </p>
      </div>

      <ProjectsClient initialProjects={projects} />
    </div>
  );
}
