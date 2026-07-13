import type { ModalSelectOption } from '../../risk-rules/components/shared/ModalSelect';
import { mockPolicies, mockScoreRules } from '../../risk-rules/mocks/risk.mock';
import type { Policy, PolicyTriggerNivelRisco } from '../../risk-rules/types/risk.types';
import {
  MONITOR_COMPORTAMENTO_OPTIONS,
  MONITOR_NIVEL_RISCO_OPTIONS,
} from '../constants/monitorRiscoFilterOptions';
import type { MonitorRankingKind, MonitorRiscoData } from '../types/monitorRisco.types';

const RISK_LEVEL_MAP: Record<PolicyTriggerNivelRisco, string> = {
  low: 'baixo',
  medium: 'medio',
  high: 'alto',
  critical: 'critico',
};

function scoreRuleToBehavior(scoreRuleId: string): string | undefined {
  const rule = mockScoreRules.find((item) => item.id === scoreRuleId);
  if (!rule) return undefined;

  const name = rule.name.toLowerCase();
  if (name.includes('sonol') || name.includes('bocejo') || name.includes('ausência')) return 'fadiga';
  if (name.includes('celular')) return 'celular';
  if (name.includes('velocidade')) return 'velocidade';
  if (name.includes('cinto')) return 'cinto';
  if (name.includes('freada')) return 'freada';
  if (name.includes('colisão') || name.includes('distância')) return 'distancia';
  return undefined;
}

export function getMonitorPoliticaOptions(): ModalSelectOption[] {
  return mockPolicies
    .filter((policy) => policy.active)
    .map((policy) => ({ value: policy.id, label: policy.name }));
}

export function getPolicyById(id: string): Policy | undefined {
  return mockPolicies.find((policy) => policy.id === id);
}

export function getPolicyRankingKind(policy: Policy): MonitorRankingKind {
  return policy.tipoAcompanhamento;
}

export function getPolicyNivelRiscoOptions(politicaId: string): ModalSelectOption[] {
  const policy = getPolicyById(politicaId);
  if (!policy) return MONITOR_NIVEL_RISCO_OPTIONS;

  const levels = new Set(
    policy.gatilhos
      .map((trigger) => trigger.nivelRisco)
      .filter(Boolean)
      .map((level) => RISK_LEVEL_MAP[level!]),
  );

  if (levels.size === 0) return MONITOR_NIVEL_RISCO_OPTIONS;
  return MONITOR_NIVEL_RISCO_OPTIONS.filter((option) => levels.has(option.value));
}

export function getPolicyComportamentoOptions(politicaId: string): ModalSelectOption[] {
  const policy = getPolicyById(politicaId);
  if (!policy) return MONITOR_COMPORTAMENTO_OPTIONS;

  const behaviors = new Set<string>();
  Object.keys(policy.configEventos).forEach((scoreRuleId) => {
    const behavior = scoreRuleToBehavior(scoreRuleId);
    if (behavior) behaviors.add(behavior);
  });

  if (behaviors.size === 0) return MONITOR_COMPORTAMENTO_OPTIONS;
  return MONITOR_COMPORTAMENTO_OPTIONS.filter((option) => behaviors.has(option.value));
}

export function applyPolicyScope(data: MonitorRiscoData, politicaId: string): MonitorRiscoData {
  const policy = getPolicyById(politicaId);
  if (!policy) return data;

  const allowedScoreRules = new Set(Object.keys(policy.configEventos));
  const allowedLevels = new Set(
    policy.gatilhos
      .map((trigger) => trigger.nivelRisco && RISK_LEVEL_MAP[trigger.nivelRisco])
      .filter(Boolean) as string[],
  );

  const feed = data.feed.filter((item) => {
    if (item.scoreRuleId && !allowedScoreRules.has(item.scoreRuleId)) return false;
    if (allowedLevels.size > 0 && !allowedLevels.has(item.level)) return false;
    return true;
  });

  const listagem = data.listagem.filter((item) => item.policyId === politicaId);

  return { ...data, feed, listagem };
}
