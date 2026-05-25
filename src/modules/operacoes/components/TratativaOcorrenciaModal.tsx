import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  TratativaOcorrenciaData,
  TratativaContact,
  TratativaAction,
} from '../types/tratativaOcorrencia.types';

interface TratativaOcorrenciaModalProps {
  open: boolean;
  data: TratativaOcorrenciaData;
  onClose: () => void;
  onReturn?: () => void;
  onConclude?: () => void;
}

type ActiveTab = 'tratativa' | 'informacoes' | 'eventos';

const SEVERITY_DOT_CLASS: Record<string, string> = {
  critical: 'tratativa-card__dot--critical',
  high: 'tratativa-card__dot--high',
  medium: 'tratativa-card__dot--medium',
  low: 'tratativa-card__dot--low',
};

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

/** Ícone de telefone do contato (azul, no padrão da tela). */
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

interface TrailSelectProps {
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
}

const TrailSelect: React.FC<TrailSelectProps> = ({ value, options, onChange }) => {
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
    <div ref={ref} className={`tratativa-select${open ? ' tratativa-select--open' : ''}`}>
      <button
        type="button"
        className="tratativa-select__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="tratativa-select__value">{selected?.label ?? 'Selecionar'}</span>
        <span className="tratativa-select__chevron" aria-hidden>
          <IconCaretDown />
        </span>
      </button>
      {open && (
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
};

interface ActionCardProps {
  action: TratativaAction;
  status: 'done' | 'active' | 'pending';
  observation: string;
  onChangeObservation: (value: string) => void;
  onMarkDone: () => void;
  done: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({
  action,
  status,
  observation,
  onChangeObservation,
  onMarkDone,
  done,
}) => {
  if (status === 'pending') {
    return (
      <div className="tratativa-action tratativa-action--pending" aria-disabled="true">
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
      }`}
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
        disabled={done}
        rows={3}
      />
      <label className="tratativa-action__check">
        <input
          type="checkbox"
          checked={done}
          onChange={(event) => {
            if (event.target.checked) onMarkDone();
          }}
          disabled={done}
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
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tratativa');
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [trailId, setTrailId] = useState(data.selectedTrailId);

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
    setCurrentActionIndex(0);
    setObservations({});
    setDoneIds(new Set());
    setTrailId(data.selectedTrailId);
  }, [open, data.selectedTrailId]);

  const allActionsDone = useMemo(
    () => data.actions.length > 0 && data.actions.every((action) => doneIds.has(action.id)),
    [data.actions, doneIds],
  );

  const handleMarkDone = (actionId: string, index: number) => {
    setDoneIds((prev) => {
      const next = new Set(prev);
      next.add(actionId);
      return next;
    });
    setCurrentActionIndex((current) => Math.max(current, index + 1));
  };

  const handleObservationChange = (actionId: string, value: string) => {
    setObservations((prev) => ({ ...prev, [actionId]: value }));
  };

  const handleConclude = () => {
    if (!allActionsDone) return;
    onConclude?.();
  };

  if (!open) return null;

  const dotClass = SEVERITY_DOT_CLASS[data.severity] ?? '';

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
            Tratativa da ocorrência
          </h2>
          <button
            type="button"
            className="central-validacao-header__close"
            onClick={onClose}
            aria-label="Fechar tratativa"
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
                className="tratativa-field--col-1-3"
              />
              <ReadOnlyField
                label="Gravidade"
                value={data.gravityLabel}
                className="tratativa-field--col-3-4"
              />

              <div className="tratativa-field tratativa-field--col-4-6">
                <span className="tratativa-field__label">Tratativa</span>
                <TrailSelect
                  value={trailId}
                  options={data.trailOptions}
                  onChange={setTrailId}
                />
              </div>

              <ReadOnlyField
                label="Tempo em tratativa"
                value={formatElapsed(elapsedMs)}
                className="tratativa-field--col-6-7 tratativa-field--timer"
              />
            </div>

            <div className="tratativa-cols">
              <section className="tratativa-pane">
                <h3 className="tratativa-pane__title">Ações</h3>
                <div className="tratativa-actions-list">
                  {data.actions.map((action, index) => {
                    const status: ActionCardProps['status'] =
                      index < currentActionIndex
                        ? 'done'
                        : index === currentActionIndex
                          ? 'active'
                          : 'pending';
                    return (
                      <ActionCard
                        key={action.id}
                        action={action}
                        status={status}
                        observation={observations[action.id] ?? ''}
                        onChangeObservation={(value) =>
                          handleObservationChange(action.id, value)
                        }
                        onMarkDone={() => handleMarkDone(action.id, index)}
                        done={doneIds.has(action.id)}
                      />
                    );
                  })}
                </div>
              </section>

              <section className="tratativa-pane">
                <h3 className="tratativa-pane__title">Detalhes</h3>
                <div className="tratativa-contacts-list">
                  {data.contacts.length === 0 ? (
                    <p className="tratativa-empty">Nenhum contato configurado.</p>
                  ) : (
                    data.contacts.map((contact) => (
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

            {data.driver && (
              <section className="tratativa-info-section">
                <header className="tratativa-info-section__header">
                  <h3 className="tratativa-info-section__title">Dados do motorista</h3>
                </header>
                <div className="tratativa-info-grid tratativa-info-grid--2">
                  <ReadOnlyField label="Nome" value={data.driver.name} />
                  <div className="tratativa-field">
                    <span className="tratativa-field__label">Grupos de organização</span>
                    <div className="tratativa-field__chips">
                      {data.driver.organizationGroups.map((g, idx) => (
                        <Chip
                          key={g.id}
                          label={g.label}
                          tone={idx === data.driver!.organizationGroups.length - 1
                            ? 'highlight'
                            : 'default'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {data.vehicle && (
              <section className="tratativa-info-section">
                <header className="tratativa-info-section__header">
                  <h3 className="tratativa-info-section__title">Dados do veículo</h3>
                </header>
                <div className="tratativa-info-grid tratativa-info-grid--3">
                  <ReadOnlyField label="Placa" value={data.vehicle.placa} />
                  <ReadOnlyField label="Prefixo" value={data.vehicle.prefixo} />
                  <ReadOnlyField label="Tipo" value={data.vehicle.tipo} />
                  <ReadOnlyField label="Marca" value={data.vehicle.marca} />
                  <ReadOnlyField label="Modelo" value={data.vehicle.modelo} />
                  <ReadOnlyField label="Ano / modelo" value={data.vehicle.anoModelo} />
                  <ReadOnlyField label="Combustível" value={data.vehicle.combustivel} />
                  <div className="tratativa-field tratativa-field--col-2-4">
                    <span className="tratativa-field__label">Grupos de organização</span>
                    <div className="tratativa-field__chips">
                      {data.vehicle.organizationGroups.map((g, idx) => (
                        <Chip
                          key={g.id}
                          label={g.label}
                          tone={idx === data.vehicle!.organizationGroups.length - 1
                            ? 'highlight'
                            : 'default'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'eventos' && (
          <div className="tratativa-body">
            <p className="tratativa-empty">
              Lista de eventos da ocorrência (em construção).
            </p>
          </div>
        )}

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
      </section>
    </div>
  );
};

export default TratativaOcorrenciaModal;
