import { useEffect, useRef } from 'react';
import { usePlaying } from '../../hooks/usePlaying';
import { content } from '../../content/portfolio';
import { isFilled } from '../../content/placeholder';
import { usableUrl } from '../../lib/content';
import { useAppStore } from '../../store/useAppStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { gsap, useGSAP } from '../../lib/gsap';
import { SectionHeader } from '../ui/SectionHeader';
import { MissionCard } from './MissionCard';
import { SocialIcon } from '../ui/Icons';

const DEV = import.meta.env.DEV;

/** 04 — MISSIONS : scroll horizontal épinglé (desktop) / cartes empilées (mobile). */
export function Projects() {
  const playing = usePlaying();
  // En prod, une mission pas encore remplie s'affiche « verrouillée » (aucun texte inventé).
  const projects = content.projects;
  const isLocked = (title: string) => !DEV && !isFilled(title);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduced = useReducedMotion();
  const horizontal = isDesktop && !reduced;
  const setOpenProject = useAppStore((s) => s.setOpenProject);
  const unlock = useAppStore((s) => s.unlock);
  const phase = useAppStore((s) => s.phase);
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  const open = (slug: string) => {
    setOpenProject(slug);
    unlock('curious');
    history.replaceState(null, '', `#${slug}`);
  };

  // Lien partageable : /#slug-du-projet ouvre directement le briefing.
  useEffect(() => {
    if (phase !== 'playing') return;
    const check = () => {
      const slug = decodeURIComponent(location.hash.slice(1));
      if (content.projects.some((p) => p.slug === slug && (DEV || isFilled(p.title))))
        setOpenProject(slug);
    };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, [phase, setOpenProject]);

  useGSAP(
    () => {
      if (!playing) return;
      const el = track.current;
      if (!el) return;
      if (horizontal) {
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: 'none', // lié 1:1 au scroll (scrub), pas une animation d'UI
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        // Chaque carte « s'allume » en arrivant de la droite.
        gsap.utils.toArray<HTMLElement>('[data-anim="mission"]', el).forEach((card) => {
          gsap.fromTo(
            card,
            { rotationY: -28, opacity: 0.25, scale: 0.88, transformPerspective: 1200 },
            {
              rotationY: 0,
              opacity: 1,
              scale: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: 'left 100%',
                end: 'left 55%',
                scrub: true,
              },
            },
          );
        });
      } else if (!reduced) {
        gsap.utils.toArray<HTMLElement>('[data-anim="mission"]', el).forEach((card) => {
          gsap.from(card, {
            y: 60,
            opacity: 0,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 90%' },
          });
        });
      }
    },
    {
      scope: root,
      dependencies: [horizontal, reduced, projects.length, playing],
      revertOnUpdate: true,
    },
  );

  const github = content.contact.socials.find((s) => s.platform === 'github');
  const githubUrl = github ? usableUrl(github.url) : null;

  return (
    <section
      ref={root}
      id="projects"
      className={`missions ${horizontal ? 'missions--h' : 'section'}`}
      aria-labelledby="projects-title"
    >
      <div ref={track} className="missions__track">
        <div className="missions__intro">
          <SectionHeader
            id="projects"
            intro={content.sections.projectsIntro}
            introField="sections.projectsIntro"
          />
          <p className="micro hidden lg:block" aria-hidden="true">
            {projects.length} MISSIONS DISPONIBLES · SCROLL ▸▸
          </p>
        </div>

        {projects.map((p, i) => (
          <MissionCard
            key={p.slug}
            project={p}
            index={i}
            onOpen={open}
            locked={isLocked(p.title)}
          />
        ))}

        <div className="missions__end" aria-hidden={!githubUrl}>
          <p className="micro micro-accent">// END OF MISSION LOG</p>
          <p className="font-display text-2xl uppercase tracking-widest mt-3 mb-6">
            More missions loading…
          </p>
          {githubUrl && (
            <a
              className="btn-neon btn-neon--alt"
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="VIEW"
            >
              <SocialIcon platform="github" size={18} /> Voir mon GitHub
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
