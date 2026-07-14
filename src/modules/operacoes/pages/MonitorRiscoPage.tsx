import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LevelTooltip } from '../../risk-rules/components/shared/LevelTooltip';
import { TruncatedTextTooltip } from '../../risk-rules/components/shared/TruncatedTextTooltip';
import { InfoTooltip } from '../../risk-rules/components/shared/InfoTooltip';
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
  MonitorRiscoDonutInsight,
  MonitorRiscoDonutSegment,
  MonitorRiscoEventosTempoItem,
  MonitorRiscoListagemItem,
  MonitorRiscoNivelRisco,
  MonitorRiscoPoliticaDistribuicaoItem,
  MonitorRiscoRankingItem,
  MonitorRiscoReincidenteItem,
  MonitorRiscoTabId,
} from '../types/monitorRisco.types';
import {
  EMPTY_MONITOR_RISCO_FILTERS,
  MONITOR_RISCO_FEED_LEVEL_LABELS,
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
  getMonitorPoliticaOptions,
  getPolicyById,
  getPolicyRankingKind,
} from '../utils/monitorRiscoPolicy';

const DONUT_SIZE = 140;
const DONUT_STROKE = 20;
const DONUT_SEGMENT_GAP = 3;

function formatPercent(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

const RISK_LEVEL_WORDS: Record<string, string> = {
  baixo: 'baixo',
  medio: 'médio',
  alto: 'alto',
  critico: 'crítico',
};

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

function IconRankingFlagged() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="monitor-risco-ranking__flag"
    >
      <path
        d="M7.27273 9.45455V2.90909H8.72727V9.45455H7.27273ZM7.27273 13.0909V11.6364H8.72727V13.0909H7.27273ZM3.63636 16H1.45455C1.05455 16 0.712121 15.8576 0.427273 15.5727C0.142424 15.2879 0 14.9455 0 14.5455V12.3636H1.45455V14.5455H3.63636V16ZM12.3636 16V14.5455H14.5455V12.3636H16V14.5455C16 14.9455 15.8576 15.2879 15.5727 15.5727C15.2879 15.8576 14.9455 16 14.5455 16H12.3636ZM0 3.63636V1.45455C0 1.05455 0.142424 0.712121 0.427273 0.427273C0.712121 0.142424 1.05455 0 1.45455 0H3.63636V1.45455H1.45455V3.63636H0ZM14.5455 3.63636V1.45455H12.3636V0H14.5455C14.9455 0 15.2879 0.142424 15.5727 0.427273C15.8576 0.712121 16 1.05455 16 1.45455V3.63636H14.5455Z"
        fill="#FF5454"
      />
    </svg>
  );
}

function DonutChartVisual({
  segments,
  centerPrimary,
  centerSecondary,
  ariaLabel,
  selectedSegmentId = null,
  onSegmentSelect,
}: {
  segments: MonitorRiscoDonutSegment[];
  centerPrimary: string;
  centerSecondary: string;
  ariaLabel: string;
  selectedSegmentId?: string | null;
  onSegmentSelect?: (segment: MonitorRiscoDonutSegment) => void;
}) {
  const total = segments.reduce((sum, item) => sum + item.count, 0);
  const radius = (DONUT_SIZE - DONUT_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const hasSelection = Boolean(selectedSegmentId);

  return (
    <div className="monitor-risco-donut-wrap">
      <svg
        width={DONUT_SIZE}
        height={DONUT_SIZE}
        viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
        className="monitor-risco-donut"
        role="img"
        aria-label={ariaLabel}
      >
        <circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={radius}
          fill="none"
          stroke="#F6FBFB"
          strokeWidth={DONUT_STROKE}
        />
        {segments.map((item) => {
          const segment =
            total > 0 ? (item.count / total) * circumference - DONUT_SEGMENT_GAP : 0;
          const dashArray = `${Math.max(0, segment)} ${circumference - Math.max(0, segment)}`;
          const dashOffset = -(offset + DONUT_SEGMENT_GAP / 2);
          offset += total > 0 ? (item.count / total) * circumference : 0;
          const isSelected = selectedSegmentId === item.id;
          const isDimmed = hasSelection && !isSelected;

          return (
            <circle
              key={item.id}
              cx={DONUT_SIZE / 2}
              cy={DONUT_SIZE / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={isSelected ? DONUT_STROKE + 4 : DONUT_STROKE}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
              className={`monitor-risco-donut__segment${
                isSelected ? ' monitor-risco-donut__segment--selected' : ''
              }${isDimmed ? ' monitor-risco-donut__segment--dimmed' : ''}`}
              style={{ cursor: onSegmentSelect ? 'pointer' : undefined }}
              onClick={onSegmentSelect ? () => onSegmentSelect(item) : undefined}
              onKeyDown={
                onSegmentSelect
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSegmentSelect(item);
                      }
                    }
                  : undefined
              }
              role={onSegmentSelect ? 'button' : undefined}
              tabIndex={onSegmentSelect ? 0 : undefined}
              aria-pressed={onSegmentSelect ? isSelected : undefined}
            />
          );
        })}
      </svg>
      <div className="monitor-risco-donut__center">
        <strong>{centerPrimary}</strong>
        <span>{centerSecondary}</span>
      </div>
    </div>
  );
}

function DonutChart({
  segments,
  centerPrimary,
  centerSecondary,
  ariaLabel,
  selectedSegmentId = null,
  onSegmentSelect,
}: {
  segments: MonitorRiscoDonutSegment[];
  centerPrimary: string;
  centerSecondary: string;
  ariaLabel: string;
  selectedSegmentId?: string | null;
  onSegmentSelect?: (segment: MonitorRiscoDonutSegment) => void;
}) {
  return (
    <div className="monitor-risco-distribution-layout">
      <DonutChartVisual
        segments={segments}
        centerPrimary={centerPrimary}
        centerSecondary={centerSecondary}
        ariaLabel={ariaLabel}
        selectedSegmentId={selectedSegmentId}
        onSegmentSelect={onSegmentSelect}
      />
      <ul className="monitor-risco-legend">
        {segments.map((item) => {
          const isSelected = selectedSegmentId === item.id;

          if (!onSegmentSelect) {
            return (
              <li key={item.id} className="monitor-risco-legend__item">
                <span
                  className="monitor-risco-legend__swatch"
                  style={{ backgroundColor: item.color }}
                />
                <span className="monitor-risco-legend__text">
                  {item.count} {item.label}{' '}
                  <span className="monitor-risco-legend__muted">({item.percent}%)</span>
                </span>
              </li>
            );
          }

          return (
            <li key={item.id}>
              <button
                type="button"
                className={`monitor-risco-legend__item monitor-risco-legend__item--selectable${
                  isSelected ? ' monitor-risco-legend__item--selected' : ''
                }`}
                onClick={() => onSegmentSelect(item)}
                aria-pressed={isSelected}
              >
                <span
                  className="monitor-risco-legend__swatch"
                  style={{ backgroundColor: item.color }}
                />
                <span className="monitor-risco-legend__text">
                  {item.count} {item.label}{' '}
                  <span className="monitor-risco-legend__muted">({item.percent}%)</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PoliticaDistribuicaoCard({
  items,
  selectedPolicyId,
  onSelectPolicy,
}: {
  items: MonitorRiscoPoliticaDistribuicaoItem[];
  selectedPolicyId: string;
  onSelectPolicy: (policyId: string) => void;
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const selectedItem = items.find((item) => item.policyId === selectedPolicyId);
  const selectedSegmentId = selectedItem?.id ?? null;

  return (
    <section className="monitor-risco-card monitor-risco-card--politicas-dist">
      <div className="monitor-risco-card__header">
        <h2 className="monitor-risco-card__title">Distribuição de ocorrências por política</h2>
        <p className="monitor-risco-card__desc">Selecione a política desejada para filtrar</p>
      </div>
      <DonutChart
        segments={items}
        centerPrimary={selectedItem ? String(selectedItem.count) : String(total)}
        centerSecondary={
          selectedItem ? 'ocorrências na política' : 'ocorrências no período'
        }
        ariaLabel="Distribuição de ocorrências por política"
        selectedSegmentId={selectedSegmentId}
        onSegmentSelect={(segment) => {
          const policyItem = items.find((item) => item.id === segment.id);
          if (policyItem) onSelectPolicy(policyItem.policyId);
        }}
      />
    </section>
  );
}

function NivelRiscoCard({ nivelRisco }: { nivelRisco: MonitorRiscoNivelRisco }) {
  const fillPercent = Math.min(100, Math.max(0, nivelRisco.percent));
  const levelWord = RISK_LEVEL_WORDS[nivelRisco.level] ?? nivelRisco.level;

  return (
    <section className="monitor-risco-card monitor-risco-card--nivel-risco">
      <div className="monitor-risco-nivel-risco">
        <div className="monitor-risco-nivel-risco__top">
          <div className="monitor-risco-nivel-risco__percent-line">
            <span
              className={`monitor-risco-nivel-risco__percent monitor-risco-nivel-risco__percent--${nivelRisco.level}`}
            >
              {formatPercent(nivelRisco.percent)}%
            </span>
            <InfoTooltip
              text={nivelRisco.tooltipText}
              className="monitor-risco-nivel-risco__info"
            />
          </div>
          <span
            className={`monitor-risco-nivel-risco__label monitor-risco-nivel-risco__label--${nivelRisco.level}`}
          >
            <span>Nível de</span>
            <span>risco {levelWord}</span>
          </span>
        </div>
        <p className="monitor-risco-nivel-risco__points">
          <strong>{nivelRisco.activePoints} pontos</strong> ativos no momento
        </p>
        <div className="monitor-risco-nivel-risco__meter-block">
          <div
            className="monitor-risco-nivel-risco__meter"
            aria-hidden
            style={{ '--monitor-risco-fill': `${fillPercent}%` } as React.CSSProperties}
          >
            <div
              className={`monitor-risco-nivel-risco__meter-fill monitor-risco-nivel-risco__meter-fill--${nivelRisco.level}`}
            />
          </div>
          <div className="monitor-risco-nivel-risco__scale" aria-hidden>
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const EVENTOS_TEMPO_PLOT_HEIGHT = 120;
const EVENTOS_TEMPO_ALERT_COLUMN_REF = 'evt-3';
const EVENTOS_TEMPO_STACK_GAP = 2;

/** Proporções visuais do Figma (altura em % do plot). */
const EVENTOS_TEMPO_BAR_HEIGHTS: Record<string, number> = {
  'evt-1': 100,
  'evt-2': 60,
  'evt-3': 80,
  'evt-4-solid': 60,
  'evt-4-alert': 20,
  'evt-5': 45,
  'evt-6': 22,
};

function getAlertColumnHeights(plotHeight: number) {
  const columnTotalHeight = Math.round(
    (EVENTOS_TEMPO_BAR_HEIGHTS[EVENTOS_TEMPO_ALERT_COLUMN_REF] ?? 80) * (plotHeight / 100),
  );
  const alertShare =
    (EVENTOS_TEMPO_BAR_HEIGHTS['evt-4-alert'] ?? 20) /
    ((EVENTOS_TEMPO_BAR_HEIGHTS['evt-4-alert'] ?? 20) +
      (EVENTOS_TEMPO_BAR_HEIGHTS['evt-4-solid'] ?? 60));
  const alertHeight = Math.round((columnTotalHeight - EVENTOS_TEMPO_STACK_GAP) * alertShare);
  const solidHeight = columnTotalHeight - EVENTOS_TEMPO_STACK_GAP - alertHeight;

  return { columnTotalHeight, alertHeight, solidHeight };
}

function EventosPorTempoCard({ items }: { items: MonitorRiscoEventosTempoItem[] }) {
  const historico = items.filter((item) => item.kind === 'historico');
  const previsao = items.filter((item) => item.kind === 'previsao');

  const toHeight = (itemId: string, fallbackPercent: number) =>
    Math.round((EVENTOS_TEMPO_BAR_HEIGHTS[itemId] ?? fallbackPercent) * (EVENTOS_TEMPO_PLOT_HEIGHT / 100));

  const renderBar = (item: MonitorRiscoEventosTempoItem) => {
    const barClass =
      item.kind === 'historico'
        ? 'monitor-risco-eventos-tempo__bar monitor-risco-eventos-tempo__bar--historico'
        : 'monitor-risco-eventos-tempo__bar monitor-risco-eventos-tempo__bar--previsao';

    if (item.alertOutline) {
      const { columnTotalHeight, alertHeight, solidHeight } = getAlertColumnHeights(
        EVENTOS_TEMPO_PLOT_HEIGHT,
      );

      return (
        <div key={item.id} className="monitor-risco-eventos-tempo__col">
          <div
            className="monitor-risco-eventos-tempo__bar-stack"
            style={{ height: EVENTOS_TEMPO_PLOT_HEIGHT }}
          >
            <div
              className="monitor-risco-eventos-tempo__bar-stack-inner monitor-risco-eventos-tempo__bar-stack-inner--alert"
              style={{ height: columnTotalHeight }}
            >
              <div
                className="monitor-risco-eventos-tempo__alert-box"
                style={{ height: alertHeight }}
              >
                <span className="monitor-risco-eventos-tempo__value monitor-risco-eventos-tempo__value--alert">
                  +{item.trendDelta ?? item.count}
                </span>
              </div>
              <div className={barClass} style={{ height: solidHeight }}>
                <span className="monitor-risco-eventos-tempo__value monitor-risco-eventos-tempo__value--previsao">
                  {item.count}
                </span>
              </div>
            </div>
          </div>
          <span className="monitor-risco-eventos-tempo__label">{item.label}</span>
        </div>
      );
    }

    const barHeight = toHeight(item.id, 50);

    return (
      <div key={item.id} className="monitor-risco-eventos-tempo__col">
        <div
          className="monitor-risco-eventos-tempo__bar-stack"
          style={{ height: EVENTOS_TEMPO_PLOT_HEIGHT }}
        >
          <div className={barClass} style={{ height: barHeight }}>
            <span
              className={`monitor-risco-eventos-tempo__value${
                item.kind === 'previsao' ? ' monitor-risco-eventos-tempo__value--previsao' : ''
              }`}
            >
              {item.count}
            </span>
          </div>
        </div>
        <span className="monitor-risco-eventos-tempo__label">{item.label}</span>
      </div>
    );
  };

  const renderSectionHead = (title: string, kind: 'historico' | 'previsao') => (
    <div
      className={`monitor-risco-eventos-tempo__section-head monitor-risco-eventos-tempo__section-head--${kind}`}
    >
      <span className="monitor-risco-eventos-tempo__section-title">{title}</span>
      <span className="monitor-risco-eventos-tempo__section-line" aria-hidden />
    </div>
  );

  return (
    <section className="monitor-risco-card monitor-risco-card--eventos-tempo">
      <div className="monitor-risco-card__header">
        <h2 className="monitor-risco-card__title">Quantidade de eventos por tempo</h2>
        <p className="monitor-risco-card__desc">Histórico e tendência</p>
      </div>
      <div className="monitor-risco-eventos-tempo">
        <div className="monitor-risco-eventos-tempo__chart">
          <div className="monitor-risco-eventos-tempo__heads">
            {renderSectionHead('Histórico', 'historico')}
            {renderSectionHead('Previsão', 'previsao')}
          </div>
          <div className="monitor-risco-eventos-tempo__bars">
            {[...historico, ...previsao].map(renderBar)}
          </div>
        </div>
      </div>
    </section>
  );
}

function TipoEventosCard({ insight }: { insight: MonitorRiscoDonutInsight }) {
  return (
    <section className="monitor-risco-card monitor-risco-card--tipo-eventos">
      <div className="monitor-risco-card__header">
        <h2 className="monitor-risco-card__title">Tipo dos eventos</h2>
      </div>
      <DonutChart
        segments={insight.segments}
        centerPrimary={insight.centerPrimary}
        centerSecondary={insight.centerSecondary}
        ariaLabel="Tipo dos eventos"
      />
    </section>
  );
}

function OcorrenciasPendentesCard({ insight }: { insight: MonitorRiscoDonutInsight }) {
  return (
    <section className="monitor-risco-card monitor-risco-card--ocorrencias-pendentes">
      <div className="monitor-risco-card__header">
        <h2 className="monitor-risco-card__title">Ocorrências pendentes</h2>
      </div>
      <div className="monitor-risco-distribution-layout">
        <DonutChartVisual
          segments={insight.segments}
          centerPrimary={insight.centerPrimary}
          centerSecondary={insight.centerSecondary}
          ariaLabel="Ocorrências pendentes"
        />
        <ul className="monitor-risco-legend monitor-risco-legend--pendentes">
          {insight.segments.map((item) => (
            <li key={item.id} className="monitor-risco-legend__item">
              <span
                className="monitor-risco-legend__swatch"
                style={{ backgroundColor: item.color }}
              />
              <span className="monitor-risco-legend__text">
                {item.count} {item.label}
              </span>
            </li>
          ))}
          <li className="monitor-risco-legend__item monitor-risco-legend__item--total">
            <span
              className="monitor-risco-legend__swatch"
              style={{ backgroundColor: '#169EFF' }}
            />
            <span className="monitor-risco-legend__text">
              {insight.total} ocorrências pendentes no total
            </span>
          </li>
        </ul>
      </div>
    </section>
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
        <span className="monitor-risco-ranking__name">{item.driverName}</span>
      </>
    );
  }

  return (
    <>
      <span className="monitor-risco-ranking__name">{item.driverName}</span>
      <span className="monitor-risco-ranking__vehicle">{vehicleLabel}</span>
    </>
  );
}

function RankingInsightsCard({
  items,
  rankingKind,
  onRankingKindChange,
}: {
  items: MonitorRiscoRankingItem[];
  rankingKind: MonitorRankingKind;
  onRankingKindChange: (kind: MonitorRankingKind) => void;
}) {
  return (
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
              onClick={() => onRankingKindChange('motorista')}
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
              onClick={() => onRankingKindChange('veiculo')}
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
      <ol
        className={`monitor-risco-ranking monitor-risco-ranking--insights${
          rankingKind === 'veiculo' ? ' monitor-risco-ranking--veiculo' : ''
        }`}
      >
        {items.map((item) => (
          <li key={item.id} className="monitor-risco-ranking__item">
            <span className="monitor-risco-ranking__rank-col">
              <span className="monitor-risco-ranking__rank">{item.rank}.</span>
              {item.flagged && (
                <LevelTooltip text="Reincidente" topLayer nowrap>
                  <span className="monitor-risco-ranking__flag-wrap">
                    <IconRankingFlagged />
                  </span>
                </LevelTooltip>
              )}
            </span>
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
  );
}

function ReincidentesCard({ items }: { items: MonitorRiscoReincidenteItem[] }) {
  return (
    <section className="monitor-risco-card monitor-risco-card--reincidentes">
      <div className="monitor-risco-card__header">
        <h2 className="monitor-risco-card__title">Reincidentes</h2>
      </div>
      <ol className="monitor-risco-ranking monitor-risco-ranking--insights">
        {items.map((item) => (
          <li key={item.id} className="monitor-risco-ranking__item">
            <span className="monitor-risco-ranking__rank-col">
              <span className="monitor-risco-ranking__rank">{item.rank}.</span>
            </span>
            <span className="monitor-risco-ranking__line">
              <span className="monitor-risco-ranking__name">{item.driverName}</span>
              <span className="monitor-risco-ranking__vehicle">
                {item.plate} / {item.vehicleModel}
              </span>
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
          {items.map((item) => (
              <tr key={item.id}>
                <td className="operacoes-col-data monitor-risco-listagem-col-pontuacao">
                  <span
                    className={`monitor-risco-listagem-points monitor-risco-feed__level monitor-risco-feed__level--${item.level}`}
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

  const filteredListagem = useMemo(() => {
    const filtered = applyMonitorRiscoFilters(scopedData.listagem, appliedFilters);
    return [...filtered].sort(
      (a, b) => new Date(b.lastEventAtIso).getTime() - new Date(a.lastEventAtIso).getTime(),
    );
  }, [appliedFilters, scopedData.listagem]);

  const ranking =
    rankingKind === 'motorista' ? scopedData.rankingMotorista : scopedData.rankingVeiculo;

  useEffect(() => {
    if (!appliedFilters.politicaId) return;
    const policy = getPolicyById(appliedFilters.politicaId);
    if (policy) setRankingKind(getPolicyRankingKind(policy));
  }, [appliedFilters.politicaId]);

  useEffect(() => {
    if (activeTab === 'insights') {
      setMoreMenuOpen(false);
    }
  }, [activeTab]);

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

  const handleSelectPolicy = (policyId: string) => {
    const nextPolicyId = appliedFilters.politicaId === policyId ? '' : policyId;
    const nextFilters: MonitorRiscoFilters = {
      ...appliedFilters,
      politicaId: nextPolicyId,
      niveisRisco: '',
      monitoramentoDe: '',
    };

    setAppliedFilters(nextFilters);
    setDraftFilters(nextFilters);

    if (!nextPolicyId) {
      setRankingKind('motorista');
      return;
    }

    const policy = getPolicyById(nextPolicyId);
    if (policy) {
      setRankingKind(getPolicyRankingKind(policy));
      return;
    }

    setRankingKind(nextPolicyId === 'pol-2' ? 'veiculo' : 'motorista');
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
          {activeTab === 'listagem' && (
            <div
              className="tratativa-contact__menu-wrap operacoes-eventos-more-menu"
              ref={moreMenuRef}
            >
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
          )}
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
          mode={activeTab === 'insights' ? 'politica' : 'full'}
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
        <div className="monitor-risco-grid monitor-risco-insights-grid">
          <PoliticaDistribuicaoCard
            items={mockMonitorRiscoData.ocorrenciasPorPolitica}
            selectedPolicyId={appliedFilters.politicaId}
            onSelectPolicy={handleSelectPolicy}
          />
          <NivelRiscoCard nivelRisco={scopedData.nivelRisco} />
          <EventosPorTempoCard items={scopedData.eventosPorTempo} />
          <TipoEventosCard insight={scopedData.tipoEventos} />
          <OcorrenciasPendentesCard insight={scopedData.ocorrenciasPendentes} />
          <RankingInsightsCard
            items={ranking}
            rankingKind={rankingKind}
            onRankingKindChange={setRankingKind}
          />
          <ReincidentesCard items={scopedData.reincidentes} />
        </div>
      ) : (
        <div className="operacoes-eventos-body operacoes-eventos-body--list-only monitor-risco-listagem-body">
          <section className="operacoes-eventos-list-pane" aria-label="Listagem de ocorrências">
            <p className="operacoes-eventos-summary">
              <strong>{filteredListagem.length}</strong> ocorrências
              {appliedFilters.politicaId
                ? ` — ${
                    getMonitorPoliticaOptions().find(
                      (option) => option.value === appliedFilters.politicaId,
                    )?.label ?? 'política selecionada'
                  }`
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
