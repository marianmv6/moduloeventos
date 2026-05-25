import type { Company } from '../types/risk.types';

/**
 * Lista mock de empresas. Em uma versão de produção, virá da API e/ou do contexto
 * do usuário logado. Para o usuário Creare, todas aparecem; para um cliente,
 * apenas a empresa dele aparece (e o campo fica não-alterável).
 */
export const COMPANIES: Company[] = [
  { id: 'creare', name: 'Creare Sistemas' },
  { id: 'bracell', name: 'Bracell' },
  { id: 'expresso-nepomuceno', name: 'Expresso Nepomuceno' },
  { id: 'transpetro', name: 'Transpetro' },
  { id: 'jbs', name: 'JBS' },
  { id: 'cargill', name: 'Cargill' },
];

export const DEFAULT_COMPANY_ID = COMPANIES[0].id;

export function getCompanyName(companyId?: string): string {
  if (!companyId) return '—';
  return COMPANIES.find((c) => c.id === companyId)?.name ?? '—';
}

export const COMPANY_OPTIONS = COMPANIES.map((c) => ({
  value: c.id,
  label: c.name,
}));
