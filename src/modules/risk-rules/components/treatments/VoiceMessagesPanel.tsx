import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import type { VoiceMessage, VoiceMessageLanguage, VoiceMessageDevice } from '../../types/risk.types';
import { CrModal } from '../shared/CrModal';
import { FieldErrorIcon } from '../shared/FieldErrorIcon';
import { ModalSelect, type ModalSelectOption } from '../shared/ModalSelect';
import { IconEdit, IconTrash } from '../shared/Icons';
import { AdvancedFilter, type AdvancedFilterField } from '../shared/AdvancedFilter';
import { COMPANY_OPTIONS, getCompanyName } from '../../constants/companies';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const STATUS_OPTIONS: ModalSelectOption[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

const LANGUAGE_OPTIONS: ModalSelectOption[] = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'Inglês' },
  { value: 'es', label: 'Espanhol' },
];

const MESSAGE_MAX_LENGTH = 200;
const DEFAULT_DEVICE: VoiceMessageDevice = 'K1 Plus';

export interface VoiceMessagesPanelHandle {
  openNew: () => void;
  toggleFilter: () => void;
  getAppliedFilterCount: () => number;
  isFilterOpen: () => boolean;
}

interface VoiceMessagesPanelProps {
  voiceMessages: VoiceMessage[];
  onSave: (msg: Omit<VoiceMessage, 'id'> & { id?: string }) => void;
  onDelete: (msg: VoiceMessage) => void;
  hideToolbar?: boolean;
  onFilterStateChange?: (state: { open: boolean; appliedCount: number }) => void;
}

export const VoiceMessagesPanel = forwardRef<VoiceMessagesPanelHandle, VoiceMessagesPanelProps>(
  function VoiceMessagesPanel({ voiceMessages, onSave, onDelete, hideToolbar = false, onFilterStateChange }, ref) {
  const currentUser = useCurrentUser();
  const isClient = currentUser.kind === 'client';
  const defaultCompanyId = currentUser.companyId ?? COMPANY_OPTIONS[0].value;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VoiceMessage | null>(null);
  const [companyId, setCompanyId] = useState(defaultCompanyId);
  const [identification, setIdentification] = useState('');
  const [language, setLanguage] = useState<VoiceMessageLanguage>('pt');
  const [message, setMessage] = useState('');
  const [active, setActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{ identification?: boolean; message?: boolean }>({});

  const EMPTY_FILTERS = { empresa: '', status: '' };
  const [filters, setFilters] = useState<{ empresa: string; status: string }>(
    EMPTY_FILTERS,
  );
  const [filterOpen, setFilterOpen] = useState(false);

  const appliedCount = useMemo(
    () => Object.values(filters).filter((v) => v.trim() !== '').length,
    [filters],
  );

  React.useEffect(() => {
    onFilterStateChange?.({ open: filterOpen, appliedCount });
  }, [filterOpen, appliedCount, onFilterStateChange]);

  const filterFields: AdvancedFilterField<{ empresa: string; status: string }>[] = [
    { key: 'empresa', label: 'Empresa', options: currentUser.availableCompanies },
    { key: 'status', label: 'Status', options: STATUS_OPTIONS },
  ];

  const filteredMessages = useMemo(() => {
    const baseList = isClient
      ? voiceMessages.filter((m) => m.companyId === currentUser.companyId)
      : voiceMessages;
    return baseList.filter((m) => {
      if (filters.empresa && m.companyId !== filters.empresa) return false;
      if (filters.status) {
        const want = filters.status === 'ativo';
        if (m.active !== want) return false;
      }
      return true;
    });
  }, [voiceMessages, filters, isClient, currentUser.companyId]);

  /** Apenas letras, números e espaços (sem caracteres especiais). */
  const sanitizeMessage = (val: string, max: number) =>
    val.replace(/[^a-zA-Z0-9\u00C0-\u024F\s]/g, '').slice(0, max);

  const openNew = () => {
    setEditing(null);
    setCompanyId(defaultCompanyId);
    setIdentification('');
    setLanguage('pt');
    setMessage('');
    setActive(true);
    setFieldErrors({});
    setModalOpen(true);
  };

  useImperativeHandle(
    ref,
    () => ({
      openNew,
      toggleFilter: () => setFilterOpen((v) => !v),
      getAppliedFilterCount: () => appliedCount,
      isFilterOpen: () => filterOpen,
    }),
    [appliedCount, filterOpen],
  );

  const openEdit = (m: VoiceMessage) => {
    setEditing(m);
    setCompanyId(m.companyId ?? defaultCompanyId);
    setIdentification(m.identification);
    setLanguage((m.language ?? 'pt') as VoiceMessageLanguage);
    setMessage(sanitizeMessage(m.message, MESSAGE_MAX_LENGTH));
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
    setMessage(sanitizeMessage(e.target.value, MESSAGE_MAX_LENGTH));
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
      companyId,
      identification: idTrimmed,
      language,
      message: msgTrimmed,
      device: editing?.device ?? DEFAULT_DEVICE,
      format: editing?.format ?? 'WAV',
      active,
    });
    closeModal();
  };

  return (
    <>
      {!hideToolbar && (
        <div className="drawer-toolbar drawer-toolbar--end">
          <button type="button" className="btn btn-primary" onClick={openNew}>
            Nova mensagem de voz
          </button>
        </div>
      )}
      <AdvancedFilter
        fields={filterFields}
        values={filters}
        onApply={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
        emptyValues={EMPTY_FILTERS}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        ariaLabel="Filtros de mensagens de voz"
      />
      <div className="policy-list voice-messages-table-wrap drawer-voice-messages-table">
        <table className="list-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Identificação</th>
              <th>Mensagem</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.length === 0 ? (
              <tr>
                <td colSpan={5} className="list-empty">
                  Nenhuma mensagem de voz cadastrada.
                </td>
              </tr>
            ) : (
              filteredMessages.map((m) => (
                <tr key={m.id}>
                  <td>{getCompanyName(m.companyId)}</td>
                  <td>{m.identification}</td>
                  <td className="cell-message">{m.message}</td>
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
          <div className="form-group">
            <ModalSelect
              id="voice-company"
              label="Empresa"
              value={companyId}
              onChange={(v) => setCompanyId(v)}
              options={currentUser.availableCompanies}
              placeholder="Selecione a empresa"
              disabled={isClient}
              className="modal-select--no-pill"
            />
          </div>
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
                maxLength={MESSAGE_MAX_LENGTH}
                value={message}
                onChange={handleMessageChange}
                placeholder={`Texto para ser reproduzido (apenas letras e números, máx. ${MESSAGE_MAX_LENGTH} caracteres)`}
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
          <p className="form-hint">Mensagens inativas não aparecem na seleção da criação/edição de tratativas.</p>
        </form>
      </CrModal>
    </>
  );
});

export default VoiceMessagesPanel;
