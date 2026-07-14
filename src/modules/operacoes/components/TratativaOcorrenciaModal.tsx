import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SystemFullscreenPortal } from '../../../components/layout/SystemFullscreenPortal';
import type {
  TratativaOcorrenciaData,
  TratativaContact,
  TratativaAction,
  TratativaHistoryEntry,
  TratativaActionResolution,
  TratativaAttachment,
} from '../types/tratativaOcorrencia.types';
import { VideoTile, MapPanel } from './CentralValidacaoAlertasModal';
import { LevelTooltip } from '../../risk-rules/components/shared/LevelTooltip';
import { SuccessToast } from '../../risk-rules/components/shared/SuccessToast';
import { IconTrash } from '../../risk-rules/components/shared/Icons';
import { CrModal } from '../../risk-rules/components/shared/CrModal';
import {
  CONTACT_PREFERENCE_OPTIONS,
} from '../../risk-rules/constants/contactDisplay';
import type { ContactPreference } from '../../risk-rules/types/risk.types';
import { formatTratativaContactSchedule } from '../../risk-rules/utils/contactSchedule';
import { buildEventTimelineLabels } from '../utils/eventTimeline';
import { TratativaBehaviorEvolutionPanel } from './TratativaBehaviorEvolutionPanel';
import { TratativaAnexosPanel } from './TratativaAnexosPanel';
import { TratativaStreamingPanel } from './TratativaStreamingPanel';
import { resolveTratativaStreamingData } from '../utils/tratativaStreaming';
import emptyHistoryImage from '../../../assets/empty-history.png';

interface TratativaOcorrenciaModalProps {
  open: boolean;
  data: TratativaOcorrenciaData;
  onClose: () => void;
  /** `saved=true` quando houve alterações salvas ao devolver. */
  onReturn?: (saved?: boolean) => void;
  onConclude?: (durationMs: number) => void;
  /** "tratativa" (padrão) = fluxo ativo; "auditoria" = visualização
   *  somente-leitura, com aba adicional "Histórico" e sem footer;
   *  "visualizacao" = somente-leitura sem edição (ex.: ocorrência aberta por outro analista). */
  mode?: 'tratativa' | 'auditoria' | 'visualizacao';
  /** Histórico legado (auditoria). Preferir `data.treatmentHistory`. */
  history?: TratativaHistoryEntry[];
  /** Aba inicial ao abrir o modal. */
  initialTab?: ActiveTab;
  /** Callback quando o histórico é alterado no modo auditoria. */
  onHistoryChange?: (entries: TratativaHistoryEntry[]) => void;
  /** Callback quando anexos são alterados no modo auditoria. */
  onAttachmentsChange?: (attachments: TratativaAttachment[]) => void;
  /** Quando false, auditoria abre somente para visualização (campos bloqueados). */
  auditEditable?: boolean;
}

type ActiveTab =
  | 'tratativa'
  | 'informacoes'
  | 'eventos'
  | 'streaming'
  | 'anexos'
  | 'evolucao'
  | 'historico';

const MOCK_CURRENT_ANALYST = 'Júlia Luz Campos';
const HISTORY_COMMENT_MAX_LENGTH = 250;
const HISTORY_COMMENT_DELETE_WINDOW_MS = 120 * 60 * 1000;
const COMMENT_INSERTED_TOAST = 'Comentário inserido com sucesso.';
const COMMENT_DELETED_TOAST = 'Comentário excluído com sucesso.';
const COMMENT_DELETE_EXPIRED_TOOLTIP =
  'Por questões de segurança e integridade do histórico, comentários só podem ser excluídos nos primeiros 120 minutos.';

function formatCreatedAtIso(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatHistoryWhen(date = new Date()): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    return `Hoje, ${time}`;
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isHistoryCommentEntry(entry: TratativaHistoryEntry): boolean {
  return entry.isComment === true || entry.description.startsWith('Comentário:');
}

function isOwnHistoryComment(entry: TratativaHistoryEntry): boolean {
  return isHistoryCommentEntry(entry) && entry.author === MOCK_CURRENT_ANALYST;
}

function getCommentCreatedAtMs(entry: TratativaHistoryEntry): number | null {
  if (!entry.createdAtIso) return null;
  const created = new Date(entry.createdAtIso.replace(' ', 'T')).getTime();
  return Number.isNaN(created) ? null : created;
}

function canDeleteHistoryComment(entry: TratativaHistoryEntry): boolean {
  const created = getCommentCreatedAtMs(entry);
  if (!isOwnHistoryComment(entry) || created == null) return false;
  return Date.now() - created < HISTORY_COMMENT_DELETE_WINDOW_MS;
}

function isExpiredOwnHistoryComment(entry: TratativaHistoryEntry): boolean {
  const created = getCommentCreatedAtMs(entry);
  if (!isOwnHistoryComment(entry) || created == null) return false;
  return Date.now() - created >= HISTORY_COMMENT_DELETE_WINDOW_MS;
}

function buildAttachmentHistoryDescription(
  previous: TratativaAttachment[],
  next: TratativaAttachment[],
): string | null {
  const previousIds = new Set(previous.map((attachment) => attachment.id));
  const nextIds = new Set(next.map((attachment) => attachment.id));
  const added = next.filter((attachment) => !previousIds.has(attachment.id)).length;
  const removed = previous.filter((attachment) => !nextIds.has(attachment.id)).length;
  const parts: string[] = [];

  if (added > 0) {
    parts.push(`${added} anexo(s) adicionado(s)`);
  }
  if (removed > 0) {
    parts.push(`${removed} anexo(s) removido(s)`);
  }

  return parts.length > 0 ? parts.join('. ') : null;
}

function resolutionHistoryDescription(
  action: TratativaAction,
  resolution: TratativaActionResolution,
): string {
  const label = resolution === 'resolvido' ? 'Resolvido' : 'Não resolvido';
  return `Ação "${action.title}" marcada como ${label}`;
}

function buildSessionChangesDescription(
  actions: TratativaAction[],
  actionResolutions: Partial<Record<string, ActionResolution>>,
  observations: Record<string, string>,
  attachments: TratativaAttachment[],
  initialAttachments: TratativaAttachment[],
): string {
  const parts: string[] = [];
  actions.forEach((action) => {
    const resolution = actionResolutions[action.id];
    if (resolution) {
      parts.push(resolutionHistoryDescription(action, resolution));
    }
    const obs = observations[action.id]?.trim();
    if (obs) {
      parts.push(`Observação — "${action.title}": ${obs}`);
    }
  });
  const addedAttachments = attachments.length - initialAttachments.length;
  if (addedAttachments > 0) {
    parts.push(`${addedAttachments} anexo(s) adicionado(s)`);
  }
  return parts.join('. ');
}

const COPY_SUCCESS_TOAST = 'Copiado para a área de transferência.';
/** Texto exibido ao salvar validação ou devolver tratativa. */
export const SAVED_CHANGES_TOAST = 'Alterações salvas com sucesso.';

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

/** Formata milissegundos no padrão "M:SS" (ex.: "5:47"). */
function formatTreatmentClock(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

type ActionResolution = TratativaActionResolution;

/** Índice da fronteira da trilha a partir das resoluções já registradas. */
function computeFrontierIndex(
  actions: TratativaAction[],
  resolutions: Partial<Record<string, ActionResolution>>,
): number {
  let frontier = 0;
  for (let i = 0; i < actions.length; i++) {
    const resolution = resolutions[actions[i].id];
    if (resolution === 'resolvido') break;
    if (resolution === 'nao_resolvido') {
      frontier = Math.min(i + 1, actions.length - 1);
    }
  }
  return frontier;
}

/** Ação em foco no fluxo normal: primeira sem resolução até a fronteira. */
function findWorkflowActionId(
  actions: TratativaAction[],
  frontier: number,
  resolutions: Partial<Record<string, ActionResolution>>,
): string {
  const lastIdx = Math.min(frontier, actions.length - 1);
  for (let i = 0; i <= lastIdx; i++) {
    if (!resolutions[actions[i].id]) {
      return actions[i].id;
    }
  }
  return actions[lastIdx]?.id ?? actions[0]?.id ?? '';
}

/** Ícone de ampulheta (mesmo desenho da listagem de ocorrências), cinza compacto. */
const IconHourglassPending: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M8 20H16V17C16 15.9 15.6083 14.9583 14.825 14.175C14.0417 13.3917 13.1 13 12 13C10.9 13 9.95833 13.3917 9.175 14.175C8.39167 14.9583 8 15.9 8 17V20ZM4 22V20H6V17C6 15.9833 6.2375 15.0292 6.7125 14.1375C7.1875 13.2458 7.85 12.5333 8.7 12C7.85 11.4667 7.1875 10.7542 6.7125 9.8625C6.2375 8.97083 6 8.01667 6 7V4H4V2H20V4H18V7C18 8.01667 17.7625 8.97083 17.2875 9.8625C16.8125 10.7542 16.15 11.4667 15.3 12C16.15 12.5333 16.8125 13.2458 17.2875 14.1375C17.7625 15.0292 18 15.9833 18 17V20H20V22H4Z"
      fill="#A0A6AC"
    />
  </svg>
);

const IconPhoneCall: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path
      d="M17 14.4V17a1 1 0 0 1-1.1 1A15 15 0 0 1 2 4.1 1 1 0 0 1 3 3h2.6a1 1 0 0 1 1 .8c.1.9.4 1.8.7 2.6a1 1 0 0 1-.2 1L5.6 8.5a12 12 0 0 0 5.9 5.9l1.1-1.5a1 1 0 0 1 1-.2c.8.3 1.7.6 2.6.7a1 1 0 0 1 .8 1z"
      stroke="#169EFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconContactEmail: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 48 48" fill="none" aria-hidden>
    <path
      d="M8 40C6.9 40 5.95833 39.6083 5.175 38.825C4.39167 38.0417 4 37.1 4 36V12C4 10.9 4.39167 9.95833 5.175 9.175C5.95833 8.39167 6.9 8 8 8H40C41.1 8 42.0417 8.39167 42.825 9.175C43.6083 9.95833 44 10.9 44 12V36C44 37.1 43.6083 38.0417 42.825 38.825C42.0417 39.6083 41.1 40 40 40H8ZM24 26L8 16V36H40V16L24 26ZM24 22L40 12H8L24 22ZM8 16V12V36V16Z"
      fill="#169EFF"
    />
  </svg>
);

const IconContactWhatsApp: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 48 48" fill="none" aria-hidden>
    <path
      d="M24 0C37.2547 0 48 10.7453 48 24C48 37.2547 37.2547 48 24 48C19.82 48 15.8904 46.9314 12.4678 45.0527L0 48L3.19629 35.9736C1.16368 32.4497 0 28.3606 0 24C6.76533e-07 10.7453 10.7453 6.76489e-07 24 0ZM24 4.29785C13.1194 4.29785 4.299 13.1185 4.29883 23.999C4.29883 28.1943 5.6104 32.083 7.8457 35.2783L5.7793 42.3193L13.1455 40.4434C16.2581 42.5026 19.9887 43.7012 24 43.7012V43.7002C34.8807 43.7002 43.7012 34.8797 43.7012 23.999C43.701 13.1185 34.8806 4.29785 24 4.29785ZM17.4043 12.1562C17.6982 12.1324 17.9685 12.3028 18.0938 12.5693L20.8311 18.376C20.9604 18.6506 20.9041 18.9777 20.6895 19.1924L18.6484 21.2324C18.2072 21.6737 18.0781 22.361 18.3818 22.9062C19.1265 24.2415 20.1281 25.5276 21.2881 26.7109C22.4714 27.8709 23.7574 28.8732 25.0928 29.6172C25.6381 29.9212 26.3246 29.7919 26.7666 29.3506L28.8076 27.3096C29.0222 27.0953 29.3486 27.0382 29.623 27.168L35.4297 29.9053C35.6964 30.0306 35.8677 30.3014 35.8438 30.5947C35.7811 31.3587 35.4741 32.8901 34.1016 34.2627C30.227 38.1372 23.2692 33.7536 22.9854 33.584C21.2741 32.6647 19.6483 31.4347 18.1064 29.8936C16.5651 28.3522 15.3344 26.725 14.415 25.0137C14.2445 24.7301 9.86133 17.7735 13.7363 13.8984C15.109 12.5258 16.6403 12.2189 17.4043 12.1562Z"
      fill="#169EFF"
    />
  </svg>
);

const CONTACT_PREFERENCE_TOOLTIPS: Record<ContactPreference, string> = {
  ligacao: 'Ligação',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
};

const CONTACT_PREFERENCE_LABELS = Object.fromEntries(
  CONTACT_PREFERENCE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<ContactPreference, string>;

function contactPreferencesLabel(contact: TratativaContact): string {
  const preferences =
    contact.contactPreferences?.length
      ? contact.contactPreferences
      : contact.contactPreference
        ? [contact.contactPreference]
        : [];
  if (!preferences.length) return '—';
  return preferences.map((preference) => CONTACT_PREFERENCE_LABELS[preference] ?? preference).join(', ');
}

function contactChannelLabel(contact: TratativaContact): string {
  const preference = contact.contactPreference ?? 'ligacao';
  if (preference === 'email') {
    return contact.email ?? '—';
  }
  return contact.phone ?? '—';
}

function contactOutsideHoursLabel(contact: TratativaContact): string {
  if (contact.acceptContactOutsideHours === undefined) return '—';
  return contact.acceptContactOutsideHours ? 'Sim' : 'Não';
}

function ContactPreferenceActionIcon({ preference }: { preference: ContactPreference }) {
  switch (preference) {
    case 'email':
      return <IconContactEmail />;
    case 'whatsapp':
      return <IconContactWhatsApp />;
    case 'ligacao':
    default:
      return <IconPhoneCall />;
  }
}

const IconContactMoreMenu: React.FC<{ selected?: boolean }> = ({ selected = false }) => (
  <svg width="29" height="29" viewBox="0 0 32 32" fill="none" aria-hidden>
    {selected && (
      <rect opacity="0.5" x="1" y="1" width="30" height="30" rx="7" stroke="#169EFF" strokeWidth="2" />
    )}
    <path
      d="M16 24C15.45 24 14.9792 23.8042 14.5875 23.4125C14.1958 23.0208 14 22.55 14 22C14 21.45 14.1958 20.9792 14.5875 20.5875C14.9792 20.1958 15.45 20 16 20C16.55 20 17.0208 20.1958 17.4125 20.5875C17.8042 20.9792 18 21.45 18 22C18 22.55 17.8042 23.0208 17.4125 23.4125C17.0208 23.8042 16.55 24 16 24ZM16 18C15.45 18 14.9792 17.8042 14.5875 17.4125C14.1958 17.0208 14 16.55 14 16C14 15.45 14.1958 14.9792 14.5875 14.5875C14.9792 14.1958 15.45 14 16 14C16.55 14 17.0208 14.1958 17.4125 14.5875C17.8042 14.9792 18 15.45 18 16C18 16.55 17.8042 17.0208 17.4125 17.4125C17.0208 17.8042 16.55 18 16 18ZM16 12C15.45 12 14.9792 11.8042 14.5875 11.4125C14.1958 11.0208 14 10.55 14 10C14 9.45 14.1958 8.97917 14.5875 8.5875C14.9792 8.19583 15.45 8 16 8C16.55 8 17.0208 8.19583 17.4125 8.5875C17.8042 8.97917 18 9.45 18 10C18 10.55 17.8042 11.0208 17.4125 11.4125C17.0208 11.8042 16.55 12 16 12Z"
      fill="#169EFF"
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

const IconChevronLeft: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path
      d="M9 2.5L4.5 7L9 11.5"
      stroke="#169EFF"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconChevronRight: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path
      d="M5 2.5L9.5 7L5 11.5"
      stroke="#169EFF"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface EventCarouselFieldProps {
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

function EventCarouselField({
  value,
  options,
  onChange,
  disabled = false,
}: EventCarouselFieldProps) {
  const currentIndex = options.findIndex((opt) => opt.id === value);
  const selected = options[currentIndex >= 0 ? currentIndex : 0];

  const goPrev = () => {
    if (disabled || options.length <= 1) return;
    const idx = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
    onChange(options[idx].id);
  };

  const goNext = () => {
    if (disabled || options.length <= 1) return;
    const idx = currentIndex >= options.length - 1 ? 0 : currentIndex + 1;
    onChange(options[idx].id);
  };

  return (
    <div className={`tratativa-event-carousel${disabled ? ' tratativa-event-carousel--disabled' : ''}`}>
      <button
        type="button"
        className="tratativa-event-carousel__nav"
        onClick={goPrev}
        disabled={disabled || options.length <= 1}
        aria-label="Evento anterior"
      >
        <IconChevronLeft />
      </button>
      <span className="tratativa-event-carousel__value" aria-live="polite">
        {selected?.label ?? '—'}
      </span>
      <button
        type="button"
        className="tratativa-event-carousel__nav"
        onClick={goNext}
        disabled={disabled || options.length <= 1}
        aria-label="Próximo evento"
      >
        <IconChevronRight />
      </button>
    </div>
  );
}

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

const IconCopyBlue: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="5" y="5" width="8" height="9" rx="1.5" stroke="#169EFF" strokeWidth="1.25" />
    <path
      d="M4 11H3.5C2.67 11 2 10.33 2 9.5V3.5C2 2.67 2.67 2 3.5 2H9.5C10.33 2 11 2.67 11 3.5V4"
      stroke="#169EFF"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

interface ActionCardProps {
  action: TratativaAction;
  status: 'done' | 'active' | 'pending';
  observation: string;
  onChangeObservation: (value: string) => void;
  resolution?: ActionResolution;
  onSetResolution: (resolution: ActionResolution) => void;
  /** Modo auditoria: bloqueia textarea e opções; mostra cards expandidos. */
  readOnly?: boolean;
  /** Card atualmente selecionado — moldura azul (somente ações sem resolução). */
  selected?: boolean;
  /** Ação em foco no painel — mantém opacidade total mesmo após resolução. */
  focused?: boolean;
  /** Exibe corpo completo (mensagem, observação, resolução). */
  expanded?: boolean;
  /** Callback disparado ao clicar em qualquer ponto do card. */
  onSelect?: () => void;
  /** Disparado após copiar a mensagem padrão com sucesso. */
  onCopySuccess?: () => void;
  /** Resolução da ação bloqueada (ex.: retorno agendado já concluído). */
  resolutionLocked?: boolean;
  /** Exibe seção "Retorno para confirmação" abaixo da ação. */
  showReturnConfirmationSection?: boolean;
  returnConfirmationResolution?: ActionResolution;
  onSetReturnConfirmationResolution?: (resolution: ActionResolution) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  action,
  status,
  observation,
  onChangeObservation,
  resolution,
  onSetResolution,
  readOnly = false,
  selected = false,
  focused = false,
  expanded = true,
  onSelect,
  onCopySuccess,
  resolutionLocked = false,
  showReturnConfirmationSection = false,
  returnConfirmationResolution,
  onSetReturnConfirmationResolution,
}) => {
  const handleCopyDefaultMessage = async (
    event: React.MouseEvent<HTMLButtonElement>,
    text: string,
  ) => {
    event.stopPropagation();
    try {
      await copyTextToClipboard(text);
      onCopySuccess?.();
    } catch {
      /* clipboard indisponível */
    }
  };

  const collapsedStatusClass =
    status === 'pending'
      ? ' tratativa-action--pending'
      : status === 'done'
        ? ' tratativa-action--done'
        : ' tratativa-action--active';

  const showReturnNotice =
    !readOnly &&
    action.scheduleReturnConfirmation &&
    action.returnConfirmationMinutes != null &&
    (resolution === 'resolvido' || resolutionLocked);

  const handleSelectResolution = (value: ActionResolution) => {
    if (readOnly || resolutionLocked) return;
    onSetResolution(value);
  };

  const handleSelectReturnConfirmation = (value: ActionResolution) => {
    if (readOnly) return;
    onSetReturnConfirmationResolution?.(value);
  };

  const resolutionDisabled = readOnly || resolutionLocked;

  if (!readOnly && !expanded) {
    return (
      <div
        className={`tratativa-action tratativa-action--collapsed${collapsedStatusClass}${
          selected ? ' tratativa-action--selected' : ''
        }${focused ? ' tratativa-action--focused' : ''}`}
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onClick={onSelect}
      >
        <div className="tratativa-action__heading">
          <span className="tratativa-action__title">
            {action.sequence}. {action.title}
          </span>
          {status === 'pending' && (
            <span className="tratativa-action__hourglass" aria-hidden>
              <IconHourglassPending />
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`tratativa-action${
        status === 'active' || showReturnNotice || showReturnConfirmationSection
          ? ' tratativa-action--active'
          : ' tratativa-action--done'
      }${showReturnNotice || showReturnConfirmationSection ? ' tratativa-action--return-notice' : ''}${readOnly ? ' tratativa-action--readonly' : ''}${
        resolutionLocked ? ' tratativa-action--resolution-locked' : ''
      }${selected ? ' tratativa-action--selected' : ''}${focused ? ' tratativa-action--focused' : ''}`}
    >
      <div className="tratativa-action__heading">
        <span className="tratativa-action__title">
          {action.sequence}. {action.title}
        </span>
      </div>
      {action.defaultMessage && (
        <div className="tratativa-action__default-message">
          <span className="tratativa-action__default-message-label">Mensagem padrão</span>
          <div className="tratativa-action__default-message-box">
            <p className="tratativa-action__default-message-text">{action.defaultMessage}</p>
            <LevelTooltip text="Copiar" topLayer nowrap style={{ display: 'inline-flex', flexShrink: 0 }}>
              <button
                type="button"
                className="tratativa-action__copy-btn"
                aria-label="Copiar"
                onClick={(event) => handleCopyDefaultMessage(event, action.defaultMessage!)}
              >
                <IconCopyBlue />
              </button>
            </LevelTooltip>
          </div>
        </div>
      )}
      <textarea
        className="tratativa-action__textarea"
        placeholder="Observação (Opcional)"
        value={observation}
        onChange={(event) => onChangeObservation(event.target.value)}
        rows={3}
        readOnly={readOnly || resolutionLocked}
        disabled={readOnly || resolutionLocked}
        onClick={(event) => event.stopPropagation()}
      />
      <div
        className="tratativa-action__resolution"
        role="radiogroup"
        aria-label={`Status da ação ${action.sequence}`}
      >
        <button
          type="button"
          role="radio"
          aria-checked={resolution === 'resolvido'}
          className="tratativa-action__resolution-option policy-form-checkbox-option"
          disabled={resolutionDisabled}
          onClick={() => handleSelectResolution('resolvido')}
        >
          <input
            type="radio"
            name={`action-resolution-${action.id}`}
            checked={resolution === 'resolvido'}
            readOnly
            tabIndex={-1}
            aria-hidden
            disabled={resolutionDisabled}
          />
          <span>Resolvido</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={resolution === 'nao_resolvido'}
          className="tratativa-action__resolution-option policy-form-checkbox-option"
          disabled={resolutionDisabled}
          onClick={() => handleSelectResolution('nao_resolvido')}
        >
          <input
            type="radio"
            name={`action-resolution-${action.id}`}
            checked={resolution === 'nao_resolvido'}
            readOnly
            tabIndex={-1}
            aria-hidden
            disabled={resolutionDisabled}
          />
          <span>Não resolvido</span>
        </button>
      </div>
      {!readOnly && showReturnNotice && (
          <p className="tratativa-action__return-notice" role="note">
            Esta ação exige retorno para confirmação em{' '}
            <strong>{action.returnConfirmationMinutes} min</strong>.
            <br />
            Ao concluir como Resolvido, a ocorrência retornará à fila automaticamente.
          </p>
        )}
      {showReturnConfirmationSection && (
        <div className="tratativa-action__return-confirmation">
          <p className="tratativa-action__return-confirmation-title">Retorno para confirmação</p>
          <p className="tratativa-action__return-confirmation-subtitle">
            Esta tratativa solicita um retorno ao contato para confirmação.
          </p>
          <div
            className="tratativa-action__resolution"
            role="radiogroup"
            aria-label="Retorno para confirmação"
          >
            <button
              type="button"
              role="radio"
              aria-checked={returnConfirmationResolution === 'resolvido'}
              className="tratativa-action__resolution-option policy-form-checkbox-option"
              disabled={readOnly}
              onClick={() => handleSelectReturnConfirmation('resolvido')}
            >
              <input
                type="radio"
                name={`return-confirmation-${action.id}`}
                checked={returnConfirmationResolution === 'resolvido'}
                readOnly
                tabIndex={-1}
                aria-hidden
              />
              <span>Resolvido</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={returnConfirmationResolution === 'nao_resolvido'}
              className="tratativa-action__resolution-option policy-form-checkbox-option"
              disabled={readOnly}
              onClick={() => handleSelectReturnConfirmation('nao_resolvido')}
            >
              <input
                type="radio"
                name={`return-confirmation-${action.id}`}
                checked={returnConfirmationResolution === 'nao_resolvido'}
                readOnly
                tabIndex={-1}
                aria-hidden
              />
              <span>Não resolvido</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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

const ContactDetailModal: React.FC<{
  open: boolean;
  contact: TratativaContact;
  onClose: () => void;
}> = ({ open, contact, onClose }) => (
  <CrModal
    open={open}
    title="Contato"
    onClose={onClose}
    cancelLabel="Fechar"
  >
    <div className="tratativa-contact-detail-modal">
      <div className="tratativa-contact-detail">
        <ReadOnlyField label="Nome" value={contact.name} />
        <ReadOnlyField label="Telefone" value={contact.phone || '—'} />
        <ReadOnlyField label="E-mail" value={contact.email || '—'} />
        <ReadOnlyField label="Escala de trabalho" value={formatTratativaContactSchedule(contact)} />
        <ReadOnlyField label="Preferência de contato" value={contactPreferencesLabel(contact)} />
        <ReadOnlyField
          label="Aceita contato fora do horário?"
          value={contactOutsideHoursLabel(contact)}
        />
        <ReadOnlyField
          label="Descrição"
          value={contact.description || '—'}
          className="tratativa-field--full"
        />
      </div>
    </div>
  </CrModal>
);

const ContactRow: React.FC<{ contact: TratativaContact }> = ({ contact }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const preference = contact.contactPreference ?? 'ligacao';
  const tooltip = CONTACT_PREFERENCE_TOOLTIPS[preference];
  const channelLabel = contactChannelLabel(contact);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [menuOpen]);

  return (
    <>
      <div className="tratativa-contact">
        <span className="tratativa-contact__name">{contact.name}</span>
        <span className="tratativa-contact__shift">{formatTratativaContactSchedule(contact)}</span>
        <span className="tratativa-contact__channel">{channelLabel}</span>
        <LevelTooltip text={tooltip} topLayer nowrap style={{ display: 'inline-flex', flexShrink: 0 }}>
          <button
            type="button"
            className="tratativa-contact__call"
            aria-label={tooltip}
          >
            <ContactPreferenceActionIcon preference={preference} />
          </button>
        </LevelTooltip>
        <div className="tratativa-contact__menu-wrap" ref={menuRef}>
          <button
            type="button"
            className={`tratativa-contact__more${menuOpen ? ' tratativa-contact__more--open' : ''}`}
            aria-label="Mais opções"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <IconContactMoreMenu selected={menuOpen} />
          </button>
          {menuOpen && (
            <div className="tratativa-contact__menu" role="menu">
              <button
                type="button"
                role="menuitem"
                className="tratativa-contact__menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  setDetailOpen(true);
                }}
              >
                Ver detalhes do contato
              </button>
            </div>
          )}
        </div>
      </div>
      <ContactDetailModal
        open={detailOpen}
        contact={contact}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
};

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

const IconSendComment: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M3 20L21 12L3 4V10L17 12L3 14V20Z"
      fill="currentColor"
    />
  </svg>
);

export const TratativaOcorrenciaModal: React.FC<TratativaOcorrenciaModalProps> = ({
  open,
  data,
  onClose,
  onReturn,
  onConclude,
  mode = 'tratativa',
  history = [],
  initialTab = 'tratativa',
  onHistoryChange,
  onAttachmentsChange,
  auditEditable = true,
}) => {
  const isAuditoria = mode === 'auditoria';
  const isReadOnly = mode === 'auditoria' || mode === 'visualizacao';
  const canEditAudit = isAuditoria && auditEditable;
  const canEditAnexos = canEditAudit;
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [actionResolutions, setActionResolutions] = useState<
    Record<string, ActionResolution>
  >({});
  const [returnConfirmationResolutions, setReturnConfirmationResolutions] = useState<
    Record<string, ActionResolution>
  >({});
  /** Índice da ação atual na trilha — só avança ao marcar "Não resolvido". */
  const [frontierIndex, setFrontierIndex] = useState(0);
  /** Tempo gravado ao concluir; enquanto aberto, elapsedMs atualiza a cada segundo. */
  const [savedTreatmentMs, setSavedTreatmentMs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
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
  /** Ação com corpo expandido — apenas uma aberta por vez no fluxo de tratativa. */
  const [expandedActionId, setExpandedActionId] = useState<string>(
    data.actions[0]?.id ?? '',
  );
  /** Vídeo expandido na aba Eventos (mesma mecânica do modal de validação). */
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<TratativaAttachment[]>(data.attachments ?? []);
  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [anexoToast, setAnexoToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });
  const [commentToast, setCommentToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });
  const [sessionHistory, setSessionHistory] = useState<TratativaHistoryEntry[]>([]);
  const [auditHistory, setAuditHistory] = useState<TratativaHistoryEntry[]>(history);
  const [commentDraft, setCommentDraft] = useState('');
  const initialAttachmentsRef = useRef<TratativaAttachment[]>(data.attachments ?? []);
  const auditAttachmentsRef = useRef<TratativaAttachment[]>(data.attachments ?? []);
  const initialActionResolutionsRef = useRef<Record<string, ActionResolution>>({});

  const showCopyToast = useCallback(() => setCopyToastVisible(true), []);
  const dismissCopyToast = useCallback(() => setCopyToastVisible(false), []);

  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      startedAtRef.current = null;
      return;
    }
    startedAtRef.current = Date.now();
  }, [open]);

  /** Cronômetro em tempo real — somente no modo tratativa ativo. */
  useEffect(() => {
    if (!open || mode !== 'tratativa' || savedTreatmentMs > 0) return;
    const tick = () => {
      if (startedAtRef.current !== null) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    };
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [open, mode, savedTreatmentMs]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('cr-fullscreen-modal-open');
      return () => {
        document.body.style.overflow = prev;
        document.body.classList.remove('cr-fullscreen-modal-open');
      };
    }
  }, [open]);

  /** Reseta o estado ao reabrir ou trocar de ocorrência. */
  useEffect(() => {
    if (!open) return;
    setActiveTab(initialTab);
    setObservations({});
    const auditResolutions: Record<string, ActionResolution> = isReadOnly
      ? (data.auditActionResolutions as Record<string, ActionResolution> | undefined) ?? {}
      : {};
    const initialResolutions: Record<string, ActionResolution> = isReadOnly
      ? auditResolutions
      : {};
    if (
      !isReadOnly &&
      data.awaitingReturnConfirmation &&
      data.actions[0] &&
      data.actions[0].scheduleReturnConfirmation
    ) {
      initialResolutions[data.actions[0].id] = 'resolvido';
    }
    setActionResolutions(initialResolutions);
    setReturnConfirmationResolutions({});
    initialActionResolutionsRef.current = initialResolutions;
    setSavedTreatmentMs(0);
    setElapsedMs(0);
    setFrontierIndex(
      isReadOnly ? computeFrontierIndex(data.actions, auditResolutions) : 0,
    );
    setSelectedDriverId(data.selectedDriverId);
    setSelectedVehicleId(data.selectedVehicleId);
    setSelectedEventId(data.validatedEvents[0]?.id ?? '');
    setSelectedActionId(data.actions[0]?.id ?? '');
    setExpandedActionId(data.actions[0]?.id ?? '');
    setExpandedVideo(null);
    setAttachments(data.attachments ?? []);
    setSessionHistory([]);
    setAuditHistory(history);
    setCommentDraft('');
    initialAttachmentsRef.current = data.attachments ?? [];
    auditAttachmentsRef.current = data.attachments ?? [];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset só ao abrir/trocar ocorrência
  }, [open, data.occurrenceId, initialTab, isReadOnly]);

  /** Concluir liberado conforme resoluções da trilha ou retorno para confirmação. */
  const canConcludeTreatment = useMemo(() => {
    if (data.actions.length === 0) return false;

    const firstAction = data.actions[0];
    const returnConf = firstAction ? returnConfirmationResolutions[firstAction.id] : undefined;

    if (data.awaitingReturnConfirmation && firstAction) {
      if (returnConf === 'resolvido') return true;
      if (returnConf !== 'nao_resolvido') return false;
      const restActions = data.actions.slice(1);
      if (restActions.some((action) => actionResolutions[action.id] === 'resolvido')) {
        return true;
      }
      const lastAction = data.actions[data.actions.length - 1];
      return actionResolutions[lastAction.id] === 'nao_resolvido';
    }

    if (data.actions.some((action) => actionResolutions[action.id] === 'resolvido')) {
      return true;
    }
    const lastAction = data.actions[data.actions.length - 1];
    return actionResolutions[lastAction.id] === 'nao_resolvido';
  }, [data.actions, data.awaitingReturnConfirmation, actionResolutions, returnConfirmationResolutions]);

  const treatmentTimeLabel =
    mode === 'auditoria'
      ? (data.treatmentDurationLabel ?? '5:47')
      : mode === 'visualizacao'
        ? (data.treatmentDurationLabel ?? '0:00')
        : formatTreatmentClock(savedTreatmentMs > 0 ? savedTreatmentMs : elapsedMs);

  const appendHistoryEntry = useCallback(
    (description: string, durationLabel = treatmentTimeLabel) => {
      setSessionHistory((prev) => [
        {
          id: `hist-${Date.now()}-${prev.length}`,
          when: formatHistoryWhen(),
          author: MOCK_CURRENT_ANALYST,
          description,
          treatmentDuration: durationLabel,
        },
        ...prev,
      ]);
    },
    [treatmentTimeLabel],
  );

  const appendAuditHistoryEntry = useCallback(
    (
      description: string,
      options?: { isComment?: boolean; createdAt?: Date },
    ) => {
      const createdAt = options?.createdAt ?? new Date();
      const entry: TratativaHistoryEntry = {
        id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        when: formatHistoryWhen(createdAt),
        author: MOCK_CURRENT_ANALYST,
        description: options?.isComment ? `Comentário: ${description}` : description,
        treatmentDuration: treatmentTimeLabel,
        createdAtIso: options?.isComment ? formatCreatedAtIso(createdAt) : undefined,
        isComment: options?.isComment,
      };

      setAuditHistory((prev) => {
        const next = [entry, ...prev];
        onHistoryChange?.(next);
        return next;
      });
    },
    [onHistoryChange, treatmentTimeLabel],
  );

  const handleAuditAttachmentsChange = useCallback(
    (nextAttachments: TratativaAttachment[]) => {
      const description = buildAttachmentHistoryDescription(
        auditAttachmentsRef.current,
        nextAttachments,
      );
      if (description) {
        appendAuditHistoryEntry(description);
      }
      auditAttachmentsRef.current = nextAttachments;
      setAttachments(nextAttachments);
      onAttachmentsChange?.(nextAttachments);
    },
    [appendAuditHistoryEntry, onAttachmentsChange],
  );

  const handleSubmitComment = () => {
    const trimmed = commentDraft.trim();
    if (!trimmed) return;
    appendAuditHistoryEntry(trimmed, { isComment: true });
    setCommentDraft('');
    setCommentToast({ message: COMMENT_INSERTED_TOAST, visible: true });
  };

  const handleDeleteComment = (entryId: string) => {
    setAuditHistory((prev) => {
      const next = prev.filter((entry) => entry.id !== entryId);
      onHistoryChange?.(next);
      return next;
    });
    setCommentToast({ message: COMMENT_DELETED_TOAST, visible: true });
  };

  const hasSessionChanges = useMemo(() => {
    if (Object.keys(returnConfirmationResolutions).length > 0) return true;
    const initialResolutions = initialActionResolutionsRef.current;
    const resolutionsChanged =
      Object.keys(actionResolutions).length !== Object.keys(initialResolutions).length ||
      Object.entries(actionResolutions).some(
        ([actionId, resolution]) => initialResolutions[actionId] !== resolution,
      );
    if (resolutionsChanged) return true;
    if (Object.values(observations).some((value) => value.trim().length > 0)) return true;
    const initial = initialAttachmentsRef.current;
    if (attachments.length !== initial.length) return true;
    return attachments.some((attachment, index) => attachment.id !== initial[index]?.id);
  }, [actionResolutions, returnConfirmationResolutions, observations, attachments]);

  const historyEntries = useMemo(() => {
    if (isAuditoria) return auditHistory;
    return sessionHistory;
  }, [auditHistory, isAuditoria, sessionHistory]);

  const occurrencePointsLabel = useMemo(() => {
    if (data.occurrencePoints == null || data.occurrencePoints <= 0) return null;
    return `${data.occurrencePoints} ${data.occurrencePoints === 1 ? 'ponto' : 'pontos'}`;
  }, [data.occurrencePoints]);

  const streamingData = useMemo(() => resolveTratativaStreamingData(data), [data]);
  const showStreamingTab = !isAuditoria && Boolean(streamingData);

  useEffect(() => {
    if (!showStreamingTab && activeTab === 'streaming') {
      setActiveTab('eventos');
    }
  }, [activeTab, showStreamingTab]);

  const handleSetReturnConfirmationResolution = (
    actionId: string,
    resolution: ActionResolution,
  ) => {
    if (isReadOnly) return;

    setReturnConfirmationResolutions((prev) => ({ ...prev, [actionId]: resolution }));

    if (resolution !== 'nao_resolvido') return;

    const currentIdx = data.actions.findIndex((action) => action.id === actionId);
    if (currentIdx === -1 || currentIdx >= data.actions.length - 1) return;

    const nextFrontier = currentIdx + 1;
    setFrontierIndex(nextFrontier);
    const nextActionId = data.actions[nextFrontier].id;
    setSelectedActionId(nextActionId);
    setExpandedActionId(nextActionId);
  };

  const handleSetResolution = (actionId: string, resolution: ActionResolution) => {
    const currentIdx = data.actions.findIndex((a) => a.id === actionId);
    if (currentIdx === -1) return;

    if (isReadOnly) {
      setActionResolutions((prev) => ({ ...prev, [actionId]: resolution }));
      setSelectedActionId(actionId);
      return;
    }

    if (
      data.awaitingReturnConfirmation &&
      currentIdx === 0 &&
      actionResolutions[actionId] === 'resolvido'
    ) {
      return;
    }

    const nextResolutions = { ...actionResolutions, [actionId]: resolution };
    if (resolution === 'resolvido') {
      for (let i = currentIdx + 1; i < data.actions.length; i++) {
        delete nextResolutions[data.actions[i].id];
      }
    }

    let nextFrontier = frontierIndex;
    if (resolution === 'resolvido') {
      nextFrontier = Math.min(frontierIndex, currentIdx);
    } else if (
      resolution === 'nao_resolvido' &&
      currentIdx === frontierIndex &&
      currentIdx < data.actions.length - 1
    ) {
      nextFrontier = currentIdx + 1;
    }

    setActionResolutions(nextResolutions);
    setFrontierIndex(nextFrontier);
    const nextSelectedId = findWorkflowActionId(data.actions, nextFrontier, nextResolutions);
    setSelectedActionId(nextSelectedId);
    const resolvedAction = data.actions[currentIdx];
    if (resolution === 'nao_resolvido') {
      setExpandedActionId(nextSelectedId);
    } else if (
      resolvedAction?.scheduleReturnConfirmation &&
      resolvedAction.returnConfirmationMinutes != null
    ) {
      setExpandedActionId(actionId);
    } else {
      setExpandedActionId('');
    }
  };

  const handleObservationChange = (actionId: string, value: string) => {
    setObservations((prev) => ({ ...prev, [actionId]: value }));
  };

  const handleConclude = () => {
    if (!canConcludeTreatment) return;
    const durationMs =
      startedAtRef.current !== null ? Date.now() - startedAtRef.current : savedTreatmentMs;
    const durationLabel = formatTreatmentClock(durationMs);
    const changes = buildSessionChangesDescription(
      data.actions,
      actionResolutions,
      observations,
      attachments,
      initialAttachmentsRef.current,
    );
    appendHistoryEntry(
      changes || 'Ocorrência concluída sem alterações registradas',
      durationLabel,
    );
    setSavedTreatmentMs(durationMs);
    onConclude?.(durationMs);
  };

  const handleReturn = () => {
    if (hasSessionChanges) {
      const changes = buildSessionChangesDescription(
        data.actions,
        actionResolutions,
        observations,
        attachments,
        initialAttachmentsRef.current,
      );
      appendHistoryEntry(
        changes || 'Alterações devolvidas para a fila',
        treatmentTimeLabel,
      );
      if (onReturn) onReturn(true);
      else onClose();
      return;
    }
    if (onReturn) onReturn(false);
    else onClose();
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

  return (
    <SystemFullscreenPortal>
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
              {occurrencePointsLabel ? (
                <span className="tratativa-card__points"> ({occurrencePointsLabel})</span>
              ) : null}
            </span>
          </div>
        </div>
      </aside>

      <section className="central-validacao-content tratativa-content">
        <header className="central-validacao-header central-validacao-header--card">
          <h2 id="tratativa-ocorrencia-title" className="central-validacao-header__title">
            {isAuditoria ? 'Auditoria da tratativa' : 'Tratativa da ocorrência'}
          </h2>
          <div className="tratativa-header__actions">
            <span className="tratativa-header__timer" aria-live="polite">
              Tempo de tratativa {treatmentTimeLabel}
            </span>
            {isAuditoria && (
              <>
                <span className="tratativa-header__divider" aria-hidden />
                <button
                  type="button"
                  className="central-validacao-header__close"
                  onClick={onClose}
                  aria-label="Fechar auditoria"
                >
                  <IconCloseLarge />
                </button>
              </>
            )}
          </div>
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
          {showStreamingTab && (
            <button
              type="button"
              className={`central-validacao-tab${
                activeTab === 'streaming' ? ' central-validacao-tab--active' : ''
              }`}
              onClick={() => setActiveTab('streaming')}
            >
              Ver ao vivo
            </button>
          )}
          <button
            type="button"
            className={`central-validacao-tab${
              activeTab === 'anexos' ? ' central-validacao-tab--active' : ''
            }`}
            onClick={() => setActiveTab('anexos')}
          >
            Anexos
          </button>
          {data.behaviorEvolution && (
            <button
              type="button"
              className={`central-validacao-tab${
                activeTab === 'evolucao' ? ' central-validacao-tab--active' : ''
              }`}
              onClick={() => setActiveTab('evolucao')}
            >
              Evolução do comportamento
            </button>
          )}
          <button
            type="button"
            className={`central-validacao-tab${
              activeTab === 'historico' ? ' central-validacao-tab--active' : ''
            }`}
            onClick={() => setActiveTab('historico')}
          >
            Histórico
          </button>
        </nav>

        {activeTab === 'tratativa' && (
          <div className="tratativa-body">
            <div className="tratativa-fields">
              <div className="tratativa-fields-row tratativa-fields-row--summary">
                <ReadOnlyField label="Política de ocorrências" value={data.policyName} />
                <ReadOnlyField label="Tipo de política" value={data.policyTypeLabel} />
                <ReadOnlyField label="Tratativa" value={data.trailLabel} />
                <ReadOnlyField label="Gravidade" value={data.gravityLabel} />
              </div>
            </div>

            <div className="tratativa-cols">
              <section className="tratativa-pane">
                <h3 className="tratativa-pane__title">Ações</h3>
                <div className="tratativa-actions-list">
                  {data.actions.map((action, index) => {
                    const resolution = actionResolutions[action.id];
                    /** Em auditoria, todas concluídas. Em tratativa: pending
                     *  após a fronteira; active na ação atual sem resolução;
                     *  done quando já tem resolução (resolvido ou não resolvido). */
                    const status: ActionCardProps['status'] =
                      isAuditoria || mode === 'visualizacao'
                        ? 'done'
                        : index > frontierIndex
                        ? 'pending'
                        : resolution
                          ? 'done'
                          : index === frontierIndex
                            ? 'active'
                            : 'pending';
                    /** Cards selecionáveis: na auditoria todas; em
                     *  tratativa apenas até a fronteira da trilha. */
                    const canSelect = isReadOnly || index <= frontierIndex;
                    const returnConfirmationResolution =
                      returnConfirmationResolutions[action.id];
                    const resolutionLocked =
                      !isReadOnly &&
                      Boolean(data.awaitingReturnConfirmation) &&
                      index === 0 &&
                      resolution === 'resolvido';
                    const showReturnConfirmationSection =
                      !isReadOnly &&
                      Boolean(data.awaitingReturnConfirmation) &&
                      index === 0 &&
                      Boolean(action.scheduleReturnConfirmation);
                    const keepExpandedForReturn =
                      showReturnConfirmationSection ||
                      (resolution === 'resolvido' &&
                        Boolean(action.scheduleReturnConfirmation));
                    return (
                      <ActionCard
                        key={action.id}
                        action={action}
                        status={status}
                        observation={observations[action.id] ?? ''}
                        onChangeObservation={(value) =>
                          handleObservationChange(action.id, value)
                        }
                        resolution={resolution}
                        onSetResolution={(value) => handleSetResolution(action.id, value)}
                        readOnly={isReadOnly}
                        resolutionLocked={resolutionLocked}
                        showReturnConfirmationSection={showReturnConfirmationSection}
                        returnConfirmationResolution={returnConfirmationResolution}
                        onSetReturnConfirmationResolution={(value) =>
                          handleSetReturnConfirmationResolution(action.id, value)
                        }
                        selected={selectedActionId === action.id && !resolution}
                        focused={selectedActionId === action.id}
                        expanded={
                          isAuditoria ||
                          expandedActionId === action.id ||
                          keepExpandedForReturn
                        }
                        onSelect={
                          canSelect
                            ? () => {
                                setSelectedActionId(action.id);
                                setExpandedActionId(action.id);
                              }
                            : undefined
                        }
                        onCopySuccess={showCopyToast}
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
                <ReadOnlyField
                  label="Nome"
                  value={selectedDriver?.name ?? 'Não identificado'}
                />
                {selectedDriver && (
                  <div className="tratativa-field tratativa-field--span-row">
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
                <ReadOnlyField
                  label="Placa / prefixo"
                  value={
                    selectedVehicle
                      ? `${selectedVehicle.placa} / ${selectedVehicle.prefixo}`
                      : 'Não identificado'
                  }
                />
                {selectedVehicle && (
                  <>
                    <ReadOnlyField label="Tipo" value={selectedVehicle.tipo} />
                    <ReadOnlyField label="Marca" value={selectedVehicle.marca} />
                    <ReadOnlyField label="Modelo" value={selectedVehicle.modelo} />
                    <ReadOnlyField label="Ano / modelo" value={selectedVehicle.anoModelo} />
                    <ReadOnlyField label="Combustível" value={selectedVehicle.combustivel} />
                    <div className="tratativa-field tratativa-field--span-row">
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
                <EventCarouselField
                  value={selectedEventId}
                  options={eventSelectOptions}
                  onChange={(id) => setSelectedEventId(id)}
                  disabled={isReadOnly}
                />
              </div>
              <ReadOnlyField
                label="Validado como"
                value={selectedEvent?.validatedAs ?? '—'}
              />
              <ReadOnlyField
                label="Placa / prefixo"
                value={
                  selectedVehicle
                    ? `${selectedVehicle.placa} / ${selectedVehicle.prefixo}`
                    : 'Não identificado'
                }
              />
              <ReadOnlyField
                label="Motorista"
                value={selectedDriver?.name ?? 'Não identificado'}
              />
              <ReadOnlyField
                label="Localização"
                value={selectedEvent?.location ?? '—'}
              />
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

            {(() => {
              // Timeline centrada no horário do evento selecionado, com
              // bolinha vermelha indicando o instante exato do alerta.
              const { labels, markerPercent } = buildEventTimelineLabels(
                selectedEvent?.time ?? '',
              );
              return (
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
                    <span
                      className="tratativa-eventos-timeline__event-marker"
                      style={{ left: `${markerPercent}%` }}
                    />
                  </div>
                  <div className="tratativa-eventos-timeline__marks" aria-hidden>
                    {labels.map((label, index) => (
                      <span key={index} className="tratativa-eventos-timeline__mark">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'streaming' && streamingData && (
          <div className="tratativa-body tratativa-streaming-tab">
            <TratativaStreamingPanel data={streamingData} />
          </div>
        )}

        {activeTab === 'anexos' && (
          <div className="tratativa-body tratativa-anexos-tab">
            <TratativaAnexosPanel
              attachments={attachments}
              onChange={canEditAnexos ? handleAuditAttachmentsChange : setAttachments}
              readOnly={!canEditAnexos}
              onValidationError={(message) => setAnexoToast({ message, visible: true })}
            />
          </div>
        )}

        {activeTab === 'evolucao' && data.behaviorEvolution && (
          <div className="tratativa-body tratativa-behavior-evolution-tab">
            <TratativaBehaviorEvolutionPanel
              data={data.behaviorEvolution}
              markLastTreatmentAsOpen={isAuditoria}
            />
          </div>
        )}

        {activeTab === 'historico' && (
          <div
            className={`tratativa-body tratativa-historico${
              historyEntries.length === 0 ? ' tratativa-historico--empty' : ''
            }${canEditAudit ? ' tratativa-historico--with-composer' : ''}`}
          >
            {historyEntries.length === 0 && !isAuditoria ? (
              <div className="history-empty-state">
                <div className="history-empty-state__image-wrap">
                  <img
                    src={emptyHistoryImage}
                    alt=""
                    className="history-empty-state__image"
                  />
                </div>
                <p className="history-empty-state__message">Nenhum histórico registrado.</p>
              </div>
            ) : historyEntries.length === 0 && canEditAudit ? (
              <div className="tratativa-historico__scroll tratativa-historico__scroll--empty">
                <p className="tratativa-historico__empty-message">Nenhum histórico registrado.</p>
              </div>
            ) : (
              <div className="tratativa-historico__scroll">
                <div className="tratativa-historico-head" aria-hidden>
                  <span>Data/hora</span>
                  <span>Analista</span>
                  <span>Alteração</span>
                  <span>Tempo de tratativa</span>
                  {canEditAudit ? <span aria-hidden /> : null}
                </div>
                <ul className="tratativa-historico-list">
                  {historyEntries.map((entry) => (
                    <li key={entry.id} className="tratativa-historico-row">
                      <span className="tratativa-historico-row__when">{entry.when}</span>
                      <span className="tratativa-historico-row__author">{entry.author}</span>
                      <span className="tratativa-historico-row__description">
                        {entry.description}
                      </span>
                      <span className="tratativa-historico-row__duration">
                        {entry.treatmentDuration ?? '—'}
                      </span>
                      {canEditAudit ? (
                        <span className="tratativa-historico-row__actions">
                          {canDeleteHistoryComment(entry) ? (
                            <LevelTooltip text="Excluir" topLayer nowrap>
                              <button
                                type="button"
                                className="btn btn-icon-action tratativa-historico-row__delete"
                                aria-label="Excluir comentário"
                                onClick={() => handleDeleteComment(entry.id)}
                              >
                                <IconTrash />
                              </button>
                            </LevelTooltip>
                          ) : isExpiredOwnHistoryComment(entry) ? (
                            <LevelTooltip text={COMMENT_DELETE_EXPIRED_TOOLTIP} topLayer>
                              <span className="tratativa-historico-row__delete-wrap">
                                <button
                                  type="button"
                                  className="btn btn-icon-action tratativa-historico-row__delete tratativa-historico-row__delete--disabled"
                                  aria-label="Exclusão indisponível"
                                  disabled
                                >
                                  <IconTrash />
                                </button>
                              </span>
                            </LevelTooltip>
                          ) : null}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {canEditAudit && (
              <div className="tratativa-historico-composer">
                <div className="tratativa-historico-composer__field">
                  <input
                    type="text"
                    className="tratativa-historico-composer__input"
                    value={commentDraft}
                    onChange={(event) =>
                      setCommentDraft(event.target.value.slice(0, HISTORY_COMMENT_MAX_LENGTH))
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                    placeholder="Escreva seu comentário"
                    aria-label="Escreva seu comentário"
                    maxLength={HISTORY_COMMENT_MAX_LENGTH}
                  />
                  <span className="tratativa-historico-composer__counter" aria-live="polite">
                    {commentDraft.length} / {HISTORY_COMMENT_MAX_LENGTH} caracteres
                  </span>
                </div>
                <button
                  type="button"
                  className="tratativa-historico-composer__send"
                  aria-label="Enviar comentário"
                  disabled={commentDraft.trim().length === 0}
                  onClick={handleSubmitComment}
                >
                  <IconSendComment />
                </button>
              </div>
            )}
          </div>
        )}

        {!isReadOnly && (
          <footer className="tratativa-footer">
            <button
              type="button"
              className="tratativa-btn tratativa-btn--outline"
              onClick={handleReturn}
            >
              Devolver
            </button>
            <button
              type="button"
              className="tratativa-btn tratativa-btn--primary"
              onClick={handleConclude}
              disabled={!canConcludeTreatment}
              aria-disabled={!canConcludeTreatment}
            >
              Concluir tratativa
            </button>
          </footer>
        )}
      </section>
    </div>
    <SuccessToast
      message={COPY_SUCCESS_TOAST}
      visible={copyToastVisible}
      onClose={dismissCopyToast}
      duration={4000}
    />
    <SuccessToast
      message={anexoToast.message}
      visible={anexoToast.visible}
      onClose={() => setAnexoToast((prev) => ({ ...prev, visible: false }))}
      duration={4000}
      variant="warning"
    />
    <SuccessToast
      message={commentToast.message}
      visible={commentToast.visible}
      onClose={() => setCommentToast((prev) => ({ ...prev, visible: false }))}
      duration={4000}
    />
    </SystemFullscreenPortal>
  );
};

export default TratativaOcorrenciaModal;
