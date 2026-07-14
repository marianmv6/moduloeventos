import type { CentralOccurrenceSeverity } from './operacoesCentral.types';
import type { ContactDaySchedule, ContactPreference } from '../../risk-rules/types/risk.types';

/** Tipo da política aplicada (afeta o título do card lateral). */
export type TratativaPolicyKind = 'veiculo' | 'motorista';

/** Contato a ser exibido no painel direito da aba "Tratativa". */
export interface TratativaContact {
  id: string;
  name: string;
  /** Texto legado de turno (ex.: "Turno manhã, tarde"). Preferir `weeklySchedule`. */
  shiftLabel?: string;
  /** Texto legado de faixa horária (ex.: "6:00 - 12:00"). Preferir `weeklySchedule`. */
  shiftRange?: string;
  /** Turno por dia da semana — formato ex.: Seg 08:00–17:00 */
  weeklySchedule?: ContactDaySchedule[];
  /** Horário início legado (ex.: "08:00") */
  timeStart?: string;
  /** Horário fim legado (ex.: "12:00") */
  timeEnd?: string;
  phone: string;
  email?: string;
  description?: string;
  /** Preferência de contato que define o ícone de ação exibido. */
  contactPreference?: ContactPreference;
  /** Preferências completas exibidas na modal "Ver tudo". */
  contactPreferences?: ContactPreference[];
  /** Aceita contato fora do horário cadastrado. */
  acceptContactOutsideHours?: boolean;
}

/** Resolução registrada em uma ação da trilha. */
export type TratativaActionResolution = 'resolvido' | 'nao_resolvido';

/** Cada ação prevista na trilha selecionada. */
export interface TratativaAction {
  id: string;
  /** Numeração visível ("1.", "2.", ...) — deriva da ordem na lista, mas mantemos
   *  explicitamente para permitir saltos de numeração futuramente. */
  sequence: number;
  title: string;
  /** Mensagem padrão configurada na trilha (exibida na tratativa da ocorrência). */
  defaultMessage?: string;
  /** Quando true, marcar como Resolvido exige retorno para confirmação. */
  scheduleReturnConfirmation?: boolean;
  /** Tempo em minutos (1–99) para retorno quando scheduleReturnConfirmation. */
  returnConfirmationMinutes?: number;
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

/** Nível de risco acumulado no momento do evento (cor do ponto no gráfico). */
export type TratativaBehaviorRiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** Tratativa registrada no gráfico — ponto independente na linha de evolução. */
export interface TratativaBehaviorTreatmentMarker {
  treatedBy: string;
  actionTitle: string;
  startedAt: string;
  endedAt: string;
  /** Minutos para retorno agendado após conclusão como Resolvido. */
  scheduledReturnMinutes?: number;
}

/** Ponto de evento (alerta) no gráfico de evolução do comportamento. */
export interface TratativaBehaviorEventPoint {
  id: string;
  /** Horário exibido no eixo X (HH:mm). */
  journeyTime: string;
  /** Minutos desde o início da janela de 12 h. */
  minutesFromStart: number;
  /** Pontuação acumulada após o evento. */
  cumulativeScore: number;
  /** Pontos somados por este evento. */
  eventPoints: number;
  riskLevel: TratativaBehaviorRiskLevel;
  eventType: string;
  location: string;
  occurredAtLabel: string;
}

/** Ponto de tratativa — ícone de headset sobre a linha, no horário/pontuação da intervenção. */
export interface TratativaBehaviorTreatmentPoint {
  id: string;
  journeyTime: string;
  minutesFromStart: number;
  /** Pontuação acumulada no momento da tratativa (posição na linha). */
  cumulativeScore: number;
  treatment: TratativaBehaviorTreatmentMarker;
}

export type TratativaBehaviorChartPoint =
  | ({ kind: 'event' } & TratativaBehaviorEventPoint)
  | ({ kind: 'treatment' } & TratativaBehaviorTreatmentPoint);

/** Dados do gráfico "Evolução do comportamento". */
export interface TratativaBehaviorEvolutionData {
  windowStartLabel: string;
  windowEndLabel: string;
  windowMinutes: number;
  maxScore: number;
  points: TratativaBehaviorChartPoint[];
}

export interface TratativaHistoryEntry {
  id: string;
  /** Texto formatado da data/hora ("Hoje, 11:20"). */
  when: string;
  author: string;
  description: string;
  /** Tempo de tratativa registrado no momento da ação. */
  treatmentDuration?: string;
  /** ISO local ("YYYY-MM-DD HH:mm") para controle de exclusão de comentários. */
  createdAtIso?: string;
  /** Comentário inserido manualmente na auditoria. */
  isComment?: boolean;
}

export type TratativaAttachmentKind = 'image' | 'pdf';

/** Anexo incluído na tratativa (foto ou PDF). */
export interface TratativaAttachment {
  id: string;
  name: string;
  kind: TratativaAttachmentKind;
  mimeType: string;
  sizeBytes: number;
  /** URL para pré-visualização (imagens) ou ícone estático (PDF). */
  previewUrl?: string;
  uploadedAt?: string;
}

export type TratativaStreamingCameraStatus = 'online' | 'offline' | 'loading';

export interface TratativaStreamingCamera {
  id: string;
  label: string;
  status: TratativaStreamingCameraStatus;
  size: 'large' | 'small';
}

export interface TratativaStreamingData {
  deviceName: string;
  isDeviceOnline: boolean;
  cameras: TratativaStreamingCamera[];
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
  /** Soma dos pontos dos eventos da ocorrência (card lateral). */
  occurrencePoints?: number;
  severity: CentralOccurrenceSeverity;

  policyName: string;
  policyTypeLabel: string;
  eventTypeLabel: string;
  gravityLabel: string;

  /** Trilha de tratativa aplicada (campo readonly na aba "Tratativa"). */
  trailLabel: string;
  /** Tempo total da tratativa (ex.: "5:47") — exibido de forma estática. */
  treatmentDurationLabel?: string;
  /** 1ª ação já concluída como Resolvido; aguarda retorno para confirmação. */
  awaitingReturnConfirmation?: boolean;
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
  /** Transmissão ao vivo das câmeras (aba Ver ao vivo). */
  streaming?: TratativaStreamingData;
  /** Série temporal para a aba "Evolução do comportamento". */
  behaviorEvolution?: TratativaBehaviorEvolutionData;
  /** Resoluções da trilha no modo auditoria (ex.: não resolvido → resolvido). */
  auditActionResolutions?: Partial<Record<string, TratativaActionResolution>>;
  /** Arquivos anexados na tratativa (aba Anexos). */
  attachments?: TratativaAttachment[];
  /** Registros anteriores exibidos na aba Histórico. */
  treatmentHistory?: TratativaHistoryEntry[];
}
