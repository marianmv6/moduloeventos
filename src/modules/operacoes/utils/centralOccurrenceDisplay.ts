import type { CentralPolicyTrackingType } from '../types/operacoesCentral.types';

export function formatCentralMonitoringLabel(source: {
  placa: string;
  prefixo: string;
  driverName: string;
  trackingType: CentralPolicyTrackingType;
}): string {
  if (source.trackingType === 'veiculo') {
    return `${source.placa} / ${source.prefixo}`;
  }
  return source.driverName;
}

export function getMonitoringTypeSuffix(
  trackingType: CentralPolicyTrackingType,
  variant: 'column' | 'filter' = 'column',
): string {
  if (variant === 'filter') {
    return trackingType === 'veiculo' ? '(veículo)' : '(motorista)';
  }
  return trackingType === 'veiculo' ? '(Veículo)' : '(Motorista)';
}

export function encodeMonitoringFilterValue(
  trackingType: CentralPolicyTrackingType,
  label: string,
): string {
  return `${trackingType}:${label}`;
}

export function decodeMonitoringFilterValue(value: string): {
  trackingType: CentralPolicyTrackingType;
  label: string;
} | null {
  const separatorIndex = value.indexOf(':');
  if (separatorIndex <= 0) return null;
  const trackingType = value.slice(0, separatorIndex);
  if (trackingType !== 'motorista' && trackingType !== 'veiculo') return null;
  return {
    trackingType,
    label: value.slice(separatorIndex + 1),
  };
}

export function formatMonitoringFilterDisplayValue(value: string): string {
  const decoded = decodeMonitoringFilterValue(value);
  if (!decoded) return value;
  return decoded.label;
}
