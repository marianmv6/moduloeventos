import React from 'react';

const REGUA_TEXTO = `Régua de risco:
0 = Sem risco
1–19 = Baixo (Informativo)
20–39 = Médio (Acionável)
≥ 40 = Alto (Crítico)`;

export const ScoreInfoTooltip: React.FC = () => (
  <span className="score-info-tooltip-wrap" title={REGUA_TEXTO}>
    <span className="score-info-icon" aria-label="Informação sobre régua de risco">ℹ️</span>
    <span className="score-info-tooltip-content">{REGUA_TEXTO}</span>
  </span>
);

export default ScoreInfoTooltip;
