import { SECTIONS } from '../../lib/sections';
import { useAppStore } from '../../store/useAppStore';
import { scrollToTarget } from '../../lib/scroll';
import { sfx } from '../../audio/synth';

/** Mini-map verticale : un point par niveau, cliquable, le point actif pulse. */
export function MiniMap() {
  const active = useAppStore((s) => s.activeIndex);
  return (
    <nav className="minimap" aria-label="Mini-map des niveaux">
      <span className="minimap__rail" aria-hidden="true">
        <span
          className="minimap__fill"
          style={{ transform: `scaleY(${active / (SECTIONS.length - 1)})` }}
        />
      </span>
      <ol>
        {SECTIONS.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`minimap__dot ${i === active ? 'is-active' : ''} ${i < active ? 'is-done' : ''}`}
              aria-current={i === active ? 'location' : undefined}
              onClick={(e) => {
                e.preventDefault();
                sfx.blip();
                scrollToTarget(s.id);
              }}
              onPointerEnter={() => sfx.hover()}
              data-cursor="WARP"
            >
              <span className="minimap__label">
                {s.num} · {s.title}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
