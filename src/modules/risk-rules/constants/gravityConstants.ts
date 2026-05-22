import type { ModalSelectOption } from '../components/shared/ModalSelect';
import type { PolicyTriggerNivelRisco, RiskLevel } from '../types/risk.types';

/** Rótulo do campo (antes: Nível de risco) */
export const GRAVITY_FIELD_LABEL = 'Gravidade';

export const GRAVITY_LABELS: Record<RiskLevel, string> = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
  critical: 'Crítico',
};

export const GRAVITY_OPTIONS: ModalSelectOption[] = [
  { value: 'low', label: 'Baixo' },
  { value: 'medium', label: 'Médio' },
  { value: 'high', label: 'Alto' },
  { value: 'critical', label: 'Crítico' },
];

/** Normaliza valor legado `grave` para `critical` */
export function normalizeGravityLevel(value: string | undefined): RiskLevel | PolicyTriggerNivelRisco | undefined {
  if (!value) return undefined;
  if (value === 'grave') return 'critical';
  if (value === 'low' || value === 'medium' || value === 'high' || value === 'critical') return value;
  return undefined;
}
