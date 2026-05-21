# DoseDay V5 — Prompt 31-HIGH-result-ia-redesign

**Instância de destino:** Codex App ou Claude Code (independente, **executor diferente do Prompt 30** pra paralelizar)
**Branch a criar:** `feature/31-result-ia-redesign`
**Modelo recomendado:** Opus ou Sonnet (HIGH — decisão visual + craft + multiple cards novos)
**Esforço estimado:** 1-1.5 dia
**Origem estratégica:** Fase 2 do redesign (`docs/interacao-claude-codex/08-direcao-visual-primeiros-3-minutos.md` §4).

---

## Contexto obrigatório (leia antes de qualquer coisa)

- `CLAUDE.md` — regras anti-pirraça
- `docs/karpathy.md` — Karpathy Guidelines
- `docs/PRODUCT.md` — Voice & Tone, Number-First Rule, Sobriedade Clínica
- `docs/DESIGN.md` — tokens, hierarquia tipográfica
- `docs/interacao-claude-codex/01-frontend-north-star.md` §2.2 (primeiros 3 minutos), §4 (Result IA)
- `docs/interacao-claude-codex/07-auditoria-v2.md` §4 (achados do Result: ONB-06/07/08/10)
- `docs/interacao-claude-codex/08-direcao-visual-primeiros-3-minutos.md` §4 (direção Result) + §6 (Voice & Tone) + §7 (componentes novos)
- `docs/interacao-claude-codex/08c-codex-app-debate-direcao.md` ajuste 3 (ExpandableContextSection → "Como o DoseDay vai acompanhar")
- `docs/interacao-claude-codex/decisoes.md` D015 (P009=A — sem citações nominais a estudos)
- `docs/adr/0001-labels-deterministicos-edge-onboarding.md` (contrato canônico)
- `docs/adr/0002-persistencia-hibrida-educational-insights.md`
- `app/(onboarding)/result.tsx` — estado atual (já consumindo `OnboardingInsightOutput` após PR #36)
- `types/api.ts` — contrato `OnboardingInsightOutput` (stageLabel, medicationLabel, goalLabel, deltaLabel, shortInsight, nextStep, contextBullets, disclaimer)
- `lib/supabase/queries/insights.ts` — `callGenerateOnboardingInsight()`
- `hooks/useOnboardingInsight.ts`
- `components/onboarding/InsightCard.tsx` (estado atual)
- `components/ui/InsightDisclaimer.tsx` (existente — reutilizar)
- `assets/screenshots/2026-05-20-fase-0/40-onboarding-14-result.png` + `41-onboarding-14-result-scrolled.png` (estado atual)
- `assets/screenshots/2026-05-20-fase-2-pr33/result-onboarding-insight-contract.png` (após PR #36)

---

## Objetivo desta tarefa

Redesenhar a tela `app/(onboarding)/result.tsx` (step 14 do onboarding) pra **inverter a ordem visual**, garantir Number-First, dar visibilidade ao disclaimer, e impedir que o CTA fixo cubra conteúdo.

**Estado atual (pós-PR #36):** Result já consome `OnboardingInsightOutput` do contrato estruturado, mas a renderização ainda mantém ordem "headline + shortInsight grande + cards de números abaixo da dobra + CTA fixo cobrindo as últimas linhas". Esse PR refaz o visual usando os mesmos dados já tipados.

**Estado alvo:**
1. Cards de números **primeiro** (acima da dobra): "Semana N", "Mounjaro Xmg", "Meta Ykg / faltam Zkg"
2. Contexto narrativo (`shortInsight` + `nextStep`) abaixo dos cards em peso visual menor
3. Seção expandível "Como o DoseDay vai acompanhar" com `contextBullets`
4. Disclaimer visível no meio (não escondido no scroll), usando `InsightDisclaimer`
5. CTA "Começar a usar" com `paddingBottom` no ScrollView = altura do dock fixo + safe area, **sem cobrir conteúdo**
6. Vital Mint usado **≤1 vez** por tela (apenas no número da meta OU no CTA — escolher um)

---

## Decisões canônicas aplicadas (não revisar)

| Decisão | Origem |
|---|---|
| Inverter ordem: cards de números primeiro, contexto depois | `08` §4.2 wireframe |
| Number-First Rule no `goalLabel`/`deltaLabel` (32pt Vital Mint hero) | `01-frontend-north-star.md` §1.3 + `08` §4.3 |
| Expandível "Como o DoseDay vai acompanhar" (NÃO "Saiba mais sobre essa fase") | `08c` ajuste 3 + decisão D015 |
| Disclaimer visível no meio do scroll, não escondido | `08` §4.5 |
| CTA fixo com `paddingBottom` no Scroll = altura CTA + safe area | `08` §4.2 + ONB-07 |
| Conteúdo proibido na expandível: "É comum sentir X nessa fase", "Pacientes nessa etapa costumam Y", menção nominal a estudo, porcentagem populacional | `08c` ajuste 3 |
| Conteúdo permitido na expandível: uso dos dados no app, organização semanal, lembrete que decisão clínica continua com profissional | `08c` ajuste 3 |
| Glass nunca em conteúdo (cards de Number-First são flat) | `01-frontend-north-star.md` §1.5 |

---

## Critérios de aceitação

- [ ] Em screenshot real **acima da dobra** (sem scroll) aparecem: headline "Bem-vindo, {nome}." + Card 1 (stageLabel + medicationLabel) + Card 2 (goalLabel + deltaLabel)
- [ ] `shortInsight` aparece **abaixo** dos cards, em peso visual menor (15-17pt regular, não headline)
- [ ] `nextStep` aparece como frase calma logo após `shortInsight`
- [ ] Componente `<ExpandableContextSection />` (ou nome equivalente) renderiza `contextBullets` colapsado por default com label "Como o DoseDay vai acompanhar"
- [ ] `<InsightDisclaimer />` renderizado **antes** do CTA, visível sem scroll OU com scroll mínimo (não escondido no rodapé)
- [ ] CTA "Começar a usar" fixo no bottom **NÃO cobre** texto (paddingBottom no Scroll = `CTA_HEIGHT + safeAreaBottom`)
- [ ] Vital Mint aparece **no máximo 1 vez** na tela (escolher: número da meta OU CTA — recomendo CTA, mantendo cards flat)
- [ ] `goalLabel` / `deltaLabel` em 32pt+ semibold quando exibido como número
- [ ] Tipografia hierárquica: headline > card values > shortInsight > nextStep > contextBullets > disclaimer
- [ ] Zero citação nominal a estudo clínico no Result (`grep "SURMOUNT\|SURPASS\|STEP" app/(onboarding)/result.tsx` retorna vazio)
- [ ] Funciona com `OnboardingInsightOutput.contextBullets` vazio (renderiza sem a seção expandível) OU com 1-3 bullets
- [ ] Funciona com `OnboardingInsightOutput` fallback (Edge Function devolveu fallback honesto)
- [ ] `tsc --noEmit` PASS
- [ ] `npm run lint` PASS sem erros novos
- [ ] `/impeccable critique` rodado no `result.tsx` + componentes novos, score ≥ 34/40
- [ ] Screenshot real PNG `assets/screenshots/2026-05-20-fase-2-pr31/result-redesign.png` anexado ao PR
- [ ] Screenshot do estado expandido `assets/screenshots/2026-05-20-fase-2-pr31/result-redesign-expanded.png` anexado

---

## Restrições explícitas

- **Karpathy:** redesign cirúrgico em Result. Zero refator em Edge Function (`supabase/functions/`), `types/api.ts`, `lib/supabase/queries/insights.ts`, `hooks/useOnboardingInsight.ts` — eles já estão certos do PR #36
- **NÃO** mexer na Edge Function — output já está no contrato. Se faltar conteúdo, é gap do Prompt 33, abrir issue separado
- **NÃO** redesenhar `loading.tsx` (entra no Prompt 34)
- **NÃO** redesenhar Home D0/D1 (entra no Prompt 32, depende deste mergear primeiro)
- **NÃO** redesenhar Welcome (Prompt 30 em paralelo)
- **NÃO** mexer em `(onboarding)/welcome.tsx`, `personal-info.tsx` ... `consent.tsx` — apenas `result.tsx`
- **NÃO** usar `as any`, `// @ts-ignore`, `// eslint-disable`
- **NÃO** aplicar glass em cards de conteúdo (anti-padrão #1)
- **NÃO** usar Vital Mint em mais de 1 elemento
- **NÃO** adicionar Lottie, ilustração, animação decorativa
- **NÃO** mudar a copy do `disclaimer` (vem fixa da Edge Function)
- **NÃO** adicionar tradução en/es — entra em prompt futuro

---

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Planejamento | `superpowers:writing-plans` | Persistir plano em `docs/superpowers/plans/2026-05-21-result-ia-redesign.md` |
| Arquitetura | `grill-with-docs` | Validar wireframe contra North Star + ADR 0001 |
| Implementação | `/impeccable craft` | Execução visual Number-First + sobriedade |
| Validação | `react-native-devtools-mcp` | 2 screenshots reais (collapsed + expanded) no simulador |
| Validação | `/impeccable critique` | Score ≥ 34/40 antes do PR |

### B) Plano de execução

1. Persistir plano em `docs/superpowers/plans/2026-05-21-result-ia-redesign.md`
2. Ler `app/(onboarding)/result.tsx` atual (saída do PR #36) + `types/api.ts` (`OnboardingInsightOutput`)
3. Reescrever `result.tsx` com nova ordem visual:
   - Header: "Bem-vindo, {firstName}."
   - **Card 1** flat: `stageLabel` + `medicationLabel` (Number-First no número da semana se houver número, senão hierarquia tipográfica)
   - **Card 2** flat: `goalLabel` (label) + número grande + `deltaLabel` em text-secondary
   - **Bloco narrativo:** `shortInsight` (17pt regular) + `nextStep` (15pt text-secondary)
   - **`<ExpandableContextSection />`** colapsado com label "Como o DoseDay vai acompanhar" — expande pra listar `contextBullets`
   - **`<InsightDisclaimer />`** visível no meio (logo após expandível)
   - **CTA "Começar a usar"** fixo no bottom, Vital Mint, com `paddingBottom` no Scroll = `CTA_HEIGHT + safeAreaBottom`
4. Criar `components/onboarding/ExpandableContextSection.tsx` se ainda não existir. Animação de expand simples (Reanimated `useSharedValue` ou `LayoutAnimation`)
5. Refatorar/criar `components/onboarding/InsightStageCard.tsx` (Card 1) e `components/onboarding/InsightGoalCard.tsx` (Card 2) — flat, sem glass, sem Vital Mint excessivo
6. Confirmar que `<InsightDisclaimer />` existente funciona ou adaptar mínimo
7. `tsc --noEmit` + `npm run lint` PASS
8. `/impeccable critique` no `result.tsx` + 3 componentes novos
9. Validar no simulador (`react-native-devtools-mcp`):
   - Login `leonardo-fase0@teste.com`, ir até step 14 (precisa recriar fluxo de onboarding ou usar conta com `onboarding_completed_at=null`)
   - Screenshot collapsed
   - Tap em "Como o DoseDay vai acompanhar"
   - Screenshot expanded
10. Capturar 2 screenshots reais em `assets/screenshots/2026-05-20-fase-2-pr31/`
11. Abrir PR com título `feat(onboarding): redesign Result IA com Number-First + ordem invertida` + body referenciando `08` §4, ADR 0001, decisão D015, screenshots, score impeccable

### C) Riscos identificados

- **R1: `OnboardingInsightOutput.contextBullets` vazio em fallback** → renderizar sem a seção expandível (condicional `{contextBullets.length > 0 && <ExpandableContextSection ... />}`)
- **R2: `goalLabel` da Edge Function vem como texto livre ("Meta de peso") e não como número** → checar contrato em `types/api.ts`; se label é texto, fatorar `goal_weight` do `input` salvo no `context.input` pra renderizar o número grande
- **R3: ScrollView + KeyboardAvoidingView no result.tsx pode conflitar com paddingBottom dinâmico** → testar e ajustar
- **R4: Step 14 difícil de re-capturar (onboarding completo da conta `leonardo-fase0`)** → criar `leonardo-fase0c@teste.com` ou reset controlado de `onboarding_completed_at`
- **R5: ExpandableContextSection com LayoutAnimation pode jankar em dispositivos mais antigos** → usar Reanimated layout transition se possível
- **R6: Vital Mint em CTA + Vital Mint no número da meta = duas ocorrências (viola regra)** → escolher: CTA recebe Vital Mint, meta recebe cor neutra. Documentar decisão

### D) Arquivos que vai criar/editar

| Arquivo | Ação | Resumo |
|---|---|---|
| `app/(onboarding)/result.tsx` | reescrever | Nova ordem visual, hierarquia tipográfica, paddingBottom |
| `components/onboarding/InsightStageCard.tsx` | criar | Card 1 flat — stageLabel + medicationLabel |
| `components/onboarding/InsightGoalCard.tsx` | criar | Card 2 flat — goalLabel + número grande + deltaLabel |
| `components/onboarding/ExpandableContextSection.tsx` | criar | Seção colapsável "Como o DoseDay vai acompanhar" |
| `docs/superpowers/plans/2026-05-21-result-ia-redesign.md` | criar | Plano persistido |
| `assets/screenshots/2026-05-20-fase-2-pr31/result-redesign.png` | criar | Screenshot collapsed |
| `assets/screenshots/2026-05-20-fase-2-pr31/result-redesign-expanded.png` | criar | Screenshot expanded |
| `docs/history.md` | editar (1 linha) | Registrar Prompt 31 |

**Não tocar em:**
- `supabase/functions/generate-onboarding-insight/` (Edge Function mantida do PR #36)
- `types/api.ts` (contrato canônico)
- `lib/supabase/queries/insights.ts`
- `hooks/useOnboardingInsight.ts`
- `app/(onboarding)/loading.tsx` (Prompt 34)
- `app/(tabs)/index.tsx` ou `components/home/InsightCard.tsx` (Prompt 32)
- `app/(welcome)/` (Prompt 30)
- `app/(onboarding)/*.tsx` exceto `result.tsx`

### E) Como vai validar

- [ ] `tsc --noEmit` PASS
- [ ] `npm run lint` PASS
- [ ] Screenshot collapsed mostra cards de números acima da dobra
- [ ] Screenshot expanded mostra contextBullets sem citação a estudos
- [ ] `grep "SURMOUNT\|SURPASS\|STEP" app/(onboarding)/result.tsx components/onboarding/` retorna vazio
- [ ] `npx impeccable detect 'app/(onboarding)/result.tsx' 'components/onboarding/InsightStageCard.tsx' 'components/onboarding/InsightGoalCard.tsx' 'components/onboarding/ExpandableContextSection.tsx' --json` retorna `[]`
- [ ] `/impeccable critique` score ≥ 34/40
- [ ] Tap em "Começar a usar" navega pra `(tabs)`
- [ ] CTA não cobre disclaimer nem o último contextBullet em iPhone 17 / iOS 26.5

### F) Otimização de tokens

`result.tsx` atual provavelmente <200 linhas (já reduzido pelo PR #36). `Read` direto OK. Componentes existentes do diretório `components/onboarding/` <100 linhas cada. Sem leitura grande.

---

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.
