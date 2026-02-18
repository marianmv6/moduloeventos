import React, { useState, useMemo, useEffect } from 'react';
import type { Policy, ScoreRule, Trail } from '../../types/risk.types';
import type { PlatformUser } from '../../mocks/risk.mock';
import { FieldErrorIcon } from '../shared/FieldErrorIcon';
import { ModalSelect, type ModalSelectOption } from '../shared/ModalSelect';

interface PolicyFormProps {
  id?: string;
  initialData?: Partial<Policy> | null;
  /** Lista completa de eventos (mesma da tela Pontuações) para "Eventos contemplados" */
  scores: ScoreRule[];
  /** Lista de tratativas (trilhas) ativas para vínculo único */
  trails: Trail[];
  users: PlatformUser[];
  onSubmit: (data: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  hideActions?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
}

const JANELA_OPTIONS: ModalSelectOption[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => ({
  value: String(h),
  label: `${h}h`,
}));

const STATUS_OPTIONS: ModalSelectOption[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

export const PolicyForm: React.FC<PolicyFormProps> = ({
  id,
  initialData,
  scores,
  trails,
  users,
  onSubmit,
  onCancel,
  hideActions = false,
  onDirtyChange,
}) => {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [janela, setJanela] = useState(initialData?.janela ?? 2);
  const [eventosContemplados, setEventosContemplados] = useState<string[]>(
    initialData?.eventosContemplados ?? []
  );
  const [usuariosAll, setUsuariosAll] = useState<boolean>(
    initialData?.usuariosAtribuidos === 'all' || !Array.isArray(initialData?.usuariosAtribuidos)
  );
  const [usuariosSelected, setUsuariosSelected] = useState<string[]>(
    Array.isArray(initialData?.usuariosAtribuidos) ? initialData.usuariosAtribuidos : []
  );
  const [trailId, setTrailId] = useState<string>(initialData?.trailId ?? '');
  const [active, setActive] = useState(initialData?.active ?? true);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: boolean;
    eventosContemplados?: boolean;
    usuarios?: boolean;
  }>({});

  const activeUsers = useMemo(() => users.filter((u) => u.active), [users]);
  const activeTrails = useMemo(() => trails.filter((t) => t.active), [trails]);
  const trailOptions: ModalSelectOption[] = useMemo(
    () => [{ value: '', label: 'Nenhuma' }, ...activeTrails.map((t) => ({ value: t.id, label: t.name }))],
    [activeTrails]
  );

  const isDirty = useMemo(() => {
    if (!initialData) return name !== '' || description !== '' || eventosContemplados.length > 0 || !usuariosAll || usuariosSelected.length > 0 || trailId !== '';
    if (name.trim() !== (initialData.name ?? '').trim()) return true;
    if ((description ?? '') !== (initialData.description ?? '')) return true;
    if (janela !== (initialData.janela ?? 2)) return true;
    const initEventos = initialData.eventosContemplados ?? [];
    if (eventosContemplados.length !== initEventos.length || [...eventosContemplados].sort().join(',') !== [...initEventos].sort().join(',')) return true;
    const initAll = initialData.usuariosAtribuidos === 'all' || !Array.isArray(initialData.usuariosAtribuidos);
    if (usuariosAll !== initAll) return true;
    if (!usuariosAll) {
      const initSel = Array.isArray(initialData.usuariosAtribuidos) ? initialData.usuariosAtribuidos : [];
      if (usuariosSelected.length !== initSel.length || [...usuariosSelected].sort().join(',') !== [...initSel].sort().join(',')) return true;
    }
    if ((trailId || '') !== (initialData.trailId ?? '')) return true;
    if (active !== (initialData.active ?? true)) return true;
    return false;
  }, [initialData, name, description, janela, eventosContemplados, usuariosAll, usuariosSelected, trailId, active]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const toggleEvento = (scoreId: string) => {
    setEventosContemplados((prev) =>
      prev.includes(scoreId) ? prev.filter((id) => id !== scoreId) : [...prev, scoreId]
    );
    if (fieldErrors.eventosContemplados) setFieldErrors((err) => ({ ...err, eventosContemplados: false }));
  };

  const selectAllEventos = (checked: boolean) => {
    if (checked) setEventosContemplados(scores.map((s) => s.id));
    else setEventosContemplados([]);
    if (fieldErrors.eventosContemplados) setFieldErrors((err) => ({ ...err, eventosContemplados: false }));
  };

  const allEventosSelected =
    scores.length > 0 && eventosContemplados.length === scores.length;

  const toggleUsuario = (userId: string) => {
    setUsuariosSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
    if (fieldErrors.usuarios) setFieldErrors((err) => ({ ...err, usuarios: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrimmed = name.trim();
    const nameInvalid = !nameTrimmed;
    const eventosInvalid = eventosContemplados.length === 0;
    const usuariosInvalid = !usuariosAll && usuariosSelected.length === 0;
    const errors = { name: nameInvalid, eventosContemplados: eventosInvalid, usuarios: usuariosInvalid };
    setFieldErrors(errors);
    if (nameInvalid || eventosInvalid || usuariosInvalid) return;
    onSubmit({
      name: nameTrimmed,
      description: description || undefined,
      janela,
      eventosContemplados,
      usuariosAtribuidos: usuariosAll ? 'all' : usuariosSelected,
      trailId: trailId || undefined,
      active,
    });
  };

  return (
    <form id={id} className="policy-form form-card" onSubmit={handleSubmit}>
      <div className="policy-form-row policy-form-row--name-janela">
        <div className={`form-group ${fieldErrors.name ? 'has-error' : ''}`}>
          <div className="form-group__label-row">
            <label htmlFor="policy-name">Nome</label>
          </div>
          <div className="form-group__input-with-error">
            <input
              id="policy-name"
              type="text"
              value={name}
              maxLength={30}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((err) => ({ ...err, name: false }));
              }}
              placeholder="Nome da política"
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
            id="policy-janela"
            label="Janela de tempo"
            value={String(janela)}
            onChange={(v) => setJanela(Number(v))}
            options={JANELA_OPTIONS}
            placeholder="Selecione a janela"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="policy-desc">Descrição</label>
        <textarea
          id="policy-desc"
          className="policy-form-desc textarea-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição opcional"
          rows={2}
        />
      </div>

      <div className={`form-group ${fieldErrors.eventosContemplados ? 'has-error' : ''}`}>
        <div className="form-group__label-row">
          <label>Eventos contemplados</label>
        </div>
        <div className="form-group__block-with-error">
          {fieldErrors.eventosContemplados && (
            <span className="form-group__field-error-icon form-group__field-error-icon--block">
              <FieldErrorIcon />
            </span>
          )}
          <div className="form-group policy-form-checkbox-option">
            <input
              id="policy-eventos-all"
              type="checkbox"
              checked={allEventosSelected}
              onChange={(e) => selectAllEventos(e.target.checked)}
            />
            <label htmlFor="policy-eventos-all">Selecionar todos</label>
          </div>
          <div className="policy-form-eventos-list">
            {scores.map((score) => (
              <div key={score.id} className="form-group policy-form-checkbox-option">
                <input
                  id={`policy-evento-${score.id}`}
                  type="checkbox"
                  checked={eventosContemplados.includes(score.id)}
                  onChange={() => toggleEvento(score.id)}
                />
                <label htmlFor={`policy-evento-${score.id}`}>{score.name}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`form-group ${fieldErrors.usuarios ? 'has-error' : ''}`}>
        <div className="form-group__label-row">
          <label>Usuários atribuídos</label>
        </div>
        <div className="form-group__block-with-error">
          {fieldErrors.usuarios && (
            <span className="form-group__field-error-icon form-group__field-error-icon--block">
              <FieldErrorIcon />
            </span>
          )}
          <div className="form-group policy-form-checkbox-option">
            <input
              id="policy-users-all"
              type="radio"
              name="policy-users"
              checked={usuariosAll}
              onChange={() => {
                setUsuariosAll(true);
                if (fieldErrors.usuarios) setFieldErrors((err) => ({ ...err, usuarios: false }));
              }}
            />
            <label htmlFor="policy-users-all">Todos os usuários</label>
          </div>
          <div className="form-group policy-form-checkbox-option">
            <input
              id="policy-users-specific"
              type="radio"
              name="policy-users"
            checked={!usuariosAll}
            onChange={() => setUsuariosAll(false)}
          />
          <label htmlFor="policy-users-specific">Usuários específicos</label>
        </div>
        {!usuariosAll && (
          <div className="policy-form-usuarios-list">
            {activeUsers.map((user) => (
              <div key={user.id} className="form-group policy-form-checkbox-option">
                <input
                  id={`policy-user-${user.id}`}
                  type="checkbox"
                  checked={usuariosSelected.includes(user.id)}
                  onChange={() => toggleUsuario(user.id)}
                />
                <label htmlFor={`policy-user-${user.id}`}>{user.name}</label>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      <div className="form-group">
        <ModalSelect
          id="policy-trail"
          label="Tratativa ativa"
          value={trailId}
          onChange={setTrailId}
          options={trailOptions}
          placeholder="Selecione uma tratativa"
        />
      </div>

      <div className="form-group">
        <ModalSelect
          id="policy-status"
          label="Status"
          value={active ? 'ativo' : 'inativo'}
          onChange={(v) => setActive(v === 'ativo')}
          options={STATUS_OPTIONS}
          placeholder="Selecione o status"
        />
      </div>

      <p className="policy-form-aviso">
        Importante: novas políticas ativas terão efeito apenas sobre eventos gerados após sua
        criação ou alteração, não impactando eventos já existentes.
      </p>

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

export default PolicyForm;
