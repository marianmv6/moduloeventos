import type { OperacoesEventCategory } from '../types/operacoes.types';

/** Ícones do Figma em /public/icons/operacoes (PNG = export visual; SVG = vetor) */
export const OPERACOES_FIGMA_ICON_SRC: Record<
  Exclude<OperacoesEventCategory, 'outro'>,
  string
> = {
  sonolencia: '/icons/operacoes/icon-sonolencia-n2.svg',
  carregamento: '/icons/operacoes/icon-carregamento.svg',
  cinto: '/icons/operacoes/icon-cinto.svg',
  cerca: '/icons/operacoes/icon-cerca.svg',
  velocidade: '/icons/operacoes/icon-velocidade.svg',
};
