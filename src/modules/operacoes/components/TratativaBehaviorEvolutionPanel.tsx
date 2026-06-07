import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ANALYST_HEADSET_PATH } from './CentralControleIcons';
import type {
  TratativaBehaviorChartPoint,
  TratativaBehaviorEvolutionData,
  TratativaBehaviorEventPoint,
  TratativaBehaviorRiskLevel,
  TratativaBehaviorTreatmentPoint,
} from '../types/tratativaOcorrencia.types';

const RISK_COLORS: Record<TratativaBehaviorRiskLevel, string> = {
  low: '#169EFF',
  medium: '#E29C2C',
  high: '#FF5454',
  critical: '#7F1D1D',
};

const CHART_WIDTH = 1050;
const CHART_HEIGHT = 528;
const VIEWBOX_MIN_X = -14;
/** Espelha VIEWBOX_MIN_X à direita para margem simétrica do viewBox. */
const VIEWBOX_MAX_EXTRA = 14;
const Y_TITLE_X = 16;
const Y_LABEL_X = 42;
const PAD = { top: 6, right: 48, bottom: 32, left: 48 };
const X_HOUR_LABEL_Y = CHART_HEIGHT - 20;
const X_AXIS_TITLE_Y = CHART_HEIGHT - 6;
const EVENT_DOT_RADIUS = 4;
const TREATMENT_ICON_W = 21;
const TREATMENT_ICON_H = 19;
/** Mesmo peso visual do headset (21×19); viewBox 24×22 inclui balão e check. */
const TREATMENT_OPEN_ICON_W = 30;
const TREATMENT_OPEN_ICON_H = 27;
const TREATMENT_HIT_RADIUS = 10;
const TREATMENT_ICON_PAD = 2;
const TOOLTIP_LEG_HEIGHT = 8;
const TOOLTIP_GAP = 4;

interface TratativaBehaviorEvolutionPanelProps {
  data: TratativaBehaviorEvolutionData;
  /** Na auditoria, a última tratativa da linha do tempo usa o ícone com check verde. */
  markLastTreatmentAsOpen?: boolean;
}

type HoverTarget =
  | { kind: 'event'; point: TratativaBehaviorEventPoint }
  | { kind: 'treatment'; point: TratativaBehaviorTreatmentPoint };

function parseHourLabel(label: string): number {
  const [h, m] = label.split(':').map(Number);
  return h * 60 + (m || 0);
}

function formatHourLabel(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function buildYTicks(maxScore: number): number[] {
  const step = maxScore <= 120 ? 30 : 60;
  const ticks: number[] = [0];
  for (let v = step; v < maxScore; v += step) ticks.push(v);
  ticks.push(maxScore);
  return ticks;
}

function buildXTicks(startLabel: string, endLabel: string): number[] {
  const start = parseHourLabel(startLabel);
  const end = parseHourLabel(endLabel);
  const ticks: number[] = [];
  const firstHour = Math.ceil(start / 60) * 60;
  for (let t = firstHour; t <= end; t += 60) {
    ticks.push(t - start);
  }
  return ticks;
}

function sortChartPoints(points: TratativaBehaviorChartPoint[]): TratativaBehaviorChartPoint[] {
  return [...points].sort((a, b) => a.minutesFromStart - b.minutesFromStart);
}

const BehaviorChartTooltip: React.FC<{
  target: HoverTarget;
  anchorRect: DOMRect;
}> = ({ target, anchorRect }) => {
  const tipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!tipRef.current) return;
    const tip = tipRef.current;
    const rect = tip.getBoundingClientRect();
    let left = anchorRect.left + anchorRect.width / 2 - rect.width / 2;
    const top = anchorRect.top - rect.height - TOOLTIP_LEG_HEIGHT - TOOLTIP_GAP;
    const pad = 8;
    if (left < pad) left = pad;
    if (left + rect.width > window.innerWidth - pad) {
      left = window.innerWidth - pad - rect.width;
    }
    tip.style.left = `${left}px`;
    tip.style.top = `${Math.max(pad, top)}px`;
  }, [target, anchorRect]);

  if (target.kind === 'treatment') {
    const t = target.point.treatment;
    return createPortal(
      <div
        ref={tipRef}
        className="tratativa-behavior-tooltip tratativa-behavior-tooltip--treatment"
        role="tooltip"
      >
        <p className="tratativa-behavior-tooltip__title">Tratado por {t.treatedBy}</p>
        <p className="tratativa-behavior-tooltip__subtitle">{t.actionTitle}</p>
        <hr className="tratativa-behavior-tooltip__divider" />
        <p className="tratativa-behavior-tooltip__line">Início da tratativa às {t.startedAt}</p>
        <p className="tratativa-behavior-tooltip__line">Conclusão da tratativa às {t.endedAt}</p>
      </div>,
      document.body,
    );
  }

  const point = target.point;
  return createPortal(
    <div
      ref={tipRef}
      className={`tratativa-behavior-tooltip tratativa-behavior-tooltip--event tratativa-behavior-tooltip--risk-${point.riskLevel}`}
      role="tooltip"
    >
      <div className="tratativa-behavior-tooltip__section">
        <p className="tratativa-behavior-tooltip__title">{point.eventType}</p>
        <p className="tratativa-behavior-tooltip__points">+ {point.eventPoints} pontos</p>
      </div>
      <hr className="tratativa-behavior-tooltip__divider" />
      <p className="tratativa-behavior-tooltip__accumulated">
        {point.cumulativeScore} pts acumulados
      </p>
      <hr className="tratativa-behavior-tooltip__divider" />
      <p className="tratativa-behavior-tooltip__line">{point.location}</p>
      <hr className="tratativa-behavior-tooltip__divider" />
      <p className="tratativa-behavior-tooltip__line">{point.occurredAtLabel}</p>
    </div>,
    document.body,
  );
};

function markerCounterScaleTransform(
  cx: number,
  cy: number,
  scaleX: number,
  scaleY: number,
): string {
  if (scaleX <= 0 || scaleY <= 0) return '';
  /** Compensa o esticamento não uniforme — tamanho equivalente ao `meet` anterior. */
  const uniformScale = Math.min(scaleX, scaleY);
  return `translate(${cx} ${cy}) scale(${1 / uniformScale} ${1 / uniformScale}) translate(${-cx} ${-cy})`;
}

function TreatmentTimelineNode({
  cx,
  cy,
  point,
  scaleX,
  scaleY,
  isOpenTreatment = false,
  onShowTooltip,
  onHideTooltip,
}: {
  cx: number;
  cy: number;
  point: TratativaBehaviorTreatmentPoint;
  scaleX: number;
  scaleY: number;
  isOpenTreatment?: boolean;
  onShowTooltip: (target: HoverTarget, element: Element) => void;
  onHideTooltip: () => void;
}) {
  const iconW = isOpenTreatment ? TREATMENT_OPEN_ICON_W : TREATMENT_ICON_W;
  const iconH = isOpenTreatment ? TREATMENT_OPEN_ICON_H : TREATMENT_ICON_H;
  const iconX = cx - iconW / 2;
  const iconY = cy - iconH / 2;

  return (
    <g
      className={`tratativa-behavior-evolution__treatment-node${
        isOpenTreatment ? ' tratativa-behavior-evolution__treatment-node--open' : ''
      }`}
      transform={markerCounterScaleTransform(cx, cy, scaleX, scaleY)}
    >
      <rect
        x={iconX - TREATMENT_ICON_PAD}
        y={iconY - TREATMENT_ICON_PAD}
        width={iconW + TREATMENT_ICON_PAD * 2}
        height={iconH + TREATMENT_ICON_PAD * 2}
        className="tratativa-behavior-evolution__treatment-marker-bg"
        pointerEvents="none"
      />
      {isOpenTreatment ? (
        <svg
          x={iconX}
          y={iconY}
          width={iconW}
          height={iconH}
          viewBox="0 0 24 22"
          aria-hidden
          pointerEvents="none"
        >
          <path
            d="M3.5 7.25C3.5 4.73 5.48 2.75 8 2.75H16C18.52 2.75 20.5 4.73 20.5 7.25V14.25C20.5 16.77 18.52 18.75 16 18.75H10.75L7.25 21.25V18.75H8C5.48 18.75 3.5 16.77 3.5 14.25V7.25Z"
            className="tratativa-behavior-evolution__treatment-marker-bg"
          />
          <path
            d="M10.75 1.25L12.75 3.25H10.75V1.25Z"
            className="tratativa-behavior-evolution__treatment-marker-bg"
          />
          <g transform="translate(1.75, 3.25)">
            <path d={ANALYST_HEADSET_PATH} className="tratativa-behavior-evolution__treatment-marker-icon" />
          </g>
          <circle
            cx="19"
            cy="17"
            r="4.5"
            className="tratativa-behavior-evolution__treatment-marker-check-bg"
          />
          <path
            d="M17.1 17.05L18.35 18.45L20.95 15.15"
            className="tratativa-behavior-evolution__treatment-marker-check-icon"
          />
        </svg>
      ) : (
        <svg
          x={iconX}
          y={iconY}
          width={iconW}
          height={iconH}
          viewBox="0 0 21 19"
          aria-hidden
          pointerEvents="none"
        >
          <path d={ANALYST_HEADSET_PATH} className="tratativa-behavior-evolution__treatment-marker-icon" />
        </svg>
      )}
      <circle
        cx={cx}
        cy={cy}
        r={TREATMENT_HIT_RADIUS}
        fill="transparent"
        className="tratativa-behavior-evolution__treatment-hit-area"
        aria-label={`Tratativa: ${point.treatment.actionTitle}`}
        onMouseEnter={(event) => onShowTooltip({ kind: 'treatment', point }, event.currentTarget)}
        onMouseLeave={onHideTooltip}
        onFocus={(event) => onShowTooltip({ kind: 'treatment', point }, event.currentTarget)}
        onBlur={onHideTooltip}
        tabIndex={0}
        role="button"
      />
    </g>
  );
}

export const TratativaBehaviorEvolutionPanel: React.FC<TratativaBehaviorEvolutionPanelProps> = ({
  data,
  markLastTreatmentAsOpen = false,
}) => {
  const [hoverTarget, setHoverTarget] = useState<HoverTarget | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgScale, setSvgScale] = useState({ x: 1, y: 1 });

  const plotW = CHART_WIDTH - PAD.left - PAD.right;
  const plotH = CHART_HEIGHT - PAD.top - PAD.bottom;
  const viewBoxWidth = CHART_WIDTH - VIEWBOX_MIN_X + VIEWBOX_MAX_EXTRA;
  const windowStartMinutes = parseHourLabel(data.windowStartLabel);
  const plotCenterY = PAD.top + plotH / 2;

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const updateScale = () => {
      const { width, height } = svg.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      setSvgScale({ x: width / viewBoxWidth, y: height / CHART_HEIGHT });
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(svg);
    return () => observer.disconnect();
  }, [viewBoxWidth]);

  const sortedPoints = useMemo(() => sortChartPoints(data.points), [data.points]);
  const openTreatmentId = useMemo(() => {
    if (!markLastTreatmentAsOpen) return null;
    const treatments = sortedPoints.filter(
      (point): point is TratativaBehaviorTreatmentPoint => point.kind === 'treatment',
    );
    return treatments[treatments.length - 1]?.id ?? null;
  }, [markLastTreatmentAsOpen, sortedPoints]);

  const xTicks = useMemo(
    () => buildXTicks(data.windowStartLabel, data.windowEndLabel),
    [data.windowStartLabel, data.windowEndLabel],
  );
  const yTicks = useMemo(() => buildYTicks(data.maxScore), [data.maxScore]);

  const xPos = (minutesFromStart: number) =>
    PAD.left + (minutesFromStart / data.windowMinutes) * plotW;
  const yPos = (score: number) => PAD.top + plotH - (score / data.maxScore) * plotH;

  const linePath = useMemo(() => {
    if (sortedPoints.length === 0) return '';
    return sortedPoints
      .map((point, index) => {
        const x = xPos(point.minutesFromStart);
        const y = yPos(point.cumulativeScore);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [sortedPoints, data.windowMinutes, data.maxScore]);

  const showTooltip = (target: HoverTarget, element: Element) => {
    setHoverTarget(target);
    setAnchorRect(element.getBoundingClientRect());
  };

  const hideTooltip = () => {
    setHoverTarget(null);
    setAnchorRect(null);
  };

  return (
    <div className="tratativa-behavior-evolution">
      <div className="tratativa-behavior-evolution__chart-wrap">
        <svg
          ref={svgRef}
          className="tratativa-behavior-evolution__chart"
          viewBox={`${VIEWBOX_MIN_X} 0 ${viewBoxWidth} ${CHART_HEIGHT}`}
          preserveAspectRatio="none"
          role="img"
          aria-label="Gráfico de evolução do comportamento"
        >
          <g transform={markerCounterScaleTransform(Y_TITLE_X, plotCenterY, svgScale.x, svgScale.y)}>
            <text
              x={Y_TITLE_X}
              y={plotCenterY}
              className="tratativa-behavior-evolution__axis-title tratativa-behavior-evolution__axis-title--vertical"
              textAnchor="middle"
              dominantBaseline="central"
              transform={`rotate(-90, ${Y_TITLE_X}, ${plotCenterY})`}
            >
              Pontuação
            </text>
          </g>

          {yTicks.map((tick) => {
            const labelY = yPos(tick);
            return (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={yPos(tick)}
                x2={CHART_WIDTH - PAD.right}
                y2={yPos(tick)}
                className="tratativa-behavior-evolution__grid-line"
              />
              <text
                x={Y_LABEL_X}
                y={labelY}
                className="tratativa-behavior-evolution__axis-label tratativa-behavior-evolution__axis-label--y"
                textAnchor="end"
                dominantBaseline="central"
                transform={markerCounterScaleTransform(Y_LABEL_X, labelY, svgScale.x, svgScale.y)}
              >
                {tick}
              </text>
            </g>
            );
          })}

          <line
            x1={PAD.left}
            y1={PAD.top + plotH}
            x2={CHART_WIDTH - PAD.right}
            y2={PAD.top + plotH}
            className="tratativa-behavior-evolution__axis-line"
          />
          {xTicks.map((minutesFromStart) => {
            const labelX = xPos(minutesFromStart);
            return (
            <text
              key={minutesFromStart}
              x={labelX}
              y={X_HOUR_LABEL_Y}
              className="tratativa-behavior-evolution__axis-label"
              textAnchor="middle"
              dominantBaseline="central"
              transform={markerCounterScaleTransform(labelX, X_HOUR_LABEL_Y, svgScale.x, svgScale.y)}
            >
              {formatHourLabel(windowStartMinutes + minutesFromStart)}
            </text>
            );
          })}
          <text
            x={PAD.left + plotW / 2}
            y={X_AXIS_TITLE_Y}
            className="tratativa-behavior-evolution__axis-title tratativa-behavior-evolution__axis-title--x"
            textAnchor="middle"
            dominantBaseline="central"
            transform={markerCounterScaleTransform(
              PAD.left + plotW / 2,
              X_AXIS_TITLE_Y,
              svgScale.x,
              svgScale.y,
            )}
          >
            Últimas 12 horas
          </text>

          {linePath && (
            <path d={linePath} className="tratativa-behavior-evolution__line" fill="none" />
          )}

          {sortedPoints.map((point) => {
            const cx = xPos(point.minutesFromStart);
            const cy = yPos(point.cumulativeScore);

            if (point.kind === 'treatment') {
              return (
                <TreatmentTimelineNode
                  key={point.id}
                  cx={cx}
                  cy={cy}
                  point={point}
                  scaleX={svgScale.x}
                  scaleY={svgScale.y}
                  isOpenTreatment={point.id === openTreatmentId}
                  onShowTooltip={showTooltip}
                  onHideTooltip={hideTooltip}
                />
              );
            }

            const color = RISK_COLORS[point.riskLevel];
            return (
              <g
                key={point.id}
                transform={markerCounterScaleTransform(cx, cy, svgScale.x, svgScale.y)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={10}
                  fill="transparent"
                  className="tratativa-behavior-evolution__point-hit-area"
                  onMouseEnter={(event) =>
                    showTooltip({ kind: 'event', point }, event.currentTarget)
                  }
                  onMouseLeave={hideTooltip}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={EVENT_DOT_RADIUS}
                  fill={color}
                  className="tratativa-behavior-evolution__point-dot"
                  pointerEvents="none"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {hoverTarget && anchorRect && (
        <BehaviorChartTooltip target={hoverTarget} anchorRect={anchorRect} />
      )}
    </div>
  );
};

export default TratativaBehaviorEvolutionPanel;
