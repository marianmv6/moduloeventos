import type { ModalSelectOption } from '../../risk-rules/components/shared/ModalSelect';
import type { CentralOccurrenceSeverity } from '../types/operacoesCentral.types';
import { mockCentralOccurrenceList } from '../mocks/operacoesCentral.mock';
import {
  encodeMonitoringFilterValue,
  formatCentralMonitoringLabel,
  getMonitoringTypeSuffix,
} from '../utils/centralOccurrenceDisplay';

const toOptions = (values: string[]): ModalSelectOption[] =>
  values.map((v) => ({ value: v, label: v }));

const SEVERITY_LABELS: Record<CentralOccurrenceSeverity, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Médio',
  low: 'Baixo',
};

export interface CentralControleFilters {
  etapa: string;
  tipoEvento: string;
  monitoramentoDe: string;
  gravidade: string;
  politicaTratativa: string;
  periodoInicio: string;
  periodoFim: string;
  periodoHoraInicio: string;
  periodoHoraFim: string;
}

export const EMPTY_CENTRAL_CONTROLE_FILTERS: CentralControleFilters = {
  etapa: '',
  tipoEvento: '',
  monitoramentoDe: '',
  gravidade: '',
  politicaTratativa: '',
  periodoInicio: '',
  periodoFim: '',
  periodoHoraInicio: '00:00',
  periodoHoraFim: '23:59',
};

export function getCentralTipoEventoOptions(): ModalSelectOption[] {
  const values = new Set<string>();
  mockCentralOccurrenceList.forEach((entry) => {
    if (entry.kind === 'group') {
      entry.occurrence.events.forEach((event) => values.add(event.eventType));
    } else {
      values.add(entry.row.eventType);
    }
  });
  return toOptions([...values].sort());
}

export function getCentralMonitoramentoDeOptions(): ModalSelectOption[] {
  const seen = new Set<string>();
  const options: ModalSelectOption[] = [];

  mockCentralOccurrenceList.forEach((entry) => {
    const source = entry.kind === 'group' ? entry.occurrence : entry.row;
    const label = formatCentralMonitoringLabel(source);
    const value = encodeMonitoringFilterValue(source.trackingType, label);
    if (seen.has(value)) return;
    seen.add(value);
    options.push({
      value,
      label,
      suffixLabel: getMonitoringTypeSuffix(source.trackingType, 'filter'),
    });
  });

  return options.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}

export function getCentralGravidadeOptions(): ModalSelectOption[] {
  return (Object.keys(SEVERITY_LABELS) as CentralOccurrenceSeverity[]).map((key) => ({
    value: SEVERITY_LABELS[key],
    label: SEVERITY_LABELS[key],
  }));
}

export function getCentralPoliticaOptions(): ModalSelectOption[] {
  const values = new Set<string>();
  mockCentralOccurrenceList.forEach((entry) => {
    if (entry.kind === 'group') {
      values.add(entry.occurrence.policyName);
    } else {
      values.add(entry.row.policyName);
    }
  });
  return toOptions([...values].sort());
}

export function getCentralEtapaOptions(): ModalSelectOption[] {
  return toOptions(['Pendentes de validação', 'Pendentes de tratativa']);
}

export function severityFromGravidadeLabel(label: string): CentralOccurrenceSeverity | null {
  const entry = (Object.entries(SEVERITY_LABELS) as [CentralOccurrenceSeverity, string][]).find(
    ([, value]) => value === label,
  );
  return entry ? entry[0] : null;
}
