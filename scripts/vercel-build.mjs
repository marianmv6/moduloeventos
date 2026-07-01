import { execSync } from 'node:child_process';

const repoSlug = process.env.VERCEL_GIT_REPO_SLUG ?? '';
const projectUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? '';
const isModuloEventos =
  repoSlug === 'moduloeventos' || projectUrl.includes('moduloeventos.vercel.app');

const command = isModuloEventos ? 'npm run build:moduloeventos' : 'npm run build';

console.log(`[vercel-build] repo=${repoSlug || 'local'} → ${command}`);
execSync(command, { stdio: 'inherit' });
