import { COMPANIES, DEFAULT_COMPANY_ID } from '../constants/companies';

/** Tipo do usuário logado: Creare (admin do sistema) ou cliente (vê só sua empresa) */
export type UserKind = 'creare' | 'client';

export interface CurrentUser {
  kind: UserKind;
  /** Empresa do cliente (para usuário Creare é null) */
  companyId: string | null;
  /** Lista de empresas que o usuário pode escolher */
  availableCompanies: { value: string; label: string }[];
}

/**
 * Retorna o usuário atual. Por enquanto é mockado como Creare,
 * mas a estrutura permite trocar facilmente para o contexto cliente.
 *
 * Para testar como cliente, troque a constante CURRENT_USER_KIND para 'client'.
 */
const CURRENT_USER_KIND: UserKind = 'creare';
const CURRENT_CLIENT_COMPANY_ID = DEFAULT_COMPANY_ID;

export function useCurrentUser(): CurrentUser {
  if (CURRENT_USER_KIND === 'creare') {
    return {
      kind: 'creare',
      companyId: null,
      availableCompanies: COMPANIES.map((c) => ({ value: c.id, label: c.name })),
    };
  }
  const company = COMPANIES.find((c) => c.id === CURRENT_CLIENT_COMPANY_ID) ?? COMPANIES[0];
  return {
    kind: 'client',
    companyId: company.id,
    availableCompanies: [{ value: company.id, label: company.name }],
  };
}
