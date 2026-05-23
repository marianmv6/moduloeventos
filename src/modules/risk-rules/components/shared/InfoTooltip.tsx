import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconInfo } from './Icons';
import { AppTooltipBubble } from './AppTooltipBubble';

interface InfoTooltipProps {
  text: string;
  /** Classe no wrapper (ex.: para alinhar com cabeçalho da tabela) */
  className?: string;
}

const TOOLTIP_OFFSET_Y = -8;

/** Ícone de informação (teal) + tooltip no padrão existente; tooltip em portal com z-index alto para ficar acima de tudo. */
export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, className = '' }) => {
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!visible || !tooltipRef.current || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const tip = tooltipRef.current;
    tip.style.left = `${rect.left + rect.width / 2}px`;
    tip.style.top = `${rect.top}px`;
    tip.style.transform = `translate(-50%, -100%) translateY(${TOOLTIP_OFFSET_Y}px)`;
  }, [visible]);

  const handleMouseEnter = () => {
    setVisible(true);
  };

  return (
    <>
      <span
        ref={wrapRef}
        className={`policy-form-header-info-wrap ${className}`.trim()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setVisible(false)}
        role="img"
        aria-label="Informação"
      >
        <IconInfo />
      </span>
      {visible &&
        createPortal(
          <span ref={tooltipRef} style={{ position: 'fixed', left: 0, top: 0, zIndex: 99999 }}>
            <AppTooltipBubble text={text} className="policy-form-header-info-tooltip" />
          </span>,
          document.body,
        )}
    </>
  );
};

export default InfoTooltip;
