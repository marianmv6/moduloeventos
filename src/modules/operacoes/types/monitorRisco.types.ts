export type MonitorRiscoLevel = 'baixo' | 'medio' | 'alto' | 'critico';

export type MonitorRankingKind = 'motorista' | 'veiculo';

export interface MonitorRiscoFilters {
  politicaEscopo: string;
  niveisRisco: string;
  tiposComportamento: string;
  periodoInicio: string;
  periodoFim: string;
  periodoHoraInicio: string;
  periodoHoraFim: string;
}

export interface MonitorRiscoScoreGeral {
  value: number;
  maxScore: number;
  trend: 'up' | 'down' | 'stable';
  trendLabel: string;
  subtitle: string;
}

export interface MonitorRiscoDistribuicaoItem {
  level: MonitorRiscoLevel;
  label: string;
  count: number;
  percent: number;
}

export interface MonitorRiscoRankingItem {
  id: string;
  label: string;
  secondaryLabel: string;
  score: number;
  level: MonitorRiscoLevel;
  kind: MonitorRankingKind;
}

export interface MonitorRiscoTendenciaPoint {
  label: string;
  score: number;
  afterCentralActions?: number;
}

export interface MonitorRiscoComportamentoItem {
  id: string;
  label: string;
  count: number;
  percent: number;
}

export interface MonitorRiscoRecenciaItem {
  window: string;
  label: string;
  count: number;
}

export interface MonitorRiscoFeedItem {
  id: string;
  time: string;
  message: string;
  level: MonitorRiscoLevel;
  entity: string;
  behaviorType: string;
}

export interface MonitorRiscoData {
  scoreGeral: MonitorRiscoScoreGeral;
  distribuicao: MonitorRiscoDistribuicaoItem[];
  rankingMotorista: MonitorRiscoRankingItem[];
  rankingVeiculo: MonitorRiscoRankingItem[];
  tendencia: MonitorRiscoTendenciaPoint[];
  comportamentos: MonitorRiscoComportamentoItem[];
  recencia: MonitorRiscoRecenciaItem[];
  feed: MonitorRiscoFeedItem[];
}
