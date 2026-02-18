import React from 'react';
import type { Trail } from '../../types/risk.types';
import { IconEdit, IconTrash } from '../shared/Icons';

const TRACKING_LABEL: Record<Trail['trackingType'], string> = {
  motorista: 'Por motorista',
  veiculo: 'Por veículo',
};

const MODE_LABEL: Record<Trail['mode'], string> = {
  points: 'Pontos',
  levels: 'Níveis',
};

interface TrailListProps {
  trails: Trail[];
  onEdit?: (trail: Trail) => void;
  onDelete?: (trail: Trail) => void;
}

export const TrailList: React.FC<TrailListProps> = ({
  trails,
  onEdit,
  onDelete,
}) => (
  <div className="treatment-list trail-list">
    <table className="list-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Tipo</th>
          <th>Modo</th>
          <th>Etapas</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {trails.map((t) => (
          <tr key={t.id}>
            <td>{t.name}</td>
            <td>{TRACKING_LABEL[t.trackingType]}</td>
            <td>{MODE_LABEL[t.mode]}</td>
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

export default TrailList;
