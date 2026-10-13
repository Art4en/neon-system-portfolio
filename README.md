# 🎮 NEON//SYSTEM — Portfolio

Portfolio personnel **gaming × code** : le visiteur ne lit pas un CV, il lance une partie.
Fond 3D WebGL qui réagit au scroll et à la souris (paysage synthwave → sphère holographique →
réseau neuronal → hyperespace → double hélice → pseudo en particules → portail), HUD de jeu,
boot BIOS, skill tree RPG, missions holographiques, terminal interactif, achievements,
easter eggs et mini-jeu.

**Stack :** Vite · React 19 · TypeScript · three.js + React Three Fiber + drei + postprocessing ·
GSAP (ScrollTrigger, SplitText, Flip) · Lenis · Tailwind CSS 4 · zustand · shaders GLSL.
Tout le visuel est procédural : aucune image, vidéo ou modèle 3D à télécharger.

---

## Sommaire

1. [Lancer le projet](#1-lancer-le-projet)
2. [Remplir ton contenu, pas à pas](#2-remplir-ton-contenu-pas-à-pas)
3. [Ajouter un projet, une compétence, une étape de parcours](#3-ajouter-un-projet-une-compétence-une-étape-de-parcours)
4. [Avatar, CV et images](#4-avatar-cv-et-images)
5. [Changer les couleurs](#5-changer-les-couleurs)
6. [Configurer le formulaire de contact](#6-configurer-le-formulaire-de-contact)
7. [Déployer gratuitement](#7-déployer-gratuitement)
8. [SEO et image de partage](#8-seo-et-image-de-partage)
9. [Ce que les visiteurs peuvent découvrir](#9-ce-que-les-visiteurs-peuvent-découvrir)
10. [Performance, qualité et accessibilité](#10-performance-qualité-et-accessibilité)
11. [Architecture](#11-architecture)
12. [Champs encore à remplir](#12-champs-encore-à-remplir)

---

## 1. Lancer le projet

Prérequis : **Node.js 20 ou plus récent** (testé avec Node 24).

```bash
npm install        # une seule fois
npm run dev        # serveur de développement → http://localhost:5173
```

| Commande | Rôle |
|---|---|
| `npm run dev` | Développement avec rechargement à chaud |
| `npm run build` | Vérification TypeScript + build de production dans `dist/` |
| `npm run preview` | Sert le build de production en local (http://localhost:4173) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run analyze` | Build + rapport de taille du bundle dans `dist/stats.html` |

> 💡 La séquence de boot complète ne se joue qu'**une fois par session** d'onglet.
> Pour la revoir : ferme l'onglet ou vide le `sessionStorage`.

---

## 2. Remplir ton contenu, pas à pas

**Tout ton contenu est dans un seul fichier : [`src/content/portfolio.ts`](src/content/portfolio.ts).**
Tu n'as rien d'autre à toucher.

### Les règles

- Un texte qui commence par **`[À REMPLIR]`** est un emplacement vide. La suite de la chaîne est la consigne.
  - En **dev** (`npm run dev`), il s'affiche dans un **cadre jaune pointillé ✏️** avec le nom du champ et la consigne.
  - En **prod** (`npm run build`), il est **masqué** : un visiteur ne verra jamais « [À REMPLIR] ».
- Un nombre à **`null`** est aussi « à remplir » (ex. `level: null` → `level: 21`).
- Une chaîne vide **`''`** masque volontairement un champ optionnel (ex. pas de lien de démo).
- Au lancement en dev, la **console du navigateur** (F12) affiche le nombre et la liste de tous les champs encore vides.

### L'ordre conseillé

1. **`identity`** : prénom, nom, **pseudo** (il apparaît en très grand dans le Hero, dans le logo, le terminal, et en particules dans la scène 3D), rôle, 3-4 accroches, ville, statut, bio, école (« guilde »), niveau et âge.
2. **`contact`** : email, phrase d'invitation, réseaux (supprime les lignes inutiles).
3. **`projects`** : tes missions (voir la section 3).
4. **`skills`** : tes compétences, avec un niveau sur 100.
5. **`timeline`** : formations, expériences et distinctions, du plus récent au plus ancien.
6. **`attributes`**, **`funStats`**, **`interests`** : la fiche RPG.
7. **`seo.siteUrl`** une fois le site en ligne (section 8).

Exemple :

```ts
identity: {
  firstName: 'Alex',
  lastName: 'Martin',
  gamertag: 'NEO_DEV',
  role: 'Développeur Full-Stack & Game Dev',
  taglines: [
    'Je transforme des idées en expériences interactives.',
    'Web, jeux et shaders.',
  ],
  age: 21,
  // …
},
```

Tant que `gamertag` n'est pas rempli, le site affiche le pseudo générique `settings.fallbackHandle` (`PLAYER_1`).

---

## 3. Ajouter un projet, une compétence, une étape de parcours

Tu ajoutes simplement un objet dans le tableau correspondant. Rien d'autre à modifier.

### Un projet (mission)

```ts
projects: [
  {
    slug: 'neon-racer',                 // unique, minuscules, sans espace → lien #neon-racer + dossier d'images
    title: 'Neon Racer',
    year: 2025,
    type: 'Jeu',
    tech: ['Unity', 'C#', 'Blender'],
    summary: 'Un jeu de course arcade en 3D… (2 phrases)',
    context: 'Projet de fin de semestre…',
    role: "J'ai codé le gameplay et les shaders…",
    challenges: 'Optimiser le rendu sur mobile…',
    result: '…',
    demoUrl: 'https://alex.itch.io/neon-racer',   // ou '' s'il n'y en a pas
    codeUrl: '',                                   // '' = bouton « Code N/A »
    rarity: 'legendary',   // 'common' | 'rare' | 'epic' | 'legendary' → couleur de la carte
    status: 'completed',   // ou 'in-progress'
  },
  // …
],
```

- Le briefing d'un projet a un **lien partageable** : `https://ton-site/#neon-racer`.
- Pour relier une compétence à des projets : `projects: ['neon-racer']` dans la compétence.

### Une compétence

```ts
{ name: 'TypeScript', level: 80, category: 'languages', years: 3, projects: ['neon-racer'] },
```

`category` : `'languages'`, `'front'`, `'back'`, `'tools'` ou `'gamedev'`.
Les libellés des catégories se changent dans `skillCategories`. Une catégorie sans compétence n'est pas affichée.

### Une étape de parcours

```ts
{
  date: '2023 — 2025',
  title: 'BUT Informatique',
  place: 'IUT de Lyon',
  description: 'Développement web, algorithmique, projets en équipe.',
  kind: 'education',   // 'education' | 'experience' | 'award'
},
```

### Centres d'intérêt (inventaire)

```ts
{ name: 'Jeux vidéo', icon: 'gamepad', description: 'Surtout les jeux indés et les roguelikes.' },
```

Icônes disponibles : `box`, `gamepad`, `music`, `headphones`, `guitar`, `book`, `pen`, `camera`, `film`,
`palette`, `brush`, `code`, `cpu`, `rocket`, `mountain`, `bike`, `dumbbell`, `trophy`, `plane`, `globe`,
`coffee`, `chef`, `dice`, `swords`.

---

## 4. Avatar, CV et images

Les fichiers se déposent dans le dossier **`public/`** et sont **détectés automatiquement** (pas de configuration,
pas d'erreur 404 s'ils manquent).

| Fichier | Emplacement | S'il est absent |
|---|---|---|
| Photo / avatar | `public/avatar.jpg` | avatar néon généré (initiales en pixel art) |
| CV | `public/cv.pdf` | bouton désactivé « CV · Bientôt disponible » |
| Couverture d'un projet | `public/projects/<slug>/cover.webp` | visuel procédural unique |
| Galerie d'un projet | `public/projects/<slug>/*.webp` (toutes les images du dossier) | visuel procédural |

- Formats acceptés : `webp`, `avif`, `jpg`, `png`, `gif`. Préfère **WebP**, en 1600 px de large maximum.
- Avatar en PNG ou WebP ? Change `settings.avatarFile` (ex. `'avatar.webp'`). Idem `settings.cvFile`.
- Le dossier d'un projet porte **exactement** le `slug` du projet (ex. `public/projects/neon-racer/`).
- En dev, ajouter ou supprimer un fichier dans `public/` recharge la page automatiquement.

---

## 5. Changer les couleurs

Les couleurs sont définies à deux endroits (qui doivent rester cohérents) :

1. **[`src/styles/tokens.css`](src/styles/tokens.css)** : variables CSS de l'interface (`--neon-cyan`, `--neon-magenta`,
   `--bg`…), couleurs de rareté, et thèmes d'accent (`data-accent="magenta"`, `"green"`).
2. **[`src/scene/palette.ts`](src/scene/palette.ts)** : les mêmes couleurs pour les shaders de la scène 3D (objet `COLORS`).

Pour changer la couleur principale (cyan par défaut), modifie `--neon-cyan` **et** `--accent-rgb` (même couleur en
`R G B`) dans `tokens.css`, puis `COLORS.cyan` dans `palette.ts`.

Les polices (Orbitron, JetBrains Mono, Space Grotesk) sont auto-hébergées via `@fontsource` et importées dans
`src/main.tsx`.

---

## 6. Configurer le formulaire de contact

Sans configuration, le bouton `SEND TRANSMISSION` **ouvre le client mail du visiteur** (`mailto:`) vers
`contact.email`. Pour recevoir les messages directement, choisis **une** des options gratuites :

**Option A — Web3Forms (le plus simple, sans compte)**
1. Va sur <https://web3forms.com>, entre ton email, récupère ta *Access Key*.
2. Copie `.env.example` en `.env` et colle la clé : `VITE_WEB3FORMS_KEY=ta-cle`.

**Option B — Formspree**
1. Crée un formulaire sur <https://formspree.io>.
2. Dans `.env` : `VITE_FORMSPREE_ID=xyzabcd` (la fin de l'URL du formulaire).

Redémarre `npm run dev` après avoir modifié `.env`.
**En ligne**, ajoute la même variable dans les réglages de ton hébergeur (Vercel / Netlify : *Environment
Variables* ; GitHub Pages : *Settings → Secrets and variables → Actions*, nom `VITE_WEB3FORMS_KEY`).

Le formulaire inclut une validation en direct, un champ anti-spam invisible et un repli : si l'envoi échoue,
ton email est proposé au visiteur.

---

## 7. Déployer gratuitement

Le site est 100 % statique : le dossier `dist/` produit par `npm run build` peut être hébergé n'importe où.
Commence par pousser le projet sur GitHub :

```bash
git init
git add .
git commit -m "Portfolio NEON//SYSTEM"
git branch -M main
git remote add origin https://github.com/<ton-pseudo>/<nom-du-repo>.git
git push -u origin main
```

### Vercel (recommandé)
1. <https://vercel.com> → *Add New → Project* → importe ton dépôt.
2. Vercel détecte Vite (config fournie dans `vercel.json`) → *Deploy*.
3. Ajoute tes variables d'environnement (formulaire) dans *Settings → Environment Variables*, puis redéploie.

Ou en ligne de commande : `npx vercel` puis `npx vercel --prod`.

### Netlify
1. <https://app.netlify.com> → *Add new site → Import an existing project* → ton dépôt.
2. Les réglages sont lus depuis `netlify.toml` (build `npm run build`, dossier `dist`).

Ou en ligne de commande : `npm run build && npx netlify-cli deploy --prod --dir=dist`.

### GitHub Pages
1. Dans le dépôt : *Settings → Pages → Source : **GitHub Actions***.
2. Pousse sur `main` : le workflow `.github/workflows/deploy.yml` build et publie automatiquement.
3. Le site est servi sous `https://<ton-pseudo>.github.io/<nom-du-repo>/` (le workflow règle `BASE_PATH` tout seul).
   Si ton dépôt s'appelle `<ton-pseudo>.github.io`, remplace `BASE_PATH` par `/` dans le workflow.

Pour tester localement un build « GitHub Pages » : `BASE_PATH=/nom-du-repo/ npm run build && npm run preview`.

---

## 8. SEO et image de partage

- Le `<title>`, la meta description, Open Graph, Twitter Card et les données structurées **JSON-LD `Person`** sont
  générés au build à partir de `portfolio.ts` (nom, rôle, bio, réseaux) — voir `build/html-plugins.ts`.
- Renseigne **`seo.siteUrl`** une fois le site en ligne : il sert aux URL absolues (Open Graph, canonical) et active
  la génération de **`sitemap.xml`** (sinon le build t'avertit). `robots.txt` est toujours généré.
- `seo.title` et `seo.description` sont optionnels (sinon : « Prénom Nom — Rôle | Portfolio » et ta bio).
- **`public/og.png`** (1200×630) est une image de partage **provisoire** (« PORTFOLIO » sur le paysage néon).
  Remplace-la par une capture de ton Hero avec ton nom une fois ton contenu rempli.
- Favicon néon : `public/favicon.svg`.

---

## 9. Ce que les visiteurs peuvent découvrir

**Commandes du terminal** (section Console) : `help`, `whoami`, `about`, `skills`, `projects`, `open <projet>`,
`contact`, `socials`, `cv`, `theme <cyan|magenta|green>`, `matrix`, `play`, `achievements`, `history`, `clear`,
`sudo hire-me`… (+ quelques commandes cachées). Historique avec ↑ / ↓, autocomplétion avec Tab.

**Easter eggs**
- Konami code `↑ ↑ ↓ ↓ ← → ← → B A` → **GOD MODE** (palette verte, pluie de code, explosion de particules).
- Taper `matrix` n'importe où sur la page (hors champ de saisie).
- Cliquer 5 fois sur le logo.
- Un message en art ASCII dans la console du navigateur.
- `play` dans le terminal → mini-jeu **NEON_SNAKE** (meilleur score enregistré localement).

**Achievements visiteur** (toasts, mémorisés dans le navigateur) : Explorateur, Curieux, Hacker, Networker,
Speedrunner, Time Traveler, High Score + 3 succès secrets.

**Footer** : `CONTINUE ▲` rembobine tout le voyage 3D à l'envers.

---

## 10. Performance, qualité et accessibilité

- **Qualité graphique** `LOW / MED / HIGH / ULTRA` réglable dans le HUD (ou le menu pause sur mobile). En `AUTO`,
  elle démarre en HIGH (MEDIUM sur mobile) et s'ajuste en direct selon les FPS. Presets : `src/scene/quality.ts`.
- **Un seul `requestAnimationFrame`** : Lenis, ScrollTrigger, la scène 3D et le HUD sont tous pilotés par `gsap.ticker`.
  Onglet caché → tout se met en pause.
- Shaders compilés en parallèle avant la première image ; post-processing monté à la première interaction ;
  sections sous le Hero rendues en tâche de fond ; scène 3D, modales et mini-jeu chargés à la demande.
- **`prefers-reduced-motion`** : pas de smooth scroll, pas de glitch ni de morphing, scène quasi statique, contenu
  affiché sans animation, pas de curseur custom.
- **Sans WebGL** : fond synthwave de repli 100 % CSS.
- Navigation complète au clavier, lien d'évitement, focus néon visibles, HTML sémantique, tout le texte est du vrai HTML.
- Mobile : pas de curseur custom, missions en défilement vertical, parallaxe au gyroscope uniquement si tu l'actives
  dans le menu pause.

Mesures Lighthouse (desktop, build de prod, contenu non rempli) : Performance 92 · Accessibilité 100 ·
Bonnes pratiques 100 · SEO 100.

---

## 11. Architecture

```
src/
  content/portfolio.ts      ← TON CONTENU (le seul fichier à modifier)
  content/placeholder.ts    détection des « [À REMPLIR] » + liste en console
  components/
    boot/                   BootSequence (BIOS + PRESS START)
    hud/                    Navbar, XPBar, MiniMap, HudWidget, QualityToggle, SoundToggle, PauseMenu, LevelTransition
    sections/               Hero, About, Skills (+ SkillTree), Projects (+ MissionCard, ProjectBriefing),
                            Timeline, Terminal, Contact, Footer
    ui/                     GlitchText, ScrambleText, Typewriter, MagneticButton, HoloCard, Panel,
                            Placeholder, Toast, Modal, Counter, GeneratedAvatar, ProceduralCover…
    cursor/                 CustomCursor (réticule + traînée)
    layers/                 MatrixRain, Spotlight, NoWebGLFallback
    game/                   SnakeGame (bonus)
  scene/
    Experience.tsx          Canvas global (frameloop piloté par gsap.ticker)
    CameraRig.tsx           voyage de caméra lié au scroll, parallaxe, ressort de la souris
    levels.ts               ancrages de caméra et centres des formes par niveau
    Particles.tsx           particules morphing (7 formes)
    SynthwaveGrid, Mountains, RetroSun, Sky, WarpTunnel, Plexus, Portal
    shapes/                 générateurs : grille, sphère, plexus, tunnel, hélice, vortex, texte → points
    effects/PostFX.tsx      bloom, aberration chromatique, glitch, grain, vignette, scanlines
  shaders/                  *.vert / *.frag (+ chunks/noise.glsl)
  hooks/                    useScrollProgress, useMouse, useReducedMotion, useQuality, useSound, useKonami, useReveals…
  store/                    zustand (useAppStore) + état runtime 60 FPS (runtime.ts)
  audio/synth.ts            sons d'interface en Web Audio (aucun fichier audio)
  lib/                      scroll (Lenis + ScrollTrigger), contenu, terminal, achievements…
  styles/                   tokens.css (thème), globals.css, components.css
build/                      plugins Vite : manifeste de /public, SEO, préchargement des polices
```

---

## 12. Champs encore à remplir

Au moment de la livraison, **124 champs** sont à remplir dans `src/content/portfolio.ts`
(la console du navigateur en dev donne toujours la liste à jour).

**Identité** — `identity.firstName`, `lastName`, `gamertag`, `role`, `taglines[0..2]`, `age` (nombre), `city`,
`status`, `bio`, `guild`, `level` (nombre).

**Fiche RPG** — `attributes[0..3].value` (Créativité, Logique, Persévérance, Esprit d'équipe, sur 100) ·
`funStats[0].value` (projets terminés), `funStats[1].value` (heures de code), `funStats[3].value` (jeu préféré) ·
`interests[0..3].name` et `.description` (+ choisir une `icon`).

**Compétences** — `skills[0..9]` : `name`, `level` (sur 100) et `years` (optionnel) pour chacune.

**Projets** — `projects[0..3]` : `title`, `year`, `type`, `tech`, `summary`, `context`, `role`, `challenges`,
`result`, `demoUrl`, `codeUrl` (+ ajuster `rarity`, `status`, et éventuellement le `slug`).

**Parcours** — `timeline[0..2]` : `date`, `title`, `place`, `description`.

**Contact** — `contact.email`, `contact.subtitle`, `contact.socials[0..3].url` (GitHub, LinkedIn, Discord, itch.io —
supprime les lignes inutiles).

**Intros de sections** (optionnelles, `''` pour masquer) — `sections.skillsIntro`, `projectsIntro`, `timelineIntro`.

**SEO** — `seo.siteUrl` (après le déploiement).

**Fichiers (optionnels)** — `public/avatar.jpg`, `public/cv.pdf`, `public/projects/<slug>/cover.webp` + captures,
et une version personnalisée de `public/og.png`.
