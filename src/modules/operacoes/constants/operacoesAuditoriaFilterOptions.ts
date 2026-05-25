import type { ModalSelectOption } from '../../risk-rules/components/shared/ModalSelect';
import { COMPANY_OPTIONS } from '../../risk-rules/constants/companies';
import { mockAuditoriaRows } from '../mocks/operacoesAuditoria.mock';

const toOptions = (values: string[]): ModalSelectOption[] =>
  values.map((v) => ({ value: v, label: v }));

export const getAuditoriaEmpresaOptions = (): ModalSelectOption[] => COMPANY_OPTIONS;

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
  empresa: string;
  tratadoPor: string;
  placa: string;
  motorista: string;
  periodoInicio: string;
  periodoFim: string;
  periodoHoraInicio: string;
  periodoHoraFim: string;
}

export const EMPTY_AUDITORIA_FILTERS: AuditoriaAdvancedFilters = {
  empresa: '',
  tratadoPor: '',
  placa: '',
  motorista: '',
  periodoInicio: '',
  periodoFim: '',
  periodoHoraInicio: '',
  periodoHoraFim: '',
};
