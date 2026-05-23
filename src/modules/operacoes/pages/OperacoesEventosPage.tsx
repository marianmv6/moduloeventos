import React, { useMemo, useRef, useState } from 'react';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { IconFilterBars } from '../components/IconFilterBars';
import { OperacoesEventosFilterBanner } from '../components/OperacoesEventosFilterBanner';
import { OperacoesEventosFilterPanel } from '../components/OperacoesEventosFilterPanel';
import { countAppliedFilters } from '../utils/operacoesFilterSummary';
import { OperacoesEventosMap } from '../components/OperacoesEventosMap';
import {
  EMPTY_OPERACOES_FILTERS,
  type OperacoesAdvancedFilters,
} from '../constants/operacoesFilterOptions';
import { IconView } from '../../risk-rules/components/shared/Icons';
import { TruncatedTextTooltip } from '../../risk-rules/components/shared/TruncatedTextTooltip';
import { getIconCategoryForEventType } from '../constants/eventTypeIcons';
import { mockOperacoesEvents } from '../mocks/operacoes.mock';

const EVENT_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos os eventos' },
  { value: 'sonolencia', label: 'Sonolência' },
  { value: 'velocidade', label: 'Velocidade' },
  { value: 'cerca', label: 'Cerca' },
] as const;

const PERIOD_FILTER_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Últimos 7 dias' },
  { value: 'month', label: 'Últimos 30 dias' },
] as const;

const ICON_BLUE = '#169EFF';

type EventFilterValue = (typeof EVENT_FILTER_OPTIONS)[number]['value'];
type PeriodFilterValue = (typeof PERIOD_FILTER_OPTIONS)[number]['value'];

function IconListView() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="14" rx="2" stroke={ICON_BLUE} strokeWidth="1.75" />
      <rect x="7" y="8.5" width="2.5" height="2.5" rx="0.5" fill={ICON_BLUE} />
      <line x1="11" y1="9.75" x2="17" y2="9.75" stroke={ICON_BLUE} strokeWidth="1.75" strokeLinecap="round" />
      <rect x="7" y="13" width="2.5" height="2.5" rx="0.5" fill={ICON_BLUE} />
      <line x1="11" y1="14.25" x2="17" y2="14.25" stroke={ICON_BLUE} strokeWidth="1.75" strokeLinecap="round" />
      <rect x="7" y="17.5" width="2.5" height="2.5" rx="0.5" fill={ICON_BLUE} />
      <line x1="11" y1="18.75" x2="15" y2="18.75" stroke={ICON_BLUE} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconMapView() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z"
        stroke={ICON_BLUE}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <line x1="10" y1="4" x2="10" y2="20" stroke={ICON_BLUE} strokeWidth="1.75" />
      <line x1="16" y1="6" x2="16" y2="22" stroke={ICON_BLUE} strokeWidth="1.75" />
    </svg>
  );
}

function applyAdvancedFilters(
  rows: typeof mockOperacoesEvents,
  filters: OperacoesAdvancedFilters,
) {
  return rows.filter((row) => {
    if (filters.placa && row.placa !== filters.placa) return false;
    if (filters.motorista && row.driverName !== filters.motorista) return false;
    if (filters.tipoEvento && row.eventType !== filters.tipoEvento) return false;
    return true;
  });
}

export const OperacoesEventosPage: React.FC = () => {
  const [eventFilter, setEventFilter] = useState<EventFilterValue>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterValue>('today');
  const [eventFilterOpen, setEventFilterOpen] = useState(false);
  const [periodFilterOpen, setPeriodFilterOpen] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<OperacoesAdvancedFilters>(
    EMPTY_OPERACOES_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<OperacoesAdvancedFilters>(
    EMPTY_OPERACOES_FILTERS,
  );
  const eventFilterRef = useRef<HTMLDivElement>(null);
  const periodFilterRef = useRef<HTMLDivElement>(null);

  const filteredRows = useMemo(() => {
    let rows = mockOperacoesEvents;
    if (eventFilter !== 'all') {
      rows = rows.filter((row) => row.category === eventFilter);
    }
    rows = applyAdvancedFilters(rows, appliedFilters);
    return rows;
  }, [eventFilter, appliedFilters]);

  const uniqueTypes = useMemo(
    () => new Set(filteredRows.map((r) => r.eventType)).size,
    [filteredRows],
  );

  const eventFilterLabel =
    EVENT_FILTER_OPTIONS.find((o) => o.value === eventFilter)?.label ?? 'Todos os eventos';
  const periodFilterLabel =
    PERIOD_FILTER_OPTIONS.find((o) => o.value === periodFilter)?.label ?? 'Hoje';

  const formatScore = (score: number | null) => {
    if (score == null) return '—';
    return `+${score}`;
  };

  const toggleList = () => {
    setShowList((prev) => {
      const next = !prev;
      if (!next && !showMap) return true;
      return next;
    });
  };

  const toggleMap = () => {
    setShowMap((prev) => {
      const next = !prev;
      if (!next && !showList) return true;
      return next;
    });
  };

  const toggleFilterPanel = () => {
    setFilterPanelOpen((open) => {
      const next = !open;
      if (next) {
        setDraftFilters(appliedFilters);
        setEventFilterOpen(false);
        setPeriodFilterOpen(false);
      }
      return next;
    });
  };

  const closeFilterPanel = () => {
    setDraftFilters(appliedFilters);
    setFilterPanelOpen(false);
  };

  const appliedFilterCount = countAppliedFilters(appliedFilters);

  const handleFilterSearch = () => {
    setAppliedFilters(draftFilters);
    setFilterPanelOpen(false);
  };

  const handleClearFilters = () => {
    setAppliedFilters(EMPTY_OPERACOES_FILTERS);
    setDraftFilters(EMPTY_OPERACOES_FILTERS);
    setFilterPanelOpen(false);
  };

  const bodyLayoutClass = [
    'operacoes-eventos-body',
    showList && showMap ? 'operacoes-eventos-body--split' : '',
    showList && !showMap ? 'operacoes-eventos-body--list-only' : '',
    !showList && showMap ? 'operacoes-eventos-body--map-only' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const listTooltip = showList ? 'Ocultar lista' : 'Exibir lista';
  const mapTooltip = showMap ? 'Ocultar mapa' : 'Exibir mapa';
  /** Lista + mapa lado a lado: oculta Política de tratativa para não quebrar colunas */
  const showPoliticaColumn = !(showList && showMap);

  return (
    <div className="operacoes-eventos-page page-layout content-body">
      <div className="content-toolbar top-bar operacoes-eventos-toolbar">
        <div className="content-toolbar-left">
          <h1 className="body-page-title">Visão geral</h1>
          <div className="type-filter-wrap" ref={eventFilterRef}>
            <button
              type="button"
              className="type-filter-trigger"
              onClick={() => {
                setEventFilterOpen((v) => !v);
                setPeriodFilterOpen(false);
              }}
              aria-expanded={eventFilterOpen}
              aria-haspopup="listbox"
            >
              <span className="type-filter-label">{eventFilterLabel}</span>
              <span className="type-filter-chevron" aria-hidden>
                <svg width="8" height="6" viewBox="0 0 10 6" fill="none">
                  <path
                    d="M0 0 L5 6 L10 0"
                    stroke="#2F2F2F"
                    strokeWidth="1.5"
                    strokeLinecap="square"
                    fill="none"
                  />
                </svg>
              </span>
            </button>
            {eventFilterOpen && (
              <div className="type-filter-dropdown" role="listbox">
                {EVENT_FILTER_OPTIONS.map((opt) => (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={eventFilter === opt.value}
                    className="type-filter-option"
                    onClick={() => {
                      setEventFilter(opt.value);
                      setEventFilterOpen(false);
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="type-filter-wrap" ref={periodFilterRef}>
            <button
              type="button"
              className="type-filter-trigger"
              onClick={() => {
                setPeriodFilterOpen((v) => !v);
                setEventFilterOpen(false);
              }}
              aria-expanded={periodFilterOpen}
              aria-haspopup="listbox"
            >
              <span className="type-filter-label">{periodFilterLabel}</span>
              <span className="type-filter-chevron" aria-hidden>
                <svg width="8" height="6" viewBox="0 0 10 6" fill="none">
                  <path
                    d="M0 0 L5 6 L10 0"
                    stroke="#2F2F2F"
                    strokeWidth="1.5"
                    strokeLinecap="square"
                    fill="none"
                  />
                </svg>
              </span>
            </button>
            {periodFilterOpen && (
              <div className="type-filter-dropdown" role="listbox">
                {PERIOD_FILTER_OPTIONS.map((opt) => (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={periodFilter === opt.value}
                    className="type-filter-option"
                    onClick={() => {
                      setPeriodFilter(opt.value);
                      setPeriodFilterOpen(false);
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="content-toolbar-right operacoes-eventos-actions">
          <button type="button" className="operacoes-icon-btn operacoes-icon-btn--blue" aria-label="Buscar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke={ICON_BLUE} strokeWidth="2" />
              <line x1="16" y1="16" x2="21" y2="21" stroke={ICON_BLUE} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <span className="operacoes-toolbar-divider" aria-hidden />
          <div className="operacoes-view-toggles" role="group" aria-label="Modo de visualização">
            <div className="operacoes-view-toggle-wrap">
              <button
                type="button"
                className={`operacoes-view-toggle-btn${showList ? ' is-active' : ''}`}
                onClick={toggleList}
                aria-label={listTooltip}
                aria-pressed={showList}
              >
                <IconListView />
              </button>
              <span className="operacoes-view-tooltip" role="tooltip">
                {listTooltip}
              </span>
            </div>
            <div className="operacoes-view-toggle-wrap">
              <button
                type="button"
                className={`operacoes-view-toggle-btn${showMap ? ' is-active' : ''}`}
                onClick={toggleMap}
                aria-label={mapTooltip}
                aria-pressed={showMap}
              >
                <IconMapView />
              </button>
              <span className="operacoes-view-tooltip" role="tooltip">
                {mapTooltip}
              </span>
            </div>
          </div>
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

      {filterPanelOpen && (
        <OperacoesEventosFilterPanel
          filters={draftFilters}
          onChange={setDraftFilters}
          onClose={closeFilterPanel}
          onSearch={handleFilterSearch}
        />
      )}

      {!filterPanelOpen && appliedFilterCount > 0 && (
        <OperacoesEventosFilterBanner
          appliedFilters={appliedFilters}
          onClear={handleClearFilters}
        />
      )}

      <div className={bodyLayoutClass}>
        {showList && (
          <section className="operacoes-eventos-list-pane" aria-label="Lista de eventos">
            <p className="operacoes-eventos-summary">
              <strong>{filteredRows.length}</strong> eventos, <strong>{uniqueTypes}</strong> tipos
            </p>
            <div className="operacoes-eventos-table-wrap">
              <table
                className={`list-table operacoes-eventos-table${showPoliticaColumn ? '' : ' operacoes-eventos-table--map-visible'}`}
              >
                <colgroup>
                  <col className="operacoes-col-evento" />
                  <col className="operacoes-col-placa" />
                  <col className="operacoes-col-motorista" />
                  {showPoliticaColumn && <col className="operacoes-col-politica" />}
                  <col className="operacoes-col-pontuacao" />
                  <col className="operacoes-col-datetime" />
                  <col className="operacoes-col-acoes" />
                </colgroup>
                <thead>
                  <tr>
                    <th className="operacoes-col-evento-header">Tipo de evento</th>
                    <th className="operacoes-col-data">Placa/ prefixo</th>
                    <th className="operacoes-col-data">Motorista</th>
                    {showPoliticaColumn && (
                      <th className="operacoes-col-data">Política de tratativa</th>
                    )}
                    <th className="operacoes-col-data">Pontuação</th>
                    <th className="operacoes-col-data">Data / hora</th>
                    <th className="list-cell-actions operacoes-col-acoes-header" aria-label="Ações" />
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.id}>
                      <td className="operacoes-col-evento-cell">
                        <span className="operacoes-event-type-cell">
                          <EventTypeIcon
                            category={getIconCategoryForEventType(row.eventType, row.category)}
                          />
                          <TruncatedTextTooltip
                            text={row.eventType}
                            className="operacoes-event-type-label"
                          />
                        </span>
                      </td>
                      <td className="operacoes-col-data operacoes-placa">
                        <TruncatedTextTooltip text={row.placa} />
                      </td>
                      <td className="operacoes-col-data operacoes-col-motorista-cell">
                        <TruncatedTextTooltip text={row.driverName ?? '—'} />
                      </td>
                      {showPoliticaColumn && (
                        <td className="operacoes-col-data operacoes-col-politica-cell">
                          <TruncatedTextTooltip text={row.politicaTratativa ?? '—'} />
                        </td>
                      )}
                      <td className="operacoes-col-data operacoes-score">
                        <TruncatedTextTooltip text={formatScore(row.score)} />
                      </td>
                      <td className="operacoes-col-data operacoes-time">
                        <TruncatedTextTooltip text={row.relativeTime} />
                      </td>
                      <td className="list-cell-actions">
                        <div className="list-actions">
                          <button
                            type="button"
                            className="btn btn-icon-action operacoes-view-btn"
                            aria-label="Visualizar"
                            title="Visualizar"
                            onClick={() => {}}
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
        )}
        {showMap && (
          <section className="operacoes-eventos-map-pane" aria-label="Mapa de eventos">
            <OperacoesEventosMap />
          </section>
        )}
      </div>
    </div>
  );
};
