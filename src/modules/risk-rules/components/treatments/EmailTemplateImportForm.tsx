import React, { useEffect, useRef, useState } from 'react';
import type { EmailTemplate } from '../../types/risk.types';
import { ModalSelect, type ModalSelectOption } from '../shared/ModalSelect';

const STATUS_OPTIONS: ModalSelectOption[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

const DESCRIPTION_MAX_LENGTH = 500;
const HTML_MAX_LENGTH = 200_000;

interface EmailTemplateImportFormProps {
  id?: string;
  initialData?: Partial<EmailTemplate> | null;
  onSubmit: (data: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onCancel: () => void;
  hideActions?: boolean;
}

export const EmailTemplateImportForm: React.FC<EmailTemplateImportFormProps> = ({
  id,
  initialData,
  onSubmit,
  onCancel,
  hideActions = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [customHtml, setCustomHtml] = useState(initialData?.customHtml ?? '');
  const [active, setActive] = useState(initialData?.active ?? true);
  const [importError, setImportError] = useState('');

  const isDefault = Boolean(initialData?.isDefault);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title ?? '');
      setDescription(initialData.description ?? '');
      setCustomHtml(initialData.customHtml ?? '');
      setActive(initialData.active ?? true);
    }
  }, [initialData?.id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!/\.html?$/i.test(file.name)) {
      setImportError('Selecione um arquivo .html ou .htm.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      if (!text.trim()) {
        setImportError('O arquivo HTML está vazio.');
        return;
      }
      setCustomHtml(text.slice(0, HTML_MAX_LENGTH));
      setImportError('');
    };
    reader.onerror = () => {
      setImportError('Não foi possível ler o arquivo. Tente novamente.');
    };
    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const titleTrimmed = title.trim();
    const htmlTrimmed = customHtml.trim();
    if (!titleTrimmed || !htmlTrimmed) return;

    onSubmit({
      ...(initialData?.id && { id: initialData.id }),
      title: titleTrimmed,
      description: description.trim() || undefined,
      active,
      isDefault: initialData?.isDefault,
      sourceType: 'imported',
      customHtml: htmlTrimmed,
      variables: {},
    });
  };

  const canSave = title.trim().length > 0 && customHtml.trim().length > 0;

  return (
    <form id={id} onSubmit={handleSubmit} className="email-template-form email-template-import-form">
      <div className="email-template-form__body">
        <div className="email-template-form__left">
          <div className="email-template-form__fields">
            <div className="form-group">
              <label htmlFor="email-import-title">Título</label>
              <input
                id="email-import-title"
                type="text"
                className="input-text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do e-mail na caixa de entrada"
                maxLength={120}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email-import-desc">Descrição</label>
              <textarea
                id="email-import-desc"
                className="textarea-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição interna (apenas para você)"
                rows={2}
                maxLength={DESCRIPTION_MAX_LENGTH}
              />
            </div>
            <div className={`form-group ${isDefault ? 'email-template-form__status-disabled' : ''}`}>
              <label htmlFor="email-import-status">Status</label>
              <ModalSelect
                id="email-import-status"
                options={STATUS_OPTIONS}
                value={active ? 'ativo' : 'inativo'}
                onChange={(value) => !isDefault && setActive(value === 'ativo')}
                disabled={isDefault}
                placeholder="Status"
              />
            </div>
          </div>

          <div className="email-template-import-form__upload">
            <div className="email-template-import-form__upload-header">
              <h3 className="email-template-form__vars-title">HTML do template</h3>
              <button
                type="button"
                className="cr-btn cr-btn--outline email-template-import-form__file-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Selecionar arquivo .html
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm,text/html"
                className="email-template-import-form__file-input"
                onChange={handleFileChange}
              />
            </div>
            <p className="email-template-form__vars-hint">
              Importe o HTML padrão de uso ou cole o conteúdo abaixo.
            </p>
            {importError && (
              <p className="email-template-import-form__error" role="alert">
                {importError}
              </p>
            )}
            <div className="form-group email-template-import-form__html-group">
              <textarea
                id="email-import-html"
                className="textarea-description email-template-import-form__html"
              value={customHtml}
              onChange={(e) => {
                setCustomHtml(e.target.value.slice(0, HTML_MAX_LENGTH));
                if (importError) setImportError('');
              }}
              placeholder="Cole aqui o HTML do seu template..."
              rows={14}
              spellCheck={false}
            />
            </div>
          </div>
        </div>

        <div className="email-template-form__right">
          <div className="email-template-form__preview">
            <header className="email-template-form__preview-header">
              <div className="email-template-form__preview-header-left">
                <span className="email-template-form__preview-title">Prévia do HTML</span>
              </div>
            </header>
            <div className="email-template-form__preview-content">
              {title.trim() && (
                <div className="email-template-form__preview-subject">
                  <span className="email-template-form__preview-subject-label">Assunto</span>
                  <span className="email-template-form__preview-subject-value">{title.trim()}</span>
                </div>
              )}
              {customHtml.trim() ? (
                <iframe
                  title="Prévia do HTML importado"
                  className="email-template-import-form__preview-frame"
                  sandbox=""
                  srcDoc={customHtml}
                />
              ) : (
                <div className="email-template-form__preview-empty-wrap">
                  <p className="email-template-form__preview-empty">
                    Importe ou cole um HTML para visualizar a prévia.
                  </p>
                </div>
              )}
            </div>
            <footer className="email-template-form__preview-footer">
              Esta é apenas uma simulação do e-mail final.
            </footer>
          </div>
        </div>
      </div>
      {!hideActions && (
        <div className="email-template-form__actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={!canSave}>
            Salvar
          </button>
        </div>
      )}
    </form>
  );
};

export default EmailTemplateImportForm;
