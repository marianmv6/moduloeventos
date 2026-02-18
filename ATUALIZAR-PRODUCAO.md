# Atualizar e subir em produção (Git + Vercel)

Sempre que fizer alterações no projeto e quiser publicar de novo:

## 1. Abra o PowerShell na pasta do projeto

```powershell
cd "C:\Users\user\OneDrive - Creare Sistemas\Área de Trabalho\DHC\Modulo de eventos"
```

(Ajuste o caminho se a pasta estiver em outro lugar.)

## 2. Execute o script

```powershell
.\push-github.ps1
```

O script vai:
- Adicionar todas as alterações (`git add .`)
- Criar um commit com a mensagem *"Deploy producao - atualizacoes do modulo de eventos"*
- Enviar para o GitHub na branch **main** (`git push`)

Se pedir **usuário** e **senha**, use:
- **Usuário:** marianmv6  
- **Senha:** seu Personal Access Token do GitHub (não a senha da conta)

## 3. Deploy na Vercel

Se o repositório **marianmv6/moduloeventos** já estiver conectado à Vercel, o deploy é **automático**: a Vercel detecta o novo push e publica sozinha.

Para conferir:
- Acesse [vercel.com](https://vercel.com) → seu projeto → **Deployments**
- O último deploy deve aparecer como "Building" e depois "Ready"

O link de produção (ex.: `https://moduloeventos.vercel.app`) será atualizado com as últimas alterações.
