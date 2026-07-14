import type { MonitorRiscoFilters } from '../types/monitorRisco.types';

export const EMPTY_MONITOR_RISCO_FILTERS: MonitorRiscoFilters = {
  politicaId: '',
  niveisRisco: '',
  monitoramentoDe: '',
  tempoAtivo: '',
  periodoInicio: '',
  periodoFim: '',
  periodoHoraInicio: '',
  periodoHoraFim: '',
};

export const MONITOR_TEMPO_ATIVO_OPTIONS = [
  { value: '15min', label: 'Há 15 min' },
  { value: '30min', label: 'Há 30 min' },
  { value: '1h', label: 'Há 1 h' },
  { value: '2h', label: 'Há 2 h' },
  { value: '3h', label: 'Há 3 h' },
  { value: '4h', label: 'Há 4 h' },
  { value: '5h', label: 'Há 5 h' },
  { value: '6h', label: 'Há 6 h' },
  { value: '7h', label: 'Há 7 h' },
  { value: '8h', label: 'Há 8 h' },
  { value: '9h', label: 'Há 9 h' },
  { value: '10h', label: 'Há 10 h' },
  { value: '11h', label: 'Há 11 h' },
  { value: '12h', label: 'Há 12 h' },
];

export const MONITOR_NIVEL_RISCO_OPTIONS = [
  { value: 'baixo', label: 'Baixo', pillClassName: 'monitor-risco-pill--baixo' },
  { value: 'medio', label: 'Médio', pillClassName: 'monitor-risco-pill--medio' },
  { value: 'alto', label: 'Alto', pillClassName: 'monitor-risco-pill--alto' },
  { value: 'critico', label: 'Crítico', pillClassName: 'monitor-risco-pill--critico' },
];

export const MONITOR_COMPORTAMENTO_OPTIONS = [
  { value: 'celular', label: 'Uso de celular' },
  { value: 'fadiga', label: 'Fadiga / sonolência' },
  { value: 'velocidade', label: 'Velocidade' },
  { value: 'cinto', label: 'Cinto de segurança' },
  { value: 'distancia', label: 'Distância inadequada' },
  { value: 'freada', label: 'Frenagem brusca' },
];

export const MONITOR_RISCO_LEVEL_COLORS: Record<string, string> = {
  baixo: '#00A3FF',
  medio: '#F2994A',
  alto: '#EB5757',
  critico: '#820000',
};

export const MONITOR_RISCO_LEVEL_LABELS: Record<string, string> = {
  baixo: 'Baixo',
  medio: 'Médio',
  alto: 'Alto',
  critico: 'Crítico',
};

export const MONITOR_RISCO_FEED_LEVEL_LABELS: Record<string, string> = {
  baixo: 'Risco baixo',
  medio: 'Risco médio',
  alto: 'Risco alto',
  critico: 'Risco crítico',
};

export const MONITOR_RISCO_DISTRIBUTION_LABELS: Record<string, string> = {
  baixo: 'baixas',
  medio: 'médias',
  alto: 'altas',
  critico: 'críticas',
};

/** Ordem de prioridade operacional (maior → menor). */
export const MONITOR_RISCO_STATUS_PRIORITY = [
  'pendente_validacao',
  'pendente_tratativa',
  'retorno_agendado',
  'expirada',
] as const;

export const MONITOR_RISCO_STATUS_LABELS: Record<string, string> = {
  pendente_validacao: 'Pendente de validação',
  pendente_tratativa: 'Pendente de tratativa',
  retorno_agendado: 'Retorno agendado',
  expirada: 'Expirada',
};

export const MONITOR_RISCO_STATUS_BADGE_CLASS: Record<string, string> = {
  pendente_validacao: 'monitor-risco-status-badge--pendente-validacao',
  pendente_tratativa: 'monitor-risco-status-badge--pendente-tratativa',
  retorno_agendado: 'monitor-risco-status-badge--retorno-agendado',
  expirada: 'monitor-risco-status-badge--expirada',
};
