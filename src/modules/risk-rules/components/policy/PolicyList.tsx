import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import type { Policy, ScoreRule } from '../../types/risk.types';
import { EVENT_TYPE_LABELS } from '../../constants/eventTypes';
import { IconEdit, IconTrash } from '../shared/Icons';
import { AdvancedFilter, type AdvancedFilterField } from '../shared/AdvancedFilter';
import { getCompanyName } from '../../constants/companies';
import { useCurrentUser } from '../../hooks/useCurrentUser';

function getEventosText(policy: Policy, scores: ScoreRule[]): string {
  const eventIds = Object.keys(policy.configEventos ?? {});
  const types = new Set<string>();
  eventIds.forEach((id) => {
    const score = scores.find((s) => s.id === id);
    if (score) types.add(EVENT_TYPE_LABELS[score.eventType]);
  });
  return [...types].sort().join(', ') || '—';
}

const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

export interface PolicyListHandle {
  toggleFilter: () => void;
  getAppliedFilterCount: () => number;
  isFilterOpen: () => boolean;
}

interface PolicyListProps {
  policies: Policy[];
  scores: ScoreRule[];
  onEdit?: (policy: Policy) => void;
  onDelete?: (policy: Policy) => void;
  onToggleActive?: (policy: Policy) => void;
  onFilterStateChange?: (state: { open: boolean; appliedCount: number }) => void;
}

export const PolicyList = forwardRef<PolicyListHandle, PolicyListProps>(function PolicyList(
  { policies, scores, onEdit, onDelete, onToggleActive, onFilterStateChange },
  ref,
) {
  const currentUser = useCurrentUser();
  const isClient = currentUser.kind === 'client';

  const EMPTY_FILTERS = { empresa: '', nome: '', status: '' };
  const [filters, setFilters] = useState<{ empresa: string; nome: string; status: string }>(
    EMPTY_FILTERS,
  );
  const [filterOpen, setFilterOpen] = useState(false);

  const filterFields: AdvancedFilterField<{ empresa: string; nome: string; status: string }>[] = [
    { key: 'empresa', label: 'Empresa', options: currentUser.availableCompanies },
    {
      key: 'nome',
      label: 'Nome da política',
      options: [...new Set(policies.map((p) => p.name))]
        .sort()
        .map((n) => ({ value: n, label: n })),
    },
    { key: 'status', label: 'Status', options: STATUS_OPTIONS },
  ];

  const appliedCount = useMemo(
    () => Object.values(filters).filter((v) => v.trim() !== '').length,
    [filters],
  );

  React.useEffect(() => {
    onFilterStateChange?.({ open: filterOpen, appliedCount });
  }, [filterOpen, appliedCount, onFilterStateChange]);

  useImperativeHandle(
    ref,
    () => ({
      toggleFilter: () => setFilterOpen((v) => !v),
      getAppliedFilterCount: () => appliedCount,
      isFilterOpen: () => filterOpen,
    }),
    [appliedCount, filterOpen],
  );

  const filteredPolicies = useMemo(() => {
    const baseList = isClient
      ? policies.filter((p) => p.companyId === currentUser.companyId)
      : policies;
    return baseList.filter((p) => {
      if (filters.empresa && p.companyId !== filters.empresa) return false;
      if (filters.nome && p.name !== filters.nome) return false;
      if (filters.status) {
        const want = filters.status === 'ativo';
        if (p.active !== want) return false;
      }
      return true;
    });
  }, [policies, filters, isClient, currentUser.companyId]);

  return (
    <div className="policy-list">
      <AdvancedFilter
        fields={filterFields}
        values={filters}
        onApply={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
        emptyValues={EMPTY_FILTERS}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        ariaLabel="Filtros de políticas"
      />
      <table className="list-table list-table--equal">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Eventos</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredPolicies.map((policy) => (
            <tr key={policy.id}>
              <td>{getCompanyName(policy.companyId)}</td>
              <td>
                {policy.name}
                {policy.description && (
                  <span className="list-description">{policy.description}</span>
                )}
              </td>
              <td>{policy.tipoAcompanhamento === 'motorista' ? 'Por motorista' : 'Por veículo'}</td>
              <td>{getEventosText(policy, scores)}</td>
              <td>
                <span className={`badge badge-rounded ${policy.active ? 'badge-active' : 'badge-inactive'}`}>
                  {policy.active ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="list-cell-actions">
                <div className="list-actions">
                  {onEdit && (
                    <button
                      type="button"
                      className="btn btn-icon-action"
                      onClick={() => onEdit(policy)}
                      aria-label="Editar"
                    >
                      <IconEdit />
                    </button>
                  )}
                  {onToggleActive && (
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => onToggleActive(policy)}>
                      {policy.active ? 'Desativar' : 'Ativar'}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className="btn btn-icon-action ds-icon-danger"
                      onClick={() => onDelete(policy)}
                      aria-label="Excluir"
                    >
                      <IconTrash />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default PolicyList;
