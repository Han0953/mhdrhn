import React from 'react';
import { notFound } from 'next/navigation';
import { fetchRawProjectsDb } from '@/lib/db/repository';
import { getPublishedProjects } from '@/lib/content';
import type { DbProject } from '@/lib/db/schema';
import { ProjectEditorForm } from './ProjectEditorForm';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminProjectEditPage({ params }: PageProps) {
  const { slug } = await params;
  const isNew = slug === 'new';

  let project: DbProject | undefined;

  if (!isNew) {
    const dbProjects = await fetchRawProjectsDb().catch(() => []);
    project = dbProjects.find(p => p.slug === slug);

    if (!project) {
      // Fallback search in static content
      const fallback = getPublishedProjects().find(p => p.slug === slug);
      if (fallback) {
        project = {
          slug: fallback.slug,
          title: fallback.title,
          subtitle: fallback.subtitle || '',
          summary: fallback.summary,
          categories: fallback.categories,
          year: fallback.year || 2026,
          context: fallback.context || '',
          role: fallback.role || '',
          technologies: fallback.technologies || [],
          approach: fallback.approach || '',
          limitation: fallback.limitation || '',
          featured: fallback.featured || 1,
          visual: fallback.visual || 'circuit',
          link: fallback.link || '',
          source: fallback.source || '',
          status: fallback.status,
          homeCollection: 'none',
          orderIndex: 0,
          visible: true,
          updatedAt: 0,
        };
      }
    }

    if (!project) {
      notFound();
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="font-mono text-xs text-accent font-semibold tracking-wider uppercase block">
          [PROJECT_EDITOR]
        </span>
        <h1 className="font-display text-2xl font-bold text-ink mt-0.5">
          {isNew ? 'Tambah Proyek Baru' : `Edit Proyek: ${project?.title}`}
        </h1>
        <p className="text-xs text-ink/70 font-sans mt-1">
          {isNew
            ? 'Buat entri proyek baru untuk portofolio dan tentukan apakah akan ditampilkan di Home.'
            : `Mengubah metadata, detail case study, serta penempatan di Home untuk /projects/${slug}.`}
        </p>
      </div>

      <ProjectEditorForm initialProject={project} isNew={isNew} />
    </div>
  );
}
