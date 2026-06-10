# Módulo de Eventos – Regras de Tratativa

Projeto **Módulo de Eventos** (Regras de Tratativa) | Creare Sistemas.

## Onde usar

Você pode usar este projeto em:

- **Nesta pasta** (dentro de DHC), ou  
- **Na Área de Trabalho**: copie a pasta `Modulo de eventos` para  
  `Creare Sistemas\Área de Trabalho\Modulo de eventos`  
  e abra essa pasta no Cursor/VS Code.

## Como rodar

```powershell
cd "modulo-eventos-novo"
npm install
npm run dev
```

Acesse: **http://localhost:4001** — ambiente **regrasdetratativas** (Central de tratativas), igual a https://regrasdetratativas.vercel.app.

Para o ambiente moduloeventos (Monitor de risco): `npm run dev:moduloeventos`.

Se a página não abrir: confirme que o terminal está na pasta `modulo-eventos-novo` (não na pasta `DHC` pai) e que `npm install` terminou sem erros.

## Estrutura

- **Sidebar** à esquerda (Creare Sistemas)
- **Header** com título “Módulo de Eventos”
- **Conteúdo**: módulo Regras de Tratativa com 4 abas  
  (Política de Avaliação, Pontuações, Tratativas, Histórico)

## Tecnologias

- React 18
- TypeScript (módulo risk-rules)
- Vite 5
