import React from 'react';
import type { OperacoesOrganizationGroup } from '../types/operacoesOrganization.types';

interface OrganizationGroupsFieldProps {
  label: string;
  groups: OperacoesOrganizationGroup[];
}

export const OrganizationGroupsField: React.FC<OrganizationGroupsFieldProps> = ({
  label,
  groups,
}) => (
  <div className="operacoes-event-detail-field operacoes-event-detail-field--full">
    <label className="cr-modal__label">{label}</label>
    <div className="operacoes-org-groups-box" aria-readonly>
      <div className="operacoes-org-groups-box__chips">
        {groups.length > 0 ? (
          groups.map((group) => (
            <span
              key={group.label}
              className={`operacoes-org-group-chip operacoes-org-group-chip--${group.variant}`}
            >
              {group.label}
            </span>
          ))
        ) : (
          <span className="operacoes-org-groups-box__empty">—</span>
        )}
      </div>
    </div>
  </div>
);

export default OrganizationGroupsField;
