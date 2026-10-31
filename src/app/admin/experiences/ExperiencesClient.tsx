'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
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
    const id = editingItem.id || `exp-${items.length + 1}`;
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
      updatedAt: 0,
    };

    try {
      const res = await saveExperienceAction(payload);
      if (res.success) {
        setItems((prev) => {
          const exists = prev.some((item) => item.id === id);
          if (exists) return prev.map((item) => (item.id === id ? payload : item));
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

    setItems(items.filter((item) => item.id !== id));
    await deleteExperienceAction(id);
    router.refresh();
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
            Daftar Rekam Jejak & Pengalaman
          </h2>
          <p className="text-xs text-ink/70 font-sans mt-0.5">
            Kelola pengalaman laboratorium, keterlibatan organisasi, kepanitiaan, dan software testing.
          </p>
        </div>

        <button
          type="button"
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
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Tambah Pengalaman</span>
        </button>
      </div>

      {/* Editor Modal / Inline Form */}
      {editingItem && (
        <div className="border-2 border-accent p-6 bg-surface shadow-2xl space-y-5 animate-in fade-in duration-150">
          <div className="flex justify-between items-center border-b border-border/60 pb-3">
            <h3 className="font-display text-base font-bold text-ink">
              {editingItem.id ? 'Edit Pengalaman' : 'Tambah Pengalaman Baru'}
            </h3>
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="inline-flex items-center gap-1 text-xs font-mono text-ink/60 hover:text-accent cursor-pointer"
            >
              <X size={14} />
              <span>BATAL</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs font-semibold text-ink/85 mb-1 uppercase">
                  Peran / Posisi *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.role || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                  placeholder="Asisten Laboratorium"
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-sans focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold text-ink/85 mb-1 uppercase">
                  Organisasi / Lembaga *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.organization || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, organization: e.target.value })}
                  placeholder="HIMPTEKA UMRI"
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-sans focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold text-ink/85 mb-1 uppercase">
                  Periode
                </label>
                <input
                  type="text"
                  value={editingItem.period || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, period: e.target.value })}
                  placeholder="2025–2026"
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-mono focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs font-semibold text-ink/85 mb-1 uppercase">
                  Kelompok Pengalaman
                </label>
                <select
                  value={editingItem.group || 'laboratorium'}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      group: e.target.value as DbExperience['group'],
                    })
                  }
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink focus:outline-none focus:border-accent font-mono cursor-pointer"
                >
                  <option value="laboratorium">Laboratorium</option>
                  <option value="organisasi">Organisasi</option>
                  <option value="kepanitiaan">Kepanitiaan</option>
                  <option value="mobile-testing">Pengujian Aplikasi Mobile</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold text-ink/85 mb-1 uppercase">
                  Sumber Dokumen
                </label>
                <input
                  type="text"
                  value={editingItem.source || 'DATA §5'}
                  onChange={(e) => setEditingItem({ ...editingItem, source: e.target.value })}
                  placeholder="DATA §5"
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-mono focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs font-semibold text-ink/85 mb-1 uppercase">
                Uraian Konteks & Kontribusi
              </label>
              <textarea
                rows={3}
                value={editingItem.context || ''}
                onChange={(e) => setEditingItem({ ...editingItem, context: e.target.value })}
                placeholder="Penjelasan pengalaman dan kegiatan..."
                className="w-full bg-canvas border border-border p-2.5 text-sm text-ink font-sans focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border border-border text-xs font-mono hover:bg-canvas cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-mono uppercase font-bold tracking-wider cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Rekord'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grouped Experience Listings */}
      <div className="space-y-6">
        {groups.map((groupKey) => {
          const groupItems = items.filter((item) => item.group === groupKey);
          return (
            <div key={groupKey} className="border border-border/80 bg-surface/50 shadow-xs">
              <div className="px-5 py-3 bg-canvas/70 border-b border-border/70 flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-ink">
                  {GROUP_LABELS[groupKey]}
                </span>
                <span className="font-mono text-[11px] text-accent font-semibold">
                  {groupItems.length} REKORD
                </span>
              </div>

              <div className="divide-y divide-border/60">
                {groupItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-canvas/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm sm:text-base text-ink">
                          {item.role}
                        </span>
                        <span className="text-xs text-ink/40">·</span>
                        <span className="text-xs font-semibold text-ink/80">{item.organization}</span>
                      </div>
                      <div className="text-xs text-ink/70 font-sans line-clamp-1 max-w-xl">
                        {item.context}
                      </div>
                      <div className="font-mono text-[11px] text-accent font-medium">
                        {item.period || 'Periode belum ditentukan'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => setEditingItem(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-border hover:border-accent text-ink hover:text-accent transition-colors cursor-pointer"
                      >
                        <Edit3 size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.role)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-border text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span>Hapus</span>
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
