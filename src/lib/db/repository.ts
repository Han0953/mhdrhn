import 'server-only';
import { unstable_cache, revalidateTag } from 'next/cache';
import { getDoc, listDocs, setDoc, deleteDoc } from './firestore-rest';
import type {
  DbProject,
  DbExperience,
  DbSkillGroup,
  DbCertificate,
  DbHomeSettings,
} from './schema';

export const CACHE_TAG_PORTFOLIO = 'portfolio-content';

// Firestore Collection Names
export const COLLECTIONS = {
  PROJECTS: 'portfolio_projects',
  EXPERIENCES: 'portfolio_experiences',
  SKILLS: 'portfolio_skills',
  CERTIFICATES: 'portfolio_certificates',
  SETTINGS: 'portfolio_settings',
} as const;

/* ================= PROJECTS ================= */

export async function fetchRawProjectsDb(): Promise<DbProject[]> {
  const docs = await listDocs<DbProject>(COLLECTIONS.PROJECTS);
  return docs.sort((a, b) => a.orderIndex - b.orderIndex);
}

export const getCachedProjectsDb = unstable_cache(
  async () => fetchRawProjectsDb(),
  ['cached-portfolio-projects'],
  { tags: [CACHE_TAG_PORTFOLIO], revalidate: 3600 }
);

export async function saveProjectDb(project: DbProject): Promise<void> {
  const data = { ...project, updatedAt: Date.now() };
  await setDoc(COLLECTIONS.PROJECTS, project.slug, data);
  revalidateTag(CACHE_TAG_PORTFOLIO, { expire: 0 });
}

export async function deleteProjectDb(slug: string): Promise<void> {
  await deleteDoc(COLLECTIONS.PROJECTS, slug);
  revalidateTag(CACHE_TAG_PORTFOLIO, { expire: 0 });
}

/* ================= EXPERIENCES ================= */

export async function fetchRawExperiencesDb(): Promise<DbExperience[]> {
  const docs = await listDocs<DbExperience>(COLLECTIONS.EXPERIENCES);
  return docs.sort((a, b) => a.orderIndex - b.orderIndex);
}

export const getCachedExperiencesDb = unstable_cache(
  async () => fetchRawExperiencesDb(),
  ['cached-portfolio-experiences'],
  { tags: [CACHE_TAG_PORTFOLIO], revalidate: 3600 }
);

export async function saveExperienceDb(exp: DbExperience): Promise<void> {
  const data = { ...exp, updatedAt: Date.now() };
  await setDoc(COLLECTIONS.EXPERIENCES, exp.id, data);
  revalidateTag(CACHE_TAG_PORTFOLIO, { expire: 0 });
}

export async function deleteExperienceDb(id: string): Promise<void> {
  await deleteDoc(COLLECTIONS.EXPERIENCES, id);
  revalidateTag(CACHE_TAG_PORTFOLIO, { expire: 0 });
}

/* ================= SKILLS ================= */

export async function fetchRawSkillGroupsDb(): Promise<DbSkillGroup[]> {
  const docs = await listDocs<DbSkillGroup>(COLLECTIONS.SKILLS);
  return docs.sort((a, b) => a.orderIndex - b.orderIndex);
}

export const getCachedSkillGroupsDb = unstable_cache(
  async () => fetchRawSkillGroupsDb(),
  ['cached-portfolio-skills'],
  { tags: [CACHE_TAG_PORTFOLIO], revalidate: 3600 }
);

export async function saveSkillGroupDb(group: DbSkillGroup): Promise<void> {
  const data = { ...group, updatedAt: Date.now() };
  await setDoc(COLLECTIONS.SKILLS, group.id, data);
  revalidateTag(CACHE_TAG_PORTFOLIO, { expire: 0 });
}

export async function deleteSkillGroupDb(id: string): Promise<void> {
  await deleteDoc(COLLECTIONS.SKILLS, id);
  revalidateTag(CACHE_TAG_PORTFOLIO, { expire: 0 });
}

/* ================= CERTIFICATES ================= */

export async function fetchRawCertificatesDb(): Promise<DbCertificate[]> {
  const docs = await listDocs<DbCertificate>(COLLECTIONS.CERTIFICATES);
  return docs.sort((a, b) => a.orderIndex - b.orderIndex);
}

export const getCachedCertificatesDb = unstable_cache(
  async () => fetchRawCertificatesDb(),
  ['cached-portfolio-certificates'],
  { tags: [CACHE_TAG_PORTFOLIO], revalidate: 3600 }
);

export async function saveCertificateDb(cert: DbCertificate): Promise<void> {
  const data = { ...cert, updatedAt: Date.now() };
  await setDoc(COLLECTIONS.CERTIFICATES, cert.id, data);
  revalidateTag(CACHE_TAG_PORTFOLIO, { expire: 0 });
}

export async function deleteCertificateDb(id: string): Promise<void> {
  await deleteDoc(COLLECTIONS.CERTIFICATES, id);
  revalidateTag(CACHE_TAG_PORTFOLIO, { expire: 0 });
}

/* ================= HOME SETTINGS ================= */

export async function fetchRawHomeSettingsDb(): Promise<DbHomeSettings | null> {
  return getDoc<DbHomeSettings>(COLLECTIONS.SETTINGS, 'home_config');
}

export const getCachedHomeSettingsDb = unstable_cache(
  async () => fetchRawHomeSettingsDb(),
  ['cached-portfolio-home-settings'],
  { tags: [CACHE_TAG_PORTFOLIO], revalidate: 3600 }
);

export async function saveHomeSettingsDb(settings: DbHomeSettings): Promise<void> {
  const data = { ...settings, updatedAt: Date.now() };
  await setDoc(COLLECTIONS.SETTINGS, 'home_config', data);
  revalidateTag(CACHE_TAG_PORTFOLIO, { expire: 0 });
}
