/**
 * Tipos do módulo Regras de Tratativa - Creare Sistemas
 */

/** Empresa associada a entidades de cadastro/configuração. Quando o usuário é Creare, ele escolhe; quando é cliente, fica fixa. */
export interface Company {
  id: string;
  name: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** Tipo do evento para a aba Pontuações e filtro */
export type EventType = 'video' | 'telemetria' | 'eficiencia' | 'personalizados';

/** Usuários atribuídos: 'all' = Todos os usuários; ou lista de ids */
export type PolicyUsersAttributed = 'all' | string[];

/** Tipo de acompanhamento da política: por motorista ou por veículo */
export type PolicyTrackingType = 'motorista' | 'veiculo';

/** Configuração de um evento dentro da política: pontos e duração ativa */
export interface PolicyEventConfig {
  pontos: number;
  /** Duração ativa (ex: "15min", "1h", "2h") */
  duracaoAtiva: string;
}

/** Gravidade para ocorrência quando a política inclui evento de vídeo */
export type PolicyTriggerNivelRisco = 'low' | 'medium' | 'high' | 'critical';

/** Comportamento após atingir nível crítico */
export type PolicyContinuityTreatment = 'first_critical_only' | 'every_new_event' | 'interval';

/** Ocorrência: a partir de X pontos solicitar tratativa (trilha) Y; opcionalmente gravidade quando há evento de vídeo */
export interface PolicyTrigger {
  aPartirDePontos: number;
  trilhaId: string;
  /** Gravidade (Baixo/Médio/Alto/Crítico) – exibido quando a política inclui evento de vídeo */
  nivelRisco?: PolicyTriggerNivelRisco;
  /** Tratamento de continuidade quando nivelRisco === 'critical' */
  tratamentoContinuidade?: PolicyContinuityTreatment;
  /** Intervalo em minutos (5–60) quando tratamentoContinuidade === 'interval' */
  intervaloMinutos?: number;
}

export interface Policy {
  id: string;
  name: string;
  /** Empresa proprietária da política */
  companyId?: string;
  description?: string;
  /** Tipo de acompanhamento: Por motorista / Por veículo */
  tipoAcompanhamento: PolicyTrackingType;
  /** Configuração por evento: eventId -> pontos e duração ativa */
  configEventos: Record<string, PolicyEventConfig>;
  /** 'all' ou ids de usuários específicos */
  usuariosAtribuidos: PolicyUsersAttributed;
  /** Ocorrências por nível de risco (até 4: baixo, médio, alto, crítico) */
  gatilhos: PolicyTrigger[];
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
  | 'notificar_contato'
  | 'whatsapp_grupo'
  | 'mensagem_voz'
  | 'acao_personalizada';

export type TrailStepTrigger =
  | { type: 'points'; minScore: number }
  | { type: 'levels'; level: 'low' | 'medium' | 'high' | 'critical' };

export interface TrailStepConfig {
  contactIds?: string[];
  groupIds?: string[];
  voiceMessageId?: string;
  /** ID do template de e-mail (quando ação é email_automatico) */
  emailTemplateId?: string;
  description?: string;
  url?: string;
  /** Mensagem padrão exibida na tela de tratativa da ocorrência (contato / grupo) */
  defaultMessage?: string;
}

/** Template de e-mail automático: título, descrição, status e variáveis ativas */
export interface EmailTemplate {
  id: string;
  /** Empresa proprietária do template */
  companyId?: string;
  /** Título que o destinatário vê na caixa de entrada */
  title: string;
  /** Descrição interna (apenas para o usuário) */
  description?: string;
  active: boolean;
  /** Template padrão do sistema (não pode ser inativado nem excluído) */
  isDefault?: boolean;
  /** Chaves das variáveis ativas (cabecalho/corpo/rodape) */
  variables?: Record<string, boolean>;
  /** Origem do template: construtor padrão ou HTML importado */
  sourceType?: 'builder' | 'imported';
  /** Conteúdo HTML quando sourceType === 'imported' */
  customHtml?: string;
  createdAt?: string;
  updatedAt?: string;
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
  description?: string;
  /** Empresa proprietária da regra de tratativa */
  companyId?: string;
  trackingType: TrailTrackingType;
  mode: TrailMode;
  steps: TrailStep[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Turnos legados (Manhã, Tarde, Noite, Madrugada) — mantido para dados antigos */
export type ContactShift = 'manha' | 'tarde' | 'noite' | 'madrugada';

export type ContactWeekday =
  | 'domingo'
  | 'segunda'
  | 'terca'
  | 'quarta'
  | 'quinta'
  | 'sexta'
  | 'sabado';

export interface ContactDaySchedule {
  day: ContactWeekday;
  timeStart: string;
  timeEnd: string;
}

/** Preferência de contato (multi-select) */
export type ContactPreference = 'whatsapp' | 'ligacao' | 'email';

export interface Contact {
  id: string;
  /** Empresa do contato */
  companyId?: string;
  name?: string;
  phone?: string;
  email?: string;
  description?: string;
  userId?: string;
  /** Turnos legados (opcional) */
  turnos?: ContactShift[];
  /** Horário opcional início legado (ex: "08:00") */
  timeStart?: string;
  /** Horário opcional fim legado (ex: "12:00") */
  timeEnd?: string;
  /** Turno por dia da semana (início e fim por dia) */
  weeklySchedule?: ContactDaySchedule[];
  /** Preferências de contato: WhatsApp, Ligação, E-mail */
  contactPreferences?: ContactPreference[];
  /** Aceita contato fora do horário cadastrado */
  acceptContactOutsideHours?: boolean;
  /** Indica cadastro de grupo de WhatsApp (somente nome e descrição) */
  isWhatsAppGroup?: boolean;
}

export type VoiceMessageFormat = 'WAV' | 'MP3';

export type VoiceMessageLanguage = 'pt' | 'en' | 'es';

export type VoiceMessageDevice = 'K1 Plus' | 'G5 Plus';

export interface VoiceMessage {
  id: string;
  /** Empresa da mensagem de voz */
  companyId?: string;
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
  entityType: 'policy' | 'score' | 'treatment' | 'contact' | 'voice' | 'email_template';
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

export type RiskTabId = 'policy' | 'history';
