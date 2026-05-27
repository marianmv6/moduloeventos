import type {
  CentralOccurrence,
  CentralOccurrenceSummaryRow,
  CentralOccurrenceSeverity,
  CentralStatusSummary,
  CentralValidationEvent,
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
      validatedBy: 'Pedro',
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
      validationStatus: 'aguardando',
      validatedByAi: true,
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
    actions: { kind: 'none' },
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

/**
 * Soma de eventos tratados x pendentes considerando o conjunto de
 * ocorrências passadas (já filtradas).
 *
 * - Ocorrências do tipo "group" (com lista expandida) contribuem com
 *   um evento por item, classificando como "tratado" os de
 *   `validationStatus === 'validado'` e como "pendente" os demais
 *   (`aguardando`, `isCurrent` ou sem status).
 * - Ocorrências do tipo "summary" (linha única) contribuem com um
 *   evento pendente — ainda estão na fila da Central de Tratativas.
 *
 * Exemplo: filtrando as 3 ocorrências críticas (occ-1, occ-2, occ-3)
 * o total é 6 eventos, sendo 1 tratado.
 */
export function computeCentralTreatedSummary(
  entries: CentralOccurrenceListEntry[],
): { treated: number; pending: number } {
  let treated = 0;
  let pending = 0;
  entries.forEach((entry) => {
    if (entry.kind === 'group') {
      entry.occurrence.events.forEach((event) => {
        if (event.validationStatus === 'validado') treated += 1;
        else pending += 1;
      });
    } else {
      pending += 1;
    }
  });
  return { treated, pending };
}

export const mockCentralOccurrenceList = buildCentralOccurrenceList();

export const mockCentralStatusSummary = computeCentralStatusSummary(mockCentralOccurrenceList);

/** Ocorrência 1 — 3 eventos; o primeiro (mais antigo) já validado. */
export const mockCentralValidationEventsOcc1: CentralValidationEvent[] = [
  {
    id: 'val-1-oldest',
    time: '08:30:00',
    plate: 'ABC1D23',
    suggestedAlert: 'sonolencia-n1',
    validated: true,
  },
  {
    id: 'val-1-mid',
    time: '10:05:00',
    plate: 'ABC1D23',
    suggestedAlert: 'sonolencia-n2',
  },
  {
    id: 'val-1-current',
    time: '10:05:00',
    plate: 'ABC1D23',
    suggestedAlert: 'sonolencia-n2',
  },
];

/** Ocorrência 2 — 2 eventos para validação. */
export const mockCentralValidationEventsOcc2: CentralValidationEvent[] = [
  {
    id: 'val-2-older',
    time: '09:45:00',
    plate: 'FAL0M70',
    suggestedAlert: 'sonolencia-n2',
    fromAi: true,
  },
  {
    id: 'val-2-current',
    time: '09:58:00',
    plate: 'FAL0M70',
    suggestedAlert: 'sonolencia-n1',
    fromAi: true,
  },
];

/** @deprecated Use getCentralValidationEventsForOccurrence */
export const mockCentralValidationEvents = mockCentralValidationEventsOcc1;

/** Eventos do modal de validação conforme a ocorrência da Central. */
export function getCentralValidationEventsForOccurrence(
  occurrenceId: string,
): CentralValidationEvent[] {
  switch (occurrenceId) {
    case 'occ-1':
      return mockCentralValidationEventsOcc1;
    case 'occ-2':
      return mockCentralValidationEventsOcc2;
    default:
      return mockCentralValidationEventsOcc1;
  }
}

/** Nome do condutor no cabeçalho do modal de validação. */
export function getValidationDriverNameForOccurrence(occurrenceId: string): string {
  const occurrence = mockCentralOccurrenceGroups.find((o) => o.id === occurrenceId);
  return occurrence?.driverName ?? 'Condutor não identificado';
}

/** @deprecated Use getValidationDriverNameForOccurrence */
export const mockValidationDriverName = mockCentralOccurrenceExpanded.driverName;
