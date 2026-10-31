'use client';

import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Save,
} from 'lucide-react';
import { saveHomeSettingsAction } from '../actions';
import type { DbHomeSettings } from '@/lib/db/schema';

interface HomeLayoutManagerProps {
  initialSettings: DbHomeSettings;
}

const SECTION_LABELS: Record<string, string> = {
  hero: '01. Hero & 3D Signal Core',
  intro: '02. Pengantar & Peran Bergilir',
  technologies: '03. Grid Logo Teknologi & Kemampuan',
  'latest-projects': '04. Rail Proyek Terbaru (Latest Projects)',
  'electronics-projects': '05. Rail Proyek Elektronika & IoT',
  experience: '06. Cuplikan Pengalaman Terpilih',
  achievements: '07. Cuplikan Prestasi & Capaian',
  certificates: '08. Pengungkapan Sertifikat & Dokumen',
  closing: '09. Penutup & Ajakan Kolaborasi',
};

export function HomeLayoutManager({ initialSettings }: HomeLayoutManagerProps) {
  const [settings, setSettings] = useState<DbHomeSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function moveSection(index: number, direction: 'up' | 'down') {
    const newOrder = [...settings.sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setSettings({ ...settings, sectionOrder: newOrder });
  }

  function handleRoleChange(index: number, label: string) {
    const newRoles = [...settings.heroRoles];
    newRoles[index] = { ...newRoles[index], label };
    setSettings({ ...settings, heroRoles: newRoles });
  }

  function addRole() {
    setSettings({
      ...settings,
      heroRoles: [...settings.heroRoles, { label: 'Spesialisasi Baru.', source: 'DATA §1' }],
    });
  }

  function removeRole(index: number) {
    if (settings.heroRoles.length <= 1) return;
    const newRoles = settings.heroRoles.filter((_, i) => i !== index);
    setSettings({ ...settings, heroRoles: newRoles });
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await saveHomeSettingsAction(settings);
      if (res.success) {
        setMessage({
          type: 'success',
          text: 'Pengaturan tata letak Home berhasil disimpan! Data telah disinkronkan ke Firestore dan cache portofolio telah disegarkan.',
        });
      } else {
        setMessage({
          type: 'error',
          text: `Gagal menyimpan pengaturan: ${res.error}`,
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Terjadi kesalahan jaringan saat menyimpan konfigurasi Home.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Save Notification */}
      {message && (
        <div
          role="alert"
          className={`p-4 border-l-3 font-mono text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'bg-accent/10 border-accent text-accent'
          }`}
        >
          {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Top action save */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
            Urutan Section Halaman Utama
          </h2>
          <p className="text-xs text-ink/70 font-sans mt-0.5">
            Gunakan tombol panah untuk memindahkan urutan kemunculan section pada halaman Home.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider font-bold cursor-pointer disabled:opacity-50 transition-all shadow-xs self-start sm:self-auto"
        >
          <Save size={14} />
          <span>{saving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}</span>
        </button>
      </div>

      {/* Section Reordering List */}
      <div className="border border-border/80 divide-y divide-border/60 bg-surface/50 shadow-xs">
        {settings.sectionOrder.map((sectionKey, index) => (
          <div
            key={sectionKey}
            className="p-4 flex items-center justify-between gap-4 hover:bg-canvas/30 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <span className="font-mono text-xs text-accent font-bold w-7">
                #{String(index + 1).padStart(2, '0')}
              </span>
              <span className="font-sans text-sm font-semibold text-ink">
                {SECTION_LABELS[sectionKey] || sectionKey}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => moveSection(index, 'up')}
                disabled={index === 0}
                className="w-8 h-8 flex items-center justify-center border border-border bg-canvas hover:border-accent text-ink/70 hover:text-accent disabled:opacity-20 disabled:pointer-events-none cursor-pointer transition-colors"
                title="Pindah ke Atas"
                aria-label="Pindah ke Atas"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => moveSection(index, 'down')}
                disabled={index === settings.sectionOrder.length - 1}
                className="w-8 h-8 flex items-center justify-center border border-border bg-canvas hover:border-accent text-ink/70 hover:text-accent disabled:opacity-20 disabled:pointer-events-none cursor-pointer transition-colors"
                title="Pindah ke Bawah"
                aria-label="Pindah ke Bawah"
              >
                <ArrowDown size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Hero Subtitles Editor */}
      <div className="border border-border/80 p-6 bg-surface/50 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Peran Bergilir di Hero</h3>
            <p className="text-xs text-ink/70 font-sans">
              Daftar spesialisasi yang berganti setiap 2000 ms pada Hero section.
            </p>
          </div>
          <button
            type="button"
            onClick={addRole}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-border bg-canvas hover:border-accent text-xs font-mono text-ink/80 hover:text-accent cursor-pointer transition-colors"
          >
            <Plus size={13} />
            <span>Tambah Peran</span>
          </button>
        </div>

        <div className="space-y-3">
          {settings.heroRoles.map((role, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="font-mono text-xs text-accent font-bold w-6">
                {idx + 1}.
              </span>
              <input
                type="text"
                value={role.label}
                onChange={(e) => handleRoleChange(idx, e.target.value)}
                className="flex-1 bg-canvas border border-border px-3.5 py-2 text-sm text-ink font-sans focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => removeRole(idx)}
                disabled={settings.heroRoles.length <= 1}
                className="p-2 border border-border bg-canvas hover:border-accent text-ink/60 hover:text-accent disabled:opacity-20 cursor-pointer transition-colors"
                title="Hapus baris peran"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Intros Editor */}
      <div className="border border-border/80 p-6 bg-surface/50 space-y-4">
        <h3 className="font-display text-lg font-bold text-ink border-b border-border/60 pb-3">
          Deskripsi Pengantar Rail Proyek
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">
              Pengantar Rail Proyek Terbaru (Latest Projects):
            </label>
            <textarea
              rows={2}
              value={settings.latestIntro}
              onChange={(e) => setSettings({ ...settings, latestIntro: e.target.value })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-sans focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-ink/80 mb-1.5 uppercase font-semibold">
              Pengantar Rail Proyek Elektronika & IoT:
            </label>
            <textarea
              rows={2}
              value={settings.electronicsIntro}
              onChange={(e) => setSettings({ ...settings, electronicsIntro: e.target.value })}
              className="w-full bg-canvas border border-border p-3 text-sm text-ink font-sans focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
