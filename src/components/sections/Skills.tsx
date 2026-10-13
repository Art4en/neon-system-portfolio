import { useRef } from 'react';
import { usePlaying } from '../../hooks/usePlaying';
import { content } from '../../content/portfolio';
import { isFilled } from '../../content/placeholder';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { gsap, useGSAP } from '../../lib/gsap';
import { SectionHeader } from '../ui/SectionHeader';
import { Placeholder } from '../ui/Placeholder';
import { SkillTree } from './SkillTree';
import { CATEGORY_ICONS } from '../../lib/skillIcons';

/** 03 — SKILL TREE : arbre RPG (desktop) / cartes compactes (mobile). */
export function Skills() {
  const isWide = useMediaQuery('(min-width: 1024px)');
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="section-inner">
        <SectionHeader
          id="skills"
          intro={content.sections.skillsIntro}
          introField="sections.skillsIntro"
        />
        {isWide ? <SkillTree /> : <SkillCards />}
      </div>
    </section>
  );
}

function SkillCards() {
  const playing = usePlaying();
  const root = useRef<HTMLDivElement>(null);
  // En prod, une compétence pas encore remplie s'affiche « verrouillée ».
  const skills = content.skills.map((s, i) => ({ s, i }));

  useGSAP(
    () => {
      if (!playing) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('[data-anim="skill-card"]').forEach((card) => {
          gsap.from(card, {
            x: -30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 92%' },
          });
          const bar = card.querySelector('.attr__bar');
          if (bar)
            gsap.from(bar, {
              scaleX: 0,
              duration: 1.2,
              ease: 'expo.out',
              scrollTrigger: { trigger: card, start: 'top 92%' },
            });
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [playing] },
  );

  return (
    <div ref={root} className="grid gap-8">
      {content.skillCategories.map((cat) => {
        const list = skills.filter(({ s }) => s.category === cat.id);
        if (list.length === 0) return null;
        const Icon = CATEGORY_ICONS[cat.id];
        return (
          <div key={cat.id}>
            <h3 className="flex items-center gap-2 font-display uppercase tracking-[0.2em] text-sm text-accent mb-3">
              <Icon size={18} aria-hidden="true" /> {cat.label}
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {list.map(({ s, i }) => (
                <li key={i} className="skill-card" data-anim="skill-card">
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <span className="font-mono text-sm uppercase tracking-wide">
                      <Placeholder value={s.name} field={`skills[${i}].name`} locked="🔒 Locked" />
                    </span>
                    <span className="font-display text-accent text-sm">
                      <Placeholder value={s.level} field="level" locked="??">
                        {(v) => v}
                      </Placeholder>
                    </span>
                  </div>
                  <div className="attr__track" aria-hidden="true">
                    {isFilled(s.level) && (
                      <span
                        className="attr__bar"
                        style={{ transform: `scaleX(${s.level / 100})` }}
                      />
                    )}
                  </div>
                  {isFilled(s.years) && (
                    <p className="micro mt-2">
                      {s.years} an{s.years > 1 ? 's' : ''} de pratique
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
