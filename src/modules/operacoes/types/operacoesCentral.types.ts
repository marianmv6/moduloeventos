export type CentralOccurrenceSeverity = 'critical' | 'high' | 'medium' | 'low';

export type CentralEventValidationStatus = 'aguardando' | 'validado';

/** Tipos de alerta usados na validação dentro do modal play */
export type CentralAlertType =
  | 'bocejo'
  | 'celular'
  | 'sonolencia-n1'
  | 'sonolencia-n2'
  | 'ausencia'
  | 'atencao-alimentacao'
  | 'camera-coberta'
  | 'cigarro'
  | 'camera-deslocada'
  | 'desatencao'
  | 'nao-e-alerta';

export interface CentralValidationEvent {
  id: string;
  /** Hora do evento, formato HH:MM:SS — exibido na lateral esquerda */
  time: string;
  /** Placa/identificador exibido sob a hora */
  plate: string;
  /** Tipo de alerta sugerido (geralmente pela IA) */
  suggestedAlert: CentralAlertType;
  /** Indica que a sugestão veio da IA (badge "IA") */
  fromAi?: boolean;
  /** Já validado pelo analista nesta sessão */
  validated?: boolean;
}

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
  /** Nome do analista que validou — exibido no tooltip do ícone de "Validado" */
  validatedBy?: string;
  /** Indica que o evento foi validado pela IA — exibe o badge "IA" ao lado do status */
  validatedByAi?: boolean;
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
  | { kind: 'with-monitor'; monitorType: 'human'; analystName: string }
  | { kind: 'none' };
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
  /** Status do evento exibido na linha-resumo (padrão: aguardando validação). */
  validationStatus?: CentralEventValidationStatus;
  validatedBy?: string;
  validatedByAi?: boolean;
  /** Próximo passo ao clicar em play; padrão: validação. */
  playMode?: 'validation' | 'treatment';
}
