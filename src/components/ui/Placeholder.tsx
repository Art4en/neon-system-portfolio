import type { ReactNode } from 'react';
import type { TextTag } from './tags';
import { isTodo, todoHint } from '../../content/placeholder';

const DEV = import.meta.env.DEV;

interface PlaceholderProps {
  /** Valeur issue de src/content/portfolio.ts */
  value: string | number | null | undefined;
  /** Balise à utiliser quand la valeur est remplie. */
  as?: TextTag;
  className?: string;
  /** Nom lisible du champ, affiché dans le cadre jaune en dev. */
  field?: string;
  /** Cadre jaune en bloc (pleine largeur) plutôt qu'en ligne. */
  block?: boolean;
  /** Rendu personnalisé quand la valeur est remplie. */
  children?: (value: string | number) => ReactNode;
  /**
   * En PROD, texte « verrouillé » affiché à la place d'un champ vide (ex : '???').
   * Sans cette prop, le champ vide est simplement masqué.
   */
  locked?: string;
}

/**
 * Affiche une valeur du fichier de contenu.
 * - valeur remplie → rendue normalement ;
 * - "[À REMPLIR] …" ou null → cadre jaune ✏️ avec la consigne en DEV ; en PROD, rien
 *   (ou un état « verrouillé » discret si `locked` est fourni) ;
 * - '' → rien (champ volontairement masqué).
 */
export function Placeholder({
  value,
  as: Tag = 'span',
  className,
  field,
  block,
  children,
  locked,
}: PlaceholderProps) {
  if (isTodo(value) || value === null) {
    if (!DEV) return locked ? <span className="locked">{locked}</span> : null;
    const hint = typeof value === 'string' ? todoHint(value) : 'nombre à renseigner';
    return (
      <span className={`ph-dev ${block ? 'ph-dev--block' : ''}`} data-placeholder="">
        <span aria-hidden="true">✏️</span>
        <span>
          {field && <b>{field} · </b>}
          {hint}
        </span>
      </span>
    );
  }
  if (value === undefined || value === '') return null;
  return <Tag className={className}>{children ? children(value) : value}</Tag>;
}
