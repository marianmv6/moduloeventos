import React from 'react';

interface CrModalProps {
  open: boolean;
  title: string;
  /** Chamado ao clicar no X (fechar); pode exibir confirmação de dados não salvos */
  onClose: () => void;
  /** Chamado ao clicar em Cancelar no rodapé; se não informado, usa onClose */
  onCancel?: () => void;
  children: React.ReactNode;
  /** ID do form que será submetido pelo botão Salvar */
  formId?: string;
  primaryLabel?: string;
  cancelLabel?: string;
  /** Modal tela cheia: cobre até o nome da página, título no formato de nome de página, X na lateral, botões no rodapé */
  fullScreen?: boolean;
}

const CloseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const CrModal: React.FC<CrModalProps> = ({
  open,
  title,
  onClose,
  onCancel,
  children,
  formId,
  primaryLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  fullScreen = false,
}) => {
  const handleCancel = onCancel ?? onClose;
  if (!open) return null;

  return (
    <div
      className={`cr-modal-overlay ${fullScreen ? 'cr-modal-overlay--fullscreen' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cr-modal-title"
    >
      <div
        className={`cr-modal ${fullScreen ? 'cr-modal--fullscreen' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cr-modal__header">
          <h2 id="cr-modal-title" className={`cr-modal__title ${fullScreen ? 'cr-modal__title--page' : ''}`}>
            {title}
          </h2>
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
          {children}
        </div>
        <footer className="cr-modal__footer">
          <button type="button" className="cr-btn cr-btn--outline" onClick={handleCancel}>
            {cancelLabel}
          </button>
          {formId ? (
            <button type="submit" form={formId} className="cr-btn cr-btn--primary">
              {primaryLabel}
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  );
};

export default CrModal;
