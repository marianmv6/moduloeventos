import React, { useState, useMemo, useEffect } from 'react';
import type { Trail, TrailStep, TrailStepTrigger, StepActionType, Contact } from '../../types/risk.types';
import { FieldErrorIcon } from '../shared/FieldErrorIcon';
import { IconTrash } from '../shared/Icons';
import { ModalSelect, type ModalSelectOption } from '../shared/ModalSelect';
import { COMPANY_OPTIONS } from '../../constants/companies';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const TURNOS_LABELS: Record<string, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
  madrugada: 'Madrugada',
};

function formatContactLabel(c: Contact): string {
  const name = c.name || c.id;
  const turnoParts: string[] = [];
  if (c.turnos?.length) {
    turnoParts.push(c.turnos.map((t) => TURNOS_LABELS[t] ?? t).join(', '));
  }
  if (c.timeStart || c.timeEnd) {
    turnoParts.push([c.timeStart, c.timeEnd].filter(Boolean).join('–'));
  }
  if (turnoParts.length === 0) return name;
  return `${name} (${turnoParts.join(' ')})`;
}

function contactTurnoDisplay(c: Contact): string {
  if (!c.turnos?.length) return '—';
  return c.turnos.map((t) => TURNOS_LABELS[t] ?? t).join(', ');
}

function contactHorarioDisplay(c: Contact): string {
  if (!c.timeStart && !c.timeEnd) return '—';
  return [c.timeStart, c.timeEnd].filter(Boolean).join('–');
}

const ACTION_OPTIONS: ModalSelectOption[] = [
  { value: 'email_automatico', label: 'Email automático' },
  { value: 'contato_gestor', label: 'Contato gestor imediato' },
  { value: 'whatsapp_grupo', label: 'WhatsApp grupo' },
  { value: 'mensagem_voz', label: 'Mensagem de voz' },
  { value: 'acao_personalizada', label: 'Ação personalizada' },
];

const STATUS_OPTIONS: ModalSelectOption[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

const MAX_STEPS = 5;

const DEFAULT_TRIGGER: TrailStepTrigger = { type: 'points', minScore: 0 };

interface TrailFormProps {
  id?: string;
  initialData?: Partial<Trail> | null;
  onSubmit: (data: Omit<Trail, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  hideActions?: boolean;
  contacts?: Contact[];
  /** Templates de e-mail ativos (para ação "Email automático") */
  emailTemplates?: { id: string; title: string }[];
  voiceMessages?: { id: string; identification: string }[];
  onValidationError?: (message: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
}

function createEmptyStep(order: number): TrailStep {
  return {
    id: `step-${Date.now()}-${order}`,
    order,
    trigger: DEFAULT_TRIGGER,
    action: 'email_automatico',
  };
}

export const TrailForm: React.FC<TrailFormProps> = ({
  id,
  initialData,
  onSubmit,
  onCancel,
  hideActions = false,
  contacts = [],
  emailTemplates = [],
  voiceMessages = [],
  onValidationError,
  onDirtyChange,
}) => {
  const currentUser = useCurrentUser();
  const isClient = currentUser.kind === 'client';
  const defaultCompanyId = currentUser.companyId ?? COMPANY_OPTIONS[0].value;

  const [companyId, setCompanyId] = useState(initialData?.companyId ?? defaultCompanyId);
  const [name, setName] = useState(initialData?.name ?? '');
  const [active, setActive] = useState(initialData?.active ?? true);
  const [steps, setSteps] = useState<TrailStep[]>(() => {
    if (initialData?.steps?.length) {
      return initialData.steps.slice(0, MAX_STEPS).map((s, i) => ({
        ...s,
        id: s.id || `step-${i}`,
        order: i + 1,
        trigger: s.trigger ?? DEFAULT_TRIGGER,
      }));
    }
    return [createEmptyStep(1)];
  });
  const [fieldErrors, setFieldErrors] = useState<{ name?: boolean; steps?: boolean }>({});

  const isDirty = useMemo(() => {
    if (!initialData) return name.trim() !== '' || steps.length > 1 || steps[0]?.action !== 'email_automatico';
    if (name.trim() !== (initialData.name ?? '').trim()) return true;
    if (active !== (initialData.active ?? true)) return true;
    const initSteps = initialData.steps ?? [];
    if (steps.length !== initSteps.length) return true;
    for (let i = 0; i < steps.length; i++) {
      const a = steps[i];
      const b = initSteps[i];
      if (!b) return true;
      if (a.action !== b.action) return true;
      const aIds = (a.config?.contactIds ?? []).slice().sort().join(',');
      const bIds = (b.config?.contactIds ?? []).slice().sort().join(',');
      if (aIds !== bIds) return true;
      if ((a.config?.voiceMessageId ?? '') !== (b.config?.voiceMessageId ?? '')) return true;
      if ((a.config?.emailTemplateId ?? '') !== (b.config?.emailTemplateId ?? '')) return true;
    }
    return false;
  }, [initialData, name, active, steps]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const addStep = () => {
    if (steps.length >= MAX_STEPS) return;
    setSteps((prev) => [...prev, createEmptyStep(prev.length + 1)]);
  };

  const removeStep = (step: TrailStep) => {
    if (steps.length <= 1) return;
    setSteps((prev) => {
      const next = prev.filter((s) => s.id !== step.id);
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const stepsRequiringContacts = useMemo(
    () =>
      steps.filter(
        (s) =>
          s.action === 'email_automatico' ||
          s.action === 'contato_gestor' ||
          s.action === 'whatsapp_grupo'
      ),
    [steps]
  );
  const stepsAreFullyValid = useMemo(() => {
    if (steps.length === 0) return false;
    const contactsValid =
      contacts.length === 0 ||
      stepsRequiringContacts.every((s) => (s.config?.contactIds ?? []).length > 0);
    return contactsValid;
  }, [steps, stepsRequiringContacts, contacts.length]);

  const updateStep = (stepId: string, patch: Partial<TrailStep>) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, ...patch } : s))
    );
  };

  useEffect(() => {
    if (fieldErrors.steps && stepsAreFullyValid) {
      setFieldErrors((prev) => ({ ...prev, steps: false }));
    }
  }, [fieldErrors.steps, stepsAreFullyValid]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrimmed = name.trim();
    const nameInvalid = !nameTrimmed;
    const stepsInvalid = steps.length === 0 || !stepsAreFullyValid;
    setFieldErrors((prev) => ({ ...prev, name: nameInvalid, steps: stepsInvalid }));
    if (nameInvalid || stepsInvalid) {
      onValidationError?.('Verifique os campos não preenchidos antes de salvar.');
      return;
    }
    const stepWithoutContact = stepsRequiringContacts.find(
      (s) => (s.config?.contactIds ?? []).length === 0
    );
    if (stepWithoutContact && contacts.length > 0) {
      setFieldErrors((prev) => ({ ...prev, name: !nameTrimmed, steps: true }));
      onValidationError?.('Verifique os campos não preenchidos antes de salvar.');
      return;
    }
    onSubmit({
      name: nameTrimmed,
      companyId,
      trackingType: initialData?.trackingType ?? 'motorista',
      mode: initialData?.mode ?? 'points',
      steps: steps.map((s) => ({ ...s, trigger: s.trigger ?? DEFAULT_TRIGGER })),
      active,
    });
  };

  const activeVoiceMessages = voiceMessages; // filtrar inativos no parent se necessário

  return (
    <form id={id} className="trail-form form-card" onSubmit={handleSubmit}>
      <div className="form-group">
        <div className="form-group__label-row">
          <label htmlFor="trail-company">Empresa</label>
        </div>
        <ModalSelect
          id="trail-company"
          options={currentUser.availableCompanies}
          value={companyId}
          onChange={(v) => setCompanyId(v)}
          placeholder="Selecione a empresa"
          disabled={isClient}
          className="modal-select--no-pill"
        />
      </div>
      <div className={`form-group ${fieldErrors.name ? 'has-error' : ''}`}>
        <div className="form-group__label-row">
          <label htmlFor="trail-name">Nome da tratativa</label>
        </div>
        <div className="form-group__input-with-error">
          <input
            id="trail-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) setFieldErrors((err) => ({ ...err, name: false }));
            }}
            placeholder="Identificação da tratativa"
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

      <div className={`form-group ${fieldErrors.steps ? 'has-error' : ''}`}>
        <div className="trail-form-etapas-section">
          <div className="trail-form-etapas-header policy-form-gatilhos-header">
            <label className="policy-form-gatilhos-title">Ações (1 a {MAX_STEPS})</label>
            {steps.length < MAX_STEPS && (
              <button type="button" className="btn btn-sm btn-primary" onClick={addStep}>
                + Adicionar ação
              </button>
            )}
          </div>
          <div className="trail-steps-wrapper-outer">
            <div className={`trail-steps-wrapper ${fieldErrors.steps ? 'trail-steps-wrapper--error' : ''}`}>
              {fieldErrors.steps && (
                <span className="trail-steps-wrapper__field-error-icon">
                  <FieldErrorIcon className="level-tooltip-wrap--tooltip-right" />
                </span>
              )}
              <div className="trail-steps">
            {steps.map((step, index) => (
              <div key={step.id} className="trail-step-card">
              <div className="trail-step-header">
                <span className="trail-step-title">Ação {index + 1}</span>
                {steps.length > 1 && (
                  <button
                    type="button"
                    className="trail-step-remove-btn"
                    onClick={() => removeStep(step)}
                    aria-label="Remover ação"
                  >
                    <IconTrash />
                  </button>
                )}
              </div>
              <div className="trail-step-row">
                <div className="trail-step-action">
                  <ModalSelect
                    id={`step-action-${step.id}`}
                    value={step.action}
                    onChange={(v) => updateStep(step.id, { action: v as StepActionType })}
                    options={ACTION_OPTIONS}
                    placeholder="Selecione a ação"
                  />
                </div>
              </div>
              {step.action === 'email_automatico' && (
                <div className="trail-step-config">
                  {emailTemplates.length > 0 && (
                    <div className="trail-step-config__template-wrap">
                      <label className="trail-step-config__section-title">Template de e-mail</label>
                      <ModalSelect
                        options={emailTemplates.map((t) => ({ value: t.id, label: t.title }))}
                        value={step.config?.emailTemplateId ?? ''}
                        onChange={(v) => updateStep(step.id, { config: { ...step.config, emailTemplateId: v || undefined } })}
                        placeholder="Selecione o template"
                      />
                    </div>
                  )}
                  <label className="trail-step-config__section-title">Selecione quem deve receber o e-mail</label>
                  <p className="trail-step-config__hint">Pode ser selecionado mais de um</p>
                  <div className="trail-step-contacts-table-wrap">
                    <table className="list-table trail-step-contacts-table">
                      <thead>
                        <tr>
                          <th style={{ width: '2.5rem' }}></th>
                          <th>Contato</th>
                          <th>Turnos</th>
                          <th>Horários</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <input
                                id={`trail-step-${step.id}-contact-${c.id}`}
                                type="checkbox"
                                checked={(step.config?.contactIds ?? []).includes(c.id)}
                                onChange={() => {
                                  const current = step.config?.contactIds ?? [];
                                  const next = current.includes(c.id)
                                    ? current.filter((id) => id !== c.id)
                                    : [...current, c.id];
                                  updateStep(step.id, {
                                    config: { ...step.config, contactIds: next },
                                  });
                                }}
                              />
                            </td>
                            <td>
                              <label htmlFor={`trail-step-${step.id}-contact-${c.id}`}>
                                {c.name || c.id}
                              </label>
                            </td>
                            <td>{contactTurnoDisplay(c)}</td>
                            <td>{contactHorarioDisplay(c)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {step.action === 'contato_gestor' && (
                <div className="trail-step-config">
                  <label className="trail-step-config__section-title">Selecione quem deve ser contatado</label>
                  <p className="trail-step-config__hint">Pode ser selecionado mais de um</p>
                  <div className="trail-step-contacts-table-wrap">
                    <table className="list-table trail-step-contacts-table">
                      <thead>
                        <tr>
                          <th style={{ width: '2.5rem' }}></th>
                          <th>Contato</th>
                          <th>Turnos</th>
                          <th>Horários</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <input
                                id={`trail-step-${step.id}-gestor-${c.id}`}
                                type="checkbox"
                                checked={(step.config?.contactIds ?? []).includes(c.id)}
                                onChange={() => {
                                  const current = step.config?.contactIds ?? [];
                                  const next = current.includes(c.id)
                                    ? current.filter((id) => id !== c.id)
                                    : [...current, c.id];
                                  updateStep(step.id, {
                                    config: { ...step.config, contactIds: next },
                                  });
                                }}
                              />
                            </td>
                            <td>
                              <label htmlFor={`trail-step-${step.id}-gestor-${c.id}`}>
                                {c.name || c.id}
                              </label>
                            </td>
                            <td>{contactTurnoDisplay(c)}</td>
                            <td>{contactHorarioDisplay(c)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {step.action === 'whatsapp_grupo' && (
                <div className="trail-step-config">
                  <label className="trail-step-config__section-title">Selecione os contatos do grupo ou nome correspondente</label>
                  <p className="trail-step-config__hint">Pode ser selecionado mais de um</p>
                  <div className="trail-step-contacts-table-wrap">
                    <table className="list-table trail-step-contacts-table">
                      <thead>
                        <tr>
                          <th style={{ width: '2.5rem' }}></th>
                          <th>Contato</th>
                          <th>Turnos</th>
                          <th>Horários</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <input
                                id={`trail-step-${step.id}-whatsapp-${c.id}`}
                                type="checkbox"
                                checked={(step.config?.contactIds ?? []).includes(c.id)}
                                onChange={() => {
                                  const current = step.config?.contactIds ?? [];
                                  const next = current.includes(c.id)
                                    ? current.filter((id) => id !== c.id)
                                    : [...current, c.id];
                                  updateStep(step.id, {
                                    config: { ...step.config, contactIds: next },
                                  });
                                }}
                              />
                            </td>
                            <td>
                              <label htmlFor={`trail-step-${step.id}-whatsapp-${c.id}`}>
                                {c.name || c.id}
                              </label>
                            </td>
                            <td>{contactTurnoDisplay(c)}</td>
                            <td>{contactHorarioDisplay(c)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {step.action === 'mensagem_voz' && (
                <div className="trail-step-config">
                  <div className="trail-step-action">
                    <ModalSelect
                      id={`step-voice-${step.id}`}
                      label="Mensagem de voz"
                      value={step.config?.voiceMessageId ?? ''}
                      onChange={(v) =>
                        updateStep(step.id, {
                          config: { ...step.config, voiceMessageId: v || undefined },
                        })
                      }
                      options={activeVoiceMessages.map((v) => ({ value: v.id, label: v.identification }))}
                      placeholder="Selecione"
                    />
                  </div>
                </div>
              )}
              {step.action === 'acao_personalizada' && (
                <div className="trail-step-config">
                  <label>Descrição</label>
                  <input
                    type="text"
                    value={step.config?.description ?? ''}
                    onChange={(e) =>
                      updateStep(step.id, {
                        config: { ...step.config, description: e.target.value },
                      })
                    }
                    placeholder="Descrição livre"
                  />
                  <label className="form-label-optional">URL (opcional)</label>
                  <input
                    type="url"
                    value={step.config?.url ?? ''}
                    onChange={(e) =>
                      updateStep(step.id, {
                        config: { ...step.config, url: e.target.value },
                      })
                    }
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>
          ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-group">
        <ModalSelect
          id="trail-status"
          label="Status"
          value={active ? 'ativo' : 'inativo'}
          onChange={(v) => setActive(v === 'ativo')}
          options={STATUS_OPTIONS}
          placeholder="Selecione o status"
        />
      </div>

      {!hideActions && (
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Salvar
          </button>
        </div>
      )}
    </form>
  );
};

export default TrailForm;
