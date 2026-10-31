import React from 'react';
import { fetchRawHomeSettingsDb } from '@/lib/db/repository';
import { heroRoles, projectSectionIntros } from '@/lib/home-content';
import { DEFAULT_SECTION_ORDER, type DbHomeSettings } from '@/lib/db/schema';
import { HomeLayoutManager } from './HomeLayoutManager';

export default async function AdminHomeLayoutPage() {
  const dbSettings = await fetchRawHomeSettingsDb().catch(() => null);

  const defaultSettings: DbHomeSettings = {
    heroRoles: heroRoles.map(r => ({ label: r.label, source: r.source })),
    latestIntro: projectSectionIntros.latest,
    electronicsIntro: projectSectionIntros.electronics,
    sectionOrder: DEFAULT_SECTION_ORDER,
    latestProjectSlugs: ['vircuit', 'aura-pod', 'website-pvte-himpteka', 'iot-egg-incubator-research', 'website-lazismu-kuansing'],
    electronicsProjectSlugs: ['iot-egg-incubator-blynk', 'air-quality-monitoring', 'smart-home-iot', 'industrial-machine-safety', 'drone-stm32'],
    updatedAt: 0,
  };

  const currentSettings = dbSettings || defaultSettings;

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="font-mono text-xs text-accent font-semibold tracking-wider uppercase block">
          [CONFIGURATION_MODULE]
        </span>
        <h1 className="font-display text-2xl font-bold text-ink mt-0.5">
          Tata Letak & Urutan Halaman Home
        </h1>
        <p className="text-xs text-ink/70 font-sans mt-1">
          Atur posisi setiap section dan konten dinamis yang ditampilkan di halaman depan portofolio.
        </p>
      </div>

      <HomeLayoutManager initialSettings={currentSettings} />
    </div>
  );
}
