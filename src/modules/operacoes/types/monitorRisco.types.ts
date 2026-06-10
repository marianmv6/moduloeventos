export type MonitorRiscoLevel = 'baixo' | 'medio' | 'alto' | 'critico';

export type MonitorRankingKind = 'motorista' | 'veiculo';

export interface MonitorRiscoFilters {
  politicaId: string;
  niveisRisco: string;
  tiposComportamento: string;
  periodoInicio: string;
  periodoFim: string;
  periodoHoraInicio: string;
  periodoHoraFim: string;
}

export type MonitorRiscoTabId = 'insights' | 'listagem';

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
  driverName: string;
  plate: string;
  vehicleModel: string;
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
  driverName: string;
  vehicleLabel: string;
  behaviorType: string;
  scoreRuleId?: string;
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
