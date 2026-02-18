/**
 * Régua de risco por pontuação:
 * 0 = Sem risco | 1–19 = Baixo | 20–39 = Médio | ≥ 40 = Alto
 */

export type ScoreLevelKey = 'none' | 'low' | 'medium' | 'high';

export interface ScoreLevel {
  key: ScoreLevelKey;
  label: string;
  className: string;
}

export function getScoreLevel(points: number): ScoreLevel {
  if (points <= 0) {
    return { key: 'none', label: 'Sem risco', className: 'risk-badge--none' };
  }
  if (points <= 19) {
    return { key: 'low', label: 'Baixo', className: 'risk-badge--low' };
  }
  if (points <= 39) {
    return { key: 'medium', label: 'Médio', className: 'risk-badge--medium' };
  }
  return { key: 'high', label: 'Alto', className: 'risk-badge--high' };
}
