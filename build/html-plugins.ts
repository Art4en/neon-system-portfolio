import type { HtmlTagDescriptor, Plugin } from 'vite';
import { content } from '../src/content/portfolio.ts';
import { isFilled } from '../src/content/placeholder.ts';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Valeurs SEO calculées depuis src/content/portfolio.ts (rien d'inventé : repli générique si vide). */
function seoValues() {
  const { identity, seo, contact } = content;
  const fullName = [identity.firstName, identity.lastName].filter(isFilled).join(' ');
  const handle = isFilled(identity.gamertag) ? identity.gamertag : '';
  const who = fullName || handle;
  const role = isFilled(identity.role) ? identity.role : '';
  const title = isFilled(seo.title)
    ? seo.title
    : who
      ? `${who}${role ? ` — ${role}` : ''} | Portfolio`
      : 'NEON//SYSTEM — Portfolio';
  const description = isFilled(seo.description)
    ? seo.description
    : isFilled(identity.bio)
      ? identity.bio
      : 'Portfolio interactif NEON//SYSTEM : projets, compétences et parcours.';
  const siteUrl = isFilled(seo.siteUrl) ? seo.siteUrl.replace(/\/$/, '') : '';
  const sameAs = contact.socials.map((s) => s.url).filter((u) => isFilled(u) && /^https?:/.test(u));
  const person: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'Person' };
  if (who) person.name = who;
  if (handle && fullName) person.alternateName = handle;
  if (role) person.jobTitle = role;
  if (siteUrl) person.url = siteUrl;
  if (isFilled(contact.email)) person.email = `mailto:${contact.email}`;
  if (isFilled(identity.city))
    person.address = { '@type': 'PostalAddress', addressLocality: identity.city };
  if (sameAs.length) person.sameAs = sameAs;
  return { title, description, siteUrl, person };
}

/** Injecte title / meta / Open Graph / Twitter / JSON-LD, et génère robots.txt + sitemap.xml au build. */
export function seoPlugin(): Plugin {
  let base = '/';
  return {
    name: 'neon:seo',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml(html) {
      const { title, description, siteUrl, person } = seoValues();
      const ogImage = siteUrl ? `${siteUrl}/og.png` : `${base}og.png`;
      // Sans URL publique, pas de canonical / og:url (ils doivent être absolus).
      if (!siteUrl)
        html = html
          .replace(/\s*<link rel="canonical"[^>]*>/, '')
          .replace(/\s*<meta property="og:url"[^>]*>/, '');
      return html
        .replace(/%NEON_TITLE%/g, esc(title))
        .replace(/%NEON_DESCRIPTION%/g, esc(description))
        .replace(/%NEON_OG_IMAGE%/g, esc(ogImage))
        .replace(/%NEON_URL%/g, esc(siteUrl ? `${siteUrl}/` : base))
        .replace('%NEON_JSONLD%', JSON.stringify(person).replace(/</g, '\\u003c'));
    },
    generateBundle() {
      const { siteUrl } = seoValues();
      const robots = ['User-agent: *', 'Allow: /', siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml` : '']
        .filter(Boolean)
        .join('\n');
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots + '\n' });
      if (siteUrl) {
        const today = new Date().toISOString().slice(0, 10);
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
</urlset>
`;
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: xml });
      } else {
        this.warn('seo.siteUrl est vide dans src/content/portfolio.ts → sitemap.xml non généré.');
      }
    },
  };
}

/** Précharge les polices variables (sous-ensemble latin) pour éviter le flash de police. */
export function fontPreloadPlugin(): Plugin {
  let base = '/';
  return {
    name: 'neon:font-preload',
    apply: 'build',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (!ctx.bundle) return;
        const tags: HtmlTagDescriptor[] = Object.keys(ctx.bundle)
          .filter((f) =>
            /(orbitron|space-grotesk|jetbrains-mono)-latin-wght-normal[^/]*\.woff2$/.test(f),
          )
          .map((f) => ({
            tag: 'link',
            attrs: {
              rel: 'preload',
              as: 'font',
              type: 'font/woff2',
              href: base + f,
              crossorigin: '',
            },
            injectTo: 'head',
          }));
        return tags;
      },
    },
  };
}
