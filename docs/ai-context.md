# AI Context — modulo-eventos-novo

## Objetivo
- React + Vite + TS: Regras de Tratativas / Módulo de Eventos
- Deploys: `regrasdetratativas.vercel.app` (legado/dev) | `moduloeventos.vercel.app` (ativo + Monitor de Risco)
- Pasta: `modulo-eventos-novo` | dev: `npm run dev` → `:4001` | moduloeventos: `npm run dev:moduloeventos`
- Deploy: `git push origin main` | ambos: `push-ambos-repos.ps1` / `push moduloeventos main`
- Monitor de Risco: só `moduloeventos` (`deployTarget.ts` → `isModuloEventosDeploy`)

## Nomenclatura
- Políticas de tratativa → **Políticas de ocorrências**
- Turno → **Escala de trabalho**
- Coluna contatos **Grupo** → **Tipo de contato** (Contato individual | Grupo de WhatsApp)
- Central: **Último evento gerado** | **Política de ocorrência** | **Monitoramento de**
- Tipo acompanhamento: Por motorista | Por veículo
- Risco: baixo | médio | alto | crítico

## UI/UX
- Tabelas: `list-table` | Modais: `CrModal` | Selects: `ModalSelect` + `modal-select--no-pill`
- Obrigatório: `RequiredFieldMarker` (bolinha laranja) | Erro: borda vermelha + `FieldErrorIcon`
- Cor primária: `#169EFF` / `var(--color-primary)` | CSS: `App.css` | Fonte: `--font-noto-sans`
- Contato modal: **tela cheia** | Filtros: `AdvancedFilter` + badge toolbar

### Política
- 4 cards risco (grid 4→2→1) | Novo: todos habilitados, pontos 40/60/80/100
- Cores cards: baixo `#DBF1FE`/`#F1F9FF` | médio `#FBF1DE`/`#FDF9F3` | alto `#FEE5E5`/`#FFF5F5` | crítico `#ECDDDD`/`#F7F2F2`
- Pontos: caixa 204×40, borda `rgba(47,47,47,0.2)`, sufixo "pontos" 50% opacidade, sem borda no input
- Crítico: Tratamento de continuidade | Dropdown continuidade: `overflow: visible` (não cortar)
- Label Tipo acompanhamento: bolinha **mesma linha** (`nowrap`)

### Contatos
- Linha individual: Tipo | Nome | Telefone | Email (4 cols)
- Grupo: Tipo | Nome do grupo + Descrição + tarja `#F9EBD5`/`#E29C2C`
- Escala: tabela Dia/Início/Fim/+1 | check +1 azul | dia off esmaecido `#98a2b3`
- Toggle grupo → select Tipo contato | nomes separados ao alternar tipo

### Central
- 1 linha/ocorrência, **sem expandir** histórico
- Colunas: Pontuação | Data/hora | Último evento gerado | Política ocorrência | Monitoramento de | Ações
- Status ícone antes do evento | Barra criticidade + barra tratados/pendentes

### Tratativas
- Tarja voz: `#ffbbbb`/`#ff5454` | Tabela contatos: coluna Escala de trabalho

## Estrutura telas
- Abas: Pontuações | Políticas ocorrências | Tratativas | Contatos | Mensagens voz | Templates email | Histórico
- Política form: Nome+Tipo acomp. | Descrição | Eventos | Ocorrências (cards) | Usuários
- TrailForm ações: contato | email | whatsapp_grupo | mensagem_voz
- Voz listagem: Identificação | Mensagem | Status

## Regras de negócio
- Escala: 00:00–23:59 | +1 se fim ≤ início | formato `Seg 08:00–17:00 (+1)`
- Escala validação: dia marcado exige início **e** fim
- Contato individual: tel obrigatório (WhatsApp/ligação) | email obrigatório (email)
- Grupo WhatsApp: só nome+descrição, sem tel/email/escala
- Política nova: 4 níveis on, pontos 40/60/80/100 | Card off: esmaecido/zerado
- Central evento atual: sempre aguardando validação | só pontuação evento mais recente
- Monitoramento de: `veiculo` → placa/prefixo | `motorista` → nome motorista
- Política ocorrência coluna: `policyName`
- Play central: validação ou tratativa | outro analista → view-only
- Voz: K1 Plus→**WAV** | G5 Plus→**MP3** | default K1 Plus | msg max 200, só alfanum+espaço | idiomas pt/en/es

## Padrões técnicos
- Utils: `contactSchedule.ts` | `policyRiskLevelState.ts` | `centralOccurrenceDisplay.ts` | `contactDisplay.ts`
- Types central: `policyName`, `trackingType` (`motorista`|`veiculo`)
- Mocks: `risk.mock.ts`, `operacoesCentral.mock.ts`
- Componentes: `ContactWorkScheduleTable`, `PolicyRiskLevelCards`, `ContactsPanel`, `OperacoesCentralPage`
- Formatação escala: `formatContactWeeklySchedule()` / `formatTratativaContactSchedule()`
