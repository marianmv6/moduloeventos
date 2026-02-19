import React from 'react';
import type { ScoreRule } from '../../types/risk.types';
import { EVENT_TYPE_LABELS } from '../../constants/eventTypes';
import { IconEdit } from '../shared/Icons';
import { ScoreLevelBadge } from './ScoreLevelBadge';

interface ScoreListProps {
  scores: ScoreRule[];
  onEdit?: (score: ScoreRule) => void;
}

export const ScoreList: React.FC<ScoreListProps> = ({ scores, onEdit }) => (
  <div className="score-list">
    <table className="list-table">
      <thead>
        <tr>
          <th>Evento</th>
          <th>Tipo</th>
          <th>Pontuação</th>
          <th>Nível</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {scores.map((score) => (
          <tr key={score.id}>
            <td>{score.name}</td>
            <td>{EVENT_TYPE_LABELS[score.eventType]}</td>
            <td><span className="score-value-cell">{score.weight}</span></td>
            <td>
              <ScoreLevelBadge points={score.weight} />
            </td>
            <td className="list-cell-actions">
              <div className="list-actions">
                {onEdit && (
                  <button
                    type="button"
                    className="btn btn-icon-action"
                    onClick={() => onEdit(score)}
                    aria-label="Editar"
                  >
                    <IconEdit />
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

export default ScoreList;
