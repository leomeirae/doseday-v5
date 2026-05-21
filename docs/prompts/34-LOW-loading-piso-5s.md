# DoseDay V5 — Prompt 34-LOW-loading-piso-5s

**Instância de destino:** Aba 1 (principal) — Claude Code direto
**Branch a criar:** `feature/34-loading-piso-5s`
**Modelo recomendado:** Haiku 4.5 (LOW)
**Esforço estimado:** 1-2h
**Origem estratégica:** Fase 1 (`docs/interacao-claude-codex/08-direcao-visual-primeiros-3-minutos.md` §10). Quick-win que fecha o trecho Welcome → Loading → Result do onboarding.

---

## Contexto obrigatório (leia antes de qualquer coisa)

- `CLAUDE.md` — regras anti-pirraça
- `docs/karpathy.md` — Karpathy Guidelines (regra 22)
- `docs/learnings.md` — ler antes de qualquer prompt MID/HIGH (regra obrigatória)
- `docs/PRODUCT.md` — seção Loading IA (mínimo 5s, máximo 15s)
- `docs/interacao-claude-codex/08-direcao-visual-primeiros-3-minutos.md` §6 (Voice & Tone) + §8 (métricas)
- `docs/interacao-claude-codex/08c-codex-app-debate-direcao.md` Ajuste 2 — guardrails obrigatórios
- `app/(onboarding)/loading.tsx` — arquivo único a editar
- `hooks/useOnboardingInsight.ts` — fonte da request real (Edge Function `generate-onboarding-insight`)

---

## Objetivo desta tarefa

Aplicar **piso de 5s** na tela `app/(onboarding)/loading.tsx` antes de transicionar pro Result, garantindo que cada micro-step da narrativa fica visível e que o usuário percebe o app organizando dados reais. Hoje a tela transiciona assim que a Edge Function responde — pode "piscar" em conexão rápida, quebrando a sensação clínica.

Isso fecha um dos cinco critérios objetivos da Fase 1 (§8.1): "Loading IA: cada step ≥ 800ms visível, total ≥ 5s".

---

## Critérios de aceitação

- [ ] Tempo total da tela Loading ≥ 5s no caminho feliz, mesmo se Edge Function responde em <5s
- [ ] Tempo total da tela Loading ≤ 15s no caminho com falha — após 15s sem resposta, navega pro Result com fallback estático (já implementado em `useOnboardingInsight`)
- [ ] Cada micro-step (`stage`, `patterns`, `reminders`, `memory`, `insight`) fica visível ≥ 800ms
- [ ] Quando insight já está cacheado em React Query, **não aplica piso** (vai direto pro Result)
- [ ] `useReducedMotion()` honrado — se OS sinaliza, anima sem fade/slide, mantém só o piso temporal
- [ ] Zero `as any`, zero `// @ts-ignore`, zero `// eslint-disable`
- [ ] `npx tsc --noEmit` PASS sem erros novos
- [ ] `npm run lint` PASS (1 warning preexistente em `lib/i18n/index.ts` aceito)
- [ ] Screenshot real do simulador em `assets/screenshots/2026-05-21-prompt34/` (3 frames: T=0s, T=2.5s, T=5s)
- [ ] Console limpo durante toda a animação (sem warning Reanimated/RN)

---

## Restrições explícitas

- **Karpathy regra 22:** mudança cirúrgica. Zero "drive-by refactoring" em outras telas
- **Não criar** novos componentes — toda lógica fica em `loading.tsx`
- **Não alterar** `hooks/useOnboardingInsight.ts` — request real continua exatamente como está
- **Não usar** `setTimeout` cru — preferir `Promise.all([insightPromise, minDelay(5000)])` pra não bloquear a request real
- **Não silenciar** warnings com `@ts-ignore` — se Reanimated reclamar, investigar e ajustar
- **Glass NÃO usado nessa tela** — Loading é conteúdo onboarding, regra liquid-glass mantém glass restrito a navegação
- **Não tocar** em copy dos micro-steps (já aprovados em `locales/pt-BR/onboarding.json` em `loading.steps.*`)

---

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Planejamento | `superpowers:writing-plans` | Persistir plano em `docs/superpowers/plans/2026-05-21-loading-piso-5s.md` antes de codar (regra 21) |
| Implementação | `react-native-best-practices` | Padrões idiomáticos de timing/animation em RN |
| Implementação | `karpathy-guidelines` | Manter diff cirúrgico, success criteria verificáveis (regra 22) |
| Validação | `react-native-devtools-mcp` | Screenshots reais 3 frames + verificar console limpo (regra 20) |
| Validação | `/impeccable critique` | Score ≥ 28/40 antes de mergear |

### B) Plano de execução

1. **Ler estado atual** — `app/(onboarding)/loading.tsx` + `hooks/useOnboardingInsight.ts`. Identificar onde acontece a navegação pro Result hoje. Checkpoint: mapear o fluxo atual em 3 frases.
2. **Persistir plano** com `superpowers:writing-plans` em `docs/superpowers/plans/2026-05-21-loading-piso-5s.md`.
3. **Detectar caminho de cache** — checar se `useOnboardingInsight` expõe `isCachedHit` ou similar. Se não expõe, propor mínimo aumento na superfície do hook (uma flag booleana). Checkpoint: Léo aprova se precisar tocar no hook.
4. **Implementar piso** com `Promise.all([insightPromise, new Promise(r => setTimeout(r, 5000))])` na função que orquestra steps + navegação. Cap 15s já vem do hook (timeout existente).
5. **Sequenciar micro-steps** com timing controlado — cada step ≥ 800ms, total visual mínimo 4s (deixa folga de 1s pro último step antes do navigate).
6. **Respeitar Reduce Motion** — se `useReducedMotion()` retorna true, manter o piso temporal mas desabilitar transições visuais de step (renderiza estático e troca conteúdo).
7. **Validar com `react-native-devtools-mcp`**:
   - Login conta `leonardo-fase0@teste.com`
   - Fluxo completo onboarding até pré-Result
   - Capturar `T0-loading-start.png`, `T2_5s-loading-meio.png`, `T5s-loading-fim.png` em `assets/screenshots/2026-05-21-prompt34/`
   - Stopwatch via `js_eval` pra confirmar piso
8. **Rodar `/impeccable critique`** e ajustar até score ≥ 28/40.
9. **Abrir PR** `feature/34-loading-piso-5s` com título `feat(onboarding): piso de 5s no Loading IA + Reduce Motion` + body referenciando §10 do `08-direcao-visual` + 3 screenshots reais.

### C) Riscos identificados

| Risco | Severidade | Mitigação |
|---|---|---|
| Insight cacheado + piso = UX de "loading falso" | Alta | Detectar cache hit antes de aplicar piso (etapa 3 do plano) |
| Edge Function levar >15s | Média | Timeout existente em `useOnboardingInsight` já cuida; só validar que fallback dispara |
| `Promise.all` mascarar erro da Edge Function | Média | Capturar reject da insightPromise separadamente, não confiar no Promise.all |
| Reduce Motion ignorado | Baixa | Etapa 6 do plano cobre; validar manualmente nos screenshots |
| Reanimated warning sobre `useReducedMotion` em ambiente sem provider | Baixa | Já usado em `ExpandableContextSection` (PR #44), padrão estabelecido |

### D) Arquivos que vai criar/editar

| Arquivo | Ação | Resumo |
|---|---|---|
| `app/(onboarding)/loading.tsx` | editar | +piso 5s + Reduce Motion. Diff esperado: ≤40 linhas adicionadas, ≤10 removidas |
| `hooks/useOnboardingInsight.ts` | editar (talvez) | +flag `isCachedHit` se ainda não existe (mínimo possível) |
| `docs/superpowers/plans/2026-05-21-loading-piso-5s.md` | criar | Plano aprovado persistido |
| `assets/screenshots/2026-05-21-prompt34/T0-loading-start.png` | criar | Frame inicial |
| `assets/screenshots/2026-05-21-prompt34/T2_5s-loading-meio.png` | criar | Frame intermediário |
| `assets/screenshots/2026-05-21-prompt34/T5s-loading-fim.png` | criar | Frame final pré-navigate |

**Não tocar em:**
- Edge Function `generate-onboarding-insight` (já no contrato D015 via PR #36)
- `app/(onboarding)/result.tsx` (Prompt 31 finalizou)
- Outros componentes do onboarding

### E) Como vai validar

- [ ] `npx tsc --noEmit` PASS
- [ ] `npm run lint` PASS (warnings preexistentes aceitos)
- [ ] Stopwatch via `js_eval` confirma total ≥ 5s no caminho feliz
- [ ] Stopwatch confirma <1s no caminho com cache (regressão evitada)
- [ ] Screenshot real T=0 mostra primeiro micro-step
- [ ] Screenshot real T=2.5s mostra step intermediário diferente do T=0
- [ ] Screenshot real T=5s mostra último step ou transição pra Result
- [ ] Console limpo durante toda a animação
- [ ] `/impeccable critique` score ≥ 28/40
- [ ] Aprendizado #N+1 registrado em `docs/learnings.md` (timing real medido vs PRODUCT.md spec)

### F) Otimização de tokens

Arquivos a ler:
- `app/(onboarding)/loading.tsx` (~120 linhas estimado) — Read direto
- `hooks/useOnboardingInsight.ts` (~80 linhas estimado) — Read direto
- `locales/pt-BR/onboarding.json` (~280 linhas) — `rtk read` (>200 linhas)

RTK não traz ganho perceptível nesse prompt. Default Read está OK.

---

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.

---

## Diagnóstico técnico (informação pra acelerar o plano)

**Guardrails obrigatórios** vindos de `08c-codex-app-debate-direcao.md` Ajuste 2:

| Guardrail | Implementação |
|---|---|
| Piso de 5s sem bloquear request | `Promise.all([insightPromise, minDelay(5000)])` |
| Cap máximo 15s | Já existe em `useOnboardingInsight` (timeout) |
| Não aplicar piso em cache | Detectar `isCachedHit` antes de aplicar |
| Respeitar Reduce Motion | `useReducedMotion()` do reanimated |
| Cada micro-step ≥ 800ms | Timing controlado por estado local |

**Trecho-âncora esperado em `loading.tsx`:**

```typescript
const reducedMotion = useReducedMotion()
const MIN_DELAY_MS = insight.isCachedHit ? 0 : 5000

useEffect(() => {
  const start = Date.now()
  Promise.all([
    insight.promise,
    new Promise(r => setTimeout(r, MIN_DELAY_MS)),
  ])
    .then(() => {
      const elapsed = Date.now() - start
      // log apenas em dev, sem PHI
      router.replace('/(onboarding)/result')
    })
    .catch(() => router.replace('/(onboarding)/result')) // fallback honesto
}, [])
```

---

## Pós-PR (entra em `docs/learnings.md` como aprendizado N+1)

```
#N — 2026-05-21 — Loading piso de 5s no onboarding: percepção de processamento real.
Medido em iPhone 17 Simulator: caminho feliz com cache miss leva ~3.2s pro insight
responder; piso de 5s adiciona ~1.8s. Sensação subjetiva passa de "piscou" pra
"organizou". Cache hit pula piso (~150ms total). Lição aplicável: tela de IA
precisa de piso temporal pra criar narrativa, mas só quando há processamento real.
```

---

**Fim do Prompt 34.**
