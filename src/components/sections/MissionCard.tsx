import type { MouseEvent } from 'react';
import { ExternalLink, Code2, Lock } from 'lucide-react';
import type { Project } from '../../content/portfolio';
import { isFilled, isTodo } from '../../content/placeholder';
import { projectImages, usableUrl } from '../../lib/content';
import { HoloCard } from '../ui/HoloCard';
import { Placeholder } from '../ui/Placeholder';
import { ProceduralCover } from '../ui/ProceduralCover';
import { sfx } from '../../audio/synth';
import { RARITY_LABEL } from '../../lib/rarity';

interface MissionCardProps {
  project: Project;
  index: number;
  onOpen: (slug: string) => void;
  /** Mission pas encore remplie (en prod) : carte « verrouillée », sans aucun texte inventé. */
  locked?: boolean;
}

/** Carte de mission : tilt 3D, reflet holo, bordure conique couleur de rareté. */
export function MissionCard({ project: p, index, onOpen, locked }: MissionCardProps) {
  if (locked) return <LockedMission project={p} index={index} />;
  return <OpenMission project={p} index={index} onOpen={onOpen} />;
}

function LockedMission({ project: p, index }: { project: Project; index: number }) {
  const num = String(index + 1).padStart(2, '0');
  return (
    <article
      className="mission is-locked"
      data-anim="mission"
      aria-label={`Mission ${num} verrouillée`}
    >
      <HoloCard rarity={p.rarity} className="h-full">
        <div className="mission__media">
          <ProceduralCover seed={p.slug} rarity={p.rarity} className="w-full h-full" />
          <div className="mission__lock" aria-hidden="true">
            <Lock size={34} strokeWidth={1.6} />
            <span className="micro">Classified</span>
          </div>
          <span className="mission__badge">◆ {RARITY_LABEL[p.rarity]}</span>
          <span className="mission__num micro">MISSION #{num}</span>
        </div>
        <div className="mission__body">
          <p className="micro text-neon-yellow">🔒 Locked</p>
          <h3 className="mission__title">Mission verrouillée</h3>
          <p className="mission__summary">
            Données classifiées. Cette mission sera bientôt déclassifiée.
          </p>
          <div className="mission__actions mt-auto">
            <span className="mission__link is-off">
              <Lock size={14} aria-hidden="true" /> Accès refusé
            </span>
          </div>
        </div>
      </HoloCard>
    </article>
  );
}

function OpenMission({ project: p, index, onOpen }: MissionCardProps) {
  const { cover } = projectImages(p.slug);
  const demo = usableUrl(p.demoUrl);
  const code = usableUrl(p.codeUrl);
  const num = String(index + 1).padStart(2, '0');

  const open = () => {
    sfx.blip();
    onOpen(p.slug);
  };
  const onCardClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    open();
  };

  return (
    <article className="mission" data-anim="mission" onClick={onCardClick} data-cursor="OPEN">
      <HoloCard rarity={p.rarity} className="h-full">
        <div className="mission__media rgb-split">
          {cover ? (
            <img src={cover} alt="" loading="lazy" decoding="async" width={640} height={360} />
          ) : (
            <ProceduralCover seed={p.slug} rarity={p.rarity} className="w-full h-full" />
          )}
          <span className="mission__badge">◆ {RARITY_LABEL[p.rarity]}</span>
          <span className="mission__num micro">MISSION #{num}</span>
        </div>

        <div className="mission__body">
          <p className="micro flex flex-wrap gap-x-3 gap-y-1">
            <span className={p.status === 'completed' ? 'text-neon-green' : 'text-neon-yellow'}>
              {p.status === 'completed' ? '✔ Completed' : '◐ In progress'}
            </span>
            <Placeholder value={p.year} field="year" />
            {isFilled(p.type) && <span>{p.type}</span>}
          </p>

          <h3 className="mission__title">
            <button
              type="button"
              onClick={open}
              onPointerEnter={() => sfx.hover()}
              className="text-left"
            >
              {isFilled(p.title) ? (
                p.title
              ) : (
                <Placeholder value={p.title} field={`projects[${index}].title`} />
              )}
            </button>
          </h3>

          <div className="mission__summary">
            <Placeholder value={p.summary} as="p" field="summary" />
          </div>

          <ul className="flex flex-wrap gap-1.5 mt-auto pt-4" aria-label="Technologies">
            {p.tech.map((t, i) =>
              isTodo(t) ? (
                <li key={i}>
                  <Placeholder value={t} field="tech" />
                </li>
              ) : (
                <li key={i} className="chip">
                  {t}
                </li>
              ),
            )}
          </ul>

          <div className="mission__actions">
            <button type="button" className="btn-neon btn-sm" onClick={open} data-cursor="OPEN">
              Briefing ▸
            </button>
            {demo ? (
              <a
                className="mission__link"
                href={demo}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="VIEW"
              >
                <ExternalLink size={14} aria-hidden="true" /> Live demo
              </a>
            ) : (
              <span className="mission__link is-off" title="Démo indisponible">
                <ExternalLink size={14} aria-hidden="true" /> Démo N/A
              </span>
            )}
            {code ? (
              <a
                className="mission__link"
                href={code}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="VIEW"
              >
                <Code2 size={14} aria-hidden="true" /> Source
              </a>
            ) : (
              <span className="mission__link is-off" title="Code non public">
                <Code2 size={14} aria-hidden="true" /> Code N/A
              </span>
            )}
          </div>
        </div>
      </HoloCard>
    </article>
  );
}
