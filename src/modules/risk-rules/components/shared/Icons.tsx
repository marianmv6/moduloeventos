import React from 'react';

/**
 * Ícones do design system Creare – outline, cor primária (#169EFF).
 * Uso: botões de ação em tabelas (editar = lápis, excluir = lixeira).
 */

const iconClass = 'ds-icon';

export const IconEdit: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    className={iconClass}
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const IconTrash: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    className={iconClass}
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

/** Lupa: igual à referência — círculo (lente) + haste curta reta a 45° do canto inferior direito, traço uniforme, pontas retas */
export const IconSearch: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    className={iconClass}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="butt"
    strokeLinejoin="miter"
    aria-hidden
    {...props}
  >
    <circle cx="12" cy="12" r="7" />
    <path d="M 16.95 16.95 L 21.95 21.95" />
  </svg>
);

/** Ícone de informação: círculo com "i" (cor teal/cyan, fundo transparente) */
export const IconInfo: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({ color = '#00ACC1', ...props }) => (
  <svg
    className={iconClass}
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
    {...props}
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <path d="M12 11v5M12 8v1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="12" cy="6" r="1.5" fill={color} />
  </svg>
);

/** Olho: visualizar (outline + pupila) */
export const IconView: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    className={iconClass}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default { IconEdit, IconTrash, IconSearch, IconInfo, IconView };
