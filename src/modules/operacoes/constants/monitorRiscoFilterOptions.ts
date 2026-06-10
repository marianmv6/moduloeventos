import type { MonitorRiscoFilters } from '../types/monitorRisco.types';

export const EMPTY_MONITOR_RISCO_FILTERS: MonitorRiscoFilters = {
  politicaId: '',
  niveisRisco: '',
  tiposComportamento: '',
  periodoInicio: '',
  periodoFim: '',
  periodoHoraInicio: '',
  periodoHoraFim: '',
};

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
