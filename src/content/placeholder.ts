/**
 * Détection des champs « à remplir » du fichier de contenu.
 * Fichier sans dépendance au DOM : il est aussi utilisé au build (build/html-plugins.ts).
 */
export const TODO_PREFIX = '[À REMPLIR]';

/** true si la valeur est une chaîne placeholder "[À REMPLIR] …". */
export function isTodo(value: unknown): value is `[À REMPLIR]${string}` {
  return typeof value === 'string' && value.trimStart().startsWith(TODO_PREFIX);
}

/** true si la valeur est réellement renseignée (ni placeholder, ni vide, ni null). */
export function isFilled<T>(value: T | null | undefined): value is T {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '' && !isTodo(value);
  return true;
}

/** Consigne d'un placeholder, sans le préfixe. */
export function todoHint(value: string): string {
  return value.trimStart().slice(TODO_PREFIX.length).trim();
}

export interface TodoEntry {
  path: string;
  hint: string;
}

/** Parcourt récursivement le contenu et liste chaque champ encore vide (placeholder ou null). */
export function collectTodos(value: unknown, path = 'content'): TodoEntry[] {
  if (isTodo(value)) return [{ path, hint: todoHint(value) }];
  if (value === null) return [{ path, hint: 'nombre à renseigner' }];
  if (Array.isArray(value)) return value.flatMap((v, i) => collectTodos(v, `${path}[${i}]`));
  if (typeof value === 'object' && value !== undefined) {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      collectTodos(v, `${path}.${k}`),
    );
  }
  return [];
}
