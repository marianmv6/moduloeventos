import React, { useMemo, useState } from 'react';
import { IconFilterBars } from '../components/IconFilterBars';
import { MonitorRiscoFilterPanel } from '../components/MonitorRiscoFilterPanel';
import { MonitorRiscoFilterBanner } from '../components/MonitorRiscoFilterBanner';
import { mockMonitorRiscoData } from '../mocks/monitorRisco.mock';
import type {
  MonitorRankingKind,
  MonitorRiscoData,
  MonitorRiscoDistribuicaoItem,
  MonitorRiscoTendenciaPoint,
} from '../types/monitorRisco.types';
import {
  EMPTY_MONITOR_RISCO_FILTERS,
  MONITOR_RISCO_LEVEL_COLORS,
  MONITOR_RISCO_LEVEL_LABELS,
} from '../constants/monitorRiscoFilterOptions';
import type { MonitorRiscoFilters } from '../types/monitorRisco.types';
import {
  applyMonitorRiscoFilters,
  countAppliedMonitorRiscoFilters,
} from '../utils/monitorRiscoFilterSummary';

const TREND_ICON: Record<string, string> = {
  up: '↑',
  down: '↓',
  stable: '→',
};

function DistribuicaoChart({ items }: { items: MonitorRiscoDistribuicaoItem[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="monitor-risco-chart monitor-risco-chart--distribution">
      <div
        className="monitor-risco-distribution-bar"
        role="img"
        aria-label="Distribuição por nível de risco"
      >
        {items.map((item) => (
          <div
            key={item.level}
            className="monitor-risco-distribution-bar__segment"
            style={{
              width: `${item.percent}%`,
              backgroundColor: MONITOR_RISCO_LEVEL_COLORS[item.level],
            }}
            title={`${item.label}: ${item.count} (${item.percent}%)`}
          />
        ))}
      </div>
      <ul className="monitor-risco-legend">
        {items.map((item) => (
          <li key={item.level} className="monitor-risco-legend__item">
            <span
              className="monitor-risco-legend__dot"
              style={{ backgroundColor: MONITOR_RISCO_LEVEL_COLORS[item.level] }}
            />
            <span className="monitor-risco-legend__label">{item.label}</span>
            <span className="monitor-risco-legend__value">
              {item.count} <span className="monitor-risco-legend__muted">({item.percent}%)</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="monitor-risco-chart__footnote">{total} ocorrências no período</p>
    </div>
  );
}

function TendenciaChart({ points }: { points: MonitorRiscoTendenciaPoint[] }) {
  const width = 420;
  const height = 180;
  const pad = { top: 16, right: 12, bottom: 28, left: 36 };
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
      <svg viewBox={`0 0 ${width} ${height}`} className="monitor-risco-trend-svg" aria-hidden>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
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
        {points.map((point, index) => (
          <text
            key={point.label}
            x={pad.left + index * xStep}
            y={height - 8}
            textAnchor="middle"
            className="monitor-risco-trend-svg__label"
          >
            {point.label}
          </text>
        ))}
      </svg>
      <div className="monitor-risco-trend-legend">
        <span className="monitor-risco-trend-legend__item">
          <span className="monitor-risco-trend-legend__line monitor-risco-trend-legend__line--raw" />
          Score observado
        </span>
        <span className="monitor-risco-trend-legend__item">
          <span className="monitor-risco-trend-legend__line monitor-risco-trend-legend__line--actions" />
          Impacto das ações da central
        </span>
      </div>
    </div>
  );
}

function ComportamentosChart({
  items,
}: {
  items: MonitorRiscoData['comportamentos'];
}) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className="monitor-risco-chart monitor-risco-chart--behaviors">
      <ul className="monitor-risco-behavior-list">
        {items.map((item) => (
          <li key={item.id} className="monitor-risco-behavior-list__item">
            <div className="monitor-risco-behavior-list__header">
              <span>{item.label}</span>
              <span className="monitor-risco-behavior-list__count">
                {item.count} <span className="monitor-risco-legend__muted">({item.percent}%)</span>
              </span>
            </div>
            <div className="monitor-risco-behavior-list__track">
              <div
                className="monitor-risco-behavior-list__fill"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecenciaChart({ items }: { items: MonitorRiscoData['recencia'] }) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className="monitor-risco-chart monitor-risco-chart--recency">
      <div className="monitor-risco-recency-bars">
        {items.map((item) => (
          <div key={item.window} className="monitor-risco-recency-bars__item">
            <div className="monitor-risco-recency-bars__column-wrap">
              <div
                className="monitor-risco-recency-bars__column"
                style={{ height: `${(item.count / max) * 100}%` }}
                title={`${item.label}: ${item.count}`}
              />
            </div>
            <span className="monitor-risco-recency-bars__count">{item.count}</span>
            <span className="monitor-risco-recency-bars__label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const MonitorRiscoPage: React.FC = () => {
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<MonitorRiscoFilters>(EMPTY_MONITOR_RISCO_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<MonitorRiscoFilters>(EMPTY_MONITOR_RISCO_FILTERS);
  const [rankingKind, setRankingKind] = useState<MonitorRankingKind>('motorista');

  const data = mockMonitorRiscoData;
  const appliedFilterCount = countAppliedMonitorRiscoFilters(appliedFilters);

  const filteredFeed = useMemo(
    () => applyMonitorRiscoFilters(data.feed, appliedFilters),
    [appliedFilters, data.feed],
  );

  const ranking =
    rankingKind === 'motorista' ? data.rankingMotorista : data.rankingVeiculo;

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
  };

  const scorePercent = Math.round((data.scoreGeral.value / data.scoreGeral.maxScore) * 100);

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
        </div>
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

      <div className="monitor-risco-grid">
        <section className="monitor-risco-card monitor-risco-card--score">
          <div className="monitor-risco-card__header">
            <h2 className="monitor-risco-card__title">Score geral da operação</h2>
          </div>
          <div className="monitor-risco-score">
            <div className="monitor-risco-score__main">
              <span className="monitor-risco-score__value">{data.scoreGeral.value}</span>
              <span className="monitor-risco-score__max">/ {data.scoreGeral.maxScore} pts</span>
            </div>
            <div className="monitor-risco-score__meta">
              <span className={`monitor-risco-score__trend monitor-risco-score__trend--${data.scoreGeral.trend}`}>
                {TREND_ICON[data.scoreGeral.trend]} {data.scoreGeral.trendLabel}
              </span>
              <p className="monitor-risco-score__subtitle">{data.scoreGeral.subtitle}</p>
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
          <DistribuicaoChart items={data.distribuicao} />
        </section>

        <section className="monitor-risco-card monitor-risco-card--ranking">
          <div className="monitor-risco-card__header monitor-risco-card__header--split">
            <div>
              <h2 className="monitor-risco-card__title">Ranking</h2>
              <p className="monitor-risco-card__desc">Maiores exposições no período</p>
            </div>
            <div className="monitor-risco-toggle" role="group" aria-label="Tipo de ranking">
              <button
                type="button"
                className={`monitor-risco-toggle__btn${rankingKind === 'motorista' ? ' is-active' : ''}`}
                onClick={() => setRankingKind('motorista')}
              >
                Motorista
              </button>
              <button
                type="button"
                className={`monitor-risco-toggle__btn${rankingKind === 'veiculo' ? ' is-active' : ''}`}
                onClick={() => setRankingKind('veiculo')}
              >
                Veículo
              </button>
            </div>
          </div>
          <ol className="monitor-risco-ranking">
            {ranking.map((item, index) => (
              <li key={item.id} className="monitor-risco-ranking__item">
                <span className="monitor-risco-ranking__pos">{index + 1}</span>
                <div className="monitor-risco-ranking__body">
                  <span className="monitor-risco-ranking__name">{item.label}</span>
                  <span className="monitor-risco-ranking__secondary">{item.secondaryLabel}</span>
                </div>
                <span
                  className={`monitor-risco-ranking__badge monitor-risco-ranking__badge--${item.level}`}
                >
                  {MONITOR_RISCO_LEVEL_LABELS[item.level]}
                </span>
                <span className="monitor-risco-ranking__score">{item.score} pts</span>
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
          <TendenciaChart points={data.tendencia} />
        </section>

        <section className="monitor-risco-card monitor-risco-card--behaviors">
          <div className="monitor-risco-card__header">
            <h2 className="monitor-risco-card__title">Tipos de comportamento</h2>
            <p className="monitor-risco-card__desc">Causas do risco para decisões operacionais</p>
          </div>
          <ComportamentosChart items={data.comportamentos} />
        </section>

        <section className="monitor-risco-card monitor-risco-card--recency">
          <div className="monitor-risco-card__header">
            <h2 className="monitor-risco-card__title">Recência</h2>
            <p className="monitor-risco-card__desc">Quando o risco aconteceu</p>
          </div>
          <RecenciaChart items={data.recencia} />
        </section>

        <section className="monitor-risco-card monitor-risco-card--feed">
          <div className="monitor-risco-card__header monitor-risco-card__header--split">
            <div>
              <h2 className="monitor-risco-card__title">Feed em tempo real</h2>
              <p className="monitor-risco-card__desc">Últimos eventos e tratativas</p>
            </div>
            <span className="monitor-risco-live-badge" aria-label="Atualização em tempo real">
              <span className="monitor-risco-live-badge__dot" />
              Ao vivo
            </span>
          </div>
          <ul className="monitor-risco-feed">
            {filteredFeed.map((item) => (
              <li key={item.id} className="monitor-risco-feed__item">
                <span className="monitor-risco-feed__time">{item.time}</span>
                <div className="monitor-risco-feed__content">
                  <p className="monitor-risco-feed__message">{item.message}</p>
                  <p className="monitor-risco-feed__entity">{item.entity}</p>
                </div>
                <span
                  className={`monitor-risco-feed__level monitor-risco-feed__level--${item.level}`}
                >
                  {MONITOR_RISCO_LEVEL_LABELS[item.level]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
