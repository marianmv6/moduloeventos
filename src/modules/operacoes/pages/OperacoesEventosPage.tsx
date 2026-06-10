import React, { useEffect, useMemo, useRef, useState } from 'react';
import { OperacoesEventDetailModal } from '../components/OperacoesEventDetailModal';
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
import { SuccessToast } from '../../risk-rules/components/shared/SuccessToast';
import { TruncatedTextTooltip } from '../../risk-rules/components/shared/TruncatedTextTooltip';
import { OperacoesDateTimeCell } from '../components/OperacoesDateTimeCell';
import { mockOperacoesEvents } from '../mocks/operacoes.mock';
import type { OperacoesEventRow } from '../types/operacoes.types';
import { getEventApproximateLocation } from '../utils/operacoesEventDetail';

const EVENT_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos os eventos' },
  { value: 'sonolencia', label: 'Sonolência' },
  { value: 'velocidade', label: 'Velocidade' },
  { value: 'cerca', label: 'Cerca' },
] as const;

const ICON_BLUE = '#169EFF';

type EventFilterValue = (typeof EVENT_FILTER_OPTIONS)[number]['value'];

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

function IconMoreMenu({ selected = false }: { selected?: boolean }) {
  return (
    <svg width="29" height="29" viewBox="0 0 32 32" fill="none" aria-hidden>
      {selected && (
        <rect opacity="0.5" x="1" y="1" width="30" height="30" rx="7" stroke="#169EFF" strokeWidth="2" />
      )}
      <path
        d="M16 24C15.45 24 14.9792 23.8042 14.5875 23.4125C14.1958 23.0208 14 22.55 14 22C14 21.45 14.1958 20.9792 14.5875 20.5875C14.9792 20.1958 15.45 20 16 20C16.55 20 17.0208 20.1958 17.4125 20.5875C17.8042 20.9792 18 21.45 18 22C18 22.55 17.8042 23.0208 17.4125 23.4125C17.0208 23.8042 16.55 24 16 24ZM16 18C15.45 18 14.9792 17.8042 14.5875 17.4125C14.1958 17.0208 14 16.55 14 16C14 15.45 14.1958 14.9792 14.5875 14.5875C14.9792 14.1958 15.45 14 16 14C16.55 14 17.0208 14.1958 17.4125 14.5875C17.8042 14.9792 18 15.45 18 16C18 16.55 17.8042 17.0208 17.4125 17.4125C17.0208 17.8042 16.55 18 16 18ZM16 12C15.45 12 14.9792 11.8042 14.5875 11.4125C14.1958 11.0208 14 10.55 14 10C14 9.45 14.1958 8.97917 14.5875 8.5875C14.9792 8.19583 15.45 8 16 8C16.55 8 17.0208 8.19583 17.4125 8.5875C17.8042 8.97917 18 9.45 18 10C18 10.55 17.8042 11.0208 17.4125 11.4125C17.0208 11.8042 16.55 12 16 12Z"
        fill="#169EFF"
      />
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
  const [eventFilterOpen, setEventFilterOpen] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<OperacoesAdvancedFilters>(
    EMPTY_OPERACOES_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<OperacoesAdvancedFilters>(
    EMPTY_OPERACOES_FILTERS,
  );
  const [selectedEvent, setSelectedEvent] = useState<OperacoesEventRow | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [exportToastVisible, setExportToastVisible] = useState(false);
  const eventFilterRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    if (moreMenuOpen) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [moreMenuOpen]);

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
  const tableLayoutClass =
    showList && showMap ? ' operacoes-eventos-table--map-visible' : '';

  return (
    <div className="operacoes-eventos-page page-layout content-body">
      <div className="content-toolbar top-bar operacoes-eventos-toolbar">
        <div className="content-toolbar-left">
          <h1 className="body-page-title">Eventos</h1>
          <div className="type-filter-wrap" ref={eventFilterRef}>
            <button
              type="button"
              className="type-filter-trigger"
              onClick={() => setEventFilterOpen((v) => !v)}
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
          <div className="tratativa-contact__menu-wrap operacoes-eventos-more-menu" ref={moreMenuRef}>
            <button
              type="button"
              className={`tratativa-contact__more${moreMenuOpen ? ' tratativa-contact__more--open' : ''}`}
              aria-label="Mais opções"
              aria-expanded={moreMenuOpen}
              aria-haspopup="menu"
              onClick={() => setMoreMenuOpen((open) => !open)}
            >
              <IconMoreMenu selected={moreMenuOpen} />
            </button>
            {moreMenuOpen && (
              <div className="tratativa-contact__menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="tratativa-contact__menu-item"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    setExportToastVisible(true);
                  }}
                >
                  Exportar arquivo .xlsx
                </button>
              </div>
            )}
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
              <table className={`list-table operacoes-eventos-table${tableLayoutClass}`}>
                <colgroup>
                  <col className="operacoes-col-datetime" />
                  <col className="operacoes-col-evento" />
                  <col className="operacoes-col-placa" />
                  <col className="operacoes-col-motorista" />
                  <col className="operacoes-col-localizacao" />
                  <col className="operacoes-col-acoes" />
                </colgroup>
                <thead>
                  <tr>
                    <th className="operacoes-col-data">Data / hora</th>
                    <th className="operacoes-col-evento-header">Tipo de evento</th>
                    <th className="operacoes-col-data">Placa/ prefixo</th>
                    <th className="operacoes-col-data">Motorista</th>
                    <th className="operacoes-col-data">Localização aproximada</th>
                    <th className="list-cell-actions operacoes-col-acoes-header" aria-label="Ações" />
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.id}>
                      <OperacoesDateTimeCell occurredAtIso={row.occurredAt} seed={row.id} />
                      <td className="operacoes-col-evento-cell">
                        <TruncatedTextTooltip
                          text={row.eventType}
                          className="operacoes-event-type-label"
                        />
                      </td>
                      <td className="operacoes-col-data operacoes-placa">
                        <TruncatedTextTooltip text={row.placa} />
                      </td>
                      <td className="operacoes-col-data operacoes-col-motorista-cell">
                        <TruncatedTextTooltip text={row.driverName ?? '—'} />
                      </td>
                      <td className="operacoes-col-data operacoes-col-localizacao-cell">
                        <TruncatedTextTooltip text={getEventApproximateLocation(row.placa)} />
                      </td>
                      <td className="list-cell-actions">
                        <div className="list-actions">
                          <button
                            type="button"
                            className="btn btn-icon-action operacoes-view-btn"
                            aria-label="Visualizar"
                            title="Visualizar"
                            onClick={() => setSelectedEvent(row)}
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
      {selectedEvent && (
        <OperacoesEventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
      <SuccessToast
        message="Arquivo exportado com sucesso."
        visible={exportToastVisible}
        onClose={() => setExportToastVisible(false)}
      />
    </div>
  );
};
