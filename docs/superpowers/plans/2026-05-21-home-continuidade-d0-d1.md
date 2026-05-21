# Plano — Prompt 32: Home continuidade D0/D1+ + Number-First + EmptyDoseStateCard

**Data:** 2026-05-21
**Branch:** `feature/32-home-continuidade-d0-d1`
**Origem:** `docs/prompts/32-MID-home-continuidade-d0-d1.md` (Fase 1, §5 do `08-direcao-visual-primeiros-3-minutos.md`)

---

## Contexto

A Home (`app/(tabs)/index.tsx`) é a tela mais vista do app, mas hoje quebra a
continuidade visual estabelecida em Welcome → Loading → Result:

- **D0** (usuário recém-saído do onboarding, sem dose registrada): o `NextDoseCard`
  mostra um estado vazio passivo ("Nenhuma dose registrada") sem CTA primário. O
  insight gerado no onboarding (já salvo no DB) não aparece.
- **D1+** (com dose): o número de dias usa `numberLarge` (40pt), não respeita o
  wireframe Number-First (§5.3).
- O `InsightCard` mostra um upsell Premium na primeira leitura emocional.

Objetivo: redesenhar a Home como continuação do Result. Fecha 2 critérios da Fase 1
(§8.1) + o critério subjetivo §8.2.

**Decisões aprovadas pelo Léo (2026-05-21):**
1. Hero number em **48pt** via token novo `numberHero` (comment de uso restrito).
2. Insight diário para usuário free: **fallback estático sem upsell** —
   `"Vamos acompanhar seu tratamento dia a dia."`. Premium sai da Home (continua em
   Perfil / CTAs pós-valor). Este prompt não toca monetização.

---

## Karpathy (regra 22)

- **Assumptions:** `useDoseSummary` retorna `{ nextDose, history }` — não existe
  `lastDoseId`/`lastDoseAt` (sketch do prompt desatualizado). Sinal de "tem dose" =
  `history.length > 0`. `educational_insights` tem coluna `context` jsonb com
  `output: OnboardingInsightContract` e campo `trigger_source` (ADR 0002).
- **Could 50 lines do this?** Quase — núcleo é ~3 edições pequenas + 2 arquivos novos.
- **Trace:** cada mudança traceia a um critério de aceitação do Prompt 32.
- **Success criteria:** `tsc` PASS, `lint` PASS, 4 greps de segurança, 3 screenshots
  reais, `/impeccable critique` ≥ 32/40, `/impeccable detect` 0 achados.

### Desvios conscientes do sketch do prompt

1. **NextDoseCard NÃO recebe prop `state`.** Sketch do prompt é auto-contraditório
   (passo 5 pede prop `state`; passo 8 renderiza `EmptyDoseStateCard` direto). Decisão:
   `index.tsx` faz o switch; `NextDoseCard` perde seu branch de estado vazio e cuida
   só de loading/error/preenchido. Mais cirúrgico.
2. **`useDailyInsight` ganha param opcional `enabled`** (~2 linhas). Evita chamada à
   Edge Function no D0 (alinhado a "Edge Function só pra gerar; DB pra reaproveitar").

---

## Arquivos

| Arquivo | Ação |
|---|---|
| `lib/theme/tokens.ts` | editar — +token `numberHero` 48pt |
| `hooks/useOnboardingInsightFromDB.ts` | criar — lê `educational_insights.context.output`, valida Zod |
| `hooks/useDailyInsight.ts` | editar — param opcional `enabled` |
| `components/home/EmptyDoseStateCard.tsx` | criar — Surface elevated + CTA Vital Mint |
| `components/home/NextDoseCard.tsx` | editar — Number-First D1+, remove branch vazio |
| `components/home/InsightCard.tsx` | editar — prop `source`, remove upsell |
| `app/(tabs)/index.tsx` | editar — switch D0/D1+ |
| `docs/learnings.md` | editar — aprendizado N+1 |
| `assets/screenshots/2026-05-21-prompt32/*.png` | criar — 3 screenshots |

**Não tocar:** `app/(onboarding)/*`, `app/(tabs)/_layout.tsx`, Edge Functions,
RevenueCat config.

---

## Implementação

1. **Token** `numberHero: { fontSize: 48, fontWeight: '700', lineHeight: 54 }` com
   comment de uso restrito.
2. **`useOnboardingInsightFromDB`** — React Query, lê `educational_insights`
   filtrando `trigger_source='onboarding'`, valida `context.output` com
   `onboardingInsightContractSchema.safeParse`, retorna `OnboardingInsightContract | null`,
   `staleTime` infinito.
3. **`useDailyInsight`** — aceita `{ enabled }` opcional, repassa pro `useQuery`.
4. **`EmptyDoseStateCard`** — Surface elevated, headline "Comece sua jornada", body
   "Registre sua primeira dose pra começar a memória do tratamento.", CTA "Registrar
   dose" Vital Mint, prop `onPressRegister`.
5. **`NextDoseCard`** — remove branch vazio; hero 48pt `numberHero` + `brand` no
   caminho não-overdue; "Hoje" como hero quando `daysUntil===0`; overdue mantém
   `numberLarge` + `semanticWarning`; label → `bodyClinical`.
6. **`InsightCard`** — prop `source: 'onboarding' | 'daily'`; remove `FREE_PLACEHOLDER`;
   fallback estático "Vamos acompanhar seu tratamento dia a dia.".
7. **`index.tsx`** — `hasDose = (dose?.history.length ?? 0) > 0`; switch
   EmptyDoseStateCard / NextDoseCard; `InsightCard source={hasDose ? 'daily' : 'onboarding'}`.

---

## Validação

- `npx tsc --noEmit` PASS
- `npm run lint` PASS
- Greps de segurança (0, exceto `colors.brand` ≤ 2)
- 3 screenshots reais em `assets/screenshots/2026-05-21-prompt32/`
- `/impeccable critique` ≥ 32/40, `/impeccable detect` 0 achados
- `security-review` (RLS `educational_insights`)

---

## Riscos

| Risco | Mitigação |
|---|---|
| Insight onboarding ausente no DB | Hook retorna `null` → fallback estático |
| RLS bloquear leitura | `security-review`; migration MCP se faltar policy |
| 48pt quebrar layout | Validar simulador; ajustar padding, não a fonte |
| Vital Mint em 2 lugares | Grep `colors.brand` ≤ 2 |
| `git add` capturar lixo untracked | Stage explícito por nome |
