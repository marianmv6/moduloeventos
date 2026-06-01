import type { TratativaOcorrenciaData } from '../types/tratativaOcorrencia.types';
import { buildTratativaOcorrenciaFromCentral } from '../utils/centralOccurrenceBridge';
import { getBehaviorEvolutionForOccurrence } from './tratativaBehaviorEvolution.mock';

const ORG_GROUPS = [
  { id: 'g1', label: 'Branco' },
  { id: 'g2', label: '2 anos' },
  { id: 'g3', label: 'Centro-Oeste' },
  { id: 'g4', label: 'Rio Grande do Sul' },
];

/**
 * Mock usado para abrir a tela de "Tratativa da ocorrência" após o analista
 * confirmar todos os eventos no modal de validação. Reflete o cenário do
 * Figma: política por veículo, ABW5F22 / MBB122, 4 eventos.
 */
export const mockTratativaOcorrencia: TratativaOcorrenciaData = {
  occurrenceId: 'occ-1',
  policyKind: 'veiculo',
  parameterTitle: 'ABC1D23 / MBB102',
  eventsCount: 3,
  severity: 'critical',

  policyName: 'Política alta criticidade',
  policyTypeLabel: 'Por veículo',
  eventTypeLabel: 'Sonolência N2',
  gravityLabel: 'Crítico',

  trailLabel: 'Trilha por pontos',
  actions: [
    {
      id: 'a1',
      sequence: 1,
      title: 'Contato gestor imediato',
      defaultMessage: 'Informar ao gestor sobre a ocorrência e solicitar retorno imediato.',
      contacts: [
        {
          id: 'c1',
          name: 'Marco Antônio da Silva',
          shiftLabel: 'Turno manhã, tarde',
          shiftRange: '6:00 - 12:00',
          timeStart: '6:00',
          timeEnd: '12:00',
          phone: '(11) 98887-0333',
          email: 'marco.silva@bracell.com',
          contactPreference: 'ligacao',
          contactPreferences: ['ligacao'],
          acceptContactOutsideHours: false,
          description: 'Gestor operacional — plantão manhã e tarde.',
        },
      ],
    },
    {
      id: 'a2',
      sequence: 2,
      title: 'Ligar para gestor',
      contacts: [
        {
          id: 'c2',
          name: 'Renata Lopes Souza',
          shiftLabel: 'Turno tarde, noite',
          shiftRange: '12:00 - 22:00',
          timeStart: '12:00',
          timeEnd: '22:00',
          phone: '(11) 98887-0445',
          email: 'renata.souza@bracell.com',
          contactPreference: 'email',
          contactPreferences: ['email'],
          acceptContactOutsideHours: true,
          description: 'Preferência de contato por e-mail institucional.',
        },
      ],
    },
    {
      id: 'a3',
      sequence: 3,
      title: 'Ligar para supervisores',
      contacts: [
        {
          id: 'c3',
          name: 'Eduardo Tavares de Lima',
          shiftLabel: 'Turno manhã',
          shiftRange: '6:00 - 14:00',
          timeStart: '6:00',
          timeEnd: '14:00',
          phone: '(11) 98887-0511',
          email: 'eduardo.lima@bracell.com',
          contactPreference: 'whatsapp',
          contactPreferences: ['whatsapp'],
          acceptContactOutsideHours: false,
          description: 'Supervisor regional — contato preferencial via WhatsApp.',
        },
        {
          id: 'c4',
          name: 'Patrícia Mendonça',
          shiftLabel: 'Turno noite',
          shiftRange: '22:00 - 6:00',
          timeStart: '22:00',
          timeEnd: '6:00',
          phone: '(11) 98887-0612',
          email: 'patricia.mendonca@bracell.com',
          contactPreference: 'ligacao',
          contactPreferences: ['ligacao'],
          acceptContactOutsideHours: true,
          description: 'Supervisora noturna.',
        },
      ],
    },
  ],
  contacts: [
    {
      id: 'c1',
      name: 'Marco Antônio da Silva',
      shiftLabel: 'Turno manhã, tarde',
      shiftRange: '6:00 - 12:00',
      timeStart: '6:00',
      timeEnd: '12:00',
      phone: '(11) 98887-0333',
      email: 'marco.silva@bracell.com',
      contactPreference: 'ligacao',
      contactPreferences: ['ligacao'],
      acceptContactOutsideHours: false,
      description: 'Gestor operacional — plantão manhã e tarde.',
    },
  ],

  company: { name: 'Bracell' },

  driverOptions: [
    {
      id: 'd-occ-1',
      name: 'Paulo Roberto Moreira Pestana',
      organizationGroups: ORG_GROUPS,
    },
  ],
  selectedDriverId: 'd-occ-1',

  vehicleOptions: [
    {
      id: 'v-occ-1',
      placa: 'ABC1D23',
      prefixo: 'MBB102',
      tipo: 'Caminhão madeireiro',
      marca: 'Volvo',
      modelo: 'FH 540 6x4',
      anoModelo: '2022 / 2022',
      combustivel: 'Diesel',
      organizationGroups: ORG_GROUPS,
    },
  ],
  selectedVehicleId: 'v-occ-1',

  validatedEvents: [
    {
      id: 'val-occ-1-ev-1c',
      sequence: 1,
      time: '08:30:00',
      validatedAs: 'Sonolência N1',
      vehicleId: 'v-occ-1',
      driverId: 'd-occ-1',
      occurredAt: '23/05/06 08:30:00',
      location: 'Canoas / RS',
    },
    {
      id: 'val-occ-1-ev-1a',
      sequence: 2,
      time: '10:05:00',
      validatedAs: 'Sonolência N2',
      vehicleId: 'v-occ-1',
      driverId: 'd-occ-1',
      occurredAt: '23/05/06 10:05:00',
      location: 'Canoas / RS',
    },
    {
      id: 'val-occ-1-ev-1b',
      sequence: 3,
      time: '10:05:00',
      validatedAs: 'Sonolência N2',
      vehicleId: 'v-occ-1',
      driverId: 'd-occ-1',
      occurredAt: '23/05/06 10:05:00',
      location: 'Canoas / RS',
    },
  ],
};

const TRATATIVA_SHARED_TEMPLATE = {
  policyName: mockTratativaOcorrencia.policyName,
  policyTypeLabel: mockTratativaOcorrencia.policyTypeLabel,
  trailLabel: mockTratativaOcorrencia.trailLabel,
  actions: mockTratativaOcorrencia.actions,
  contacts: mockTratativaOcorrencia.contacts,
  company: mockTratativaOcorrencia.company,
};

export function getTratativaOcorrenciaForOccurrence(occurrenceId: string): TratativaOcorrenciaData {
  return {
    ...buildTratativaOcorrenciaFromCentral(occurrenceId, TRATATIVA_SHARED_TEMPLATE),
    behaviorEvolution: getBehaviorEvolutionForOccurrence(occurrenceId),
  };
}
