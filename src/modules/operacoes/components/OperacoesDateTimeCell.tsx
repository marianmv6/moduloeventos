import React from 'react';
import { LevelTooltip } from '../../risk-rules/components/shared/LevelTooltip';
import {
  formatBrowserDatetimeFromIso,
  formatLocalTimeTooltip,
  formatMatrixDatetimeFromIso,
} from '../utils/operacoesDateTimeDisplay';

interface OperacoesDateTimeCellProps {
  occurredAtIso: string;
  seed: string;
  className?: string;
}

/** Coluna data/hora: valor no fuso do navegador; tooltip com horário local + UTC. */
export const OperacoesDateTimeCell: React.FC<OperacoesDateTimeCellProps> = ({
  occurredAtIso,
  seed,
  className = 'operacoes-col-data operacoes-time',
}) => {
  const display = formatBrowserDatetimeFromIso(occurredAtIso);
  const matrixRef = formatMatrixDatetimeFromIso(occurredAtIso);
  const tooltip = formatLocalTimeTooltip(matrixRef, seed);

  return (
    <td className={className}>
      <LevelTooltip text={tooltip} topLayer nowrap>
        <span>{display}</span>
      </LevelTooltip>
    </td>
  );
};

export default OperacoesDateTimeCell;
