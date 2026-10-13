import { useRef } from 'react';
import { usePlaying } from '../../hooks/usePlaying';
import { Award, Briefcase, GraduationCap } from 'lucide-react';
import { content, type TimelineKind } from '../../content/portfolio';
import { isFilled } from '../../content/placeholder';
import { useAppStore } from '../../store/useAppStore';
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap';
import { sfx } from '../../audio/synth';
import { SectionHeader } from '../ui/SectionHeader';
import { Placeholder } from '../ui/Placeholder';
import { Panel } from '../ui/Panel';

const KIND: Record<TimelineKind, { label: string; Icon: typeof Award }> = {
  education: { label: 'Formation', Icon: GraduationCap },
  experience: { label: 'Expérience', Icon: Briefcase },
  award: { label: 'Distinction', Icon: Award },
};

/** 05 — ACHIEVEMENTS : timeline qui se dessine au scroll, chaque étape = succès débloqué. */
export function Timeline() {
  const playing = usePlaying();
  const DEV = import.meta.env.DEV;
  // En prod, une étape pas encore remplie s'affiche comme un succès « verrouillé ».
  const steps = content.timeline;
  const isLocked = (title: string) => !DEV && !isFilled(title);
  const root = useRef<HTMLElement>(null);
  const pushToast = useAppStore((s) => s.pushToast);

  useGSAP(
    () => {
      if (!playing) return;
      const list = root.current?.querySelector<HTMLElement>('[data-anim="tl-list"]');
      const path = root.current?.querySelector<SVGPathElement>('[data-anim="tl-path"]');
      const head = root.current?.querySelector<HTMLElement>('[data-anim="tl-head"]');
      if (!list || !path || !head) return;
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Ligne dessinée par stroke-dashoffset (pathLength = 1) + tête lumineuse.
        gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 });
        ScrollTrigger.create({
          trigger: list,
          start: 'top 65%',
          end: 'bottom 65%',
          scrub: true,
          onUpdate: (self) => {
            path.style.strokeDashoffset = String(1 - self.progress);
            head.style.top = `${self.progress * 100}%`;
            head.style.opacity = self.progress > 0.001 && self.progress < 0.999 ? '1' : '0.4';
          },
        });

        gsap.utils.toArray<HTMLElement>('[data-anim="tl-item"]', list).forEach((item, i) => {
          const card = item.querySelector('[data-anim="tl-card"]');
          const fromLeft = item.classList.contains('tl-item--left');
          gsap.set(card, { opacity: 0, x: fromLeft ? -60 : 60 });
          ScrollTrigger.create({
            trigger: item,
            start: 'top 68%',
            once: true,
            onEnter: () => {
              item.dataset.unlocked = '1';
              gsap.to(card, {
                opacity: 1,
                x: 0,
                duration: 1,
                ease: 'expo.out',
              });
              const title = steps[i]?.title;
              if (title !== undefined && isLocked(title)) return;
              pushToast({
                kind: 'milestone',
                title: title && isFilled(title) ? title : 'Étape à remplir',
                subtitle: KIND[steps[i]?.kind ?? 'experience'].label,
              });
              sfx.achievement();
            },
          });
        });
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(path, { strokeDasharray: 'none', strokeDashoffset: 0 });
        list
          .querySelectorAll<HTMLElement>('[data-anim="tl-item"]')
          .forEach((el) => (el.dataset.unlocked = '1'));
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [playing] },
  );

  return (
    <section ref={root} id="timeline" className="section" aria-labelledby="timeline-title">
      <div className="section-inner">
        <SectionHeader
          id="timeline"
          intro={content.sections.timelineIntro}
          introField="sections.timelineIntro"
          align="center"
        />

        <div className="tl" data-anim="tl-list">
          <svg
            className="tl__line"
            viewBox="0 0 2 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M1 0 V100" className="tl__line-bg" pathLength={1} />
            <path d="M1 0 V100" className="tl__line-fill" pathLength={1} data-anim="tl-path" />
          </svg>
          <span className="tl__head" data-anim="tl-head" aria-hidden="true" />
          <ol className="tl__list">
            {steps.map((step, i) => {
              const { label, Icon } = KIND[step.kind];
              return (
                <li
                  key={i}
                  className={`tl-item ${i % 2 === 0 ? 'tl-item--left' : 'tl-item--right'} ${isLocked(step.title) ? 'is-locked' : ''}`}
                  data-anim="tl-item"
                >
                  <span className="tl-item__node" aria-hidden="true">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <div data-anim="tl-card" className="tl-item__card">
                    <Panel innerClassName="p-5 sm:p-6" brackets={false}>
                      <p className="micro flex items-center justify-between gap-3 mb-2">
                        <span className="micro-accent">
                          {isLocked(step.title) ? '🔒' : '🏆'} {label}
                        </span>
                        <span className="font-mono">
                          <Placeholder
                            value={step.date}
                            field={`timeline[${i}].date`}
                            locked="????"
                          />
                        </span>
                      </p>
                      <h3 className="font-display uppercase tracking-wider text-lg sm:text-xl text-ink">
                        {isFilled(step.title) ? (
                          step.title
                        ) : (
                          <Placeholder
                            value={step.title}
                            field={`timeline[${i}].title`}
                            locked="Succès verrouillé"
                          />
                        )}
                      </h3>
                      <p className="micro mt-1 normal-case tracking-normal text-sm">
                        <Placeholder value={step.place} field={`timeline[${i}].place`} />
                      </p>
                      <div className="mt-3">
                        <Placeholder
                          value={step.description}
                          as="p"
                          className="prose-neon"
                          field={`timeline[${i}].description`}
                        />
                      </div>
                    </Panel>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
