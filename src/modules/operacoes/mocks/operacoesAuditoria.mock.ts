import type { AuditoriaRow } from '../types/operacoesAuditoria.types';
import { mockTratativaAnexosAuditoria, mockTratativaAnexosPdfSample } from './tratativaAnexos.mock';
import { mockTratativaOcorrencia } from './tratativaOcorrencia.mock';

function formatCreatedAtIso(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatMockHistoryWhen(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    return `Hoje, ${time}`;
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Comentário inserido há ~25 min — ainda dentro da janela de 120 min (lixeira ativa). */
const recentCommentDate = new Date();
recentCommentDate.setMinutes(recentCommentDate.getMinutes() - 25);

/** Comentário do usuário logado há ~130 min — fora da janela (lixeira desabilitada). */
const expiredOwnCommentDate = new Date();
expiredOwnCommentDate.setMinutes(expiredOwnCommentDate.getMinutes() - 130);

/** Listagem mock da tela de Auditoria — algumas tratativas concluídas para
 *  exemplo. Reaproveita o snapshot existente de Tratativa, ajustando os
 *  metadados de cabeçalho (empresa, placa, motorista). */
export const mockAuditoriaRows: AuditoriaRow[] = [
  {
    id: 'aud-1',
    companyId: 'bracell',
    treatmentPoints: 100,
    treatedAtIso: '2026-05-23 11:20',
    treatedAt: '23/05/2026 11:20',
    treatedBy: 'Júlia Luz Campos',
    policyName: 'Política alta criticidade',
    monitoringOf: 'ABW5F22 / MBB122',
    trackingType: 'veiculo',
    occurrenceSnapshot: {
      ...mockTratativaOcorrencia,
      parameterTitle: 'ABW5F22 / MBB122',
      eventsCount: 4,
      occurrencePoints: 100,
      treatmentDurationLabel: '5:47',
      auditActionResolutions: {
        a1: 'nao_resolvido',
        a2: 'nao_resolvido',
        a3: 'resolvido',
      },
      attachments: mockTratativaAnexosAuditoria.slice(0, 1),
    },
    history: [
      {
        id: 'h-comment-recent',
        when: formatMockHistoryWhen(recentCommentDate),
        author: 'Júlia Luz Campos',
        description:
          'Comentário: Revisar evidências do contato com gestor na próxima auditoria.',
        createdAtIso: formatCreatedAtIso(recentCommentDate),
        isComment: true,
      },
      {
        id: 'h-comment-expired-own',
        when: formatMockHistoryWhen(expiredOwnCommentDate),
        author: 'Júlia Luz Campos',
        description:
          'Comentário: Validar novamente os anexos enviados após retorno do gestor.',
        createdAtIso: formatCreatedAtIso(expiredOwnCommentDate),
        isComment: true,
      },
      {
        id: 'h-comment-old',
        when: '21/05/2026 14:30',
        author: 'Marcos da Silva',
        description: 'Comentário: Tratativa revisada conforme procedimento interno.',
        isComment: true,
      },
      {
        id: 'h1',
        when: '23/05/2026 11:20',
        author: 'Júlia Luz Campos',
        description:
          'Ação "Contato gestor imediato" marcada como Não resolvido. Ação "Ligar para gestor" marcada como Não resolvido. Ação "Ligar para supervisores" marcada como Resolvido',
        treatmentDuration: '5:47',
      },
    ],
  },
  {
    id: 'aud-2',
    companyId: 'expresso-nepomuceno',
    treatmentPoints: 60,
    treatedAtIso: '2026-05-23 10:42',
    treatedAt: '23/05/2026 10:42',
    treatedBy: 'Marco Romero da Costa',
    policyName: 'Política de sonolência',
    monitoringOf: 'Carlos Fujimoto do Prado',
    trackingType: 'motorista',
    occurrenceSnapshot: {
      ...mockTratativaOcorrencia,
      parameterTitle: 'SLE3P56 / MBB121',
      eventsCount: 2,
      occurrencePoints: 60,
      selectedDriverId: 'd2',
      selectedVehicleId: 'v1',
      treatmentDurationLabel: '5:47',
      actions: mockTratativaOcorrencia.actions.slice(0, 2),
      auditActionResolutions: {
        a1: 'nao_resolvido',
        a2: 'resolvido',
      },
      attachments: [],
    },
    history: [
      {
        id: 'h1',
        when: '23/05/2026 10:42',
        author: 'Marco Romero da Costa',
        description:
          'Ação "Contato gestor imediato" marcada como Não resolvido. Ação "Ligar para gestor" marcada como Resolvido',
        treatmentDuration: '5:47',
      },
    ],
  },
  {
    id: 'aud-3',
    companyId: 'transpetro',
    treatmentPoints: 40,
    treatedAtIso: '2026-05-22 17:08',
    treatedAt: '22/05/2026 17:08',
    treatedBy: 'Ana Cristina dos Santos',
    policyName: 'Política padrão',
    monitoringOf: 'ANB1K52 / VOL204',
    trackingType: 'veiculo',
    occurrenceSnapshot: {
      ...mockTratativaOcorrencia,
      parameterTitle: 'ANB1K52 / VOL204',
      eventsCount: 3,
      occurrencePoints: 40,
      selectedDriverId: 'd3',
      selectedVehicleId: 'v3',
      treatmentDurationLabel: '5:47',
      auditActionResolutions: {
        a1: 'nao_resolvido',
        a2: 'nao_resolvido',
        a3: 'resolvido',
      },
      attachments: [...mockTratativaAnexosPdfSample, ...mockTratativaAnexosAuditoria.slice(0, 1)],
    },
    history: [
      {
        id: 'h1',
        when: '22/05/2026 17:08',
        author: 'Ana Cristina dos Santos',
        description:
          'Ação "Contato gestor imediato" marcada como Não resolvido. Ação "Ligar para gestor" marcada como Não resolvido. Ação "Ligar para supervisores" marcada como Resolvido. 1 anexo(s) adicionado(s)',
        treatmentDuration: '5:47',
      },
    ],
  },
];
