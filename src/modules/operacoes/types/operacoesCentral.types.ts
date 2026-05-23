export type CentralOccurrenceSeverity = 'critical' | 'high' | 'medium' | 'low';

export type CentralEventValidationStatus = 'aguardando' | 'validado';

export interface CentralOccurrenceEvent {
  id: string;
  /** Soma acumulada de pontos na ocorrência até este evento */
  pointsSum: number;
  datetime: string;
  eventType: string;
  eventPoints: number;
  /** Evento atual (primeiro da lista expandida) — exibe placa, motorista e ações */
  isCurrent?: boolean;
  validationStatus?: CentralEventValidationStatus;
}

export interface CentralOccurrence {
  id: string;
  severity: CentralOccurrenceSeverity;
  totalPoints: number;
  placa: string;
  prefixo: string;
  driverName: string;
  openedByAnalyst?: string;
  /** Exibe ícone de validação pela IA na linha principal quando não há analista */
  validatedByAi?: boolean;
  events: CentralOccurrenceEvent[];
}

export interface CentralStatusSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

/** @deprecated Usado só em linhas colapsadas de outras ocorrências */
export type CentralOccurrenceActions =
  | { kind: 'opened-by-analyst'; analystName: string }
  | { kind: 'with-monitor'; monitorType: 'ai' }
  | { kind: 'with-monitor'; monitorType: 'human'; analystName: string };
export interface CentralOccurrenceSummaryRow {
  id: string;
  severity: CentralOccurrenceSeverity;
  totalPoints: number;
  datetime: string;
  eventType: string;
  eventPoints: number;
  placa: string;
  prefixo: string;
  driverName: string;
  actions: CentralOccurrenceActions;
}
