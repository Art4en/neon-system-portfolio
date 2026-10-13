import type { MouseEvent } from 'react';
import { ExternalLink, Code2 } from 'lucide-react';
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
}

/** Carte de mission : tilt 3D, reflet holo, bordure conique couleur de rareté. */
export function MissionCard({ project: p, index, onOpen }: MissionCardProps) {
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
