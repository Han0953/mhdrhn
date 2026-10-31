import { createHash, createPrivateKey, sign, type KeyObject } from 'node:crypto';

interface FirebaseCredentials {
  project: string;
  email: string;
  key: KeyObject;
  identity: string;
}

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
let cachedCreds: FirebaseCredentials | null = null;
let cachedToken: { identity: string; value: string; until: number } | null = null;

function getCredentials(): FirebaseCredentials | null {
  const project = process.env.FIREBASE_PROJECT_ID?.trim();
  const email = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const pem = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();

  if (!project || !email || !pem) return null;

  const identity = createHash('sha256').update(`${project}\n${email}\n${pem}`).digest('hex');
  if (cachedCreds?.identity === identity) return cachedCreds;

  try {
    const key = createPrivateKey(pem);
    if (key.asymmetricKeyType !== 'rsa') return null;
    return (cachedCreds = { project, email, key, identity });
  } catch {
    return null;
  }
}

async function getAccessToken(creds: FirebaseCredentials): Promise<string> {
  if (cachedToken?.identity === creds.identity && cachedToken.until > Date.now()) {
    return cachedToken.value;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const encode = (v: unknown) => Buffer.from(JSON.stringify(v)).toString('base64url');
  const unsigned =
    encode({ alg: 'RS256', typ: 'JWT' }) +
    '.' +
    encode({
      iss: creds.email,
      scope: 'https://www.googleapis.com/auth/datastore',
      aud: TOKEN_URL,
      iat: nowSeconds,
      exp: nowSeconds + 3600,
    });

  const signature = sign('RSA-SHA256', Buffer.from(unsigned), creds.key).toString('base64url');
  const assertion = `${unsigned}.${signature}`;

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to obtain Google Cloud OAuth token: ${response.status}`);
  }

  const data = await response.json();
  const token = data.access_token as string;
  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 3600;

  cachedToken = {
    identity: creds.identity,
    value: token,
    until: Date.now() + (expiresIn - 60) * 1000,
  };

  return token;
}

// Convert JavaScript value to Firestore Value representation
export function toFirestoreValue(val: unknown): Record<string, unknown> {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

// Convert Firestore Value representation to plain JavaScript value
export function fromFirestoreValue(val: Record<string, unknown>): unknown {
  if ('nullValue' in val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('arrayValue' in val && typeof val.arrayValue === 'object' && val.arrayValue !== null) {
    const arr = val.arrayValue as { values?: Record<string, unknown>[] };
    const values = arr.values || [];
    return values.map(fromFirestoreValue);
  }
  if ('mapValue' in val && typeof val.mapValue === 'object' && val.mapValue !== null) {
    const map = val.mapValue as { fields?: Record<string, unknown> };
    const fields = map.fields || {};
    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (typeof v === 'object' && v !== null) {
        res[k] = fromFirestoreValue(v as Record<string, unknown>);
      }
    }
    return res;
  }
  return null;
}

export function toFirestoreDocument(data: Record<string, unknown>): { fields: Record<string, unknown> } {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) fields[k] = toFirestoreValue(v);
  }
  return { fields };
}

export function fromFirestoreDocument<T>(doc: { fields?: Record<string, unknown> }): T {
  const fields = doc.fields || {};
  const res: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'object' && v !== null) {
      res[k] = fromFirestoreValue(v as Record<string, unknown>);
    }
  }
  return res as T;
}

export async function getDoc<T>(collection: string, docId: string): Promise<T | null> {
  const creds = getCredentials();
  if (!creds) return null;

  try {
    const token = await getAccessToken(creds);
    const database = `projects/${creds.project}/databases/(default)`;
    const url = `https://firestore.googleapis.com/v1/${database}/documents/${collection}/${docId}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      if (res.status === 401) cachedToken = null;
      throw new Error(`Firestore get error: ${res.status}`);
    }

    const doc = await res.json();
    return fromFirestoreDocument<T>(doc);
  } catch (error) {
    console.error(`[Firestore REST] getDoc failed on ${collection}/${docId}:`, error);
    return null;
  }
}

export async function listDocs<T>(collection: string): Promise<T[]> {
  const creds = getCredentials();
  if (!creds) return [];

  try {
    const token = await getAccessToken(creds);
    const database = `projects/${creds.project}/databases/(default)`;
    const url = `https://firestore.googleapis.com/v1/${database}/documents/${collection}?pageSize=300`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (res.status === 404) return [];
    if (!res.ok) {
      if (res.status === 401) cachedToken = null;
      throw new Error(`Firestore list error: ${res.status}`);
    }

    const data = await res.json();
    const documents = (data.documents || []) as Array<{ fields?: Record<string, unknown> }>;
    return documents.map(doc => fromFirestoreDocument<T>(doc));
  } catch (error) {
    console.error(`[Firestore REST] listDocs failed on ${collection}:`, error);
    return [];
  }
}

export async function setDoc<T extends Record<string, unknown>>(
  collection: string,
  docId: string,
  data: T
): Promise<boolean> {
  const creds = getCredentials();
  if (!creds) throw new Error('Firebase credentials not configured');

  const token = await getAccessToken(creds);
  const database = `projects/${creds.project}/databases/(default)`;
  const url = `https://firestore.googleapis.com/v1/${database}/documents/${collection}/${docId}`;

  const docPayload = toFirestoreDocument(data);

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(docPayload),
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 401) cachedToken = null;
    const errText = await res.text();
    throw new Error(`Firestore setDoc error ${res.status}: ${errText}`);
  }

  return true;
}

export async function deleteDoc(collection: string, docId: string): Promise<boolean> {
  const creds = getCredentials();
  if (!creds) throw new Error('Firebase credentials not configured');

  const token = await getAccessToken(creds);
  const database = `projects/${creds.project}/databases/(default)`;
  const url = `https://firestore.googleapis.com/v1/${database}/documents/${collection}/${docId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok && res.status !== 404) {
    if (res.status === 401) cachedToken = null;
    throw new Error(`Firestore deleteDoc error ${res.status}`);
  }

  return true;
}

export async function batchSetDocs<T extends Record<string, unknown>>(
  collection: string,
  items: { id: string; data: T }[]
): Promise<boolean> {
  const creds = getCredentials();
  if (!creds) throw new Error('Firebase credentials not configured');

  const token = await getAccessToken(creds);
  const database = `projects/${creds.project}/databases/(default)`;
  const url = `https://firestore.googleapis.com/v1/${database}/documents:commit`;

  const writes = items.map(item => ({
    update: {
      name: `${database}/documents/${collection}/${item.id}`,
      fields: toFirestoreDocument(item.data).fields,
    },
  }));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ writes }),
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 401) cachedToken = null;
    const errText = await res.text();
    throw new Error(`Firestore batchSetDocs error ${res.status}: ${errText}`);
  }

  return true;
}
