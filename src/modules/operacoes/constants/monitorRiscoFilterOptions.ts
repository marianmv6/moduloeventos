import type { MonitorRiscoFilters } from '../types/monitorRisco.types';

export const EMPTY_MONITOR_RISCO_FILTERS: MonitorRiscoFilters = {
  politicaEscopo: '',
  niveisRisco: '',
  tiposComportamento: '',
  periodoInicio: '',
  periodoFim: '',
  periodoHoraInicio: '',
  periodoHoraFim: '',
};

export const MONITOR_POLITICA_OPTIONS = [
  { value: '', label: '(Preencha ou selecione)' },
  { value: 'motorista', label: 'Política por motorista' },
  { value: 'veiculo', label: 'Política por veículo' },
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
  baixo: '#169EFF',
  medio: '#E29C2C',
  alto: '#FF5454',
  critico: '#7F1D1D',
};

export const MONITOR_RISCO_LEVEL_LABELS: Record<string, string> = {
  baixo: 'Baixo',
  medio: 'Médio',
  alto: 'Alto',
  critico: 'Crítico',
};
