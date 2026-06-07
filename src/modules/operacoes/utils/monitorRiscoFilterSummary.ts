import type { MonitorRiscoFilters } from '../types/monitorRisco.types';
import {
  MONITOR_COMPORTAMENTO_OPTIONS,
  MONITOR_NIVEL_RISCO_OPTIONS,
  MONITOR_POLITICA_OPTIONS,
} from '../constants/monitorRiscoFilterOptions';

export interface MonitorFilterBannerEntry {
  key: string;
  paramLabel: string;
  value: string;
}

function labelFromOptions(value: string, options: { value: string; label: string }[]): string {
  if (!value) return '';
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => options.find((opt) => opt.value === part)?.label ?? part)
    .join(', ');
}

function formatPeriod(filters: MonitorRiscoFilters): string {
  const { periodoInicio, periodoFim, periodoHoraInicio, periodoHoraFim } = filters;
  if (!periodoInicio && !periodoFim) return '';
  const start = periodoInicio || '…';
  const end = periodoFim || '…';
  const startTime = periodoHoraInicio || 'hh:mm';
  const endTime = periodoHoraFim || 'hh:mm';
  return `${start} - ${end} (${startTime} - ${endTime})`;
}

export function countAppliedMonitorRiscoFilters(filters: MonitorRiscoFilters): number {
  return getAppliedMonitorRiscoFilterEntries(filters).length;
}

export function getAppliedMonitorRiscoFilterEntries(
  filters: MonitorRiscoFilters,
): MonitorFilterBannerEntry[] {
  const entries: MonitorFilterBannerEntry[] = [];

  if (filters.politicaEscopo) {
    entries.push({
      key: 'politica',
      paramLabel: 'Política',
      value: labelFromOptions(filters.politicaEscopo, MONITOR_POLITICA_OPTIONS),
    });
  }
  if (filters.niveisRisco) {
    entries.push({
      key: 'nivel',
      paramLabel: 'Nível de risco',
      value: labelFromOptions(filters.niveisRisco, MONITOR_NIVEL_RISCO_OPTIONS),
    });
  }
  if (filters.tiposComportamento) {
    entries.push({
      key: 'comportamento',
      paramLabel: 'Comportamento',
      value: labelFromOptions(filters.tiposComportamento, MONITOR_COMPORTAMENTO_OPTIONS),
    });
  }
  const period = formatPeriod(filters);
  if (period) {
    entries.push({ key: 'periodo', paramLabel: 'Período', value: period });
  }

  return entries;
}

export function applyMonitorRiscoFilters<T extends { level?: string; behaviorType?: string }>(
  items: T[],
  filters: MonitorRiscoFilters,
): T[] {
  const levels = filters.niveisRisco
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  const behaviors = filters.tiposComportamento
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  return items.filter((item) => {
    if (levels.length && item.level && !levels.includes(item.level)) return false;
    if (behaviors.length && item.behaviorType && !behaviors.includes(item.behaviorType)) {
      return false;
    }
    return true;
  });
}
