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
    firstName: '[À REMPLIR] Ton prénom',
    lastName: '[À REMPLIR] Ton nom',
    gamertag: '[À REMPLIR] Ton pseudo / gamertag, en un mot (ex : NEO_DEV)',
    role: '[À REMPLIR] Ton titre / rôle (ex : Développeur Full-Stack & Game Dev)',
    taglines: [
      '[À REMPLIR] Accroche n°1 : une phrase courte qui te résume (ex : Je transforme des idées en expériences interactives.)',
      '[À REMPLIR] Accroche n°2 : ce que tu aimes construire',
      '[À REMPLIR] Accroche n°3 : ta spécialité ou ta techno favorite',
    ],
    age: null, // ex : 21
    city: '[À REMPLIR] Ta ville',
    status:
      '[À REMPLIR] Ton statut (ex : Étudiant en BUT Informatique — disponible pour une alternance)',
    bio: '[À REMPLIR] Ta bio en 2-3 phrases : qui tu es, ce qui te passionne, ce que tu cherches.',
    guild: '[À REMPLIR] Ton école ou ton entreprise (affichée comme « guilde »)',
    level: null, // ex : 21 (ton âge) ou 3 (tes années d'expérience)
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
      name: "[À REMPLIR] Centre d'intérêt n°1 (ex : Jeux vidéo)",
      icon: 'box',
      description: '[À REMPLIR] Une phrase sur ce centre d’intérêt',
    },
    {
      name: "[À REMPLIR] Centre d'intérêt n°2",
      icon: 'box',
      description: '[À REMPLIR] Une phrase sur ce centre d’intérêt',
    },
    {
      name: "[À REMPLIR] Centre d'intérêt n°3",
      icon: 'box',
      description: '[À REMPLIR] Une phrase sur ce centre d’intérêt',
    },
    {
      name: "[À REMPLIR] Centre d'intérêt n°4",
      icon: 'box',
      description: '[À REMPLIR] Une phrase sur ce centre d’intérêt',
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
    {
      name: '[À REMPLIR] Langage (ex : JavaScript)',
      level: null,
      category: 'languages',
      years: null,
      projects: [],
    },
    {
      name: '[À REMPLIR] Langage (ex : Python)',
      level: null,
      category: 'languages',
      years: null,
      projects: [],
    },
    {
      name: '[À REMPLIR] Techno front (ex : React)',
      level: null,
      category: 'front',
      years: null,
      projects: [],
    },
    {
      name: '[À REMPLIR] Techno front (ex : CSS / Tailwind)',
      level: null,
      category: 'front',
      years: null,
      projects: [],
    },
    {
      name: '[À REMPLIR] Techno back (ex : Node.js)',
      level: null,
      category: 'back',
      years: null,
      projects: [],
    },
    {
      name: '[À REMPLIR] Techno back (ex : SQL)',
      level: null,
      category: 'back',
      years: null,
      projects: [],
    },
    {
      name: '[À REMPLIR] Outil (ex : Git)',
      level: null,
      category: 'tools',
      years: null,
      projects: [],
    },
    {
      name: '[À REMPLIR] Outil (ex : Figma)',
      level: null,
      category: 'tools',
      years: null,
      projects: [],
    },
    {
      name: '[À REMPLIR] Game dev (ex : Unity)',
      level: null,
      category: 'gamedev',
      years: null,
      projects: [],
    },
    {
      name: '[À REMPLIR] Game dev (ex : Blender)',
      level: null,
      category: 'gamedev',
      years: null,
      projects: [],
    },
  ],

  /* ── PROJETS (= missions) ─────────────────────────────────────────────── */
  // rarity : 'common' | 'rare' | 'epic' | 'legendary' → uniquement le style de la carte.
  // Images : public/projects/<slug>/cover.webp (+ toutes les autres images = galerie).
  projects: [
    {
      slug: 'projet-1',
      title: '[À REMPLIR] Titre du projet n°1',
      year: null, // ex : 2025
      type: '[À REMPLIR] Type (Web / Jeu / App / Outil / Projet scolaire…)',
      tech: ['[À REMPLIR] Technos (ex : React, Three.js)'],
      summary: '[À REMPLIR] Décris ce projet en 2 phrases : le problème, puis ta solution.',
      context: '[À REMPLIR] Contexte : pourquoi ce projet existe (cours, projet perso, client…).',
      role: '[À REMPLIR] Ton rôle : ce que TU as fait concrètement.',
      challenges: '[À REMPLIR] Les difficultés rencontrées et comment tu les as surmontées.',
      result: '[À REMPLIR] Le résultat : ce que ça a donné, ce que tu en as appris.',
      demoUrl: "[À REMPLIR] Lien de la démo (https://…) — ou '' s'il n'y en a pas",
      codeUrl: "[À REMPLIR] Lien du code (https://github.com/…) — ou '' s'il n'y en a pas",
      rarity: 'legendary',
      status: 'completed',
    },
    {
      slug: 'projet-2',
      title: '[À REMPLIR] Titre du projet n°2',
      year: null,
      type: '[À REMPLIR] Type (Web / Jeu / App / Outil / Projet scolaire…)',
      tech: ['[À REMPLIR] Technos'],
      summary: '[À REMPLIR] Décris ce projet en 2 phrases : le problème, puis ta solution.',
      context: '[À REMPLIR] Contexte : pourquoi ce projet existe.',
      role: '[À REMPLIR] Ton rôle : ce que TU as fait concrètement.',
      challenges: '[À REMPLIR] Les difficultés rencontrées et comment tu les as surmontées.',
      result: '[À REMPLIR] Le résultat : ce que ça a donné, ce que tu en as appris.',
      demoUrl: "[À REMPLIR] Lien de la démo — ou '' s'il n'y en a pas",
      codeUrl: "[À REMPLIR] Lien du code — ou '' s'il n'y en a pas",
      rarity: 'epic',
      status: 'completed',
    },
    {
      slug: 'projet-3',
      title: '[À REMPLIR] Titre du projet n°3',
      year: null,
      type: '[À REMPLIR] Type (Web / Jeu / App / Outil / Projet scolaire…)',
      tech: ['[À REMPLIR] Technos'],
      summary: '[À REMPLIR] Décris ce projet en 2 phrases : le problème, puis ta solution.',
      context: '[À REMPLIR] Contexte : pourquoi ce projet existe.',
      role: '[À REMPLIR] Ton rôle : ce que TU as fait concrètement.',
      challenges: '[À REMPLIR] Les difficultés rencontrées et comment tu les as surmontées.',
      result: '[À REMPLIR] Le résultat : ce que ça a donné, ce que tu en as appris.',
      demoUrl: "[À REMPLIR] Lien de la démo — ou '' s'il n'y en a pas",
      codeUrl: "[À REMPLIR] Lien du code — ou '' s'il n'y en a pas",
      rarity: 'rare',
      status: 'completed',
    },
    {
      slug: 'projet-4',
      title: '[À REMPLIR] Titre du projet n°4',
      year: null,
      type: '[À REMPLIR] Type (Web / Jeu / App / Outil / Projet scolaire…)',
      tech: ['[À REMPLIR] Technos'],
      summary: '[À REMPLIR] Décris ce projet en 2 phrases : le problème, puis ta solution.',
      context: '[À REMPLIR] Contexte : pourquoi ce projet existe.',
      role: '[À REMPLIR] Ton rôle : ce que TU as fait concrètement.',
      challenges: '[À REMPLIR] Les difficultés rencontrées et comment tu les as surmontées.',
      result: '[À REMPLIR] Le résultat : ce que ça a donné, ce que tu en as appris.',
      demoUrl: "[À REMPLIR] Lien de la démo — ou '' s'il n'y en a pas",
      codeUrl: "[À REMPLIR] Lien du code — ou '' s'il n'y en a pas",
      rarity: 'common',
      status: 'in-progress',
    },
  ],

  /* ── PARCOURS (du plus récent au plus ancien) ─────────────────────────── */
  // kind : 'education' (formation) | 'experience' (stage, job, asso…) | 'award' (prix, distinction)
  timeline: [
    {
      date: '[À REMPLIR] Date (ex : 2024 — aujourd’hui)',
      title: '[À REMPLIR] Intitulé (diplôme, poste, prix…)',
      place: '[À REMPLIR] Lieu / établissement / entreprise',
      description: '[À REMPLIR] 1-2 phrases : ce que tu y as fait ou appris.',
      kind: 'education',
    },
    {
      date: '[À REMPLIR] Date',
      title: '[À REMPLIR] Intitulé',
      place: '[À REMPLIR] Lieu',
      description: '[À REMPLIR] 1-2 phrases : ce que tu y as fait ou appris.',
      kind: 'experience',
    },
    {
      date: '[À REMPLIR] Date',
      title: '[À REMPLIR] Intitulé',
      place: '[À REMPLIR] Lieu',
      description: '[À REMPLIR] 1-2 phrases : ce que tu y as fait ou appris.',
      kind: 'award',
    },
  ],

  /* ── CONTACT ──────────────────────────────────────────────────────────── */
  contact: {
    email: '[À REMPLIR] ton.adresse@email.com',
    subtitle:
      '[À REMPLIR] Une phrase pour inviter à te contacter (ex : Un stage, un projet, une idée ? Envoie une transmission.)',
    // platform : 'github' | 'linkedin' | 'discord' | 'x' | 'itchio' | 'youtube' | 'artstation' | 'twitch' | 'instagram' | 'website'
    // Supprime les lignes inutiles, ajoute celles qu'il te faut.
    socials: [
      { platform: 'github', url: '[À REMPLIR] https://github.com/ton-pseudo' },
      { platform: 'linkedin', url: '[À REMPLIR] https://www.linkedin.com/in/ton-profil' },
      { platform: 'discord', url: '[À REMPLIR] Lien Discord (ou supprime cette ligne)' },
      { platform: 'itchio', url: '[À REMPLIR] Lien itch.io (ou supprime cette ligne)' },
    ],
  },

  /* ── PETITS TEXTES D'INTRO DES SECTIONS (mets '' pour les masquer) ────── */
  sections: {
    skillsIntro: "[À REMPLIR] Une phrase d’intro sur tes compétences (ou laisse vide : '')",
    projectsIntro: "[À REMPLIR] Une phrase d’intro sur tes projets (ou laisse vide : '')",
    timelineIntro: "[À REMPLIR] Une phrase d’intro sur ton parcours (ou laisse vide : '')",
  },

  /* ── SEO / PARTAGE ────────────────────────────────────────────────────── */
  seo: {
    siteUrl: '[À REMPLIR] URL du site une fois déployé (ex : https://ton-pseudo.vercel.app)',
    title: '', // optionnel
    description: '', // optionnel (sinon ta bio)
  },
};
