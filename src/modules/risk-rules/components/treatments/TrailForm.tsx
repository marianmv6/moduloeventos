import React, { useState, useMemo, useEffect } from 'react';
import type {
  Trail,
  TrailStep,
  TrailStepTrigger,
  StepActionType,
  TrailTrackingType,
  TrailMode,
} from '../../types/risk.types';
import { FieldErrorIcon } from '../shared/FieldErrorIcon';
import { IconTrash } from '../shared/Icons';
import { ModalSelect, type ModalSelectOption } from '../shared/ModalSelect';

const TRACKING_OPTIONS: ModalSelectOption[] = [
  { value: 'motorista', label: 'Por motorista' },
  { value: 'veiculo', label: 'Por veículo' },
];

const MODE_OPTIONS: { value: TrailMode; label: string }[] = [
  { value: 'points', label: 'Por pontos' },
  { value: 'levels', label: 'Por níveis' },
];

const LEVEL_OPTIONS: ModalSelectOption[] = [
  { value: 'low', label: 'Baixo' },
  { value: 'medium', label: 'Médio' },
  { value: 'high', label: 'Alto' },
];

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

const LEVEL_ORDER: Record<string, number> = { low: 0, medium: 1, high: 2 };

function getTriggerValue(trigger: TrailStepTrigger, mode: TrailMode): number {
  if (mode === 'points' && trigger.type === 'points') {
    return (trigger as { minScore?: number }).minScore ?? 0;
  }
  if (trigger.type === 'levels') {
    return LEVEL_ORDER[(trigger as { level?: string }).level ?? 'low'] ?? 0;
  }
  return 0;
}

interface TrailFormProps {
  id?: string;
  initialData?: Partial<Trail> | null;
  onSubmit: (data: Omit<Trail, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  hideActions?: boolean;
  contacts?: { id: string; name?: string }[];
  voiceMessages?: { id: string; identification: string }[];
  /** Chamado quando a alteração de nível/pontos quebra a ordem crescente das etapas */
  onValidationError?: (message: string) => void;
  /** Chamado quando o formulário passa a ter ou deixar de ter alterações não salvas */
  onDirtyChange?: (dirty: boolean) => void;
}

function createEmptyStep(order: number, mode: TrailMode, afterTrigger?: TrailStepTrigger): TrailStep {
  let trigger: TrailStepTrigger;
  if (mode === 'points') {
    const prevScore = afterTrigger && afterTrigger.type === 'points'
      ? (afterTrigger as { minScore?: number }).minScore ?? 0
      : -1;
    trigger = { type: 'points', minScore: prevScore + 1 };
  } else {
    const prevRank = afterTrigger && afterTrigger.type === 'levels'
      ? LEVEL_ORDER[(afterTrigger as { level?: string }).level ?? 'low'] ?? -1
      : -1;
    const nextLevel = prevRank === 0 ? 'medium' : prevRank === 1 ? 'high' : 'high';
    trigger = { type: 'levels', level: nextLevel as 'low' | 'medium' | 'high' };
  }
  return {
    id: `step-${Date.now()}-${order}`,
    order,
    trigger,
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
  voiceMessages = [],
  onValidationError,
  onDirtyChange,
}) => {
  const [name, setName] = useState(initialData?.name ?? '');
  const [trackingType, setTrackingType] = useState<TrailTrackingType>(
    initialData?.trackingType ?? 'motorista'
  );
  const [mode, setMode] = useState<TrailMode>(initialData?.mode ?? 'points');
  const [active, setActive] = useState(initialData?.active ?? true);
  const [steps, setSteps] = useState<TrailStep[]>(() => {
    if (initialData?.steps?.length) {
      return initialData.steps.slice(0, MAX_STEPS).map((s, i) => ({
        ...s,
        id: s.id || `step-${i}`,
        order: i + 1,
      }));
    }
    return [createEmptyStep(1, initialData?.mode ?? 'points')];
  });
  const [fieldErrors, setFieldErrors] = useState<{ name?: boolean; steps?: boolean }>({});

  const isDirty = useMemo(() => {
    if (!initialData) return name.trim() !== '' || steps.length > 1 || steps[0]?.action !== 'email_automatico' || (steps[0]?.trigger as { minScore?: number })?.minScore !== 0;
    if (name.trim() !== (initialData.name ?? '').trim()) return true;
    if (trackingType !== (initialData.trackingType ?? 'motorista')) return true;
    if (mode !== (initialData.mode ?? 'points')) return true;
    if (active !== (initialData.active ?? true)) return true;
    const initSteps = initialData.steps ?? [];
    if (steps.length !== initSteps.length) return true;
    for (let i = 0; i < steps.length; i++) {
      const a = steps[i];
      const b = initSteps[i];
      if (!b) return true;
      if (a.action !== b.action) return true;
      if (a.trigger.type !== b.trigger.type) return true;
      if (a.trigger.type === 'points' && b.trigger.type === 'points') {
        if ((a.trigger as { minScore?: number }).minScore !== (b.trigger as { minScore?: number }).minScore) return true;
      }
      if (a.trigger.type === 'levels' && b.trigger.type === 'levels') {
        if ((a.trigger as { level?: string }).level !== (b.trigger as { level?: string }).level) return true;
      }
      const aIds = (a.config?.contactIds ?? []).slice().sort().join(',');
      const bIds = (b.config?.contactIds ?? []).slice().sort().join(',');
      if (aIds !== bIds) return true;
      if ((a.config?.voiceMessageId ?? '') !== (b.config?.voiceMessageId ?? '')) return true;
    }
    return false;
  }, [initialData, name, trackingType, mode, active, steps]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const addStep = () => {
  if (steps.length >= MAX_STEPS) return;
  if (mode === 'levels' && steps.length >= 3) return;
  const lastTrigger = steps[steps.length - 1]?.trigger;
  setSteps((prev) => [...prev, createEmptyStep(prev.length + 1, mode, lastTrigger)]);
  };

  const removeStep = (step: TrailStep) => {
    if (steps.length <= 1) return;
    setSteps((prev) => {
      const next = prev.filter((s) => s.id !== step.id);
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const stepsRequiringContacts = useMemo(
    () => steps.filter((s) => s.action === 'email_automatico' || s.action === 'contato_gestor'),
    [steps]
  );
  const stepsAreFullyValid = useMemo(() => {
    if (steps.length === 0) return false;
    const orderValid =
      steps.length === 1 ||
      steps.every((s, i) => {
        if (i === 0) return true;
        const prevVal = getTriggerValue(steps[i - 1].trigger, mode);
        const currVal = getTriggerValue(s.trigger, mode);
        return currVal > prevVal;
      });
    if (!orderValid) return false;
    const contactsValid =
      contacts.length === 0 ||
      stepsRequiringContacts.every((s) => (s.config?.contactIds ?? []).length > 0);
    return contactsValid;
  }, [steps, mode, stepsRequiringContacts, contacts.length]);

  const updateStep = (stepId: string, patch: Partial<TrailStep>) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, ...patch } : s))
    );
  };

  const updateStepTrigger = (stepId: string, newTrigger: TrailStepTrigger) => {
    const idx = steps.findIndex((s) => s.id === stepId);
    if (idx < 0) return;
    const prevStep = steps[idx - 1];
    const nextStep = steps[idx + 1];
    const newVal = getTriggerValue(newTrigger, mode);
    if (prevStep != null) {
      const prevVal = getTriggerValue(prevStep.trigger, mode);
      if (newVal <= prevVal) {
        setFieldErrors((prev) => ({ ...prev, steps: true }));
        onValidationError?.('Verifique os campos não preenchidos antes de salvar.');
        return;
      }
    }
    if (nextStep != null) {
      const nextVal = getTriggerValue(nextStep.trigger, mode);
      if (newVal >= nextVal) {
        setFieldErrors((prev) => ({ ...prev, steps: true }));
        onValidationError?.('Verifique os campos não preenchidos antes de salvar.');
        return;
      }
    }
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, trigger: newTrigger } : s))
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
    for (let i = 1; i < steps.length; i++) {
      const prevVal = getTriggerValue(steps[i - 1].trigger, mode);
      const currVal = getTriggerValue(steps[i].trigger, mode);
      if (currVal <= prevVal) {
        setFieldErrors((prev) => ({ ...prev, name: !nameTrimmed, steps: true }));
        onValidationError?.('Verifique os campos não preenchidos antes de salvar.');
        return;
      }
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
      trackingType,
      mode,
      steps,
      active,
    });
  };

  const activeVoiceMessages = voiceMessages; // filtrar inativos no parent se necessário

  return (
    <form id={id} className="trail-form form-card" onSubmit={handleSubmit}>
      <div className="trail-form-row trail-form-row--name-tracking">
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
        <div className="form-group">
          <ModalSelect
            id="trail-tracking"
            label="Tipo de acompanhamento"
            value={trackingType}
            onChange={(v) => setTrackingType(v as TrailTrackingType)}
            options={TRACKING_OPTIONS}
            placeholder="Selecione"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Modo</label>
        <div className="form-radios">
          {MODE_OPTIONS.map((opt) => (
            <label key={opt.value} className="form-radio">
              <input
                type="radio"
                name="trail-mode"
                value={opt.value}
                checked={mode === opt.value}
                onChange={() => {
                  setMode(opt.value);
                  setSteps((prev) =>
                    prev.map((s, i) => ({
                      ...s,
                      trigger:
                        opt.value === 'points'
                          ? { type: 'points', minScore: (s.trigger as { minScore?: number }).minScore ?? 0 }
                          : { type: 'levels', level: (s.trigger as { level?: 'low' | 'medium' | 'high' }).level ?? 'low' },
                    }))
                  );
                }}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <div className="trail-form-etapas-header">
          <label>Etapas (1 a {MAX_STEPS})</label>
          {steps.length < MAX_STEPS && (mode !== 'levels' || steps.length < 3) && (
            <button type="button" className="btn btn-sm btn-primary" onClick={addStep}>
              + Adicionar etapa
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
                <span className="trail-step-title">Etapa {index + 1}</span>
                {steps.length > 1 && (
                  <button
                    type="button"
                    className="trail-step-remove-btn"
                    onClick={() => removeStep(step)}
                    aria-label="Remover etapa"
                  >
                    <IconTrash />
                  </button>
                )}
              </div>
              <div className="trail-step-row">
                <div className="trail-step-trigger">
                  {mode === 'points' ? (
                    <>
                      <label>Pontuação mínima</label>
                      <input
                        type="number"
                        min={0}
                        max={999}
                        value={(step.trigger as { minScore?: number }).minScore ?? 0}
                        onChange={(e) => {
                          const v = Math.min(999, Math.max(0, Number(e.target.value) || 0));
                          updateStepTrigger(step.id, {
                            type: 'points',
                            minScore: v,
                          });
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <label>Nível</label>
                      <ModalSelect
                        id={`step-level-${step.id}`}
                        value={(step.trigger as { level?: string }).level ?? 'low'}
                        onChange={(v) =>
                          updateStepTrigger(step.id, {
                            type: 'levels',
                            level: v as 'low' | 'medium' | 'high',
                          })
                        }
                        options={LEVEL_OPTIONS}
                        placeholder="Nível"
                      />
                    </>
                  )}
                </div>
                <div className="trail-step-action">
                  <ModalSelect
                    id={`step-action-${step.id}`}
                    label="Ação"
                    value={step.action}
                    onChange={(v) => updateStep(step.id, { action: v as StepActionType })}
                    options={ACTION_OPTIONS}
                    placeholder="Selecione a ação"
                  />
                </div>
              </div>
              {/* Configuração por tipo de ação (contatos no mesmo formato de Eventos contemplados) */}
              {step.action === 'email_automatico' && (
                <div className="trail-step-config">
                  <label>Contatos que recebem email</label>
                  <div className="form-group policy-form-checkbox-option">
                    <input
                      id={`trail-step-${step.id}-contacts-all`}
                      type="checkbox"
                      checked={
                        contacts.length > 0 &&
                        (step.config?.contactIds ?? []).length === contacts.length
                      }
                      onChange={(e) => {
                        const contactIds = e.target.checked
                          ? contacts.map((c) => c.id)
                          : [];
                        updateStep(step.id, {
                          config: { ...step.config, contactIds },
                        });
                      }}
                    />
                    <label htmlFor={`trail-step-${step.id}-contacts-all`}>Selecionar todos</label>
                  </div>
                  <div className="policy-form-eventos-list">
                    {contacts.map((c) => (
                      <div key={c.id} className="form-group policy-form-checkbox-option">
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
                        <label htmlFor={`trail-step-${step.id}-contact-${c.id}`}>
                          {c.name || c.id}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {step.action === 'contato_gestor' && (
                <div className="trail-step-config">
                  <label>Contatos</label>
                  <div className="form-group policy-form-checkbox-option">
                    <input
                      id={`trail-step-${step.id}-gestor-all`}
                      type="checkbox"
                      checked={
                        contacts.length > 0 &&
                        (step.config?.contactIds ?? []).length === contacts.length
                      }
                      onChange={(e) => {
                        const contactIds = e.target.checked
                          ? contacts.map((c) => c.id)
                          : [];
                        updateStep(step.id, {
                          config: { ...step.config, contactIds },
                        });
                      }}
                    />
                    <label htmlFor={`trail-step-${step.id}-gestor-all`}>Selecionar todos</label>
                  </div>
                  <div className="policy-form-eventos-list">
                    {contacts.map((c) => (
                      <div key={c.id} className="form-group policy-form-checkbox-option">
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
                        <label htmlFor={`trail-step-${step.id}-gestor-${c.id}`}>
                          {c.name || c.id}
                        </label>
                      </div>
                    ))}
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
              {(step.action === 'whatsapp_grupo' || step.action === 'acao_personalizada') && (
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

      <p className="trail-form-aviso">
        As ações serão sugeridas/disparadas conforme a ocorrência atingir o limite configurado dentro da janela.
      </p>

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
