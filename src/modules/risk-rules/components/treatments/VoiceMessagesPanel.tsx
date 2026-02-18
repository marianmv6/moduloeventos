import React, { useState } from 'react';
import type { VoiceMessage } from '../../types/risk.types';
import { CrModal } from '../shared/CrModal';
import { FieldErrorIcon } from '../shared/FieldErrorIcon';
import { ModalSelect, type ModalSelectOption } from '../shared/ModalSelect';
import { IconEdit, IconTrash } from '../shared/Icons';

const STATUS_OPTIONS: ModalSelectOption[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

const FORMAT_OPTIONS: ModalSelectOption[] = [
  { value: 'WAV', label: 'WAV' },
  { value: 'MP3', label: 'MP3' },
];

interface VoiceMessagesPanelProps {
  voiceMessages: VoiceMessage[];
  onSave: (msg: Omit<VoiceMessage, 'id'> & { id?: string }) => void;
  onDelete: (msg: VoiceMessage) => void;
}

export const VoiceMessagesPanel: React.FC<VoiceMessagesPanelProps> = ({
  voiceMessages,
  onSave,
  onDelete,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VoiceMessage | null>(null);
  const [identification, setIdentification] = useState('');
  const [message, setMessage] = useState('');
  const [format, setFormat] = useState<'WAV' | 'MP3'>('MP3');
  const [active, setActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{ identification?: boolean; message?: boolean }>({});

  /** Apenas letras, números e espaços (sem caracteres especiais), máx. 70 caracteres. */
  const sanitizeMessage = (val: string) =>
    val.replace(/[^a-zA-Z0-9\u00C0-\u024F\s]/g, '').slice(0, 70);

  const openNew = () => {
    setEditing(null);
    setIdentification('');
    setMessage('');
    setFormat('MP3');
    setActive(true);
    setFieldErrors({});
    setModalOpen(true);
  };
  const openEdit = (m: VoiceMessage) => {
    setEditing(m);
    setIdentification(m.identification);
    setMessage(sanitizeMessage(m.message));
    setFormat(m.format);
    setActive(m.active);
    setFieldErrors({});
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setFieldErrors({});
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(sanitizeMessage(e.target.value));
    if (fieldErrors.message) setFieldErrors((err) => ({ ...err, message: false }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const idTrimmed = identification.trim();
    const msgTrimmed = message.trim();
    const errors = { identification: !idTrimmed, message: !msgTrimmed };
    setFieldErrors(errors);
    if (errors.identification || errors.message) return;
    onSave({
      ...(editing?.id && { id: editing.id }),
      identification: idTrimmed,
      message: msgTrimmed,
      format,
      active,
    });
    closeModal();
  };

  return (
    <>
      <div className="drawer-toolbar drawer-toolbar--end">
        <button type="button" className="btn btn-primary" onClick={openNew}>
          Nova mensagem de voz
        </button>
      </div>
      <div className="voice-messages-table-wrap drawer-voice-messages-table">
        <table className="list-table">
          <thead>
            <tr>
              <th>Identificação</th>
              <th>Mensagem</th>
              <th>Formato</th>
              <th>Ativo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {voiceMessages.length === 0 ? (
              <tr>
                <td colSpan={5} className="list-empty">
                  Nenhuma mensagem de voz cadastrada.
                </td>
              </tr>
            ) : (
              voiceMessages.map((m) => (
                <tr key={m.id}>
                  <td>{m.identification}</td>
                  <td className="cell-message">{m.message}</td>
                  <td>{m.format}</td>
                  <td>
                    <span className={`badge badge-rounded ${m.active ? 'badge-active' : 'badge-inactive'}`}>
                      {m.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="list-cell-actions">
                    <div className="list-actions">
                      <button
                        type="button"
                        className="btn btn-icon-action"
                        onClick={() => openEdit(m)}
                        aria-label="Editar"
                      >
                        <IconEdit />
                      </button>
                      <button
                        type="button"
                        className="btn btn-icon-action ds-icon-danger"
                        onClick={() => onDelete(m)}
                        aria-label="Excluir"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CrModal
        open={modalOpen}
        title={editing ? 'Editar mensagem de voz' : 'Nova mensagem de voz'}
        onClose={closeModal}
        formId="voice-message-form"
        primaryLabel="Salvar"
        cancelLabel="Cancelar"
      >
        <form id="voice-message-form" className="form-card voice-message-form" onSubmit={handleSubmit}>
          <div className={`form-group ${fieldErrors.identification ? 'has-error' : ''}`}>
            <div className="form-group__label-row">
              <label htmlFor="voice-ident">Identificação</label>
            </div>
            <div className="form-group__input-with-error">
              <input
                id="voice-ident"
                type="text"
                value={identification}
                onChange={(e) => {
                  setIdentification(e.target.value);
                  if (fieldErrors.identification) setFieldErrors((err) => ({ ...err, identification: false }));
                }}
                placeholder="Texto livre"
                className={fieldErrors.identification ? 'input-error' : ''}
                aria-invalid={fieldErrors.identification}
              />
              {fieldErrors.identification && (
                <span className="form-group__field-error-icon">
                  <FieldErrorIcon />
                </span>
              )}
            </div>
          </div>
          <div className={`form-group ${fieldErrors.message ? 'has-error' : ''}`}>
            <div className="form-group__label-row">
              <label htmlFor="voice-message">Mensagem</label>
            </div>
            <div className="form-group__input-with-error">
              <textarea
                id="voice-message"
                rows={3}
                maxLength={70}
                value={message}
                onChange={handleMessageChange}
                placeholder="Texto para ser reproduzido (apenas letras e números, máx. 70 caracteres)"
                className={`voice-message-textarea ${fieldErrors.message ? 'input-error' : ''}`}
                aria-invalid={fieldErrors.message}
              />
              {fieldErrors.message && (
                <span className="form-group__field-error-icon">
                  <FieldErrorIcon />
                </span>
              )}
            </div>
          </div>
          <div className="form-group">
            <ModalSelect
              id="voice-format"
              label="Formato"
              value={format}
              onChange={(v) => setFormat(v as 'WAV' | 'MP3')}
              options={FORMAT_OPTIONS}
              placeholder="Selecione"
            />
          </div>
          <div className="form-group">
            <ModalSelect
              id="voice-status"
              label="Status"
              value={active ? 'ativo' : 'inativo'}
              onChange={(v) => setActive(v === 'ativo')}
              options={STATUS_OPTIONS}
              placeholder="Selecione o status"
            />
          </div>
          <p className="form-hint">Mensagens inativas não aparecem na seleção da criação/edição de tratativas.</p>
        </form>
      </CrModal>
    </>
  );
};

export default VoiceMessagesPanel;
