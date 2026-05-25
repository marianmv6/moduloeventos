import type {
  TratativaHistoryEntry,
  TratativaOcorrenciaData,
} from './tratativaOcorrencia.types';

/** Linha exibida na listagem de auditoria. */
export interface AuditoriaRow {
  id: string;
  companyName: string;
  /** Data/hora da tratativa (ex.: "23/05/2026 11:20"). */
  treatedAt: string;
  /** Nome de quem realizou a tratativa. */
  treatedBy: string;
  /** Identificador do veículo: "PLACA / PREFIXO". */
  vehicleId: string;
  driverName: string;
  /** Snapshot completo da ocorrência tratada (igual ao usado na modal de
   *  Tratativa, mas em modo somente leitura). */
  occurrenceSnapshot: TratativaOcorrenciaData;
  /** Histórico exibido na aba "Histórico" do modal de auditoria. */
  history: TratativaHistoryEntry[];
}
