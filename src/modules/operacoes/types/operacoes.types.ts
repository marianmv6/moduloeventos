export type OperacoesEventCategory =
  | 'sonolencia'
  | 'carregamento'
  | 'cinto'
  | 'cerca'
  | 'velocidade'
  | 'outro';

export interface OperacoesEventMapPosition {
  top: string;
  left: string;
}

export interface OperacoesEventRow {
  id: string;
  placa: string;
  eventType: string;
  category: OperacoesEventCategory;
  driverName: string | null;
  politicaTratativa: string | null;
  score: number | null;
  occurredAt: string;
  relativeTime: string;
  mapPosition: OperacoesEventMapPosition;
}
