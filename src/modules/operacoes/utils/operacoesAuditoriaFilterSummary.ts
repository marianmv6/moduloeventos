import type { AuditoriaAdvancedFilters } from '../constants/operacoesAuditoriaFilterOptions';
import { formatMonitoringFilterDisplayValue } from './centralOccurrenceDisplay';

const FILTER_PARAM_LABELS: Partial<Record<keyof AuditoriaAdvancedFilters, string>> = {
  tratadoPor: 'tratado por',
  monitoramentoDe: 'monitoramento de',
};

export interface AppliedAuditoriaFilterEntry {
  key: keyof AuditoriaAdvancedFilters;
  paramLabel: string;
  value: string;
}

function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year.slice(-2)}`;
}

function formatPeriod(filters: AuditoriaAdvancedFilters): string {
  const start = formatDisplayDate(filters.periodoInicio);
  const end = formatDisplayDate(filters.periodoFim);
  if (!start && !end) return '';
  if (start && end) return `${start} - ${end}`;
  return start || end;
}

export function getAppliedAuditoriaFilterEntries(
  filters: AuditoriaAdvancedFilters,
): AppliedAuditoriaFilterEntry[] {
  const entries: AppliedAuditoriaFilterEntry[] = [];
  (
    Object.keys(FILTER_PARAM_LABELS) as (keyof AuditoriaAdvancedFilters)[]
  ).forEach((key) => {
    const value = filters[key];
    if (typeof value !== 'string' || value.trim() === '') return;
    entries.push({
      key,
      paramLabel: FILTER_PARAM_LABELS[key]!,
      value:
        key === 'monitoramentoDe'
          ? formatMonitoringFilterDisplayValue(value)
          : value,
    });
  });

  const periodLabel = formatPeriod(filters);
  if (periodLabel) {
    entries.push({ key: 'periodoInicio', paramLabel: 'período', value: periodLabel });
  }

  return entries;
}

export function countAppliedAuditoriaFilters(filters: AuditoriaAdvancedFilters): number {
  return getAppliedAuditoriaFilterEntries(filters).length;
}
