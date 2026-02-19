import React, { useState } from 'react';
import type { VoiceMessage, VoiceMessageLanguage, VoiceMessageDevice } from '../../types/risk.types';
import { CrModal } from '../shared/CrModal';
import { FieldErrorIcon } from '../shared/FieldErrorIcon';
import { ModalSelect, type ModalSelectOption } from '../shared/ModalSelect';
import { IconEdit, IconTrash } from '../shared/Icons';

const STATUS_OPTIONS: ModalSelectOption[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

const LANGUAGE_OPTIONS: ModalSelectOption[] = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'Inglês' },
  { value: 'es', label: 'Espanhol' },
];

const DEVICE_OPTIONS: ModalSelectOption[] = [
  { value: 'K1 Plus', label: 'K1 Plus' },
  { value: 'G5 Plus', label: 'G5 Plus' },
];

const MESSAGE_MAX_LENGTH_DEVICE = 200;
const MESSAGE_MAX_LENGTH_DEFAULT = 70;

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
  const [language, setLanguage] = useState<VoiceMessageLanguage>('pt');
  const [device, setDevice] = useState<VoiceMessageDevice>('K1 Plus');
  const [message, setMessage] = useState('');
  const [active, setActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{ identification?: boolean; message?: boolean }>({});

  const messageMaxLength = device === 'K1 Plus' || device === 'G5 Plus' ? MESSAGE_MAX_LENGTH_DEVICE : MESSAGE_MAX_LENGTH_DEFAULT;
  const formatFromDevice: 'WAV' | 'MP3' = device === 'G5 Plus' ? 'MP3' : 'WAV';
  const formatLabel = device === 'K1 Plus' ? 'WAV disponível' : device === 'G5 Plus' ? 'MP3' : '';

  /** Apenas letras, números e espaços (sem caracteres especiais), até máx. conforme dispositivo. */
  const sanitizeMessage = (val: string, max: number) =>
    val.replace(/[^a-zA-Z0-9\u00C0-\u024F\s]/g, '').slice(0, max);

  const openNew = () => {
    setEditing(null);
    setIdentification('');
    setLanguage('pt');
    setDevice('K1 Plus');
    setMessage('');
    setActive(true);
    setFieldErrors({});
    setModalOpen(true);
  };
  const openEdit = (m: VoiceMessage) => {
    setEditing(m);
    setIdentification(m.identification);
    setLanguage((m.language ?? 'pt') as VoiceMessageLanguage);
    setDevice((m.device ?? 'K1 Plus') as VoiceMessageDevice);
    setMessage(sanitizeMessage(m.message, m.device === 'K1 Plus' || m.device === 'G5 Plus' ? MESSAGE_MAX_LENGTH_DEVICE : MESSAGE_MAX_LENGTH_DEFAULT));
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
    setMessage(sanitizeMessage(e.target.value, messageMaxLength));
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
      language,
      message: msgTrimmed,
      device,
      format: formatFromDevice,
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
              <th>Dispositivo</th>
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
                  <td>{m.device ?? '-'}</td>
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
                maxLength={messageMaxLength}
                value={message}
                onChange={handleMessageChange}
                placeholder={`Texto para ser reproduzido (apenas letras e números, máx. ${messageMaxLength} caracteres)`}
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
          <div className="voice-message-form__row">
            <div className="form-group">
              <ModalSelect
                id="voice-language"
                label="Idioma"
                value={language}
                onChange={(v) => setLanguage(v as VoiceMessageLanguage)}
                options={LANGUAGE_OPTIONS}
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
          </div>
          <div className="voice-message-form__row">
            <div className="form-group">
              <ModalSelect
                id="voice-device"
                label="Dispositivo"
                value={device}
                onChange={(v) => setDevice(v as VoiceMessageDevice)}
                options={DEVICE_OPTIONS}
                placeholder="Selecione"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Formato</label>
              <div className="form-readonly-value">{formatLabel}</div>
            </div>
          </div>
          <p className="form-hint">Mensagens inativas não aparecem na seleção da criação/edição de tratativas.</p>
        </form>
      </CrModal>
    </>
  );
};

export default VoiceMessagesPanel;
