'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  ImageIcon,
} from 'lucide-react';
import { reorderProjectsAction, deleteProjectAction, saveProjectAction } from '../actions';
import type { DbProject } from '@/lib/db/schema';
import { getProjectMedia } from '@/lib/media';

interface ProjectsClientProps {
  initialProjects: DbProject[];
}

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [projects, setProjects] = useState<DbProject[]>(initialProjects);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filteredProjects = projects.filter(
    (p) =>
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
      await reorderProjectsAction(updated.map((p) => p.slug));
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleHomePlacement(
    slug: string,
    collection: 'latest' | 'electronics' | 'none'
  ) {
    const proj = projects.find((p) => p.slug === slug);
    if (!proj) return;

    const updatedProj = { ...proj, homeCollection: collection };
    setProjects(projects.map((p) => (p.slug === slug ? updatedProj : p)));

    await saveProjectAction(updatedProj);
    router.refresh();
  }

  async function handleToggleVisibility(slug: string) {
    const proj = projects.find((p) => p.slug === slug);
    if (!proj) return;

    const updatedProj = { ...proj, visible: !proj.visible };
    setProjects(projects.map((p) => (p.slug === slug ? updatedProj : p)));

    await saveProjectAction(updatedProj);
    router.refresh();
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Hapus proyek "${title}" (${slug})? Tindakan ini akan menghapus dokumen dari database.`)) {
      return;
    }

    setProjects(projects.filter((p) => p.slug !== slug));
    await deleteProjectAction(slug);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Top search & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink/40">
            <Search size={15} />
          </div>
          <input
            type="text"
            placeholder="Cari proyek berdasarkan judul atau slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border pl-9 pr-4 py-2.5 text-xs sm:text-sm font-sans text-ink focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          {saving && (
            <span className="font-mono text-xs text-accent animate-pulse font-semibold">
              Menyimpan urutan baru...
            </span>
          )}
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-xs"
          >
            <Plus size={15} />
            <span>Tambah Proyek</span>
          </Link>
        </div>
      </div>

      {/* Projects Table */}
      <div className="border border-border bg-surface/50 overflow-x-auto shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-canvas/70 font-mono text-ink/70">
              <th className="py-3 px-3 w-14 text-center">URUTAN</th>
              <th className="py-3 px-3 w-20 text-center">SAMPUL</th>
              <th className="py-3 px-4">JUDUL & SLUG</th>
              <th className="py-3 px-3">KATEGORI</th>
              <th className="py-3 px-3">PENEMPATAN HOME</th>
              <th className="py-3 px-3 text-center">STATUS</th>
              <th className="py-3 px-4 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-sans">
            {filteredProjects.map((proj, idx) => {
              const cover =
                proj.coverImage || getProjectMedia(proj.slug)[0]?.src || '/project/web/vircuit.webp';
              return (
                <tr key={proj.slug} className="hover:bg-canvas/40 transition-colors">
                  {/* Reorder arrows & index */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        className="text-ink/60 hover:text-accent disabled:opacity-20 cursor-pointer p-0.5"
                        title="Geser ke Atas"
                        aria-label="Geser ke Atas"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <span className="font-mono font-bold text-accent text-[11px]">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <button
                        type="button"
                        disabled={idx === projects.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="text-ink/60 hover:text-accent disabled:opacity-20 cursor-pointer p-0.5"
                        title="Geser ke Bawah"
                        aria-label="Geser ke Bawah"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  </td>

                  {/* Media Thumbnail */}
                  <td className="py-3 px-3 text-center">
                    <div className="relative w-16 h-11 mx-auto bg-black/10 border border-border/80 overflow-hidden shrink-0 group">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={proj.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink/40">
                          <ImageIcon size={14} />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title & Slug */}
                  <td className="py-3 px-4">
                    <div className="font-display font-bold text-sm text-ink">{proj.title}</div>
                    <div className="font-mono text-[11px] text-ink/60 mt-0.5">
                      /{proj.slug} · <span className="text-accent">{proj.year || '2026'}</span>
                    </div>
                    {proj.summary && (
                      <div className="text-[11px] text-ink/60 line-clamp-1 mt-0.5 max-w-md font-sans">
                        {proj.summary}
                      </div>
                    )}
                  </td>

                  {/* Categories */}
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                      {proj.categories.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 border border-border bg-canvas/40 text-ink/70">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Home Placement Selector */}
                  <td className="py-3 px-3">
                    <select
                      value={proj.homeCollection || 'none'}
                      onChange={(e) =>
                        handleToggleHomePlacement(
                          proj.slug,
                          e.target.value as 'latest' | 'electronics' | 'none'
                        )
                      }
                      className="bg-canvas border border-border px-2.5 py-1.5 text-xs font-mono text-ink focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="none">Tidak di Home</option>
                      <option value="latest">Rail 1 (Latest Projects)</option>
                      <option value="electronics">Rail 2 (Electronics & IoT)</option>
                    </select>
                  </td>

                  {/* Visibility */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(proj.slug)}
                      className={`px-2.5 py-1 font-mono text-[10px] uppercase font-bold cursor-pointer border transition-colors ${
                        proj.visible !== false
                          ? 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10'
                          : 'border-border text-ink/40 bg-canvas'
                      }`}
                      title="Klik untuk toggle tayang"
                    >
                      {proj.visible !== false ? '● TAYANG' : '○ DRAFT'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 font-mono text-xs">
                      <Link
                        href={`/project/${proj.slug}`}
                        target="_blank"
                        className="p-1.5 border border-border hover:border-accent text-ink/60 hover:text-accent transition-colors"
                        title="Buka Halaman Publik"
                        aria-label="Buka Halaman Publik"
                      >
                        <ExternalLink size={13} />
                      </Link>

                      <Link
                        href={`/admin/projects/${proj.slug}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 border border-border hover:border-accent text-ink hover:text-accent transition-colors"
                        title="Edit Konten Proyek"
                      >
                        <Edit3 size={12} />
                        <span>Edit</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(proj.slug, proj.title)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 border border-border hover:border-accent text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                        title="Hapus Proyek"
                      >
                        <Trash2 size={12} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
