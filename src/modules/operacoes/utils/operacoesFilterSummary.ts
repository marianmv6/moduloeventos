import type { OperacoesAdvancedFilters } from '../constants/operacoesFilterOptions';

const FILTER_PARAM_LABELS: Record<keyof OperacoesAdvancedFilters, string> = {
  placa: 'placa ou prefixo',
  motorista: 'motorista',
  tipoEvento: 'tipo de evento',
};

export interface AppliedFilterEntry {
  key: keyof OperacoesAdvancedFilters;
  paramLabel: string;
  value: string;
}

export function getAppliedFilterEntries(
  filters: OperacoesAdvancedFilters,
): AppliedFilterEntry[] {
  return (Object.keys(FILTER_PARAM_LABELS) as (keyof OperacoesAdvancedFilters)[])
    .filter((key) => filters[key].trim() !== '')
    .map((key) => ({
      key,
      paramLabel: FILTER_PARAM_LABELS[key],
      value: filters[key],
    }));
}

export function countAppliedFilters(filters: OperacoesAdvancedFilters): number {
  return getAppliedFilterEntries(filters).length;
}
