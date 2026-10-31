'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { verifyAdminAuth } from '@/lib/auth/session';
import {
  CACHE_TAG_PORTFOLIO,
  saveProjectDb,
  deleteProjectDb,
  saveExperienceDb,
  deleteExperienceDb,
  saveSkillGroupDb,
  deleteSkillGroupDb,
  saveCertificateDb,
  deleteCertificateDb,
  saveHomeSettingsDb,
  fetchRawProjectsDb,
} from '@/lib/db/repository';
import type {
  DbProject,
  DbExperience,
  DbSkillGroup,
  DbCertificate,
  DbHomeSettings,
} from '@/lib/db/schema';

function revalidateAll() {
  revalidateTag(CACHE_TAG_PORTFOLIO, { expire: 0 });
  revalidatePath('/');
  revalidatePath('/projects');
  revalidatePath('/about');
  revalidatePath('/experience');
  revalidatePath('/lab');
  revalidatePath('/achievements');
  revalidatePath('/admin');
  revalidatePath('/admin/projects');
  revalidatePath('/admin/home-layout');
  revalidatePath('/admin/experiences');
  revalidatePath('/admin/skills');
  revalidatePath('/admin/certificates');
}

export async function saveProjectAction(project: DbProject): Promise<{ success: boolean; error?: string }> {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) return { success: false, error: 'Unauthorized' };

  try {
    await saveProjectDb(project);
    revalidateAll();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Database error' };
  }
}

export async function deleteProjectAction(slug: string): Promise<{ success: boolean; error?: string }> {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) return { success: false, error: 'Unauthorized' };

  try {
    await deleteProjectDb(slug);
    revalidateAll();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Database error' };
  }
}

export async function reorderProjectsAction(orderedSlugs: string[]): Promise<{ success: boolean; error?: string }> {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) return { success: false, error: 'Unauthorized' };

  try {
    const existing = await fetchRawProjectsDb();
    const map = new Map(existing.map(p => [p.slug, p]));

    for (let i = 0; i < orderedSlugs.length; i++) {
      const slug = orderedSlugs[i];
      const proj = map.get(slug);
      if (proj && proj.orderIndex !== i) {
        proj.orderIndex = i;
        await saveProjectDb(proj);
      }
    }

    revalidateAll();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Database error' };
  }
}

export async function saveExperienceAction(exp: DbExperience): Promise<{ success: boolean; error?: string }> {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) return { success: false, error: 'Unauthorized' };

  try {
    await saveExperienceDb(exp);
    revalidateAll();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Database error' };
  }
}

export async function deleteExperienceAction(id: string): Promise<{ success: boolean; error?: string }> {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) return { success: false, error: 'Unauthorized' };

  try {
    await deleteExperienceDb(id);
    revalidateAll();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Database error' };
  }
}

export async function saveSkillGroupAction(group: DbSkillGroup): Promise<{ success: boolean; error?: string }> {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) return { success: false, error: 'Unauthorized' };

  try {
    await saveSkillGroupDb(group);
    revalidateAll();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Database error' };
  }
}

export async function deleteSkillGroupAction(id: string): Promise<{ success: boolean; error?: string }> {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) return { success: false, error: 'Unauthorized' };

  try {
    await deleteSkillGroupDb(id);
    revalidateAll();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Database error' };
  }
}

export async function saveCertificateAction(cert: DbCertificate): Promise<{ success: boolean; error?: string }> {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) return { success: false, error: 'Unauthorized' };

  try {
    await saveCertificateDb(cert);
    revalidateAll();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Database error' };
  }
}

export async function deleteCertificateAction(id: string): Promise<{ success: boolean; error?: string }> {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) return { success: false, error: 'Unauthorized' };

  try {
    await deleteCertificateDb(id);
    revalidateAll();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Database error' };
  }
}

export async function saveHomeSettingsAction(settings: DbHomeSettings): Promise<{ success: boolean; error?: string }> {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) return { success: false, error: 'Unauthorized' };

  try {
    await saveHomeSettingsDb(settings);
    revalidateAll();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Database error' };
  }
}

export async function revalidateCacheAction(): Promise<{ success: boolean }> {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) return { success: false };

  revalidateAll();
  return { success: true };
}
