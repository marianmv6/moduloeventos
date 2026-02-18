import React from 'react';
import type { TreatmentStep } from '../../types/risk.types';
import { IconEdit, IconTrash } from '../shared/Icons';

interface TreatmentStepCardProps {
  step: TreatmentStep;
  onEdit?: (step: TreatmentStep) => void;
  onRemove?: (step: TreatmentStep) => void;
  canReorder?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const TreatmentStepCard: React.FC<TreatmentStepCardProps> = ({
  step,
  onEdit,
  onRemove,
  canReorder,
  onMoveUp,
  onMoveDown,
}) => (
  <div className="treatment-step-card">
    <div className="treatment-step-order">{step.order}</div>
    <div className="treatment-step-body">
      {step.label}
      <span className="treatment-step-action">{step.action}</span>
    </div>
    <div className="treatment-step-actions">
      {canReorder && (
        <>
          {onMoveUp && <button type="button" className="btn btn-icon" onClick={onMoveUp} aria-label="Subir">↑</button>}
          {onMoveDown && <button type="button" className="btn btn-icon" onClick={onMoveDown} aria-label="Descer">↓</button>}
        </>
      )}
      {onEdit && (
        <button
          type="button"
          className="btn btn-icon-action"
          onClick={() => onEdit(step)}
          aria-label="Editar"
        >
          <IconEdit />
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          className="btn btn-icon-action ds-icon-danger"
          onClick={() => onRemove(step)}
          aria-label="Remover"
        >
          <IconTrash />
        </button>
      )}
    </div>
  </div>
);

export default TreatmentStepCard;
