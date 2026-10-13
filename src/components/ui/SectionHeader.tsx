import { Placeholder } from './Placeholder';
import { SECTIONS, type SectionId } from '../../lib/sections';
import { seededRandom } from '../../lib/pixelFont';

const hex = (seed: string) => {
  const r = seededRandom(seed);
  return Math.floor(r() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0');
};

interface SectionHeaderProps {
  id: SectionId;
  /** Petit texte d'intro (issu du fichier de contenu). */
  intro?: string;
  introField?: string;
  align?: 'left' | 'center';
}

/** En-tête de niveau : micro-label // 0X_NOM, grand titre néon, numéro géant en contour. */
export function SectionHeader({ id, intro, introField, align = 'left' }: SectionHeaderProps) {
  const meta = SECTIONS.find((s) => s.id === id)!;
  const center = align === 'center';
  return (
    <header className={`section-header ${center ? 'text-center' : ''}`} data-anim="header">
      <span
        className={`section-num ${center ? 'left-1/2 -translate-x-1/2' : '-left-2 md:-left-6'} -top-16 md:-top-24`}
        aria-hidden="true"
        data-parallax="0.25"
      >
        {meta.num}
      </span>
      <span
        className="deco-hex hidden md:block"
        style={{ right: '6%', top: '-1.5rem' }}
        aria-hidden="true"
        data-parallax="0.6"
        data-text={`⌜ 0x${hex(id)} ⌟`}
      />
      <span
        className="deco-hex hidden md:block"
        style={{ right: '22%', top: '4.5rem' }}
        aria-hidden="true"
        data-parallax="-0.35"
        data-text={`[${meta.num}:${hex(`${id}-b`)}] SYNC`}
      />
      <p className="micro mb-4 relative" data-anim="micro">
        <span className="micro-accent">//</span> {meta.num}_{meta.title.replace(/ /g, '_')}{' '}
        <span>[LVL {meta.num}]</span>
      </p>
      <h2
        id={`${id}-title`}
        className="h-display section-title glow-text relative"
        data-anim="title"
      >
        {meta.title}
      </h2>
      {intro !== undefined && (
        <div className={`mt-6 relative ${center ? 'mx-auto' : ''} max-w-2xl`} data-anim="intro">
          <Placeholder value={intro} as="p" className="prose-neon text-lg" field={introField} />
        </div>
      )}
    </header>
  );
}
