import React from 'react';
import { fetchRawCertificatesDb } from '@/lib/db/repository';
import { certificates } from '@/lib/media';
import type { DbCertificate } from '@/lib/db/schema';
import { CertificatesClient } from './CertificatesClient';

export default async function AdminCertificatesPage() {
  const dbCerts = await fetchRawCertificatesDb().catch(() => []);

  let certList: DbCertificate[] = dbCerts;
  if (certList.length === 0) {
    certList = certificates.map((cert, idx) => ({
      id: cert.id,
      title: cert.title,
      organizer: cert.issuer,
      year: 2026,
      category: cert.category,
      description: cert.description,
      verificationUrl: cert.verificationUrl || '',
      documentUrl: cert.media?.src || '',
      visibleOnHome: true,
      orderIndex: idx,
      updatedAt: 0,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="font-mono text-xs text-accent font-semibold tracking-wider uppercase block">
          [CREDENTIALS_AND_AWARDS_MODULE]
        </span>
        <h1 className="font-display text-2xl font-bold text-ink mt-0.5">
          Manajemen Sertifikat
        </h1>
        <p className="text-xs text-ink/70 font-sans mt-1">
          Kelola arsip sertifikat, tautan verifikasi, dan atur dokumen mana yang ditampilkan pada accordion Home.
        </p>
      </div>

      <CertificatesClient initialCertificates={certList} />
    </div>
  );
}
