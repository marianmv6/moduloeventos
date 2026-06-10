import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IconFilterBars } from '../components/IconFilterBars';
import { IconIrisInsights } from '../components/IconIrisInsights';
import {
  IconRankingMotorista,
  IconRankingVeiculo,
} from '../components/MonitorRankingToggleIcons';
import { MonitorRiscoFilterPanel } from '../components/MonitorRiscoFilterPanel';
import { MonitorRiscoFilterBanner } from '../components/MonitorRiscoFilterBanner';
import { mockMonitorRiscoData } from '../mocks/monitorRisco.mock';
import type {
  MonitorRankingKind,
  MonitorRiscoData,
  MonitorRiscoDistribuicaoItem,
  MonitorRiscoFeedItem,
  MonitorRiscoTabId,
  MonitorRiscoTendenciaPoint,
} from '../types/monitorRisco.types';
import {
  EMPTY_MONITOR_RISCO_FILTERS,
  MONITOR_RISCO_DISTRIBUTION_LABELS,
  MONITOR_RISCO_FEED_LEVEL_LABELS,
  MONITOR_RISCO_LEVEL_COLORS,
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
          <span>ocorrências no período</span>
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
  const yMax = 118;
  const plotHeight = 145;
  const yTicks = [118, 50, 0];

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
            {items.map((item) => (
              <div key={item.window} className="monitor-risco-recency-chart__bar-col">
                <div
                  className="monitor-risco-recency-chart__bar"
                  style={{
                    height: `${Math.max(4, (item.count / yMax) * plotHeight)}px`,
                  }}
                  title={`${item.label}: ${item.count}`}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="monitor-risco-recency-chart__labels">
          {items.map((item) => (
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


function MonitorFeedTable({ items }: { items: MonitorRiscoFeedItem[] }) {
  return (
    <div className="monitor-risco-feed-table-wrap">
      <table className="monitor-risco-feed-table">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Evento</th>
            <th>Motorista</th>
            <th>Veículo</th>
            <th>Nível</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.time}</td>
              <td>{item.message}</td>
              <td>{item.driverName}</td>
              <td>{item.vehicleLabel}</td>
              <td>
                <span className={`monitor-risco-feed__level monitor-risco-feed__level--${item.level}`}>
                  {MONITOR_RISCO_FEED_LEVEL_LABELS[item.level]}
                </span>
              </td>
            </tr>
          ))}
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
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const appliedFilterCount = countAppliedMonitorRiscoFilters(appliedFilters);

  const scopedData = useMemo(() => {
    const base = appliedFilters.politicaId
      ? applyPolicyScope(mockMonitorRiscoData, appliedFilters.politicaId)
      : mockMonitorRiscoData;
    return base;
  }, [appliedFilters.politicaId]);

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

  const scorePercent = Math.round((scopedData.scoreGeral.value / scopedData.scoreGeral.maxScore) * 100);

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
            <div className="monitor-risco-card__header">
              <h2 className="monitor-risco-card__title">Score geral da operação</h2>
            </div>
            <div className="monitor-risco-score">
              <div className="monitor-risco-score__row">
                <div className="monitor-risco-score__main">
                  <span className="monitor-risco-score__value">{scopedData.scoreGeral.value}</span>
                  <span className="monitor-risco-score__max">/ {scopedData.scoreGeral.maxScore} pts</span>
                </div>
                <div className="monitor-risco-score__meta">
                  <span
                    className={`monitor-risco-score__trend monitor-risco-score__trend--${scopedData.scoreGeral.trend}`}
                  >
                    {scopedData.scoreGeral.trendLabel}
                  </span>
                  <p className="monitor-risco-score__subtitle">{scopedData.scoreGeral.subtitle}</p>
                </div>
              </div>
              <div className="monitor-risco-score__meter" aria-hidden>
                <div
                  className="monitor-risco-score__meter-fill"
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
            </div>
          </section>

          <section className="monitor-risco-card monitor-risco-card--distribution">
            <div className="monitor-risco-card__header">
              <h2 className="monitor-risco-card__title">Distribuição por nível de risco</h2>
              <p className="monitor-risco-card__desc">Volume e priorização macro da operação</p>
            </div>
            <DonutChart items={scopedData.distribuicao} />
          </section>

          <section className="monitor-risco-card monitor-risco-card--ranking">
            <div className="monitor-risco-card__header monitor-risco-card__header--split">
              <div>
                <h2 className="monitor-risco-card__title">Ranking</h2>
                <p className="monitor-risco-card__desc">Maiores exposições no período</p>
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

          <section className="monitor-risco-card monitor-risco-card--trend">
            <div className="monitor-risco-card__header">
              <h2 className="monitor-risco-card__title">Tendência de risco</h2>
              <p className="monitor-risco-card__desc">
                Evolução da operação e impacto das ações da central
              </p>
            </div>
            <TendenciaChart points={scopedData.tendencia} />
          </section>

          <section className="monitor-risco-card monitor-risco-card--recency">
            <div className="monitor-risco-card__header">
              <h2 className="monitor-risco-card__title">Histórico recente de riscos</h2>
              <p className="monitor-risco-card__desc">Volume de eventos de risco detectados</p>
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
        <section className="monitor-risco-card monitor-risco-card--listagem">
          <div className="monitor-risco-card__header">
            <h2 className="monitor-risco-card__title">Listagem de ocorrências</h2>
            <p className="monitor-risco-card__desc">
              Eventos de risco no período
              {appliedFilters.politicaId
                ? ` — ${getPolicyById(appliedFilters.politicaId)?.name ?? 'política selecionada'}`
                : ''}
            </p>
          </div>
          <MonitorFeedTable items={filteredFeed} />
        </section>
      )}
    </div>
  );
};
