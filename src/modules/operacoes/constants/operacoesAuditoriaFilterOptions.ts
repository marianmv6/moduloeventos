import type { ModalSelectOption } from '../../risk-rules/components/shared/ModalSelect';
import { mockAuditoriaRows } from '../mocks/operacoesAuditoria.mock';
import {
  encodeMonitoringFilterValue,
  getMonitoringTypeSuffix,
} from '../utils/centralOccurrenceDisplay';

const toOptions = (values: string[]): ModalSelectOption[] =>
  values.map((v) => ({ value: v, label: v }));

export const getAuditoriaTratadoPorOptions = (): ModalSelectOption[] =>
  toOptions([...new Set(mockAuditoriaRows.map((r) => r.treatedBy))].sort());

export const getAuditoriaMonitoramentoDeOptions = (): ModalSelectOption[] => {
  const seen = new Set<string>();
  const options: ModalSelectOption[] = [];

  mockAuditoriaRows.forEach((row) => {
    const value = encodeMonitoringFilterValue(row.trackingType, row.monitoringOf);
    if (seen.has(value)) return;
    seen.add(value);
    options.push({
      value,
      label: row.monitoringOf,
      suffixLabel: getMonitoringTypeSuffix(row.trackingType, 'filter'),
    });
  });

  return options.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
};

/** Estrutura do filtro avançado da tela de Auditoria. Mesmo formato
 *  utilizado no filtro de Eventos para reaproveitar o
 *  CentralControlePeriodPicker (com hora de início e fim). */
export interface AuditoriaAdvancedFilters {
  tratadoPor: string;
  monitoramentoDe: string;
  periodoInicio: string;
  periodoFim: string;
  periodoHoraInicio: string;
  periodoHoraFim: string;
}

export const EMPTY_AUDITORIA_FILTERS: AuditoriaAdvancedFilters = {
  tratadoPor: '',
  monitoramentoDe: '',
  periodoInicio: '',
  periodoFim: '',
  periodoHoraInicio: '',
  periodoHoraFim: '',
};
