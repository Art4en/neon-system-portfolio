/**
 * Accès au stockage navigateur protégé : en navigation privée, avec cookies bloqués ou
 * dans certains aperçus, localStorage / sessionStorage peuvent lever une exception.
 */
type Kind = 'local' | 'session';

function store(kind: Kind): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStorage<T>(key: string, fallback: T, kind: Kind = 'local'): T {
  try {
    const raw = store(kind)?.getItem(key);
    return raw === null || raw === undefined ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown, kind: Kind = 'local'): void {
  try {
    store(kind)?.setItem(key, JSON.stringify(value));
  } catch {
    /* stockage indisponible : on ignore */
  }
}
