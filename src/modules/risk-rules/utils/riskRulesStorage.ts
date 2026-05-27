import type {
  Contact,
  EmailTemplate,
  HistoryEntry,
  Policy,
  ScoreRule,
  Trail,
  Treatment,
  VoiceMessage,
} from '../types/risk.types';
import {
  mockContacts,
  mockEmailTemplates,
  mockPolicies,
  mockScoreRules,
  mockTrails,
  mockTreatments,
  mockVoiceMessages,
} from '../mocks/risk.mock';

const STORAGE_KEY = 'dhc-risk-rules-state-v1';

export interface RiskRulesPersistedState {
  policies: Policy[];
  scores: ScoreRule[];
  treatments: Treatment[];
  trails: Trail[];
  contacts: Contact[];
  voiceMessages: VoiceMessage[];
  emailTemplates: EmailTemplate[];
  history: HistoryEntry[];
}

function defaultState(): RiskRulesPersistedState {
  return {
    policies: mockPolicies,
    scores: mockScoreRules,
    treatments: mockTreatments,
    trails: mockTrails,
    contacts: mockContacts,
    voiceMessages: mockVoiceMessages,
    emailTemplates: mockEmailTemplates,
    history: [],
  };
}

/** Carrega cadastros e configurações do localStorage (ou mocks iniciais). */
export function loadRiskRulesState(): RiskRulesPersistedState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<RiskRulesPersistedState>;
    const defaults = defaultState();
    return {
      policies: parsed.policies ?? defaults.policies,
      scores: parsed.scores ?? defaults.scores,
      treatments: parsed.treatments ?? defaults.treatments,
      trails: parsed.trails ?? defaults.trails,
      contacts: parsed.contacts ?? defaults.contacts,
      voiceMessages: parsed.voiceMessages ?? defaults.voiceMessages,
      emailTemplates: parsed.emailTemplates ?? defaults.emailTemplates,
      history: parsed.history ?? defaults.history,
    };
  } catch {
    return defaultState();
  }
}

/** Persiste cadastros e configurações no localStorage do navegador. */
export function saveRiskRulesState(state: RiskRulesPersistedState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded ou modo privado — ignora silenciosamente */
  }
}
