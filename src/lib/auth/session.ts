import 'server-only';
import { cookies } from 'next/headers';
import { getAdminAuthConfig } from './config';
import { createSessionToken, verifySessionToken, type SessionPayload } from './crypto';

export const ADMIN_COOKIE_NAME = 'mhdrhn_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function setAdminSession(username: string): Promise<string> {
  const config = getAdminAuthConfig();
  const secret = config.sessionSecret || 'default_local_dev_secret_mhdrhn_32chars_long!';
  const token = createSessionToken(username, secret, SESSION_MAX_AGE);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return token;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  const config = getAdminAuthConfig();
  const secret = config.sessionSecret || 'default_local_dev_secret_mhdrhn_32chars_long!';
  return verifySessionToken(token, secret);
}

export async function verifyAdminAuth(): Promise<boolean> {
  const session = await getAdminSession();
  return Boolean(session && session.username);
}
