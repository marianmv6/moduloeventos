import React from 'react';

interface AppliedConfirmModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal 2 - Confirmação de alteração aplicada.
 * Título: Confirme. Corpo: As alterações realizadas passarão a valer apenas para eventos gerados após a sua aplicação.
 * Botões: Cancelar e Ok (ambos fecham a modal).
 */
export const AppliedConfirmModal: React.FC<AppliedConfirmModalProps> = ({
  open,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="modal-overlay confirm-modal-overlay unsaved-confirm-overlay" role="dialog" aria-modal="true">
      <div className="unsaved-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="unsaved-confirm-modal__icon" aria-hidden>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="22" stroke="#E29C2C" strokeWidth="2.5" fill="none" />
            <text x="26" y="34" textAnchor="middle" fill="#E29C2C" fontSize="28" fontWeight="bold" fontFamily="sans-serif">?</text>
          </svg>
        </div>
        <h3 className="unsaved-confirm-modal__title">Confirme</h3>
        <p className="unsaved-confirm-modal__message">
          As alterações realizadas passarão a valer apenas para eventos gerados após a sua aplicação.
        </p>
        <div className="unsaved-confirm-modal__actions">
          <button type="button" className="btn unsaved-confirm-btn--primary" onClick={onClose}>
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppliedConfirmModal;
