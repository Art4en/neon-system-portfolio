import { useEffect, useMemo, useRef, useState } from 'react';
import { User } from 'lucide-react';
import { content, type Skill, type SkillCategoryId } from '../../content/portfolio';
import { isFilled, isTodo } from '../../content/placeholder';
import { handle, projectBySlug } from '../../lib/content';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';
import { CATEGORY_ICONS } from '../../lib/skillIcons';
import { usePlaying } from '../../hooks/usePlaying';
import { sfx } from '../../audio/synth';
import { Placeholder } from '../ui/Placeholder';

/** Espace de coordonnées logique de l'arbre (le conteneur garde ce ratio). */
const W = 1000;
const H = 620;

type Filter = 'all' | SkillCategoryId;
interface NodeState {
  x: number;
  y: number;
  s: number;
  o: number;
}
interface TreeNode {
  id: string;
  kind: 'core' | 'category' | 'skill';
  category?: SkillCategoryId;
  skill?: Skill;
  index?: number;
}
interface Edge {
  id: string;
  from: string;
  to: string;
}

/** Calcule la position cible de chaque nœud pour un filtre donné. */
function computeLayout(
  nodes: TreeNode[],
  filter: Filter,
  cats: SkillCategoryId[],
): Record<string, NodeState> {
  const out: Record<string, NodeState> = {};
  const catX = (c: SkillCategoryId) => {
    const i = cats.indexOf(c);
    return cats.length === 1 ? W / 2 : 100 + (i * (W - 200)) / (cats.length - 1);
  };
  out.core = { x: W / 2, y: 62, s: 1, o: 1 };
  for (const c of cats) {
    const skills = nodes.filter((n) => n.kind === 'skill' && n.category === c);
    if (filter === 'all') {
      out[`cat-${c}`] = { x: catX(c), y: 200, s: 1, o: 1 };
      const gap = skills.length > 1 ? Math.min(98, 300 / (skills.length - 1)) : 0;
      skills.forEach((n, k) => {
        out[n.id] = { x: catX(c) + (k % 2 === 0 ? -42 : 42), y: 318 + k * gap, s: 1, o: 1 };
      });
    } else if (filter === c) {
      // Catégorie filtrée : racine au centre, compétences en anneau autour.
      out[`cat-${c}`] = { x: W / 2, y: 330, s: 1.25, o: 1 };
      skills.forEach((n, k) => {
        const a = -Math.PI / 2 + ((k + 0.5) / Math.max(1, skills.length)) * Math.PI * 2;
        const r = skills.length <= 2 ? 0.75 : 1;
        out[n.id] = {
          x: W / 2 + Math.cos(a) * 330 * r,
          y: 330 + Math.sin(a) * 200 * r,
          s: 1.15,
          o: 1,
        };
      });
    } else {
      // Catégories masquées : elles se replient vers leur colonne et disparaissent.
      out[`cat-${c}`] = { x: catX(c), y: 200, s: 0.2, o: 0 };
      skills.forEach((n) => (out[n.id] = { x: catX(c), y: 260, s: 0.2, o: 0 }));
    }
  }
  if (filter !== 'all') out.core = { x: W / 2, y: 62, s: 0.85, o: 1 };
  return out;
}

export function SkillTree() {
  const DEV = import.meta.env.DEV;
  const { skillCategories } = content;
  // En prod, les compétences non remplies sont simplement ignorées.
  const skills = useMemo(() => content.skills.filter((s) => DEV || isFilled(s.name)), [DEV]);
  const cats = useMemo(
    () => skillCategories.map((c) => c.id).filter((id) => skills.some((s) => s.category === id)),
    [skillCategories, skills],
  );

  const { nodes, edges } = useMemo(() => {
    const nodes: TreeNode[] = [{ id: 'core', kind: 'core' }];
    const edges: Edge[] = [];
    for (const c of cats) {
      nodes.push({ id: `cat-${c}`, kind: 'category', category: c });
      edges.push({ id: `core>${c}`, from: 'core', to: `cat-${c}` });
      let prev = `cat-${c}`;
      skills.forEach((s, i) => {
        if (s.category !== c) return;
        const id = `skill-${i}`;
        nodes.push({ id, kind: 'skill', category: c, skill: s, index: i });
        edges.push({ id: `${prev}>${id}`, from: prev, to: id });
        prev = id;
      });
    }
    return { nodes, edges };
  }, [cats, skills]);

  const playing = usePlaying();
  const [filter, setFilter] = useState<Filter>('all');
  const [hovered, setHovered] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeEls = useRef<Record<string, HTMLElement | null>>({});
  const edgeEls = useRef<Record<string, SVGLineElement | null>>({});
  const flowEls = useRef<Record<string, SVGLineElement | null>>({});
  const state = useRef<Record<string, NodeState>>(computeLayout(nodes, 'all', cats));
  const unlocked = useRef(new Set<string>());

  /** Applique l'état courant (positions, échelle, opacité) au DOM et aux lignes SVG. */
  const render = () => {
    const st = state.current;
    for (const n of nodes) {
      const el = nodeEls.current[n.id];
      const s = st[n.id];
      if (!el || !s) continue;
      el.style.left = `${(s.x / W) * 100}%`;
      el.style.top = `${(s.y / H) * 100}%`;
      el.style.setProperty('--s', String(s.s));
      el.style.opacity = String(s.o);
      el.style.visibility = s.o < 0.02 ? 'hidden' : 'visible';
    }
    for (const e of edges) {
      const a = st[e.from];
      const b = st[e.to];
      const o = Math.min(a.o, b.o);
      for (const line of [edgeEls.current[e.id], flowEls.current[e.id]]) {
        if (!line) continue;
        line.setAttribute('x1', String(a.x));
        line.setAttribute('y1', String(a.y));
        line.setAttribute('x2', String(b.x));
        line.setAttribute('y2', String(b.y));
        line.style.opacity = String(o);
      }
    }
  };

  // Rendu initial.
  useEffect(() => {
    state.current = computeLayout(nodes, 'all', cats);
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, cats]);

  // Transition de filtre « façon FLIP » : on part des positions actuelles (First),
  // on calcule les positions finales (Last) et GSAP interpole (Invert + Play), lignes comprises.
  useEffect(() => {
    const target = computeLayout(nodes, filter, cats);
    if (prefersReducedMotion()) {
      state.current = target;
      render();
      return;
    }
    const tweens = Object.entries(target).map(([id, t], i) =>
      gsap.to(state.current[id], {
        ...t,
        duration: 0.9,
        ease: 'expo.inOut',
        delay: (i % 6) * 0.025,
        onUpdate: render,
      }),
    );
    return () => tweens.forEach((t) => t.kill());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, nodes, cats]);

  // Déblocage nœud par nœud lié à la progression du scroll.
  // (états posés en data-attributes : React ne les écrase pas lors des re-renders)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !playing) return;
    const order = nodes.map((n) => n.id);
    const unlock = (count: number) => {
      order.slice(0, count).forEach((id, i) => {
        if (unlocked.current.has(id)) return;
        unlocked.current.add(id);
        const node = nodeEls.current[id];
        if (node) node.dataset.unlocked = '1';
        if (i > 0) sfx.unlock();
        edges.forEach((e) => {
          if (unlocked.current.has(e.from) && unlocked.current.has(e.to))
            edgeEls.current[e.id]?.parentElement?.setAttribute('data-on', '1');
        });
      });
    };
    if (prefersReducedMotion()) {
      unlock(order.length);
      return;
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      end: 'center 50%',
      onUpdate: (self) => unlock(Math.ceil(self.progress * order.length)),
      onLeave: () => unlock(order.length),
    });
    return () => st.kill();
  }, [nodes, edges, playing]);

  const hoveredNode = nodes.find((n) => n.id === hovered);
  // Position cible du nœud survolé (calcul pur, pas de lecture de ref pendant le rendu).
  const layout = useMemo(() => computeLayout(nodes, filter, cats), [nodes, filter, cats]);
  const litEdges = new Set(
    hovered ? edges.filter((e) => e.from === hovered || e.to === hovered).map((e) => e.id) : [],
  );

  return (
    <div className="skilltree">
      <div className="skill-filters" role="toolbar" aria-label="Filtrer les compétences">
        {(['all', ...cats] as Filter[]).map((f) => {
          const label = f === 'all' ? 'Tout' : skillCategories.find((c) => c.id === f)?.label;
          return (
            <button
              key={f}
              type="button"
              className={`skill-filter ${filter === f ? 'is-active' : ''}`}
              aria-pressed={filter === f}
              onClick={() => {
                sfx.blip();
                setFilter(f);
              }}
              onPointerEnter={() => sfx.hover()}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div ref={containerRef} className="skilltree__canvas" data-cursor="HOVER">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="skilltree__svg"
          aria-hidden="true"
        >
          {edges.map((e) => (
            <g key={e.id} className={`edge ${litEdges.has(e.id) ? 'is-lit' : ''}`}>
              <line ref={(l) => void (edgeEls.current[e.id] = l)} className="edge__base" />
              <line ref={(l) => void (flowEls.current[e.id] = l)} className="edge__flow" />
            </g>
          ))}
        </svg>

        {nodes.map((n) => {
          const Icon =
            n.kind === 'category' ? CATEGORY_ICONS[n.category!] : n.kind === 'core' ? User : null;
          const todo = n.skill && isTodo(n.skill.name);
          const label =
            n.kind === 'core'
              ? handle
              : n.kind === 'category'
                ? skillCategories.find((c) => c.id === n.category)?.label
                : todo
                  ? '✏️ À remplir'
                  : n.skill!.name;
          return (
            <button
              key={n.id}
              ref={(el) => void (nodeEls.current[n.id] = el)}
              type="button"
              className={`tnode tnode--${n.kind} ${todo ? 'is-todo' : ''} ${hovered === n.id ? 'is-hover' : ''}`}
              onPointerEnter={() => {
                setHovered(n.id);
                sfx.hover();
              }}
              onPointerLeave={() => setHovered((h) => (h === n.id ? null : h))}
              onFocus={() => setHovered(n.id)}
              onBlur={() => setHovered((h) => (h === n.id ? null : h))}
              onClick={() =>
                n.kind === 'category' && setFilter((f) => (f === n.category ? 'all' : n.category!))
              }
              aria-label={
                n.kind === 'skill' && !todo
                  ? `${n.skill!.name}${isFilled(n.skill!.level) ? `, niveau ${n.skill!.level} sur 100` : ''}`
                  : label
              }
            >
              <span className="tnode__hex hex">
                <span className="tnode__inner hex">
                  {Icon ? (
                    <Icon size={n.kind === 'core' ? 30 : 24} strokeWidth={1.6} aria-hidden="true" />
                  ) : (
                    <span className="tnode__lvl">
                      {n.skill && isFilled(n.skill.level) ? n.skill.level : '??'}
                    </span>
                  )}
                </span>
              </span>
              <span className="tnode__label">{label}</span>
            </button>
          );
        })}

        {hoveredNode?.kind === 'skill' && hoveredNode.skill && (
          <SkillTooltip
            skill={hoveredNode.skill}
            index={hoveredNode.index!}
            pos={layout[hoveredNode.id]}
          />
        )}
      </div>
    </div>
  );
}

function SkillTooltip({ skill, index, pos }: { skill: Skill; index: number; pos: NodeState }) {
  const right = pos.x > W * 0.62;
  const projects = skill.projects
    .map((slug) => projectBySlug(slug))
    .filter((p) => p && isFilled(p.title))
    .map((p) => p!.title);
  return (
    <div
      className={`skill-tip ${right ? 'skill-tip--left' : ''}`}
      style={{ left: `${(pos.x / W) * 100}%`, top: `${(pos.y / H) * 100}%` }}
      role="tooltip"
    >
      <p className="micro micro-accent mb-1">SKILL_{String(index + 1).padStart(2, '0')}</p>
      <p className="font-display text-base uppercase tracking-wider mb-3">
        <Placeholder value={skill.name} field={`skills[${index}].name`} />
      </p>
      <div className="flex items-center justify-between micro mb-1">
        <span>Niveau</span>
        <span className="text-accent">
          <Placeholder value={skill.level} field={`skills[${index}].level`}>
            {(v) => `${v}/100`}
          </Placeholder>
        </span>
      </div>
      <div className="attr__track mb-3">
        {isFilled(skill.level) && (
          <span className="attr__bar" style={{ transform: `scaleX(${skill.level / 100})` }} />
        )}
      </div>
      {isFilled(skill.years) && (
        <p className="micro">
          Pratique :{' '}
          <span className="text-ink">
            {skill.years} an{skill.years > 1 ? 's' : ''}
          </span>
        </p>
      )}
      {projects.length > 0 && (
        <p className="micro mt-1">
          Projets :{' '}
          <span className="text-ink normal-case tracking-normal">{projects.join(', ')}</span>
        </p>
      )}
    </div>
  );
}
