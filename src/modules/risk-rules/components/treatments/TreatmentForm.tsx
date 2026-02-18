import React, { useState } from 'react';
import type { Treatment, TreatmentStep, RiskLevel } from '../../types/risk.types';
import { TreatmentStepCard } from './TreatmentStepCard';
import { ModalSelect, type ModalSelectOption } from '../shared/ModalSelect';

interface TreatmentFormProps {
  id?: string;
  initialData?: Partial<Treatment> | null;
  onSubmit: (data: Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  /** Oculta os botões do formulário (usado quando dentro de CrModal) */
  hideActions?: boolean;
}

/* Mesmas opções da política: somente Baixo, Médio e Alto; sem fundo colorido */
const TREATMENT_RISK_LEVEL_OPTIONS: ModalSelectOption[] = [
  { value: 'low', label: 'Baixo' },
  { value: 'medium', label: 'Médio' },
  { value: 'high', label: 'Alto' },
];

export const TreatmentForm: React.FC<TreatmentFormProps> = ({
  id,
  initialData,
  onSubmit,
  onCancel,
  hideActions = false,
}) => {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(
    initialData?.riskLevel === 'critical' ? 'high' : (initialData?.riskLevel ?? 'high')
  );
  const [active, setActive] = useState(initialData?.active ?? true);
  const [steps, setSteps] = useState<TreatmentStep[]>(
    initialData?.steps?.length
      ? [...initialData.steps]
      : [{ id: 'new-1', order: 1, label: '', action: '' }]
  );

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, order: prev.length + 1, label: '', action: '' },
    ]);
  };

  const removeStep = (step: TreatmentStep) => {
    setSteps((prev) => prev.filter((s) => s.id !== step.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description: description || undefined,
      riskLevel,
      steps,
      active,
    });
  };

  return (
    <form id={id} className="treatment-form form-card" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="treatment-name">Nome</label>
        <input
          id="treatment-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Nome do tratamento"
        />
      </div>
      <div className="form-group">
        <label htmlFor="treatment-desc">Descrição</label>
        <textarea
          id="treatment-desc"
          className="textarea-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição opcional"
          rows={2}
        />
      </div>
      <div className="form-group">
        <ModalSelect
          id="treatment-risk"
          label="Nível de risco"
          value={riskLevel}
          onChange={(v) => setRiskLevel(v as RiskLevel)}
          options={TREATMENT_RISK_LEVEL_OPTIONS}
          placeholder="Selecione o nível"
        />
      </div>
      <div className="form-group">
        <div className="form-group-header">
          <label>Etapas</label>
          <button type="button" className="btn btn-sm btn-primary" onClick={addStep}>
            + Adicionar etapa
          </button>
        </div>
        <div className="treatment-steps">
          {steps.map((step) => (
            <TreatmentStepCard
              key={step.id}
              step={step}
              onRemove={steps.length > 1 ? removeStep : undefined}
            />
          ))}
        </div>
      </div>
      <div className="form-group form-group-inline">
        <input
          id="treatment-active"
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        <label htmlFor="treatment-active">Tratamento ativo</label>
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

export default TreatmentForm;
