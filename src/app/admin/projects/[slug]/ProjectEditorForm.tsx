'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ImageIcon, ArrowLeft, AlertCircle } from 'lucide-react';
import { saveProjectAction } from '../../actions';
import type { DbProject, ProjectCategory } from '@/lib/db/schema';
import type { ProjectStatus } from '@/lib/project-taxonomy';

interface ProjectEditorFormProps {
  initialProject?: Partial<DbProject>;
  isNew?: boolean;
}

const PRESET_PROJECT_IMAGES = [
  { label: 'Vircuit Web', path: '/project/web/vircuit.webp' },
  { label: 'AURA POD Hardware', path: '/project/hardware/aurapod-hardware.webp' },
  { label: 'PVTE Web', path: '/project/web/web-pvte.webp' },
  { label: 'Lazismu Kuansing', path: '/project/web/lazismu-kuansing.webp' },
  { label: 'Inkubator MQTT', path: '/project/hardware/inkubator-mqtt.webp' },
  { label: 'Inkubator Blynk', path: '/project/hardware/inkubator-blynk.webp' },
  { label: 'Safety System', path: '/project/hardware/industrial-machine-safety-system.webp' },
  { label: 'Robot Arm', path: '/project/hardware/robot-arm.webp' },
  { label: 'Robot Tank ESP8266', path: '/project/hardware/robot-tank-wifi-esp8266.webp' },
  { label: 'Robot Car ESP32', path: '/project/hardware/robot-wifi-car-esp32.webp' },
];

export function ProjectEditorForm({ initialProject, isNew = false }: ProjectEditorFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<DbProject>>({
    slug: '',
    title: '',
    subtitle: '',
    summary: '',
    categories: ['Web'],
    year: 2026,
    coverImage: '/project/web/vircuit.webp',
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
      setFormData({ ...formData, categories: current.filter((c) => c !== cat) });
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
        .map((t) => t.trim())
        .filter(Boolean);

      const projectPayload: DbProject = {
        slug,
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || '',
        summary: formData.summary?.trim() || '',
        categories: formData.categories || ['Web'],
        year: Number(formData.year) || 2026,
        coverImage: formData.coverImage?.trim() || '/project/web/vircuit.webp',
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
        updatedAt: 0,
      };

      const res = await saveProjectAction(projectPayload);
      if (!res.success) {
        setError(res.error || 'Gagal menyimpan proyek.');
        setSaving(false);
        return;
      }

      router.push('/admin/projects');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan tak terduga saat menyimpan ke database.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-4 bg-accent/10 border-l-2 border-accent text-accent font-mono text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>[ERR] {error}</span>
        </div>
      )}

      {/* Basic Metadata */}
      <div className="border border-border/80 p-6 sm:p-7 bg-surface/50 space-y-5">
        <h2 className="font-display text-lg font-bold text-ink border-b border-border/60 pb-3">
          Metadata Utama Proyek
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">
              Slug URL (Unik) *
            </label>
            <input
              type="text"
              required
              disabled={!isNew}
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="nama-proyek-unik"
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-mono focus:outline-none focus:border-accent disabled:opacity-50"
            />
            <p className="text-[11px] font-mono text-ink/50 mt-1">
              Digunakan sebagai path rute: /project/{formData.slug || 'slug'}
            </p>
          </div>

          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">
              Judul Proyek *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Vircuit"
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-sans focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">
            Sub-judul (*Subtitle*)
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="Laboratorium Virtual Sirkuit Listrik"
            className="w-full bg-canvas border border-border p-3 text-sm text-ink font-sans focus:outline-none focus:border-accent"
          />
        </div>

        {/* Visual Cover Image Field & Presets */}
        <div className="border border-border/80 bg-canvas/40 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon size={15} className="text-accent" />
            <label className="font-mono text-xs text-ink/85 uppercase font-bold">
              Gambar Sampul / Visual Proyek (*Cover Image*)
            </label>
          </div>

          <input
            type="text"
            value={formData.coverImage || ''}
            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            placeholder="/project/web/vircuit.webp"
            className="w-full bg-canvas border border-border p-3 text-sm text-ink font-mono focus:outline-none focus:border-accent"
          />

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <span className="font-mono text-[11px] text-ink/60 uppercase block">
              Pilih dari Aset Visual Tersedia:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PROJECT_IMAGES.map((preset) => (
                <button
                  key={preset.path}
                  type="button"
                  onClick={() => setFormData({ ...formData, coverImage: preset.path })}
                  className={`px-2 py-1 font-mono text-[10px] border transition-colors cursor-pointer ${
                    formData.coverImage === preset.path
                      ? 'border-accent bg-accent text-white font-bold'
                      : 'border-border text-ink/70 hover:border-accent'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          {formData.coverImage && (
            <div className="pt-3 border-t border-border/40 flex items-center gap-4">
              <div className="relative w-28 h-18 bg-black/10 border border-border overflow-hidden shrink-0">
                <Image
                  src={formData.coverImage}
                  alt="Preview Sampul"
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
              <div className="font-mono text-xs text-ink/70">
                <span className="text-accent font-bold">PRATINJAU SAMPUL VISUAL</span>
                <p className="text-[11px] text-ink/50 mt-0.5">{formData.coverImage}</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">Tahun</label>
            <input
              type="number"
              value={formData.year || 2026}
              onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-mono focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">Status</label>
            <select
              value={formData.status || 'Online'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-mono focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="Online">Online</option>
              <option value="Dalam pengembangan">Dalam pengembangan</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">
              Penempatan di Home
            </label>
            <select
              value={formData.homeCollection || 'none'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  homeCollection: e.target.value as 'latest' | 'electronics' | 'none',
                })
              }
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-mono focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="none">Tidak Ditampilkan di Home</option>
              <option value="latest">Rail 1 (Latest Projects)</option>
              <option value="electronics">Rail 2 (Electronics & IoT)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs text-ink/80 mb-2 uppercase font-semibold">Kategori</label>
          <div className="flex flex-wrap gap-2.5 font-mono text-xs">
            {(['Web', 'IoT', 'Electronics', 'Embedded', 'Research', 'AI'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryToggle(cat)}
                className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                  formData.categories?.includes(cat)
                    ? 'border-accent bg-accent text-white font-bold'
                    : 'border-border text-ink/70 hover:border-accent/60 bg-canvas/40'
                }`}
              >
                {formData.categories?.includes(cat) ? `✓ ${cat}` : `+ ${cat}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Case Study Content */}
      <div className="border border-border/80 p-6 sm:p-7 bg-surface/50 space-y-5">
        <h2 className="font-display text-lg font-bold text-ink border-b border-border/60 pb-3">
          Narasi & Konten Case Study
        </h2>

        <div>
          <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">
            Ringkasan (*Summary*)
          </label>
          <textarea
            rows={3}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full bg-canvas border border-border p-3 text-sm text-ink font-sans focus:outline-none focus:border-accent"
            placeholder="Deskripsi singkat yang tampil di kartu proyek..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">
              Peran Kontributor (*Role*)
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-sans focus:outline-none focus:border-accent"
              placeholder="Full Stack Web Developer"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">
              Konteks Proyek (*Context*)
            </label>
            <input
              type="text"
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-sans focus:outline-none focus:border-accent"
              placeholder="Proyek Mandiri / Skripsi / Riset Lab"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">
            Teknologi (Pisahkan dengan koma)
          </label>
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            className="w-full bg-canvas border border-border p-3 text-sm text-ink font-mono focus:outline-none focus:border-accent"
            placeholder="Next.js, TypeScript, Tailwind CSS, Web Audio API"
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">
            Pendekatan & Solusi Teknis (*Approach*)
          </label>
          <textarea
            rows={4}
            value={formData.approach}
            onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
            className="w-full bg-canvas border border-border p-3 text-sm text-ink font-sans focus:outline-none focus:border-accent"
            placeholder="Bagaimana arsitektur dibangun dan keputusan teknis apa yang diambil..."
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">
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
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">
              Tautan Demo / Live URL
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-mono focus:outline-none focus:border-accent"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">
              Tipe Visual Grafis
            </label>
            <select
              value={formData.visual || 'circuit'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  visual: e.target.value as 'circuit' | 'aura' | 'portal' | 'research',
                })
              }
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-mono focus:outline-none focus:border-accent cursor-pointer"
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
          className="inline-flex items-center gap-1.5 px-5 py-3 border border-border hover:border-accent text-xs font-mono text-ink/80 hover:text-accent transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Batal</span>
        </Link>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider font-bold cursor-pointer disabled:opacity-50 transition-all shadow-xs"
        >
          {saving ? 'MENYIMPAN...' : isNew ? 'BUAT PROYEK BARU' : 'SIMPAN PERUBAHAN'}
        </button>
      </div>
    </form>
  );
}
