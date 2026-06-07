import React from 'react';
import { ModalSelect } from '../../risk-rules/components/shared/ModalSelect';
import type { MonitorRiscoFilters } from '../types/monitorRisco.types';
import {
  MONITOR_COMPORTAMENTO_OPTIONS,
  MONITOR_NIVEL_RISCO_OPTIONS,
  MONITOR_POLITICA_OPTIONS,
} from '../constants/monitorRiscoFilterOptions';
import { CentralControlePeriodPicker } from './CentralControlePeriodPicker';

interface MonitorRiscoFilterPanelProps {
  filters: MonitorRiscoFilters;
  onChange: (filters: MonitorRiscoFilters) => void;
  onClose: () => void;
  onSearch: () => void;
}

export const MonitorRiscoFilterPanel: React.FC<MonitorRiscoFilterPanelProps> = ({
  filters,
  onChange,
  onClose,
  onSearch,
}) => {
  const patch = (partial: Partial<MonitorRiscoFilters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <section className="operacoes-eventos-filter-panel" aria-label="Filtros do monitor de risco">
      <div className="operacoes-eventos-filter-panel__fields">
        <ModalSelect
          id="monitor-filtro-politica"
          className="modal-select--no-pill"
          mutedPlaceholder
          label="Política"
          value={filters.politicaEscopo}
          onChange={(politicaEscopo) => patch({ politicaEscopo })}
          options={MONITOR_POLITICA_OPTIONS}
          placeholder="(Preencha ou selecione)"
        />
        <ModalSelect
          id="monitor-filtro-nivel"
          className="modal-select--no-pill"
          mutedPlaceholder
          label="Nível de risco"
          value={filters.niveisRisco}
          onChange={(niveisRisco) => patch({ niveisRisco })}
          options={MONITOR_NIVEL_RISCO_OPTIONS}
          placeholder="(Preencha ou selecione)"
          multiple
        />
        <ModalSelect
          id="monitor-filtro-comportamento"
          className="modal-select--no-pill"
          mutedPlaceholder
          label="Tipo de comportamento"
          value={filters.tiposComportamento}
          onChange={(tiposComportamento) => patch({ tiposComportamento })}
          options={MONITOR_COMPORTAMENTO_OPTIONS}
          placeholder="(Preencha ou selecione)"
          multiple
        />
        <CentralControlePeriodPicker
          id="monitor-filtro-periodo"
          label="Período"
          value={{
            periodoInicio: filters.periodoInicio,
            periodoFim: filters.periodoFim,
            periodoHoraInicio: filters.periodoHoraInicio,
            periodoHoraFim: filters.periodoHoraFim,
          }}
          onChange={(period) => patch(period)}
        />
      </div>
      <div className="operacoes-eventos-filter-panel__actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Fechar
        </button>
        <button type="button" className="btn btn-primary" onClick={onSearch}>
          Pesquisar
        </button>
      </div>
    </section>
  );
};
