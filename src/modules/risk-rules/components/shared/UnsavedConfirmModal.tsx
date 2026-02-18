import React from 'react';

interface UnsavedConfirmModalProps {
  open: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export const UnsavedConfirmModal: React.FC<UnsavedConfirmModalProps> = ({
  open,
  onSave,
  onDiscard,
}) => {
  if (!open) return null;

  return (
    <div className="modal-overlay confirm-modal-overlay unsaved-confirm-overlay" role="dialog" aria-modal="true">
      <div className="unsaved-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="unsaved-confirm-modal__icon" aria-hidden>
          <span className="unsaved-confirm-modal__question">?</span>
        </div>
        <h3 className="unsaved-confirm-modal__title">Confirme</h3>
        <p className="unsaved-confirm-modal__message">
          Você possui alterações não salvas. Gostaria de salvar antes de sair?
        </p>
        <div className="unsaved-confirm-modal__actions">
          <button type="button" className="btn unsaved-confirm-btn--outline" onClick={onDiscard}>
            Sair sem salvar
          </button>
          <button type="button" className="btn unsaved-confirm-btn--primary" onClick={onSave}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedConfirmModal;
