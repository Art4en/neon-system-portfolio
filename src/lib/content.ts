import manifest from 'virtual:public-manifest';
import { content } from '../content/portfolio';
import { isFilled } from '../content/placeholder';

const files = new Set<string>(manifest);
const IMAGE_RE = /\.(webp|avif|jpe?g|png|gif)$/i;

/** URL publique d'un fichier de /public, compatible avec un `base` (GitHub Pages). */
export const publicUrl = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '');
export const hasPublicFile = (path: string) => files.has(path.replace(/^\//, ''));

/** Pseudo affiché (gamertag, sinon pseudo générique de `settings.fallbackHandle`). */
export const handle: string = isFilled(content.identity.gamertag)
  ? content.identity.gamertag
  : content.settings.fallbackHandle;

export const hasHandle = isFilled(content.identity.gamertag);

export const fullName: string = [content.identity.firstName, content.identity.lastName]
  .filter((s) => isFilled(s))
  .join(' ');

/** Initiales pour l'avatar généré. */
export const initials: string = (() => {
  const { firstName, lastName } = content.identity;
  if (isFilled(firstName) || isFilled(lastName)) {
    return [firstName, lastName]
      .filter((s) => isFilled(s))
      .map((s) => s.trim()[0])
      .join('')
      .toUpperCase();
  }
  return (
    handle
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 2)
      .toUpperCase() || 'P1'
  );
})();

export const avatarUrl: string | null = hasPublicFile(content.settings.avatarFile)
  ? publicUrl(content.settings.avatarFile)
  : null;

export const cvUrl: string | null = hasPublicFile(content.settings.cvFile)
  ? publicUrl(content.settings.cvFile)
  : null;

/** Images d'un projet : public/projects/<slug>/cover.* + les autres images (galerie). */
export function projectImages(slug: string): { cover: string | null; gallery: string[] } {
  const prefix = `projects/${slug}/`;
  const imgs = manifest.filter((f) => f.startsWith(prefix) && IMAGE_RE.test(f));
  const coverFile = imgs.find((f) => /\/cover\.[a-z]+$/i.test(f)) ?? null;
  return {
    cover: coverFile ? publicUrl(coverFile) : null,
    gallery: imgs.map(publicUrl),
  };
}

/** Lien réellement utilisable (rempli et http/https/mailto). */
export const usableUrl = (url: string): string | null =>
  isFilled(url) && /^(https?:|mailto:)/i.test(url.trim()) ? url.trim() : null;

export const projectBySlug = (slug: string) => content.projects.find((p) => p.slug === slug);
