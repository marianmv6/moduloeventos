import type { ModalSelectOption } from '../../risk-rules/components/shared/ModalSelect';
import { mockOperacoesEvents } from '../mocks/operacoes.mock';
const toOptions = (values: string[]): ModalSelectOption[] =>
  values.map((v) => ({ value: v, label: v }));

export const getPlacaFilterOptions = (): ModalSelectOption[] =>
  toOptions([...new Set(mockOperacoesEvents.map((e) => e.placa))].sort());

export const getMotoristaFilterOptions = (): ModalSelectOption[] =>
  toOptions(
    [...new Set(mockOperacoesEvents.map((e) => e.driverName).filter((n): n is string => !!n))].sort(),
  );

export const getTipoEventoFilterOptions = (): ModalSelectOption[] =>
  toOptions([...new Set(mockOperacoesEvents.map((e) => e.eventType))].sort());

export interface OperacoesAdvancedFilters {
  placa: string;
  motorista: string;
  tipoEvento: string;
  /** Período (mesmo formato do CentralControlePeriodPicker). */
  periodoInicio: string;
  periodoFim: string;
  periodoHoraInicio: string;
  periodoHoraFim: string;
}

export const EMPTY_OPERACOES_FILTERS: OperacoesAdvancedFilters = {
  placa: '',
  motorista: '',
  tipoEvento: '',
  periodoInicio: '',
  periodoFim: '',
  periodoHoraInicio: '',
  periodoHoraFim: '',
};
