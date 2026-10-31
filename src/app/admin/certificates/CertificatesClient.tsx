'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveCertificateAction, deleteCertificateAction } from '../actions';
import type { DbCertificate } from '@/lib/db/schema';

interface CertificatesClientProps {
  initialCertificates: DbCertificate[];
}

export function CertificatesClient({ initialCertificates }: CertificatesClientProps) {
  const [certs, setCerts] = useState<DbCertificate[]>(initialCertificates);
  const [editingCert, setEditingCert] = useState<Partial<DbCertificate> | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleToggleHome(id: string) {
    const cert = certs.find(c => c.id === id);
    if (!cert) return;

    const updated = { ...cert, visibleOnHome: !cert.visibleOnHome };
    setCerts(certs.map(c => (c.id === id ? updated : c)));

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
      updatedAt: Date.now(),
    };

    try {
      const res = await saveCertificateAction(payload);
      if (res.success) {
        setCerts(prev => {
          const exists = prev.some(c => c.id === id);
          if (exists) return prev.map(c => (c.id === id ? payload : c));
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

    setCerts(certs.filter(c => c.id !== id));
    await deleteCertificateAction(id);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h2 className="font-display text-xl font-bold text-ink">Daftar Sertifikat & Kredensial</h2>
        <button
          onClick={() =>
            setEditingCert({
              id: '',
              title: '',
              organizer: '',
              year: 2026,
              category: 'AI',
              description: '',
              verificationUrl: '',
              documentUrl: '',
              visibleOnHome: true,
            })
          }
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider font-semibold"
        >
          + Tambah Sertifikat Baru
        </button>
      </div>

      {/* Editor Modal */}
      {editingCert && (
        <div className="border-2 border-accent p-6 bg-surface shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-border/60 pb-3">
            <h3 className="font-display text-base font-bold text-ink">
              {editingCert.id ? 'Edit Sertifikat' : 'Tambah Sertifikat Baru'}
            </h3>
            <button
              onClick={() => setEditingCert(null)}
              className="text-xs font-mono text-ink/60 hover:text-accent"
            >
              ✕ BATAL
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-ink/80 mb-1">Judul Dokumen / Sertifikat *</label>
              <input
                type="text"
                required
                value={editingCert.title || ''}
                onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                placeholder="Certificate of Completion — AI Ready ASEAN"
                className="w-full bg-canvas border border-border p-2.5 text-sm text-ink focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs text-ink/80 mb-1">Penerbit / Institusi</label>
                <input
                  type="text"
                  value={editingCert.organizer || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, organizer: e.target.value })}
                  placeholder="Google for Education / ASEAN Foundation"
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-ink/80 mb-1">Kategori</label>
                <input
                  type="text"
                  value={editingCert.category || 'AI'}
                  onChange={(e) => setEditingCert({ ...editingCert, category: e.target.value })}
                  placeholder="AI / Organisasi / Web"
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-mono focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-ink/80 mb-1">Tahun Terbit</label>
                <input
                  type="number"
                  value={editingCert.year || 2026}
                  onChange={(e) => setEditingCert({ ...editingCert, year: Number(e.target.value) })}
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-mono focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-ink/80 mb-1">Uraian / Ringkasan Capaian</label>
              <textarea
                rows={2}
                value={editingCert.description || ''}
                onChange={(e) => setEditingCert({ ...editingCert, description: e.target.value })}
                placeholder="Penjelasan sertifikat..."
                className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-sans focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-ink/80 mb-1">URL Verifikasi / Kredensial</label>
                <input
                  type="url"
                  value={editingCert.verificationUrl || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, verificationUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-mono focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-ink/80 mb-1">Path Berkas / Gambar Media</label>
                <input
                  type="text"
                  value={editingCert.documentUrl || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, documentUrl: e.target.value })}
                  placeholder="/certificate/nama-file.webp"
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-mono focus:border-accent"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-mono text-ink/80 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={editingCert.visibleOnHome !== false}
                onChange={(e) => setEditingCert({ ...editingCert, visibleOnHome: e.target.checked })}
              />
              Tampilkan di Accordion Sertifikat Halaman Home
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingCert(null)}
                className="px-4 py-2 border border-border text-xs font-mono"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-mono uppercase font-semibold"
              >
                {saving ? 'Menyimpan...' : 'Simpan Sertifikat'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Certificates List */}
      <div className="border border-border bg-surface/50 divide-y divide-border/60">
        {certs.map((cert) => (
          <div key={cert.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-ink">{cert.title}</span>
                <span className="text-xs text-ink/50">·</span>
                <span className="text-xs text-ink/70 font-mono">[{cert.category || 'AI'}]</span>
              </div>
              <div className="text-xs text-ink/60 font-sans line-clamp-1">{cert.description}</div>
              <div className="font-mono text-[11px] text-accent">
                {cert.organizer} · {cert.year}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
              <button
                type="button"
                onClick={() => handleToggleHome(cert.id)}
                className={`px-2.5 py-1 text-[10px] uppercase font-semibold border ${
                  cert.visibleOnHome
                    ? 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10'
                    : 'border-border text-ink/40'
                }`}
                title="Toggle tampilan di Home"
              >
                {cert.visibleOnHome ? '✓ HOME' : '— HIDDEN'}
              </button>

              <button
                onClick={() => setEditingCert(cert)}
                className="px-3 py-1.5 border border-border hover:border-accent text-ink"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(cert.id, cert.title)}
                className="px-3 py-1.5 border border-border text-accent hover:bg-accent/10"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
