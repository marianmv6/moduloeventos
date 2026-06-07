# Dois deploys – mesma versão

Este projeto publica a **mesma versão** em dois endereços:

| URL | Repositório GitHub | Uso |
|-----|-------------------|-----|
| https://regrasdetratativas.vercel.app | `marianmv6/regrasdetratativas` | Produção legada (sem novas features) |
| https://moduloeventos.vercel.app | `marianmv6/moduloeventos` | **Ambiente ativo** — novas alterações |

## Ambiente local (= moduloeventos)

Desenvolvimento e testes locais devem usar **somente** a pasta `modulo-eventos-novo`:

```powershell
Set-Location "...\DHC\modulo-eventos-novo"
npm run dev
```

Abra **http://localhost:4001/** — equivale ao deploy de https://moduloeventos.vercel.app.

> Não use `npm run dev` na pasta raiz `DHC` (porta 4000): é outro projeto.

## Deploy

**Padrão (apenas moduloeventos):**

```powershell
.\push-moduloeventos.ps1 "mensagem do commit"
```

**Sincronizar os dois repositários** (quando necessário):

```powershell
.\push-ambos-repos.ps1 "mensagem do commit"
```

A Vercel faz deploy automático em cada repositório conectado.
