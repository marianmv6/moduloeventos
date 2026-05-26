/**
 * Util compartilhada para a linha do tempo do player de vídeo
 * exibida tanto na Validação de Alertas quanto na aba "Eventos" da
 * Tratativa/Auditoria.
 *
 * Cada player cobre uma janela de 10 segundos centrada no instante do
 * evento (5 s antes / 5 s depois). As labels exibidas são os horários
 * absolutos correspondentes (HH:MM:SS), e o marcador vermelho do
 * evento fica sempre no centro (50%).
 */

export interface EventTimelineLabels {
  /** Labels distribuídas uniformemente do início ao fim da janela. */
  labels: string[];
  /**
   * Posição percentual do marcador vermelho na barra (0–100). Para a
   * janela centralizada no evento, sempre 50%.
   */
  markerPercent: number;
}

/** Total de segundos exibidos na janela (5 s antes + 5 s depois). */
export const DEFAULT_TIMELINE_DURATION_SEC = 10;
/** Número de marcas/labels exibidas na timeline. */
export const DEFAULT_TIMELINE_STEPS = 6;

interface BuildLabelsOptions {
  durationSec?: number;
  steps?: number;
}

/**
 * Constrói as labels da timeline centradas no `centerTime`. Aceita
 * formatos "HH:MM" ou "HH:MM:SS". Quando `centerTime` é inválido
 * retornamos placeholders ("--:--:--") para evitar travar a UI.
 */
export function buildEventTimelineLabels(
  centerTime: string,
  options: BuildLabelsOptions = {},
): EventTimelineLabels {
  const { durationSec = DEFAULT_TIMELINE_DURATION_SEC, steps = DEFAULT_TIMELINE_STEPS } = options;
  const half = durationSec / 2;
  const stepSec = steps > 1 ? durationSec / (steps - 1) : 0;
  const center = parseClockTime(centerTime);

  if (center === null) {
    return {
      labels: Array.from({ length: steps }, () => '--:--:--'),
      markerPercent: 50,
    };
  }

  const start = center - half;
  const labels = Array.from({ length: steps }, (_, i) => formatClockTime(start + i * stepSec));
  return { labels, markerPercent: 50 };
}

/** Converte "HH:MM" ou "HH:MM:SS" em segundos. Retorna null se inválido. */
function parseClockTime(value: string): number | null {
  const match = value?.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  const s = Number(match[3] ?? '0');
  if (Number.isNaN(h) || Number.isNaN(m) || Number.isNaN(s)) return null;
  return h * 3600 + m * 60 + s;
}

/** Formata segundos no padrão "HH:MM:SS", lidando com wrap em 24 h. */
function formatClockTime(totalSecondsFloat: number): string {
  const total = Math.round(totalSecondsFloat);
  const day = 24 * 3600;
  const normalized = ((total % day) + day) % day;
  const h = Math.floor(normalized / 3600);
  const m = Math.floor((normalized % 3600) / 60);
  const s = normalized % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
