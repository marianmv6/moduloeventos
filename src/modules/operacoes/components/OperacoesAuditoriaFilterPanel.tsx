import React from 'react';
import { ModalSelect } from '../../risk-rules/components/shared/ModalSelect';
import {
  getAuditoriaMotoristaOptions,
  getAuditoriaPlacaOptions,
  getAuditoriaTratadoPorOptions,
  type AuditoriaAdvancedFilters,
} from '../constants/operacoesAuditoriaFilterOptions';
import { CentralControlePeriodPicker } from './CentralControlePeriodPicker';

interface OperacoesAuditoriaFilterPanelProps {
  filters: AuditoriaAdvancedFilters;
  onChange: (filters: AuditoriaAdvancedFilters) => void;
  onClose: () => void;
  onSearch: () => void;
}

export const OperacoesAuditoriaFilterPanel: React.FC<
  OperacoesAuditoriaFilterPanelProps
> = ({ filters, onChange, onClose, onSearch }) => {
  const tratadoPorOptions = getAuditoriaTratadoPorOptions();
  const placaOptions = getAuditoriaPlacaOptions();
  const motoristaOptions = getAuditoriaMotoristaOptions();

  const patch = (partial: Partial<AuditoriaAdvancedFilters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <section
      className="operacoes-eventos-filter-panel"
      aria-label="Filtros de auditoria"
    >
      <div className="operacoes-eventos-filter-panel__fields">
        <CentralControlePeriodPicker
          id="filtro-aud-periodo"
          label="Período"
          value={{
            periodoInicio: filters.periodoInicio,
            periodoFim: filters.periodoFim,
            periodoHoraInicio: filters.periodoHoraInicio,
            periodoHoraFim: filters.periodoHoraFim,
          }}
          onChange={(period) => patch(period)}
        />
        <ModalSelect
          id="filtro-aud-tratado-por"
          className="modal-select--no-pill"
          mutedPlaceholder
          label="Tratado por"
          value={filters.tratadoPor}
          onChange={(tratadoPor) => patch({ tratadoPor })}
          options={tratadoPorOptions}
          placeholder="(Preencha ou selecione)"
        />
        <ModalSelect
          id="filtro-aud-placa"
          className="modal-select--no-pill"
          mutedPlaceholder
          label="Placa/ prefixo"
          value={filters.placa}
          onChange={(placa) => patch({ placa })}
          options={placaOptions}
          placeholder="(Preencha ou selecione)"
        />
        <ModalSelect
          id="filtro-aud-motorista"
          className="modal-select--no-pill"
          mutedPlaceholder
          label="Motorista"
          value={filters.motorista}
          onChange={(motorista) => patch({ motorista })}
          options={motoristaOptions}
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
