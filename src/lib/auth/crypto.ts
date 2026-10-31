import { createHmac, createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

export function computePbkdf2Hash(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
}

export function computeSha256Hash(password: string, salt: string): string {
  return createHash('sha256').update(salt + password).digest('hex');
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  if (!password || !storedHash) return false;

  const targetBuf = Buffer.from(storedHash, 'hex');
  if (targetBuf.length === 0) return false;

  // Try PBKDF2 first
  const pbkdf2Candidate = Buffer.from(computePbkdf2Hash(password, salt), 'hex');
  if (pbkdf2Candidate.length === targetBuf.length && timingSafeEqual(pbkdf2Candidate, targetBuf)) {
    return true;
  }

  // Try SHA256 fallback
  const shaCandidate = Buffer.from(computeSha256Hash(password, salt), 'hex');
  if (shaCandidate.length === targetBuf.length && timingSafeEqual(shaCandidate, targetBuf)) {
    return true;
  }

  // Also support plaintext match in local development ONLY if no hash algorithm applied
  if (process.env.NODE_ENV !== 'production' && password === storedHash) {
    return true;
  }

  return false;
}

export interface SessionPayload {
  username: string;
  iat: number;
  exp: number;
  nonce: string;
}

export function createSessionToken(username: string, secret: string, maxAgeSeconds: number = 7 * 86400): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    username,
    iat: now,
    exp: now + maxAgeSeconds,
    nonce: randomBytes(8).toString('hex'),
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(encodedPayload).digest('base64url');

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string, secret: string): SessionPayload | null {
  if (!token || !secret || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, providedSignature] = parts;

  const expectedSignature = createHmac('sha256', secret).update(encodedPayload).digest('base64url');

  const providedBuf = Buffer.from(providedSignature);
  const expectedBuf = Buffer.from(expectedSignature);

  if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf)) {
    return null;
  }

  try {
    const raw = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const payload = JSON.parse(raw) as SessionPayload;

    if (!payload.username || !payload.exp || typeof payload.exp !== 'number') {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}
