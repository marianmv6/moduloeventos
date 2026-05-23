import React from 'react';

const ICON_BLUE = '#169EFF';

interface IconFilterBarsProps {
  inverted?: boolean;
}

const FILTER_ORANGE = '#E09463';

/** Ícone limpar filtros: três barras + traço diagonal (filter-off). */
export const IconFilterClear: React.FC<{ color?: string }> = ({ color = FILTER_ORANGE }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <line x1="4" y1="6" x2="20" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="10" y1="18" x2="14" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="4" y1="4" x2="20" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** Ícone de filtro: três barras horizontais (estilo funil). Inverte ao abrir. */
export const IconFilterBars: React.FC<IconFilterBarsProps> = ({ inverted = false }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <g
      className={`operacoes-filter-icon__bars${inverted ? ' operacoes-filter-icon__bars--inverted' : ''}`}
    >
      <rect x="4" y="5" width="16" height="3" rx="0.75" fill={ICON_BLUE} />
      <rect x="7" y="10.5" width="10" height="3" rx="0.75" fill={ICON_BLUE} />
      <rect x="9.5" y="16" width="5" height="3" rx="0.75" fill={ICON_BLUE} />
    </g>
  </svg>
);
