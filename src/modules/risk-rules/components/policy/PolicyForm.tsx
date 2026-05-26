import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Policy, PolicyEventConfig, PolicyTrigger, PolicyTrackingType, ScoreRule, Trail } from '../../types/risk.types';
import type { PlatformUser } from '../../mocks/risk.mock';
import { EVENT_TYPE_LABELS } from '../../constants/eventTypes';
import { FieldErrorIcon } from '../shared/FieldErrorIcon';
import { IconTrash, IconSearch } from '../shared/Icons';
import { InfoTooltip } from '../shared/InfoTooltip';
import { LevelTooltip } from '../shared/LevelTooltip';
import { ModalSelect, type ModalSelectOption } from '../shared/ModalSelect';
import { GRAVITY_FIELD_LABEL, GRAVITY_OPTIONS } from '../../constants/gravityConstants';
import { COMPANY_OPTIONS } from '../../constants/companies';
import { useCurrentUser } from '../../hooks/useCurrentUser';

interface PolicyFormProps {
  id?: string;
  initialData?: Partial<Policy> | null;
  scores: ScoreRule[];
  trails: Trail[];
  users: PlatformUser[];
  onSubmit: (data: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  hideActions?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
}

const TRACKING_OPTIONS: ModalSelectOption[] = [
  { value: 'motorista', label: 'Por motorista' },
  { value: 'veiculo', label: 'Por veículo' },
];

const DURACAO_ATIVA_OPTIONS: ModalSelectOption[] = [
  { value: '15min', label: '15 min' },
  { value: '30min', label: '30 min' },
  { value: '1h', label: '1 h' },
  { value: '2h', label: '2 h' },
  { value: '3h', label: '3 h' },
  { value: '4h', label: '4 h' },
  { value: '5h', label: '5 h' },
  { value: '6h', label: '6 h' },
  { value: '7h', label: '7 h' },
  { value: '8h', label: '8 h' },
  { value: '9h', label: '9 h' },
  { value: '10h', label: '10 h' },
  { value: '11h', label: '11 h' },
  { value: '12h', label: '12 h' },
];

const STATUS_OPTIONS: ModalSelectOption[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

const MAX_GATILHOS = 5;
const DEFAULT_DURACAO = '1h';
const DEFAULT_PONTOS = 0;

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
  const currentUser = useCurrentUser();
  const isClient = currentUser.kind === 'client';
  const defaultCompanyId = currentUser.companyId ?? COMPANY_OPTIONS[0].value;

  const [companyId, setCompanyId] = useState(initialData?.companyId ?? defaultCompanyId);
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [tipoAcompanhamento, setTipoAcompanhamento] = useState<PolicyTrackingType>(
    initialData?.tipoAcompanhamento ?? 'motorista'
  );
  const [configEventos, setConfigEventos] = useState<Record<string, PolicyEventConfig>>(
    () => initialData?.configEventos ?? {}
  );
  const [usuariosAll, setUsuariosAll] = useState<boolean>(
    initialData?.usuariosAtribuidos === 'all' || !Array.isArray(initialData?.usuariosAtribuidos)
  );
  const [usuariosSelected, setUsuariosSelected] = useState<string[]>(
    Array.isArray(initialData?.usuariosAtribuidos) ? initialData.usuariosAtribuidos : []
  );
  const [gatilhos, setGatilhos] = useState<PolicyTrigger[]>(() => {
    const g = initialData?.gatilhos ?? [];
    if (g.length > 0) return g.slice(0, MAX_GATILHOS);
    return [{ aPartirDePontos: 0, trilhaId: '' }];
  });
  const [active, setActive] = useState(initialData?.active ?? true);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventSearchExpanded, setEventSearchExpanded] = useState(false);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: boolean;
    configEventos?: boolean;
    usuarios?: boolean;
    gatilhos?: boolean;
  }>({});

  /** Pool de eventos disponiveis na politica: nao inclui "Personalizados". */
  const policyScores = useMemo(
    () => scores.filter((s) => s.eventType !== 'personalizados'),
    [scores],
  );

  const filteredScores = useMemo(() => {
    const q = eventSearchQuery.trim().toLowerCase();
    const list = q
      ? policyScores.filter((s) => s.name.toLowerCase().includes(q))
      : policyScores.slice();
    return list.sort((a, b) => {
      const aIn = !!configEventos[a.id];
      const bIn = !!configEventos[b.id];
      if (aIn && !bIn) return -1;
      if (!aIn && bIn) return 1;
      return 0;
    });
  }, [policyScores, eventSearchQuery, configEventos]);

  const activeUsers = useMemo(() => users.filter((u) => u.active), [users]);
  const activeTrails = useMemo(() => trails.filter((t) => t.active), [trails]);
  const trailOptions: ModalSelectOption[] = useMemo(
    () => [{ value: '', label: 'Nenhuma' }, ...activeTrails.map((t) => ({ value: t.id, label: t.name }))],
    [activeTrails]
  );

  const hasVideoEvent = useMemo(
    () => scores.some((s) => configEventos[s.id] && s.eventType === 'video'),
    [scores, configEventos]
  );

  const isDirty = useMemo(() => {
    if (!initialData)
      return (
        name !== '' ||
        description !== '' ||
        Object.keys(configEventos).length > 0 ||
        !usuariosAll ||
        usuariosSelected.length > 0 ||
        gatilhos.length > 0
      );
    if (name.trim() !== (initialData.name ?? '').trim()) return true;
    if ((description ?? '') !== (initialData.description ?? '')) return true;
    if (tipoAcompanhamento !== (initialData.tipoAcompanhamento ?? 'motorista')) return true;
    const initConfig = initialData.configEventos ?? {};
    const keys = Object.keys(configEventos);
    const initKeys = Object.keys(initConfig);
    if (keys.length !== initKeys.length || keys.some((k) => !initKeys.includes(k))) return true;
    for (const k of keys) {
      if (
        configEventos[k].pontos !== (initConfig[k]?.pontos ?? DEFAULT_PONTOS) ||
        configEventos[k].duracaoAtiva !== (initConfig[k]?.duracaoAtiva ?? DEFAULT_DURACAO)
      )
        return true;
    }
    const initAll = initialData.usuariosAtribuidos === 'all' || !Array.isArray(initialData.usuariosAtribuidos);
    if (usuariosAll !== initAll) return true;
    if (!usuariosAll) {
      const initSel = Array.isArray(initialData.usuariosAtribuidos) ? initialData.usuariosAtribuidos : [];
      if (usuariosSelected.length !== initSel.length || [...usuariosSelected].sort().join(',') !== [...initSel].sort().join(','))
        return true;
    }
    const initG = initialData.gatilhos ?? [];
    if (gatilhos.length !== initG.length) return true;
    for (let i = 0; i < gatilhos.length; i++) {
      if (
        gatilhos[i].aPartirDePontos !== initG[i]?.aPartirDePontos ||
        gatilhos[i].trilhaId !== initG[i]?.trilhaId ||
        (gatilhos[i].nivelRisco ?? '') !== (initG[i]?.nivelRisco ?? '')
      )
        return true;
    }
    if (active !== (initialData.active ?? true)) return true;
    return false;
  }, [initialData, name, description, tipoAcompanhamento, configEventos, usuariosAll, usuariosSelected, gatilhos, active]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const toggleEvento = (scoreId: string) => {
    setConfigEventos((prev) => {
      const next = { ...prev };
      if (next[scoreId]) {
        delete next[scoreId];
        return next;
      }
      next[scoreId] = { pontos: DEFAULT_PONTOS, duracaoAtiva: DEFAULT_DURACAO };
      return next;
    });
    if (fieldErrors.configEventos) setFieldErrors((err) => ({ ...err, configEventos: false }));
  };

  const setEventoConfig = (scoreId: string, patch: Partial<PolicyEventConfig>) => {
    setConfigEventos((prev) => {
      const cur = prev[scoreId];
      if (!cur) return prev;
      return { ...prev, [scoreId]: { ...cur, ...patch } };
    });
  };

  const selectAllEventos = (checked: boolean) => {
    if (checked) {
      const next: Record<string, PolicyEventConfig> = {};
      policyScores.forEach((s) => {
        next[s.id] = configEventos[s.id] ?? { pontos: DEFAULT_PONTOS, duracaoAtiva: DEFAULT_DURACAO };
      });
      setConfigEventos(next);
    } else setConfigEventos({});
    if (fieldErrors.configEventos) setFieldErrors((err) => ({ ...err, configEventos: false }));
  };

  const allEventosSelected =
    policyScores.length > 0 && policyScores.every((s) => !!configEventos[s.id]);

  const toggleUsuario = (userId: string) => {
    setUsuariosSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
    if (fieldErrors.usuarios) setFieldErrors((err) => ({ ...err, usuarios: false }));
  };

  const gatilhosOrderValid = useMemo(() => {
    if (gatilhos.length <= 1) return true;
    for (let i = 1; i < gatilhos.length; i++) {
      if (gatilhos[i].aPartirDePontos <= gatilhos[i - 1].aPartirDePontos) return false;
    }
    return true;
  }, [gatilhos]);

  const addGatilho = () => {
    if (gatilhos.length >= MAX_GATILHOS) return;
    const lastPoints = gatilhos.length ? gatilhos[gatilhos.length - 1].aPartirDePontos : 0;
    setGatilhos((prev) => [...prev, { aPartirDePontos: lastPoints + 10, trilhaId: '', nivelRisco: undefined }]);
    if (fieldErrors.gatilhos) setFieldErrors((err) => ({ ...err, gatilhos: false }));
  };

  const updateGatilho = (index: number, patch: Partial<PolicyTrigger>) => {
    setGatilhos((prev) =>
      prev.map((g, i) => (i === index ? { ...g, ...patch } : g))
    );
    if (fieldErrors.gatilhos) setFieldErrors((err) => ({ ...err, gatilhos: false }));
  };

  const removeGatilho = (index: number) => {
    if (gatilhos.length <= 1) return;
    setGatilhos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrimmed = name.trim();
    const nameInvalid = !nameTrimmed;
    const eventosInvalid = Object.keys(configEventos).length === 0;
    const usuariosInvalid = !usuariosAll && usuariosSelected.length === 0;
    const gatilhosInvalid =
      gatilhos.length === 0 ||
      !gatilhosOrderValid ||
      gatilhos.some((g) => g.trilhaId === '');
    const errors = {
      name: nameInvalid,
      configEventos: eventosInvalid,
      usuarios: usuariosInvalid,
      gatilhos: gatilhosInvalid,
    };
    setFieldErrors(errors);
    if (nameInvalid || eventosInvalid || usuariosInvalid || gatilhosInvalid) return;
    const gatilhosClean = gatilhos
      .filter((g) => g.trilhaId)
      .map((g) => ({
        aPartirDePontos: Math.max(0, g.aPartirDePontos),
        trilhaId: g.trilhaId,
        ...(g.nivelRisco && { nivelRisco: g.nivelRisco }),
      }))
      .sort((a, b) => a.aPartirDePontos - b.aPartirDePontos);
    onSubmit({
      name: nameTrimmed,
      companyId,
      description: description || undefined,
      tipoAcompanhamento,
      configEventos,
      usuariosAtribuidos: usuariosAll ? 'all' : usuariosSelected,
      gatilhos: gatilhosClean,
      active,
    });
  };

  return (
    <form id={id} className="policy-form form-card" onSubmit={handleSubmit}>
      <div className="form-group">
        <div className="form-group__label-row">
          <label htmlFor="policy-company">Empresa</label>
        </div>
        <ModalSelect
          id="policy-company"
          options={currentUser.availableCompanies}
          value={companyId}
          onChange={(v) => setCompanyId(v)}
          placeholder="Selecione a empresa"
          disabled={isClient}
          className="modal-select--no-pill"
        />
      </div>
      <div className="policy-form-row policy-form-row--name-tracking">
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
          <div className="policy-form-tracking-label-wrap">
            <label htmlFor="policy-tracking" className="modal-select__label">Tipo de acompanhamento</label>
            <InfoTooltip text="O tipo de acompanhamento definido nesta política fará com que o sistema monitore os eventos gerados por motorista ou por veículo, conforme a configuração estabelecida." />
          </div>
          <ModalSelect
            id="policy-tracking"
            value={tipoAcompanhamento}
            onChange={(v) => setTipoAcompanhamento(v as PolicyTrackingType)}
            options={TRACKING_OPTIONS}
            placeholder="Selecione"
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

      <div className={`form-group ${fieldErrors.configEventos ? 'has-error' : ''}`}>
        <div className="policy-form-eventos-section">
          <div className="trail-form-etapas-header policy-form-gatilhos-header policy-form-eventos-header">
            <label className="policy-form-gatilhos-title">Configuração por evento</label>
            <div
              className={`policy-form-eventos-search-expand ${eventSearchExpanded ? 'is-expanded' : ''}`}
              onMouseLeave={() => setEventSearchExpanded(false)}
            >
              <input
                id="policy-eventos-search"
                type="text"
                value={eventSearchQuery}
                onChange={(e) => setEventSearchQuery(e.target.value)}
                onFocus={() => setEventSearchExpanded(true)}
                onBlur={() => setEventSearchExpanded(false)}
                placeholder="Buscar evento..."
                className="policy-form-eventos-search-input"
                autoComplete="off"
                aria-label="Buscar evento"
              />
              <span
                className="policy-form-eventos-search-icon"
                onMouseEnter={() => setEventSearchExpanded(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEventSearchExpanded(true); }}
                aria-label="Expandir busca"
              >
                <IconSearch />
              </span>
            </div>
          </div>
          <div className={`policy-form-eventos-section__content ${fieldErrors.configEventos ? 'has-error' : ''}`}>
            {fieldErrors.configEventos && (
              <span className="form-group__field-error-icon form-group__field-error-icon--block">
                <FieldErrorIcon />
              </span>
            )}
            <p className="form-hint policy-form-eventos-section-hint">
              Selecione os eventos desta política e defina pontuação e duração ativa para cada um
            </p>
            <div className="policy-form-eventos-config-table-wrap">
              <table className="list-table policy-form-eventos-config">
                <thead>
                  <tr>
                    <th style={{ width: '2rem' }} className="policy-form-eventos-config-header__th-checkbox">
                      <LevelTooltip text="Selecionar todos" topLayer anchorRef={selectAllCheckboxRef}>
                        <input
                          ref={selectAllCheckboxRef}
                          id="policy-eventos-all"
                          type="checkbox"
                          checked={allEventosSelected}
                          onChange={(e) => selectAllEventos(e.target.checked)}
                          aria-label="Selecionar todos"
                        />
                      </LevelTooltip>
                    </th>
                    <th>Evento</th>
                    <th>Tipo</th>
                    <th className="policy-form-eventos-config-header__th-with-info">
                      Pontos
                      <InfoTooltip text="Defina a pontuação individual de cada evento. Esses pontos serão somados para geração de uma ocorrência." />
                    </th>
                    <th className="policy-form-eventos-config-header__th-with-info">
                      Duração ativa
                      <InfoTooltip text="Período durante o qual o evento permanecerá ativo para compor a soma de pontos na geração da ocorrência." />
                    </th>
                  </tr>
                </thead>
                <tbody>
                {filteredScores.map((score) => {
                  const included = !!configEventos[score.id];
                  return (
                    <tr key={score.id}>
                      <td>
                        <input
                          id={`policy-evento-${score.id}`}
                          type="checkbox"
                          checked={included}
                          onChange={() => toggleEvento(score.id)}
                        />
                      </td>
                      <td>
                        <label htmlFor={`policy-evento-${score.id}`}>{score.name}</label>
                      </td>
                      <td>{EVENT_TYPE_LABELS[score.eventType]}</td>
                      <td>
                        {included ? (
                          <input
                            type="number"
                            min={0}
                            max={999}
                            value={configEventos[score.id].pontos}
                            onChange={(e) => {
                              const v = Math.min(999, Math.max(0, Number(e.target.value) || 0));
                              setEventoConfig(score.id, { pontos: v });
                            }}
                            className="input-narrow policy-form-eventos-pontos-input"
                            inputMode="numeric"
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        {included ? (
                          <ModalSelect
                            id={`policy-evento-duracao-${score.id}`}
                            value={configEventos[score.id].duracaoAtiva}
                            onChange={(v) => setEventoConfig(score.id, { duracaoAtiva: v })}
                            options={DURACAO_ATIVA_OPTIONS}
                            placeholder="Duração"
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className={`form-group ${fieldErrors.gatilhos ? 'has-error' : ''}`}>
        <div className="policy-form-gatilhos-section">
          <div className="trail-form-etapas-header policy-form-gatilhos-header">
            <label className="policy-form-gatilhos-title">Ocorrências (1 a {MAX_GATILHOS})</label>
            {gatilhos.length < MAX_GATILHOS && (
              <button type="button" className="btn btn-sm btn-primary" onClick={addGatilho}>
                + Adicionar ocorrência
              </button>
            )}
          </div>
          <div className="trail-steps-wrapper-outer">
            <div className={`trail-steps-wrapper ${fieldErrors.gatilhos ? 'trail-steps-wrapper--error' : ''}`}>
              {fieldErrors.gatilhos && (
                <span className="trail-steps-wrapper__field-error-icon">
                  <FieldErrorIcon className="level-tooltip-wrap--tooltip-right" />
                </span>
              )}
              <div className="trail-steps">
                {gatilhos.map((g, index) => (
                  <div key={index} className="trail-step-card">
                    <div className="trail-step-header">
                      <span className="trail-step-title">Ocorrência {index + 1}</span>
                      {gatilhos.length > 1 && (
                        <button
                          type="button"
                          className="trail-step-remove-btn"
                          onClick={() => removeGatilho(index)}
                          aria-label="Remover ocorrência"
                        >
                          <IconTrash />
                        </button>
                      )}
                    </div>
                    <div className="trail-step-row policy-form-gatilho-body">
                      <div className="trail-step-action policy-form-gatilho-points-inline">
                        <label htmlFor={`gatilho-points-${index}`}>A partir de</label>
                        <input
                          id={`gatilho-points-${index}`}
                          type="number"
                          min={0}
                          max={999}
                          value={g.aPartirDePontos}
                          onChange={(e) => {
                            const v = Math.min(999, Math.max(0, Number(e.target.value) || 0));
                            updateGatilho(index, { aPartirDePontos: v });
                          }}
                          className="policy-form-gatilho-input-points"
                          inputMode="numeric"
                        />
                      </div>
                      <div className="trail-step-action policy-form-gatilho-trail-inline">
                        <ModalSelect
                          id={`gatilho-trail-${index}`}
                          label="Solicitar tratativa"
                          value={g.trilhaId}
                          onChange={(v) => updateGatilho(index, { trilhaId: v })}
                          options={trailOptions}
                          placeholder="Selecione a trilha"
                        />
                      </div>
                      {hasVideoEvent && (
                        <div className="trail-step-action policy-form-gatilho-trail-inline">
                          <ModalSelect
                            id={`gatilho-nivel-${index}`}
                            label={GRAVITY_FIELD_LABEL}
                            value={g.nivelRisco ?? ''}
                            onChange={(v) => updateGatilho(index, { nivelRisco: (v || undefined) as PolicyTrigger['nivelRisco'] })}
                            options={GRAVITY_OPTIONS}
                            placeholder="Selecione"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="form-hint policy-form-gatilhos-hint">
            A partir de X pontos (soma dos eventos ativos), solicitar a tratativa selecionada. Ordem crescente.
          </p>
        </div>
      </div>

      <div className={`form-group ${fieldErrors.usuarios ? 'has-error' : ''}`}>
        <div className="policy-form-usuarios-section">
          <div className="trail-form-etapas-header policy-form-gatilhos-header">
            <label className="policy-form-gatilhos-title">Usuários atribuídos</label>
          </div>
          <div className="policy-form-usuarios-section__content">
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
              <div className="policy-form-usuarios-table-wrap">
                <table className="list-table policy-form-usuarios-table policy-form-usuarios-table-header">
                  <thead>
                    <tr>
                      <th style={{ width: '2rem' }}></th>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Grupo de organização</th>
                    </tr>
                  </thead>
                </table>
                <div className="policy-form-usuarios-table-body-wrap">
                  <table className="list-table policy-form-usuarios-table policy-form-usuarios-table-body">
                    <tbody>
                      {activeUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <input
                              id={`policy-user-${user.id}`}
                              type="checkbox"
                              checked={usuariosSelected.includes(user.id)}
                              onChange={() => toggleUsuario(user.id)}
                            />
                          </td>
                          <td>
                            <label htmlFor={`policy-user-${user.id}`}>{user.name}</label>
                          </td>
                          <td>{user.email ?? '—'}</td>
                          <td>
                            {user.grupoOrganizacao ? (
                              <span className="policy-form-usuarios-grupo-tag">{user.grupoOrganizacao}</span>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
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
