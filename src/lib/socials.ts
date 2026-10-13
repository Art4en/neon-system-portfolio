import {
  siArtstation,
  siDiscord,
  siGithub,
  siInstagram,
  siItchdotio,
  siTwitch,
  siX,
  siYoutube,
} from 'simple-icons';
import type { SocialPlatform } from '../content/portfolio';

/** LinkedIn n'est plus fourni par simple-icons : tracé SVG embarqué (24×24). */
const LINKEDIN_PATH =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z';

/** Globe générique (site web). */
const WEBSITE_PATH =
  'M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm7.93 7h-3.17a18.6 18.6 0 0 0-1.4-4.6A10.03 10.03 0 0 1 19.93 7zM12 2.05c.87 1.2 1.86 3.06 2.4 4.95H9.6c.54-1.89 1.53-3.75 2.4-4.95zM2.26 14a10.1 10.1 0 0 1 0-4h3.4a20 20 0 0 0 0 4h-3.4zm.81 2h3.17c.33 1.63.8 3.2 1.4 4.6A10.03 10.03 0 0 1 3.07 16zM6.24 8H3.07a10.03 10.03 0 0 1 4.57-4.6A18.6 18.6 0 0 0 6.24 8zM12 21.95c-.87-1.2-1.86-3.06-2.4-4.95h4.8c-.54 1.89-1.53 3.75-2.4 4.95zM14.75 15h-5.5a17.7 17.7 0 0 1 0-6h5.5a17.7 17.7 0 0 1 0 6zm.61 5.6c.6-1.4 1.07-2.97 1.4-4.6h3.17a10.03 10.03 0 0 1-4.57 4.6zM18.34 14a20 20 0 0 0 0-4h3.4a10.1 10.1 0 0 1 0 4h-3.4z';

export const SOCIALS: Record<SocialPlatform, { label: string; path: string }> = {
  github: { label: 'GitHub', path: siGithub.path },
  linkedin: { label: 'LinkedIn', path: LINKEDIN_PATH },
  discord: { label: 'Discord', path: siDiscord.path },
  x: { label: 'X', path: siX.path },
  itchio: { label: 'itch.io', path: siItchdotio.path },
  youtube: { label: 'YouTube', path: siYoutube.path },
  artstation: { label: 'ArtStation', path: siArtstation.path },
  twitch: { label: 'Twitch', path: siTwitch.path },
  instagram: { label: 'Instagram', path: siInstagram.path },
  website: { label: 'Site web', path: WEBSITE_PATH },
};
