/** Fuso da matriz (Creare/BR) — referência usada na conversão da tooltip. */
export const MATRIX_UTC_OFFSET_HOURS = -3;

const UTC_OFFSETS_HOURS = [-5, -4, -3, -2, 0, 1, 2, 3] as const;

function pickUtcOffsetHours(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return UTC_OFFSETS_HOURS[hash % UTC_OFFSETS_HOURS.length];
}

function formatOffsetLabel(hours: number): string {
  const sign = hours >= 0 ? '+' : '-';
  return `${sign}${String(Math.abs(hours)).padStart(2, '0')}`;
}

/**
 * Converte datetime "DD/MM, HH:MM" (referência matriz UTC-3) para o fuso do
 * veículo, ex.: "23/05 13:05 (+00)" — mesma regra da Central de tratativas.
 */
export function formatLocalTimeTooltip(datetime: string, seed: string): string {
  const offsetHours = pickUtcOffsetHours(seed);
  const diffMinutes = (offsetHours - MATRIX_UTC_OFFSET_HOURS) * 60;
  const offsetLabel = formatOffsetLabel(offsetHours);

  const match = datetime.match(/^(\d{1,2})\/(\d{1,2})[,\s]+(\d{1,2}):(\d{2})/);
  if (!match) {
    const cleaned = datetime.replace(',', '').replace(/\s+/g, ' ').trim();
    return `${cleaned} (${offsetLabel})`;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const hour = Number(match[3]);
  const minute = Number(match[4]);

  const base = new Date(Date.UTC(2025, month - 1, day, hour, minute));
  base.setUTCMinutes(base.getUTCMinutes() + diffMinutes);

  const dd = String(base.getUTCDate()).padStart(2, '0');
  const mm = String(base.getUTCMonth() + 1).padStart(2, '0');
  const hh = String(base.getUTCHours()).padStart(2, '0');
  const mi = String(base.getUTCMinutes()).padStart(2, '0');

  return `${dd}/${mm} ${hh}:${mi} (${offsetLabel})`;
}

/** Data/hora no fuso do navegador — exibida na coluna da listagem de Eventos. */
export function formatBrowserDatetimeFromIso(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}, ${hour}:${minute}`;
}

/** Referência matriz (UTC-3) usada na tooltip de fuso local. */
export function formatMatrixDatetimeFromIso(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60_000;
  const matrixMs = utcMs + MATRIX_UTC_OFFSET_HOURS * 3_600_000;
  const matrix = new Date(matrixMs);
  const day = String(matrix.getUTCDate()).padStart(2, '0');
  const month = String(matrix.getUTCMonth() + 1).padStart(2, '0');
  const hour = String(matrix.getUTCHours()).padStart(2, '0');
  const minute = String(matrix.getUTCMinutes()).padStart(2, '0');
  return `${day}/${month}, ${hour}:${minute}`;
}
