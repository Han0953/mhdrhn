export interface Reply { text: string; href: string; label: string }
export interface Exchange { id: number; question: string; reply: Reply; ready: boolean }
export const CHAT_CACHE_KEY = "mhdrhn.azura.history.v1";
export const CHAT_TTL = 60 * 60 * 1000;

/** Store only user questions; answers are reconstructed from the current public content. */
export function decodeHistory(raw: string | null, now = Date.now()): { expiresAt: number; questions: { id: number; question: string }[] } | null {
  if (!raw || raw.length > 60000) return null;
  try {
    const value = JSON.parse(raw);
    if (value.version !== 1 || !Number.isFinite(value.expiresAt) || value.expiresAt <= now || value.expiresAt > now + CHAT_TTL || !Array.isArray(value.questions) || value.questions.length > 20) return null;
    const ids = new Set<number>();
    for (const item of value.questions) {
      if (!item || !Number.isSafeInteger(item.id) || ids.has(item.id) || typeof item.question !== "string" || !item.question.trim() || item.question.length > 500) return null;
      ids.add(item.id);
    }
    return { expiresAt: value.expiresAt, questions: value.questions.map(({ id, question }: { id: number; question: string }) => ({ id, question })) };
  } catch { return null; }
}

export function createChatHistory(replyTo: (question: string) => Reply) {
  const empty: Exchange[] = [];
  let messages = empty, expiresAt = 0, timer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach(listener => listener());
  function removeSaved() { try { window.localStorage.removeItem(CHAT_CACHE_KEY); } catch { /* In-memory chat remains usable when storage is blocked. */ } }
  function reset() { clearTimeout(timer); timer = undefined; messages = empty; expiresAt = 0; removeSaved(); emit(); }
  function expire() { if (expiresAt && expiresAt <= Date.now()) reset(); }
  function schedule() { clearTimeout(timer); if (expiresAt && listeners.size) timer = setTimeout(expire, Math.max(0, expiresAt - Date.now())); }
  function restore() {
    try {
      const raw = window.localStorage.getItem(CHAT_CACHE_KEY);
      const saved = decodeHistory(raw);
      if (saved) { expiresAt = saved.expiresAt; messages = saved.questions.map(item => ({ ...item, reply: replyTo(item.question), ready: true })); }
      else { messages = empty; expiresAt = 0; if (raw) removeSaved(); }
    } catch { expire(); }
    schedule(); emit();
  }
  function storage(event: StorageEvent) { if (event.key === CHAT_CACHE_KEY || event.key === null) restore(); }
  function visibility() { if (!document.hidden) expire(); }
  return {
    getSnapshot: () => messages,
    getServerSnapshot: () => empty,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1) { restore(); window.addEventListener("storage", storage); document.addEventListener("visibilitychange", visibility); }
      return () => { listeners.delete(listener); if (!listeners.size) { clearTimeout(timer); window.removeEventListener("storage", storage); document.removeEventListener("visibilitychange", visibility); } };
    },
    append(message: Exchange) {
      expire();
      messages = [...messages, message]; expiresAt = Date.now() + CHAT_TTL;
      try { window.localStorage.setItem(CHAT_CACHE_KEY, JSON.stringify({ version: 1, expiresAt, questions: messages.map(({ id, question }) => ({ id, question })) })); } catch { /* Storage quota/privacy settings must not block sending. */ }
      schedule(); emit();
    },
    finish(id: number) { messages = messages.map(item => item.id === id ? { ...item, ready: true } : item); emit(); },
    reset,
  };
}
