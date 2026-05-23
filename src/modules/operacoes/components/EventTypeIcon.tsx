import React from 'react';
import type { OperacoesEventCategory } from '../types/operacoes.types';
import { OPERACOES_FIGMA_ICON_SRC } from '../icons/operacoesFigmaIconPaths';

interface EventTypeIconProps {
  category: OperacoesEventCategory;
}

export const EventTypeIcon: React.FC<EventTypeIconProps> = ({ category }) => {
  const src =
    category !== 'outro' ? OPERACOES_FIGMA_ICON_SRC[category] : undefined;

  if (!src) {
    return (
      <svg
        className="operacoes-event-icon-figma"
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" stroke="#169EFF" strokeWidth="2.5" fill="none" />
      </svg>
    );
  }

  const isPng = src.endsWith('.png');

  return (
    <img
      src={src}
      width={24}
      height={24}
      alt=""
      className={`operacoes-event-icon-figma${isPng ? ' operacoes-event-icon-figma--png' : ''}`}
      draggable={false}
      decoding="async"
    />
  );
};
