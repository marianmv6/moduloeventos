import type { TratativaOcorrenciaData, TratativaStreamingData } from '../types/tratativaOcorrencia.types';
import { mockTratativaStreaming } from '../mocks/tratativaStreaming.mock';
import { resolveEventCategory } from './eventCategory';

export function tratativaHasCameraEvents(data: TratativaOcorrenciaData): boolean {
  if (data.streaming) return true;
  return data.validatedEvents.some(
    (event) => resolveEventCategory(event.validatedAs) === 'video',
  );
}

export function resolveTratativaStreamingData(
  data: TratativaOcorrenciaData,
): TratativaStreamingData | undefined {
  if (data.streaming) return data.streaming;
  if (!tratativaHasCameraEvents(data)) return undefined;
  return mockTratativaStreaming;
}
