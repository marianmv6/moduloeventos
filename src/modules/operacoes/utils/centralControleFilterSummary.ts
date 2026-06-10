import type { CentralControleFilters } from '../constants/centralControleFilterOptions';

const FILTER_PARAM_LABELS: Record<
  Exclude<keyof CentralControleFilters, 'periodoHoraInicio' | 'periodoHoraFim'>,
  string
> = {
  etapa: 'etapa',
  tipoEvento: 'tipo de evento',
  placaPrefixo: 'placa ou prefixo',
  motorista: 'motorista',
  gravidade: 'nível de gravidade',
  politicaTratativa: 'política de ocorrências',
  periodoInicio: 'período',
  periodoFim: 'período',
};

export interface CentralAppliedFilterEntry {
  key: keyof CentralControleFilters;
  paramLabel: string;
  value: string;
}

function formatDateShort(iso: string): string {
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year.slice(-2)}`;
}

function formatPeriodValue(filters: CentralControleFilters): string {
  const start = filters.periodoInicio ? formatDateShort(filters.periodoInicio) : 'dd/mm/aa';
  const end = filters.periodoFim ? formatDateShort(filters.periodoFim) : 'dd/mm/aa';
  const timePart =
    filters.periodoHoraInicio !== '00:00' || filters.periodoHoraFim !== '23:59'
      ? ` (${filters.periodoHoraInicio} - ${filters.periodoHoraFim})`
      : '';
  return `${start} - ${end}${timePart}`;
}

export function getCentralAppliedFilterEntries(
  filters: CentralControleFilters,
): CentralAppliedFilterEntry[] {
  const entries: CentralAppliedFilterEntry[] = [];

  (['etapa', 'tipoEvento', 'placaPrefixo', 'motorista', 'gravidade', 'politicaTratativa'] as const).forEach(
    (key) => {
      if (filters[key].trim()) {
        entries.push({
          key,
          paramLabel: FILTER_PARAM_LABELS[key],
          value: filters[key],
        });
      }
    },
  );

  if (filters.periodoInicio || filters.periodoFim) {
    entries.push({
      key: 'periodoInicio',
      paramLabel: FILTER_PARAM_LABELS.periodoInicio,
      value: formatPeriodValue(filters),
    });
  }

  return entries;
}

export function countCentralAppliedFilters(filters: CentralControleFilters): number {
  return getCentralAppliedFilterEntries(filters).length;
}

export function hasCentralDraftFilters(filters: CentralControleFilters): boolean {
  return (
    filters.etapa.trim() !== '' ||
    filters.tipoEvento.trim() !== '' ||
    filters.placaPrefixo.trim() !== '' ||
    filters.motorista.trim() !== '' ||
    filters.gravidade.trim() !== '' ||
    filters.politicaTratativa.trim() !== '' ||
    filters.periodoInicio.trim() !== '' ||
    filters.periodoFim.trim() !== ''
  );
}
