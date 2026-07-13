import React, { useMemo } from 'react';
import { ModalSelect } from '../../risk-rules/components/shared/ModalSelect';
import type { MonitorRiscoFilters } from '../types/monitorRisco.types';
import { CentralControlePeriodPicker } from './CentralControlePeriodPicker';
import {
  getMonitorPoliticaOptions,
  getPolicyComportamentoOptions,
  getPolicyNivelRiscoOptions,
} from '../utils/monitorRiscoPolicy';

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

  const politicaOptions = useMemo(() => getMonitorPoliticaOptions(), []);
  const nivelOptions = useMemo(
    () => getPolicyNivelRiscoOptions(filters.politicaId),
    [filters.politicaId],
  );
  const comportamentoOptions = useMemo(
    () => getPolicyComportamentoOptions(filters.politicaId),
    [filters.politicaId],
  );

  const handlePoliticaChange = (politicaId: string) => {
    onChange({
      ...filters,
      politicaId,
      niveisRisco: '',
      tiposComportamento: '',
    });
  };

  return (
    <section className="operacoes-eventos-filter-panel" aria-label="Filtros do monitor de risco">
      <div className="operacoes-eventos-filter-panel__fields">
        <ModalSelect
          id="monitor-filtro-politica"
          className="modal-select--no-pill"
          mutedPlaceholder
          label="Política de ocorrência"
          value={filters.politicaId}
          onChange={handlePoliticaChange}
          options={politicaOptions}
          placeholder="(Preencha ou selecione)"
        />
        <ModalSelect
          id="monitor-filtro-nivel"
          className="modal-select--no-pill"
          mutedPlaceholder
          label="Nível de risco"
          value={filters.niveisRisco}
          onChange={(niveisRisco) => patch({ niveisRisco })}
          options={nivelOptions}
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
          options={comportamentoOptions}
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
