import React from 'react';
import type { Policy } from '../../types/risk.types';
import { IconEdit, IconTrash } from '../shared/Icons';

interface PolicyListProps {
  policies: Policy[];
  onEdit?: (policy: Policy) => void;
  onDelete?: (policy: Policy) => void;
  onToggleActive?: (policy: Policy) => void;
}

export const PolicyList: React.FC<PolicyListProps> = ({
  policies,
  onEdit,
  onDelete,
  onToggleActive,
}) => (
  <div className="policy-list">
    <table className="list-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Janela de tempo</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {policies.map((policy) => (
          <tr key={policy.id}>
            <td>
              {policy.name}
              {policy.description && (
                <span className="list-description">{policy.description}</span>
              )}
            </td>
            <td>{policy.janela}h</td>
            <td>
              <span className={`badge badge-rounded ${policy.active ? 'badge-active' : 'badge-inactive'}`}>
                {policy.active ? 'Ativo' : 'Inativo'}
              </span>
            </td>
            <td className="list-cell-actions">
              <div className="list-actions">
                {onEdit && (
                  <button
                    type="button"
                    className="btn btn-icon-action"
                    onClick={() => onEdit(policy)}
                    aria-label="Editar"
                  >
                    <IconEdit />
                  </button>
                )}
                {onToggleActive && (
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => onToggleActive(policy)}>
                    {policy.active ? 'Desativar' : 'Ativar'}
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    className="btn btn-icon-action ds-icon-danger"
                    onClick={() => onDelete(policy)}
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

export default PolicyList;
