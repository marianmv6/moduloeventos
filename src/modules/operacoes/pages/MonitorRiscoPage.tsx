import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TruncatedTextTooltip } from '../../risk-rules/components/shared/TruncatedTextTooltip';
import { LevelTooltip } from '../../risk-rules/components/shared/LevelTooltip';
import { IconView } from '../../risk-rules/components/shared/Icons';
import { IconFilterBars } from '../components/IconFilterBars';
import { IconIrisInsights } from '../components/IconIrisInsights';
import {
  IconRankingMotorista,
  IconRankingVeiculo,
} from '../components/MonitorRankingToggleIcons';
import { MonitorRiscoBehaviorEvolutionModal } from '../components/MonitorRiscoBehaviorEvolutionModal';
import { MonitorRiscoFilterPanel } from '../components/MonitorRiscoFilterPanel';
import { MonitorRiscoFilterBanner } from '../components/MonitorRiscoFilterBanner';
import { MonitoringOfCell } from '../components/MonitoringOfCell';
import { OperacoesDateTimeCell } from '../components/OperacoesDateTimeCell';
import { mockMonitorRiscoData } from '../mocks/monitorRisco.mock';
import type {
  MonitorRankingKind,
  MonitorRiscoData,
  MonitorRiscoDistribuicaoItem,
  MonitorRiscoFeedItem,
  MonitorRiscoLevel,
  MonitorRiscoListagemItem,
  MonitorRiscoPoliticaImpactItem,
  MonitorRiscoProjecao,
  MonitorRiscoScoreGeral,
  MonitorRiscoTabId,
  MonitorRiscoTendenciaPoint,
} from '../types/monitorRisco.types';
import {
  EMPTY_MONITOR_RISCO_FILTERS,
  MONITOR_RISCO_DISTRIBUTION_LABELS,
  MONITOR_RISCO_FEED_LEVEL_LABELS,
  MONITOR_RISCO_LEVEL_COLORS,
  MONITOR_RISCO_STATUS_BADGE_CLASS,
  MONITOR_RISCO_STATUS_LABELS,
} from '../constants/monitorRiscoFilterOptions';
import type { MonitorRiscoFilters } from '../types/monitorRisco.types';
import {
  applyMonitorRiscoFilters,
  countAppliedMonitorRiscoFilters,
} from '../utils/monitorRiscoFilterSummary';
import {
  applyPolicyScope,
  getPolicyById,
  getPolicyRankingKind,
} from '../utils/monitorRiscoPolicy';
import { resolveSeverityFromAccumulatedPoints } from '../utils/accumulatedPointsSeverity';

const SCORE_SCALE_MARKERS = [0, 50, 80, 100] as const;

const POLITICA_BAR_COLORS = ['#169EFF', '#F2994A'] as const;

function resolveRiskLevelFromPercent(percent: number): MonitorRiscoLevel {
  if (percent >= 80) return 'alto';
  if (percent >= 50) return 'medio';
  return 'baixo';
}

function IconMonitorAlert() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 2.5L14 13.5H2L8 2.5Z"
        stroke="#F2994A"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 6.5V9" stroke="#F2994A" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11.25" r="0.75" fill="#F2994A" />
    </svg>
  );
}

function ScoreGeralOverview({ scoreGeral }: { scoreGeral: MonitorRiscoScoreGeral }) {
  const scorePercent = Math.round((scoreGeral.value / scoreGeral.maxScore) * 100);
  const unfilledPercent = 100 - scorePercent;

  return (
    <div className="monitor-risco-score-overview">
      <div className="monitor-risco-score-overview__header">
        <h2 className="monitor-risco-score-overview__title">Score geral da operação</h2>
        <p className="monitor-risco-score-overview__risk-line">
          <span className="monitor-risco-score-overview__percent">{scorePercent}%</span>
          <span className="monitor-risco-score-overview__risk-text">nível de risco atual</span>
        </p>
        <div className="monitor-risco-score-overview__meta">
          <span className="monitor-risco-score-overview__points-generated">
            {scoreGeral.value} pontos até o momento
          </span>
          <p className="monitor-risco-score__subtitle">{scoreGeral.subtitle}</p>
        </div>
      </div>
      <div className="monitor-risco-score-overview__meter-block">
        <div className="monitor-risco-score-overview__meter" aria-hidden>
          <div className="monitor-risco-score-overview__meter-gradient" />
          <div
            className="monitor-risco-score-overview__meter-unfilled"
            style={{ width: `${unfilledPercent}%` }}
          />
        </div>
        <div className="monitor-risco-score-overview__scale" aria-hidden>
          {SCORE_SCALE_MARKERS.map((marker) => (
            <span
              key={marker}
              className="monitor-risco-score-overview__scale-mark"
              style={{ left: `${marker}%` }}
            >
              {marker}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DistribuicaoNivelCard({ items }: { items: MonitorRiscoDistribuicaoItem[] }) {
  return (
    <section className="monitor-risco-card monitor-risco-card--distribution">
      <div className="monitor-risco-card__header">
        <h2 className="monitor-risco-card__title">Distribuição por nível de risco</h2>
        <p className="monitor-risco-card__desc">Volume e priorização macro da operação</p>
      </div>
      <DonutChart items={items} />
    </section>
  );
}

function TendenciaCombinadaSection({
  projecao,
  points,
}: {
  projecao: MonitorRiscoProjecao;
  points: MonitorRiscoTendenciaPoint[];
}) {
  const projectedLevel = resolveRiskLevelFromPercent(projecao.projectedPercent);

  return (
    <section className="monitor-risco-card monitor-risco-card--trend">
      <div className="monitor-risco-trend-combined">
        <div className="monitor-risco-card__header">
          <h2 className="monitor-risco-card__title">Tendência de risco</h2>
          <p className="monitor-risco-card__desc">
            Projeção para as próximas 2 h e evolução da operação no período
          </p>
        </div>
        <div className="monitor-risco-trend-combined__summary">
          <div className="monitor-risco-trend-combined__projecao">
            <p className="monitor-risco-projecao__value">
              <strong
                className={`monitor-risco-projecao__percent monitor-risco-projecao__percent--${projectedLevel}`}
              >
                {projecao.projectedPercent}%
              </strong>{' '}
              {projecao.projectedLabel}
            </p>
            <div className="monitor-risco-projecao__alert" role="note">
              <IconMonitorAlert />
              <p className="monitor-risco-projecao__alert-text">
                Atenção: O ritmo atual indica um aumento de{' '}
                <strong>+{projecao.alertIncreasePercent}%</strong> no risco nas próximas 2 horas.
              </p>
            </div>
          </div>
        </div>
        <TendenciaChart points={points} />
      </div>
    </section>
  );
}

function PoliticasImpactCard({ items }: { items: MonitorRiscoPoliticaImpactItem[] }) {
  return (
    <section className="monitor-risco-card monitor-risco-card--politicas">
      <div className="monitor-risco-card__header">
        <h2 className="monitor-risco-card__title">Distribuição por políticas</h2>
        <p className="monitor-risco-card__desc">Impacto no risco total</p>
      </div>
      <ul className="monitor-risco-politicas-impact">
        {items.map((item, index) => (
          <li key={item.id} className="monitor-risco-politicas-impact__item">
            <div className="monitor-risco-politicas-impact__row">
              <span className="monitor-risco-politicas-impact__label">{item.label}</span>
              <span className="monitor-risco-politicas-impact__percent">{item.percent}%</span>
            </div>
            <div className="monitor-risco-politicas-impact__bar" aria-hidden>
              <div
                className="monitor-risco-politicas-impact__bar-fill"
                style={{
                  width: `${item.percent}%`,
                  backgroundColor: POLITICA_BAR_COLORS[index % POLITICA_BAR_COLORS.length],
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
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


function DonutChart({ items }: { items: MonitorRiscoDistribuicaoItem[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const size = 140;
  const stroke = 20;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="monitor-risco-distribution-layout">
      <div className="monitor-risco-donut-wrap">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="monitor-risco-donut"
          role="img"
          aria-label="Distribuição por nível de risco"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#ECECEF"
            strokeWidth={stroke}
          />
          {items.map((item) => {
            const segment = total > 0 ? (item.count / total) * circumference : 0;
            const dashArray = `${segment} ${circumference - segment}`;
            const dashOffset = -offset;
            offset += segment;
            return (
              <circle
                key={item.level}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={MONITOR_RISCO_LEVEL_COLORS[item.level]}
                strokeWidth={stroke}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
          })}
        </svg>
        <div className="monitor-risco-donut__center">
          <strong>{total}</strong>
          <span>ocorrências</span>
        </div>
      </div>
      <ul className="monitor-risco-legend">
        {items.map((item) => (
          <li key={item.level} className="monitor-risco-legend__item">
            <span
              className="monitor-risco-legend__swatch"
              style={{ backgroundColor: MONITOR_RISCO_LEVEL_COLORS[item.level] }}
            />
            <span className="monitor-risco-legend__text">
              {item.count}{' '}
              {MONITOR_RISCO_DISTRIBUTION_LABELS[item.level] ?? item.label}{' '}
              <span className="monitor-risco-legend__muted">({item.percent}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TendenciaChart({ points }: { points: MonitorRiscoTendenciaPoint[] }) {
  const width = 462;
  const height = 97;
  const pad = { top: 0, right: 0, bottom: 0, left: 0 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxScore = Math.max(...points.flatMap((p) => [p.score, p.afterCentralActions ?? 0]), 1);
  const xStep = points.length > 1 ? innerW / (points.length - 1) : innerW;

  const toPath = (key: 'score' | 'afterCentralActions') => {
    const validPoints = points.filter((p) => p[key] != null);
    return validPoints
      .map((point, index) => {
        const x = pad.left + index * xStep;
        const y = pad.top + innerH - ((point[key] as number) / maxScore) * innerH;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  return (
    <div className="monitor-risco-chart monitor-risco-chart--trend">
      <div className="monitor-risco-trend-chart">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="monitor-risco-trend-svg"
          aria-hidden
        >
          {[0, 0.5, 1].map((ratio) => {
            const y = pad.top + innerH - ratio * innerH;
            return (
              <line
                key={ratio}
                x1={pad.left}
                y1={y}
                x2={width - pad.right}
                y2={y}
                className="monitor-risco-trend-svg__grid"
              />
            );
          })}
          <path d={toPath('score')} className="monitor-risco-trend-svg__line monitor-risco-trend-svg__line--raw" />
          <path
            d={toPath('afterCentralActions')}
            className="monitor-risco-trend-svg__line monitor-risco-trend-svg__line--actions"
          />
        </svg>
        <div
          className="monitor-risco-trend-labels"
          style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}
        >
          {points.map((point) => (
            <span key={point.label} className="monitor-risco-trend-labels__item">
              {point.label}
            </span>
          ))}
        </div>
      </div>
      <div className="monitor-risco-trend-legend">
        <span className="monitor-risco-trend-legend__item">
          <span className="monitor-risco-trend-legend__swatch monitor-risco-trend-legend__swatch--raw" />
          Score observado
        </span>
        <span className="monitor-risco-trend-legend__item">
          <span className="monitor-risco-trend-legend__swatch monitor-risco-trend-legend__swatch--actions" />
          Impacto das ações da central
        </span>
      </div>
    </div>
  );
}

function RecenciaChart({ items }: { items: MonitorRiscoData['recencia'] }) {
  const recencyOrder = ['3h', '1h', '15m'];
  const orderedItems = [...items].sort(
    (a, b) => recencyOrder.indexOf(a.window) - recencyOrder.indexOf(b.window),
  );
  const yMax = Math.max(...orderedItems.map((item) => item.count), 1);
  const plotHeight = 145;
  const yTicks = [yMax, Math.round(yMax / 2), 0];

  return (
    <div className="monitor-risco-recency-chart">
      <div className="monitor-risco-recency-chart__y-axis" aria-hidden>
        {yTicks.map((tick) => (
          <span key={tick} className="monitor-risco-recency-chart__y-label">
            {tick}
          </span>
        ))}
      </div>
      <div className="monitor-risco-recency-chart__plot">
        <div
          className="monitor-risco-recency-chart__plot-area"
          style={{ height: plotHeight }}
        >
          <div className="monitor-risco-recency-chart__grid" aria-hidden>
            {yTicks.map((tick) => (
              <span key={tick} className="monitor-risco-recency-chart__grid-line" />
            ))}
          </div>
          <div className="monitor-risco-recency-chart__bars">
            {orderedItems.map((item) => (
              <div key={item.window} className="monitor-risco-recency-chart__bar-col">
                <LevelTooltip
                  text={`${item.label}: ${item.count} eventos`}
                  topLayer
                  nowrap
                >
                  <div
                    className="monitor-risco-recency-chart__bar"
                    style={{
                      height: `${Math.max(4, (item.count / yMax) * plotHeight)}px`,
                    }}
                  />
                </LevelTooltip>
              </div>
            ))}
          </div>
        </div>
        <div className="monitor-risco-recency-chart__labels">
          {orderedItems.map((item) => (
            <span key={item.window} className="monitor-risco-recency-chart__label">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatRankingLine(
  item: { driverName: string; plate: string; vehicleModel: string },
  kind: MonitorRankingKind,
): React.ReactNode {
  const vehicleLabel = `${item.plate} / ${item.vehicleModel}`;

  if (kind === 'veiculo') {
    return (
      <>
        <span className="monitor-risco-ranking__vehicle">{vehicleLabel}</span>
        <span className="monitor-risco-ranking__sep">|</span>
        <span className="monitor-risco-ranking__name">{item.driverName}</span>
      </>
    );
  }

  return (
    <>
      <span className="monitor-risco-ranking__name">{item.driverName}</span>
      <span className="monitor-risco-ranking__sep">|</span>
      <span className="monitor-risco-ranking__vehicle">{vehicleLabel}</span>
    </>
  );
}


function MonitorRiscoStatusBadge({ status }: { status: MonitorRiscoListagemItem['status'] }) {
  return (
    <span
      className={`badge badge-rounded monitor-risco-status-badge ${MONITOR_RISCO_STATUS_BADGE_CLASS[status] ?? ''}`}
    >
      {MONITOR_RISCO_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function MonitorListagemTable({
  items,
  onView,
}: {
  items: MonitorRiscoListagemItem[];
  onView: (item: MonitorRiscoListagemItem) => void;
}) {
  return (
    <div className="operacoes-eventos-table-wrap monitor-risco-listagem-table-wrap">
      <table className="list-table operacoes-eventos-table monitor-risco-listagem-table">
        <colgroup>
          <col className="monitor-risco-col-pontuacao" />
          <col className="monitor-risco-col-nivel-risco" />
          <col className="monitor-risco-col-monitoramento" />
          <col className="monitor-risco-col-politica" />
          <col className="monitor-risco-col-datetime" />
          <col className="monitor-risco-col-status" />
          <col className="operacoes-col-acoes" />
        </colgroup>
        <thead>
          <tr>
            <th className="operacoes-col-data">Pontuação</th>
            <th className="operacoes-col-data">Nível de risco</th>
            <th className="operacoes-col-data">Monitoramento de</th>
            <th className="operacoes-col-data">Política de ocorrência</th>
            <th className="operacoes-col-data">Data/hora (último evento)</th>
            <th className="operacoes-col-data">Status</th>
            <th className="list-cell-actions operacoes-col-acoes-header" aria-label="Ações" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const pointsSeverity = resolveSeverityFromAccumulatedPoints(item.score);

            return (
              <tr key={item.id}>
                <td className="operacoes-col-data monitor-risco-listagem-col-pontuacao">
                  <span
                    className={`operacoes-auditoria-points operacoes-auditoria-points--${pointsSeverity}`}
                  >
                    {item.score} pts
                  </span>
                </td>
                <td className="operacoes-col-data monitor-risco-listagem-col-nivel">
                  <span className={`monitor-risco-feed__level monitor-risco-feed__level--${item.level}`}>
                    {MONITOR_RISCO_FEED_LEVEL_LABELS[item.level]}
                  </span>
                </td>
                <td className="operacoes-col-data">
                  <MonitoringOfCell label={item.monitoringOf} trackingType={item.trackingType} />
                </td>
                <td className="operacoes-col-data">
                  <TruncatedTextTooltip text={item.policyName} />
                </td>
                <OperacoesDateTimeCell
                  occurredAtIso={item.lastEventAtIso}
                  seed={item.id}
                />
                <td className="operacoes-col-data monitor-risco-listagem-col-status">
                  <MonitorRiscoStatusBadge status={item.status} />
                </td>
                <td className="list-cell-actions">
                  <div className="list-actions">
                    <button
                      type="button"
                      className="btn btn-icon-action operacoes-view-btn"
                      aria-label="Visualizar evolução comportamental"
                      title="Visualizar evolução comportamental"
                      onClick={() => onView(item)}
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
  );
}

export const MonitorRiscoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MonitorRiscoTabId>('insights');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<MonitorRiscoFilters>(EMPTY_MONITOR_RISCO_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<MonitorRiscoFilters>(EMPTY_MONITOR_RISCO_FILTERS);
  const [rankingKind, setRankingKind] = useState<MonitorRankingKind>('motorista');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [selectedListagemItem, setSelectedListagemItem] = useState<MonitorRiscoListagemItem | null>(
    null,
  );
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const appliedFilterCount = countAppliedMonitorRiscoFilters(appliedFilters);

  const scopedData = useMemo(() => {
    const base = appliedFilters.politicaId
      ? applyPolicyScope(mockMonitorRiscoData, appliedFilters.politicaId)
      : mockMonitorRiscoData;
    return base;
  }, [appliedFilters.politicaId]);

  const filteredListagem = useMemo(
    () => applyMonitorRiscoFilters(scopedData.listagem, appliedFilters),
    [appliedFilters, scopedData.listagem],
  );

  const filteredFeed = useMemo(
    () => applyMonitorRiscoFilters(scopedData.feed, appliedFilters),
    [appliedFilters, scopedData.feed],
  );

  const ranking =
    rankingKind === 'motorista' ? scopedData.rankingMotorista : scopedData.rankingVeiculo;

  const displayFeed = filteredFeed.slice(0, 4);

  useEffect(() => {
    if (!appliedFilters.politicaId) return;
    const policy = getPolicyById(appliedFilters.politicaId);
    if (policy) setRankingKind(getPolicyRankingKind(policy));
  }, [appliedFilters.politicaId]);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    if (moreMenuOpen) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [moreMenuOpen]);

  const toggleFilterPanel = () => {
    setFilterPanelOpen((open) => {
      const next = !open;
      if (next) setDraftFilters(appliedFilters);
      return next;
    });
  };

  const handleFilterSearch = () => {
    setAppliedFilters(draftFilters);
    setFilterPanelOpen(false);
  };

  const handleClearFilters = () => {
    setAppliedFilters(EMPTY_MONITOR_RISCO_FILTERS);
    setDraftFilters(EMPTY_MONITOR_RISCO_FILTERS);
    setFilterPanelOpen(false);
    setRankingKind('motorista');
  };

  return (
    <div className="monitor-risco-page page-layout content-body">
      <div className="content-toolbar top-bar operacoes-eventos-toolbar">
        <div className="content-toolbar-left">
          <h1 className="body-page-title">Monitor de risco</h1>
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
                <button type="button" role="menuitem" className="tratativa-contact__menu-item">
                  Exportar relatório
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="monitor-risco-tabs risk-tabs">
        <button
          type="button"
          className={`risk-tab monitor-risco-tab${activeTab === 'insights' ? ' risk-tab--active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <IconIrisInsights />
          Insights da Íris
        </button>
        <button
          type="button"
          className={`risk-tab monitor-risco-tab${activeTab === 'listagem' ? ' risk-tab--active' : ''}`}
          onClick={() => setActiveTab('listagem')}
        >
          Listagem
        </button>
      </div>

      {filterPanelOpen && (
        <MonitorRiscoFilterPanel
          filters={draftFilters}
          onChange={setDraftFilters}
          onClose={() => {
            setDraftFilters(appliedFilters);
            setFilterPanelOpen(false);
          }}
          onSearch={handleFilterSearch}
        />
      )}

      {!filterPanelOpen && appliedFilterCount > 0 && (
        <MonitorRiscoFilterBanner appliedFilters={appliedFilters} onClear={handleClearFilters} />
      )}

      {activeTab === 'insights' ? (
        <div className="monitor-risco-grid">
          <section className="monitor-risco-card monitor-risco-card--score">
            <ScoreGeralOverview scoreGeral={scopedData.scoreGeral} />
          </section>

          <DistribuicaoNivelCard items={scopedData.distribuicao} />

          <TendenciaCombinadaSection
            projecao={scopedData.projecao}
            points={scopedData.tendencia}
          />

          <section className="monitor-risco-card monitor-risco-card--ranking">
            <div className="monitor-risco-card__header monitor-risco-card__header--split">
              <div>
                <h2 className="monitor-risco-card__title">Ranking</h2>
                <p className="monitor-risco-card__desc">5 maiores exposições no período</p>
              </div>
              <div className="monitor-risco-ranking-toggle" role="group" aria-label="Tipo de ranking">
                <div className="operacoes-view-toggle-wrap">
                  <button
                    type="button"
                    className="monitor-risco-ranking-toggle__btn"
                    onClick={() => setRankingKind('motorista')}
                    aria-label="Filtrar por motorista"
                    aria-pressed={rankingKind === 'motorista'}
                  >
                    <IconRankingMotorista selected={rankingKind === 'motorista'} />
                  </button>
                  <span className="operacoes-view-tooltip" role="tooltip">
                    Filtrar por motorista
                  </span>
                </div>
                <div className="operacoes-view-toggle-wrap">
                  <button
                    type="button"
                    className="monitor-risco-ranking-toggle__btn"
                    onClick={() => setRankingKind('veiculo')}
                    aria-label="Filtrar por veículo"
                    aria-pressed={rankingKind === 'veiculo'}
                  >
                    <IconRankingVeiculo selected={rankingKind === 'veiculo'} />
                  </button>
                  <span className="operacoes-view-tooltip" role="tooltip">
                    Filtrar por veículo
                  </span>
                </div>
              </div>
            </div>
            <ol className="monitor-risco-ranking">
              {ranking.map((item) => (
                <li key={item.id} className="monitor-risco-ranking__item">
                  <span className="monitor-risco-ranking__line">
                    {formatRankingLine(item, rankingKind)}
                  </span>
                  <span
                    className={`monitor-risco-ranking__score monitor-risco-ranking__score--${item.level}`}
                  >
                    {item.score} pts
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <PoliticasImpactCard items={scopedData.distribuicaoPoliticas} />

          <section className="monitor-risco-card monitor-risco-card--recency">
            <div className="monitor-risco-card__header">
              <h2 className="monitor-risco-card__title">Histórico recente</h2>
              <p className="monitor-risco-card__desc">Volume de eventos validados</p>
            </div>
            <RecenciaChart items={scopedData.recencia} />
          </section>

          <section className="monitor-risco-card monitor-risco-card--feed">
            <div className="monitor-risco-card__header">
              <h2 className="monitor-risco-card__title">Atualizações em tempo real</h2>
              <p className="monitor-risco-card__desc">Últimos eventos e tratativas</p>
            </div>
            <ul className="monitor-risco-feed">
              {displayFeed.map((item) => (
                <li key={item.id} className="monitor-risco-feed__item">
                  <span className="monitor-risco-feed__time">{item.time}</span>
                  <p className="monitor-risco-feed__message">{item.message}</p>
                  <span className="monitor-risco-feed__driver">{item.driverName}</span>
                  <span className="monitor-risco-feed__vehicle">{item.vehicleLabel}</span>
                  <span
                    className={`monitor-risco-feed__level monitor-risco-feed__level--${item.level}`}
                  >
                    {MONITOR_RISCO_FEED_LEVEL_LABELS[item.level]}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <div className="operacoes-eventos-body operacoes-eventos-body--list-only monitor-risco-listagem-body">
          <section className="operacoes-eventos-list-pane" aria-label="Listagem de ocorrências">
            <p className="operacoes-eventos-summary">
              <strong>{filteredListagem.length}</strong> ocorrências
              {appliedFilters.politicaId
                ? ` — ${getPolicyById(appliedFilters.politicaId)?.name ?? 'política selecionada'}`
                : ''}
            </p>
            <MonitorListagemTable
              items={filteredListagem}
              onView={setSelectedListagemItem}
            />
          </section>
        </div>
      )}
      <MonitorRiscoBehaviorEvolutionModal
        item={selectedListagemItem}
        onClose={() => setSelectedListagemItem(null)}
      />
    </div>
  );
};
