import type { AuditoriaRow } from '../types/operacoesAuditoria.types';
import { mockTratativaOcorrencia } from './tratativaOcorrencia.mock';

/** Listagem mock da tela de Auditoria — três tratativas concluídas para
 *  exemplo. Reaproveita o snapshot existente de Tratativa, ajustando os
 *  metadados de cabeçalho (placa, motorista). */
export const mockAuditoriaRows: AuditoriaRow[] = [
  {
    id: 'aud-1',
    companyName: 'Bracell',
    treatedAt: '23/05/2026 11:20',
    treatedBy: 'Júlia Luz Campos',
    vehicleId: 'ABW5F22 / MBB122',
    driverName: 'João das Dores',
    occurrenceSnapshot: {
      ...mockTratativaOcorrencia,
      parameterTitle: 'ABW5F22 / MBB122',
      eventsCount: 4,
    },
    history: [
      {
        id: 'h1',
        when: 'Hoje, 11:20',
        author: 'Júlia Luz Campos',
        description: 'Ocorrência tratada',
      },
      {
        id: 'h2',
        when: 'Hoje, 11:15',
        author: 'Marcos da Silva',
        description: 'Evento Sonolência N1 - 25/05/06 11:12:03 validado',
      },
    ],
  },
  {
    id: 'aud-2',
    companyName: 'Bracell',
    treatedAt: '23/05/2026 10:42',
    treatedBy: 'Marco Romero da Costa',
    vehicleId: 'SLE3P56 / MBB121',
    driverName: 'Carlos Fujimoto do Prado',
    occurrenceSnapshot: {
      ...mockTratativaOcorrencia,
      parameterTitle: 'SLE3P56 / MBB121',
      eventsCount: 2,
      selectedDriverId: 'd2',
      selectedVehicleId: 'v1',
    },
    history: [
      {
        id: 'h1',
        when: 'Hoje, 10:42',
        author: 'Marco Romero da Costa',
        description: 'Ocorrência tratada',
      },
      {
        id: 'h2',
        when: 'Hoje, 10:30',
        author: 'Marco Romero da Costa',
        description: 'Evento Sonolência N2 - 25/05/06 10:28:11 validado',
      },
    ],
  },
  {
    id: 'aud-3',
    companyName: 'Bracell',
    treatedAt: '22/05/2026 17:08',
    treatedBy: 'Ana Cristina dos Santos',
    vehicleId: 'ANB1K52 / VOL204',
    driverName: 'Pedro Ramos de Paula',
    occurrenceSnapshot: {
      ...mockTratativaOcorrencia,
      parameterTitle: 'ANB1K52 / VOL204',
      eventsCount: 3,
      selectedDriverId: 'd3',
      selectedVehicleId: 'v3',
    },
    history: [
      {
        id: 'h1',
        when: 'Ontem, 17:08',
        author: 'Ana Cristina dos Santos',
        description: 'Ocorrência tratada',
      },
      {
        id: 'h2',
        when: 'Ontem, 16:55',
        author: 'Ana Cristina dos Santos',
        description: 'Evento Velocidade acima do permitido - 24/05/06 16:52:45 validado',
      },
    ],
  },
];
