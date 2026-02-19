/**
 * Tipos do módulo Regras de Risco - Creare Sistemas
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** Tipo do evento para a aba Pontuações e filtro */
export type EventType = 'video' | 'telemetria' | 'eficiencia' | 'personalizados';

/** Usuários atribuídos: 'all' = Todos os usuários; ou lista de ids */
export type PolicyUsersAttributed = 'all' | string[];

export interface Policy {
  id: string;
  name: string;
  description?: string;
  /** Janela de tempo em horas (1–12); default 2 */
  janela: number;
  /** Ids dos eventos (score rules) contemplados */
  eventosContemplados: string[];
  /** 'all' ou ids de usuários específicos */
  usuariosAtribuidos: PolicyUsersAttributed;
  /** Id da tratativa (trilha) ativa vinculada; seleção única */
  trailId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScoreRule {
  id: string;
  name: string;
  /** Tipo do evento: Vídeo, Telemetria, Eficiência ou Personalizados */
  eventType: EventType;
  weight: number;
  /** Valor padrão da pontuação (para "Retomar padrão") */
  defaultWeight?: number;
  minValue?: number;
  maxValue?: number;
  active: boolean;
}

export interface TreatmentStep {
  id: string;
  order: number;
  label: string;
  action: string;
  config?: Record<string, unknown>;
}

export interface Treatment {
  id: string;
  name: string;
  description?: string;
  riskLevel: RiskLevel;
  steps: TreatmentStep[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/* --- Trilhas de Tratativas (nova especificação) --- */

export type TrailTrackingType = 'motorista' | 'veiculo';
export type TrailMode = 'points' | 'levels';
export type StepActionType =
  | 'email_automatico'
  | 'contato_gestor'
  | 'whatsapp_grupo'
  | 'mensagem_voz'
  | 'acao_personalizada';

export type TrailStepTrigger =
  | { type: 'points'; minScore: number }
  | { type: 'levels'; level: 'low' | 'medium' | 'high' };

export interface TrailStepConfig {
  contactIds?: string[];
  groupIds?: string[];
  voiceMessageId?: string;
  description?: string;
  url?: string;
}

export interface TrailStep {
  id: string;
  order: number;
  trigger: TrailStepTrigger;
  action: StepActionType;
  config?: TrailStepConfig;
}

export interface Trail {
  id: string;
  name: string;
  trackingType: TrailTrackingType;
  mode: TrailMode;
  steps: TrailStep[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  description?: string;
  userId?: string;
}

export type VoiceMessageFormat = 'WAV' | 'MP3';

export type VoiceMessageLanguage = 'pt' | 'en' | 'es';

export type VoiceMessageDevice = 'K1 Plus' | 'G5 Plus';

export interface VoiceMessage {
  id: string;
  identification: string;
  /** Idioma da leitura: pt (padrão), en, es */
  language?: VoiceMessageLanguage;
  message: string;
  /** Dispositivo: K1 Plus (WAV) ou G5 Plus (MP3) */
  device?: VoiceMessageDevice;
  format: VoiceMessageFormat;
  active: boolean;
}

export interface HistoryEntry {
  id: string;
  entityType: 'policy' | 'score' | 'treatment' | 'contact' | 'voice';
  entityId: string;
  entityName: string;
  action: 'create' | 'update' | 'delete' | 'activate' | 'deactivate';
  userId?: string;
  userName?: string;
  /** E-mail do usuário que fez a alteração (exibido na listagem) */
  userEmail?: string;
  timestamp: string;
  /** Descrição exata dos valores modificados, ex: Etapa 1 - "Nível" alterado de "Baixo" para "Médio" */
  actionDescription?: string;
  details?: Record<string, unknown>;
}

export type RiskTabId = 'policy' | 'scores' | 'treatments' | 'history';
