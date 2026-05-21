# 03 — Plano de Redesign de Frontend (sequência de prompts)

**Criado:** 20 de maio de 2026
**Autor v1:** Cowork
**Status:** v1 — aguarda debate Codex App + aprovação Léo
**Depende de:** `01-frontend-north-star.md` (visão), `02-auditoria-frontend-atual.md` (gap por tela)
**Bloqueia:** qualquer feature nova (paywall, export PDF, novas sub-telas) — regra anti-pirraça #27

---

## 0. Premissa

Antes de qualquer feature nova, fechamos o **gap de craft** das telas existentes. A ordem segue **impacto em desejo de uso** (top 5 da auditoria seção 7), não ordem técnica de dependência.

A cada fase, validamos no simulador + iPhone real do Léo antes de prosseguir. Sem aprovação visual = não avança.

---

## 1. Roadmap em 3 fases

### Fase 1 — Fundação visual (1-2 dias)
**Objetivo:** alinhar padrões transversais antes de mexer em tela específica.

| # | Prompt | Skill principal | Esforço | Saída |
|---|---|---|---|---|
| 30 | LOW — Padronizar tipografia headlines (todas as tabs) | `/impeccable distill` | 1h | PR pequeno, hierarquia consistente |
| 31 | LOW — Padronizar empty states (componente único `<EmptyState />`) | `/impeccable craft` | 2h | Componente reutilizável + aplicado em 5 telas |
| 32 | LOW — Padronizar error states (componente único `<ErrorState />`) | `/impeccable craft` | 2h | Componente reutilizável + aplicado em 5 telas |
| 33 | LOW — Padronizar loading states (skeleton vs spinner) | `/impeccable craft` | 2h | Decisão + componente + aplicado |
| 34 | LOW — Adicionar haptics em CTAs primários e seleções | — | 1h | Light haptic em "+", Continuar, seleção de opção |

**Critério de pronto da Fase 1:** PR mergeado com checklist de "antes / depois" em todas as 5 tabs + sub-telas críticas.

---

### Fase 2 — Redesign das 3 telas que mais impactam D7 (3-5 dias)
**Objetivo:** Home + Welcome + Onboarding craft.

| # | Prompt | Skill principal | Esforço | Bloqueia |
|---|---|---|---|---|
| 35 | **HIGH — Redesign Home com hero card + insight contextual + atalhos** | `/impeccable shape` + `/impeccable craft` + `react-native-devtools-mcp` | 1.5-2 dias | Crítico — bloqueia tudo |
| 36 | MID — Welcome pré-auth distill (uma frase + 2 CTAs) | `/impeccable distill` | 4h | — |
| 37 | MID — Onboarding craft batch (transições + step indicator + microinteração nos selects) | `/impeccable craft` | 1 dia | — |

**Critério de pronto da Fase 2:** Léo testa Welcome → Onboarding → Home no iPhone real e dá ok visual. Sem ok = volta pra craft.

---

### Fase 3 — Polish das tabs secundárias + modais (2-3 dias)
**Objetivo:** elevar Doses, Diário, Relatórios, Perfil, modais.

| # | Prompt | Skill principal | Esforço |
|---|---|---|---|
| 38 | MID — Redesign DoseCard (variação por status: scheduled / taken / missed) | `/impeccable craft` | 4h |
| 39 | MID — Auditoria + ajustes Diário tab + check-in + quick-log | `/impeccable critique` | 6h |
| 40 | MID — Ordem + hierarquia dos cards de Relatórios + ajustes paleta dos gráficos | `/impeccable craft` | 4h |
| 41 | MID — Perfil tab polish (header com nome, ícones consistentes, ordem de rows) | `/impeccable craft` | 4h |
| 42 | MID — Simplificar modal Peso registrar (312 → ~150 LOC) | `/impeccable distill` | 4h |
| 43 | MID — Auditar + polish modal Dose registrar | `/impeccable critique` + `/impeccable craft` | 4h |

**Critério de pronto da Fase 3:** Léo navega o app inteiro no iPhone real e marca tudo com 🟢. Telas placeholder (Health Data, Medical References, Idioma, Tema) podem ficar pra Fase 4.

---

### Fase 4 — Sub-telas placeholder + audit pre-ship (variável)
**Objetivo:** preencher placeholders + audit final.

| # | Prompt | Skill principal | Esforço |
|---|---|---|---|
| 44 | MID — Settings sub-tela Health Data | `/impeccable craft` | 6h |
| 45 | MID — Settings sub-tela Medical References | `/impeccable craft` | 4h |
| 46 | LOW — Settings sub-tela Idioma + Tema | `/impeccable craft` | 4h |
| 47 | LOW — Limpar settings.json keys legadas V4 | — | 1h |
| 48 | HIGH — `/impeccable audit` em todo o app (a11y, performance, edge cases) | `/impeccable audit` + `/impeccable harden` | 1-2 dias |

**Critério de pronto da Fase 4:** Léo aprova UI completa. Hora de paywall + push backend real + App Store assets.

---

## 2. Detalhamento dos 3 prompts críticos (Fase 2)

### 2.1 Prompt 35 — Redesign Home (HIGH)

**Por que é o mais importante:** Home é o que Mariana vê todo dia. Hoje é 3 cards empilhados sem hero. Mudar isso muda o D7.

**Estrutura proposta da nova Home:**

```
┌─────────────────────────────────┐
│  Bom dia, Mariana                │  ← 17pt regular (saudação calma)
│                                  │
│  ┌────────────────────────────┐  │
│  │ Próxima dose                │  │  ← HERO CARD único
│  │                             │  │
│  │ quinta, daqui 2 dias        │  │  ← 13pt secundário
│  │ Mounjaro 5mg                │  │  ← 28pt semibold
│  │                             │  │
│  │ [Marcar como aplicada] →    │  │  ← CTA Vital Mint sutil
│  └────────────────────────────┘  │
│                                  │
│  Insight do dia                  │  ← Section header
│  ┌────────────────────────────┐  │
│  │ Você está na semana 3.      │  │  ← Texto clínico
│  │ Pacientes nesta fase        │  │
│  │ costumam sentir [X]...      │  │
│  └────────────────────────────┘  │
│                                  │
│  Registros rápidos               │  ← Section header
│  ┌────┐ ┌────┐ ┌────┐            │  ← 3 atalhos discretos
│  │Peso│ │Sint│ │Cons│            │  ← Sem cor, só ícone + label
│  └────┘ └────┘ └────┘            │
└─────────────────────────────────┘
```

**Critérios de pronto:**
- Hero card é o que rouba a cena (visualmente óbvio em 1s)
- Insight do dia muda conforme fase do tratamento (semana 1 ≠ semana 8)
- Atalhos discretos sem cor competitiva
- Empty state D0 mostra "Sua jornada começa aqui" + 1 CTA + insight do onboarding já populado
- Animação de entrada: hero card desliza 8pt + fade em 200ms
- Pull-to-refresh atualiza insight do dia

**Anti-padrões a evitar:**
- Saudação dinâmica com emoji
- "Hoje você está incrível 🎉"
- 2+ cards competindo por atenção
- Atalhos com fundo Vital Mint
- Ilustração de fundo

**Skills + referências:**
- `/impeccable shape` (arquitetura visual)
- `/impeccable craft` (execução)
- `react-native-devtools-mcp` (validação iPhone)
- `@docs/DESIGN.md` (tokens)
- `@docs/PRODUCT.md` (Voice & Tone)
- `@docs/interacao-claude-codex/01-frontend-north-star.md` (princípios)
- `@docs/interacao-claude-codex/02-auditoria-frontend-atual.md` seção 2.2

---

### 2.2 Prompt 36 — Welcome pré-auth distill (MID)

**Estado atual:** 295 LOC, Liquid Glass aplicado.
**Meta:** **<150 LOC**, uma frase, dois CTAs.

**Estrutura proposta:**

```
┌─────────────────────────────────┐
│                                  │
│         [logo sutil]             │  ← 40pt
│                                  │
│  Sua jornada com canetas         │  ← 28pt semibold
│  emagrecedoras merece            │
│  memória.                        │
│                                  │
│  ┌──────────────────────────┐   │
│  │     Começar              │   │  ← CTA primário Vital Mint
│  └──────────────────────────┘   │
│                                  │
│       Já tenho conta             │  ← CTA secundário ghost
│                                  │
│                                  │
│  [Glass faixa inferior sutil]    │  ← Liquid Glass aqui
└─────────────────────────────────┘
```

**Critérios de pronto:**
- Uma única headline (sem subtítulo redundante)
- CTA primário Vital Mint, 56pt altura
- CTA secundário ghost (sem fundo)
- Glass aplicado **só** na faixa inferior (decorativa) ou tab bar simulada
- LOC ≤ 150
- Tempo até interativo < 500ms

**Anti-padrões:**
- Carrossel de slides
- "Conheça os benefícios" antes do CTA
- Footer com "Termos" + "Privacidade" como link (vai pra dentro do consent)
- Imagem hero

---

### 2.3 Prompt 37 — Onboarding craft batch (MID)

**Foco:** transições + step indicator + microinteração nos selects + bottom CTA pattern. **Não muda lógica nem copy.**

**Mudanças visuais:**
- Step indicator: substituir barra de progresso por dots sutis ou número discreto ("3 / 14")
- Transição entre steps: slide horizontal 8pt + fade 200ms (não corte seco)
- Selects: feedback de seleção com background sutil + border Vital Mint thin + haptic light
- Bottom CTA: respeitar safe area + estado disabled visualmente claro (opacity 0.4 + sem haptic)
- Keyboard: KeyboardAvoidingView com behavior `padding` no iOS, mantém input visível
- Validação inline: erro abaixo do input, não popup

**Critérios de pronto:**
- Step entra/sai sem corte
- Selecionar opção dá feedback visual + haptic
- Continuar disabled é óbvio
- Keyboard nunca cobre input ativo
- Erro de validação aparece sem destruir layout

**Anti-padrões:**
- Progress bar percentual ("21% completo!")
- Confete ao completar onboarding
- "Você está indo bem!" entre steps
- Modal de "tem certeza?" ao tentar voltar

---

## 3. Critério geral de pronto pra avançar de fase

Antes de marcar uma fase como concluída:

1. PR mergeado com screenshots reais (PNG em `assets/screenshots/`)
2. Léo testou no iPhone real e marcou 🟢
3. Aprendizados acumulados em `docs/learnings.md`
4. Handoff salvo em `docs/handoff/HANDOFF-prompt-NN.md`
5. Asana task atualizada
6. Auditoria (`02-auditoria-frontend-atual.md`) atualizada com score novo

---

## 4. Riscos do plano

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Léo não aprovar Home na primeira tentativa | Alta | Médio | Validar wireframe + copy ANTES de implementar (rodada de debate com Codex App) |
| Liquid Glass quebrar em iPhone < 26 | Média | Médio | `BlurView` fallback já implementado — testar em iOS 25 também |
| Fadiga de polish (gastar muito tempo em 1 tela) | Alta | Alto | Timebox por prompt: HIGH 2 dias, MID 6h, LOW 2h. Estourou? Abre handoff + revisa escopo |
| Surgirem mais sub-telas placeholder a preencher | Média | Baixo | Manter Fase 4 pra placeholders. Não esticar Fase 3 |
| Conflito com regras de DESIGN.md ao redesenhar | Baixa | Médio | Sempre revisar DESIGN.md antes do prompt. `/impeccable critique` pega violações |

---

## 5. O que NÃO entra nesse plano

- Paywall + RevenueCat UI → próximo plano, depois desse
- Notificação push backend (cron + edge trigger) → pode rodar em paralelo, executor diferente
- Export PDF pra médica → V5.1
- iPad / light mode → V6
- Analytics dashboards → V5.1

---

## 6. Estimativa total

| Fase | Duração estimada | Prompts | Modelo recomendado |
|---|---|---|---|
| 1 — Fundação visual | 1-2 dias | 5 (todos LOW) | Haiku 4.5 |
| 2 — Redesign top 3 | 3-5 dias | 3 (1 HIGH + 2 MID) | Sonnet/Opus |
| 3 — Polish tabs + modais | 2-3 dias | 6 (todos MID) | Sonnet |
| 4 — Sub-telas + audit | 2-3 dias | 5 (1 HIGH + 4 LOW/MID) | Sonnet pra audit, Haiku resto |
| **Total** | **8-13 dias** | **19 prompts** | — |

---

## 7. Sequência canônica (TL;DR)

```
Fase 1: 30 → 31 → 32 → 33 → 34 (paralelizáveis aos pares)
Fase 2: 35 (Home, sequencial) → 36 (Welcome) → 37 (Onboarding)
Fase 3: 38 → 39 → 40 → 41 → 42 → 43 (paralelizáveis aos pares)
Fase 4: 44 → 45 → 46 → 47 → 48 (paralelizáveis exceto 48 que é último)

🚦 Antes de cada prompt MID/HIGH:
   - Reler 01-frontend-north-star.md
   - Consultar 02-auditoria-frontend-atual.md pra tela específica
   - /grill-with-docs se decisão tocar domínio
   - Aprovação de plano antes de codar (regra anti-pirraça #1)
```

---

**Fim do 03-plano-redesign-frontend.md.**

**Próximo passo:** Codex App lê e debate. Depois Léo aprova a sequência. Daí Cowork escreve o **Prompt 30** primeiro (LOW, padronizar tipografia headlines) como warm-up da Fase 1.
