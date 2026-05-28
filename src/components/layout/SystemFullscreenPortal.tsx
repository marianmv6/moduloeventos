import React from 'react';
import { createPortal } from 'react-dom';

/**
 * Portal em document.body para modais de sistema (validação/tratativa)
 * que devem cobrir menu lateral e toda a viewport.
 */
export const SystemFullscreenPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (typeof document === 'undefined') return <>{children}</>;
  return createPortal(children, document.body);
};

export default SystemFullscreenPortal;
