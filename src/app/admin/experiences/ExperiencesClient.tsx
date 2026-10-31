'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveExperienceAction, deleteExperienceAction } from '../actions';
import type { DbExperience } from '@/lib/db/schema';

interface ExperiencesClientProps {
  initialExperiences: DbExperience[];
}

const GROUP_LABELS: Record<string, string> = {
  laboratorium: '01 // Asisten Laboratorium',
  organisasi: '02 // Organisasi Mahasiswa',
  kepanitiaan: '03 // Kepanitiaan Acara',
  'mobile-testing': '04 // Pengujian Aplikasi & Game Mobile',
};

export function ExperiencesClient({ initialExperiences }: ExperiencesClientProps) {
  const [items, setItems] = useState<DbExperience[]>(initialExperiences);
  const [editingItem, setEditingItem] = useState<Partial<DbExperience> | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const groups = ['laboratorium', 'organisasi', 'kepanitiaan', 'mobile-testing'] as const;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem?.role || !editingItem?.organization) return;

    setSaving(true);
    const id = editingItem.id || `exp-${Date.now()}`;
    const payload: DbExperience = {
      id,
      period: editingItem.period || '',
      role: editingItem.role.trim(),
      organization: editingItem.organization.trim(),
      source: editingItem.source || 'DATA §5',
      context: editingItem.context || '',
      group: (editingItem.group as DbExperience['group']) || 'laboratorium',
      orderIndex: editingItem.orderIndex || items.length,
      visible: editingItem.visible !== false,
      updatedAt: Date.now(),
    };

    try {
      const res = await saveExperienceAction(payload);
      if (res.success) {
        setItems(prev => {
          const exists = prev.some(item => item.id === id);
          if (exists) return prev.map(item => (item.id === id ? payload : item));
          return [...prev, payload];
        });
        setEditingItem(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, role: string) {
    if (!confirm(`Hapus pengalaman "${role}"?`)) return;

    setItems(items.filter(item => item.id !== id));
    await deleteExperienceAction(id);
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h2 className="font-display text-xl font-bold text-ink">Daftar Pengalaman</h2>
        <button
          onClick={() =>
            setEditingItem({
              id: '',
              role: '',
              organization: '',
              period: '2026',
              group: 'laboratorium',
              context: '',
              source: 'DATA §5',
              visible: true,
            })
          }
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider font-semibold"
        >
          + Tambah Pengalaman
        </button>
      </div>

      {/* Editor Modal / Inline Form */}
      {editingItem && (
        <div className="border-2 border-accent p-6 bg-surface shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-border/60 pb-3">
            <h3 className="font-display text-base font-bold text-ink">
              {editingItem.id ? 'Edit Pengalaman' : 'Tambah Pengalaman Baru'}
            </h3>
            <button
              onClick={() => setEditingItem(null)}
              className="text-xs font-mono text-ink/60 hover:text-accent"
            >
              ✕ BATAL
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs text-ink/80 mb-1">Peran / Posisi *</label>
                <input
                  type="text"
                  required
                  value={editingItem.role || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                  placeholder="Asisten Laboratorium"
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-ink/80 mb-1">Organisasi / Lembaga *</label>
                <input
                  type="text"
                  required
                  value={editingItem.organization || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, organization: e.target.value })}
                  placeholder="HIMPTEKA UMRI"
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-ink/80 mb-1">Periode</label>
                <input
                  type="text"
                  value={editingItem.period || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, period: e.target.value })}
                  placeholder="2025–2026"
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-ink/80 mb-1">Kelompok Pengalaman</label>
                <select
                  value={editingItem.group || 'laboratorium'}
                  onChange={(e) => setEditingItem({ ...editingItem, group: e.target.value as DbExperience['group'] })}
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink focus:border-accent font-mono"
                >
                  <option value="laboratorium">Laboratorium</option>
                  <option value="organisasi">Organisasi</option>
                  <option value="kepanitiaan">Kepanitiaan</option>
                  <option value="mobile-testing">Pengujian Aplikasi Mobile</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs text-ink/80 mb-1">Sumber Dokumen</label>
                <input
                  type="text"
                  value={editingItem.source || 'DATA §5'}
                  onChange={(e) => setEditingItem({ ...editingItem, source: e.target.value })}
                  placeholder="DATA §5"
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-mono focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-ink/80 mb-1">Uraian Konteks & Kontribusi</label>
              <textarea
                rows={3}
                value={editingItem.context || ''}
                onChange={(e) => setEditingItem({ ...editingItem, context: e.target.value })}
                placeholder="Penjelasan pengalaman dan kegiatan..."
                className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-sans focus:border-accent"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border border-border text-xs font-mono"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-mono uppercase font-semibold"
              >
                {saving ? 'Menyimpan...' : 'Simpan Rekord'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grouped Experience Listings */}
      <div className="space-y-8">
        {groups.map(groupKey => {
          const groupItems = items.filter(item => item.group === groupKey);
          return (
            <div key={groupKey} className="border border-border bg-surface/40">
              <div className="px-4 py-3 bg-canvas/60 border-b border-border flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-ink/80">
                  {GROUP_LABELS[groupKey]}
                </span>
                <span className="font-mono text-[11px] text-accent">
                  {groupItems.length} rekord
                </span>
              </div>

              <div className="divide-y divide-border/60">
                {groupItems.map(item => (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-ink">{item.role}</span>
                        <span className="text-xs text-ink/50">·</span>
                        <span className="text-xs font-medium text-ink/80">{item.organization}</span>
                      </div>
                      <div className="text-xs text-ink/60 font-sans line-clamp-1">{item.context}</div>
                      <div className="font-mono text-[11px] text-accent">{item.period || 'Periode belum ditentukan'}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="px-3 py-1.5 border border-border hover:border-accent text-ink"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.role)}
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
        })}
      </div>
    </div>
  );
}
