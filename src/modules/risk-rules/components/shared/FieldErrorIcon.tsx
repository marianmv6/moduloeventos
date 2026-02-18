import React from 'react';
import { LevelTooltip } from './LevelTooltip';

/** Ícone de erro de validação: círculo vermelho com exclamação branca (conforme padrão de campos obrigatórios não preenchidos). Tooltip: "Preencha corretamente este campo". className é repassado ao wrapper da tooltip (ex.: level-tooltip-wrap--tooltip-right). */
export const FieldErrorIcon: React.FC<{ ariaLabel?: string; className?: string }> = ({ ariaLabel = 'Campo obrigatório não preenchido', className }) => (
  <LevelTooltip text="Preencha corretamente este campo" className={className}>
    <span className="field-error-icon" role="img" aria-label={ariaLabel}>
      <span className="field-error-icon__mark">!</span>
    </span>
  </LevelTooltip>
);

export default FieldErrorIcon;
