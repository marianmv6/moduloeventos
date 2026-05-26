import type { CentralOccurrenceSeverity } from './operacoesCentral.types';

/** Tipo da política aplicada (afeta o título do card lateral). */
export type TratativaPolicyKind = 'veiculo' | 'motorista';

/** Contato a ser exibido no painel direito da aba "Tratativa". */
export interface TratativaContact {
  id: string;
  name: string;
  shiftLabel: string;
  shiftRange: string;
  phone: string;
}

/** Cada ação prevista na trilha selecionada. */
export interface TratativaAction {
  id: string;
  /** Numeração visível ("1.", "2.", ...) — deriva da ordem na lista, mas mantemos
   *  explicitamente para permitir saltos de numeração futuramente. */
  sequence: number;
  title: string;
  /** Contatos exibidos no painel "Detalhes" quando esta ação está
   *  selecionada. Se ausente, faz fallback para a lista global em
   *  `TratativaOcorrenciaData.contacts`. */
  contacts?: TratativaContact[];
}

/** Motoristas disponíveis para selecionar na aba "Informações". */
export interface TratativaDriverOption {
  id: string;
  name: string;
  organizationGroups: { id: string; label: string }[];
}

/** Veículos disponíveis para selecionar na aba "Informações" / "Eventos". */
export interface TratativaVehicleOption {
  id: string;
  placa: string;
  prefixo: string;
  tipo: string;
  marca: string;
  modelo: string;
  anoModelo: string;
  combustivel: string;
  organizationGroups: { id: string; label: string }[];
}

/** Evento previamente validado, exibido na aba "Eventos". */
export interface TratativaValidatedEvent {
  id: string;
  /** Ordem (1, 2, 3...) usada no rótulo do select ("01 — 08:13:25"). */
  sequence: number;
  /** Hora exibida no rótulo (HH:MM:SS). */
  time: string;
  /** Tipo de alerta confirmado pelo analista (ex.: "Sonolência N1"). */
  validatedAs: string;
  /** Veículo associado a este evento. Quando informado, alimenta o campo
   *  "Placa / prefixo" da aba "Eventos" automaticamente. */
  vehicleId?: string;
  /** Motorista associado a este evento. Quando informado, alimenta o campo
   *  "Motorista" da aba "Eventos". null = "Não identificado". */
  driverId?: string | null;
  /** Data/hora completa do evento, usada no histórico de auditoria
   *  (ex.: "25/05/06 11:12:03"). */
  occurredAt?: string;
  /** Localização aproximada do evento (label legível, ex.: "Canoas / RS"). */
  location?: string;
}

/** Entrada do histórico de auditoria — exibida na aba "Histórico"
 *  do AuditoriaOcorrenciaModal. */
export interface TratativaHistoryEntry {
  id: string;
  /** Texto formatado da data/hora ("Hoje, 11:20"). */
  when: string;
  author: string;
  description: string;
}

/** Dados gerais utilizados pelas abas Tratativa, Informações e Eventos. */
export interface TratativaOcorrenciaData {
  /** Identificador da ocorrência sendo tratada. */
  occurrenceId: string;
  policyKind: TratativaPolicyKind;
  /** Identificador exibido no card lateral. Para política por veículo, o
   *  formato sugerido é "PLACA / PREFIXO"; por motorista, o nome. */
  parameterTitle: string;
  /** Quantidade de eventos da ocorrência (texto auxiliar do card lateral). */
  eventsCount: number;
  severity: CentralOccurrenceSeverity;

  policyName: string;
  policyTypeLabel: string;
  eventTypeLabel: string;
  gravityLabel: string;

  /** Trilha de tratativa aplicada (campo readonly na aba "Tratativa"). */
  trailLabel: string;
  actions: TratativaAction[];
  contacts: TratativaContact[];

  /** Dados exibidos na aba Informações. */
  company: { name: string };
  driverOptions: TratativaDriverOption[];
  /** Motorista inicialmente selecionado (id). null = não identificado. */
  selectedDriverId: string | null;
  vehicleOptions: TratativaVehicleOption[];
  /** Veículo inicialmente selecionado (id). null = não identificado. */
  selectedVehicleId: string | null;

  /** Eventos validados anteriormente — alimentam o select da aba "Eventos". */
  validatedEvents: TratativaValidatedEvent[];
}
