import type {
  CentralOccurrence,
  CentralOccurrenceSummaryRow,
  CentralOccurrenceSeverity,
  CentralStatusSummary,
} from '../types/operacoesCentral.types';

export type CentralOccurrenceListEntry =
  | { kind: 'group'; occurrence: CentralOccurrence }
  | { kind: 'summary'; row: CentralOccurrenceSummaryRow };

/** Ocorrência 1: Sonolência N2 — 3 eventos (100 pts) */
export const mockCentralOccurrenceExpanded: CentralOccurrence = {
  id: 'occ-1',
  severity: 'critical',
  totalPoints: 100,
  placa: 'ABC1D23',
  prefixo: 'MBB102',
  driverName: 'Paulo Roberto Moreira Pestana',
  openedByAnalyst: 'Júlia',
  events: [
    {
      id: 'ev-1a',
      pointsSum: 100,
      datetime: '23/05, 10:05',
      eventType: 'Sonolência N2',
      eventPoints: 40,
      isCurrent: true,
    },
    {
      id: 'ev-1b',
      pointsSum: 60,
      datetime: '23/05, 10:05',
      eventType: 'Sonolência N2',
      eventPoints: 40,
      validationStatus: 'aguardando',
    },
    {
      id: 'ev-1c',
      pointsSum: 20,
      datetime: '23/05, 08:30',
      eventType: 'Sonolência N1',
      eventPoints: 20,
      validationStatus: 'validado',
    },
  ],
};

/** Ocorrência 2: Sonolência N1 — 2 eventos (60 pts) */
export const mockCentralOccurrenceSonolenciaN1: CentralOccurrence = {
  id: 'occ-2',
  severity: 'critical',
  totalPoints: 60,
  placa: 'FAL0M70',
  prefixo: 'VOL204',
  driverName: 'José Raimundo de Oliveira',
  validatedByAi: true,
  events: [
    {
      id: 'ev-2a',
      pointsSum: 60,
      datetime: '23/05, 09:58',
      eventType: 'Sonolência N1',
      eventPoints: 20,
      isCurrent: true,
    },
    {
      id: 'ev-2b',
      pointsSum: 40,
      datetime: '23/05, 09:45',
      eventType: 'Sonolência N2',
      eventPoints: 40,
      validationStatus: 'validado',
    },
  ],
};

export const mockCentralOccurrenceGroups: CentralOccurrence[] = [
  mockCentralOccurrenceExpanded,
  mockCentralOccurrenceSonolenciaN1,
];

/** Ocorrências sem expansão (linha única) */
export const mockCentralOccurrenceSummaries: CentralOccurrenceSummaryRow[] = [
  {
    id: 'occ-3',
    totalPoints: 40,
    severity: 'critical',
    datetime: '23/05, 09:18',
    eventType: 'Sem cinto de segurança',
    eventPoints: 15,
    placa: 'IQP2A01',
    prefixo: 'SCN118',
    driverName: 'Douglas Almeida',
    actions: { kind: 'with-monitor', monitorType: 'ai' },
  },
  {
    id: 'occ-4',
    totalPoints: 35,
    severity: 'high',
    datetime: '23/05, 08:55',
    eventType: 'Entrada / saída de cerca',
    eventPoints: 10,
    placa: 'HQH5986',
    prefixo: 'MBR205',
    driverName: 'Juan Valencia',
    actions: { kind: 'with-monitor', monitorType: 'ai' },
  },
  {
    id: 'occ-5',
    totalPoints: 25,
    severity: 'high',
    datetime: '23/05, 08:30',
    eventType: 'Operação de carregamento',
    eventPoints: 5,
    placa: 'BKR5I96',
    prefixo: 'VW128',
    driverName: 'Rogério da Silva',
    actions: { kind: 'with-monitor', monitorType: 'human', analystName: 'Renato' },
  },
  {
    id: 'occ-6',
    totalPoints: 18,
    severity: 'medium',
    datetime: '23/05, 08:05',
    eventType: 'Velocidade acima do permitido',
    eventPoints: 8,
    placa: 'QWE4R55',
    prefixo: 'FRT089',
    driverName: 'Fernanda Costa Lima',
    actions: { kind: 'with-monitor', monitorType: 'ai' },
  },
  {
    id: 'occ-7',
    totalPoints: 12,
    severity: 'low',
    datetime: '23/05, 07:42',
    eventType: 'Parada não autorizada',
    eventPoints: 4,
    placa: 'TYU8H21',
    prefixo: 'SCN412',
    driverName: 'Marcos Antônio Pereira',
    actions: { kind: 'with-monitor', monitorType: 'ai' },
  },
];

function entryTotalPoints(entry: CentralOccurrenceListEntry): number {
  return entry.kind === 'group' ? entry.occurrence.totalPoints : entry.row.totalPoints;
}

function entrySeverity(entry: CentralOccurrenceListEntry): CentralOccurrenceSeverity {
  return entry.kind === 'group' ? entry.occurrence.severity : entry.row.severity;
}

/** Lista unificada ordenada por pontos acumulados (maior → menor) */
export function buildCentralOccurrenceList(): CentralOccurrenceListEntry[] {
  const entries: CentralOccurrenceListEntry[] = [
    ...mockCentralOccurrenceGroups.map((occurrence) => ({ kind: 'group' as const, occurrence })),
    ...mockCentralOccurrenceSummaries.map((row) => ({ kind: 'summary' as const, row })),
  ];

  return entries.sort((a, b) => entryTotalPoints(b) - entryTotalPoints(a));
}

/** Contagem de ocorrências por nível de gravidade */
export function computeCentralStatusSummary(
  entries: CentralOccurrenceListEntry[],
): CentralStatusSummary {
  return entries.reduce<CentralStatusSummary>(
    (acc, entry) => {
      acc[entrySeverity(entry)] += 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 },
  );
}

export const mockCentralOccurrenceList = buildCentralOccurrenceList();

export const mockCentralStatusSummary = computeCentralStatusSummary(mockCentralOccurrenceList);
