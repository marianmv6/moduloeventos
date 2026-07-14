import type { MonitorRiscoFilters, MonitorRiscoListagemItem } from '../types/monitorRisco.types';
import {
  MONITOR_NIVEL_RISCO_OPTIONS,
  MONITOR_TEMPO_ATIVO_OPTIONS,
} from '../constants/monitorRiscoFilterOptions';
import {
  formatMonitoringFilterDisplayValue,
} from './centralOccurrenceDisplay';
import {
  getMonitorMonitoramentoDeOptions,
  getMonitorPoliticaOptions,
} from './monitorRiscoPolicy';
import { encodeMonitoringFilterValue } from './centralOccurrenceDisplay';

export interface MonitorFilterBannerEntry {
  key: string;
  paramLabel: string;
  value: string;
}

/** Referência fixa para filtrar o mock da listagem por tempo ativo. */
const MONITOR_RISCO_REFERENCE_NOW_ISO = '2026-07-07T15:00:00-03:00';

function labelFromOptions(value: string, options: { value: string; label: string }[]): string {
  if (!value) return '';
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => options.find((opt) => opt.value === part)?.label ?? part)
    .join(', ');
}

function parseTempoAtivoMinutes(value: string): number | null {
  const match = value.match(/^(\d+)(min|h)$/);
  if (!match) return null;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return match[2] === 'h' ? amount * 60 : amount;
}

function getMonitorRiscoReferenceNow(): number {
  return new Date(MONITOR_RISCO_REFERENCE_NOW_ISO).getTime();
}

export function countAppliedMonitorRiscoFilters(filters: MonitorRiscoFilters): number {
  return getAppliedMonitorRiscoFilterEntries(filters).length;
}

export function getAppliedMonitorRiscoFilterEntries(
  filters: MonitorRiscoFilters,
): MonitorFilterBannerEntry[] {
  const entries: MonitorFilterBannerEntry[] = [];

  if (filters.politicaId) {
    entries.push({
      key: 'politica',
      paramLabel: 'Política de ocorrência',
      value: labelFromOptions(filters.politicaId, getMonitorPoliticaOptions()),
    });
  }
  if (filters.niveisRisco) {
    entries.push({
      key: 'nivel',
      paramLabel: 'Nível de risco',
      value: labelFromOptions(filters.niveisRisco, MONITOR_NIVEL_RISCO_OPTIONS),
    });
  }
  if (filters.monitoramentoDe) {
    entries.push({
      key: 'monitoramento',
      paramLabel: 'Monitoramento de',
      value: formatMonitoringFilterDisplayValue(filters.monitoramentoDe),
    });
  }
  if (filters.tempoAtivo) {
    entries.push({
      key: 'tempoAtivo',
      paramLabel: 'Período',
      value: labelFromOptions(filters.tempoAtivo, MONITOR_TEMPO_ATIVO_OPTIONS),
    });
  }

  return entries;
}

export function applyMonitorRiscoFilters(
  items: MonitorRiscoListagemItem[],
  filters: MonitorRiscoFilters,
): MonitorRiscoListagemItem[] {
  const levels = filters.niveisRisco
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  const tempoAtivoMinutes = filters.tempoAtivo ? parseTempoAtivoMinutes(filters.tempoAtivo) : null;
  const referenceNow = getMonitorRiscoReferenceNow();
  const tempoAtivoCutoff =
    tempoAtivoMinutes != null
      ? referenceNow - tempoAtivoMinutes * 60 * 1000
      : null;

  return items.filter((item) => {
    if (levels.length && !levels.includes(item.level)) return false;
    if (filters.monitoramentoDe) {
      const monitoringValue = encodeMonitoringFilterValue(item.trackingType, item.monitoringOf);
      if (monitoringValue !== filters.monitoramentoDe) return false;
    }
    if (tempoAtivoCutoff != null) {
      const eventTime = new Date(item.lastEventAtIso).getTime();
      if (eventTime < tempoAtivoCutoff || eventTime > referenceNow) return false;
    }
    return true;
  });
}
