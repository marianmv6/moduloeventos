import React from 'react';

/** Bolinha laranja que indica campo obrigatório (padrão Figma / design system). */
export const RequiredFieldMarker: React.FC = () => (
  <span className="form-label-required-dot" aria-hidden="true" />
);

export default RequiredFieldMarker;
