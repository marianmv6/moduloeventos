import React from 'react';

/** Ilustração padrão: trilha/roteiro vazio */
const DefaultTrailIllustration: React.FC = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      d="M12 40c0-6 4-12 8-14 4-2 12-2 16 2s6 10 6 14-2 8-6 10-12 2-18-2-6-8-6-10z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.5"
    />
    <path
      d="M28 26l8 8 16-16 12 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.6"
    />
    <circle cx="40" cy="40" r="24" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
  </svg>
);

interface EmptyStateProps {
  image?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Estado vazio: imagem + texto + botão opcional (padrão do sistema).
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  image,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="empty-state">
    <div className="empty-state__image">{image ?? <DefaultTrailIllustration />}</div>
    <h3 className="empty-state__title">{title}</h3>
    {description && <p className="empty-state__description">{description}</p>}
    {actionLabel && onAction && (
      <button type="button" className="btn btn-primary" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
