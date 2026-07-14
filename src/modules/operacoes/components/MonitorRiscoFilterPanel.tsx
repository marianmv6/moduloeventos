import React, { useMemo } from 'react';
import { ModalSelect } from '../../risk-rules/components/shared/ModalSelect';
import type { MonitorRiscoFilters } from '../types/monitorRisco.types';
import {
  MONITOR_TEMPO_ATIVO_OPTIONS,
} from '../constants/monitorRiscoFilterOptions';
import {
  getMonitorMonitoramentoDeOptions,
  getMonitorPoliticaOptions,
  getPolicyNivelRiscoOptions,
} from '../utils/monitorRiscoPolicy';

export type MonitorRiscoFilterPanelMode = 'full' | 'politica';

interface MonitorRiscoFilterPanelProps {
  filters: MonitorRiscoFilters;
  onChange: (filters: MonitorRiscoFilters) => void;
  onClose: () => void;
  onSearch: () => void;
  mode?: MonitorRiscoFilterPanelMode;
}

export const MonitorRiscoFilterPanel: React.FC<MonitorRiscoFilterPanelProps> = ({
  filters,
  onChange,
  onClose,
  onSearch,
  mode = 'full',
}) => {
  const patch = (partial: Partial<MonitorRiscoFilters>) => {
    onChange({ ...filters, ...partial });
  };

  const politicaOptions = useMemo(() => getMonitorPoliticaOptions(), []);
  const nivelOptions = useMemo(
    () => getPolicyNivelRiscoOptions(filters.politicaId),
    [filters.politicaId],
  );
  const monitoramentoDeOptions = useMemo(() => getMonitorMonitoramentoDeOptions(), []);

  const handlePoliticaChange = (politicaId: string) => {
    onChange({
      ...filters,
      politicaId,
      niveisRisco: '',
      monitoramentoDe: '',
    });
  };

  const isPoliticaOnly = mode === 'politica';

  return (
    <section
      className="operacoes-eventos-filter-panel"
      aria-label={
        isPoliticaOnly
          ? 'Filtro de política do monitor de risco'
          : 'Filtros do monitor de risco'
      }
    >
      <div
        className={`operacoes-eventos-filter-panel__fields${
          isPoliticaOnly ? ' operacoes-eventos-filter-panel__fields--single' : ''
        }`}
      >
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
        {!isPoliticaOnly && (
          <>
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
              id="monitor-filtro-monitoramento"
              className="modal-select--no-pill"
              mutedPlaceholder
              label="Monitoramento de"
              value={filters.monitoramentoDe}
              onChange={(monitoramentoDe) => patch({ monitoramentoDe })}
              options={monitoramentoDeOptions}
              placeholder="(Preencha ou selecione)"
            />
            <ModalSelect
              id="monitor-filtro-tempo-ativo"
              className="modal-select--no-pill"
              mutedPlaceholder
              label="Período"
              value={filters.tempoAtivo}
              onChange={(tempoAtivo) => patch({ tempoAtivo })}
              options={MONITOR_TEMPO_ATIVO_OPTIONS}
              placeholder="(Preencha ou selecione)"
            />
          </>
        )}
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
