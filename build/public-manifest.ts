import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

/**
 * Module virtuel `virtual:public-manifest` : liste de tous les fichiers de /public.
 *
 * Pourquoi ? Pour savoir SANS requête réseau si `avatar.jpg`, `cv.pdf` ou les images
 * `projects/<slug>/...` existent. Pas de 404 dans la console, pas de flash d'image cassée,
 * et la galerie d'un projet se remplit toute seule quand on dépose des images dans son dossier.
 */
const VIRTUAL_ID = 'virtual:public-manifest';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

function scan(dir: string, base = ''): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...scan(path.join(dir, entry.name), rel));
    else out.push(rel);
  }
  return out.sort();
}

export function publicManifest(): Plugin {
  let publicDir = '';
  return {
    name: 'neon:public-manifest',
    configResolved(config) {
      publicDir = config.publicDir;
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id === RESOLVED_ID) return `export default ${JSON.stringify(scan(publicDir))};`;
    },
    configureServer(server) {
      // En dev : ajouter / supprimer un fichier dans /public recharge la page avec le nouveau manifeste.
      const onChange = (file: string) => {
        if (!path.resolve(file).startsWith(path.resolve(publicDir))) return;
        const graph = server.environments?.client?.moduleGraph ?? server.moduleGraph;
        const mod = graph.getModuleById(RESOLVED_ID);
        if (mod) graph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.add(publicDir);
      server.watcher.on('add', onChange);
      server.watcher.on('unlink', onChange);
    },
  };
}
