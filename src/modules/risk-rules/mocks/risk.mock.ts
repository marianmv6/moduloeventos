/**
 * Mocks do módulo Regras de Risco - Creare Sistemas
 * Pontuações e níveis conforme imagem de referência (modal Pontuações).
 */

import type { Policy, ScoreRule, Treatment, HistoryEntry, Trail, Contact, VoiceMessage } from '../types/risk.types';
import type { EventType } from '../types/risk.types';

/** Usuários ativos da plataforma (para multi-select em políticas) */
export interface PlatformUser {
  id: string;
  name: string;
  active: boolean;
}

export const mockUsers: PlatformUser[] = [
  { id: 'usr-1', name: 'Maria Silva', active: true },
  { id: 'usr-2', name: 'João Santos', active: true },
  { id: 'usr-3', name: 'Ana Oliveira', active: true },
];

export const mockPolicies: Policy[] = [
  {
    id: 'pol-1',
    name: 'Política padrão',
    description: 'Regras gerais de risco para operação',
    active: true,
    janela: 2,
    eventosContemplados: ['score-1', 'score-2', 'score-3'],
    usuariosAtribuidos: 'all',
    trailId: 'trail-1',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-02-01T14:30:00Z',
  },
  {
    id: 'pol-2',
    name: 'Política alta criticidade',
    active: true,
    janela: 3,
    eventosContemplados: ['score-4', 'score-5'],
    usuariosAtribuidos: ['usr-1', 'usr-2'],
    createdAt: '2025-01-20T09:00:00Z',
    updatedAt: '2025-01-20T09:00:00Z',
  },
];

/** Pontuação por evento (imagem: Nível = badge por faixa de pontos; 1–19 Baixo, 20–39 Médio, ≥40 Alto).
 *  Vídeo: Sonolência N1 → N2 → Sonolência acumulada → Bocejo → … */
const PONTUACOES_POR_EVENTO: { name: string; eventType: EventType; weight: number }[] = [
  { name: 'Sonolência N1', eventType: 'video', weight: 20 },
  { name: 'Sonolência N2', eventType: 'video', weight: 40 },
  { name: 'Sonolência acumulada', eventType: 'video', weight: 60 },
  { name: 'Bocejo', eventType: 'video', weight: 5 },
  { name: 'Ausência', eventType: 'video', weight: 20 },
  { name: 'Celular', eventType: 'video', weight: 15 },
  { name: 'Cigarro', eventType: 'video', weight: 10 },
  { name: 'Câmera Coberta', eventType: 'video', weight: 20 },
  { name: 'Atenção', eventType: 'video', weight: 5 },
  { name: 'Sem cinto', eventType: 'video', weight: 15 },
  { name: 'Pedestre', eventType: 'video', weight: 20 },
  { name: 'Risco de colisão', eventType: 'video', weight: 25 },
  { name: 'Excesso de velocidade', eventType: 'telemetria', weight: 15 },
  { name: 'Excesso de velocidade em busca remota', eventType: 'telemetria', weight: 20 },
  { name: 'Aceleração brusca', eventType: 'telemetria', weight: 10 },
  { name: 'Freada brusca', eventType: 'telemetria', weight: 10 },
  { name: 'Curva em velocidade elevada', eventType: 'telemetria', weight: 15 },
  { name: 'Banguela', eventType: 'telemetria', weight: 10 },
  { name: 'Excesso de rotação', eventType: 'telemetria', weight: 10 },
  { name: 'Condução ininterrupta', eventType: 'telemetria', weight: 15 },
  { name: 'Condução noturna', eventType: 'telemetria', weight: 20 },
  { name: 'Condução em horário não permitido', eventType: 'telemetria', weight: 20 },
  { name: 'Tempo de parada com motor ligado', eventType: 'telemetria', weight: 5 },
  { name: 'Cinto de segurança', eventType: 'telemetria', weight: 15 },
  { name: 'Desligamento do tablet', eventType: 'eficiencia', weight: 20 },
  { name: 'Formação de comboio', eventType: 'eficiencia', weight: 15 },
  { name: 'Evento personalizado 1', eventType: 'personalizados', weight: 15 },
  { name: 'Evento personalizado 2', eventType: 'personalizados', weight: 15 },
];

function buildScoreRules(): ScoreRule[] {
  return PONTUACOES_POR_EVENTO.map((ev, i) => ({
    id: `score-${i + 1}`,
    name: ev.name,
    eventType: ev.eventType,
    weight: ev.weight,
    defaultWeight: ev.weight,
    active: true,
  }));
}

export const mockScoreRules: ScoreRule[] = buildScoreRules();

export const mockTreatments: Treatment[] = [
  {
    id: 'trt-1',
    name: 'Bloqueio imediato',
    riskLevel: 'critical',
    steps: [
      { id: 'st-1', order: 1, label: 'Validar dados', action: 'validate' },
      { id: 'st-2', order: 2, label: 'Notificar gestor', action: 'notify' },
      { id: 'st-3', order: 3, label: 'Bloquear acesso', action: 'block' },
    ],
    active: true,
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-02-05T11:00:00Z',
  },
];

/** Trilhas de tratativas (sequência de ações por pontos ou níveis) */
export const mockTrails: Trail[] = [
  {
    id: 'trail-1',
    name: 'Trilha por pontos',
    trackingType: 'motorista',
    mode: 'points',
    steps: [
      { id: 'ts-1', order: 1, trigger: { type: 'points', minScore: 20 }, action: 'email_automatico', config: { contactIds: ['cont-1'] } },
      { id: 'ts-2', order: 2, trigger: { type: 'points', minScore: 40 }, action: 'contato_gestor', config: { contactIds: ['cont-1', 'cont-2'] } },
    ],
    active: true,
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-02-05T11:00:00Z',
  },
];

/** Contatos (cadastro auxiliar para trilhas) */
export const mockContacts: Contact[] = [
  { id: 'cont-1', name: 'Gestor Operação', phone: '+5511999990001', email: 'gestor@empresa.com', description: 'Contato principal' },
  { id: 'cont-2', name: 'Suporte', phone: '+5511888880002', email: 'suporte@empresa.com' },
];

/** Mensagens de voz (cadastro auxiliar) */
export const mockVoiceMessages: VoiceMessage[] = [
  { id: 'vox-1', identification: 'Alerta nível alto', language: 'pt', message: 'Sua pontuação atingiu nível de atenção. Entre em contato com o gestor.', device: 'G5 Plus', format: 'MP3', active: true },
  { id: 'vox-2', identification: 'Bloqueio', language: 'pt', message: 'Acesso bloqueado por segurança.', device: 'K1 Plus', format: 'WAV', active: false },
];

export const mockHistory: HistoryEntry[] = [
  {
    id: 'hist-1',
    entityType: 'policy',
    entityId: 'pol-1',
    entityName: 'Política padrão',
    action: 'update',
    userName: 'Admin',
    userEmail: 'admin@empresa.com',
    timestamp: '2025-02-01T14:30:00Z',
    actionDescription: 'Janela de tempo alterada de "2h" para "3h".',
  },
  {
    id: 'hist-2',
    entityType: 'treatment',
    entityId: 'trail-1',
    entityName: 'Trilha por pontos',
    action: 'update',
    userName: 'Sistema',
    userEmail: 'gestor@empresa.com',
    timestamp: '2025-02-05T11:00:00Z',
    actionDescription: 'Etapa 1 - "Nível" alterado de "Baixo" para "Médio".',
  },
];
