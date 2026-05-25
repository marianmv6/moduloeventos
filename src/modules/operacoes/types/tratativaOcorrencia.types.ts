import type { CentralOccurrenceSeverity } from './operacoesCentral.types';

/** Tipo da política aplicada (afeta o título do card lateral). */
export type TratativaPolicyKind = 'veiculo' | 'motorista';

/** Trilha selecionável (mock — a integração real virá do cadastro de Tratativas). */
export type TratativaTrailOption = {
  id: string;
  label: string;
};

/** Cada ação prevista na trilha selecionada. */
export interface TratativaAction {
  id: string;
  /** Numeração visível ("1.", "2.", ...) — deriva da ordem na lista, mas mantemos
   *  explicitamente para permitir saltos de numeração futuramente. */
  sequence: number;
  title: string;
}

/** Contato a ser exibido no painel direito da aba "Tratativa". */
export interface TratativaContact {
  id: string;
  name: string;
  shiftLabel: string;
  shiftRange: string;
  phone: string;
}

/** Dados gerais utilizados pelas abas Tratativa e Informações. */
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

  trailOptions: TratativaTrailOption[];
  selectedTrailId: string;
  actions: TratativaAction[];
  contacts: TratativaContact[];

  /** Dados exibidos na aba Informações. */
  company: { name: string };
  driver?: {
    name: string;
    organizationGroups: { id: string; label: string }[];
  };
  vehicle?: {
    placa: string;
    prefixo: string;
    tipo: string;
    marca: string;
    modelo: string;
    anoModelo: string;
    combustivel: string;
    organizationGroups: { id: string; label: string }[];
  };
}
