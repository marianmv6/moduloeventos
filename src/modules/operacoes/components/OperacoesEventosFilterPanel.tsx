import React from 'react';
import { ModalSelect } from '../../risk-rules/components/shared/ModalSelect';
import type { OperacoesAdvancedFilters } from '../constants/operacoesFilterOptions';
import {
  getMotoristaFilterOptions,
  getPlacaFilterOptions,
  getTipoEventoFilterOptions,
} from '../constants/operacoesFilterOptions';

interface OperacoesEventosFilterPanelProps {
  filters: OperacoesAdvancedFilters;
  onChange: (filters: OperacoesAdvancedFilters) => void;
  onClose: () => void;
  onSearch: () => void;
}

export const OperacoesEventosFilterPanel: React.FC<OperacoesEventosFilterPanelProps> = ({
  filters,
  onChange,
  onClose,
  onSearch,
}) => {
  const placaOptions = getPlacaFilterOptions();
  const motoristaOptions = getMotoristaFilterOptions();
  const tipoEventoOptions = getTipoEventoFilterOptions();

  const patch = (partial: Partial<OperacoesAdvancedFilters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <section className="operacoes-eventos-filter-panel" aria-label="Filtros de eventos">
      <div className="operacoes-eventos-filter-panel__fields">
        <ModalSelect
          id="filtro-placa"
          className="modal-select--no-pill"
          mutedPlaceholder
          label="Placa/ prefixo"
          value={filters.placa}
          onChange={(placa) => patch({ placa })}
          options={placaOptions}
          placeholder="(Preencha ou selecione)"
        />
        <ModalSelect
          id="filtro-motorista"
          className="modal-select--no-pill"
          mutedPlaceholder
          label="Motorista"
          value={filters.motorista}
          onChange={(motorista) => patch({ motorista })}
          options={motoristaOptions}
          placeholder="(Preencha ou selecione)"
        />
        <ModalSelect
          id="filtro-tipo-evento"
          className="modal-select--no-pill"
          mutedPlaceholder
          label="Tipo de evento"
          value={filters.tipoEvento}
          onChange={(tipoEvento) => patch({ tipoEvento })}
          options={tipoEventoOptions}
          placeholder="(Preencha ou selecione)"
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
