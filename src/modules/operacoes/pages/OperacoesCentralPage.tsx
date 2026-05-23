import React, { useMemo, useState } from 'react';
import { LevelTooltip } from '../../risk-rules/components/shared/LevelTooltip';
import { CentralControleFilterBanner } from '../components/CentralControleFilterBanner';
import { CentralControleFilterPanel } from '../components/CentralControleFilterPanel';
import { CentralControleToolbarSearch } from '../components/CentralControleToolbarSearch';
import {
  IconAnalystHeadset,
  IconMonitorBot,
  IconOnlineStatus,
  IconOpenOccurrence,
  IconRowChevron,
} from '../components/CentralControleIcons';
import { IconFilterBars } from '../components/IconFilterBars';
import {
  EMPTY_CENTRAL_CONTROLE_FILTERS,
  type CentralControleFilters,
} from '../constants/centralControleFilterOptions';
import {
  buildCentralOccurrenceList,
  computeCentralStatusSummary,
  mockCentralOccurrenceExpanded,
} from '../mocks/operacoesCentral.mock';
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
        <button
          key={key}
          type="button"
          className={`central-controle-status-segment central-controle-status-segment--${modifier}`}
          style={{ flex: `${summary[key]} 1 0%` }}
          onClick={() => onSelectFilter(modifier)}
          aria-label={`${label}: ${summary[key]}`}
        >
          <span className="central-controle-status-segment__value">{summary[key]}</span>
          <span className="central-controle-status-segment__label">{label}</span>
        </button>
      ))}
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
}: {
  expanded: boolean;
  onToggle: () => void;
  analystName?: string;
  showAnalyst: boolean;
  showMonitorAi?: boolean;
  severity: CentralOccurrenceSeverity;
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
          <span className="central-controle-monitor-icon" aria-label="Validado pela IA">
            <IconMonitorBot />
          </span>
        </LevelTooltip>
      ) : null}
      <LevelTooltip text="Iniciar tratativa" topLayer nowrap>
        <button type="button" className="central-controle-open-btn" aria-label="Iniciar tratativa">
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
      ) : row.actions.monitorType === 'human' ? (
        <LevelTooltip text={`Aberto por ${row.actions.analystName}`} topLayer nowrap>
          <span
            className="central-controle-analyst-icon"
            aria-label={`Aberto por ${row.actions.analystName}`}
          >
            <IconAnalystHeadset />
          </span>
        </LevelTooltip>
      ) : (
        <LevelTooltip text="Validado pela IA" topLayer nowrap>
          <span className="central-controle-monitor-icon" aria-label="Validado pela IA">
            <IconMonitorBot />
          </span>
        </LevelTooltip>
      )}
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
}: {
  occurrence: CentralOccurrence;
  expanded: boolean;
  onToggle: () => void;
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
}: {
  event: CentralOccurrenceEvent;
  occurrence: CentralOccurrence;
  index: number;
  totalEvents: number;
  onToggle: () => void;
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
          />
        ) : event.validationStatus ? (
          <div className="central-controle-row__actions-inner central-controle-row__actions-inner--status">
            <span className={`central-controle-status central-controle-status--${event.validationStatus}`}>
              {STATUS_LABEL[event.validationStatus]}
            </span>
          </div>
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
          <h1 className="body-page-title">Central de controle</h1>
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

        <CentralStatusBar
          summary={statusSummary}
          selectedFilter={severityFilter}
          onSelectFilter={setSeverityFilter}
          onClearFilter={() => setSeverityFilter(null)}
        />

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
    </div>
  );
};

export default OperacoesCentralPage;
