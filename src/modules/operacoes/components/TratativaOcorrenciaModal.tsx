import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  TratativaOcorrenciaData,
  TratativaContact,
  TratativaAction,
  TratativaHistoryEntry,
} from '../types/tratativaOcorrencia.types';
import { VideoTile, MapPanel } from './CentralValidacaoAlertasModal';

interface TratativaOcorrenciaModalProps {
  open: boolean;
  data: TratativaOcorrenciaData;
  onClose: () => void;
  onReturn?: () => void;
  onConclude?: () => void;
  /** "tratativa" (padrão) = fluxo ativo; "auditoria" = visualização
   *  somente-leitura, com aba adicional "Histórico" e sem footer. */
  mode?: 'tratativa' | 'auditoria';
  /** Histórico exibido na aba "Histórico" quando mode === "auditoria". */
  history?: TratativaHistoryEntry[];
}

type ActiveTab = 'tratativa' | 'informacoes' | 'eventos' | 'historico';

const SEVERITY_DOT_CLASS: Record<string, string> = {
  critical: 'tratativa-card__dot--critical',
  high: 'tratativa-card__dot--high',
  medium: 'tratativa-card__dot--medium',
  low: 'tratativa-card__dot--low',
};

const VIDEO_CHANNELS = [
  { id: 'canal-1', label: 'Canal 1', placeholder: 'Canal 1' },
  { id: 'canal-2', label: 'Canal 2', placeholder: 'Canal 2' },
  { id: 'canal-3', label: 'Canal 3', placeholder: 'Canal 3' },
  { id: 'canal-4', label: 'Canal 4', placeholder: 'Canal 4' },
] as const;

/** Formata milissegundos no padrão "8m 22s" / "1h 03m 22s". */
function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

/** Ícone de ampulheta exibido em ações ainda pendentes. */
const IconHourglassPending: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path
      d="M3 1.5h8M3 12.5h8M4 1.5v2.2c0 .9.4 1.7 1 2.3L7 8l2-2c.6-.6 1-1.4 1-2.3V1.5M4 12.5v-2.2c0-.9.4-1.7 1-2.3L7 6l2 2c.6.6 1 1.4 1 2.3v2.2"
      stroke="#A0A6AC"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconPhoneCall: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path
      d="M17 14.4V17a1 1 0 0 1-1.1 1A15 15 0 0 1 2 4.1 1 1 0 0 1 3 3h2.6a1 1 0 0 1 1 .8c.1.9.4 1.8.7 2.6a1 1 0 0 1-.2 1L5.6 8.5a12 12 0 0 0 5.9 5.9l1.1-1.5a1 1 0 0 1 1-.2c.8.3 1.7.6 2.6.7a1 1 0 0 1 .8 1z"
      stroke="#169EFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCloseLarge: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M6 6L18 18M18 6L6 18"
      stroke="#169EFF"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const IconCaretDown: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path
      d="M3 4.5L6 7.5L9 4.5"
      stroke="#667085"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconPlayBlue: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M5 3.5L16 10L5 16.5V3.5Z" stroke="#169EFF" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

interface SelectFieldProps<T> {
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel?: string;
  /** Quando true, o select fica desabilitado (modo auditoria). */
  disabled?: boolean;
}

function SelectField<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((opt) => opt.id === value);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  return (
    <div
      ref={ref}
      className={`tratativa-select${open ? ' tratativa-select--open' : ''}${disabled ? ' tratativa-select--disabled' : ''}`}
    >
      <button
        type="button"
        className="tratativa-select__trigger"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        <span className="tratativa-select__value">{selected?.label ?? 'Selecionar'}</span>
        <span className="tratativa-select__chevron" aria-hidden>
          <IconCaretDown />
        </span>
      </button>
      {open && !disabled && (
        <div className="tratativa-select__dropdown" role="listbox">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="option"
              aria-selected={opt.id === value}
              className={`tratativa-select__option${opt.id === value ? ' tratativa-select__option--selected' : ''}`}
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ActionCardProps {
  action: TratativaAction;
  status: 'done' | 'active' | 'pending';
  observation: string;
  onChangeObservation: (value: string) => void;
  onToggleDone: () => void;
  done: boolean;
  /** Modo auditoria: bloqueia textarea e checkbox; mostra cards expandidos
   *  para todas as ações concluídas, com o "Feito" marcado e desabilitado. */
  readOnly?: boolean;
  /** Card atualmente selecionado — destaca visualmente e indica que o
   *  painel "Detalhes" mostra os contatos desta ação. */
  selected?: boolean;
  /** Callback disparado ao clicar em qualquer ponto do card. */
  onSelect?: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  action,
  status,
  observation,
  onChangeObservation,
  onToggleDone,
  done,
  readOnly = false,
  selected = false,
  onSelect,
}) => {
  if (status === 'pending' && !readOnly) {
    return (
      <div
        className={`tratativa-action tratativa-action--pending${
          selected ? ' tratativa-action--selected' : ''
        }`}
        aria-disabled="true"
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onClick={onSelect}
      >
        <div className="tratativa-action__heading">
          <span className="tratativa-action__title">
            {action.sequence}. {action.title}
          </span>
          <span className="tratativa-action__hourglass" aria-hidden>
            <IconHourglassPending />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`tratativa-action${
        status === 'active' ? ' tratativa-action--active' : ' tratativa-action--done'
      }${readOnly ? ' tratativa-action--readonly' : ''}${
        selected ? ' tratativa-action--selected' : ''
      }`}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
    >
      <div className="tratativa-action__heading">
        <span className="tratativa-action__title">
          {action.sequence}. {action.title}
        </span>
      </div>
      <textarea
        className="tratativa-action__textarea"
        placeholder="Observação (Opcional)"
        value={observation}
        onChange={(event) => onChangeObservation(event.target.value)}
        rows={3}
        readOnly={readOnly}
        disabled={readOnly}
        onClick={(event) => event.stopPropagation()}
      />
      <label
        className="tratativa-action__check"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={readOnly ? true : done}
          onChange={readOnly ? undefined : onToggleDone}
          disabled={readOnly}
        />
        <span>Feito</span>
      </label>
    </div>
  );
};

const ContactRow: React.FC<{ contact: TratativaContact }> = ({ contact }) => (
  <div className="tratativa-contact">
    <span className="tratativa-contact__name">{contact.name}</span>
    <span className="tratativa-contact__shift">
      <span>{contact.shiftLabel}</span>
      <span className="tratativa-contact__shift-range">{contact.shiftRange}</span>
    </span>
    <span className="tratativa-contact__phone">{contact.phone}</span>
    <button
      type="button"
      className="tratativa-contact__call"
      aria-label={`Ligar para ${contact.name}`}
    >
      <IconPhoneCall />
    </button>
  </div>
);

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  className?: string;
}

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({ label, value, className = '' }) => (
  <div className={`tratativa-field ${className}`.trim()}>
    <span className="tratativa-field__label">{label}</span>
    <div className="tratativa-field__value tratativa-field__value--readonly">{value}</div>
  </div>
);

const Chip: React.FC<{ label: string; tone?: 'default' | 'highlight' }> = ({
  label,
  tone = 'default',
}) => (
  <span className={`tratativa-chip${tone === 'highlight' ? ' tratativa-chip--highlight' : ''}`}>
    <span>{label}</span>
    <span className="tratativa-chip__close" aria-hidden>
      ×
    </span>
  </span>
);

export const TratativaOcorrenciaModal: React.FC<TratativaOcorrenciaModalProps> = ({
  open,
  data,
  onClose,
  onReturn,
  onConclude,
  mode = 'tratativa',
  history = [],
}) => {
  const isAuditoria = mode === 'auditoria';
  const [activeTab, setActiveTab] = useState<ActiveTab>('tratativa');
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(
    data.selectedDriverId,
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    data.selectedVehicleId,
  );
  const [selectedEventId, setSelectedEventId] = useState<string>(
    data.validatedEvents[0]?.id ?? '',
  );
  /** Ação atualmente selecionada — controla o conteúdo do painel "Detalhes". */
  const [selectedActionId, setSelectedActionId] = useState<string>(
    data.actions[0]?.id ?? '',
  );
  /** Vídeo expandido na aba Eventos (mesma mecânica do modal de validação). */
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  /** Tempo em tratativa atualizado em tempo real (cronômetro). */
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      startedAtRef.current = null;
      setElapsedMs(0);
      return;
    }
    startedAtRef.current = Date.now();
    setElapsedMs(0);
    const id = window.setInterval(() => {
      if (startedAtRef.current !== null) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  /** Reseta o estado ao reabrir/quando os dados mudam. */
  useEffect(() => {
    if (!open) return;
    setActiveTab('tratativa');
    setObservations({});
    setDoneIds(new Set());
    setSelectedDriverId(data.selectedDriverId);
    setSelectedVehicleId(data.selectedVehicleId);
    setSelectedEventId(data.validatedEvents[0]?.id ?? '');
    setSelectedActionId(data.actions[0]?.id ?? '');
    setExpandedVideo(null);
  }, [open, data]);

  const allActionsDone = useMemo(
    () => data.actions.length > 0 && data.actions.every((action) => doneIds.has(action.id)),
    [data.actions, doneIds],
  );

  /** Índice da próxima ação ainda não concluída — define qual card está "ativo". */
  const currentActionIndex = useMemo(() => {
    const idx = data.actions.findIndex((action) => !doneIds.has(action.id));
    return idx === -1 ? data.actions.length : idx;
  }, [data.actions, doneIds]);

  const handleToggleDone = (actionId: string) => {
    setDoneIds((prev) => {
      const next = new Set(prev);
      const wasDone = next.has(actionId);
      if (wasDone) {
        next.delete(actionId);
      } else {
        next.add(actionId);
      }
      // Em modo tratativa a seleção acompanha o avanço da trilha:
      //  - ao marcar uma ação como "Feito": pula para a próxima
      //    ação ainda pendente (item esmaecido fica para trás);
      //  - ao desfazer: volta para a ação que acabou de virar pendente
      //    (a "ativa" novamente), evitando que um card pendente
      //    fique aparentando estar selecionado.
      // No modo auditoria todas as ações já estão concluídas e o
      // usuário escolhe livremente qual visualizar — nada a fazer.
      if (!isAuditoria) {
        if (!wasDone) {
          const nextPendingIdx = data.actions.findIndex(
            (a) => a.id !== actionId && !next.has(a.id),
          );
          if (nextPendingIdx !== -1) {
            setSelectedActionId(data.actions[nextPendingIdx].id);
          }
        } else {
          setSelectedActionId(actionId);
        }
      }
      return next;
    });
  };

  const handleObservationChange = (actionId: string, value: string) => {
    setObservations((prev) => ({ ...prev, [actionId]: value }));
  };

  const handleConclude = () => {
    if (!allActionsDone) return;
    onConclude?.();
  };

  const selectedDriver = data.driverOptions.find((d) => d.id === selectedDriverId);
  const selectedVehicle = data.vehicleOptions.find((v) => v.id === selectedVehicleId);

  /** Ação atualmente selecionada (referência completa). */
  const selectedAction = useMemo(
    () => data.actions.find((a) => a.id === selectedActionId) ?? null,
    [data.actions, selectedActionId],
  );

  /** Contatos exibidos no painel "Detalhes": preferimos os da ação
   *  selecionada e fazemos fallback para a lista global. */
  const detailContacts = selectedAction?.contacts ?? data.contacts;

  if (!open) return null;

  const dotClass = SEVERITY_DOT_CLASS[data.severity] ?? '';

  const driverSelectOptions = data.driverOptions.map((d) => ({ id: d.id, label: d.name }));
  const vehicleSelectOptions = data.vehicleOptions.map((v) => ({
    id: v.id,
    label: `${v.placa} / ${v.prefixo}`,
  }));
  const eventSelectOptions = data.validatedEvents
    .slice()
    .sort((a, b) => a.sequence - b.sequence)
    .map((e) => ({
      id: e.id,
      label: `${String(e.sequence).padStart(2, '0')} — ${e.time}`,
    }));
  const selectedEvent = data.validatedEvents.find((e) => e.id === selectedEventId);

  /** Veículo associado ao evento selecionado — usado para preencher o
   *  campo "Placa / prefixo" da aba Eventos automaticamente. */
  const eventVehicle = selectedEvent?.vehicleId
    ? data.vehicleOptions.find((v) => v.id === selectedEvent.vehicleId)
    : null;
  const eventVehicleLabel = eventVehicle
    ? `${eventVehicle.placa} / ${eventVehicle.prefixo}`
    : 'Não identificado';

  /** Motorista associado ao evento selecionado. */
  const eventDriver =
    selectedEvent?.driverId != null
      ? data.driverOptions.find((d) => d.id === selectedEvent.driverId) ?? null
      : null;
  const eventDriverLabel = eventDriver?.name ?? 'Não identificado';

  return (
    <div
      className="central-validacao-modal tratativa-ocorrencia-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tratativa-ocorrencia-title"
    >
      <aside
        className="central-validacao-sidebar tratativa-sidebar"
        aria-label="Ocorrência em tratativa"
      >
        <div className="tratativa-card" aria-current="step">
          <div className="tratativa-card__title">{data.parameterTitle}</div>
          <div className="tratativa-card__meta">
            <span className={`tratativa-card__dot ${dotClass}`} aria-hidden />
            <span>
              {data.eventsCount} {data.eventsCount === 1 ? 'evento' : 'eventos'}
            </span>
          </div>
        </div>
      </aside>

      <section className="central-validacao-content tratativa-content">
        <header className="central-validacao-header">
          <h2 id="tratativa-ocorrencia-title" className="central-validacao-header__title">
            {isAuditoria ? 'Auditoria da ocorrência' : 'Tratativa da ocorrência'}
          </h2>
          <button
            type="button"
            className="central-validacao-header__close"
            onClick={onClose}
            aria-label={isAuditoria ? 'Fechar auditoria' : 'Fechar tratativa'}
          >
            <IconCloseLarge />
          </button>
        </header>

        <nav className="central-validacao-tabs" aria-label="Abas da tratativa">
          <button
            type="button"
            className={`central-validacao-tab${
              activeTab === 'tratativa' ? ' central-validacao-tab--active' : ''
            }`}
            onClick={() => setActiveTab('tratativa')}
          >
            Tratativa
          </button>
          <button
            type="button"
            className={`central-validacao-tab${
              activeTab === 'informacoes' ? ' central-validacao-tab--active' : ''
            }`}
            onClick={() => setActiveTab('informacoes')}
          >
            Informações
          </button>
          <button
            type="button"
            className={`central-validacao-tab${
              activeTab === 'eventos' ? ' central-validacao-tab--active' : ''
            }`}
            onClick={() => setActiveTab('eventos')}
          >
            Eventos
          </button>
          {isAuditoria && (
            <button
              type="button"
              className={`central-validacao-tab${
                activeTab === 'historico' ? ' central-validacao-tab--active' : ''
              }`}
              onClick={() => setActiveTab('historico')}
            >
              Histórico
            </button>
          )}
        </nav>

        {activeTab === 'tratativa' && (
          <div className="tratativa-body">
            <div className="tratativa-fields-grid">
              <ReadOnlyField
                label="Política de tratativa"
                value={data.policyName}
                className="tratativa-field--col-1-3"
              />
              <ReadOnlyField
                label="Tipo de política"
                value={data.policyTypeLabel}
                className="tratativa-field--col-3-5"
              />
              <ReadOnlyField
                label="Tipo de evento"
                value={data.eventTypeLabel}
                className="tratativa-field--col-1-2"
              />
              <ReadOnlyField
                label="Gravidade"
                value={data.gravityLabel}
                className="tratativa-field--col-2-3"
              />
              <ReadOnlyField
                label="Tratativa"
                value={data.trailLabel}
                className="tratativa-field--col-4-5"
              />
              <ReadOnlyField
                label="Tempo em tratativa"
                value={formatElapsed(elapsedMs)}
                className="tratativa-field--col-5-6 tratativa-field--timer"
              />
            </div>

            <div className="tratativa-cols">
              <section className="tratativa-pane">
                <h3 className="tratativa-pane__title">Ações</h3>
                <div className="tratativa-actions-list">
                  {data.actions.map((action, index) => {
                    const isDone = doneIds.has(action.id);
                    /** Em auditoria, todas as ações são consideradas
                     *  concluídas (esmaecidas). Em tratativa segue o
                     *  fluxo sequencial: done > active > pending. */
                    const status: ActionCardProps['status'] = isAuditoria
                      ? 'done'
                      : isDone
                        ? 'done'
                        : index === currentActionIndex
                          ? 'active'
                          : 'pending';
                    /** Cards selecionáveis: na auditoria todas as ações;
                     *  em tratativa apenas as que não estão pendentes
                     *  (i.e., done ou active), permitindo trocar a
                     *  visualização do painel "Detalhes". */
                    const canSelect = isAuditoria || status !== 'pending';
                    return (
                      <ActionCard
                        key={action.id}
                        action={action}
                        status={status}
                        observation={observations[action.id] ?? ''}
                        onChangeObservation={(value) =>
                          handleObservationChange(action.id, value)
                        }
                        onToggleDone={() => handleToggleDone(action.id)}
                        done={isDone}
                        readOnly={isAuditoria}
                        selected={selectedActionId === action.id}
                        onSelect={
                          canSelect ? () => setSelectedActionId(action.id) : undefined
                        }
                      />
                    );
                  })}
                </div>
              </section>

              <section className="tratativa-pane">
                <h3 className="tratativa-pane__title">Detalhes</h3>
                <div className="tratativa-contacts-list">
                  {detailContacts.length === 0 ? (
                    <p className="tratativa-empty">Nenhum contato configurado.</p>
                  ) : (
                    detailContacts.map((contact) => (
                      <ContactRow key={contact.id} contact={contact} />
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'informacoes' && (
          <div className="tratativa-body tratativa-info">
            <section className="tratativa-info-section">
              <header className="tratativa-info-section__header">
                <h3 className="tratativa-info-section__title">Dados da empresa</h3>
              </header>
              <div className="tratativa-info-grid tratativa-info-grid--1">
                <ReadOnlyField label="Empresa" value={data.company.name} />
              </div>
            </section>

            <section className="tratativa-info-section">
              <header className="tratativa-info-section__header">
                <h3 className="tratativa-info-section__title">Dados do motorista</h3>
              </header>
              <div className="tratativa-info-grid tratativa-info-grid--2">
                <div className="tratativa-field">
                  <span className="tratativa-field__label">Nome</span>
                  {selectedDriverId ? (
                    <SelectField
                      value={selectedDriverId}
                      options={driverSelectOptions}
                      onChange={(id) => setSelectedDriverId(id)}
                      ariaLabel="Selecionar motorista"
                      disabled={isAuditoria}
                    />
                  ) : (
                    <div className="tratativa-field__value tratativa-field__value--readonly">
                      Não identificado
                    </div>
                  )}
                </div>
                {selectedDriver && (
                  <div className="tratativa-field">
                    <span className="tratativa-field__label">Grupos de organização</span>
                    <div className="tratativa-field__chips">
                      {selectedDriver.organizationGroups.map((g, idx) => (
                        <Chip
                          key={g.id}
                          label={g.label}
                          tone={
                            idx === selectedDriver.organizationGroups.length - 1
                              ? 'highlight'
                              : 'default'
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="tratativa-info-section">
              <header className="tratativa-info-section__header">
                <h3 className="tratativa-info-section__title">Dados do veículo</h3>
              </header>
              <div className="tratativa-info-grid tratativa-info-grid--3">
                <div className="tratativa-field tratativa-field--col-1-2">
                  <span className="tratativa-field__label">Placa / prefixo</span>
                  {selectedVehicleId ? (
                    <SelectField
                      value={selectedVehicleId}
                      options={vehicleSelectOptions}
                      onChange={(id) => setSelectedVehicleId(id)}
                      ariaLabel="Selecionar veículo"
                      disabled={isAuditoria}
                    />
                  ) : (
                    <div className="tratativa-field__value tratativa-field__value--readonly">
                      Não identificado
                    </div>
                  )}
                </div>
                {selectedVehicle && (
                  <>
                    <ReadOnlyField label="Tipo" value={selectedVehicle.tipo} />
                    <ReadOnlyField label="Marca" value={selectedVehicle.marca} />
                    <ReadOnlyField label="Modelo" value={selectedVehicle.modelo} />
                    <ReadOnlyField label="Ano / modelo" value={selectedVehicle.anoModelo} />
                    <ReadOnlyField label="Combustível" value={selectedVehicle.combustivel} />
                    <div className="tratativa-field tratativa-field--col-2-4">
                      <span className="tratativa-field__label">Grupos de organização</span>
                      <div className="tratativa-field__chips">
                        {selectedVehicle.organizationGroups.map((g, idx) => (
                          <Chip
                            key={g.id}
                            label={g.label}
                            tone={
                              idx === selectedVehicle.organizationGroups.length - 1
                                ? 'highlight'
                                : 'default'
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'eventos' && (
          <div className="tratativa-body tratativa-eventos">
            <div className="tratativa-eventos-fields">
              <div className="tratativa-field">
                <span className="tratativa-field__label">Evento</span>
                <SelectField
                  value={selectedEventId}
                  options={eventSelectOptions}
                  onChange={(id) => setSelectedEventId(id)}
                  ariaLabel="Selecionar evento"
                />
              </div>
              <ReadOnlyField
                label="Validado como"
                value={selectedEvent?.validatedAs ?? '—'}
              />
              {isAuditoria ? (
                /* Auditoria: campos seguem o evento selecionado e ficam
                   somente leitura. */
                <>
                  <ReadOnlyField label="Placa / prefixo" value={eventVehicleLabel} />
                  <ReadOnlyField label="Motorista" value={eventDriverLabel} />
                </>
              ) : (
                /* Tratativa: o analista pode alterar a Placa/prefixo
                   e a Motorista decorre da seleção feita na aba
                   "Informações" (read-only nesta aba). */
                <>
                  <div className="tratativa-field">
                    <span className="tratativa-field__label">Placa / prefixo</span>
                    {selectedVehicleId ? (
                      <SelectField
                        value={selectedVehicleId}
                        options={vehicleSelectOptions}
                        onChange={(id) => setSelectedVehicleId(id)}
                        ariaLabel="Selecionar veículo"
                      />
                    ) : (
                      <div className="tratativa-field__value tratativa-field__value--readonly">
                        Não identificado
                      </div>
                    )}
                  </div>
                  <ReadOnlyField
                    label="Motorista"
                    value={selectedDriver?.name ?? 'Não identificado'}
                  />
                </>
              )}
            </div>

            <div className="tratativa-eventos-player">
              <div
                className={`central-validacao-videos${expandedVideo ? ' has-expanded' : ''}`}
                role="group"
                aria-label="Câmeras"
              >
                {VIDEO_CHANNELS.map((cam) => (
                  <VideoTile
                    key={cam.id}
                    label={cam.label}
                    placeholder={cam.placeholder}
                    expanded={expandedVideo === cam.id}
                    onToggleExpand={() =>
                      setExpandedVideo((prev) => (prev === cam.id ? null : cam.id))
                    }
                  />
                ))}
              </div>
              <MapPanel />
            </div>

            <div className="tratativa-eventos-timeline">
              <button
                type="button"
                className="tratativa-eventos-play"
                aria-label="Reproduzir"
              >
                <IconPlayBlue />
              </button>
              <div className="tratativa-eventos-timeline__bar" aria-hidden>
                <span className="tratativa-eventos-timeline__cursor" />
              </div>
              <div className="tratativa-eventos-timeline__marks" aria-hidden>
                {['00:00', '00:02', '00:04', '00:06', '00:08', '00:10'].map((label) => (
                  <span key={label} className="tratativa-eventos-timeline__mark">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'historico' && isAuditoria && (
          <div className="tratativa-body tratativa-historico">
            {history.length === 0 ? (
              <p className="tratativa-empty">Sem registros de histórico.</p>
            ) : (
              <ul className="tratativa-historico-list">
                {history.map((entry) => (
                  <li key={entry.id} className="tratativa-historico-row">
                    <span className="tratativa-historico-row__when">{entry.when}</span>
                    <span className="tratativa-historico-row__author">{entry.author}</span>
                    <span className="tratativa-historico-row__description">
                      {entry.description}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!isAuditoria && (
          <footer className="tratativa-footer">
            <button
              type="button"
              className="tratativa-btn tratativa-btn--outline"
              onClick={onReturn ?? onClose}
            >
              Devolver
            </button>
            <button
              type="button"
              className="tratativa-btn tratativa-btn--primary"
              onClick={handleConclude}
              disabled={!allActionsDone}
              aria-disabled={!allActionsDone}
            >
              Concluir tratativa
            </button>
          </footer>
        )}
      </section>
    </div>
  );
};

export default TratativaOcorrenciaModal;
