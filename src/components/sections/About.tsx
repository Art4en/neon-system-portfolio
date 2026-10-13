import { useRef } from 'react';
import { usePlaying } from '../../hooks/usePlaying';
import { content } from '../../content/portfolio';
import { isFilled } from '../../content/placeholder';
import { avatarUrl, fullName, handle, initials } from '../../lib/content';
import { gsap, SplitText, useGSAP } from '../../lib/gsap';
import { useTilt } from '../../hooks/useTilt';
import { Panel } from '../ui/Panel';
import { Placeholder } from '../ui/Placeholder';
import { SectionHeader } from '../ui/SectionHeader';
import { Counter } from '../ui/Counter';
import { GeneratedAvatar } from '../ui/GeneratedAvatar';
import { InventoryGlyph } from '../ui/Icons';

const INVENTORY_SLOTS = 8;
const DEV = import.meta.env.DEV;
/** En prod, une ligne dont la valeur n'est pas remplie est simplement retirée. */
const keep = (v: string | number | null) => DEV || isFilled(v);

/** 02 — PLAYER PROFILE : fiche de personnage RPG. */
export function About() {
  const playing = usePlaying();
  const { identity } = content;
  // Fiche et attributs : en prod, les valeurs vides s'affichent « ??? » (joueur inconnu).
  const attributes = content.attributes;
  const funStats = content.funStats.filter((s) => keep(s.value));
  const interests = content.interests.filter((i) => keep(i.name));
  const root = useRef<HTMLElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  useTilt(avatarRef, { max: 12, scale: 1.03 });

  useGSAP(
    () => {
      if (!playing) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Fiche : volet qui s'ouvre (clip-path) depuis la gauche.
        gsap.from('[data-anim="sheet"]', {
          clipPath: 'inset(0 100% 0 0)',
          duration: 1.4,
          ease: 'expo.inOut',
          scrollTrigger: { trigger: '[data-anim="sheet"]', start: 'top 80%' },
        });
        // Barres d'attributs qui se remplissent + compteur.
        gsap.utils.toArray<HTMLElement>('[data-attr]').forEach((bar, i) => {
          const value = Number(bar.dataset.attr);
          const num = bar.parentElement?.querySelector<HTMLElement>('[data-attr-num]');
          const obj = { v: 0 };
          gsap.fromTo(
            bar,
            { scaleX: 0 },
            {
              scaleX: value / 100,
              duration: 1.6,
              ease: 'expo.out',
              delay: i * 0.12,
              scrollTrigger: { trigger: bar, start: 'top 90%' },
              onStart: () => {
                gsap.to(obj, {
                  v: value,
                  duration: 1.6,
                  ease: 'expo.out',
                  onUpdate: () => {
                    if (num) num.textContent = String(Math.round(obj.v)).padStart(2, '0');
                  },
                });
              },
            },
          );
        });
        // Bio révélée ligne par ligne derrière un masque.
        const bio = root.current?.querySelector<HTMLElement>('[data-anim="bio"]');
        if (bio) {
          SplitText.create(bio, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: 1.1,
                ease: 'power4.out',
                stagger: 0.1,
                scrollTrigger: { trigger: bio, start: 'top 85%' },
              }),
          });
        }
        // Stats holographiques : apparaissent en scale depuis le noyau.
        gsap.from('[data-anim="stat"]', {
          scale: 0.6,
          opacity: 0,
          duration: 1,
          ease: 'back.out(1.6)',
          stagger: 0.12,
          scrollTrigger: { trigger: '[data-anim="holo"]', start: 'top 75%' },
        });
        // Inventaire : les emplacements s'allument en cascade.
        gsap.from('[data-anim="slot"]', {
          opacity: 0,
          y: 24,
          rotationX: -60,
          duration: 0.8,
          ease: 'power3.out',
          stagger: { each: 0.06, grid: 'auto', from: 'start' },
          scrollTrigger: { trigger: '[data-anim="inventory"]', start: 'top 85%' },
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [playing] },
  );

  const sheetRows: { label: string; value: string | number | null; field: string }[] = [
    { label: 'Nom', value: fullName || identity.firstName, field: 'identity.firstName / lastName' },
    { label: 'Classe', value: identity.role, field: 'identity.role' },
    { label: 'Niveau', value: identity.level, field: 'identity.level' },
    { label: 'Âge', value: identity.age, field: 'identity.age' },
    { label: 'Guilde', value: identity.guild, field: 'identity.guild' },
    { label: 'Zone', value: identity.city, field: 'identity.city' },
    { label: 'Statut', value: identity.status, field: 'identity.status' },
  ];

  return (
    <section ref={root} id="about" className="section" aria-labelledby="about-title">
      <div className="section-inner">
        <SectionHeader id="about" />

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ── Fiche personnage ─────────────────────────────── */}
          <Panel className="lg:col-span-7" innerClassName="p-5 sm:p-8" data-anim="sheet">
            <div className="flex items-center justify-between mb-6">
              <p className="micro">
                <span className="micro-accent">//</span> CHARACTER_SHEET
              </p>
              <p className="micro">ID: {handle.toUpperCase().slice(0, 12)}</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-[minmax(0,200px)_1fr] sm:gap-8">
              <div ref={avatarRef} className="avatar-frame" data-cursor="SCAN">
                <div className="avatar-frame__img">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`Portrait de ${fullName || handle}`}
                      width={400}
                      height={400}
                      loading="lazy"
                    />
                  ) : (
                    <GeneratedAvatar seed={handle} initials={initials} className="w-full h-full" />
                  )}
                </div>
                <span className="avatar-frame__scan" aria-hidden="true" />
                <span className="avatar-frame__corners" aria-hidden="true" />
                <span className="avatar-frame__label micro">
                  HOLO.ID ▸ {avatarUrl ? 'SYNC' : 'GEN'}
                </span>
              </div>

              <dl className="sheet-rows">
                {sheetRows.map((row) => (
                  <div key={row.label} className="sheet-row">
                    <dt className="micro">{row.label}</dt>
                    <dd>
                      <Placeholder value={row.value} field={row.field} locked="???">
                        {(v) =>
                          row.label === 'Niveau' ? (
                            <span className="font-display text-accent">LVL {v}</span>
                          ) : row.label === 'Âge' ? (
                            `${v} ans`
                          ) : (
                            v
                          )
                        }
                      </Placeholder>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {attributes.length > 0 && (
              <div className="mt-8">
                <p className="micro mb-4">
                  <span className="micro-accent">//</span> ATTRIBUTES
                </p>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {attributes.map((a) => (
                    <li key={a.name} className="attr">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="font-mono text-sm uppercase tracking-wider">{a.name}</span>
                        {isFilled(a.value) ? (
                          <span
                            className="font-display text-accent text-sm tabular-nums"
                            data-attr-num=""
                          >
                            {String(a.value).padStart(2, '0')}
                          </span>
                        ) : (
                          <Placeholder value={null} field={`attributes · ${a.name}`} locked="??" />
                        )}
                      </div>
                      <div className="attr__track" aria-hidden="true">
                        {isFilled(a.value) && (
                          <span
                            className="attr__bar"
                            data-attr={a.value}
                            style={{ transform: `scaleX(${a.value / 100})` }}
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {keep(identity.bio) && (
              <div className="mt-8">
                <p className="micro mb-3">
                  <span className="micro-accent">//</span> PLAYER_LORE
                </p>
                {isFilled(identity.bio) ? (
                  <p className="prose-neon text-lg" data-anim="bio">
                    {identity.bio}
                  </p>
                ) : (
                  <Placeholder value={identity.bio} field="identity.bio" block />
                )}
              </div>
            )}
          </Panel>

          {/* ── Zone hologramme : la sphère 3D apparaît ici, stats en orbite ── */}
          <div className="holo-zone lg:col-span-5" data-anim="holo">
            <div className="holo-zone__core" aria-hidden="true">
              <span className="micro">HOLO.CORE</span>
              <span className="micro micro-accent">SYNC ▓▓▓▓▓░</span>
            </div>
            <ul className="holo-zone__stats" aria-label="Statistiques">
              {funStats.map((s, i) => (
                <li key={s.label} className={`holo-stat holo-stat--${i}`} data-anim="stat">
                  <span className="micro">{s.label}</span>
                  <span className="holo-stat__value">
                    {typeof s.value === 'number' ? (
                      <Counter value={s.value} suffix={s.suffix} />
                    ) : (
                      <Placeholder value={s.value} field={`funStats · ${s.label}`} />
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Inventaire (centres d'intérêt) ───────────────── */}
          <Panel className="lg:col-span-12" innerClassName="p-5 sm:p-8" data-anim="inventory">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <p className="micro">
                <span className="micro-accent">//</span> INVENTORY
              </p>
              <p className="micro">
                {interests.length}/{Math.max(INVENTORY_SLOTS, interests.length)} SLOTS
              </p>
            </div>
            <ul className="inventory">
              {interests.map((it, i) => (
                <li key={i} className="slot" data-anim="slot">
                  <button
                    type="button"
                    className="slot__btn"
                    data-cursor="INSPECT"
                    aria-describedby={`slot-tip-${i}`}
                  >
                    <InventoryGlyph icon={it.icon} />
                    <span className="slot__name">
                      <Placeholder value={it.name} field={`interests[${i}].name`} />
                    </span>
                  </button>
                  <span role="tooltip" id={`slot-tip-${i}`} className="slot__tip">
                    <Placeholder value={it.description} field={`interests[${i}].description`} />
                  </span>
                </li>
              ))}
              {Array.from({ length: Math.max(0, INVENTORY_SLOTS - interests.length) }, (_, i) => (
                <li
                  key={`empty-${i}`}
                  className="slot slot--empty"
                  data-anim="slot"
                  aria-hidden="true"
                >
                  <span className="micro">EMPTY</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </section>
  );
}
