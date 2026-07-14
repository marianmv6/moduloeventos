import {
  mockCentralOccurrenceGroups,
  mockCentralOccurrenceSummaries,
} from '../mocks/operacoesCentral.mock';
import type {
  CentralAlertType,
  CentralOccurrence,
  CentralOccurrenceEvent,
  CentralOccurrenceSummaryRow,
  CentralValidationEvent,
} from '../types/operacoesCentral.types';
import { resolveEventCategory } from './eventCategory';
import { mockTratativaStreaming } from '../mocks/tratativaStreaming.mock';
import type {
  TratativaOcorrenciaData,
  TratativaAction,
} from '../types/tratativaOcorrencia.types';

const VIDEO_EVENT_TYPE_TO_ALERT: Record<string, CentralAlertType> = {
  'Sonolência N1': 'sonolencia-n1',
  'Sonolência N2': 'sonolencia-n2',
  Bocejo: 'bocejo',
  Ausência: 'ausencia',
  Celular: 'celular',
  Cigarro: 'cigarro',
  'Câmera Coberta': 'camera-coberta',
  Atenção: 'atencao-alimentacao',
  'Sem cinto': 'desatencao',
  Pedestre: 'desatencao',
  'Risco de colisão': 'desatencao',
  'Sonolência acumulada': 'sonolencia-n2',
};

function videoEventTypeToAlert(eventType: string): CentralAlertType {
  return VIDEO_EVENT_TYPE_TO_ALERT[eventType] ?? 'desatencao';
}

export type CentralOccurrenceEntry =
  | { kind: 'group'; occurrence: CentralOccurrence }
  | { kind: 'summary'; row: CentralOccurrenceSummaryRow };

const ORG_GROUPS = [
  { id: 'g1', label: 'Branco' },
  { id: 'g2', label: '2 anos' },
  { id: 'g3', label: 'Centro-Oeste' },
  { id: 'g4', label: 'Rio Grande do Sul' },
];

const SEVERITY_LABELS = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Médio',
  low: 'Baixo',
} as const;

function parseCentralDatetime(str: string): Date | null {
  const match = str.match(/(\d{2})\/(\d{2}),\s*(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, day, month, hour, minute] = match;
  return new Date(2024, Number(month) - 1, Number(day), Number(hour), Number(minute));
}

export function parseCentralDatetimeToTime(datetime: string): string {
  const match = datetime.match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}:00` : '00:00:00';
}

function formatOccurredAt(datetime: string): string {
  const match = datetime.match(/(\d{2})\/(\d{2}),\s*(\d{2}):(\d{2})/);
  if (!match) return datetime;
  const [, day, month, hour, minute] = match;
  return `23/${month}/${day} ${hour}:${minute}:00`;
}

function sortEventsChronologically<T extends { datetime: string }>(events: T[]): T[] {
  return [...events].sort((a, b) => {
    const ta = parseCentralDatetime(a.datetime)?.getTime() ?? 0;
    const tb = parseCentralDatetime(b.datetime)?.getTime() ?? 0;
    return ta - tb;
  });
}

export function findCentralOccurrenceById(occurrenceId: string): CentralOccurrenceEntry | null {
  const group = mockCentralOccurrenceGroups.find((occurrence) => occurrence.id === occurrenceId);
  if (group) return { kind: 'group', occurrence: group };

  const summary = mockCentralOccurrenceSummaries.find((row) => row.id === occurrenceId);
  if (summary) return { kind: 'summary', row: summary };

  return null;
}

function summaryRowAsEvent(row: CentralOccurrenceSummaryRow): CentralOccurrenceEvent {
  return {
    id: `${row.id}-event`,
    pointsSum: row.totalPoints,
    datetime: row.datetime,
    eventType: row.eventType,
    eventPoints: row.eventPoints,
    isCurrent: true,
    validationStatus: row.validationStatus,
    validatedBy: row.validatedBy,
    validatedByAi: row.validatedByAi,
  };
}

export function getCentralOccurrenceEvents(entry: CentralOccurrenceEntry): CentralOccurrenceEvent[] {
  if (entry.kind === 'group') return entry.occurrence.events;
  return [summaryRowAsEvent(entry.row)];
}

function isEventValidated(event: CentralOccurrenceEvent): boolean {
  if (event.isCurrent) return false;
  return event.validationStatus === 'validado';
}

export function buildCentralValidationEventsForOccurrence(
  occurrenceId: string,
): CentralValidationEvent[] {
  const entry = findCentralOccurrenceById(occurrenceId);
  if (!entry) return [];

  const plate = entry.kind === 'group' ? entry.occurrence.placa : entry.row.placa;
  const fromAi =
    entry.kind === 'group' ? entry.occurrence.validatedByAi : entry.row.validatedByAi;

  return sortEventsChronologically(getCentralOccurrenceEvents(entry)).map((event) => {
    const category = resolveEventCategory(event.eventType);
    return {
      id: `val-${occurrenceId}-${event.id}`,
      time: parseCentralDatetimeToTime(event.datetime),
      plate,
      eventCategory: category,
      suggestedAlert: category === 'video' ? videoEventTypeToAlert(event.eventType) : undefined,
      suggestedEventType: category !== 'video' ? event.eventType : undefined,
      fromAi: category === 'video' ? (event.validatedByAi ?? fromAi) : undefined,
      validated: isEventValidated(event),
      eventPoints: event.eventPoints,
      accumulatedPoints: event.pointsSum,
    };
  });
}

function buildValidatedEvents(
  occurrenceId: string,
  events: CentralOccurrenceEvent[],
  vehicleId: string,
  driverId: string,
): TratativaValidatedEvent[] {
  return sortEventsChronologically(events).map((event, index) => ({
    id: `val-${occurrenceId}-${event.id}`,
    sequence: index + 1,
    time: parseCentralDatetimeToTime(event.datetime),
    validatedAs: event.eventType,
    vehicleId,
    driverId,
    occurredAt: formatOccurredAt(event.datetime),
    location: 'Canoas / RS',
  }));
}

type TratativaTemplate = Pick<
  TratativaOcorrenciaData,
  'policyName' | 'policyTypeLabel' | 'trailLabel' | 'actions' | 'contacts' | 'company'
>;

function applyScheduleReturnFromOccurrence(
  actions: TratativaAction[],
  entry: CentralOccurrenceEntry,
): TratativaAction[] {
  if (entry.kind !== 'summary') return actions;
  const { scheduleReturnConfirmation, returnConfirmationMinutes } = entry.row;
  if (!scheduleReturnConfirmation || returnConfirmationMinutes == null) return actions;

  return actions.map((action) =>
    action.sequence === 1
      ? {
          ...action,
          scheduleReturnConfirmation: true,
          returnConfirmationMinutes,
        }
      : action,
  );
}

export function buildTratativaOcorrenciaFromCentral(
  occurrenceId: string,
  template: TratativaTemplate,
): TratativaOcorrenciaData {
  const entry = findCentralOccurrenceById(occurrenceId);
  if (!entry) {
    return {
      ...template,
      occurrenceId,
      policyKind: 'veiculo',
      parameterTitle: '—',
      eventsCount: 0,
      severity: 'medium',
      eventTypeLabel: '—',
      gravityLabel: SEVERITY_LABELS.medium,
      driverOptions: [],
      selectedDriverId: null,
      vehicleOptions: [],
      selectedVehicleId: null,
      validatedEvents: [],
    };
  }

  const placa = entry.kind === 'group' ? entry.occurrence.placa : entry.row.placa;
  const prefixo = entry.kind === 'group' ? entry.occurrence.prefixo : entry.row.prefixo;
  const driverName =
    entry.kind === 'group' ? entry.occurrence.driverName : entry.row.driverName;
  const severity = entry.kind === 'group' ? entry.occurrence.severity : entry.row.severity;
  const events = getCentralOccurrenceEvents(entry);
  const occurrencePoints = events.reduce((sum, event) => sum + (event.eventPoints ?? 0), 0);
  const currentEvent = events.find((event) => event.isCurrent) ?? events[events.length - 1];
  const driverId = `d-${occurrenceId}`;
  const vehicleId = `v-${occurrenceId}`;
  const actions = applyScheduleReturnFromOccurrence(template.actions, entry);
  const awaitingReturnConfirmation =
    entry.kind === 'summary' ? entry.row.awaitingReturnConfirmation === true : false;

  return {
    occurrenceId,
    policyKind: 'veiculo',
    parameterTitle: `${placa} / ${prefixo}`,
    eventsCount: events.length,
    occurrencePoints,
    severity,
    policyName: template.policyName,
    policyTypeLabel: template.policyTypeLabel,
    eventTypeLabel: currentEvent?.eventType ?? events[0]?.eventType ?? '—',
    gravityLabel: SEVERITY_LABELS[severity],
    trailLabel: template.trailLabel,
    awaitingReturnConfirmation,
    actions,
    contacts: template.contacts,
    company: template.company,
    driverOptions: [
      {
        id: driverId,
        name: driverName,
        organizationGroups: ORG_GROUPS,
      },
    ],
    selectedDriverId: driverId,
    vehicleOptions: [
      {
        id: vehicleId,
        placa,
        prefixo,
        tipo: 'Caminhão madeireiro',
        marca: 'Volvo',
        modelo: 'FH 540 6x4',
        anoModelo: '2022 / 2022',
        combustivel: 'Diesel',
        organizationGroups: ORG_GROUPS,
      },
    ],
    selectedVehicleId: vehicleId,
    validatedEvents: buildValidatedEvents(occurrenceId, events, vehicleId, driverId),
    streaming: events.some((event) => resolveEventCategory(event.eventType) === 'video')
      ? mockTratativaStreaming
      : undefined,
  };
}

export function getCentralDriverNameForOccurrence(occurrenceId: string): string {
  const entry = findCentralOccurrenceById(occurrenceId);
  if (!entry) return 'Condutor não identificado';
  return entry.kind === 'group' ? entry.occurrence.driverName : entry.row.driverName;
}
