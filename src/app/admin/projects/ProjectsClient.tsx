'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { reorderProjectsAction, deleteProjectAction, saveProjectAction } from '../actions';
import type { DbProject } from '@/lib/db/schema';

interface ProjectsClientProps {
  initialProjects: DbProject[];
}

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [projects, setProjects] = useState<DbProject[]>(initialProjects);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  async function handleMove(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const updated = [...projects];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setProjects(updated);
    setSaving(true);

    try {
      await reorderProjectsAction(updated.map(p => p.slug));
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleHomePlacement(slug: string, collection: 'latest' | 'electronics' | 'none') {
    const proj = projects.find(p => p.slug === slug);
    if (!proj) return;

    const updatedProj = { ...proj, homeCollection: collection };
    setProjects(projects.map(p => (p.slug === slug ? updatedProj : p)));

    await saveProjectAction(updatedProj);
    router.refresh();
  }

  async function handleToggleVisibility(slug: string) {
    const proj = projects.find(p => p.slug === slug);
    if (!proj) return;

    const updatedProj = { ...proj, visible: !proj.visible };
    setProjects(projects.map(p => (p.slug === slug ? updatedProj : p)));

    await saveProjectAction(updatedProj);
    router.refresh();
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Hapus proyek "${title}" (${slug})?`)) return;

    setProjects(projects.filter(p => p.slug !== slug));
    await deleteProjectAction(slug);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Top search & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Cari proyek berdasarkan judul atau slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-surface border border-border px-4 py-2.5 text-sm font-sans text-ink w-full sm:max-w-xs focus:outline-none focus:border-accent"
        />

        <div className="flex items-center gap-3">
          {saving && <span className="font-mono text-xs text-accent animate-pulse">Menyimpan urutan...</span>}
          <Link
            href="/admin/projects/new"
            className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider font-semibold"
          >
            + Tambah Proyek Baru
          </Link>
        </div>
      </div>

      {/* Projects Table / List */}
      <div className="border border-border bg-surface/50 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-canvas/60 font-mono text-ink/70">
              <th className="py-3 px-4 w-12 text-center">NO</th>
              <th className="py-3 px-4">JUDUL & SLUG</th>
              <th className="py-3 px-4">KATEGORI</th>
              <th className="py-3 px-4">PENEMPATAN HOME</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-sans">
            {filteredProjects.map((proj, idx) => (
              <tr key={proj.slug} className="hover:bg-canvas/30 transition-colors">
                {/* Reorder arrows & index */}
                <td className="py-3 px-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="text-ink/60 hover:text-accent disabled:opacity-20 cursor-pointer"
                    >
                      ▲
                    </button>
                    <span className="font-mono font-bold text-accent text-[11px]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      disabled={idx === projects.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="text-ink/60 hover:text-accent disabled:opacity-20 cursor-pointer"
                    >
                      ▼
                    </button>
                  </div>
                </td>

                {/* Title & Slug */}
                <td className="py-3 px-4">
                  <div className="font-display font-bold text-sm text-ink">{proj.title}</div>
                  <div className="font-mono text-[11px] text-ink/60">/{proj.slug} · {proj.year || '2026'}</div>
                </td>

                {/* Categories */}
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                    {proj.categories.map(c => (
                      <span key={c} className="px-1.5 py-0.5 border border-border text-ink/70">
                        {c}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Home Placement Selector */}
                <td className="py-3 px-4">
                  <select
                    value={proj.homeCollection || 'none'}
                    onChange={(e) => handleToggleHomePlacement(proj.slug, e.target.value as 'latest' | 'electronics' | 'none')}
                    className="bg-canvas border border-border px-2 py-1 text-xs font-mono text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="none">Tidak di Home</option>
                    <option value="latest">Rail 1 (Latest Projects)</option>
                    <option value="electronics">Rail 2 (Electronics & IoT)</option>
                  </select>
                </td>

                {/* Visibility */}
                <td className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(proj.slug)}
                    className={`px-2 py-1 font-mono text-[10px] uppercase font-semibold cursor-pointer border ${
                      proj.visible !== false
                        ? 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10'
                        : 'border-border text-ink/40 bg-canvas'
                    }`}
                  >
                    {proj.visible !== false ? '● TAYANG' : '○ DRAFT'}
                  </button>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2 font-mono text-xs">
                    <Link
                      href={`/admin/projects/${proj.slug}`}
                      className="px-2.5 py-1 border border-border hover:border-accent text-ink hover:text-accent"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(proj.slug, proj.title)}
                      className="px-2.5 py-1 border border-border hover:border-accent text-accent hover:bg-accent/10 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
