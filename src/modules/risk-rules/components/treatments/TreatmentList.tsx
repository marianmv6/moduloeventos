import React from 'react';
import type { Treatment } from '../../types/risk.types';
import { RiskLevelBadge } from '../shared/RiskLevelBadge';
import { IconEdit, IconTrash } from '../shared/Icons';

interface TreatmentListProps {
  treatments: Treatment[];
  onEdit?: (treatment: Treatment) => void;
  onDelete?: (treatment: Treatment) => void;
  onToggleActive?: (treatment: Treatment) => void;
}

export const TreatmentList: React.FC<TreatmentListProps> = ({
  treatments,
  onEdit,
  onDelete,
  onToggleActive,
}) => (
  <div className="treatment-list">
    <table className="list-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Tipo</th>
          <th>Etapas</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {treatments.map((t) => (
          <tr key={t.id}>
            <td>
              {t.name}
              {t.description && (
                <span className="list-description">{t.description}</span>
              )}
            </td>
            <td><RiskLevelBadge level={t.riskLevel} /></td>
            <td>{t.steps.length} etapa(s)</td>
            <td>
              <span className={`badge badge-rounded ${t.active ? 'badge-active' : 'badge-inactive'}`}>
                {t.active ? 'Ativo' : 'Inativo'}
              </span>
            </td>
            <td className="list-cell-actions">
              <div className="list-actions">
                {onEdit && (
                  <button
                    type="button"
                    className="btn btn-icon-action"
                    onClick={() => onEdit(t)}
                    aria-label="Editar"
                  >
                    <IconEdit />
                  </button>
                )}
                {onToggleActive && (
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => onToggleActive(t)}>
                    {t.active ? 'Desativar' : 'Ativar'}
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    className="btn btn-icon-action ds-icon-danger"
                    onClick={() => onDelete(t)}
                    aria-label="Excluir"
                  >
                    <IconTrash />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TreatmentList;
