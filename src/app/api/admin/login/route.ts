import { NextResponse } from 'next/server';
import { getAdminAuthConfig } from '@/lib/auth/config';
import { verifyPassword } from '@/lib/auth/crypto';
import { setAdminSession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Simple in-memory rate-limiting for login attempts
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || record.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  record.count += 1;
  return record.count > 5;
}

export async function POST(request: Request) {
  try {
    const ipHint = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
    if (isRateLimited(ipHint)) {
      return NextResponse.json(
        { error: 'too_many_attempts', message: 'Terlalu banyak percobaan. Silakan coba 15 menit lagi.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'invalid_content_type' }, { status: 400 });
    }

    const body = await request.json();
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!username || !password) {
      return NextResponse.json({ error: 'missing_fields', message: 'Username dan password wajib diisi.' }, { status: 400 });
    }

    const config = getAdminAuthConfig();

    // Check if configured
    if (!config.isConfigured) {
      // In development, allow default fallback if variables not yet in .env.local
      if (process.env.NODE_ENV !== 'production' && (!config.passwordHash || !config.sessionSecret)) {
        if (username === 'rehan' && password === 'admin') {
          await setAdminSession('rehan');
          return NextResponse.json({ success: true, user: 'rehan', note: 'Dev default credentials' });
        }
      }

      return NextResponse.json(
        { error: 'not_configured', message: 'Kredensial admin belum dikonfigurasi di environment variables.' },
        { status: 503 }
      );
    }

    // Verify username
    if (username !== config.username) {
      return NextResponse.json({ error: 'invalid_credentials', message: 'Username atau password salah.' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, config.passwordHash, config.passwordSalt);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'invalid_credentials', message: 'Username atau password salah.' }, { status: 401 });
    }

    // Reset attempts on successful login
    attempts.delete(ipHint);

    await setAdminSession(username);
    return NextResponse.json({ success: true, user: username });
  } catch {
    return NextResponse.json({ error: 'internal_error', message: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
