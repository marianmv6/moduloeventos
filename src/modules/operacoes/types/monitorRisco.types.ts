import type { CentralPolicyTrackingType } from './operacoesCentral.types';

export type MonitorRiscoOccurrenceStatus =
  | 'pendente_validacao'
  | 'pendente_tratativa'
  | 'retorno_agendado'
  | 'expirada';

export type MonitorRiscoLevel = 'baixo' | 'medio' | 'alto' | 'critico';

export type MonitorRankingKind = 'motorista' | 'veiculo';

export interface MonitorRiscoFilters {
  politicaId: string;
  niveisRisco: string;
  monitoramentoDe: string;
  /** Janela de tempo ativo (ex.: 15min, 1h). */
  tempoAtivo: string;
  periodoInicio: string;
  periodoFim: string;
  periodoHoraInicio: string;
  periodoHoraFim: string;
}

export type MonitorRiscoTabId = 'insights' | 'listagem';

export interface MonitorRiscoDonutSegment {
  id: string;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface MonitorRiscoPoliticaDistribuicaoItem extends MonitorRiscoDonutSegment {
  policyId: string;
}

export interface MonitorRiscoPolicyInsights {
  nivelRisco: MonitorRiscoNivelRisco;
  eventosPorTempo: MonitorRiscoEventosTempoItem[];
  tipoEventos: MonitorRiscoDonutInsight;
  ocorrenciasPendentes: MonitorRiscoDonutInsight;
  rankingMotorista: MonitorRiscoRankingItem[];
  rankingVeiculo: MonitorRiscoRankingItem[];
  reincidentes: MonitorRiscoReincidenteItem[];
}

export interface MonitorRiscoNivelRisco {
  percent: number;
  activePoints: number;
  level: MonitorRiscoLevel;
  levelLabel: string;
  tooltipText: string;
}

export interface MonitorRiscoEventosTempoItem {
  id: string;
  label: string;
  count: number;
  kind: 'historico' | 'previsao';
  alertOutline?: boolean;
  trendDelta?: number;
}

export interface MonitorRiscoDonutInsight {
  total: number;
  centerPrimary: string;
  centerSecondary: string;
  segments: MonitorRiscoDonutSegment[];
}

export interface MonitorRiscoRankingItem {
  id: string;
  rank: number;
  driverName: string;
  plate: string;
  vehicleModel: string;
  score: number;
  level: MonitorRiscoLevel;
  kind: MonitorRankingKind;
  flagged?: boolean;
}

export interface MonitorRiscoReincidenteItem {
  id: string;
  rank: number;
  driverName: string;
  plate: string;
  vehicleModel: string;
  score: number;
  level: MonitorRiscoLevel;
}

export interface MonitorRiscoFeedItem {
  id: string;
  time: string;
  message: string;
  level: MonitorRiscoLevel;
  driverName: string;
  vehicleLabel: string;
  behaviorType: string;
  scoreRuleId?: string;
}

export interface MonitorRiscoListagemItem {
  id: string;
  score: number;
  level: MonitorRiscoLevel;
  monitoringOf: string;
  trackingType: CentralPolicyTrackingType;
  policyId: string;
  policyName: string;
  lastEventAtIso: string;
  behaviorType?: string;
  /** Status operacional da ocorrência na central. */
  status: MonitorRiscoOccurrenceStatus;
  /** Tempo de retorno agendado (min) — quando status é retorno_agendado. */
  returnConfirmationMinutes?: number;
}

export interface MonitorRiscoData {
  ocorrenciasPorPolitica: MonitorRiscoPoliticaDistribuicaoItem[];
  nivelRisco: MonitorRiscoNivelRisco;
  eventosPorTempo: MonitorRiscoEventosTempoItem[];
  tipoEventos: MonitorRiscoDonutInsight;
  ocorrenciasPendentes: MonitorRiscoDonutInsight;
  rankingMotorista: MonitorRiscoRankingItem[];
  rankingVeiculo: MonitorRiscoRankingItem[];
  reincidentes: MonitorRiscoReincidenteItem[];
  feed: MonitorRiscoFeedItem[];
  listagem: MonitorRiscoListagemItem[];
}
