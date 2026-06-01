# Redesign Home — Clinical Command Center Implementation Plan

> **For agentic workers:** plano de redesign VISUAL de uma tela. NÃO é TDD — não há teste unitário significativo para mudança puramente visual. A verificação é: 2 checkpoints visuais (screenshot real), `type-check`, `lint`, teste de navegação e `/impeccable critique`. Steps usam checkbox (`- [ ]`).

**Goal:** Transformar `components/home/HomeV7Content.tsx` de uma lista plana de seções (divisórias) em um Clinical Command Center — painel premium com hierarquia clara e papéis visuais diferenciados — usando APENAS blocos/dados/hooks já existentes.

**Architecture:** Reescrita do layout de `HomeV7Content.tsx` mantendo todos os hooks de dados e rotas atuais. Hero da próxima dose vira card-painel dominante (graphite `#172637` inline). Peso, Consulta, Sintomas e Custos viram cards `bg-surface`. Bloco novo de composição "Ações rápidas" (4 atalhos). Memória recente preservada com os dots por tipo já em produção.

**Tech Stack:** Expo Router, React Native 0.81, NativeWind v4, react-native-svg (sparkline), expo-symbols (SF Symbols), tokens em `lib/theme/tokens.ts`.

---

## Premissa corrigida (fundamental)

O PR #95 (commit `8de4ab9`) **já está na `main`**. Toda a lógica de dots-por-tipo + `lib/memory/source.ts` já existe e funciona. **A Etapa 2 NÃO reimplementa nada disso — apenas preserva e valida.**

| Já na main (PRESERVAR, não tocar) | Local |
|---|---|
| `MemorySource`, `SOURCE_COLORS`, `symptomQuickLogTypes`, `getQuickLogSource` | `lib/memory/source.ts` (4 exports, 1 def cada) |
| Import do módulo (sem defs locais) | `app/memoria/index.tsx:17` |
| `TimelineItem.source` + dot `SOURCE_COLORS[item.source]` + `buildTimeline` com `getQuickLogSource` | `HomeV7Content.tsx` (L35, L442, L694) |

## Decisões travadas (aprovadas por Léo 2026-05-29)

- **Escopo do código = só `components/home/HomeV7Content.tsx`.** `lib/memory/source.ts` e `app/memoria/index.tsx` INTOCADOS. Mudança em dots/source só se o redesign quebrar algo, e mínima.
- **Cor do hero = graphite `#172637` INLINE**, só no card do hero. Se repetir, criar `const HERO_GRAPHITE = '#172637'` local no arquivo. NÃO editar `tokens.ts`. NÃO espalhar o literal. Cards secundários usam `bg-surface`.
- **Header = "Hoje no seu tratamento"**, data visível, engrenagem → `/configuracoes`, sem subtítulo longo.

## North Star / desempate

1. DESIGN.md vence em cor/tom/tokens/regras visuais. 2. Código atual vence em dados/hooks/rotas/comportamento. 3. Mockup vence em composição/ordem/hierarquia. 4. Escopo vence sobre melhoria extra.

## Ordem-alvo dos blocos

1. Header → 2. HERO próxima dose → 3. Peso → 4. Ações rápidas → 5. Consulta → 6. Memória recente → 7. Grid 2col (Sintomas + Custos) → 8. Disclaimer.

## Tokens / valores reais disponíveis (não inventar)

- Cores via `colors` (tokens.ts): `bgBase #050B12`, `bgElevated #0E1620`, `bgSurface #1B2433`, `brand #00D4AA`, `mintSoft #A3E6D2`, `semanticInfo #5BA8D9`, `semanticWarning #FFB347`, `textPrimary/Secondary/Tertiary`, `textInverse #050B12`.
- classNames NativeWind: `bg-base/bg-elevated/bg-surface`, `text-primary/secondary/tertiary/inverse/brand`, `doseday-mint`, `mint-soft`, `positive/warning/critical/info`, spacings `xxs..xxxl`, radius `xs/sm/md` (md=14px via `rounded-[14px]`).
- `elevation[1]` de tokens.ts para o hero (card clínico flutuante).
- Rotas confirmadas: `/configuracoes`, `/(tabs)/doses`, `/peso/historico`, `/peso/registrar`, `/dose/registrar`, `/diario/anotar-sintoma`, `/diario/anotar-memoria`, `/diario/custos`, `/memoria`.
- `nextDose`: `medicationName`, `dose`, `scheduledDate`, `daysUntil`, `isOverdue`, `overdueBy`. `formatNextDoseValue()` já produz "Em X dias"/"Hoje"/"Amanhã"/"X dias de atraso".

---

## Etapa 1 — Estrutura e hierarquia

**Files:** Modify `components/home/HomeV7Content.tsx`. Create `assets/screenshots/redesign-home/00-baseline-before.png`, `01-after-etapa1.png`.

- [ ] **Step 1 — Baseline screenshot (ANTES de qualquer edição de código)**
  Método: `mcp__react-native__screenshot` (react-native-devtools-mcp, sim iPhone 17 + Metro live). Salvar como `assets/screenshots/redesign-home/00-baseline-before.png`.

- [ ] **Step 2 — Reordenar blocos** para a ordem-alvo. Remover a lógica condicional `hasConsultationNotes` que reordena seções; ordem passa a ser estável. Consulta antes da Memória. Manter empty states de cada seção.

- [ ] **Step 3 — Hero próxima dose (card-painel)**
  `View` com `style={{ backgroundColor: HERO_GRAPHITE, ...elevation[1] }}` + `rounded-[14px] p-lg`. Eyebrow "PRÓXIMA DOSE" (caption bold uppercase). `medicationName` Bold (~28px). `dose` ("5,0 mg") em `semanticInfo`. data programada (`scheduledDate`, secondary 13px). Countdown grande (40px Bold) via `formatNextDoseValue` — cor neutra nesta etapa (textPrimary), por-estado fica na Etapa 2. CTA Pressable placeholder neutro (outline/secondary) — label condicional fica na Etapa 2. Body do card pressable → `/(tabs)/doses` (comportamento atual preservado). Estados loading/error/empty mantidos.

- [ ] **Step 4 — Peso (card bg-surface, Number-First)**
  `bg-surface rounded-[14px] p-lg`. Número 48px ultralight + "kg" subtitle. Label "peso atual" (secondary 13px). Chip delta "−13,0 kg desde o início": texto/ícone mint, fundo `bg-elevated`, `rounded-[10px] px-sm py-xxs`. Sparkline preservado (linha + ponto final mintSoft). "atualizado há X dias" (tertiary). Chevron + body pressable → `/peso/historico`.

- [ ] **Step 5 — Ações rápidas (bloco NOVO de composição)**
  Grid 4 atalhos `flex-row gap-sm`. Cada: Pressable `flex-1 items-center gap-xs rounded-[14px] p-md bg-bg-elevated active:opacity-70` + hairline border, `SymbolView` (tintColor textSecondary) + label 13px. Touch target ≥44px. accessibilityRole/Label/Hint em cada. Rotas: Sintoma→`/diario/anotar-sintoma`, Nota→`/diario/anotar-memoria`, Peso→`/peso/registrar`, Dose→`/dose/registrar`. Estilo clínico discreto (ícone+borda, fundo escuro — NÃO círculos coloridos preenchidos).

- [ ] **Step 6 — Consulta (card, antes da memória)**
  Eyebrow "PRÓXIMA CONSULTA". Resumo "N dúvidas para levar" (ou empty). CTA "Anotar dúvida" → `/diario/anotar-memoria`. Card pressable. Preserva render dos itens existentes.

- [ ] **Step 7 — Memória recente (compacta — PRESERVAR dots)**
  Manter `RecentMemoryTimeline` e os dots `SOURCE_COLORS[item.source]` (já em produção). Apenas ajustar enquadramento visual (card/spacing) se necessário para coerência. "Ver memória completa" → `/memoria`.

- [ ] **Step 8 — Grid 2 colunas (Sintomas + Custos)**
  `flex-row gap-sm`, cada card `flex-1 bg-surface rounded-[14px] p-md`. Sintomas (último sintoma → `/memoria`) e Custos (total "R$ X" Number-First → `/diario/custos`). Diferenciação visual entre os dois (Etapa 2 refina). Testar wrap de string longa de moeda.

- [ ] **Step 9 — Disclaimer** (tertiary, centralizado) — preservar texto atual.

- [ ] **Step 10 — Verify Etapa 1**
  `npm run type-check` → PASS. `npm run lint` → PASS. Screenshot real → `assets/screenshots/redesign-home/01-after-etapa1.png`.

- [ ] **CHECKPOINT VISUAL 1 — PARAR.** Reportar caminho do screenshot, resumo do que mudou, comparação com o protótipo, riscos visuais. **Aguardar aprovação explícita de Léo antes da Etapa 2.**

---

## Etapa 2 — Refino, estados e cor (SÓ após aprovação)

**Files:** Modify `components/home/HomeV7Content.tsx`. Create `assets/screenshots/redesign-home/02-final.png`.

- [ ] **Step 1 — CTA condicional do hero por estado**
  Futuro/normal: "Ver próxima dose". Hoje (`daysUntil===0`): "Registrar dose". Atrasada (`isOverdue`): "Registrar dose atrasada". CTAs de registro → `/dose/registrar`; "Ver próxima dose" → `/(tabs)/doses`.

- [ ] **Step 2 — Tempero Vital Mint (DESIGN.md vence; ≤10%)**
  Nunca 2 massas mint no mesmo card. Countdown por estado: futuro = `textPrimary` ou `semanticInfo`; hoje = mint (ação principal); atrasado = `semanticWarning`, NUNCA mint. Se botão for mint, countdown não é mint. Chip peso = texto mint / fundo escuro. Atalho Peso = ícone/borda mint em fundo escuro (não preenchido). Dot peso na memória = mint pequeno (ok).

- [ ] **Step 3 — Contraste + diferenciação Sintoma×Custos + validar sparkline.**

- [ ] **Step 4 — PRESERVAÇÃO dots/source: apenas validar** que `SOURCE_COLORS[item.source]` continua dirigindo a cor (grep: 1 def em source.ts) e que a tela `/memoria` segue idêntica. ZERO edição em `lib/memory/source.ts` / `app/memoria/index.tsx` salvo quebra causada pelo redesign.

- [ ] **Step 5 — Verify Etapa 2 (CHECKPOINT VISUAL 2)**
  Screenshot final `02-final.png`. `npm run type-check` + `npm run lint` PASS. Testar navegação de cada atalho/card. `/impeccable critique` vs DESIGN.md Named Rules. Comparar com mockup.

---

## Validação antes de commit (CRÍTICA)

- `git status --short` antes e depois.
- `git add` SÓ por path explícito (`components/home/HomeV7Content.tsx`, `assets/screenshots/redesign-home/*.png`, este plano).
- Confirmar zero `graphify-out/*`, `.codegraph/*`, duplicados `" 2."` no que for staged.
- Reportar "git status validado, zero contaminação".

## Restrições

Sem feature/dado/schema/Supabase/rota nova. Não apagar `(tabs)`. Não editar `tokens.ts`. Não redesenhar telas internas. Diff cirúrgico, zero drive-by refactor. NativeWind: usar `active:` classes, nunca `Pressable` callback-style (bug v4, learnings #92).
