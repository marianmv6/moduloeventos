import React, { useState, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AppTooltipBubble } from './AppTooltipBubble';

interface LevelTooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
  nowrap?: boolean;
  /** Quando definido, a tooltip é renderizada em portal (não corta no drawer) e posicionada acima do texto/célula em que o usuário passou o mouse */
  positionAboveColumn?: {
    tableRef: React.RefObject<HTMLTableElement | null>;
    columnIndex: number;
  };
  /** Quando true, a tooltip é renderizada em portal com z-index alto (camada superior) para ficar sempre visível */
  topLayer?: boolean;
  /** Alinhamento horizontal quando topLayer: center (padrão) ou end (ancora à direita do elemento) */
  topLayerAlign?: 'center' | 'end';
  /** Ref do elemento âncora (ex.: checkbox). Quando topLayer e anchorRef, a tooltip é centralizada em cima deste elemento, como em Pontos. */
  anchorRef?: React.RefObject<HTMLElement | null>;
}

const TOOLTIP_OFFSET_Y = -8;

export const LevelTooltip: React.FC<LevelTooltipProps> = ({
  text,
  children,
  className = '',
  nowrap = false,
  positionAboveColumn,
  topLayer = false,
  topLayerAlign = 'center',
  anchorRef,
}) => {
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const mouseXRef = useRef<number>(0);

  const isTooltipRight = className.includes('level-tooltip-wrap--tooltip-right');

  const updatePositionRef = useRef<() => void>(() => {});
  updatePositionRef.current = () => {
    if (!tooltipRef.current) return;
    const tooltipEl = tooltipRef.current;
    const style = tooltipEl.style;
    if (positionAboveColumn && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      style.left = `${mouseXRef.current}px`;
      style.top = `${rect.top}px`;
      style.transform = `translate(-50%, -100%) translateY(${TOOLTIP_OFFSET_Y}px)`;
    } else if (topLayer) {
      const anchor = anchorRef?.current ?? wrapRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const anchorX = topLayerAlign === 'end' ? rect.right : rect.left + rect.width / 2;
      const translateX = topLayerAlign === 'end' ? '-100%' : '-50%';
      style.left = `${anchorX}px`;
      style.top = `${rect.top}px`;
      style.transform = `translate(${translateX}, -100%) translateY(${TOOLTIP_OFFSET_Y}px)`;

      requestAnimationFrame(() => {
        const tooltipRect = tooltipEl.getBoundingClientRect();
        const pad = 8;
        let shiftX = 0;
        if (tooltipRect.right > window.innerWidth - pad) {
          shiftX -= tooltipRect.right - (window.innerWidth - pad);
        }
        if (tooltipRect.left + shiftX < pad) {
          shiftX += pad - (tooltipRect.left + shiftX);
        }
        if (shiftX !== 0) {
          style.left = `${anchorX + shiftX}px`;
        }
      });
    }
  };

  useLayoutEffect(() => {
    if (!visible || (!positionAboveColumn && !topLayer)) return;
    const apply = () => {
      if (tooltipRef.current && (wrapRef.current || anchorRef?.current)) updatePositionRef.current();
    };
    apply();
    if (topLayer) {
      const rafId = requestAnimationFrame(apply);
      return () => cancelAnimationFrame(rafId);
    }
  }, [visible, positionAboveColumn, topLayer, anchorRef]);

  useLayoutEffect(() => {
    if (!visible || !topLayer) return;
    const onUpdate = () => updatePositionRef.current();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [visible, topLayer]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    mouseXRef.current = e.clientX;
    setVisible(true);
  };

  const renderTooltip = () => {
    if (!visible) return null;

    if (positionAboveColumn) {
      return createPortal(
        <span ref={tooltipRef} style={{ position: 'fixed', left: 0, top: 0, zIndex: 1100 }}>
          <AppTooltipBubble
            text={text}
            className="level-tooltip level-tooltip--above-header policy-form-header-info-tooltip"
            nowrap={nowrap}
          />
        </span>,
        document.body,
      );
    }

    if (topLayer) {
      return createPortal(
        <span ref={tooltipRef} style={{ position: 'fixed', left: 0, top: 0, zIndex: 99999 }}>
          <AppTooltipBubble
            text={text}
            className="policy-form-header-info-tooltip"
            nowrap={nowrap}
          />
        </span>,
        document.body,
      );
    }

    return (
      <AppTooltipBubble
        text={text}
        className={`level-tooltip${isTooltipRight ? ' level-tooltip--side' : ''}`}
        nowrap={nowrap}
        arrow={isTooltipRight ? 'left' : 'down'}
      />
    );
  };

  return (
    <span
      ref={wrapRef}
      className={`level-tooltip-wrap ${className}`.trim()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {renderTooltip()}
    </span>
  );
};

export default LevelTooltip;
