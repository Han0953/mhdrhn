'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit3, X } from 'lucide-react';
import { saveSkillGroupAction, deleteSkillGroupAction } from '../actions';
import type { DbSkillGroup, DbSkillItem } from '@/lib/db/schema';

interface SkillsClientProps {
  initialGroups: DbSkillGroup[];
}

export function SkillsClient({ initialGroups }: SkillsClientProps) {
  const [groups, setGroups] = useState<DbSkillGroup[]>(initialGroups);
  const [editingGroup, setEditingGroup] = useState<DbSkillGroup | null>(null);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLearning, setNewSkillLearning] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function startEditing(group: DbSkillGroup) {
    setEditingGroup(JSON.parse(JSON.stringify(group)));
  }

  function toggleSkillLearning(idx: number) {
    if (!editingGroup) return;
    const skills = [...editingGroup.skills];
    skills[idx] = { ...skills[idx], learning: !skills[idx].learning };
    setEditingGroup({ ...editingGroup, skills });
  }

  function removeSkill(idx: number) {
    if (!editingGroup) return;
    const skills = editingGroup.skills.filter((_, i) => i !== idx);
    setEditingGroup({ ...editingGroup, skills });
  }

  function addSkill() {
    if (!editingGroup || !newSkillName.trim()) return;
    const item: DbSkillItem = { name: newSkillName.trim(), learning: newSkillLearning };
    setEditingGroup({
      ...editingGroup,
      skills: [...editingGroup.skills, item],
    });
    setNewSkillName('');
    setNewSkillLearning(false);
  }

  async function handleSaveGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!editingGroup) return;

    setSaving(true);
    try {
      const payload: DbSkillGroup = {
        ...editingGroup,
        updatedAt: 0,
      };
      const res = await saveSkillGroupAction(payload);
      if (res.success) {
        setGroups(groups.map((g) => (g.id === payload.id ? payload : g)));
        setEditingGroup(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteGroup(id: string, title: string) {
    if (!confirm(`Hapus grup keahlian "${title}"?`)) return;

    setGroups(groups.filter((g) => g.id !== id));
    await deleteSkillGroupAction(id);
    router.refresh();
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
            Grup Keahlian & Ekosistem Teknologi
          </h2>
          <p className="text-xs text-ink/70 font-sans mt-0.5">
            Kelola taksonomi kemampuan teknis, status pembelajaran (*learning*), dan keterkaitan dengan proyek pembuktian.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setEditingGroup({
              id: `skill-group-${Date.now()}`,
              title: '',
              description: '',
              skills: [],
              orderIndex: groups.length,
              visible: true,
              updatedAt: 0,
            })
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Tambah Grup Keahlian</span>
        </button>
      </div>

      {/* Group Editor Modal */}
      {editingGroup && (
        <div className="border-2 border-accent p-6 bg-surface shadow-2xl space-y-6 animate-in fade-in duration-150">
          <div className="flex justify-between items-center border-b border-border/60 pb-3">
            <h3 className="font-display text-base font-bold text-ink">
              {editingGroup.title ? `Edit Grup: ${editingGroup.title}` : 'Tambah Grup Keahlian Baru'}
            </h3>
            <button
              type="button"
              onClick={() => setEditingGroup(null)}
              className="inline-flex items-center gap-1 text-xs font-mono text-ink/60 hover:text-accent cursor-pointer"
            >
              <X size={14} />
              <span>TUTUP</span>
            </button>
          </div>

          <form onSubmit={handleSaveGroup} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs font-semibold text-ink/85 mb-1.5 uppercase">
                  Judul Grup Keahlian *
                </label>
                <input
                  type="text"
                  required
                  value={editingGroup.title}
                  onChange={(e) => setEditingGroup({ ...editingGroup, title: e.target.value })}
                  placeholder="Contoh: Pemrograman & Bahasa Inti"
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold text-ink/85 mb-1.5 uppercase">
                  Deskripsi Ringkas
                </label>
                <input
                  type="text"
                  value={editingGroup.description}
                  onChange={(e) =>
                    setEditingGroup({ ...editingGroup, description: e.target.value })
                  }
                  placeholder="Keahlian bahasa pemrograman yang digunakan sehari-hari..."
                  className="w-full bg-canvas border border-border p-2.5 text-sm text-ink focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Current Skills Chips */}
            <div>
              <label className="block font-mono text-xs font-semibold text-ink/85 mb-2 uppercase">
                Daftar Item Keahlian ({editingGroup.skills.length})
              </label>
              <div className="flex flex-wrap gap-2 p-4 border border-border/80 bg-canvas/40 min-h-16">
                {editingGroup.skills.length === 0 ? (
                  <span className="font-mono text-xs text-ink/40">Belum ada item keahlian ditambahkan.</span>
                ) : (
                  editingGroup.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-surface text-xs font-mono"
                    >
                      <span className="text-ink font-semibold">{skill.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleSkillLearning(idx)}
                        className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                          skill.learning
                            ? 'bg-amber-500/20 text-amber-500 font-bold'
                            : 'text-ink/40 hover:text-ink'
                        }`}
                        title="Klik untuk toggle status Sedang Dipelajari (Learning)"
                      >
                        {skill.learning ? '[LEARNING]' : '[CORE]'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSkill(idx)}
                        className="text-accent hover:text-accent-hover font-bold ml-1 cursor-pointer p-0.5"
                        title="Hapus skill"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Skill Row */}
            <div className="p-4 border border-dashed border-border flex flex-col sm:flex-row items-center gap-3 bg-canvas/20">
              <input
                type="text"
                placeholder="Nama teknologi baru (misal: Next.js, C++, ESP-IDF)..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className="w-full sm:flex-1 bg-canvas border border-border p-2.5 text-xs font-mono text-ink focus:outline-none focus:border-accent"
              />
              <label className="flex items-center gap-2 text-xs font-mono text-ink/70 shrink-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newSkillLearning}
                  onChange={(e) => setNewSkillLearning(e.target.checked)}
                  className="accent-[#c92632]"
                />
                <span>Status Sedang Dipelajari (Learning)</span>
              </label>
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-canvas border border-accent text-accent hover:bg-accent hover:text-white font-mono text-xs uppercase font-bold cursor-pointer shrink-0 transition-colors"
              >
                + Tambah Item
              </button>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border/40">
              <button
                type="button"
                onClick={() => handleDeleteGroup(editingGroup.id, editingGroup.title)}
                className="px-3.5 py-2 border border-accent/40 text-accent hover:bg-accent/10 text-xs font-mono cursor-pointer transition-colors"
              >
                Hapus Grup
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="px-4 py-2 border border-border text-xs font-mono hover:bg-canvas cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-mono uppercase font-bold tracking-wider cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Grup'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Skills Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {groups.map((group) => (
          <div key={group.id} className="border border-border/80 bg-surface/50 p-5 space-y-4 shadow-xs">
            <div className="flex justify-between items-start border-b border-border/60 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-ink">{group.title}</h3>
                <p className="text-xs text-ink/65 font-sans mt-0.5 line-clamp-1">
                  {group.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startEditing(group)}
                className="inline-flex items-center gap-1 px-3 py-1 border border-border hover:border-accent text-xs font-mono text-ink hover:text-accent cursor-pointer shrink-0 transition-colors"
              >
                <Edit3 size={12} />
                <span>Edit ({group.skills.length})</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              {group.skills.map((skill, i) => (
                <span
                  key={i}
                  className={`px-2 py-0.5 border text-[11px] ${
                    skill.learning
                      ? 'border-amber-500/40 text-amber-500 bg-amber-500/5'
                      : 'border-border text-ink/80 bg-canvas/60'
                  }`}
                >
                  {skill.name} {skill.learning ? '★' : ''}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
