import type { TratativaOcorrenciaData } from '../types/tratativaOcorrencia.types';

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
  parameterTitle: 'ABW5F22 / MBB122',
  eventsCount: 3,
  severity: 'critical',

  policyName: 'Política alta criticidade',
  policyTypeLabel: 'Por veículo',
  eventTypeLabel: 'Sonolência N1',
  gravityLabel: 'Alto',

  trailLabel: 'Trilha por pontos',
  actions: [
    {
      id: 'a1',
      sequence: 1,
      title: 'Contato gestor imediato',
      contacts: [
        {
          id: 'c1',
          name: 'Marco Antônio da Silva',
          shiftLabel: 'Turno manhã, tarde',
          shiftRange: '6:00 - 12:00',
          phone: '(11) 98887-0333',
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
          phone: '(11) 98887-0445',
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
          phone: '(11) 98887-0511',
        },
        {
          id: 'c4',
          name: 'Patrícia Mendonça',
          shiftLabel: 'Turno noite',
          shiftRange: '22:00 - 6:00',
          phone: '(11) 98887-0612',
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
      phone: '(11) 98887-0333',
    },
  ],

  company: { name: 'Bracell' },

  driverOptions: [
    {
      id: 'd1',
      name: 'João das Dores',
      organizationGroups: ORG_GROUPS,
    },
    {
      id: 'd2',
      name: 'Carlos Fujimoto do Prado',
      organizationGroups: ORG_GROUPS,
    },
    {
      id: 'd3',
      name: 'Pedro Ramos de Paula',
      organizationGroups: ORG_GROUPS,
    },
    {
      id: 'd4',
      name: 'Ana Cristina dos Santos',
      organizationGroups: ORG_GROUPS,
    },
  ],
  selectedDriverId: 'd1',

  vehicleOptions: [
    {
      id: 'v1',
      placa: 'SLE3P56',
      prefixo: 'MBB121',
      tipo: 'Caminhão madeireiro',
      marca: 'Mercedes-Benz',
      modelo: 'AXOR 3344 S 6x4 2P',
      anoModelo: '2023 / 2023',
      combustivel: 'Diesel',
      organizationGroups: ORG_GROUPS,
    },
    {
      id: 'v2',
      placa: 'ABW5F22',
      prefixo: 'MBB122',
      tipo: 'Caminhão madeireiro',
      marca: 'Volvo',
      modelo: 'FH 540 6x4',
      anoModelo: '2022 / 2022',
      combustivel: 'Diesel',
      organizationGroups: ORG_GROUPS,
    },
    {
      id: 'v3',
      placa: 'ANB1K52',
      prefixo: 'VOL204',
      tipo: 'Caminhão tanque',
      marca: 'Scania',
      modelo: 'R 450 6x4',
      anoModelo: '2024 / 2024',
      combustivel: 'Diesel',
      organizationGroups: ORG_GROUPS,
    },
  ],
  selectedVehicleId: 'v1',

  validatedEvents: [
    {
      id: 'val-1',
      sequence: 1,
      time: '08:30:00',
      validatedAs: 'Sonolência N1',
      vehicleId: 'v1',
      driverId: 'd1',
      occurredAt: '23/05/06 08:30:00',
      location: 'Canoas / RS',
    },
    {
      id: 'val-2',
      sequence: 2,
      time: '10:05:00',
      validatedAs: 'Sonolência N2',
      vehicleId: 'v1',
      driverId: 'd1',
      occurredAt: '23/05/06 10:05:00',
      location: 'Canoas / RS',
    },
    {
      id: 'val-3',
      sequence: 3,
      time: '10:05:00',
      validatedAs: 'Sonolência N2',
      vehicleId: 'v1',
      driverId: 'd1',
      occurredAt: '23/05/06 10:05:00',
      location: 'Canoas / RS',
    },
  ],
};

/** Cenário occ-3: ocorrência já validada — abre direto na tratativa (Sonolência N2). */
const mockTratativaOcorrenciaOcc3: TratativaOcorrenciaData = {
  occurrenceId: 'occ-3',
  policyKind: 'veiculo',
  parameterTitle: 'IQP2A01 / SCN118',
  eventsCount: 1,
  severity: 'critical',

  policyName: 'Política alta criticidade',
  policyTypeLabel: 'Por veículo',
  eventTypeLabel: 'Sonolência N2',
  gravityLabel: 'Alto',

  trailLabel: 'Trilha por pontos',
  actions: mockTratativaOcorrencia.actions,
  contacts: mockTratativaOcorrencia.contacts,

  company: { name: 'Bracell' },

  driverOptions: [
    {
      id: 'd-occ3',
      name: 'Douglas Almeida',
      organizationGroups: ORG_GROUPS,
    },
  ],
  selectedDriverId: 'd-occ3',

  vehicleOptions: [
    {
      id: 'v-occ3',
      placa: 'IQP2A01',
      prefixo: 'SCN118',
      tipo: 'Caminhão madeireiro',
      marca: 'Volvo',
      modelo: 'FH 540 6x4',
      anoModelo: '2022 / 2022',
      combustivel: 'Diesel',
      organizationGroups: ORG_GROUPS,
    },
  ],
  selectedVehicleId: 'v-occ3',

  validatedEvents: [
    {
      id: 'val-occ3-1',
      sequence: 1,
      time: '09:18:00',
      validatedAs: 'Sonolência N2',
      vehicleId: 'v-occ3',
      driverId: 'd-occ3',
      occurredAt: '23/05/06 09:18:00',
      location: 'Canoas / RS',
    },
  ],
};

export function getTratativaOcorrenciaForOccurrence(occurrenceId: string): TratativaOcorrenciaData {
  if (occurrenceId === 'occ-3') return mockTratativaOcorrenciaOcc3;
  return { ...mockTratativaOcorrencia, occurrenceId };
}
