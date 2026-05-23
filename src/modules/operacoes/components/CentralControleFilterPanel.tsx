import React from 'react';
import { ModalSelect } from '../../risk-rules/components/shared/ModalSelect';
import type { CentralControleFilters } from '../constants/centralControleFilterOptions';
import {
  getCentralGravidadeOptions,
  getCentralMotoristaOptions,
  getCentralPlacaPrefixoOptions,
  getCentralPoliticaOptions,
  getCentralTipoEventoOptions,
} from '../constants/centralControleFilterOptions';
import { hasCentralDraftFilters } from '../utils/centralControleFilterSummary';
import { CentralControlePeriodPicker } from './CentralControlePeriodPicker';

interface CentralControleFilterPanelProps {
  filters: CentralControleFilters;
  onChange: (filters: CentralControleFilters) => void;
  onClose: () => void;
  onSearch: () => void;
}

export const CentralControleFilterPanel: React.FC<CentralControleFilterPanelProps> = ({
  filters,
  onChange,
  onClose,
  onSearch,
}) => {
  const canSearch = hasCentralDraftFilters(filters);

  const patch = (partial: Partial<CentralControleFilters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <section className="operacoes-eventos-filter-panel central-controle-filter-panel" aria-label="Filtros da central">
      <div className="operacoes-eventos-filter-panel__fields central-controle-filter-panel__fields">
        <div className="central-controle-filter-panel__row central-controle-filter-panel__row--primary">
          <ModalSelect
            id="central-filtro-tipo-evento"
            className="modal-select--no-pill"
            mutedPlaceholder
            label="Tipo de evento"
            value={filters.tipoEvento}
            onChange={(tipoEvento) => patch({ tipoEvento })}
            options={getCentralTipoEventoOptions()}
            placeholder="(Preencha ou selecione)"
          />
          <ModalSelect
            id="central-filtro-placa"
            className="modal-select--no-pill"
            mutedPlaceholder
            label="Placa ou prefixo"
            value={filters.placaPrefixo}
            onChange={(placaPrefixo) => patch({ placaPrefixo })}
            options={getCentralPlacaPrefixoOptions()}
            placeholder="(Preencha ou selecione)"
          />
          <ModalSelect
            id="central-filtro-motorista"
            className="modal-select--no-pill"
            mutedPlaceholder
            label="Motorista"
            value={filters.motorista}
            onChange={(motorista) => patch({ motorista })}
            options={getCentralMotoristaOptions()}
            placeholder="(Preencha ou selecione)"
          />
        </div>
        <div className="central-controle-filter-panel__row central-controle-filter-panel__row--secondary">
          <ModalSelect
            id="central-filtro-gravidade"
            className="modal-select--no-pill"
            mutedPlaceholder
            label="Nível de gravidade"
            value={filters.gravidade}
            onChange={(gravidade) => patch({ gravidade })}
            options={getCentralGravidadeOptions()}
            placeholder="(Preencha ou selecione)"
          />
          <ModalSelect
            id="central-filtro-politica"
            className="modal-select--no-pill"
            mutedPlaceholder
            label="Política de tratativa"
            value={filters.politicaTratativa}
            onChange={(politicaTratativa) => patch({ politicaTratativa })}
            options={getCentralPoliticaOptions()}
            placeholder="(Preencha ou selecione)"
          />
          <CentralControlePeriodPicker
            id="central-filtro-periodo"
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
      </div>
      <div className="operacoes-eventos-filter-panel__actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Fechar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSearch}
          disabled={!canSearch}
        >
          Pesquisar
        </button>
      </div>
    </section>
  );
};

export default CentralControleFilterPanel;
