import React, { useMemo, useState } from 'react';
import { LevelTooltip } from '../../risk-rules/components/shared/LevelTooltip';
import { CentralControleFilterBanner } from '../components/CentralControleFilterBanner';
import { CentralControleFilterPanel } from '../components/CentralControleFilterPanel';
import { CentralControleToolbarSearch } from '../components/CentralControleToolbarSearch';
import { CentralValidacaoAlertasModal } from '../components/CentralValidacaoAlertasModal';
import { TratativaOcorrenciaModal } from '../components/TratativaOcorrenciaModal';
import {
  IconAnalystHeadset,
  IconOnlineStatus,
  IconOpenOccurrence,
  IconRowChevron,
  IconStatusValidated,
  IconStatusWaitingValidation,
} from '../components/CentralControleIcons';
import { IconFilterBars } from '../components/IconFilterBars';
import {
  EMPTY_CENTRAL_CONTROLE_FILTERS,
  type CentralControleFilters,
} from '../constants/centralControleFilterOptions';
import {
  buildCentralOccurrenceList,
  computeCentralStatusSummary,
  computeCentralTreatedSummary,
  mockCentralOccurrenceExpanded,
  mockCentralValidationEvents,
  mockValidationDriverName,
} from '../mocks/operacoesCentral.mock';
import { mockTratativaOcorrencia } from '../mocks/tratativaOcorrencia.mock';
import { matchesCentralControleFilters } from '../utils/centralControleFilterMatch';
import { countCentralAppliedFilters } from '../utils/centralControleFilterSummary';
import type {
  CentralEventValidationStatus,
  CentralOccurrence,
  CentralOccurrenceEvent,
  CentralOccurrenceSeverity,
  CentralOccurrenceSummaryRow,
  CentralStatusSummary,
} from '../types/operacoesCentral.types';

const STATUS_LABEL: Record<CentralEventValidationStatus, string> = {
  aguardando: 'Aguardando validação',
  validado: 'Validado',
};

const GRAVITY_SEGMENTS: {
  key: keyof CentralStatusSummary;
  label: string;
  modifier: 'critical' | 'high' | 'medium' | 'low';
}[] = [
  { key: 'critical', label: 'Crítico', modifier: 'critical' },
  { key: 'high', label: 'Alto', modifier: 'high' },
  { key: 'medium', label: 'Médio', modifier: 'medium' },
  { key: 'low', label: 'Baixo', modifier: 'low' },
];

function CentralStatusBar({
  summary,
  selectedFilter,
  onSelectFilter,
  onClearFilter,
}: {
  summary: CentralStatusSummary;
  selectedFilter: CentralOccurrenceSeverity | null;
  onSelectFilter: (severity: CentralOccurrenceSeverity) => void;
  onClearFilter: () => void;
}) {
  if (selectedFilter) {
    const active = GRAVITY_SEGMENTS.find((segment) => segment.modifier === selectedFilter);
    if (!active) return null;

    return (
      <div className="central-controle-status-bar central-controle-status-bar--filtered" role="group" aria-label="Filtro por criticidade">
        <div
          className={`central-controle-status-segment central-controle-status-segment--${selectedFilter} central-controle-status-segment--selected`}
          aria-label={`${active.label}: ${summary[active.key]}`}
        >
          <span className="central-controle-status-segment__value">{summary[active.key]}</span>
        </div>
        <button
          type="button"
          className="central-controle-status-filter-clear"
          onClick={onClearFilter}
          aria-label="Remover filtro"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M1.4 14L0 12.6L5.6 7L0 1.4L1.4 0L7 5.6L12.6 0L14 1.4L8.4 7L14 12.6L12.6 14L7 8.4L1.4 14Z"
              fill="#2F2F2F"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="central-controle-status-bar" role="group" aria-label="Resumo por criticidade">
      {GRAVITY_SEGMENTS.map(({ key, label, modifier }) => (
        <LevelTooltip
          key={key}
          text="Selecione para filtrar"
          topLayer
          nowrap
          className="central-controle-status-segment-wrap"
          style={{ flex: `${summary[key]} 1 0%` }}
        >
          <button
            type="button"
            className={`central-controle-status-segment central-controle-status-segment--${modifier}`}
            onClick={() => onSelectFilter(modifier)}
            aria-label={`${label}: ${summary[key]}`}
          >
            <span className="central-controle-status-segment__value">{summary[key]}</span>
            <span className="central-controle-status-segment__label">{label}</span>
          </button>
        </LevelTooltip>
      ))}
    </div>
  );
}

/** Barra de "Eventos tratados": mostra a proporção tratada vs. pendente, sem clique. */
function CentralTreatedBar({ treated, pending }: { treated: number; pending: number }) {
  const total = treated + pending;
  const treatedFlex = Math.max(treated, total > 0 ? 0.0001 : 0);
  const pendingFlex = Math.max(pending, total > 0 ? 0.0001 : 0);

  return (
    <div className="central-controle-treated-bar" role="group" aria-label="Eventos tratados">
      <div
        className="central-controle-treated-bar__segment central-controle-treated-bar__segment--treated"
        style={{ flex: `${treatedFlex} 1 0%` }}
        aria-label={`Tratados: ${treated}`}
      >
        <span className="central-controle-treated-bar__value">{treated}</span>
      </div>
      <div
        className="central-controle-treated-bar__segment central-controle-treated-bar__segment--pending"
        style={{ flex: `${pendingFlex} 1 0%` }}
        aria-label={`Pendentes: ${pending}`}
      >
        <span className="central-controle-treated-bar__value">{pending}</span>
      </div>
    </div>
  );
}

function pointsClass(severity: CentralOccurrenceSeverity, isCurrent: boolean): string {
  if (!isCurrent) return 'central-controle-points--muted';
  return `central-controle-points--${severity}`;
}

function PointsCell({
  points,
  severity,
  isCurrent,
}: {
  points: number;
  severity: CentralOccurrenceSeverity;
  /** true = linha principal; false = eventos abaixo na expansão; undefined = ocorrência colapsada */
  isCurrent?: boolean;
}) {
  const pointsClassName =
    isCurrent === undefined
      ? `central-controle-points central-controle-points--${severity}`
      : `central-controle-points ${pointsClass(severity, isCurrent)}`;

  return (
    <td className="central-controle-row__points">
      <LevelTooltip text="Pontos acumulados" topLayer>
        <span className={pointsClassName}>{points} pts</span>
      </LevelTooltip>
    </td>
  );
}

function EventRowActions({
  expanded,
  onToggle,
  analystName,
  showAnalyst,
  showMonitorAi,
  severity,
  onPlay,
}: {
  expanded: boolean;
  onToggle: () => void;
  analystName?: string;
  showAnalyst: boolean;
  showMonitorAi?: boolean;
  severity: CentralOccurrenceSeverity;
  onPlay?: () => void;
}) {
  return (
    <div className="central-controle-row__actions-inner">
      {showAnalyst && analystName ? (
        <LevelTooltip text={`Aberto por ${analystName}`} topLayer nowrap>
          <span
            className="central-controle-analyst-icon"
            aria-label={`Aberto por ${analystName}`}
          >
            <IconAnalystHeadset />
          </span>
        </LevelTooltip>
      ) : showMonitorAi ? (
        <LevelTooltip text="Validado pela IA" topLayer nowrap>
          <span className="central-validacao-ia-badge" aria-label="Validado pela IA">
            IA
          </span>
        </LevelTooltip>
      ) : null}
      <LevelTooltip text="Iniciar tratativa" topLayer nowrap>
        <button
          type="button"
          className="central-controle-open-btn"
          aria-label="Iniciar tratativa"
          onClick={onPlay}
        >
          <IconOpenOccurrence severity={severity} />
        </button>
      </LevelTooltip>
      <button
        type="button"
        className="central-controle-row__expand-btn"
        onClick={onToggle}
        aria-label={expanded ? 'Recolher' : 'Expandir'}
        aria-expanded={expanded}
      >
        <IconRowChevron expanded={expanded} />
      </button>
    </div>
  );
}

function SummaryRowActions({ row }: { row: CentralOccurrenceSummaryRow }) {
  return (
    <div className="central-controle-row__actions-inner">
      {row.actions.kind === 'opened-by-analyst' ? (
        <LevelTooltip text={`Aberto por ${row.actions.analystName}`} topLayer nowrap>
          <span
            className="central-controle-analyst-icon"
            aria-label={`Aberto por ${row.actions.analystName}`}
          >
            <IconAnalystHeadset />
          </span>
        </LevelTooltip>
      ) : row.actions.kind === 'with-monitor' && row.actions.monitorType === 'human' ? (
        <LevelTooltip text={`Aberto por ${row.actions.analystName}`} topLayer nowrap>
          <span
            className="central-controle-analyst-icon"
            aria-label={`Aberto por ${row.actions.analystName}`}
          >
            <IconAnalystHeadset />
          </span>
        </LevelTooltip>
      ) : row.actions.kind === 'with-monitor' && row.actions.monitorType === 'ai' ? (
        <LevelTooltip text="Validado pela IA" topLayer nowrap>
          <span className="central-validacao-ia-badge" aria-label="Validado pela IA">
            IA
          </span>
        </LevelTooltip>
      ) : null}
      <LevelTooltip text="Iniciar tratativa" topLayer nowrap>
        <button type="button" className="central-controle-open-btn" aria-label="Iniciar tratativa">
          <IconOpenOccurrence severity={row.severity} />
        </button>
      </LevelTooltip>
      <span className="central-controle-row__expand-spacer" aria-hidden />
    </div>
  );
}

function ExpandedOccurrenceGroup({
  occurrence,
  expanded,
  onToggle,
  onPlay,
}: {
  occurrence: CentralOccurrence;
  expanded: boolean;
  onToggle: () => void;
  onPlay: () => void;
}) {
  if (!expanded) {
    const current = occurrence.events[0];
    return (
      <tr className={`central-controle-row central-controle-row--occurrence central-controle-row--${occurrence.severity}`}>
        <PointsCell points={current.pointsSum} severity={occurrence.severity} isCurrent />
        <td className="central-controle-row__datetime">{current.datetime}</td>
        <td className="central-controle-row__event">
          <span className="central-controle-row__event-type">{current.eventType}</span>
          <span className="central-controle-row__event-points">, {current.eventPoints} pts</span>
        </td>
        <td className="central-controle-row__vehicle">
          {occurrence.placa} / {occurrence.prefixo}
        </td>
        <td className="central-controle-row__driver">{occurrence.driverName}</td>
        <td className="central-controle-row__actions">
          <EventRowActions
            expanded={false}
            onToggle={onToggle}
            analystName={occurrence.openedByAnalyst}
            showAnalyst={Boolean(occurrence.openedByAnalyst)}
            showMonitorAi={occurrence.validatedByAi}
            severity={occurrence.severity}
            onPlay={onPlay}
          />
        </td>
      </tr>
    );
  }

  return (
    <>
      {occurrence.events.map((event, index) => (
        <EventOccurrenceRow
          key={event.id}
          event={event}
          occurrence={occurrence}
          index={index}
          totalEvents={occurrence.events.length}
          onToggle={onToggle}
          onPlay={onPlay}
        />
      ))}
    </>
  );
}

function EventOccurrenceRow({
  event,
  occurrence,
  index,
  totalEvents,
  onToggle,
  onPlay,
}: {
  event: CentralOccurrenceEvent;
  occurrence: CentralOccurrence;
  index: number;
  totalEvents: number;
  onToggle: () => void;
  onPlay: () => void;
}) {
  const isCurrent = Boolean(event.isCurrent);

  return (
    <tr
      className={`central-controle-row central-controle-row--${occurrence.severity} central-controle-row--in-group${isCurrent ? ' central-controle-row--current-event' : ' central-controle-row--past-event'}${index === 0 ? ' central-controle-row--group-first' : ''}${index === totalEvents - 1 ? ' central-controle-row--group-last' : ''}`}
    >
      <PointsCell points={event.pointsSum} severity={occurrence.severity} isCurrent={isCurrent} />
      <td className="central-controle-row__datetime">{event.datetime}</td>
      <td className="central-controle-row__event">
        <span className="central-controle-row__event-type">{event.eventType}</span>
        <span className="central-controle-row__event-points">, {event.eventPoints} pts</span>
      </td>
      <td className="central-controle-row__vehicle">
        {isCurrent ? `${occurrence.placa} / ${occurrence.prefixo}` : ''}
      </td>
      <td className="central-controle-row__driver">
        {isCurrent ? occurrence.driverName : ''}
      </td>
      <td
        className={`central-controle-row__actions${!isCurrent && event.validationStatus ? ' central-controle-row__actions--status-only' : ''}`}
      >
        {isCurrent ? (
          <EventRowActions
            expanded
            onToggle={onToggle}
            analystName={occurrence.openedByAnalyst}
            showAnalyst={Boolean(occurrence.openedByAnalyst)}
            showMonitorAi={occurrence.validatedByAi}
            severity={occurrence.severity}
            onPlay={onPlay}
          />
        ) : event.validationStatus ? (
          (() => {
            const tooltipText =
              event.validationStatus === 'validado' && event.validatedBy
                ? `Validado por ${event.validatedBy}`
                : STATUS_LABEL[event.validationStatus];
            return (
              <div className="central-controle-row__actions-inner central-controle-row__actions-inner--status">
                {event.validatedByAi && (
                  <LevelTooltip text="Validado pela IA" topLayer nowrap>
                    <span className="central-validacao-ia-badge" aria-label="Validado pela IA">
                      IA
                    </span>
                  </LevelTooltip>
                )}
                <LevelTooltip text={tooltipText} topLayer nowrap>
                  <span
                    className={`central-controle-status-icon central-controle-status-icon--${event.validationStatus}`}
                    aria-label={tooltipText}
                  >
                    {event.validationStatus === 'aguardando' ? (
                      <IconStatusWaitingValidation />
                    ) : (
                      <IconStatusValidated />
                    )}
                  </span>
                </LevelTooltip>
                <span className="central-controle-row__expand-spacer" aria-hidden />
              </div>
            );
          })()
        ) : null}
      </td>
    </tr>
  );
}

function CollapsedSummaryRow({ row }: { row: CentralOccurrenceSummaryRow }) {
  return (
    <tr className={`central-controle-row central-controle-row--occurrence central-controle-row--${row.severity}`}>
      <PointsCell points={row.totalPoints} severity={row.severity} />
      <td className="central-controle-row__datetime">{row.datetime}</td>
      <td className="central-controle-row__event">
        <span className="central-controle-row__event-type">{row.eventType}</span>
        <span className="central-controle-row__event-points">, {row.eventPoints} pts</span>
      </td>
      <td className="central-controle-row__vehicle">
        {row.placa} / {row.prefixo}
      </td>
      <td className="central-controle-row__driver">{row.driverName}</td>
      <td className="central-controle-row__actions">
        <SummaryRowActions row={row} />
      </td>
    </tr>
  );
}

export const OperacoesCentralPage: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(mockCentralOccurrenceExpanded.id);
  const [severityFilter, setSeverityFilter] = useState<CentralOccurrenceSeverity | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<CentralControleFilters>(
    EMPTY_CENTRAL_CONTROLE_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<CentralControleFilters>(
    EMPTY_CENTRAL_CONTROLE_FILTERS,
  );
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [tratativaModalOpen, setTratativaModalOpen] = useState(false);

  const openValidationModal = () => setValidationModalOpen(true);
  const closeValidationModal = () => setValidationModalOpen(false);

  /** Substitui o modal de validação pelo modal de tratativa quando o
   *  analista finaliza a validação clicando em "Enviar e tratar". */
  const handleStartTratativa = () => {
    setValidationModalOpen(false);
    setTratativaModalOpen(true);
  };
  const closeTratativaModal = () => setTratativaModalOpen(false);

  const allOccurrences = useMemo(() => buildCentralOccurrenceList(), []);
  const appliedFilterCount = useMemo(
    () => countCentralAppliedFilters(appliedFilters),
    [appliedFilters],
  );
  const statusSummary = useMemo(
    () => computeCentralStatusSummary(allOccurrences),
    [allOccurrences],
  );

  const filteredOccurrences = useMemo(
    () =>
      allOccurrences.filter((entry) => {
        const severity =
          entry.kind === 'group' ? entry.occurrence.severity : entry.row.severity;
        if (severityFilter && severity !== severityFilter) return false;
        return matchesCentralControleFilters(entry, appliedFilters);
      }),
    [allOccurrences, severityFilter, appliedFilters],
  );

  /** Eventos tratados x pendentes baseados nas ocorrências filtradas:
   *  ao alterar o filtro de gravidade (ou os filtros avançados), a
   *  barra reflete a proporção apenas das ocorrências em questão. */
  const treatedSummary = useMemo(
    () => computeCentralTreatedSummary(filteredOccurrences),
    [filteredOccurrences],
  );

  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const toggleFilterPanel = () => {
    setFilterPanelOpen((open) => {
      const next = !open;
      if (next) setDraftFilters(appliedFilters);
      return next;
    });
  };

  const closeFilterPanel = () => setFilterPanelOpen(false);

  const handleFilterSearch = () => {
    setAppliedFilters(draftFilters);
    setFilterPanelOpen(false);
  };

  const handleClearFilters = () => {
    setAppliedFilters(EMPTY_CENTRAL_CONTROLE_FILTERS);
    setDraftFilters(EMPTY_CENTRAL_CONTROLE_FILTERS);
    setFilterPanelOpen(false);
  };

  return (
    <div className="operacoes-central-page page-layout content-body">
      <div className="content-toolbar top-bar central-controle-toolbar">
        <div className="content-toolbar-left central-controle-toolbar__title-wrap">
          <h1 className="body-page-title">Central de tratativas</h1>
        </div>
        <div className="content-toolbar-right central-controle-toolbar__actions">
          <CentralControleToolbarSearch />
          <div className="operacoes-view-toggle-wrap">
            <button
              type="button"
              className={`operacoes-view-toggle-btn${filterPanelOpen || appliedFilterCount > 0 ? ' is-active' : ''}`}
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

      <div className="page-content operacoes-central-content">
        {filterPanelOpen && (
          <CentralControleFilterPanel
            filters={draftFilters}
            onChange={setDraftFilters}
            onClose={closeFilterPanel}
            onSearch={handleFilterSearch}
          />
        )}

        {!filterPanelOpen && appliedFilterCount > 0 && (
          <CentralControleFilterBanner appliedFilters={appliedFilters} onClear={handleClearFilters} />
        )}

        <div className="central-controle-status-frame">
          <div className="central-controle-status-block">
            <div className="central-controle-status-block__head">
              <h2 className="central-controle-status-block__title">Ocorrências pendentes</h2>
            </div>
            <CentralStatusBar
              summary={statusSummary}
              selectedFilter={severityFilter}
              onSelectFilter={setSeverityFilter}
              onClearFilter={() => setSeverityFilter(null)}
            />
          </div>

          <div className="central-controle-status-block">
            <div className="central-controle-status-block__head">
              <h2 className="central-controle-status-block__title">Eventos tratados</h2>
              <span className="central-controle-status-block__percent">
                {(() => {
                  const total = treatedSummary.treated + treatedSummary.pending;
                  return total > 0
                    ? `${Math.round((treatedSummary.treated / total) * 100)}% concluído`
                    : '0% concluído';
                })()}
              </span>
            </div>
            <CentralTreatedBar treated={treatedSummary.treated} pending={treatedSummary.pending} />
          </div>
        </div>

        <section className="central-controle-ocorrencias" aria-label="Ocorrências">
          <div className="central-controle-ocorrencias__head">
            <h2 className="central-controle-ocorrencias__title">Ocorrências</h2>
            <LevelTooltip
              text="Atualizado há 2 minutos"
              topLayer
              nowrap
              className="central-controle-online-flag-tooltip"
            >
              <span
                className="central-controle-online-flag"
                aria-label="Online — atualizado há 2 minutos"
              >
                <IconOnlineStatus />
              </span>
            </LevelTooltip>
          </div>
          <div className="central-controle-table-wrap">
            <table className="list-table central-controle-table">
              <colgroup>
                <col className="central-controle-col-points" />
                <col className="central-controle-col-datetime" />
                <col className="central-controle-col-event" />
                <col className="central-controle-col-vehicle" />
                <col className="central-controle-col-driver" />
                <col className="central-controle-col-actions" />
              </colgroup>
              <tbody>
                {filteredOccurrences.map((entry) =>
                  entry.kind === 'group' ? (
                    <ExpandedOccurrenceGroup
                      key={entry.occurrence.id}
                      occurrence={entry.occurrence}
                      expanded={expandedId === entry.occurrence.id}
                      onToggle={() => toggleExpanded(entry.occurrence.id)}
                      onPlay={openValidationModal}
                    />
                  ) : (
                    <CollapsedSummaryRow key={entry.row.id} row={entry.row} />
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <CentralValidacaoAlertasModal
        open={validationModalOpen}
        events={mockCentralValidationEvents}
        driverName={mockValidationDriverName}
        onClose={closeValidationModal}
        onReturn={closeValidationModal}
        onConfirmClose={closeValidationModal}
        onConfirmNext={() => undefined}
        onConfirmTreat={handleStartTratativa}
      />

      <TratativaOcorrenciaModal
        open={tratativaModalOpen}
        data={mockTratativaOcorrencia}
        onClose={closeTratativaModal}
        onReturn={closeTratativaModal}
        onConclude={closeTratativaModal}
      />
    </div>
  );
};

export default OperacoesCentralPage;
