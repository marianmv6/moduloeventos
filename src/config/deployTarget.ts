export type DeployTarget = 'regrasdetratativas' | 'moduloeventos';

const rawTarget = import.meta.env.VITE_DEPLOY_TARGET as DeployTarget | undefined;

/** Ambiente ativo no build/dev (padrão local = regrasdetratativas). */
export const DEPLOY_TARGET: DeployTarget = rawTarget ?? 'regrasdetratativas';

export const isModuloEventosDeploy = DEPLOY_TARGET === 'moduloeventos';

/** Dev local padrão (localhost com regrasdetratativas). */
export const isLocalRegrasDev = import.meta.env.DEV && DEPLOY_TARGET === 'regrasdetratativas';
