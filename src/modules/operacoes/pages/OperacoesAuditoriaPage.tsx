import React, { useMemo, useState } from 'react';
import { TruncatedTextTooltip } from '../../risk-rules/components/shared/TruncatedTextTooltip';
import { IconView } from '../../risk-rules/components/shared/Icons';
import { TratativaOcorrenciaModal } from '../components/TratativaOcorrenciaModal';
import { mockAuditoriaRows } from '../mocks/operacoesAuditoria.mock';
import type { AuditoriaRow } from '../types/operacoesAuditoria.types';
import { IconFilterBars } from '../components/IconFilterBars';
import { OperacoesAuditoriaFilterPanel } from '../components/OperacoesAuditoriaFilterPanel';
import { OperacoesAuditoriaFilterBanner } from '../components/OperacoesAuditoriaFilterBanner';
import {
  EMPTY_AUDITORIA_FILTERS,
  type AuditoriaAdvancedFilters,
} from '../constants/operacoesAuditoriaFilterOptions';
import { countAppliedAuditoriaFilters } from '../utils/operacoesAuditoriaFilterSummary';
/** Filtra uma linha de auditoria pelos campos do filtro avançado.
 *  O período compara apenas a parte da data (YYYY-MM-DD) extraída de
 *  `treatedAtIso` contra os valores do picker. */
function applyAuditoriaFilters(
  rows: AuditoriaRow[],
  filters: AuditoriaAdvancedFilters,
): AuditoriaRow[] {
  return rows.filter((row) => {
    if (filters.tratadoPor && row.treatedBy !== filters.tratadoPor) return false;
    if (filters.placa && row.vehicleId !== filters.placa) return false;
    if (filters.motorista && row.driverName !== filters.motorista) return false;
    const rowDate = row.treatedAtIso.slice(0, 10);
    if (filters.periodoInicio && rowDate < filters.periodoInicio) return false;
    if (filters.periodoFim && rowDate > filters.periodoFim) return false;
    return true;
  });
}

export const OperacoesAuditoriaPage: React.FC = () => {
  const [selected, setSelected] = useState<AuditoriaRow | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<AuditoriaAdvancedFilters>(
    EMPTY_AUDITORIA_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<AuditoriaAdvancedFilters>(
    EMPTY_AUDITORIA_FILTERS,
  );

  const filteredRows = useMemo(
    () => applyAuditoriaFilters(mockAuditoriaRows, appliedFilters),
    [appliedFilters],
  );

  const appliedFilterCount = countAppliedAuditoriaFilters(appliedFilters);

  const toggleFilterPanel = () => {
    setFilterPanelOpen((open) => {
      const next = !open;
      if (next) setDraftFilters(appliedFilters);
      return next;
    });
  };

  const closeFilterPanel = () => {
    setDraftFilters(appliedFilters);
    setFilterPanelOpen(false);
  };

  const handleFilterSearch = () => {
    setAppliedFilters(draftFilters);
    setFilterPanelOpen(false);
  };

  const handleClearFilters = () => {
    setAppliedFilters(EMPTY_AUDITORIA_FILTERS);
    setDraftFilters(EMPTY_AUDITORIA_FILTERS);
    setFilterPanelOpen(false);
  };

  return (
    <div className="operacoes-eventos-page page-layout content-body">
      <div className="content-toolbar top-bar operacoes-eventos-toolbar">
        <div className="content-toolbar-left">
          <h1 className="body-page-title">Auditoria</h1>
        </div>
        <div className="content-toolbar-right">
          <div className="operacoes-view-toggle-wrap">
            <button
              type="button"
              className={`operacoes-view-toggle-btn${
                filterPanelOpen || appliedFilterCount > 0 ? ' is-active' : ''
              }`}
              onClick={toggleFilterPanel}
              aria-label={filterPanelOpen ? 'Fechar filtros' : 'Abrir filtros'}
              aria-expanded={filterPanelOpen}
              aria-pressed={filterPanelOpen}
            >
              <IconFilterBars inverted={filterPanelOpen} />
            </button>
          </div>
        </div>
      </div>

      {filterPanelOpen && (
        <OperacoesAuditoriaFilterPanel
          filters={draftFilters}
          onChange={setDraftFilters}
          onClose={closeFilterPanel}
          onSearch={handleFilterSearch}
        />
      )}

      {!filterPanelOpen && appliedFilterCount > 0 && (
        <OperacoesAuditoriaFilterBanner
          appliedFilters={appliedFilters}
          onClear={handleClearFilters}
        />
      )}

      <section className="operacoes-eventos-list operacoes-auditoria-list">
        <div className="operacoes-eventos-table-wrap">
          <table className="list-table operacoes-eventos-table">
            <thead>
              <tr>
                <th className="operacoes-col-data">Data / hora da tratativa</th>
                <th className="operacoes-col-data">Tratado por</th>
                <th className="operacoes-col-data">Placa / prefixo</th>
                <th className="operacoes-col-data">Motorista</th>
                <th className="list-cell-actions operacoes-col-acoes-header" aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className="operacoes-col-data">
                    <TruncatedTextTooltip text={row.treatedAt} />
                  </td>
                  <td className="operacoes-col-data">
                    <TruncatedTextTooltip text={row.treatedBy} />
                  </td>
                  <td className="operacoes-col-data">
                    <TruncatedTextTooltip text={row.vehicleId} />
                  </td>
                  <td className="operacoes-col-data">
                    <TruncatedTextTooltip text={row.driverName} />
                  </td>
                  <td className="list-cell-actions">
                    <div className="list-actions">
                      <button
                        type="button"
                        className="btn btn-icon-action operacoes-view-btn"
                        aria-label="Visualizar"
                        title="Visualizar"
                        onClick={() => setSelected(row)}
                      >
                        <IconView />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <TratativaOcorrenciaModal
          open
          mode="auditoria"
          data={selected.occurrenceSnapshot}
          history={selected.history}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default OperacoesAuditoriaPage;
