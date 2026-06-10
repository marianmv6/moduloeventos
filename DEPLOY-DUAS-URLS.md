# Dois deploys – mesma versão

Este projeto publica a **mesma versão** em dois endereços:

| URL | Repositório GitHub | Uso |
|-----|-------------------|-----|
| https://regrasdetratativas.vercel.app | `marianmv6/regrasdetratativas` | Produção legada (sem novas features) |
| https://moduloeventos.vercel.app | `marianmv6/moduloeventos` | **Ambiente ativo** — novas alterações |

## Ambiente local (= regrasdetratativas / Central de tratativas)

Desenvolvimento e testes locais devem usar **somente** a pasta `modulo-eventos-novo`:

```powershell
Set-Location "...\DHC\modulo-eventos-novo"
npm run dev
```

Abra **http://localhost:4001/** — equivale ao deploy de https://regrasdetratativas.vercel.app (sem Monitor de risco).

Para testar o ambiente **moduloeventos** (Monitor de risco e novidades):

```powershell
npm run dev:moduloeventos
```

> Não use `npm run dev` na pasta raiz `DHC` (porta 4000): é outro projeto.

## Deploy

**Padrão (regrasdetratativas):**

```powershell
git push origin main
```

**Deploy moduloeventos** (quando necessário):

```powershell
.\push-moduloeventos.ps1 "mensagem do commit"
```

**Sincronizar os dois repositários** (quando necessário):

```powershell
.\push-ambos-repos.ps1 "mensagem do commit"
```

A Vercel faz deploy automático em cada repositório conectado.
