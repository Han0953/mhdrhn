import React from 'react';
import { fetchRawExperiencesDb } from '@/lib/db/repository';
import { experienceGroups } from '@/lib/portfolio';
import type { DbExperience } from '@/lib/db/schema';
import { ExperiencesClient } from './ExperiencesClient';

export default async function AdminExperiencesPage() {
  const dbExp = await fetchRawExperiencesDb().catch(() => []);

  let experiences: DbExperience[] = dbExp;
  if (experiences.length === 0) {
    let order = 0;
    experiences = experienceGroups.flatMap(group =>
      group.items.map(item => ({
        id: item.id,
        period: item.period || '',
        role: item.role,
        organization: item.organization,
        source: item.source || '',
        context: item.context || '',
        group: group.id as DbExperience['group'],
        orderIndex: order++,
        visible: true,
        updatedAt: 0,
      }))
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="font-mono text-xs text-accent font-semibold tracking-wider uppercase block">
          [CAREER_TIMELINE_MODULE]
        </span>
        <h1 className="font-display text-2xl font-bold text-ink mt-0.5">
          Manajemen Pengalaman
        </h1>
        <p className="text-xs text-ink/70 font-sans mt-1">
          Kelola riwayat asisten laboratorium, organisasi mahasiswa, kepanitiaan, dan software testing.
        </p>
      </div>

      <ExperiencesClient initialExperiences={experiences} />
    </div>
  );
}
