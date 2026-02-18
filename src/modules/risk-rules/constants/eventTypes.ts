/**
 * Tipos de evento e rótulos - Regras de Risco
 */

import type { EventType } from '../types/risk.types';

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  video: 'Vídeo',
  telemetria: 'Telemetria',
  eficiencia: 'Eficiência',
  personalizados: 'Personalizados',
};

/** Eventos do tipo Vídeo */
export const EVENTOS_VIDEO = [
  'Sonolência N1',
  'Sonolência N2',
  'Sonolência acumulada',
  'Bocejo',
  'Ausência',
  'Celular',
  'Cigarro',
  'Câmera Coberta',
  'Atenção',
  'Sem cinto',
  'Pedestre',
  'Risco de colisão',
] as const;

/** Eventos do tipo Telemetria */
export const EVENTOS_TELEMETRIA = [
  'Excesso de velocidade',
  'Excesso de velocidade em busca remota',
  'Aceleração brusca',
  'Freada brusca',
  'Curva em velocidade elevada',
  'Banguela',
  'Excesso de rotação',
  'Condução ininterrupta',
  'Condução noturna',
  'Condução em horário não permitido',
  'Tempo de parada com motor ligado',
  'Cinto de segurança',
] as const;

/** Eventos do tipo Eficiência (imagem: Desligamento do tablet, Formação de comboio) */
export const EVENTOS_EFICIENCIA = [
  'Desligamento do tablet',
  'Formação de comboio',
] as const;

export const FILTER_OPTION_TODOS = 'todos' as const;
export type TypeFilterValue = typeof FILTER_OPTION_TODOS | EventType;

export const TYPE_FILTER_OPTIONS: { value: TypeFilterValue; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'video', label: 'Vídeo' },
  { value: 'telemetria', label: 'Telemetria' },
  { value: 'eficiencia', label: 'Eficiência' },
  { value: 'personalizados', label: 'Personalizados' },
];
