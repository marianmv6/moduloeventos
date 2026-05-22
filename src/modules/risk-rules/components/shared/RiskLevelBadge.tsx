import React from 'react';
import type { RiskLevel } from '../../types/risk.types';
import { GRAVITY_LABELS, normalizeGravityLevel } from '../../constants/gravityConstants';
import { LevelTooltip } from './LevelTooltip';

const levelTooltipText: Record<RiskLevel, string> = {
  low: '1 - 19 pontos',
  medium: '20 - 39 pontos',
  high: '40 + pontos',
  critical: '40 + pontos',
};

const levelClass: Record<RiskLevel, string> = {
  low: 'risk-badge--low',
  medium: 'risk-badge--medium',
  high: 'risk-badge--high',
  critical: 'risk-badge--critical',
};

interface RiskLevelBadgeProps {
  level: RiskLevel | 'grave';
  className?: string;
}

export const RiskLevelBadge: React.FC<RiskLevelBadgeProps> = ({ level: rawLevel, className = '' }) => {
  const level = (normalizeGravityLevel(rawLevel) ?? 'high') as RiskLevel;
  return (
    <LevelTooltip text={levelTooltipText[level]}>
      <span className={`risk-badge ${levelClass[level]} ${className}`.trim()}>
        {GRAVITY_LABELS[level]}
      </span>
    </LevelTooltip>
  );
};

export default RiskLevelBadge;
