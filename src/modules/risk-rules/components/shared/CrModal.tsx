import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  /** Desabilita o botão primário (ex.: formulário inválido) */
  primaryDisabled?: boolean;
  /** Modal tela cheia: cobre até o nome da página, título no formato de nome de página, X na lateral, botões no rodapé */
  fullScreen?: boolean;
  /** Oculta o rodapé com ações (Cancelar / Salvar). */
  hideFooter?: boolean;
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
  primaryDisabled = false,
  hideFooter = false,
}) => {
  const handleCancel = onCancel ?? onClose;

  useEffect(() => {
    if (open && fullScreen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('cr-fullscreen-modal-open');
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.classList.remove('cr-fullscreen-modal-open');
      };
    }
  }, [open, fullScreen]);

  if (!open) return null;

  const overlay = (
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
        {!hideFooter && (
          <footer className="cr-modal__footer">
            <button type="button" className="cr-btn cr-btn--outline" onClick={handleCancel}>
              {cancelLabel}
            </button>
            {formId ? (
              <button
                type="submit"
                form={formId}
                className="cr-btn cr-btn--primary"
                disabled={primaryDisabled}
              >
                {primaryLabel}
              </button>
            ) : null}
          </footer>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    const portalRoot = document.querySelector('.app-content');
    if (portalRoot) {
      return createPortal(overlay, portalRoot);
    }
  }

  return overlay;
};

export default CrModal;
