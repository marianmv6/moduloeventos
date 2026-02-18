import React from 'react';
import type { RiskLevel } from '../../types/risk.types';
import { LevelTooltip } from './LevelTooltip';

const levelLabels: Record<RiskLevel, string> = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
  critical: 'Crítico',
};

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
  level: RiskLevel;
  className?: string;
}

export const RiskLevelBadge: React.FC<RiskLevelBadgeProps> = ({ level, className = '' }) => (
  <LevelTooltip text={levelTooltipText[level]}>
    <span className={`risk-badge ${levelClass[level]} ${className}`.trim()}>
      {levelLabels[level]}
    </span>
  </LevelTooltip>
);

export default RiskLevelBadge;
