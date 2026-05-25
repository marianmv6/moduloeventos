import React, { useMemo, useState } from 'react';
import type { HistoryEntry, Policy } from '../../types/risk.types';
import { HistoryList } from '../history/HistoryList';

type DetailTab = 'detalhes' | 'historico';

interface PolicyDetailTabsProps {
  /** Política em edição (null quando é nova) */
  policy: Policy | null;
  /** Logs de histórico (filtrados pela política se já existir) */
  history: HistoryEntry[];
  /** Render do formulário de Detalhes (recebido do parent) */
  renderForm: () => React.ReactNode;
}

/**
 * Wrapper de abas para a tela de detalhes da Política de Tratativa.
 * - Aba "Detalhes": exibe o formulário completo.
 * - Aba "Histórico": exibe os logs daquela política (apenas em edição).
 *
 * Em criação (sem `policy.id`), a aba Histórico fica desativada.
 */
export const PolicyDetailTabs: React.FC<PolicyDetailTabsProps> = ({
  policy,
  history,
  renderForm,
}) => {
  const [active, setActive] = useState<DetailTab>('detalhes');
  const isCreating = !policy?.id;

  const policyHistory = useMemo(() => {
    if (!policy?.id) return [] as HistoryEntry[];
    return history.filter((h) => h.entityType === 'policy' && h.entityId === policy.id);
  }, [history, policy?.id]);

  return (
    <div className="policy-detail-tabs">
      <div className="risk-tabs policy-detail-tabs__tabs">
        <button
          type="button"
          className={`risk-tab ${active === 'detalhes' ? 'risk-tab--active' : ''}`}
          onClick={() => setActive('detalhes')}
        >
          Detalhes
        </button>
        <button
          type="button"
          className={`risk-tab ${active === 'historico' ? 'risk-tab--active' : ''}`}
          onClick={() => !isCreating && setActive('historico')}
          disabled={isCreating}
          aria-disabled={isCreating}
          title={isCreating ? 'Disponível após salvar a política' : undefined}
        >
          Histórico
        </button>
      </div>
      <div className="policy-detail-tabs__panel">
        {active === 'detalhes' && renderForm()}
        {active === 'historico' && !isCreating && <HistoryList entries={policyHistory} />}
      </div>
    </div>
  );
};

export default PolicyDetailTabs;
