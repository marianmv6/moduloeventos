import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import type { EmailTemplate } from '../../types/risk.types';
import { IconEdit, IconTrash } from '../shared/Icons';
import { DEFAULT_TEMPLATE_ID } from '../../constants/emailTemplateConstants';
import { AdvancedFilter, type AdvancedFilterField } from '../shared/AdvancedFilter';

export interface EmailTemplatesPanelHandle {
  toggleFilter: () => void;
  getAppliedFilterCount: () => number;
  isFilterOpen: () => boolean;
}

interface EmailTemplatesPanelProps {
  templates: EmailTemplate[];
  onNew: () => void;
  onEdit: (template: EmailTemplate) => void;
  onDelete: (template: EmailTemplate) => void;
  /** Oculta o CTA interno (usado quando o botão fica no cabeçalho da página) */
  hideToolbar?: boolean;
  onFilterStateChange?: (state: { open: boolean; appliedCount: number }) => void;
}

const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

export const EmailTemplatesPanel = forwardRef<EmailTemplatesPanelHandle, EmailTemplatesPanelProps>(
  function EmailTemplatesPanel(
    { templates, onNew, onEdit, onDelete, hideToolbar = false, onFilterStateChange },
    ref,
  ) {
    const EMPTY_FILTERS = { status: '' };
    const [filters, setFilters] = useState<{ status: string }>(EMPTY_FILTERS);
    const [filterOpen, setFilterOpen] = useState(false);

    const filterFields: AdvancedFilterField<{ status: string }>[] = [
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

    const filteredTemplates = useMemo(() => {
      return templates.filter((t) => {
        if (filters.status) {
          const want = filters.status === 'ativo';
          if (t.active !== want) return false;
        }
        return true;
      });
    }, [templates, filters]);

    return (
      <>
        {!hideToolbar && (
          <div className="drawer-toolbar drawer-toolbar--end">
            <button type="button" className="btn btn-primary" onClick={onNew}>
              Novo E-mail
            </button>
          </div>
        )}
        <AdvancedFilter
          fields={filterFields}
          values={filters}
          onApply={setFilters}
          onClear={() => setFilters(EMPTY_FILTERS)}
          emptyValues={EMPTY_FILTERS}
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          ariaLabel="Filtros de e-mail automático"
        />
        <div className="policy-list email-templates-table-wrap drawer-email-templates-table">
          <table className="list-table list-table--equal">
            <thead>
              <tr>
                <th>Título</th>
                <th>Descrição</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="list-empty">
                    Nenhum template de e-mail cadastrado.
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((t) => (
                  <tr key={t.id}>
                    <td>
                      {t.title || '—'}
                      {t.sourceType === 'imported' && (
                        <span className="email-templates-table__tag">HTML</span>
                      )}
                    </td>
                    <td className="drawer-email-templates-table__desc-cell">
                      {t.description ?? '—'}
                    </td>
                    <td>
                      <span
                        className={`badge badge-rounded ${t.active ? 'badge-active' : 'badge-inactive'}`}
                      >
                        {t.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="list-cell-actions">
                      <div className="list-actions">
                        <button
                          type="button"
                          className="btn btn-icon-action"
                          onClick={() => onEdit(t)}
                          aria-label="Editar"
                        >
                          <IconEdit />
                        </button>
                        {t.id !== DEFAULT_TEMPLATE_ID && !t.isDefault && (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  },
);

export default EmailTemplatesPanel;
