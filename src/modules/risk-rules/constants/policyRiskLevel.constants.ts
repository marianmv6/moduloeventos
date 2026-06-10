import type { PolicyTriggerNivelRisco } from '../types/risk.types';

export interface PolicyRiskLevelMeta {
  level: PolicyTriggerNivelRisco;
  label: string;
  cardClassName: string;
}

/** Ordem e cores alinhadas à Central de tratativas. */
export const POLICY_RISK_LEVELS: PolicyRiskLevelMeta[] = [
  { level: 'low', label: 'Risco baixo', cardClassName: 'policy-risk-card--low' },
  { level: 'medium', label: 'Risco médio', cardClassName: 'policy-risk-card--medium' },
  { level: 'high', label: 'Risco alto', cardClassName: 'policy-risk-card--high' },
  { level: 'critical', label: 'Risco crítico', cardClassName: 'policy-risk-card--critical' },
];

export const POLICY_RISK_LEVEL_ORDER: PolicyTriggerNivelRisco[] = POLICY_RISK_LEVELS.map(
  (item) => item.level,
);
