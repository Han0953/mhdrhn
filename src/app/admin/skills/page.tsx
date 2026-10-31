import React from 'react';
import { fetchRawSkillGroupsDb } from '@/lib/db/repository';
import { skillGroups } from '@/lib/portfolio';
import type { DbSkillGroup } from '@/lib/db/schema';
import { SkillsClient } from './SkillsClient';

export default async function AdminSkillsPage() {
  const dbSkills = await fetchRawSkillGroupsDb().catch(() => []);

  let groups: DbSkillGroup[] = dbSkills;
  if (groups.length === 0) {
    groups = skillGroups.map((sg, idx) => ({
      id: sg.id,
      title: sg.title,
      description: sg.description,
      skills: sg.skills.map(s => ({ name: s.name, learning: !!s.learning })),
      projectSlug: sg.projectSlug,
      projectLabel: sg.projectLabel,
      orderIndex: idx,
      visible: true,
      updatedAt: 0,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="font-mono text-xs text-accent font-semibold tracking-wider uppercase block">
          [TECHNICAL_CAPABILITIES_MODULE]
        </span>
        <h1 className="font-display text-2xl font-bold text-ink mt-0.5">
          Manajemen Keahlian & Teknologi
        </h1>
        <p className="text-xs text-ink/70 font-sans mt-1">
          Kelola grup teknologi, chip keahlian, dan tandai kemampuan yang sedang dalam tahap pembelajaran (*learning*).
        </p>
      </div>

      <SkillsClient initialGroups={groups} />
    </div>
  );
}
