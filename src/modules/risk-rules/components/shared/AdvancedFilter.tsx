import React, { useMemo, useState } from 'react';
import { ModalSelect, type ModalSelectOption } from './ModalSelect';
import {
  IconFilterBars,
  IconFilterClear,
} from '../../../operacoes/components/IconFilterBars';

/** Definição genérica de um campo de filtro avançado. */
export interface AdvancedFilterField<TValues extends Record<string, string>> {
  key: keyof TValues & string;
  label: string;
  options: ModalSelectOption[];
  placeholder?: string;
}

interface AdvancedFilterProps<TValues extends Record<string, string>> {
  fields: AdvancedFilterField<TValues>[];
  values: TValues;
  onApply: (values: TValues) => void;
  onClear: () => void;
  emptyValues: TValues;
  /** Estado externo de aberto/fechado (a página controla). */
  open: boolean;
  /** Callback para fechar (chamado ao clicar em "Fechar" ou ao aplicar). */
  onClose: () => void;
  ariaLabel?: string;
}

/**
 * Painel + banner de filtro avançado reutilizável (sem o botão de toggle).
 * O botão fica no cabeçalho da página, controlando `open` externamente,
 * para manter coerência com a tela de Eventos.
 */
export function AdvancedFilter<TValues extends Record<string, string>>({
  fields,
  values,
  onApply,
  onClear,
  emptyValues,
  open,
  onClose,
  ariaLabel = 'Filtros avançados',
}: AdvancedFilterProps<TValues>): React.ReactElement {
  const [draft, setDraft] = useState<TValues>(values);

  // Sincroniza o draft quando o painel abre, para refletir os valores aplicados.
  React.useEffect(() => {
    if (open) setDraft(values);
  }, [open, values]);

  const appliedEntries = useMemo(() => {
    return fields
      .map((field) => {
        const v = values[field.key];
        if (!v || !v.trim()) return null;
        const opt = field.options.find((o) => o.value === v);
        return { key: field.key, label: field.label.toLowerCase(), value: opt?.label ?? v };
      })
      .filter((e): e is { key: string; label: string; value: string } => e !== null);
  }, [fields, values]);

  const hasApplied = appliedEntries.length > 0;
  const hasDraft = useMemo(
    () => fields.some((f) => (draft[f.key] ?? '').trim() !== ''),
    [fields, draft],
  );

  const handleSearch = () => {
    onApply(draft);
    onClose();
  };

  const handleClear = () => {
    onClear();
    setDraft(emptyValues);
  };

  return (
    <>
      {open && (
        <section
          className="operacoes-eventos-filter-panel advanced-filter__panel"
          aria-label={ariaLabel}
        >
          <div className="operacoes-eventos-filter-panel__fields">
            {fields.map((field) => (
              <ModalSelect
                key={field.key}
                id={`advanced-filter-${field.key}`}
                className="modal-select--no-pill"
                mutedPlaceholder
                label={field.label}
                value={draft[field.key] ?? ''}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, [field.key]: value } as TValues))
                }
                options={field.options}
                placeholder={field.placeholder ?? '(Preencha ou selecione)'}
              />
            ))}
          </div>
          <div className="operacoes-eventos-filter-panel__actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Fechar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={!hasDraft}
            >
              Pesquisar
            </button>
          </div>
        </section>
      )}

      {hasApplied && !open && (
        <div className="operacoes-eventos-filter-banner" role="status" aria-live="polite">
          <p className="operacoes-eventos-filter-banner__text">
            <span>
              {appliedEntries.length === 1
                ? '1 filtro aplicado'
                : `${appliedEntries.length} filtros aplicados`}
              , busca por{' '}
            </span>
            {appliedEntries.map((entry, index) => (
              <span key={entry.key}>
                {index > 0 && ', '}
                <span className="operacoes-eventos-filter-banner__param">{entry.label}</span>{' '}
                <strong className="operacoes-eventos-filter-banner__value">{entry.value}</strong>
              </span>
            ))}
            <span>.</span>
          </p>
          <button
            type="button"
            className="operacoes-eventos-filter-banner__clear"
            onClick={handleClear}
          >
            Limpar filtros
            <IconFilterClear />
          </button>
        </div>
      )}
    </>
  );
}

/**
 * Botão de toggle do filtro avançado, projetado para ficar na toolbar do cabeçalho
 * (mesmo padrão visual da tela de Eventos: ícone de barras com badge de contagem).
 */
export function AdvancedFilterToggle({
  open,
  appliedCount,
  onToggle,
}: {
  open: boolean;
  appliedCount: number;
  onToggle: () => void;
}): React.ReactElement {
  const isHighlighted = open || appliedCount > 0;
  return (
    <div className="operacoes-view-toggle-wrap">
      <button
        type="button"
        className={`operacoes-view-toggle-btn${isHighlighted ? ' is-active' : ''}`}
        onClick={onToggle}
        aria-label={open ? 'Fechar filtros' : 'Abrir filtros'}
        aria-expanded={open}
        aria-pressed={open}
      >
        <IconFilterBars inverted={open} />
      </button>
    </div>
  );
}

export default AdvancedFilter;
