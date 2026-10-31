'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveProjectAction } from '../../actions';
import type { DbProject, ProjectCategory } from '@/lib/db/schema';
import type { ProjectStatus } from '@/lib/project-taxonomy';

interface ProjectEditorFormProps {
  initialProject?: Partial<DbProject>;
  isNew?: boolean;
}

export function ProjectEditorForm({ initialProject, isNew = false }: ProjectEditorFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<DbProject>>({
    slug: '',
    title: '',
    subtitle: '',
    summary: '',
    categories: ['Web'],
    year: 2026,
    context: '',
    role: 'Full Stack Web Developer',
    technologies: [],
    approach: '',
    limitation: '',
    visual: 'circuit',
    link: '',
    source: 'DATA §9',
    status: 'Online',
    homeCollection: 'none',
    orderIndex: 0,
    visible: true,
    ...initialProject,
  });

  const [techInput, setTechInput] = useState((initialProject?.technologies || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCategoryToggle(cat: ProjectCategory) {
    const current = formData.categories || [];
    if (current.includes(cat)) {
      if (current.length === 1) return; // keep at least 1
      setFormData({ ...formData, categories: current.filter(c => c !== cat) });
    } else {
      setFormData({ ...formData, categories: [...current, cat] });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const slug = formData.slug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!slug) {
      setError('Slug proyek wajib diisi.');
      return;
    }

    if (!formData.title?.trim()) {
      setError('Judul proyek wajib diisi.');
      return;
    }

    setSaving(true);

    try {
      const technologies = techInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const projectPayload: DbProject = {
        slug,
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || '',
        summary: formData.summary?.trim() || '',
        categories: formData.categories || ['Web'],
        year: Number(formData.year) || 2026,
        context: formData.context?.trim() || '',
        role: formData.role?.trim() || '',
        technologies,
        approach: formData.approach?.trim() || '',
        limitation: formData.limitation?.trim() || '',
        featured: formData.featured || 1,
        visual: formData.visual || 'circuit',
        link: formData.link?.trim() || '',
        source: formData.source || 'DATA §9',
        status: formData.status || 'Online',
        homeCollection: formData.homeCollection || 'none',
        orderIndex: formData.orderIndex || 0,
        visible: formData.visible !== false,
        updatedAt: Date.now(),
      };

      const res = await saveProjectAction(projectPayload);
      if (!res.success) {
        setError(res.error || 'Gagal menyimpan proyek ke database.');
        setSaving(false);
        return;
      }

      router.push('/admin/projects');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan saat memproses data.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-4 bg-accent/10 border-l-2 border-accent text-accent font-mono text-xs">
          [ERROR] {error}
        </div>
      )}

      {/* Main Metadata */}
      <div className="border border-border p-6 bg-surface/40 space-y-5">
        <h2 className="font-display text-lg font-bold text-ink border-b border-border/60 pb-3">
          Metadata Utama Proyek
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase">
              Judul Proyek *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink focus:outline-none focus:border-accent"
              placeholder="Contoh: Vircuit"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase">
              Slug URL * (huruf kecil, strip)
            </label>
            <input
              type="text"
              required
              disabled={!isNew}
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-mono focus:outline-none focus:border-accent disabled:opacity-50"
              placeholder="contoh-vircuit"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase">
            Subjudul / Tagline
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full bg-canvas border border-border p-3 text-sm text-ink focus:outline-none focus:border-accent"
            placeholder="Belajar elektronika melalui laboratorium virtual..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase">Tahun</label>
            <input
              type="number"
              value={formData.year || 2026}
              onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-mono focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase">Status</label>
            <select
              value={formData.status || 'Online'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-mono focus:outline-none focus:border-accent"
            >
              <option value="Online">Online</option>
              <option value="Dalam pengembangan">Dalam pengembangan</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase">
              Penempatan di Home
            </label>
            <select
              value={formData.homeCollection || 'none'}
              onChange={(e) => setFormData({ ...formData, homeCollection: e.target.value as 'latest' | 'electronics' | 'none' })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-mono focus:outline-none focus:border-accent"
            >
              <option value="none">Tidak Ditampilkan di Home</option>
              <option value="latest">Rail 1 (Latest Projects)</option>
              <option value="electronics">Rail 2 (Electronics & IoT)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs text-ink/80 mb-2 uppercase">Kategori</label>
          <div className="flex flex-wrap gap-3 font-mono text-xs">
            {(['Web', 'IoT', 'Electronics', 'Embedded', 'Research', 'AI'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryToggle(cat)}
                className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                  formData.categories?.includes(cat)
                    ? 'border-accent bg-accent text-white font-semibold'
                    : 'border-border text-ink/70 hover:border-accent/60'
                }`}
              >
                {formData.categories?.includes(cat) ? `✓ ${cat}` : `+ ${cat}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Case Study Content */}
      <div className="border border-border p-6 bg-surface/40 space-y-5">
        <h2 className="font-display text-lg font-bold text-ink border-b border-border/60 pb-3">
          Narasi & Konten Case Study
        </h2>

        <div>
          <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase">
            Ringkasan (*Summary*)
          </label>
          <textarea
            rows={3}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full bg-canvas border border-border p-3 text-sm text-ink font-sans focus:outline-none focus:border-accent"
            placeholder="Deskripsi singkat proyek..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase">Konteks / Tim</label>
            <input
              type="text"
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink focus:outline-none focus:border-accent"
              placeholder="Contoh: Trio Hengker Enjoyer atau Proyek Mandiri"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase">Peran Spesifik</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink focus:outline-none focus:border-accent"
              placeholder="Contoh: Full Stack Web Developer / IoT Engineer"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase">
            Teknologi (pisahkan dengan koma)
          </label>
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            className="w-full bg-canvas border border-border p-3 text-sm text-ink font-mono focus:outline-none focus:border-accent"
            placeholder="Next.js, TypeScript, Tailwind CSS, ESP32, MQTT"
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase">
            Pendekatan & Kontribusi Teknis (*Approach*)
          </label>
          <textarea
            rows={4}
            value={formData.approach}
            onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
            className="w-full bg-canvas border border-border p-3 text-sm text-ink font-sans focus:outline-none focus:border-accent"
            placeholder="Jelaskan peran Rehan dan cara kerja sistem..."
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase">
            Keterbatasan & Batas Bukti (*Honest Limitation*)
          </label>
          <textarea
            rows={3}
            value={formData.limitation}
            onChange={(e) => setFormData({ ...formData, limitation: e.target.value })}
            className="w-full bg-canvas border border-border p-3 text-sm text-ink font-sans focus:outline-none focus:border-accent"
            placeholder="Batasan yang belum teruji atau hasil bersama tim..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase">Tautan Demo / Live URL</label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-mono focus:outline-none focus:border-accent"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase">Tipe Visual Grafis</label>
            <select
              value={formData.visual || 'circuit'}
              onChange={(e) => setFormData({ ...formData, visual: e.target.value as 'circuit' | 'aura' | 'portal' | 'research' })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-mono focus:outline-none focus:border-accent"
            >
              <option value="circuit">Circuit (Diagram Rangkaian)</option>
              <option value="aura">Aura (Bioreaktor/Sains)</option>
              <option value="portal">Portal (Web/Aplikasi)</option>
              <option value="research">Research (Eksperimen/Lab)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/admin/projects"
          className="px-5 py-3 border border-border hover:border-accent text-xs font-mono text-ink/80 hover:text-accent"
        >
          ← Batal
        </Link>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider font-semibold cursor-pointer disabled:opacity-50"
        >
          {saving ? 'MENYIMPAN...' : isNew ? 'BUAT PROYEK BARU' : 'SIMPAN PERUBAHAN'}
        </button>
      </div>
    </form>
  );
}
