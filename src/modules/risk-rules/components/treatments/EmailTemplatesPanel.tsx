import React from 'react';
import type { EmailTemplate } from '../../types/risk.types';
import { IconEdit, IconTrash } from '../shared/Icons';
import { DEFAULT_TEMPLATE_ID } from '../../constants/emailTemplateConstants';

interface EmailTemplatesPanelProps {
  templates: EmailTemplate[];
  onNew: () => void;
  onEdit: (template: EmailTemplate) => void;
  onDelete: (template: EmailTemplate) => void;
  /** Oculta o CTA interno (usado quando o botão fica no cabeçalho da página) */
  hideToolbar?: boolean;
}

export const EmailTemplatesPanel: React.FC<EmailTemplatesPanelProps> = ({
  templates,
  onNew,
  onEdit,
  onDelete,
  hideToolbar = false,
}) => {
  return (
    <>
      {!hideToolbar && (
        <div className="drawer-toolbar drawer-toolbar--end">
          <button type="button" className="btn btn-primary" onClick={onNew}>
            Novo E-mail
          </button>
        </div>
      )}
      <div className="policy-list email-templates-table-wrap drawer-email-templates-table">
        <table className="list-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Descrição</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 ? (
              <tr>
                <td colSpan={4} className="list-empty">
                  Nenhum template de e-mail cadastrado.
                </td>
              </tr>
            ) : (
              templates.map((t) => (
                <tr key={t.id}>
                  <td>{t.title || '—'}</td>
                  <td className="drawer-email-templates-table__desc-cell">{t.description ?? '—'}</td>
                  <td>
                    <span className={`badge badge-rounded ${t.active ? 'badge-active' : 'badge-inactive'}`}>
                      {t.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="list-cell-actions">
                    <div className="list-actions">
                      <button
                        type="button"
                        className="btn btn-icon-action"
                        onClick={() => onEdit(t)}
                        aria-label="Editar"
                      >
                        <IconEdit />
                      </button>
                      {t.id !== DEFAULT_TEMPLATE_ID && !t.isDefault && (
                        <button
                          type="button"
                          className="btn btn-icon-action ds-icon-danger"
                          onClick={() => onDelete(t)}
                          aria-label="Excluir"
                        >
                          <IconTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default EmailTemplatesPanel;
