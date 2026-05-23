import type { OperacoesEventCategory } from '../types/operacoes.types';

/** Rótulos de evento → categoria de ícone */
export const EVENT_TYPE_TO_ICON_CATEGORY: Record<string, OperacoesEventCategory> = {
  'Alerta de sonolência N2': 'sonolencia',
  'Operação de carregamento': 'carregamento',
  'Sem cinto de segurança': 'cinto',
  'Entrada / saída de cerca': 'cerca',
  'Excesso de velocidade': 'velocidade',
};

export function getIconCategoryForEventType(
  eventType: string,
  fallback: OperacoesEventCategory = 'outro',
): OperacoesEventCategory {
  return EVENT_TYPE_TO_ICON_CATEGORY[eventType] ?? fallback;
}
