import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import type { Contact, ContactShift } from '../../types/risk.types';
import { CrModal } from '../shared/CrModal';
import { FieldErrorIcon } from '../shared/FieldErrorIcon';
import { IconEdit, IconTrash } from '../shared/Icons';
import { ModalSelect, type ModalSelectOption } from '../shared/ModalSelect';
import { TimePicker } from '../shared/TimePicker';
import { AdvancedFilter, type AdvancedFilterField } from '../shared/AdvancedFilter';
import { COMPANY_OPTIONS, getCompanyName } from '../../constants/companies';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const TURNOS_OPTIONS: ModalSelectOption[] = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
  { value: 'madrugada', label: 'Madrugada' },
];

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

export const ContactsPanel = forwardRef<ContactsPanelHandle, ContactsPanelProps>(function ContactsPanel(
  { contacts, onSave, onDelete, onValidationError, hideToolbar = false, onFilterStateChange },
  ref
) {
  const currentUser = useCurrentUser();
  const isClient = currentUser.kind === 'client';
  const defaultCompanyId = currentUser.companyId ?? COMPANY_OPTIONS[0].value;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [companyId, setCompanyId] = useState(defaultCompanyId);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [turnosValue, setTurnosValue] = useState(''); // comma-separated for ModalSelect
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: boolean; phone?: boolean; email?: boolean; companyId?: boolean }>({});

  const EMPTY_FILTERS = { empresa: '', nome: '' };
  const [filters, setFilters] = useState<{ empresa: string; nome: string }>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const filterFields: AdvancedFilterField<{ empresa: string; nome: string }>[] = [
    { key: 'empresa', label: 'Empresa', options: currentUser.availableCompanies },
    {
      key: 'nome',
      label: 'Nome',
      options: [...new Set(contacts.map((c) => c.name).filter(Boolean) as string[])]
        .sort()
        .map((n) => ({ value: n, label: n })),
    },
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
      if (filters.empresa && c.companyId !== filters.empresa) return false;
      if (filters.nome && c.name !== filters.nome) return false;
      return true;
    });
  }, [contacts, filters, isClient, currentUser.companyId]);

  const openNew = () => {
    setEditing(null);
    setCompanyId(defaultCompanyId);
    setName('');
    setPhone('');
    setEmail('');
    setDescription('');
    setTurnosValue('');
    setTimeStart('');
    setTimeEnd('');
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

  const openEdit = (c: Contact) => {
    setEditing(c);
    setCompanyId(c.companyId ?? defaultCompanyId);
    setName(c.name ?? '');
    setPhone(c.phone ? formatPhone(c.phone) : '');
    setEmail(c.email ?? '');
    setDescription(c.description ?? '');
    setTurnosValue(c.turnos?.length ? c.turnos.join(', ') : '');
    setTimeStart(c.timeStart ?? '');
    setTimeEnd(c.timeEnd ?? '');
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nameTrimmed = name.trim();
    const phoneRaw = phoneToRaw(phone);
    const emailTrimmed = email.trim();
    const nameInvalid = !nameTrimmed;
    const phoneInvalid = phoneRaw.length < 10;
    const emailInvalid = !emailTrimmed || !emailTrimmed.includes('@');
    const companyInvalid = !companyId;
    const errors = { name: nameInvalid, phone: phoneInvalid, email: emailInvalid, companyId: companyInvalid };
    setFieldErrors(errors);
    if (nameInvalid || phoneInvalid || emailInvalid || companyInvalid) return;

    const startFilled = timeStart.trim() !== '';
    const endFilled = timeEnd.trim() !== '';
    if (startFilled !== endFilled) {
      onValidationError?.('Preencha os dois campos de horário (início e fim).');
      return;
    }

    const turnosParsed = turnosValue
      ? (turnosValue.split(',').map((v) => v.trim()).filter(Boolean) as ContactShift[])
      : undefined;
    onSave({
      ...(editing?.id && { id: editing.id }),
      companyId,
      name: nameTrimmed,
      phone: formatPhone(phoneRaw),
      email: emailTrimmed,
      description: description.trim() || undefined,
      turnos: turnosParsed?.length ? turnosParsed : undefined,
      timeStart: timeStart.trim() || undefined,
      timeEnd: timeEnd.trim() || undefined,
    });
    closeModal();
  };

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
              <th>Empresa</th>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Turnos</th>
              <th>Descrição</th>
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
                  <td>{getCompanyName(c.companyId)}</td>
                  <td>{c.name ?? '—'}</td>
                  <td>{c.phone ?? '—'}</td>
                  <td>{c.email ?? '—'}</td>
                  <td>
                    <span className="contact-turnos-cell">
                      {c.turnos?.length
                        ? c.turnos.map((t) => (
                            <span key={t} className="contact-turno-chip">
                              {TURNOS_OPTIONS.find((o) => o.value === t)?.label ?? t}
                            </span>
                          ))
                        : '—'}
                      {(c.timeStart || c.timeEnd) && (
                        <>
                          <br />
                          <span className="contact-time-range">
                            {[c.timeStart, c.timeEnd].filter(Boolean).join('–')}
                          </span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="drawer-contacts-table__desc-cell">{c.description ?? '—'}</td>
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
        title={editing ? 'Editar contato' : 'Novo contato'}
        onClose={closeModal}
        formId="contact-form"
        primaryLabel="Salvar"
        cancelLabel="Cancelar"
      >
        <form id="contact-form" onSubmit={handleSubmit} className="form-card contact-form">
          <div className="form-group">
            <ModalSelect
              id="contact-company"
              label="Empresa"
              value={companyId}
              onChange={(v) => setCompanyId(v)}
              options={currentUser.availableCompanies}
              placeholder="Selecione a empresa"
              disabled={isClient}
              className="modal-select--no-pill"
            />
          </div>
          <div className="form-row">
            <div className={`form-field ${fieldErrors.name ? 'has-error' : ''}`}>
              <label htmlFor="contact-name">Nome</label>
              <div className="form-field__input-wrap">
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  maxLength={30}
                  onChange={(e) => {
                    setName(e.target.value);
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
              <label htmlFor="contact-phone">Telefone</label>
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
              <label htmlFor="contact-email">Email</label>
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
          <div className="form-group">
            <ModalSelect
              id="contact-turnos"
              label="Turno"
              value={turnosValue}
              onChange={setTurnosValue}
              options={TURNOS_OPTIONS}
              placeholder="Selecione"
              multiple
              className="modal-select--no-pill"
            />
          </div>
          <div className="contact-form-row contact-form-row--time">
            <TimePicker
              id="contact-time-start"
              label="Horário início"
              value={timeStart}
              onChange={setTimeStart}
            />
            <TimePicker
              id="contact-time-end"
              label="Horário fim"
              value={timeEnd}
              onChange={setTimeEnd}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact-desc">Descrição</label>
            <textarea
              id="contact-desc"
              className="textarea-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Texto livre"
            />
          </div>
        </form>
      </CrModal>
    </>
  );
});

export default ContactsPanel;
