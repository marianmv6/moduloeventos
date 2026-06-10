import { POLICY_RISK_LEVEL_ORDER } from '../constants/policyRiskLevel.constants';
import type { PolicyTrigger, PolicyTriggerNivelRisco } from '../types/risk.types';
import {
  POLICY_CONTINUITY_INTERVAL_DEFAULT,
  clampPolicyContinuityIntervalMinutes,
} from '../constants/policyContinuity.constants';

export interface PolicyRiskGatilhoState {
  enabled: boolean;
  aPartirDePontos: number;
  trilhaId: string;
  tratamentoContinuidade?: PolicyTrigger['tratamentoContinuidade'];
  intervaloMinutos?: number;
}

export type PolicyRiskGatilhosState = Record<PolicyTriggerNivelRisco, PolicyRiskGatilhoState>;

export function createEmptyPolicyRiskGatilhosState(): PolicyRiskGatilhosState {
  return POLICY_RISK_LEVEL_ORDER.reduce((acc, level) => {
    acc[level] = {
      enabled: false,
      aPartirDePontos: 0,
      trilhaId: '',
    };
    return acc;
  }, {} as PolicyRiskGatilhosState);
}

export function policyRiskGatilhosStateFromTriggers(gatilhos: PolicyTrigger[]): PolicyRiskGatilhosState {
  const state = createEmptyPolicyRiskGatilhosState();

  gatilhos.forEach((gatilho, index) => {
    const level = gatilho.nivelRisco ?? POLICY_RISK_LEVEL_ORDER[index];
    if (!level) return;

    state[level] = {
      enabled: true,
      aPartirDePontos: gatilho.aPartirDePontos,
      trilhaId: gatilho.trilhaId,
      tratamentoContinuidade: gatilho.tratamentoContinuidade,
      intervaloMinutos: gatilho.intervaloMinutos,
    };
  });

  return state;
}

export function policyRiskGatilhosStateToTriggers(state: PolicyRiskGatilhosState): PolicyTrigger[] {
  return POLICY_RISK_LEVEL_ORDER.filter((level) => state[level].enabled && state[level].trilhaId)
    .map((level) => {
      const item = state[level];
      return {
        aPartirDePontos: Math.max(0, item.aPartirDePontos),
        trilhaId: item.trilhaId,
        nivelRisco: level,
        ...(level === 'critical' &&
          item.tratamentoContinuidade && {
            tratamentoContinuidade: item.tratamentoContinuidade,
            ...(item.tratamentoContinuidade === 'interval' && {
              intervaloMinutos: clampPolicyContinuityIntervalMinutes(
                item.intervaloMinutos ?? POLICY_CONTINUITY_INTERVAL_DEFAULT,
              ),
            }),
          }),
      };
    })
    .sort((a, b) => a.aPartirDePontos - b.aPartirDePontos);
}

export function validatePolicyRiskGatilhosState(state: PolicyRiskGatilhosState): boolean {
  const enabled = POLICY_RISK_LEVEL_ORDER.filter((level) => state[level].enabled);
  if (enabled.length === 0) return false;
  if (enabled.some((level) => !state[level].trilhaId)) return false;

  for (let i = 1; i < enabled.length; i++) {
    const prev = state[enabled[i - 1]].aPartirDePontos;
    const current = state[enabled[i]].aPartirDePontos;
    if (current <= prev) return false;
  }

  return true;
}

export function policyRiskGatilhosStateEquals(
  a: PolicyRiskGatilhosState,
  b: PolicyRiskGatilhosState,
): boolean {
  return POLICY_RISK_LEVEL_ORDER.every((level) => {
    const left = a[level];
    const right = b[level];
    return (
      left.enabled === right.enabled &&
      left.aPartirDePontos === right.aPartirDePontos &&
      left.trilhaId === right.trilhaId &&
      (left.tratamentoContinuidade ?? '') === (right.tratamentoContinuidade ?? '') &&
      (left.intervaloMinutos ?? 0) === (right.intervaloMinutos ?? 0)
    );
  });
}
