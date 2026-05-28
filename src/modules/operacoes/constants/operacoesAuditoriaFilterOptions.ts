import type { ModalSelectOption } from '../../risk-rules/components/shared/ModalSelect';
import { mockAuditoriaRows } from '../mocks/operacoesAuditoria.mock';

const toOptions = (values: string[]): ModalSelectOption[] =>
  values.map((v) => ({ value: v, label: v }));

export const getAuditoriaTratadoPorOptions = (): ModalSelectOption[] =>
  toOptions([...new Set(mockAuditoriaRows.map((r) => r.treatedBy))].sort());

export const getAuditoriaPlacaOptions = (): ModalSelectOption[] =>
  toOptions([...new Set(mockAuditoriaRows.map((r) => r.vehicleId))].sort());

export const getAuditoriaMotoristaOptions = (): ModalSelectOption[] =>
  toOptions([...new Set(mockAuditoriaRows.map((r) => r.driverName))].sort());

/** Estrutura do filtro avançado da tela de Auditoria. Mesmo formato
 *  utilizado no filtro de Eventos para reaproveitar o
 *  CentralControlePeriodPicker (com hora de início e fim). */
export interface AuditoriaAdvancedFilters {
  tratadoPor: string;
  placa: string;
  motorista: string;
  periodoInicio: string;
  periodoFim: string;
  periodoHoraInicio: string;
  periodoHoraFim: string;
}

export const EMPTY_AUDITORIA_FILTERS: AuditoriaAdvancedFilters = {
  tratadoPor: '',
  placa: '',
  motorista: '',
  periodoInicio: '',
  periodoFim: '',
  periodoHoraInicio: '',
  periodoHoraFim: '',
};
