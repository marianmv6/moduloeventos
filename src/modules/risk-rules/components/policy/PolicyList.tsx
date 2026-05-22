import React from 'react';
import type { Policy, PolicyTriggerNivelRisco, ScoreRule } from '../../types/risk.types';
import { EVENT_TYPE_LABELS } from '../../constants/eventTypes';
import { GRAVITY_FIELD_LABEL, GRAVITY_LABELS } from '../../constants/gravityConstants';
import { IconEdit, IconTrash } from '../shared/Icons';

function getEventosText(policy: Policy, scores: ScoreRule[]): string {
  const eventIds = Object.keys(policy.configEventos ?? {});
  const types = new Set<string>();
  eventIds.forEach((id) => {
    const score = scores.find((s) => s.id === id);
    if (score) types.add(EVENT_TYPE_LABELS[score.eventType]);
  });
  return [...types].sort().join(', ') || '—';
}

function getNivelRiscoText(policy: Policy): string {
  const levels = (policy.gatilhos ?? [])
    .map((g) => g.nivelRisco)
    .filter((v): v is PolicyTriggerNivelRisco => !!v)
    .map((v) => GRAVITY_LABELS[v]);
  const unique = [...new Set(levels)];
  return unique.join(', ') || '—';
}

interface PolicyListProps {
  policies: Policy[];
  scores: ScoreRule[];
  onEdit?: (policy: Policy) => void;
  onDelete?: (policy: Policy) => void;
  onToggleActive?: (policy: Policy) => void;
}

export const PolicyList: React.FC<PolicyListProps> = ({
  policies,
  scores,
  onEdit,
  onDelete,
  onToggleActive,
}) => (
  <div className="policy-list">
    <table className="list-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Tipo</th>
          <th>Eventos</th>
          <th>{GRAVITY_FIELD_LABEL}</th>
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
            <td>{policy.tipoAcompanhamento === 'motorista' ? 'Por motorista' : 'Por veículo'}</td>
            <td>{getEventosText(policy, scores)}</td>
            <td>{getNivelRiscoText(policy)}</td>
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
