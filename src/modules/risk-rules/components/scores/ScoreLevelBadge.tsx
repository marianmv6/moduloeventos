import React from 'react';
import { LevelTooltip } from '../shared/LevelTooltip';
import { getScoreLevel } from './scoreLevel';

const levelTooltipByKey: Record<string, string> = {
  low: '1 - 19 pontos',
  medium: '20 - 39 pontos',
  high: '40 + pontos',
  none: '',
};

interface ScoreLevelBadgeProps {
  points: number;
  className?: string;
}

export const ScoreLevelBadge: React.FC<ScoreLevelBadgeProps> = ({ points, className = '' }) => {
  const { key, label, className: levelClass } = getScoreLevel(points);
  const tooltipText = levelTooltipByKey[key] ?? '';
  const badge = (
    <span className={`risk-badge ${levelClass} ${className}`.trim()}>
      {label}
    </span>
  );
  if (!tooltipText) return badge;
  return (
    <LevelTooltip text={tooltipText}>
      {badge}
    </LevelTooltip>
  );
};

export default ScoreLevelBadge;
