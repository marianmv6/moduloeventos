import React, { useState, useEffect } from 'react';
import type { ScoreRule } from '../../types/risk.types';
import { EVENT_TYPE_LABELS } from '../../constants/eventTypes';
import { ScoreLevelBadge } from './ScoreLevelBadge';

interface EditAllScoresModalProps {
  open: boolean;
  scores: ScoreRule[];
  onSave: (updates: Array<{ id: string; weight: number }>) => void;
  onCancel: () => void;
}

const CloseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const EditAllScoresModal: React.FC<EditAllScoresModalProps> = ({
  open,
  scores,
  onSave,
  onCancel,
}) => {
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && scores.length > 0) {
      const initial: Record<string, string> = {};
      scores.forEach((s) => {
        initial[s.id] = String(s.weight);
      });
      setWeights(initial);
      setErrors({});
    }
  }, [open, scores]);

  if (!open) return null;

  const setWeight = (id: string, value: string) => {
    if (value !== '') {
      const n = parseInt(value, 10);
      if (!Number.isNaN(n) && n > 999) value = '999';
      else if (value.length > 3) return;
    }
    setWeights((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const validateAndSave = () => {
    const newErrors: Record<string, string> = {};
    const updates: Array<{ id: string; weight: number }> = [];

    scores.forEach((s) => {
      const raw = weights[s.id] ?? '';
      const num = raw === '' ? NaN : parseInt(raw, 10);
      if (raw === '' || Number.isNaN(num)) {
        newErrors[s.id] = 'Campo obrigatório.';
        return;
      }
      if (num < 0 || num > 999) {
        newErrors[s.id] = 'A pontuação deve ser entre 0 e 999.';
        return;
      }
      updates.push({ id: s.id, weight: num });
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(updates);
    onCancel();
  };

  return (
    <div className="cr-modal-overlay" role="dialog" aria-modal="true">
      <div className="cr-modal cr-modal--edit-all" onClick={(e) => e.stopPropagation()}>
        <header className="cr-modal__header">
          <h2 className="cr-modal__title">Editar todas as pontuações</h2>
          <button
            type="button"
            className="cr-modal__close"
            onClick={onCancel}
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="cr-modal__body">
          <div className="edit-all-scores-list">
            {scores.map((score) => {
              const raw = weights[score.id] ?? '';
              const num = raw === '' ? null : parseInt(raw, 10);
              const isValid = num !== null && !Number.isNaN(num) && num >= 0;
              const err = errors[score.id];

              return (
                <div key={score.id} className="edit-all-scores-row">
                  <div className="edit-all-scores-cell edit-all-scores-name">
                    <span className="edit-all-scores-event-name">{score.name}</span>
                    <span className="edit-all-scores-event-type">{EVENT_TYPE_LABELS[score.eventType]}</span>
                  </div>
                  <div className="edit-all-scores-cell edit-all-scores-input-wrap">
                    <label className="cr-modal__label" htmlFor={`edit-all-${score.id}`}>
                      Pontuação
                    </label>
                    <input
                      id={`edit-all-${score.id}`}
                      type="number"
                      min={0}
                      max={999}
                      value={raw}
                      onChange={(e) => setWeight(score.id, e.target.value)}
                      className={`cr-modal__input ${err ? 'input-error' : ''}`}
                      aria-invalid={!!err}
                    />
                    {err && (
                      <span className="form-error" role="alert">
                        {err}
                      </span>
                    )}
                  </div>
                  <div className="edit-all-scores-cell edit-all-scores-badge">
                    {isValid && <ScoreLevelBadge points={num!} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <footer className="cr-modal__footer">
          <button type="button" className="cr-btn cr-btn--outline" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="cr-btn cr-btn--primary" onClick={validateAndSave}>
            Salvar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default EditAllScoresModal;
