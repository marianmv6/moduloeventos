import {
  EVENTOS_EFICIENCIA,
  EVENTOS_TELEMETRIA,
  EVENTOS_VIDEO,
} from '../../risk-rules/constants/eventTypes';
import type { CentralValidationEventCategory } from '../types/operacoesCentral.types';

export type { CentralValidationEventCategory };

/** Resolve a categoria do evento a partir do nome cadastrado na política. */
export function resolveEventCategory(eventTypeLabel: string): CentralValidationEventCategory {
  if ((EVENTOS_VIDEO as readonly string[]).includes(eventTypeLabel)) return 'video';
  if ((EVENTOS_TELEMETRIA as readonly string[]).includes(eventTypeLabel)) return 'telemetria';
  if ((EVENTOS_EFICIENCIA as readonly string[]).includes(eventTypeLabel)) return 'eficiencia';
  return 'video';
}
