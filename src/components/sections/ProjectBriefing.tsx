import { useState } from 'react';
import { ArrowLeft, ArrowRight, Code2, ExternalLink, X } from 'lucide-react';
import { content } from '../../content/portfolio';
import { isFilled, isTodo } from '../../content/placeholder';
import { projectImages, usableUrl } from '../../lib/content';
import { RARITY_LABEL } from '../../lib/rarity';
import { useAppStore } from '../../store/useAppStore';
import { Modal } from '../ui/Modal';
import { Placeholder } from '../ui/Placeholder';
import { ProceduralCover } from '../ui/ProceduralCover';
import { sfx } from '../../audio/synth';

/** Modale « MISSION BRIEFING » plein écran (chargée à la demande). */
export default function ProjectBriefing() {
  const slug = useAppStore((s) => s.openProject);
  const setOpenProject = useAppStore((s) => s.setOpenProject);
  const index = content.projects.findIndex((p) => p.slug === slug);
  const p = content.projects[index];
  const [shot, setShot] = useState(0);

  if (!p) return null;
  const { gallery } = projectImages(p.slug);
  const demo = usableUrl(p.demoUrl);
  const code = usableUrl(p.codeUrl);
  const num = String(index + 1).padStart(2, '0');

  const close = () => {
    sfx.blip();
    setOpenProject(null);
    history.replaceState(null, '', location.pathname + location.search);
  };

  const blocks: { label: string; value: string; field: string }[] = [
    { label: 'Contexte', value: p.context, field: 'context' },
    { label: 'Mon rôle', value: p.role, field: 'role' },
    { label: 'Défis', value: p.challenges, field: 'challenges' },
    { label: 'Résultat', value: p.result, field: 'result' },
  ];

  return (
    <Modal onClose={close} labelledBy="briefing-title" className={`briefing rarity-${p.rarity}`}>
      <div className="briefing__scan" aria-hidden="true" />
      <header className="briefing__head">
        <div>
          <p className="micro">
            <span className="micro-accent">// MISSION BRIEFING</span> · #{num} ·{' '}
            <span style={{ color: 'var(--rarity)' }}>◆ {RARITY_LABEL[p.rarity]}</span> ·{' '}
            {p.status === 'completed' ? '✔ COMPLETED' : '◐ IN PROGRESS'}
          </p>
          <h2 id="briefing-title" className="h-display text-3xl sm:text-5xl mt-3 glow-text">
            {isFilled(p.title) ? (
              p.title
            ) : (
              <Placeholder value={p.title} field={`projects[${index}].title`} />
            )}
          </h2>
          <p className="micro mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <Placeholder value={p.year} field="year" />
            <Placeholder value={p.type} field="type" />
          </p>
        </div>
        <button
          type="button"
          className="briefing__close"
          onClick={close}
          aria-label="Fermer le briefing (Échap)"
          data-cursor="CLOSE"
        >
          <X size={22} aria-hidden="true" />
          <span className="micro">ESC</span>
        </button>
      </header>

      <div className="briefing__grid">
        <div className="briefing__gallery">
          <div className="briefing__shot">
            {gallery.length > 0 ? (
              <img src={gallery[shot]} alt={`Capture ${shot + 1} du projet`} decoding="async" />
            ) : (
              <ProceduralCover seed={p.slug} rarity={p.rarity} className="w-full h-full" />
            )}
          </div>
          {gallery.length > 1 && (
            <div className="briefing__thumbs">
              <button
                type="button"
                aria-label="Image précédente"
                onClick={() => setShot((s) => (s - 1 + gallery.length) % gallery.length)}
              >
                <ArrowLeft size={16} aria-hidden="true" />
              </button>
              {gallery.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className={i === shot ? 'is-active' : ''}
                  onClick={() => setShot(i)}
                  aria-label={`Voir l'image ${i + 1}`}
                  aria-pressed={i === shot}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
              <button
                type="button"
                aria-label="Image suivante"
                onClick={() => setShot((s) => (s + 1) % gallery.length)}
              >
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
          {gallery.length === 0 && import.meta.env.DEV && (
            <p className="ph-dev mt-3">
              <span aria-hidden="true">🖼️</span>
              <span>
                Ajoute des images dans <b>public/projects/{p.slug}/</b> (cover.webp + autres
                captures).
              </span>
            </p>
          )}

          <div className="mt-6">
            <p className="micro mb-2">// STACK</p>
            <ul className="flex flex-wrap gap-1.5">
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
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {demo ? (
              <a
                className="btn-neon btn-sm"
                href={demo}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="VIEW"
              >
                <ExternalLink size={14} aria-hidden="true" /> Live demo
              </a>
            ) : (
              <span className="btn-neon btn-sm" aria-disabled="true">
                Démo indisponible
              </span>
            )}
            {code ? (
              <a
                className="btn-neon btn-neon--alt btn-sm"
                href={code}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="VIEW"
              >
                <Code2 size={14} aria-hidden="true" /> Source code
              </a>
            ) : (
              <span className="btn-neon btn-neon--alt btn-sm" aria-disabled="true">
                Code non public
              </span>
            )}
          </div>
        </div>

        <div className="briefing__text">
          <div className="briefing__block">
            <p className="micro micro-accent mb-2">// OBJECTIF</p>
            <Placeholder
              value={p.summary}
              as="p"
              className="prose-neon text-lg"
              field="summary"
              block
            />
          </div>
          {blocks.map((b) => (
            <div key={b.label} className="briefing__block">
              <p className="micro micro-accent mb-2">// {b.label.toUpperCase()}</p>
              <Placeholder value={b.value} as="p" className="prose-neon" field={b.field} block />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
