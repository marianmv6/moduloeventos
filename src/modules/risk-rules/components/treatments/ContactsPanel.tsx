import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import type { Contact, ContactPreference } from '../../types/risk.types';
import { CONTACT_PREFERENCE_OPTIONS, CONTACT_TYPE_LABELS, contactTypeDisplay } from '../../constants/contactDisplay';
import { CrModal } from '../shared/CrModal';
import { FieldErrorIcon } from '../shared/FieldErrorIcon';
import { FormFieldLabel } from '../shared/FormFieldLabel';
import { RequiredFieldMarker } from '../shared/RequiredFieldMarker';
import { IconEdit, IconTrash } from '../shared/Icons';
import { ModalSelect, type ModalSelectOption } from '../shared/ModalSelect';
import { AdvancedFilter, type AdvancedFilterField } from '../shared/AdvancedFilter';
import { COMPANY_OPTIONS } from '../../constants/companies';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { ContactWorkScheduleTable } from './ContactWorkScheduleTable';
import {
  contactDayScheduleStateFromContact,
  contactDayScheduleStateToWeeklySchedule,
  createEmptyContactDayScheduleState,
  formatContactWeeklySchedule,
  validateContactDayScheduleState,
  type ContactDayScheduleState,
} from '../../utils/contactSchedule';

const OUTSIDE_HOURS_OPTIONS: ModalSelectOption[] = [
  { value: 'true', label: 'Sim' },
  { value: 'false', label: 'Não' },
];

const CONTACT_TYPE_OPTIONS: ModalSelectOption[] = [
  { value: 'individual', label: CONTACT_TYPE_LABELS.individual },
  { value: 'whatsapp_group', label: CONTACT_TYPE_LABELS.whatsapp_group },
];

type ContactTypeValue = 'individual' | 'whatsapp_group';

function ContactTypeField({
  value,
  onChange,
}: {
  value: ContactTypeValue;
  onChange: (value: string) => void;
}) {
  return (
    <div className="form-group">
      <label htmlFor="contact-type" className="modal-select__label form-field__label">
        <span className="form-field__label-text">Tipo de contato</span>
        <RequiredFieldMarker />
      </label>
      <ModalSelect
        id="contact-type"
        value={value}
        onChange={onChange}
        options={CONTACT_TYPE_OPTIONS}
        placeholder="Selecione"
        className="modal-select--no-pill"
      />
    </div>
  );
}

const DESCRIPTION_MAX_LENGTH = 30;

/** Máscara telefone: DDD + 9 dígitos → (XX) 9XXXX-XXXX */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)}${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function phoneToRaw(formatted: string): string {
  return formatted.replace(/\D/g, '');
}

function parseContactPreferences(value: string): ContactPreference[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean) as ContactPreference[];
}

export interface ContactsPanelHandle {
  openNew: () => void;
  /** Alterna o painel de filtro avançado (botão fica na toolbar do parent). */
  toggleFilter: () => void;
  /** Quantidade de filtros aplicados (para o badge no botão da toolbar). */
  getAppliedFilterCount: () => number;
  /** Indica se o painel está aberto (para destacar o botão na toolbar). */
  isFilterOpen: () => boolean;
}

interface ContactsPanelProps {
  contacts: Contact[];
  onSave: (contact: Omit<Contact, 'id'> & { id?: string }) => void;
  onDelete: (contact: Contact) => void;
  /** Mensagem exibida em toast de aviso (ex.: validação de horários) */
  onValidationError?: (message: string) => void;
  /** Oculta o CTA interno (usado quando o botão fica no cabeçalho da página) */
  hideToolbar?: boolean;
  /** Notifica o parent sobre mudanças no filtro (estado/contagem) para sincronizar a toolbar. */
  onFilterStateChange?: (state: { open: boolean; appliedCount: number }) => void;
}

type ContactFilters = { nome: string; tipoContato: string };

export const ContactsPanel = forwardRef<ContactsPanelHandle, ContactsPanelProps>(function ContactsPanel(
  { contacts, onSave, onDelete, onValidationError, hideToolbar = false, onFilterStateChange },
  ref
) {
  const currentUser = useCurrentUser();
  const isClient = currentUser.kind === 'client';
  const defaultCompanyId = currentUser.companyId ?? COMPANY_OPTIONS[0].value;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [contactType, setContactType] = useState<ContactTypeValue>('individual');
  const [individualName, setIndividualName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [weeklyScheduleState, setWeeklyScheduleState] = useState<ContactDayScheduleState>(
    createEmptyContactDayScheduleState,
  );
  const [contactPreferencesValue, setContactPreferencesValue] = useState('');
  const [acceptOutsideHours, setAcceptOutsideHours] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: boolean; phone?: boolean; email?: boolean }>({});

  const EMPTY_FILTERS: ContactFilters = { nome: '', tipoContato: '' };
  const [filters, setFilters] = useState<ContactFilters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const filterFields: AdvancedFilterField<ContactFilters>[] = [
    {
      key: 'nome',
      label: 'Nome',
      options: [...new Set(contacts.map((c) => c.name).filter(Boolean) as string[])]
        .sort()
        .map((n) => ({ value: n, label: n })),
    },
    { key: 'tipoContato', label: 'Tipo de contato', options: CONTACT_TYPE_OPTIONS },
  ];

  const appliedCount = useMemo(
    () => Object.values(filters).filter((v) => v.trim() !== '').length,
    [filters],
  );

  React.useEffect(() => {
    onFilterStateChange?.({ open: filterOpen, appliedCount });
  }, [filterOpen, appliedCount, onFilterStateChange]);

  const filteredContacts = useMemo(() => {
    const baseList = isClient ? contacts.filter((c) => c.companyId === currentUser.companyId) : contacts;
    return baseList.filter((c) => {
      if (filters.nome && c.name !== filters.nome) return false;
      if (filters.tipoContato === 'whatsapp_group' && !c.isWhatsAppGroup) return false;
      if (filters.tipoContato === 'individual' && c.isWhatsAppGroup) return false;
      return true;
    });
  }, [contacts, filters, isClient, currentUser.companyId]);

  const isWhatsAppGroup = contactType === 'whatsapp_group';
  const contactPreferences = useMemo(
    () => parseContactPreferences(contactPreferencesValue),
    [contactPreferencesValue],
  );
  const phoneRequired =
    !isWhatsAppGroup &&
    (contactPreferences.includes('whatsapp') || contactPreferences.includes('ligacao'));
  const emailRequired = !isWhatsAppGroup && contactPreferences.includes('email');

  const resetFormFields = () => {
    setContactType('individual');
    setIndividualName('');
    setGroupName('');
    setPhone('');
    setEmail('');
    setDescription('');
    setWeeklyScheduleState(createEmptyContactDayScheduleState());
    setContactPreferencesValue('');
    setAcceptOutsideHours('');
    setFieldErrors({});
  };

  const openNew = () => {
    setEditing(null);
    resetFormFields();
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

  const openEdit = (c: Contact) => {
    setEditing(c);
    const isGroup = c.isWhatsAppGroup === true;
    setContactType(isGroup ? 'whatsapp_group' : 'individual');
    setIndividualName(isGroup ? '' : (c.name ?? ''));
    setGroupName(isGroup ? (c.name ?? '') : '');
    setPhone(c.phone ? formatPhone(c.phone) : '');
    setEmail(c.email ?? '');
    setDescription(c.description ?? '');
    setWeeklyScheduleState(contactDayScheduleStateFromContact(c));
    setContactPreferencesValue(c.contactPreferences?.length ? c.contactPreferences.join(', ') : '');
    setAcceptOutsideHours(
      c.acceptContactOutsideHours === true ? 'true' : c.acceptContactOutsideHours === false ? 'false' : '',
    );
    setFieldErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setFieldErrors({});
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
    if (fieldErrors.phone) setFieldErrors((e2) => ({ ...e2, phone: false }));
  };

  const handleContactTypeChange = (value: string) => {
    setContactType(value === 'whatsapp_group' ? 'whatsapp_group' : 'individual');
    setFieldErrors({});
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const descriptionTrimmed = description.trim();

    if (isWhatsAppGroup) {
      const nameTrimmed = groupName.trim();
      const nameInvalid = !nameTrimmed;
      setFieldErrors({ name: nameInvalid });
      if (nameInvalid) return;

      onSave({
        ...(editing?.id && { id: editing.id }),
        companyId: editing?.companyId ?? defaultCompanyId,
        isWhatsAppGroup: true,
        name: nameTrimmed,
        description: descriptionTrimmed || undefined,
      });
      closeModal();
      return;
    }

    const nameTrimmed = individualName.trim();
    const phoneRaw = phoneToRaw(phone);
    const emailTrimmed = email.trim();
    const preferences = parseContactPreferences(contactPreferencesValue);
    const phoneRequired = preferences.includes('whatsapp') || preferences.includes('ligacao');
    const emailRequired = preferences.includes('email');
    const nameInvalid = !nameTrimmed;
    const phoneInvalid = phoneRequired && phoneRaw.length < 10;
    const emailInvalid = emailRequired && (!emailTrimmed || !emailTrimmed.includes('@'));
    const errors = { name: nameInvalid, phone: phoneInvalid, email: emailInvalid };
    setFieldErrors(errors);
    if (nameInvalid || phoneInvalid || emailInvalid) {
      onValidationError?.('Verifique os campos não preenchidos antes de salvar.');
      return;
    }

    const scheduleError = validateContactDayScheduleState(weeklyScheduleState);
    if (scheduleError) {
      onValidationError?.(scheduleError);
      return;
    }

    const weeklySchedule = contactDayScheduleStateToWeeklySchedule(weeklyScheduleState);
    const contactPreferencesParsed = preferences.length ? preferences : undefined;
    onSave({
      ...(editing?.id && { id: editing.id }),
      companyId: editing?.companyId ?? defaultCompanyId,
      isWhatsAppGroup: false,
      name: nameTrimmed,
      phone: formatPhone(phoneRaw),
      email: emailTrimmed,
      description: descriptionTrimmed || undefined,
      weeklySchedule,
      contactPreferences: contactPreferencesParsed?.length ? contactPreferencesParsed : undefined,
      acceptContactOutsideHours:
        acceptOutsideHours === 'true' ? true : acceptOutsideHours === 'false' ? false : undefined,
    });
    closeModal();
  };

  const modalTitle = editing
    ? isWhatsAppGroup
      ? 'Editar grupo de WhatsApp'
      : 'Editar contato'
    : isWhatsAppGroup
      ? 'Novo grupo de WhatsApp'
      : 'Novo contato';

  return (
    <>
      {!hideToolbar && (
        <div className="drawer-toolbar drawer-toolbar--end">
          <button type="button" className="btn btn-primary" onClick={openNew}>
            Novo contato
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
        ariaLabel="Filtros de contatos"
      />
      <div className="contacts-table-wrap drawer-contacts-table">
        <table className="list-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Escala de trabalho</th>
              <th>Descrição</th>
              <th>Tipo de contato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="list-empty">
                  Nenhum contato cadastrado.
                </td>
              </tr>
            ) : (
              filteredContacts.map((c) => (
                <tr key={c.id}>
                  <td>{c.name ?? '—'}</td>
                  <td>{c.isWhatsAppGroup ? '—' : (c.phone ?? '—')}</td>
                  <td>{c.isWhatsAppGroup ? '—' : (c.email ?? '—')}</td>
                  <td>
                    {c.isWhatsAppGroup ? (
                      '—'
                    ) : (
                      <span className="contact-turnos-cell">{formatContactWeeklySchedule(c)}</span>
                    )}
                  </td>
                  <td className="drawer-contacts-table__desc-cell">{c.description ?? '—'}</td>
                  <td>{contactTypeDisplay(c)}</td>
                  <td className="list-cell-actions">
                    <div className="list-actions">
                      <button
                        type="button"
                        className="btn btn-icon-action"
                        onClick={() => openEdit(c)}
                        aria-label="Editar"
                      >
                        <IconEdit />
                      </button>
                      <button
                        type="button"
                        className="btn btn-icon-action ds-icon-danger"
                        onClick={() => onDelete(c)}
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
        title={modalTitle}
        onClose={closeModal}
        formId="contact-form"
        primaryLabel="Salvar"
        cancelLabel="Cancelar"
        fullScreen
      >
        <form id="contact-form" onSubmit={handleSubmit} className="form-card contact-form">
          {isWhatsAppGroup ? (
            <>
              <div className="form-row form-row--contact-header form-row--contact-group">
                <ContactTypeField value={contactType} onChange={handleContactTypeChange} />
                <div className={`form-field ${fieldErrors.name ? 'has-error' : ''}`}>
                  <FormFieldLabel htmlFor="contact-group-name" required>
                    Nome do grupo
                  </FormFieldLabel>
                  <div className="form-field__input-wrap">
                    <input
                      id="contact-group-name"
                      type="text"
                      value={groupName}
                      maxLength={DESCRIPTION_MAX_LENGTH}
                      onChange={(e) => {
                        setGroupName(e.target.value);
                        if (fieldErrors.name) setFieldErrors((err) => ({ ...err, name: false }));
                      }}
                      placeholder="Digite o nome do grupo"
                      className={fieldErrors.name ? 'input-error' : ''}
                      aria-invalid={fieldErrors.name}
                    />
                    {fieldErrors.name && (
                      <span className="form-group__field-error-icon">
                        <FieldErrorIcon />
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="contact-group-desc">Descrição</label>
                <div className="form-field__input-wrap">
                  <input
                    id="contact-group-desc"
                    type="text"
                    value={description}
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrição livre"
                  />
                </div>
              </div>
              <p className="contact-whatsapp-group-notice" role="note">
                Insira o nome do grupo de WhatsApp na qual a central de tratativas deverá entrar em contato.
              </p>
            </>
          ) : (
            <>
              <div className="form-row form-row--contact-header">
                <ContactTypeField value={contactType} onChange={handleContactTypeChange} />
                <div className={`form-field ${fieldErrors.name ? 'has-error' : ''}`}>
                  <FormFieldLabel htmlFor="contact-name" required>
                    Nome
                  </FormFieldLabel>
                  <div className="form-field__input-wrap">
                    <input
                      id="contact-name"
                      type="text"
                      value={individualName}
                      onChange={(e) => {
                        setIndividualName(e.target.value);
                        if (fieldErrors.name) setFieldErrors((err) => ({ ...err, name: false }));
                      }}
                      placeholder="Nome"
                      className={fieldErrors.name ? 'input-error' : ''}
                      aria-invalid={fieldErrors.name}
                    />
                    {fieldErrors.name && (
                      <span className="form-group__field-error-icon">
                        <FieldErrorIcon />
                      </span>
                    )}
                  </div>
                </div>
                <div className={`form-field ${fieldErrors.phone ? 'has-error' : ''}`}>
                  <FormFieldLabel htmlFor="contact-phone" required={phoneRequired}>
                    Telefone
                  </FormFieldLabel>
                  <div className="form-field__input-wrap">
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="(00) 00000-0000"
                      maxLength={16}
                      className={fieldErrors.phone ? 'input-error' : ''}
                      aria-invalid={fieldErrors.phone}
                    />
                    {fieldErrors.phone && (
                      <span className="form-group__field-error-icon">
                        <FieldErrorIcon />
                      </span>
                    )}
                  </div>
                </div>
                <div className={`form-field ${fieldErrors.email ? 'has-error' : ''}`}>
                  <FormFieldLabel htmlFor="contact-email" required={emailRequired}>
                    Email
                  </FormFieldLabel>
                  <div className="form-field__input-wrap">
                    <input
                      id="contact-email"
                      type="text"
                      inputMode="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors((err) => ({ ...err, email: false }));
                      }}
                      placeholder="email@exemplo.com"
                      className={fieldErrors.email ? 'input-error' : ''}
                      aria-invalid={fieldErrors.email}
                    />
                    {fieldErrors.email && (
                      <span className="form-group__field-error-icon">
                        <FieldErrorIcon />
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ContactWorkScheduleTable
                value={weeklyScheduleState}
                onChange={setWeeklyScheduleState}
              />
              <div className="contact-form-row contact-form-row--split">
                <div className="form-group">
                  <ModalSelect
                    id="contact-preferences"
                    label="Preferência de contato"
                    value={contactPreferencesValue}
                    onChange={(v) => {
                      setContactPreferencesValue(v);
                      setFieldErrors((err) => ({ ...err, phone: false, email: false }));
                    }}
                    options={CONTACT_PREFERENCE_OPTIONS}
                    placeholder="(Digite ou selecione)"
                    multiple
                    mutedPlaceholder
                    className="modal-select--no-pill"
                  />
                </div>
                <div className="form-group">
                  <ModalSelect
                    id="contact-outside-hours"
                    label="Aceita contato fora do horário?"
                    value={acceptOutsideHours}
                    onChange={setAcceptOutsideHours}
                    options={OUTSIDE_HOURS_OPTIONS}
                    placeholder="(Digite ou selecione)"
                    mutedPlaceholder
                    className="modal-select--no-pill"
                  />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="contact-desc">Descrição</label>
                <div className="form-field__input-wrap">
                  <input
                    id="contact-desc"
                    type="text"
                    value={description}
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrição livre"
                  />
                </div>
              </div>
            </>
          )}
        </form>
      </CrModal>
    </>
  );
});

export default ContactsPanel;
