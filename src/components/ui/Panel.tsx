import type { CSSProperties, ReactNode } from 'react';
import type { BoxTag } from './tags';

interface PanelProps {
  as?: BoxTag;
  className?: string;
  innerClassName?: string;
  brackets?: boolean;
  style?: CSSProperties;
  children: ReactNode;
  [key: `data-${string}`]: string | undefined;
}

/** Panneau HUD : coins coupés, bordure dégradée 1px, verre sombre, crochets d'angle. */
export function Panel({
  as: Tag = 'div',
  className = '',
  innerClassName = '',
  brackets = true,
  style,
  children,
  ...rest
}: PanelProps) {
  return (
    <Tag className={`panel ${className}`} style={style} {...rest}>
      <div className={`panel__inner ${innerClassName}`}>
        {children}
        {brackets && <span className="brackets" aria-hidden="true" />}
      </div>
    </Tag>
  );
}
