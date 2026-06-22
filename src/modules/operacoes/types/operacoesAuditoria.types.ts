import type {
  TratativaHistoryEntry,
  TratativaOcorrenciaData,
  TratativaPolicyKind,
} from './tratativaOcorrencia.types';

/** Linha exibida na listagem de auditoria. */
export interface AuditoriaRow {
  id: string;
  /** Empresa associada (mesma chave usada em COMPANY_OPTIONS). */
  companyId: string;
  /** Pontuação acumulada no momento da tratativa. */
  treatmentPoints: number;
  /** Data/hora da tratativa em ISO local ("YYYY-MM-DD HH:mm"), usada para
   *  filtragem por período. */
  treatedAtIso: string;
  /** Data/hora formatada para exibição na lista (ex.: "23/05/2026 11:20"). */
  treatedAt: string;
  /** Nome de quem realizou a tratativa. */
  treatedBy: string;
  /** Nome da política de ocorrência associada. */
  policyName: string;
  /** Sujeito monitorado (motorista ou placa/prefixo conforme a política). */
  monitoringOf: string;
  /** Tipo de monitoramento associado à política da ocorrência. */
  trackingType: TratativaPolicyKind;
  /** Snapshot completo da ocorrência tratada (igual ao usado na modal de
   *  Tratativa, mas em modo somente leitura). */
  occurrenceSnapshot: TratativaOcorrenciaData;
  /** Histórico exibido na aba "Histórico" do modal de auditoria. */
  history: TratativaHistoryEntry[];
}
