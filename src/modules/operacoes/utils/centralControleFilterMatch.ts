import type { CentralOccurrenceListEntry } from '../mocks/operacoesCentral.mock';
import type { CentralControleFilters } from '../constants/centralControleFilterOptions';
import { severityFromGravidadeLabel } from '../constants/centralControleFilterOptions';
import {
  encodeMonitoringFilterValue,
  formatCentralMonitoringLabel,
} from './centralOccurrenceDisplay';
import {
  CENTRAL_ETAPA_TRATATIVA,
  CENTRAL_ETAPA_VALIDACAO,
  getEntryPlayMode,
} from './centralOccurrenceWorkflow';

function parseCentralDatetime(str: string): Date | null {
  const match = str.match(/(\d{2})\/(\d{2}),\s*(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, day, month, hour, minute] = match;
  return new Date(2024, Number(month) - 1, Number(day), Number(hour), Number(minute));
}

function getEntryDatetime(entry: CentralOccurrenceListEntry): string {
  if (entry.kind === 'group') return entry.occurrence.events[0]?.datetime ?? '';
  return entry.row.datetime;
}

function getEntryEventType(entry: CentralOccurrenceListEntry): string {
  if (entry.kind === 'group') return entry.occurrence.events[0]?.eventType ?? '';
  return entry.row.eventType;
}

function getEntryMonitoramentoDe(entry: CentralOccurrenceListEntry): string {
  const source = entry.kind === 'group' ? entry.occurrence : entry.row;
  return encodeMonitoringFilterValue(
    source.trackingType,
    formatCentralMonitoringLabel(source),
  );
}

function getEntryPolicyName(entry: CentralOccurrenceListEntry): string {
  if (entry.kind === 'group') return entry.occurrence.policyName;
  return entry.row.policyName;
}

function getEntrySeverity(entry: CentralOccurrenceListEntry) {
  if (entry.kind === 'group') return entry.occurrence.severity;
  return entry.row.severity;
}

function buildPeriodBounds(filters: CentralControleFilters): { start: Date | null; end: Date | null } {
  if (!filters.periodoInicio && !filters.periodoFim) {
    return { start: null, end: null };
  }

  const [startHour, startMinute] = (filters.periodoHoraInicio || '00:00').split(':').map(Number);
  const [endHour, endMinute] = (filters.periodoHoraFim || '23:59').split(':').map(Number);

  let start: Date | null = null;
  let end: Date | null = null;

  if (filters.periodoInicio) {
    const [year, month, day] = filters.periodoInicio.split('-').map(Number);
    start = new Date(year, month - 1, day, startHour, startMinute);
  }

  if (filters.periodoFim) {
    const [year, month, day] = filters.periodoFim.split('-').map(Number);
    end = new Date(year, month - 1, day, endHour, endMinute);
  }

  return { start, end };
}

export function matchesCentralControleFilters(
  entry: CentralOccurrenceListEntry,
  filters: CentralControleFilters,
): boolean {
  if (filters.etapa) {
    const playMode = getEntryPlayMode(entry);
    if (filters.etapa === CENTRAL_ETAPA_VALIDACAO && playMode !== 'validation') return false;
    if (filters.etapa === CENTRAL_ETAPA_TRATATIVA && playMode !== 'treatment') return false;
  }

  if (filters.tipoEvento && getEntryEventType(entry) !== filters.tipoEvento) return false;
  if (filters.monitoramentoDe && getEntryMonitoramentoDe(entry) !== filters.monitoramentoDe) return false;

  if (filters.gravidade) {
    const severity = severityFromGravidadeLabel(filters.gravidade);
    if (severity && getEntrySeverity(entry) !== severity) return false;
  }

  if (filters.politicaTratativa && getEntryPolicyName(entry) !== filters.politicaTratativa) {
    return false;
  }

  const { start, end } = buildPeriodBounds(filters);
  if (start || end) {
    const entryDate = parseCentralDatetime(getEntryDatetime(entry));
    if (!entryDate) return false;
    if (start && entryDate < start) return false;
    if (end && entryDate > end) return false;
  }

  return true;
}
