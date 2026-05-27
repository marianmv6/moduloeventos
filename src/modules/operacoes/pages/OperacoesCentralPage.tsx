import React, { useMemo, useState } from 'react';
import { LevelTooltip } from '../../risk-rules/components/shared/LevelTooltip';
import { InfoTooltip } from '../../risk-rules/components/shared/InfoTooltip';
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
  getCentralValidationEventsForOccurrence,
  getValidationDriverNameForOccurrence,
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

/**
 * Conjunto de offsets UTC plausíveis para os horários exibidos. Usamos uma
 * seleção pseudo-aleatória estável (baseada em hash do id do evento) para
 * que cada linha mantenha o mesmo fuso entre renderizações, mas a lista
 * pareça heterogênea para o analista.
 */
const UTC_OFFSETS_HOURS = [-5, -4, -3, -2, 0, 1, 2, 3] as const;

/** Fuso da matriz (Creare/BR) — referência usada nas colunas da listagem. */
const MATRIX_UTC_OFFSET_HOURS = -3;

function pickUtcOffsetHours(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return UTC_OFFSETS_HOURS[hash % UTC_OFFSETS_HOURS.length];
}

function formatOffsetLabel(hours: number): string {
  const sign = hours >= 0 ? '+' : '-';
  return `${sign}${String(Math.abs(hours)).padStart(2, '0')}`;
}

/**
 * Converte um datetime no formato "DD/MM, HH:MM" (referencial da matriz,
 * UTC-3) para o fuso local indicado por `offsetHours`, gerando uma string
 * no padrão "DD/MM HH:MM (±OO)".
 *
 * A diferença em horas aplicada é `offsetHours - MATRIX_UTC_OFFSET_HOURS`,
 * ou seja, um veículo em UTC+0 (3 h à frente da matriz) que apareça como
 * "23/05 10:05" na coluna é convertido para "23/05 13:05 (+00)" na tooltip.
 */
function formatLocalTimeTooltip(datetime: string, seed: string): string {
  const offsetHours = pickUtcOffsetHours(seed);
  const diffMinutes = (offsetHours - MATRIX_UTC_OFFSET_HOURS) * 60;
  const offsetLabel = formatOffsetLabel(offsetHours);

  const match = datetime.match(/^(\d{1,2})\/(\d{1,2})[,\s]+(\d{1,2}):(\d{2})/);
  if (!match) {
    const cleaned = datetime.replace(',', '').replace(/\s+/g, ' ').trim();
    return `${cleaned} (${offsetLabel})`;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const hour = Number(match[3]);
  const minute = Number(match[4]);

  // Usamos um ano arbitrário (2025) só para tirar proveito do `Date` na
  // hora de propagar overflow/underflow de dia/mês de forma robusta.
  const base = new Date(Date.UTC(2025, month - 1, day, hour, minute));
  base.setUTCMinutes(base.getUTCMinutes() + diffMinutes);

  const dd = String(base.getUTCDate()).padStart(2, '0');
  const mm = String(base.getUTCMonth() + 1).padStart(2, '0');
  const hh = String(base.getUTCHours()).padStart(2, '0');
  const mi = String(base.getUTCMinutes()).padStart(2, '0');

  return `${dd}/${mm} ${hh}:${mi} (${offsetLabel})`;
}

function DateTimeCell({ value, seed }: { value: string; seed: string }) {
  return (
    <td className="central-controle-row__datetime">
      <LevelTooltip text={formatLocalTimeTooltip(value, seed)} topLayer nowrap>
        <span>{value}</span>
      </LevelTooltip>
    </td>
  );
}

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
    <div className="central-controle-treated-bar" role="group" aria-label="Eventos analisados">
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

/**
 * Célula "Tipo de evento" com o ícone de status (validado/aguardando) à
 * esquerda do nome. Centraliza a lógica de tooltip e ícone usada em
 * todas as variações de linha da tabela (current, past, ocorrência
 * colapsada e linhas-resumo).
 */
function EventTypeCell({
  status,
  eventType,
  eventPoints,
  validatedBy,
  validatedByAi,
}: {
  status: CentralEventValidationStatus;
  eventType: string;
  eventPoints: number;
  validatedBy?: string;
  validatedByAi?: boolean;
}) {
  const tooltipText =
    status === 'validado' && validatedBy
      ? `Validado por ${validatedBy}`
      : status === 'aguardando' && validatedByAi
        ? 'Validado pela IA'
        : STATUS_LABEL[status];

  /** IA substitui ampulheta enquanto aguarda; ícone validado substitui ambos. */
  const showWaitingIcon = status === 'aguardando' && !validatedByAi;
  const showValidatedIcon = status === 'validado';
  const showAiBadge = status === 'aguardando' && Boolean(validatedByAi);

  return (
    <td className="central-controle-row__event">
      <span className="central-controle-row__event-status-slot">
        {(showWaitingIcon || showValidatedIcon) && (
          <LevelTooltip text={tooltipText} topLayer nowrap>
            <span
              className={`central-controle-status-icon central-controle-status-icon--inline central-controle-status-icon--${status}`}
              aria-label={tooltipText}
            >
              {showWaitingIcon ? <IconStatusWaitingValidation /> : <IconStatusValidated />}
            </span>
          </LevelTooltip>
        )}
        {showAiBadge && (
          <LevelTooltip text="Validado pela IA" topLayer nowrap>
            <span
              className="central-validacao-ia-badge central-validacao-ia-badge--controle-table"
              aria-label="Validado pela IA"
            >
              IA
            </span>
          </LevelTooltip>
        )}
      </span>
      <span className="central-controle-row__event-type">{eventType}</span>
      <span className="central-controle-row__event-points">, {eventPoints} pts</span>
    </td>
  );
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
        <DateTimeCell value={current.datetime} seed={current.id} />
        {/* Ocorrencia colapsada exibe o evento atual (mais recente) — por
            regra de negocio ele sempre estara aguardando validacao. */}
        <EventTypeCell
          status="aguardando"
          eventType={current.eventType}
          eventPoints={current.eventPoints}
        />
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
  /** Status exibido como icone na coluna "Tipo de evento":
   *  - o evento atual (mais recente) SEMPRE esta aguardando validacao
   *    (regra de negocio: e ele que disparou a ocorrencia);
   *  - os demais eventos usam o `validationStatus` definido no mock. */
  const status: CentralEventValidationStatus = isCurrent
    ? 'aguardando'
    : event.validationStatus ?? 'aguardando';

  return (
    <tr
      className={`central-controle-row central-controle-row--${occurrence.severity} central-controle-row--in-group${isCurrent ? ' central-controle-row--current-event' : ' central-controle-row--past-event'}${index === 0 ? ' central-controle-row--group-first' : ''}${index === totalEvents - 1 ? ' central-controle-row--group-last' : ''}`}
    >
      <PointsCell points={event.pointsSum} severity={occurrence.severity} isCurrent={isCurrent} />
      <DateTimeCell value={event.datetime} seed={event.id} />
      <EventTypeCell
        status={status}
        eventType={event.eventType}
        eventPoints={event.eventPoints}
        validatedBy={event.validatedBy}
        validatedByAi={event.validatedByAi}
      />
      <td className="central-controle-row__vehicle">
        {isCurrent ? `${occurrence.placa} / ${occurrence.prefixo}` : ''}
      </td>
      <td className="central-controle-row__driver">
        {isCurrent ? occurrence.driverName : ''}
      </td>
      <td className="central-controle-row__actions">
        {isCurrent && (
          <EventRowActions
            expanded
            onToggle={onToggle}
            analystName={occurrence.openedByAnalyst}
            showAnalyst={Boolean(occurrence.openedByAnalyst)}
            showMonitorAi={occurrence.validatedByAi}
            severity={occurrence.severity}
            onPlay={onPlay}
          />
        )}
      </td>
    </tr>
  );
}

function CollapsedSummaryRow({ row }: { row: CentralOccurrenceSummaryRow }) {
  /** Linhas-resumo representam ocorrencias PENDENTES na Central de
   *  Tratativas — o "evento" exibido aqui e o ultimo/mais recente da
   *  ocorrencia, que por definicao ainda esta aguardando validacao. */
  return (
    <tr className={`central-controle-row central-controle-row--occurrence central-controle-row--${row.severity}`}>
      <PointsCell points={row.totalPoints} severity={row.severity} />
      <DateTimeCell value={row.datetime} seed={row.id} />
      <EventTypeCell
        status="aguardando"
        eventType={row.eventType}
        eventPoints={row.eventPoints}
      />
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
  const [validationOccurrenceId, setValidationOccurrenceId] = useState<string | null>(null);
  const [tratativaModalOpen, setTratativaModalOpen] = useState(false);
  const [treatmentDurationByOccurrence, setTreatmentDurationByOccurrence] = useState<
    Record<string, string>
  >({});

  const validationEvents = useMemo(
    () =>
      validationOccurrenceId
        ? getCentralValidationEventsForOccurrence(validationOccurrenceId)
        : [],
    [validationOccurrenceId],
  );

  const validationDriverName = useMemo(
    () =>
      validationOccurrenceId
        ? getValidationDriverNameForOccurrence(validationOccurrenceId)
        : '',
    [validationOccurrenceId],
  );

  const openValidationModal = (occurrenceId: string) => {
    setValidationOccurrenceId(occurrenceId);
    setValidationModalOpen(true);
  };
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
              <h2 className="central-controle-status-block__title">Eventos analisados</h2>
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
              <thead>
                <tr className="central-controle-table__head-row">
                  <th scope="col">Pontuação</th>
                  <th scope="col">
                    <span className="central-controle-th-with-info">
                      Data/hora
                      <InfoTooltip text="Data/hora do evento" />
                    </span>
                  </th>
                  <th scope="col">Tipo de evento</th>
                  <th scope="col">Placa / prefixo</th>
                  <th scope="col">Motorista</th>
                  <th scope="col" aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {filteredOccurrences.map((entry) =>
                  entry.kind === 'group' ? (
                    <ExpandedOccurrenceGroup
                      key={entry.occurrence.id}
                      occurrence={entry.occurrence}
                      expanded={expandedId === entry.occurrence.id}
                      onToggle={() => toggleExpanded(entry.occurrence.id)}
                      onPlay={() => openValidationModal(entry.occurrence.id)}
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
        events={validationEvents}
        driverName={validationDriverName}
        onClose={closeValidationModal}
        onReturn={closeValidationModal}
        onConfirmClose={closeValidationModal}
        onConfirmNext={() => undefined}
        onConfirmTreat={handleStartTratativa}
      />

      <TratativaOcorrenciaModal
        open={tratativaModalOpen}
        data={{
          ...mockTratativaOcorrencia,
          treatmentDurationLabel:
            treatmentDurationByOccurrence[mockTratativaOcorrencia.occurrenceId] ?? '0:00',
        }}
        onClose={closeTratativaModal}
        onReturn={closeTratativaModal}
        onConclude={(durationMs) => {
          const minutes = Math.floor(durationMs / 60000);
          const seconds = Math.floor((durationMs % 60000) / 1000);
          const label = `${minutes}:${String(seconds).padStart(2, '0')}`;
          setTreatmentDurationByOccurrence((prev) => ({
            ...prev,
            [mockTratativaOcorrencia.occurrenceId]: label,
          }));
          closeTratativaModal();
        }}
      />
    </div>
  );
};

export default OperacoesCentralPage;
