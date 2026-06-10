import type { ModalSelectOption } from '../components/shared/ModalSelect';

export const POLICY_CONTINUITY_INFO =
  'Após atingir o nível crítico, novos eventos podem continuar ocorrendo. Configure se deseja apenas validar os eventos sem gerar tratativas, tratar novamente quando gerado novos eventos ou limitar uma nova tratativa por intervalo de tempo, evitando excesso de acionamentos.';

export const POLICY_CONTINUITY_OPTIONS: ModalSelectOption[] = [
  { value: 'first_critical_only', label: 'Tratar apenas a primeira ocorrência crítica' },
  { value: 'every_new_event', label: 'Gerar nova tratativa a cada novo evento' },
  { value: 'interval', label: 'Tratar com intervalo' },
];

export const POLICY_CONTINUITY_INTERVAL_MIN = 5;
export const POLICY_CONTINUITY_INTERVAL_MAX = 60;
export const POLICY_CONTINUITY_INTERVAL_DEFAULT = 15;

export function clampPolicyContinuityIntervalMinutes(value: number): number {
  return Math.min(
    POLICY_CONTINUITY_INTERVAL_MAX,
    Math.max(POLICY_CONTINUITY_INTERVAL_MIN, Math.round(value)),
  );
}

export function parsePolicyContinuityIntervalInput(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  if (digits === '') return POLICY_CONTINUITY_INTERVAL_DEFAULT;
  return clampPolicyContinuityIntervalMinutes(Number(digits));
}
