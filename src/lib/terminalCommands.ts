import { content } from '../content/portfolio';
import { isFilled } from '../content/placeholder';
import { cvUrl, fullName, handle, usableUrl } from './content';
import { SOCIALS } from './socials';
import { ACHIEVEMENTS } from './achievements';
import { RARITY_LABEL } from './rarity';
import { useAppStore, type Accent } from '../store/useAppStore';
import { scrollToTarget } from './scroll';

export type LineKind = 'out' | 'err' | 'cmd' | 'sys' | 'accent' | 'ok' | 'todo';
export interface Line {
  text: string;
  kind: LineKind;
}

const DEV = import.meta.env.DEV;
const o = (text: string, kind: LineKind = 'out'): Line => ({ text, kind });

/** Valeur du contenu pour le terminal : remplie → texte ; sinon ✏️ en dev, rien en prod. */
function val(value: string | number | null | undefined, field: string): Line[] {
  if (isFilled(value)) return [o(String(value))];
  return DEV ? [o(`✏️  ${field} — à remplir dans src/content/portfolio.ts`, 'todo')] : [];
}

const bar = (v: number, width = 20) => {
  const n = Math.round((v / 100) * width);
  return `[${'█'.repeat(n)}${'░'.repeat(width - n)}] ${String(v).padStart(3)}`;
};

export const COMMANDS: Record<string, string> = {
  help: 'Affiche cette aide',
  whoami: 'Qui suis-je ?',
  about: 'Ma bio',
  skills: 'Mes compétences',
  projects: 'La liste de mes missions',
  open: 'open <projet> — ouvre le briefing d’une mission',
  contact: 'Comment me contacter',
  socials: 'Mes réseaux',
  cv: 'Télécharger mon CV',
  theme: 'theme <cyan|magenta|green> — change la couleur d’accent',
  matrix: 'Suis le lapin blanc…',
  play: 'Lance le mini-jeu bonus',
  achievements: 'Tes succès de visiteur',
  history: 'Historique des commandes',
  clear: 'Efface le terminal',
  'sudo hire-me': '¯\\_(ツ)_/¯',
};

export const THEMES: Accent[] = ['cyan', 'magenta', 'green'];

export interface CommandContext {
  history: string[];
  clear: () => void;
}

/** Exécute une commande et renvoie les lignes à afficher (les effets de bord passent par le store). */
export function runCommand(raw: string, ctx: CommandContext): Line[] {
  const input = raw.trim();
  const [cmd, ...args] = input.split(/\s+/);
  const arg = args.join(' ');
  const st = useAppStore.getState();

  switch (cmd?.toLowerCase()) {
    case '':
      return [];
    case 'help':
      return [
        o('COMMANDES DISPONIBLES', 'accent'),
        ...Object.entries(COMMANDS).map(([k, v]) => o(`  ${k.padEnd(14)} ${v}`)),
        o(''),
        o('Astuces : Tab = autocomplétion · ↑ / ↓ = historique', 'sys'),
      ];
    case 'whoami': {
      return [
        o(`${handle}${fullName ? ` (${fullName})` : ''}`, 'accent'),
        ...val(content.identity.role, 'identity.role'),
        ...val(content.identity.status, 'identity.status'),
      ];
    }
    case 'about':
      return [
        o('// PLAYER_LORE', 'accent'),
        ...val(content.identity.bio, 'identity.bio'),
        ...(isFilled(content.identity.city) ? [o(`Zone : ${content.identity.city}`, 'sys')] : []),
      ];
    case 'skills': {
      const lines: Line[] = [o('// SKILL_TREE', 'accent')];
      for (const cat of content.skillCategories) {
        const list = content.skills.filter(
          (s) => s.category === cat.id && (DEV || isFilled(s.name)),
        );
        if (!list.length) continue;
        lines.push(o(`▸ ${cat.label.toUpperCase()}`, 'sys'));
        for (const s of list) {
          const name = isFilled(s.name) ? s.name : '✏️ à remplir';
          lines.push(
            o(`  ${name.padEnd(18).slice(0, 18)} ${isFilled(s.level) ? bar(s.level) : '[ ?? ]'}`),
          );
        }
      }
      return lines;
    }
    case 'projects': {
      const list = content.projects.filter((p) => DEV || isFilled(p.title));
      return [
        o('// MISSION_LOG', 'accent'),
        ...list.map((p, i) =>
          o(
            `  #${String(i + 1).padStart(2, '0')}  ${(isFilled(p.title) ? p.title : '✏️ titre à remplir').padEnd(30).slice(0, 30)}  [${RARITY_LABEL[p.rarity]}]  → open ${p.slug}`,
          ),
        ),
        o(''),
        o('Tape « open <slug> » ou « open <numéro> » pour lire le briefing.', 'sys'),
      ];
    }
    case 'open': {
      if (!arg) return [o('Usage : open <projet>  (ex : open 1)', 'err')];
      const n = Number(arg);
      const p = Number.isInteger(n)
        ? content.projects[n - 1]
        : content.projects.find((x) => x.slug === arg.toLowerCase());
      if (!p) return [o(`[ERROR] Mission introuvable : ${arg}`, 'err')];
      st.setOpenProject(p.slug);
      st.unlock('curious');
      return [o(`> Chargement du briefing « ${isFilled(p.title) ? p.title : p.slug} »…`, 'ok')];
    }
    case 'contact': {
      const email = isFilled(content.contact.email) ? content.contact.email : null;
      return [
        o('// COMM_LINK', 'accent'),
        ...(email ? [o(`Email : ${email}`)] : val(content.contact.email, 'contact.email')),
        o('Ou utilise le formulaire de la section CONTACT (tape « sudo hire-me » 😉).', 'sys'),
      ];
    }
    case 'socials': {
      const list = content.contact.socials.map((s) => ({ s, url: usableUrl(s.url) }));
      const lines = [o('// NETWORK', 'accent')];
      for (const { s, url } of list) {
        if (url) lines.push(o(`  ${SOCIALS[s.platform].label.padEnd(12)} ${url}`));
        else if (DEV)
          lines.push(o(`  ${SOCIALS[s.platform].label.padEnd(12)} ✏️ lien à remplir`, 'todo'));
      }
      if (lines.length === 1) lines.push(o('Aucun réseau renseigné pour le moment.', 'sys'));
      return lines;
    }
    case 'cv': {
      if (!cvUrl) return [o('[SYS] CV bientôt disponible. Reviens vite !', 'sys')];
      const a = document.createElement('a');
      a.href = cvUrl;
      a.download = '';
      a.click();
      return [o('> Téléchargement du CV lancé ✔', 'ok')];
    }
    case 'theme': {
      const t = arg.toLowerCase() as Accent;
      if (!THEMES.includes(t)) return [o(`Usage : theme <${THEMES.join('|')}>`, 'err')];
      st.setAccent(t);
      return [o(`> Thème « ${t} » appliqué ✔`, 'ok')];
    }
    case 'matrix':
      st.triggerMatrix(7000);
      st.unlock('neo');
      return [o('Wake up, Neo…', 'ok'), o('The Matrix has you.', 'ok')];
    case 'play':
      st.setGameOpen(true);
      st.unlock('gamer');
      return [o('> Lancement de NEON_SNAKE.exe…', 'ok')];
    case 'achievements': {
      const ids = Object.keys(ACHIEVEMENTS) as (keyof typeof ACHIEVEMENTS)[];
      return [
        o(`// SUCCÈS ${st.achievements.length}/${ids.length}`, 'accent'),
        ...ids.map((id) => {
          const a = ACHIEVEMENTS[id];
          const got = st.achievements.includes(id);
          return o(
            `  ${got ? '🏆' : '🔒'} ${got || !a.secret ? a.title : '???'.padEnd(a.title.length, '?')}${got || !a.secret ? ` — ${a.description}` : ' — succès secret'}`,
            got ? 'ok' : 'out',
          );
        }),
      ];
    }
    case 'history':
      return ctx.history.length
        ? ctx.history.map((h, i) => o(`  ${String(i + 1).padStart(3)}  ${h}`))
        : [o('Historique vide.', 'sys')];
    case 'clear':
      ctx.clear();
      return [];
    case 'ls':
      return [o('about.txt  skills.db  missions/  achievements.log  secret_konami.txt', 'out')];
    case 'cat':
      if (arg === 'secret_konami.txt') return [o('↑ ↑ ↓ ↓ ← → ← → B A', 'accent')];
      return [o(`cat: ${arg || '?'}: essaie plutôt « about » ou « skills »`, 'err')];
    case 'echo':
      return [o(arg)];
    case 'date':
      return [o(new Date().toLocaleString('fr-FR'))];
    case 'exit':
      return [o("Il n'y a pas de sortie. Seulement un CONTINUE ▲", 'sys')];
    case 'rm':
      return [o('Bien essayé. Système protégé par un pare-feu néon 🔥', 'err')];
    case 'sudo': {
      if (arg.toLowerCase() === 'hire-me' || arg.toLowerCase() === 'hire me') {
        window.setTimeout(() => scrollToTarget('contact'), 1800);
        return [
          o('[sudo] mot de passe pour recruteur : ********', 'sys'),
          o('Vérification des privilèges… ACCESS GRANTED ✔', 'ok'),
          o('Excellente décision. Ta candidature au recrutement a été acceptée 😎', 'accent'),
          o('> Redirection vers le canal de communication…', 'ok'),
        ];
      }
      return [
        o(`${handle} n'est pas dans le fichier sudoers. Cet incident sera signalé. 🚨`, 'err'),
      ];
    }
    default:
      return [o(`[ERROR] commande introuvable : ${cmd} — tape « help »`, 'err')];
  }
}

/** Autocomplétion : commandes, slugs de projets, thèmes. */
export function complete(input: string): string | null {
  const parts = input.split(/\s+/);
  if (parts.length === 1) {
    const match = Object.keys(COMMANDS).filter((c) => c.startsWith(parts[0].toLowerCase()));
    return match.length === 1
      ? match[0] + (match[0] === 'open' || match[0] === 'theme' ? ' ' : '')
      : null;
  }
  const [cmd, partial] = parts;
  const pool =
    cmd === 'open'
      ? content.projects.map((p) => p.slug)
      : cmd === 'theme'
        ? THEMES
        : cmd === 'sudo'
          ? ['hire-me']
          : [];
  const match = pool.filter((x) => x.startsWith(partial ?? ''));
  return match.length === 1 ? `${cmd} ${match[0]}` : null;
}
