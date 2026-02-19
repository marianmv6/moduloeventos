import React from 'react';

interface CrDrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Classe extra no drawer (ex.: cr-drawer--wide para mais largura) */
  className?: string;
}

const CloseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * Drawer lateral (padrão do sistema) para telas auxiliares.
 */
export const CrDrawer: React.FC<CrDrawerProps> = ({ open, title, onClose, children, className }) => {
  if (!open) return null;

  return (
    <div className="cr-drawer-overlay" onClick={onClose}>
      <div className={`cr-drawer ${className ?? ''}`.trim()} onClick={(e) => e.stopPropagation()}>
        <header className="cr-drawer__header">
          <h2 className="cr-drawer__title">{title}</h2>
          <button type="button" className="cr-drawer__close" onClick={onClose} aria-label="Fechar">
            <CloseIcon />
          </button>
        </header>
        <div className="cr-drawer__body">{children}</div>
      </div>
    </div>
  );
};

export default CrDrawer;
