import type { CentralOccurrenceSeverity } from '../types/operacoesCentral.types';

/** Limites padrão de política nova (40/60/80/100). */
const DEFAULT_THRESHOLDS = {
  low: 40,
  medium: 60,
  high: 80,
  critical: 100,
} as const;

/** Resolve o nível de risco a partir da pontuação acumulada. */
export function resolveSeverityFromAccumulatedPoints(
  points: number,
): CentralOccurrenceSeverity {
  if (points >= DEFAULT_THRESHOLDS.critical) return 'critical';
  if (points >= DEFAULT_THRESHOLDS.high) return 'high';
  if (points >= DEFAULT_THRESHOLDS.medium) return 'medium';
  if (points >= DEFAULT_THRESHOLDS.low) return 'low';
  return 'low';
}
