# Platform Design System — Creare Sistemas

Documento de referência extraído do projeto **Módulo de Eventos / Regras de Tratativas**. Use-o como base visual e comportamental ao construir novas telas ou novos produtos da plataforma Creare.

---

## 1. Princípios

| Princípio | Descrição |
|-----------|-----------|
| **Consistência** | Mesmas classes CSS, mesmos componentes React e mesmos tokens em todas as telas. |
| **Densidade controlada** | Interface compacta (fonte base 17px, controles ~28–32px), sem perder legibilidade. |
| **Hierarquia clara** | Título de página → toolbar → conteúdo (tabs, filtros, tabela/modal). |
| **Feedback imediato** | Erros inline, toasts de sucesso, confirmação de saída com alterações não salvas. |
| **Acessibilidade básica** | `aria-label`, `role="dialog"`, foco visível, tooltips só quando necessário. |

---

## 2. Tokens de design

Definidos em `src/index.css` (`:root`). **Sempre prefira variáveis CSS** em novos estilos.

### 2.1 Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-primary` | `#169EFF` | Ações primárias, links, ícones ativos, checkbox, borda de foco em selects |
| `--color-text-primary` | `#2F2F2F` | Texto principal, valores digitados em campos |
| `--color-text-secondary` | `#2F2F2F80` (50% opac.) | Texto auxiliar, sufixos, metadados |
| `--color-text-disabled` | `#2F2F2F40` | Campos desabilitados |
| `--color-background` | `#FFFFFF` | Fundo de páginas e modais |
| `--color-paper` | `#f3f3f3` | Fundo alternativo (tbody th, hover sutil) |
| `--color-sidebar` | `#E9EEEE` | Sidebar / launcher |
| `--color-header` | `#F6FBFB` | Cabeçalhos internos |
| `--color-separator` | `#C3C7C7` | Divisores, bordas leves |
| `--color-outline-focus` | `#20ACAC` | Foco em botões secundários |
| `--color-error` | `#D32F2F` | Erros de validação, botão perigo |
| `--color-warning` | `#E29C2C` | Alertas, tarjas informativas |
| `--color-success` | *(ver badges)* | Confirmações visuais |

**Cores sem token (usadas diretamente no CSS):**

| Valor | Uso |
|-------|-----|
| `#F2F4F7` | Toolbar de página, cabeçalho de tabela, header de modal fullscreen |
| `#344054` | Labels de formulário, cabeçalhos de coluna |
| `#101828` | Títulos de modal, valores destacados em banners |
| `#D0D5DD` | Borda de inputs e selects |
| `#98a2b3` | Placeholder esmaecido, texto auxiliar em listas (ex.: `(motorista)`) |
| `#E9EEEE` | Bordas de linhas de tabela |

### 2.2 Níveis de risco

Usados em badges, cards de política, pontuação e monitoramento.

| Nível | Badge (fundo / texto) | Card de política (fundo / borda / título) |
|-------|----------------------|---------------------------------------------|
| Baixo | `#E3F2FD` / `#1565C0` | `#F1F9FF` / `#DBF1FE` / `#169eff` |
| Médio | `#FFF8E1` / `#F9A825` | `#FDF9F3` / `#FBF1DE` / `#c47d00` |
| Alto | `#FFEBEE` / `#C62828` | `#FFF5F5` / `#FEE5E5` / `#ff5454` |
| Crítico | `#F3E5F5` / `#6A1B9A` | `#F7F2F2` / `#ECDDDD` / `#7f1d1d` |

Cards desabilitados: opacidade ~72%, texto `#98a2b3`, fundo `#f4f6f8`.

### 2.3 Tipografia

| Token / classe | Fonte | Tamanho | Peso | Uso |
|----------------|-------|---------|------|-----|
| `--font-montserrat` | Montserrat | — | — | Body global, botões da toolbar, títulos de modal |
| `--font-noto-sans` | Noto Sans | — | — | Tabelas, formulários, selects, conteúdo operacional |
| `--font-size-base` | — | `17px` | — | `html` (escala rem) |
| `.body-page-title` | Montserrat | `14.5px` | 600 | Título da página na toolbar |
| `.list-table th, td` | Noto Sans | `14px` | 400 | Células de listagem |
| `.modal-select__label` | Noto Sans | `0.875rem` | normal | Label de campo |
| `.cr-modal__title` | Montserrat | `14.5px` | 600 | Título de modal padrão |

**Regra:** títulos de página e modais → Montserrat; dados tabulares e formulários → Noto Sans.

### 2.4 Espaçamento e forma

| Elemento | Valor |
|----------|-------|
| Border radius padrão (botões, cards) | `0.5rem` (8px) |
| Border radius inputs / selects | `10px` |
| Border radius tabelas (header) | `12px` (cantos superiores) |
| Border radius modais | `12px` |
| Border radius toasts | `1rem` |
| Padding toolbar | `0 1rem`, altura `3rem` |
| Padding célula tabela | `0.75rem 1.25rem` |
| Gap grid de filtros | `1rem 1.25rem` |
| Sidebar expandida | `--sidebar-expanded-width: 15rem` |

### 2.5 Sombras e overlay

| Contexto | Valor |
|----------|-------|
| `--box-shadow` | `0.05rem 0.05rem 0.1rem rgba(0,0,0,0.1), 0.05rem 0.05rem 0.5rem rgba(0,0,0,0.05)` |
| Overlay modal padrão | `rgba(16, 24, 40, 0.45)` |
| Sombra modal | `0 20px 60px rgba(16,24,40,0.18), 0 2px 10px rgba(16,24,40,0.08)` |
| Tooltip | `0 4px 12px rgba(0,0,0,0.15)`, borda `rgba(0,0,0,0.12)`, radius `6px` |

### 2.6 Camadas (z-index)

| Token | Valor | Uso |
|-------|-------|-----|
| `--z-app-content` | 1 | Área principal |
| `--z-modal-fullscreen` | 10 | Modal tela cheia (dentro do content) |
| `--z-sidebar` | 100 | Sidebar |
| `--z-nav-flyout` | 110 | Flyout de navegação |
| Modal padrão | 9999 | Overlay centralizado |
| Toast | 10100 | Notificações |
| Tooltip truncado | 99999 | Tooltip de texto cortado |
| `--z-modal-system-fullscreen` | 10000 | Modais de sistema (validação/tratativa) |

### 2.7 Scrollbar

- Largura/altura: `8px`
- Thumb: `#2F2F2F33` (20% opacidade), hover `#2F2F2F4D`
- Sem botões de seta
- `scrollbar-width: thin`

---

## 3. Arquitetura de layout

```
.app
├── .launcher-sidebar          ← menu lateral (#E9EEEE)
└── .app-content               ← área scrollável
    └── .page-layout.content-body
        ├── .content-toolbar   ← título + ações (altura 3rem, #F2F4F7)
        ├── [filtros / banner] ← opcional
        └── [conteúdo]         ← tabs, tabela, cards, modal fullscreen
```

### 3.1 Toolbar de página

```html
<div class="content-toolbar top-bar">
  <div class="content-toolbar-left">
    <h1 class="body-page-title">Nome da tela</h1>
  </div>
  <div class="content-toolbar-right">
    <!-- botões, toggle de filtro, etc. -->
  </div>
</div>
```

### 3.2 Página de listagem

Padrão usado em Eventos, Central, Auditoria, cadastros:

1. Toolbar com título + botão de filtro (ícone barras, classe `is-active` quando aberto ou com filtros aplicados)
2. Painel de filtros (`.operacoes-eventos-filter-panel`) — colapsável
3. Banner de filtros aplicados (`.operacoes-eventos-filter-banner`) — visível quando painel fechado e há filtros
4. Tabela (`.list-table`) dentro de wrapper com scroll horizontal se necessário

---

## 4. Componentes

### 4.1 Botões

| Classe | Aparência | Uso |
|--------|-----------|-----|
| `.btn.btn-primary` / `.cr-btn.cr-btn--primary` | Fundo `#169EFF`, texto branco | Salvar, Pesquisar, ação principal |
| `.btn.btn-outline` / `.cr-btn.cr-btn--outline` | Borda e texto azul, fundo branco | Cancelar, Fechar |
| `.btn.btn-secondary` | Borda cinza, fundo branco | Ações secundárias |
| `.btn.btn-danger` | Borda vermelha | Exclusão |
| `.btn.btn-icon-action` | Ícone apenas | Ações em linha de tabela |
| `.btn-sm` | Menor padding | Ações compactas |

**Toolbar:** use `.content-toolbar .btn` — fonte Montserrat, `0.75rem`, peso 600, `min-height: 2rem`.

**Estado desabilitado (primário):** fundo `#b2ddff`, cursor `not-allowed`.

### 4.2 Modais — `CrModal`

Componente: `src/modules/risk-rules/components/shared/CrModal.tsx`

| Modo | Classe | Comportamento |
|------|--------|---------------|
| Padrão | `.cr-modal-overlay` + `.cr-modal` | Centralizado, overlay escuro, largura máx. 720px |
| Tela cheia | `.cr-modal-overlay--fullscreen` + `.cr-modal--fullscreen` | Portal em `.app-content`; **não cobre sidebar**; header igual à toolbar |

**Rodapé padrão:** Cancelar (outline) + Salvar (primary, submete `formId`).

**Regras:**
- Título modal padrão: Montserrat 14.5px semibold
- Modal fullscreen: título com classe `.cr-modal__title--page` (mesmo estilo do `.body-page-title`)
- Bloquear scroll do body em fullscreen (`body.cr-fullscreen-modal-open`)
- Confirmação de saída: `UnsavedConfirmModal` quando há alterações pendentes

### 4.3 Select / combobox — `ModalSelect`

Componente: `src/modules/risk-rules/components/shared/ModalSelect.tsx`

| Classe / prop | Descrição |
|---------------|-----------|
| `.modal-select` | Container relativo |
| `.modal-select__input-wrap` | Borda `#D0D5DD`, radius 10px, min-height 28px |
| `.modal-select__input` | Fonte Noto Sans 0.875rem |
| `.modal-select--no-pill` | Opções sem pill colorido (filtros e formulários) |
| `.modal-select--muted-placeholder` | Placeholder `#98a2b3` quando vazio |
| `.modal-select--typing` / `--has-value` | Texto digitado/selecionado: `#2F2F2F` |
| `mutedPlaceholder` (prop) | Ativa placeholder esmaecido |
| `suffixLabel` (opção) | Texto auxiliar cinza claro na listagem, ex.: `(motorista)` |
| `multiple` (prop) | Multiselect com checkboxes, valor separado por vírgula |

**Foco:** borda `#169EFF` no `:focus-within` do wrap.

### 4.4 Tabelas — `.list-table`

| Regra | Valor |
|-------|-------|
| Layout | `table-layout: fixed`, `border-collapse: separate` |
| Header | Fundo `rgba(233,238,238,0.47)`, texto `#344054`, cantos superiores 12px |
| Linhas | Borda inferior `#E9EEEE` |
| Coluna de ações | Última coluna, alinhada à direita, padding-left maior |
| Texto longo | `TruncatedTextTooltip` — ellipsis + tooltip só se truncado |

**Classes auxiliares por domínio:** `.policy-list`, `.score-list`, `.history-list`, `.operacoes-eventos-table` — definem larguras de coluna específicas.

### 4.5 Abas — `.risk-tabs` / `.risk-tab`

- Sem linha cinza inferior global
- Aba ativa: `.risk-tab--active` → borda inferior 0.2rem `#169EFF`
- Hover não altera peso da fonte
- Ícone opcional antes do label (ex.: Insights da Íris)

### 4.6 Formulários

| Elemento | Componente / classe | Regra |
|----------|---------------------|-------|
| Label | `.modal-select__label`, `.cr-modal__label`, `.form-field__label` | Noto Sans, `#344054` |
| Obrigatório | `RequiredFieldMarker` → `.form-label-required-dot` | Bolinha laranja 7×7px (`#E29C2C`) |
| Erro de campo | `.form-group.has-error` + `.input-error-wrap` | Borda vermelha no wrap do input |
| Ícone de erro | `FieldErrorIcon` | Ao lado do campo inválido |
| Hint | `.form-hint` | `#6B7280`, 0.75rem |
| Checkbox | nativo estilizado | 14×14px, borda `#169EFF`, checked azul + check branco |

**Altura uniforme de controles em formulários de contato:** `--contact-control-h` (modais de contato).

### 4.7 Filtros avançados — `AdvancedFilter`

Componente genérico: `src/modules/risk-rules/components/shared/AdvancedFilter.tsx`

**Fluxo:**
1. Botão toggle na toolbar (controlado pela página via `open`)
2. Painel com grid 2 colunas de `ModalSelect` + ações Fechar / Pesquisar
3. Banner laranja claro com resumo dos filtros aplicados + link "Limpar filtros"

**Banner:** fundo `#fdeee0`, borda `#f5d4bc`, parâmetro em negrito, valor em `#101828`.

**Painel:** fundo `#f9fafb`, borda `#e9eeee`, radius 12px.

### 4.8 Toasts — `SuccessToast`

| Variante | Classe | Fundo | Duração padrão |
|----------|--------|-------|----------------|
| Sucesso | `.toast-success` | `#C8F0BD` | 3s |
| Aviso | `.toast-warning` | `rgba(230,81,0,0.18)` | 4s |

Posição: `.toast-bottom`, z-index 10100.

Mensagens padrão: *"Alterações salvas com sucesso."*

### 4.9 Empty state — `EmptyState`

```html
<div class="empty-state">
  <div class="empty-state__image">…</div>
  <h3 class="empty-state__title">Título</h3>
  <p class="empty-state__description">Descrição opcional</p>
  <!-- btn btn-primary opcional -->
</div>
```

Variante com imagem customizada: ex. histórico vazio com PNG dedicado + mensagem *"Nenhum histórico registrado."*

### 4.10 Tooltips

| Componente | Quando usar |
|------------|-------------|
| `InfoTooltip` | Ícone ⓘ ao lado de label de coluna/campo — texto fixo |
| `TruncatedTextTooltip` | Células de tabela com ellipsis |
| `LevelTooltip` | Badges de nível de risco |
| `AppTooltipBubble` | Base visual: fundo branco, sombra, seta |

### 4.11 Badges

| Classe | Uso |
|--------|-----|
| `.badge.badge-active` | Status ativo — verde `rgb(55,181,116)` |
| `.badge.badge-inactive` | Status inativo — cinza |
| `.risk-badge--{none\|low\|medium\|high\|critical}` | Nível de risco em pontuações |
| `.badge-rounded` | `border-radius: 999px` |

---

## 5. Padrões comportamentais

### 5.1 Formulários e persistência

- Validar antes de habilitar botão Salvar (`primaryDisabled`)
- Ao fechar modal com alterações: exibir `UnsavedConfirmModal`
- Após salvar com sucesso: toast + fechar modal (quando aplicável)
- Campos obrigatórios sempre marcados com `RequiredFieldMarker`

### 5.2 Filtros

- **Draft vs. aplicado:** painel edita draft; "Pesquisar" copia draft → applied
- Fechar painel sem pesquisar: restaurar draft a partir dos filtros aplicados
- Banner de filtros só aparece com painel fechado
- Botão Pesquisar desabilitado quando draft vazio (Central) ou sempre habilitado (Auditoria)
- Labels de filtro no banner: minúsculas (*"monitoramento de"*, *"tratado por"*)

### 5.3 Listagens operacionais

- Uma linha por entidade principal (ex.: uma ocorrência = uma linha, sem expansão)
- Coluna de ações sempre à direita, ícones com `aria-label`
- Pontuação com cor por severidade (baixo → crítico)
- Monitoramento: valor principal + sufixo `(Motorista)` ou `(Veículo)` em cinza claro

### 5.4 Modais de operação (validação / tratativa / auditoria)

| Modal | Botão fechar | Timer | Histórico |
|-------|--------------|-------|-----------|
| Validação | Sem X no header | — | — |
| Tratativa ativa | Sem X | Tempo de tratativa no header | Aba sempre visível; entry compilado só ao Devolver/Concluir |
| Tratativa auditoria | X no canto superior direito | Sim | Somente leitura |
| Cadastro (`CrModal`) | X no header | — | — |

### 5.5 Confirmações

- `ConfirmModal` / `AppliedConfirmModal` — ações destrutivas ou irreversíveis
- Linguagem direta: *"Deseja sair sem salvar?"*, *"Alterações salvas com sucesso."*

---

## 6. Nomenclatura de domínio

Padronize rótulos de interface conforme glossário da plataforma:

| Preferir | Evitar |
|----------|--------|
| Políticas de ocorrências | Políticas de tratativa |
| Escala de trabalho | Turno |
| Tipo de contato | Grupo (como coluna) |
| Monitoramento de | Placa ou prefixo / Motorista (separados) |
| Por motorista / Por veículo | — |
| Último evento gerado | — |
| Política de ocorrência | — |

**Severidade:** Baixo · Médio · Alto · Crítico (sem variações).

**Sufixos de monitoramento:**
- Colunas de tabela: `(Motorista)` / `(Veículo)` — cinza claro
- Listagem de filtro: `(motorista)` / `(veículo)` — cinza claro

---

## 7. Padrões por tipo de tela

### 7.1 Cadastro (CRUD)

```
Toolbar [Título] [+ Novo]
Tabs (opcional)
Tabela list-table
  → ícone editar / excluir / visualizar
Modal CrModal (padrão ou fullscreen)
  → formulário com formId
  → Salvar / Cancelar
```

### 7.2 Operações (Central / Eventos / Auditoria)

```
Toolbar [Título] [Filtro]
FilterPanel (colapsável)
FilterBanner (filtros ativos)
Tabela com colunas de domínio + ações
Modal fullscreen para fluxo (validação, tratativa)
Toast ao concluir ações
```

### 7.3 Formulário de política

```
Nome + Tipo de acompanhamento (mesma linha, nowrap)
Descrição
Grid de eventos (pontos + duração)
4 cards de risco (grid 4→2→1 responsivo)
  → policy-risk-card--{low|medium|high|critical}
Usuários atribuídos
```

**Nova política:** 4 níveis habilitados, pontos padrão 40 / 60 / 80 / 100.

### 7.4 Contatos

| Tipo | Campos visíveis |
|------|-----------------|
| Contato individual | Tipo · Nome · Telefone · E-mail · Escala de trabalho |
| Grupo WhatsApp | Tipo · Nome do grupo · Descrição (tarja `#F9EBD5` / `#E29C2C`) |

**Escala:** tabela Dia / Início / Fim / +1 · checkbox +1 azul · dia desmarcado esmaecido `#98a2b3`.

---

## 8. Ícones e ações

- Ícones de ação em tabela: cor primária `#169EFF`, tamanho ~16–20px
- Botão de filtro: `IconFilterBars` — invertido quando ativo
- Status na Central: ícones antes do tipo de evento (aguardando, validado, IA)
- Ícone de anexo, visualizar, play: sempre com `title` e `aria-label` em português

---

## 9. Responsividade

- Grids de cards de risco: 4 colunas → 2 → 1 (`max-width` breakpoints ~900px)
- Formulários de e-mail: coluna preview abaixo do form em telas < 900px
- Tabelas: scroll horizontal no wrapper, não reduzir fonte
- Sidebar: largura fixa 15rem, transição 0.3s

---

## 10. Checklist para novos projetos

Ao iniciar um produto Creare com este design system:

- [ ] Copiar tokens de `src/index.css` (`:root`)
- [ ] Importar ou extrair CSS base de layout (`.app`, `.content-toolbar`, `.list-table`, `.cr-modal`, `.modal-select`, `.btn`)
- [ ] Reutilizar componentes shared: `CrModal`, `ModalSelect`, `RequiredFieldMarker`, `FieldErrorIcon`, `SuccessToast`, `EmptyState`, `TruncatedTextTooltip`, `AdvancedFilter`
- [ ] Estruturar páginas com `.page-layout.content-body`
- [ ] Usar Montserrat para títulos e Noto Sans para dados
- [ ] Manter primária `#169EFF` — não substituir por outro azul
- [ ] Implementar draft/applied nos filtros
- [ ] Garantir z-index conforme tabela de camadas
- [ ] Validar contraste de cards de risco e badges antes de publicar

---

## 11. Referência de arquivos no projeto origem

| Área | Arquivo |
|------|---------|
| Tokens CSS | `src/index.css` |
| Layout + componentes CSS | `src/App.css` |
| Modal | `src/modules/risk-rules/components/shared/CrModal.tsx` |
| Select | `src/modules/risk-rules/components/shared/ModalSelect.tsx` |
| Filtros | `src/modules/risk-rules/components/shared/AdvancedFilter.tsx` |
| Formulário | `src/modules/risk-rules/components/shared/FormFieldLabel.tsx` |
| Toast | `src/modules/risk-rules/components/shared/SuccessToast.tsx` |
| Empty state | `src/modules/risk-rules/components/shared/EmptyState.tsx` |
| Layout app | `src/components/layout/AppSidebar.tsx` |
| Exemplo listagem | `src/modules/operacoes/pages/OperacoesCentralPage.tsx` |
| Exemplo filtros | `src/modules/operacoes/components/CentralControleFilterPanel.tsx` |

---

*Versão baseada no projeto `modulo-eventos-novo` — Creare Sistemas.*
