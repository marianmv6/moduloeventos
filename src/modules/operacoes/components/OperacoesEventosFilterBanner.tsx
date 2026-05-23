import React from 'react';
import type { OperacoesAdvancedFilters } from '../constants/operacoesFilterOptions';
import { getAppliedFilterEntries } from '../utils/operacoesFilterSummary';

interface OperacoesEventosFilterBannerProps {
  appliedFilters: OperacoesAdvancedFilters;
  onClear: () => void;
}

export const OperacoesEventosFilterBanner: React.FC<OperacoesEventosFilterBannerProps> = ({
  appliedFilters,
  onClear,
}) => {
  const entries = getAppliedFilterEntries(appliedFilters);
  if (entries.length === 0) return null;

  const countLabel =
    entries.length === 1 ? '1 filtro aplicado' : `${entries.length} filtros aplicados`;

  return (
    <div className="operacoes-eventos-filter-banner" role="status" aria-live="polite">
      <p className="operacoes-eventos-filter-banner__text">
        <span>{countLabel}, busca por </span>
        {entries.map((entry, index) => (
          <span key={entry.key}>
            {index > 0 && ', '}
            <span className="operacoes-eventos-filter-banner__param">{entry.paramLabel}</span>{' '}
            <strong className="operacoes-eventos-filter-banner__value">{entry.value}</strong>
          </span>
        ))}
        <span>.</span>
      </p>
      <button
        type="button"
        className="operacoes-eventos-filter-banner__clear"
        onClick={onClear}
      >
        Limpar filtros
        <span className="operacoes-eventos-filter-banner__clear-icon" aria-hidden>
          ×
        </span>
      </button>
    </div>
  );
};
