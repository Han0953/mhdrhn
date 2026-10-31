'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  FileBadge,
  Plus,
  ExternalLink,
  Edit3,
  Trash2,
  ImageIcon,
  X,
} from 'lucide-react';
import { saveCertificateAction, deleteCertificateAction } from '../actions';
import type { DbCertificate } from '@/lib/db/schema';

interface CertificatesClientProps {
  initialCertificates: DbCertificate[];
}

const PRESET_CERTIFICATE_IMAGES = [
  { label: 'AI Ready ASEAN', path: '/certificate/ai-ready-asean.webp' },
  { label: 'Google Gemini', path: '/certificate/google-gemini-certified.webp' },
  { label: 'Google Fill & Feel', path: '/certificate/google-fill-feel-festival.webp' },
  { label: 'Juara 1 SiCheCo', path: '/certificate/juara-1-sicheco-bpdc.webp' },
  { label: 'Juara 3 Essay', path: '/certificate/juara-3-essay-ecos-fest.webp' },
  { label: 'Finalis Top 10 Essay', path: '/certificate/finalis-top-10-essay-ecos-fest.webp' },
];

export function CertificatesClient({ initialCertificates }: CertificatesClientProps) {
  const [certs, setCerts] = useState<DbCertificate[]>(initialCertificates);
  const [editingCert, setEditingCert] = useState<Partial<DbCertificate> | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleToggleHome(id: string) {
    const cert = certs.find((c) => c.id === id);
    if (!cert) return;

    const updated = { ...cert, visibleOnHome: !cert.visibleOnHome };
    setCerts(certs.map((c) => (c.id === id ? updated : c)));

    await saveCertificateAction(updated);
    router.refresh();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCert?.title) return;

    setSaving(true);
    const id = editingCert.id || `cert-${Date.now()}`;
    const payload: DbCertificate = {
      id,
      title: editingCert.title.trim(),
      organizer: editingCert.organizer?.trim() || 'Penerbit Resmi',
      year: Number(editingCert.year) || 2026,
      verificationUrl: editingCert.verificationUrl?.trim() || '',
      documentUrl: editingCert.documentUrl?.trim() || '',
      description: editingCert.description?.trim() || '',
      category: editingCert.category || 'AI',
      visibleOnHome: editingCert.visibleOnHome !== false,
      orderIndex: editingCert.orderIndex || certs.length,
      updatedAt: 0,
    };

    try {
      const res = await saveCertificateAction(payload);
      if (res.success) {
        setCerts((prev) => {
          const exists = prev.some((c) => c.id === id);
          if (exists) return prev.map((c) => (c.id === id ? payload : c));
          return [...prev, payload];
        });
        setEditingCert(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Hapus sertifikat "${title}"?`)) return;

    setCerts(certs.filter((c) => c.id !== id));
    await deleteCertificateAction(id);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileBadge size={16} className="text-accent" />
            <span className="font-mono text-xs text-accent font-bold uppercase tracking-wider">
              [CREDENTIAL_ARCHIVE]
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink mt-0.5">
            Daftar Sertifikat & Kredensial
          </h2>
          <p className="text-xs text-ink/70 font-sans mt-1">
            Arsip kredensial, sertifikat lisensi AI, dan penghargaan kompetisi resmi Muhammad Rehan.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setEditingCert({
              id: '',
              title: '',
              organizer: '',
              year: 2026,
              category: 'AI',
              description: '',
              verificationUrl: '',
              documentUrl: '/certificate/ai-ready-asean.webp',
              visibleOnHome: true,
            })
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Tambah Sertifikat</span>
        </button>
      </div>

      {/* Editor Modal / Form */}
      {editingCert && (
        <div className="border-2 border-accent p-6 bg-surface shadow-2xl space-y-5 animate-in fade-in duration-150">
          <div className="flex justify-between items-center border-b border-border/60 pb-3">
            <h3 className="font-display text-base font-bold text-ink">
              {editingCert.id ? 'Edit Sertifikat / Kredensial' : 'Tambah Sertifikat Baru'}
            </h3>
            <button
              type="button"
              onClick={() => setEditingCert(null)}
              className="inline-flex items-center gap-1 text-xs font-mono text-ink/60 hover:text-accent cursor-pointer"
            >
              <X size={14} />
              <span>BATAL</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block font-mono text-xs font-semibold text-ink/85 mb-1 uppercase">
                Judul Dokumen / Sertifikat *
              </label>
              <input
                type="text"
                required
                value={editingCert.title || ''}
                onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                placeholder="Certificate of Completion — AI Ready ASEAN"
                className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-sans focus:outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs font-semibold text-ink/85 mb-1 uppercase">
                  Penerbit / Institusi
                </label>
                <input
                  type="text"
                  value={editingCert.organizer || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, organizer: e.target.value })}
                  placeholder="Google for Education / ASEAN Foundation"
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-sans focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold text-ink/85 mb-1 uppercase">
                  Kategori
                </label>
                <input
                  type="text"
                  value={editingCert.category || 'AI'}
                  onChange={(e) => setEditingCert({ ...editingCert, category: e.target.value })}
                  placeholder="AI / Organisasi / AWS / Hardware"
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold text-ink/85 mb-1 uppercase">
                  Tahun Terbit
                </label>
                <input
                  type="number"
                  value={editingCert.year || 2026}
                  onChange={(e) => setEditingCert({ ...editingCert, year: Number(e.target.value) })}
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-mono focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs font-semibold text-ink/85 mb-1 uppercase">
                Uraian / Ringkasan Capaian
              </label>
              <textarea
                rows={2}
                value={editingCert.description || ''}
                onChange={(e) => setEditingCert({ ...editingCert, description: e.target.value })}
                placeholder="Penjelasan ringkas materi atau capaian sertifikat..."
                className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-sans focus:outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs font-semibold text-ink/85 mb-1 uppercase">
                  URL Verifikasi / Kredensial
                </label>
                <input
                  type="url"
                  value={editingCert.verificationUrl || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, verificationUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold text-ink/85 mb-1 uppercase">
                  Path Berkas Gambar Media
                </label>
                <input
                  type="text"
                  value={editingCert.documentUrl || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, documentUrl: e.target.value })}
                  placeholder="/certificate/ai-ready-asean.webp"
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-mono focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Media Preset Quick Select */}
            <div className="p-3 bg-canvas/60 border border-border/80 space-y-2">
              <span className="font-mono text-[11px] text-ink/60 uppercase block">
                Pilih Berkas Tersedia Cepat (Asset Preset):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CERTIFICATE_IMAGES.map((preset) => (
                  <button
                    key={preset.path}
                    type="button"
                    onClick={() => setEditingCert({ ...editingCert, documentUrl: preset.path })}
                    className={`px-2 py-1 font-mono text-[10px] border transition-colors cursor-pointer ${
                      editingCert.documentUrl === preset.path
                        ? 'border-accent bg-accent text-white font-bold'
                        : 'border-border text-ink/70 hover:border-accent'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Live Preview Box */}
              {editingCert.documentUrl && (
                <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-3">
                  <div className="relative w-20 h-14 bg-black/10 border border-border overflow-hidden shrink-0">
                    <Image
                      src={editingCert.documentUrl}
                      alt="Preview"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="font-mono text-[11px] text-ink/70">
                    <div className="font-bold text-accent">PRATINJAU GAMBAR DOKUMEN</div>
                    <div className="text-[10px] text-ink/50 truncate max-w-xs">{editingCert.documentUrl}</div>
                  </div>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2.5 text-xs font-mono text-ink/80 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={editingCert.visibleOnHome !== false}
                onChange={(e) => setEditingCert({ ...editingCert, visibleOnHome: e.target.checked })}
                className="accent-[#c92632] w-4 h-4 cursor-pointer"
              />
              <span className="font-semibold">Tampilkan di Accordion Sertifikat Halaman Home</span>
            </label>

            <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
              <button
                type="button"
                onClick={() => setEditingCert(null)}
                className="px-4 py-2 border border-border text-xs font-mono hover:bg-canvas cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-mono uppercase font-bold tracking-wider cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Sertifikat'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Certificates List Grid */}
      <div className="border border-border bg-surface/50 divide-y divide-border/60">
        {certs.map((cert) => {
          const docUrl = cert.documentUrl || '/certificate/ai-ready-asean.webp';
          return (
            <div
              key={cert.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-canvas/40 transition-colors"
            >
              {/* Media Thumbnail + Certificate Info */}
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-14 sm:w-24 sm:h-16 bg-black/10 border border-border/80 overflow-hidden shrink-0 group">
                  {docUrl ? (
                    <Image
                      src={docUrl}
                      alt={cert.title}
                      fill
                      sizes="96px"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink/40">
                      <ImageIcon size={16} />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-bold text-sm sm:text-base text-ink">
                      {cert.title}
                    </span>
                    <span className="text-[10px] text-accent font-mono font-semibold px-1.5 py-0.2 border border-accent/40 bg-accent/5">
                      [{cert.category || 'AI'}]
                    </span>
                  </div>

                  <div className="text-xs text-ink/70 font-sans line-clamp-1 max-w-xl">
                    {cert.description}
                  </div>

                  <div className="font-mono text-[11px] text-ink/60 flex items-center gap-2">
                    <span className="text-accent font-semibold">{cert.organizer}</span>
                    <span>·</span>
                    <span>{cert.year}</span>
                    {cert.verificationUrl && (
                      <>
                        <span>·</span>
                        <a
                          href={cert.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink/60 hover:text-accent underline flex items-center gap-0.5"
                        >
                          Verifikasi <ExternalLink size={10} />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions & Home Toggle */}
              <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => handleToggleHome(cert.id)}
                  className={`px-3 py-1.5 text-[10px] uppercase font-bold border transition-colors cursor-pointer ${
                    cert.visibleOnHome
                      ? 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10'
                      : 'border-border text-ink/40 bg-canvas'
                  }`}
                  title="Klik untuk mengubah penayangan di Halaman Utama"
                >
                  {cert.visibleOnHome ? '✓ TAMPIL DI HOME' : '— HIDDEN'}
                </button>

                <button
                  type="button"
                  onClick={() => setEditingCert(cert)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-border hover:border-accent text-ink hover:text-accent transition-colors cursor-pointer"
                >
                  <Edit3 size={12} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(cert.id, cert.title)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-border text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
