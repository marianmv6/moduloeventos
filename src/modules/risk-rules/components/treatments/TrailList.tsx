import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import type { Trail } from '../../types/risk.types';
import { IconEdit, IconTrash } from '../shared/Icons';
import { AdvancedFilter, type AdvancedFilterField } from '../shared/AdvancedFilter';
import { getCompanyName } from '../../constants/companies';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

export interface TrailListHandle {
  toggleFilter: () => void;
  getAppliedFilterCount: () => number;
  isFilterOpen: () => boolean;
}

interface TrailListProps {
  trails: Trail[];
  onEdit?: (trail: Trail) => void;
  onDelete?: (trail: Trail) => void;
  onFilterStateChange?: (state: { open: boolean; appliedCount: number }) => void;
}

export const TrailList = forwardRef<TrailListHandle, TrailListProps>(function TrailList(
  { trails, onEdit, onDelete, onFilterStateChange },
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
      label: 'Nome',
      options: [...new Set(trails.map((t) => t.name))]
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

  const filteredTrails = useMemo(() => {
    const baseList = isClient
      ? trails.filter((t) => t.companyId === currentUser.companyId)
      : trails;
    return baseList.filter((t) => {
      if (filters.empresa && t.companyId !== filters.empresa) return false;
      if (filters.nome && t.name !== filters.nome) return false;
      if (filters.status) {
        const want = filters.status === 'ativo';
        if (t.active !== want) return false;
      }
      return true;
    });
  }, [trails, filters, isClient, currentUser.companyId]);

  return (
    <div className="policy-list treatment-list trail-list">
      <AdvancedFilter
        fields={filterFields}
        values={filters}
        onApply={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
        emptyValues={EMPTY_FILTERS}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        ariaLabel="Filtros de regras de tratativa"
      />
      <table className="list-table list-table--equal">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Nome</th>
            <th>Ações</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredTrails.map((t) => (
            <tr key={t.id}>
              <td>{getCompanyName(t.companyId)}</td>
              <td>{t.name}</td>
              <td>
                {t.steps.length} {t.steps.length === 1 ? 'ação' : 'ações'}
              </td>
              <td>
                <span className={`badge badge-rounded ${t.active ? 'badge-active' : 'badge-inactive'}`}>
                  {t.active ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="list-cell-actions">
                <div className="list-actions">
                  {onEdit && (
                    <button
                      type="button"
                      className="btn btn-icon-action"
                      onClick={() => onEdit(t)}
                      aria-label="Editar"
                    >
                      <IconEdit />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className="btn btn-icon-action ds-icon-danger"
                      onClick={() => onDelete(t)}
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

export default TrailList;
