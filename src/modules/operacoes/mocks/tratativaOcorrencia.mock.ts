import type { TratativaOcorrenciaData } from '../types/tratativaOcorrencia.types';

/**
 * Mock usado para abrir a tela de "Tratativa da ocorrência" após o analista
 * confirmar todos os eventos no modal de validação. Reflete o cenário do
 * Figma: política por veículo, ABW5F22 / MBB122, 4 eventos.
 */
export const mockTratativaOcorrencia: TratativaOcorrenciaData = {
  occurrenceId: 'occ-1',
  policyKind: 'veiculo',
  parameterTitle: 'ABW5F22 / MBB122',
  eventsCount: 4,
  severity: 'critical',

  policyName: 'Política alta criticidade',
  policyTypeLabel: 'Por veículo',
  eventTypeLabel: 'Sonolência N1',
  gravityLabel: 'Alto',

  trailOptions: [
    { id: 'trilha-pontos', label: 'Trilha por pontos' },
    { id: 'trilha-nivel', label: 'Trilha por nível' },
    { id: 'trilha-customizada', label: 'Trilha customizada' },
  ],
  selectedTrailId: 'trilha-pontos',
  actions: [
    { id: 'a1', sequence: 1, title: 'Contato gestor imediato' },
    { id: 'a2', sequence: 2, title: 'Ligar para gestor' },
    { id: 'a3', sequence: 3, title: 'Ligar para supervisores' },
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
  driver: {
    name: 'Carlos Fujimoto do Prado',
    organizationGroups: [
      { id: 'g1', label: 'Branco' },
      { id: 'g2', label: '2 anos' },
      { id: 'g3', label: 'Centro-Oeste' },
      { id: 'g4', label: 'Rio Grande do Sul' },
    ],
  },
  vehicle: {
    placa: 'SLE3P56',
    prefixo: '201ABB',
    tipo: 'Caminhão madeireiro',
    marca: 'Mercedes-Benz',
    modelo: 'AXOR 3344 S 6x4 2P',
    anoModelo: '2023 / 2023',
    combustivel: 'Diesel',
    organizationGroups: [
      { id: 'g1', label: 'Branco' },
      { id: 'g2', label: '2 anos' },
      { id: 'g3', label: 'Centro-Oeste' },
      { id: 'g4', label: 'Rio Grande do Sul' },
    ],
  },
};
