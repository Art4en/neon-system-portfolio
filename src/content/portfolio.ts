/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  NEON//SYSTEM — FICHIER DE CONTENU                                        ║
 * ║  C'est LE SEUL fichier à modifier pour personnaliser le portfolio.        ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * RÈGLES SIMPLES
 * 1. Tout texte qui commence par "[À REMPLIR]" est un emplacement vide.
 *    → en dev (npm run dev) il s'affiche dans un cadre jaune ✏️ avec la consigne ;
 *    → en prod (npm run build) il est masqué : un visiteur ne le verra jamais.
 *    Remplace la chaîne ENTIÈRE (y compris "[À REMPLIR] …") par ton texte.
 * 2. Les nombres à `null` sont aussi « à remplir » (ex : `level: null` → `level: 85`).
 * 3. Une chaîne vide '' = champ volontairement masqué (utile pour les champs optionnels).
 * 4. Ajouter un projet / une compétence / une étape = copier-coller un objet dans le tableau.
 * 5. Au lancement en dev, la console du navigateur liste tous les champs encore vides.
 *
 * Les images ne se déclarent pas ici : dépose-les dans /public (voir README) et elles
 * sont détectées automatiquement.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * TYPES (tu n'as normalement pas besoin de les modifier)
 * ──────────────────────────────────────────────────────────────────────────── */

/** Rareté d'un projet = uniquement le style de sa carte (couleur, bordure, badge). */
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

/** Identifiants des catégories de compétences (voir `skillCategories`). */
export type SkillCategoryId = 'languages' | 'front' | 'back' | 'tools' | 'gamedev';

/** Réseaux supportés (icône + libellé automatiques). */
export type SocialPlatform =
  | 'github'
  | 'linkedin'
  | 'discord'
  | 'x'
  | 'itchio'
  | 'youtube'
  | 'artstation'
  | 'twitch'
  | 'instagram'
  | 'website';

/** Icônes disponibles pour l'inventaire (centres d'intérêt). */
export type InventoryIcon =
  | 'box'
  | 'gamepad'
  | 'music'
  | 'headphones'
  | 'guitar'
  | 'book'
  | 'pen'
  | 'camera'
  | 'film'
  | 'palette'
  | 'brush'
  | 'code'
  | 'cpu'
  | 'rocket'
  | 'mountain'
  | 'bike'
  | 'dumbbell'
  | 'trophy'
  | 'plane'
  | 'globe'
  | 'coffee'
  | 'chef'
  | 'dice'
  | 'swords';

/** Type d'étape du parcours (change l'icône et la couleur du succès). */
export type TimelineKind = 'education' | 'experience' | 'award';

export interface Identity {
  firstName: string;
  lastName: string;
  /** Pseudo / gamertag : affiché en très grand dans le Hero, dans le logo, le terminal… */
  gamertag: string;
  /** Titre / rôle, tapé comme dans un terminal sous ton nom (et « classe » de la fiche RPG). */
  role: string;
  /** 3 ou 4 phrases d'accroche qui tournent dans le Hero. */
  taglines: string[];
  /** Âge (optionnel). */
  age: number | null;
  city: string;
  /** Statut : « Étudiant en … », « Disponible pour un stage / une alternance »… */
  status: string;
  /** Bio courte (2-3 phrases). */
  bio: string;
  /** « Guilde » de la fiche RPG = ton école ou ton entreprise. */
  guild: string;
  /** « Niveau » de la fiche RPG = ton âge OU tes années d'expérience (nombre). */
  level: number | null;
}

/** Attribut RPG de la fiche joueur (barre qui se remplit). */
export interface Attribute {
  name: string;
  /** Valeur sur 100. */
  value: number | null;
}

/** Stat fun affichée comme une stat de joueur (compteur animé si c'est un nombre). */
export interface FunStat {
  label: string;
  value: number | string | null;
  /** Suffixe optionnel ajouté après le nombre (ex : '+', 'h'). */
  suffix?: string;
}

/** Objet de l'inventaire = un centre d'intérêt. */
export interface Interest {
  name: string;
  icon: InventoryIcon;
  description: string;
}

export interface SkillCategory {
  id: SkillCategoryId;
  label: string;
}

export interface Skill {
  /** Nom de la compétence (ex : JavaScript). */
  name: string;
  /** Niveau sur 100. */
  level: number | null;
  category: SkillCategoryId;
  /** Années de pratique (optionnel). */
  years: number | null;
  /** Slugs des projets liés (ex : ['projet-1']). Optionnel. */
  projects: string[];
}

export interface Project {
  /**
   * Identifiant unique, en minuscules et sans espace (ex : 'mon-super-jeu').
   * Sert pour le lien partageable (#mon-super-jeu) ET le dossier d'images :
   * public/projects/<slug>/cover.webp (+ autres images = galerie).
   */
  slug: string;
  title: string;
  year: number | null;
  /** Web / Jeu / App / Outil / Projet scolaire… */
  type: string;
  /** Technologies (affichées en « chips »). */
  tech: string[];
  /** Description courte (1-2 phrases) affichée sur la carte. */
  summary: string;
  /** Description détaillée (affichée dans le « Mission Briefing »). */
  context: string;
  role: string;
  challenges: string;
  result: string;
  /** Liens : laisse '' s'il n'y en a pas (le bouton s'affiche alors « indisponible »). */
  demoUrl: string;
  codeUrl: string;
  rarity: Rarity;
  status: 'completed' | 'in-progress';
}

export interface TimelineStep {
  /** Date libre (ex : '2023 — 2025', 'Juin 2024'). */
  date: string;
  title: string;
  place: string;
  description: string;
  kind: TimelineKind;
}

export interface Social {
  platform: SocialPlatform;
  url: string;
}

export interface PortfolioContent {
  settings: {
    /** Pseudo générique affiché tant que `identity.gamertag` n'est pas rempli. */
    fallbackHandle: string;
    /** Fichiers dans /public. Absents → avatar néon généré / bouton CV « bientôt disponible ». */
    avatarFile: string;
    cvFile: string;
  };
  identity: Identity;
  attributes: Attribute[];
  funStats: FunStat[];
  interests: Interest[];
  skillCategories: SkillCategory[];
  skills: Skill[];
  projects: Project[];
  timeline: TimelineStep[];
  contact: {
    email: string;
    subtitle: string;
    socials: Social[];
  };
  sections: {
    skillsIntro: string;
    projectsIntro: string;
    timelineIntro: string;
  };
  seo: {
    /** URL publique du site une fois déployé (sert pour Open Graph, sitemap, JSON-LD). */
    siteUrl: string;
    /** Optionnel : sinon « Prénom Nom — Rôle | Portfolio ». */
    title: string;
    /** Optionnel : sinon ta bio. */
    description: string;
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * TON CONTENU — c'est ici que tu écris 👇
 * ──────────────────────────────────────────────────────────────────────────── */

export const content: PortfolioContent = {
  settings: {
    fallbackHandle: 'PLAYER_1',
    avatarFile: 'avatar.jpg', // → public/avatar.jpg (jpg, png ou webp : adapte l'extension)
    cvFile: 'cv.pdf', // → public/cv.pdf
  },

  /* ── IDENTITÉ ─────────────────────────────────────────────────────────── */
  identity: {
    firstName: 'Ethan',
    lastName: 'Portero',
    gamertag: 'Art4en',
    role: 'Étudiant développeur : web, bots et jeux',
    taglines: [
      'Je crée des sites, des petites API et des bots.',
      'Des jeux Roblox en Luau aux sites connectés à Supabase.',
      "À la recherche d'une alternance en développement.",
    ],
    age: 19,
    city: "Berre-l'Étang (13)",
    status: "Étudiant en Bachelor Informatique / Cybersécurité, à la recherche d'une alternance",
    bio: "Étudiant en informatique à l'ESGI Aix-en-Provence. Je crée des sites internet, des petites API, des bots Discord et des jeux Roblox, en m'appuyant sur des outils d'IA comme Claude Code. Je cherche une alternance pour apprendre sur le terrain et livrer de vrais projets.",
    guild: 'ESGI Aix-en-Provence',
    level: 19, // ton âge
  },

  /* ── ATTRIBUTS RPG (valeurs sur 100) ──────────────────────────────────── */
  attributes: [
    { name: 'Créativité', value: null },
    { name: 'Logique', value: null },
    { name: 'Persévérance', value: null },
    { name: "Esprit d'équipe", value: null },
  ],

  /* ── STATS FUN ────────────────────────────────────────────────────────── */
  funStats: [
    { label: 'Projets terminés', value: null }, // ex : 12
    { label: 'Heures de code', value: null, suffix: '+' }, // ex : 2000
    { label: 'Cafés', value: '∞' },
    { label: 'Jeu préféré', value: '[À REMPLIR] Ton jeu préféré' },
  ],

  /* ── CENTRES D'INTÉRÊT (= inventaire) ─────────────────────────────────── */
  // icon : choisis parmi la liste `InventoryIcon` en haut du fichier (ex : 'gamepad', 'music'…)
  interests: [
    {
      name: 'Jeux vidéo',
      icon: 'gamepad',
      description: 'Je crée autant que je joue : jeux Roblox, serveur Discord gaming, site Gaming Arena.',
    },
    {
      name: 'Code et IA',
      icon: 'cpu',
      description: "Je construis mes projets avec des outils d'IA comme Claude Code, pour aller plus vite et apprendre en faisant.",
    },
    {
      name: 'Langues',
      icon: 'globe',
      description: 'Trilingue : français, anglais et espagnol.',
    },
  ],

  /* ── COMPÉTENCES ──────────────────────────────────────────────────────── */
  skillCategories: [
    { id: 'languages', label: 'Langages' },
    { id: 'front', label: 'Front' },
    { id: 'back', label: 'Back' },
    { id: 'tools', label: 'Outils' },
    { id: 'gamedev', label: 'Game dev' },
  ],
  // Ajoute autant de compétences que tu veux. level : sur 100. projects : slugs de projets liés.
  skills: [
    { name: 'JavaScript', level: null, category: 'languages', years: null, projects: ['gaming-arena', 'bot-discord'] },
    { name: 'Luau', level: null, category: 'languages', years: null, projects: ['jeu-roblox'] },
    { name: 'HTML / CSS', level: null, category: 'front', years: null, projects: ['gaming-arena'] },
    { name: 'Node.js / discord.js', level: null, category: 'back', years: null, projects: ['bot-discord'] },
    { name: 'Supabase (BDD, auth)', level: null, category: 'back', years: null, projects: ['gaming-arena'] },
    { name: 'SQL', level: null, category: 'back', years: null, projects: ['gaming-arena'] },
    { name: 'Git / GitHub', level: null, category: 'tools', years: null, projects: ['gaming-arena'] },
    { name: 'Claude Code (IA)', level: null, category: 'tools', years: null, projects: [] },
    { name: 'Roblox Studio', level: null, category: 'gamedev', years: null, projects: ['jeu-roblox'] },
    { name: 'Rojo', level: null, category: 'gamedev', years: null, projects: ['jeu-roblox'] },
  ],

  /* ── PROJETS (= missions) ─────────────────────────────────────────────── */
  // rarity : 'common' | 'rare' | 'epic' | 'legendary' → uniquement le style de la carte.
  // Images : public/projects/<slug>/cover.webp (+ toutes les autres images = galerie).
  projects: [
    {
      slug: 'gaming-arena',
      title: 'Gaming Arena',
      year: 2026,
      type: 'Web',
      tech: ['HTML', 'CSS', 'JavaScript', 'Supabase'],
      summary: 'Site gaming avec un test de personnalité gamer, des mini-jeux de réflexes et des quiz de culture gaming.',
      context: "Site web avec un test de personnalité (20 questions), des mini-jeux (temps de réaction, aim trainer, Typing race) et des quiz sur League of Legends, Valorant, Fortnite, Apex Legends et de grands jeux d'histoire. Une version a aussi été menée en groupe sur GitHub.",
      role: '[À REMPLIR] Ton rôle : ce que TU as fait concrètement.',
      challenges: '[À REMPLIR] Les difficultés rencontrées et comment tu les as surmontées.',
      result: 'Site en ligne sur GitHub Pages, avec comptes et classements partagés via Supabase.',
      demoUrl: 'https://art4en.github.io/gaming-arena/',
      codeUrl: 'https://github.com/Art4en/gaming-arena',
      rarity: 'legendary',
      status: 'completed',
    },
    {
      slug: 'bot-discord',
      title: 'Bot Discord communauté gaming',
      year: 2026,
      type: 'Bot',
      tech: ['JavaScript', 'Node.js', 'discord.js'],
      summary: 'Bot Discord en discord.js pour un serveur de communauté gaming.',
      context: "Projet perso : un serveur Discord pour une communauté gaming, avec son bot, installé sur le serveur d'un ami.",
      role: '[À REMPLIR] Ton rôle : ce que TU as fait concrètement.',
      challenges: '[À REMPLIR] Les difficultés rencontrées et comment tu les as surmontées.',
      result: '[À REMPLIR] Le résultat : ce que ça a donné, ce que tu en as appris.',
      demoUrl: '',
      codeUrl: '',
      rarity: 'epic',
      status: 'in-progress',
    },
    {
      slug: 'jeu-roblox',
      title: 'Jeu Roblox dark fantasy',
      year: 2026,
      type: 'Jeu',
      tech: ['Luau', 'Roblox Studio', 'Rojo'],
      summary: 'Jeu Roblox à l’ambiance dark fantasy inspirée de Dark Souls, avec un dragon en boss final.',
      context: 'Projet à deux avec un ami, sur environ un mois.',
      role: '[À REMPLIR] Ton rôle : ce que TU as fait concrètement.',
      challenges: '[À REMPLIR] Les difficultés rencontrées et comment tu les as surmontées.',
      result: '[À REMPLIR] Le résultat : ce que ça a donné, ce que tu en as appris.',
      demoUrl: '',
      codeUrl: '',
      rarity: 'rare',
      status: 'in-progress',
    },
  ],

  /* ── PARCOURS (du plus récent au plus ancien) ─────────────────────────── */
  // kind : 'education' (formation) | 'experience' (stage, job, asso…) | 'award' (prix, distinction)
  timeline: [
    {
      date: 'Depuis septembre 2026',
      title: 'Bachelor 1 Informatique / Cybersécurité',
      place: 'ESGI, Campus Eductive (Aix-en-Provence)',
      description: "Formation en informatique et cybersécurité. Je cherche une alternance en développement.",
      kind: 'education',
    },
    {
      date: '2025 — 2026',
      title: 'Licence Informatique',
      place: 'IUT de Toulon (La Garde)',
      description: '',
      kind: 'education',
    },
    {
      date: '2022 — 2024',
      title: 'Bac STI2D',
      place: 'Lycée Maurice Janetti',
      description: '',
      kind: 'education',
    },
    {
      date: 'Mars — avril 2021',
      title: 'Stagiaire informatique',
      place: 'Slash Informatique',
      description: "Stage de découverte en informatique et cybersécurité : assistance informatique à domicile, configuration et maintenance d'imprimantes laser.",
      kind: 'experience',
    },
  ],

  /* ── CONTACT ──────────────────────────────────────────────────────────── */
  contact: {
    email: 'ethan06042007@gmail.com',
    subtitle: 'Une alternance, un projet, une idée ? Envoie une transmission.',
    // platform : 'github' | 'linkedin' | 'discord' | 'x' | 'itchio' | 'youtube' | 'artstation' | 'twitch' | 'instagram' | 'website'
    // Supprime les lignes inutiles, ajoute celles qu'il te faut.
    socials: [{ platform: 'github', url: 'https://github.com/Art4en' }],
  },

  /* ── PETITS TEXTES D'INTRO DES SECTIONS (mets '' pour les masquer) ────── */
  sections: {
    skillsIntro: '',
    projectsIntro: '',
    timelineIntro: '',
  },

  /* ── SEO / PARTAGE ────────────────────────────────────────────────────── */
  seo: {
    siteUrl: 'https://art4en.github.io/neon-system-portfolio/',
    title: '', // optionnel
    description: '', // optionnel (sinon ta bio)
  },
};
