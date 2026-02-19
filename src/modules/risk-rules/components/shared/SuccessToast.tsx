import React, { useEffect } from 'react';

export type ToastVariant = 'success' | 'warning';

interface SuccessToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
  variant?: ToastVariant;
}

const effectiveDuration = (variant: ToastVariant, duration: number) =>
  variant === 'warning' ? duration + 1000 : duration;

export const SuccessToast: React.FC<SuccessToastProps> = ({
  message,
  visible,
  onClose,
  duration = 3000,
  variant = 'success',
}) => {
  const durationMs = effectiveDuration(variant, duration);
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [visible, durationMs, onClose]);

  if (!visible) return null;

  const toastClass =
    variant === 'warning'
      ? 'toast toast-warning toast-bottom'
      : 'toast toast-success toast-bottom';

  const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const XIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <div className={toastClass}>
      <span className={`toast-icon ${variant === 'success' ? 'toast-icon--success' : 'toast-icon--warning'}`} aria-hidden>
        {variant === 'success' ? <CheckIcon /> : <XIcon />}
      </span>
      <span className="toast-message">{message}</span>
    </div>
  );
};

export default SuccessToast;
