import React, { useMemo, useState } from 'react';
import { TruncatedTextTooltip } from '../../risk-rules/components/shared/TruncatedTextTooltip';
import { InfoTooltip } from '../../risk-rules/components/shared/InfoTooltip';
import { IconView } from '../../risk-rules/components/shared/Icons';
import { TratativaOcorrenciaModal } from '../components/TratativaOcorrenciaModal';
import { MonitoringOfCell } from '../components/MonitoringOfCell';
import { mockAuditoriaRows } from '../mocks/operacoesAuditoria.mock';
import type { AuditoriaRow } from '../types/operacoesAuditoria.types';
import { resolveSeverityFromAccumulatedPoints } from '../utils/accumulatedPointsSeverity';
import { encodeMonitoringFilterValue } from '../utils/centralOccurrenceDisplay';
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
    if (
      filters.monitoramentoDe &&
      encodeMonitoringFilterValue(row.trackingType, row.monitoringOf) !== filters.monitoramentoDe
    ) {
      return false;
    }
    const rowDate = row.treatedAtIso.slice(0, 10);
    if (filters.periodoInicio && rowDate < filters.periodoInicio) return false;
    if (filters.periodoFim && rowDate > filters.periodoFim) return false;
    return true;
  });
}

const IconAnexoIndicator: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.2 9.19a2 2 0 1 1-2.83-2.83l8.49-8.48"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function getAttachmentCount(row: AuditoriaRow): number {
  return row.occurrenceSnapshot.attachments?.length ?? 0;
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
                <th className="operacoes-col-data operacoes-auditoria-col-points">
                  <span className="operacoes-auditoria-th-with-info">
                    Pontuação
                    <InfoTooltip text="Pontuação no momento da tratativa" />
                  </span>
                </th>
                <th className="operacoes-col-data">Data / hora da tratativa</th>
                <th className="operacoes-col-data">Tratado por</th>
                <th className="operacoes-col-data">Política de ocorrência</th>
                <th className="operacoes-col-data">Monitoramento de</th>
                <th className="operacoes-col-data operacoes-col-anexos">Anexos</th>
                <th className="list-cell-actions operacoes-col-acoes-header" aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const attachmentCount = getAttachmentCount(row);
                const pointsSeverity = resolveSeverityFromAccumulatedPoints(row.treatmentPoints);
                return (
                <tr key={row.id}>
                  <td className="operacoes-col-data operacoes-auditoria-col-points">
                    <span className={`operacoes-auditoria-points operacoes-auditoria-points--${pointsSeverity}`}>
                      {row.treatmentPoints} pts
                    </span>
                  </td>
                  <td className="operacoes-col-data">
                    <TruncatedTextTooltip text={row.treatedAt} />
                  </td>
                  <td className="operacoes-col-data">
                    <TruncatedTextTooltip text={row.treatedBy} />
                  </td>
                  <td className="operacoes-col-data">
                    <TruncatedTextTooltip text={row.policyName} />
                  </td>
                  <td className="operacoes-col-data">
                    <MonitoringOfCell
                      label={row.monitoringOf}
                      trackingType={row.trackingType}
                    />
                  </td>
                  <td className="operacoes-col-data operacoes-col-anexos">
                    {attachmentCount > 0 ? (
                      <span className="operacoes-auditoria-anexos" title={`${attachmentCount} anexo(s)`}>
                        <IconAnexoIndicator />
                        <span>{attachmentCount}</span>
                      </span>
                    ) : (
                      <span className="operacoes-auditoria-anexos operacoes-auditoria-anexos--empty">—</span>
                    )}
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
              );
              })}
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
