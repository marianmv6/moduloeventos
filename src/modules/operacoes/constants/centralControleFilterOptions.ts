import type { ModalSelectOption } from '../../risk-rules/components/shared/ModalSelect';
import type { CentralOccurrenceSeverity } from '../types/operacoesCentral.types';
import { mockCentralOccurrenceList } from '../mocks/operacoesCentral.mock';
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
  placaPrefixo: string;
  motorista: string;
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
  placaPrefixo: '',
  motorista: '',
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

export function getCentralPlacaPrefixoOptions(): ModalSelectOption[] {
  const values = new Set<string>();
  mockCentralOccurrenceList.forEach((entry) => {
    if (entry.kind === 'group') {
      values.add(`${entry.occurrence.placa} / ${entry.occurrence.prefixo}`);
    } else {
      values.add(`${entry.row.placa} / ${entry.row.prefixo}`);
    }
  });
  return toOptions([...values].sort());
}

export function getCentralMotoristaOptions(): ModalSelectOption[] {
  const values = new Set<string>();
  mockCentralOccurrenceList.forEach((entry) => {
    if (entry.kind === 'group') {
      values.add(entry.occurrence.driverName);
    } else {
      values.add(entry.row.driverName);
    }
  });
  return toOptions([...values].sort());
}

export function getCentralGravidadeOptions(): ModalSelectOption[] {
  return (Object.keys(SEVERITY_LABELS) as CentralOccurrenceSeverity[]).map((key) => ({
    value: SEVERITY_LABELS[key],
    label: SEVERITY_LABELS[key],
  }));
}

export function getCentralPoliticaOptions(): ModalSelectOption[] {
  return toOptions([
    'Política padrão',
    'Política de sonolência',
    'Política de velocidade',
    'Política de cerca eletrônica',
  ]);
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
