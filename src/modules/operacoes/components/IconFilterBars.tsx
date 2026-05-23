import React from 'react';

const ICON_BLUE = '#169EFF';

interface IconFilterBarsProps {
  inverted?: boolean;
}

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
