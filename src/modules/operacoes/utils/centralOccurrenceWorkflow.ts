import type { CentralOccurrenceListEntry } from '../mocks/operacoesCentral.mock';
import type { CentralOccurrence, CentralOccurrenceSummaryRow } from '../types/operacoesCentral.types';

/** Próximo passo ao clicar no botão play na Central de tratativas. */
export type CentralPlayMode = 'validation' | 'treatment';

export const CENTRAL_ETAPA_VALIDACAO = 'Pendentes de validação';
export const CENTRAL_ETAPA_TRATATIVA = 'Pendentes de tratativa';
export function getPlayActionTooltip(mode: CentralPlayMode): string {
  return mode === 'treatment' ? 'Iniciar tratativa' : 'Iniciar validação';
}

export function getViewActionTooltip(mode: CentralPlayMode): string {
  return mode === 'treatment' ? 'Visualizar tratativa' : 'Visualizar eventos';
}

export function isOccurrenceOpenedByAnotherAnalyst(occurrence: CentralOccurrence): boolean {
  return Boolean(occurrence.openedByAnalyst);
}

export function isSummaryRowOpenedByAnotherAnalyst(row: CentralOccurrenceSummaryRow): boolean {
  return (
    row.actions.kind === 'opened-by-analyst' ||
    (row.actions.kind === 'with-monitor' && row.actions.monitorType === 'human')
  );
}

/** Ocorrência expandida: validação enquanto houver evento aguardando (inclui o atual). */
export function getGroupOccurrencePlayMode(occurrence: CentralOccurrence): CentralPlayMode {
  const hasPendingValidation = occurrence.events.some((event) => {
    if (event.isCurrent) return true;
    const status = event.validationStatus ?? 'aguardando';
    return status !== 'validado';
  });
  return hasPendingValidation ? 'validation' : 'treatment';
}

export function getSummaryRowPlayMode(row: CentralOccurrenceSummaryRow): CentralPlayMode {
  if (row.playMode) return row.playMode;
  return row.validationStatus === 'validado' ? 'treatment' : 'validation';
}

export function getEntryPlayMode(entry: CentralOccurrenceListEntry): CentralPlayMode {
  if (entry.kind === 'group') return getGroupOccurrencePlayMode(entry.occurrence);
  return getSummaryRowPlayMode(entry.row);
}
