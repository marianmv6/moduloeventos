import type { OperacoesAdvancedFilters } from '../constants/operacoesFilterOptions';

const FILTER_PARAM_LABELS: Partial<Record<keyof OperacoesAdvancedFilters, string>> = {
  placa: 'placa ou prefixo',
  motorista: 'motorista',
  tipoEvento: 'tipo de evento',
};

export interface AppliedFilterEntry {
  key: keyof OperacoesAdvancedFilters;
  paramLabel: string;
  value: string;
}

function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year.slice(-2)}`;
}

function formatPeriod(filters: OperacoesAdvancedFilters): string {
  const start = formatDisplayDate(filters.periodoInicio);
  const end = formatDisplayDate(filters.periodoFim);
  if (!start && !end) return '';
  if (start && end) return `${start} - ${end}`;
  return start || end;
}

export function getAppliedFilterEntries(
  filters: OperacoesAdvancedFilters,
): AppliedFilterEntry[] {
  const entries: AppliedFilterEntry[] = [];
  (Object.keys(FILTER_PARAM_LABELS) as (keyof OperacoesAdvancedFilters)[]).forEach((key) => {
    const value = filters[key];
    if (typeof value !== 'string' || value.trim() === '') return;
    entries.push({
      key,
      paramLabel: FILTER_PARAM_LABELS[key]!,
      value,
    });
  });

  const periodLabel = formatPeriod(filters);
  if (periodLabel) {
    entries.push({ key: 'periodoInicio', paramLabel: 'período', value: periodLabel });
  }

  return entries;
}

export function countAppliedFilters(filters: OperacoesAdvancedFilters): number {
  return getAppliedFilterEntries(filters).length;
}
