# Dois deploys – mesma versão

Este projeto publica a **mesma versão** em dois endereços:

| URL | Repositório GitHub | Uso |
|-----|-------------------|-----|
| https://regrasdetratativas.vercel.app | `marianmv6/regrasdetratativas` | Produção principal |
| https://moduloeventos.vercel.app | `marianmv6/moduloeventos` | Mesmo app (substitui a versão antiga “Regras de risco”) |

## Atualizar os dois de uma vez

Na pasta `modulo-eventos-novo`, após commit:

```powershell
git push origin main
git push moduloeventos main
```

Ou use o script:

```powershell
.\push-ambos-repos.ps1
```

A Vercel faz deploy automático em cada repositório conectado.
