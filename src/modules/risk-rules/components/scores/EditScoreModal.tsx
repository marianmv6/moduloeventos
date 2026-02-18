import React, { useState, useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import type { ScoreRule } from '../../types/risk.types';
import { ScoreLevelBadge } from './ScoreLevelBadge';

interface EditScoreModalProps {
  open: boolean;
  score: ScoreRule | null;
  onSave: (scoreId: string, newWeight: number) => void;
  /** Chamado ao clicar no X (fechar); pode exibir confirmação de dados não salvos */
  onClose: () => void;
  /** Chamado ao clicar em Cancelar; fecha sem confirmação */
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export interface EditScoreModalRef {
  save: () => void;
}

const CloseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const EditScoreModal = forwardRef<EditScoreModalRef, EditScoreModalProps>(function EditScoreModal({
  open,
  score,
  onSave,
  onClose,
  onCancel,
  onDirtyChange,
}, ref) {
  const [pontuacao, setPontuacao] = useState<string>('');
  const [error, setError] = useState<string>('');

  const defaultWeight = score != null ? (score.defaultWeight ?? score.weight) : 0;
  const currentNum = pontuacao === '' ? null : parseInt(pontuacao, 10);
  const isValid = currentNum !== null && !Number.isNaN(currentNum) && currentNum >= 0;
  const canRetomarPadrao = score != null && currentNum !== null && currentNum !== defaultWeight;

  const initialWeightRef = useRef<string>('');
  useEffect(() => {
    if (open && score) {
      const s = String(score.weight);
      setPontuacao(s);
      initialWeightRef.current = s;
      setError('');
    }
  }, [open, score]);

  const isDirty = open && score != null && pontuacao !== initialWeightRef.current;
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSave = () => {
    const num = pontuacao === '' ? null : parseInt(pontuacao, 10);
    if (num === null || Number.isNaN(num)) {
      setError('Campo obrigatório.');
      return;
    }
    if (num < 0 || num > 999) {
      setError('A pontuação deve ser entre 0 e 999.');
      return;
    }
    if (score) {
      onSave(score.id, num);
      onCancel();
    }
  };

  const handleRetomarPadrao = () => {
    setPontuacao(String(defaultWeight));
    setError('');
  };

  useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave, score, pontuacao]);

  if (!open) return null;

  return (
    <div className="cr-modal-overlay" role="dialog" aria-modal="true">
      <div className="cr-modal" onClick={(e) => e.stopPropagation()}>
        <header className="cr-modal__header">
          <h2 className="cr-modal__title">Editar pontuação</h2>
          <button
            type="button"
            className="cr-modal__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="cr-modal__body">
          <div className="cr-modal__row">
            <label className="cr-modal__label">Nome do evento</label>
            <div className="cr-modal__input cr-modal__readonly" aria-readonly>
              {score?.name ?? '-'}
            </div>
          </div>

          <div className="cr-modal__row">
            <label className="cr-modal__label" htmlFor="edit-score-pontuacao">Pontuação</label>
            <input
              id="edit-score-pontuacao"
              type="number"
              min={0}
              max={999}
              value={pontuacao}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '' || (v.length <= 3 && parseInt(v, 10) <= 999)) setPontuacao(v);
                setError('');
              }}
              className={`cr-modal__input ${error ? 'input-error' : ''}`}
              aria-required
              aria-invalid={!!error}
            />
            {error && <span className="form-error" role="alert">{error}</span>}
            {currentNum !== null && !Number.isNaN(currentNum) && currentNum >= 0 && (
              <div className="edit-score-badge-wrap">
                <ScoreLevelBadge points={currentNum} />
              </div>
            )}
            {canRetomarPadrao && (
              <button
                type="button"
                className="cr-btn cr-btn--outline btn-retomar-padrao"
                onClick={handleRetomarPadrao}
              >
                Retomar padrão
              </button>
            )}
          </div>
        </div>

        <footer className="cr-modal__footer">
          <button type="button" className="cr-btn cr-btn--outline" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="cr-btn cr-btn--primary"
            onClick={handleSave}
            disabled={!isValid}
          >
            Salvar
          </button>
        </footer>
      </div>
    </div>
  );
});

export default EditScoreModal;
