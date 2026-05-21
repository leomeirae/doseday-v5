# DoseDay V5 — Prompt 32-MID-home-continuidade-d0-d1

**Instância de destino:** Aba 2 (Agent View) — Claude Code com worktree paralelo
**Branch a criar:** `feature/32-home-continuidade-d0-d1`
**Modelo recomendado:** Sonnet 4.6 (MID com decisão arquitetural)
**Esforço estimado:** 6-8h
**Origem estratégica:** Fase 1 (`docs/interacao-claude-codex/08-direcao-visual-primeiros-3-minutos.md` §5 + §10). Peça **central** do redesign — Home é a tela mais vista do app.

---

## Contexto obrigatório (leia antes de qualquer coisa)

- `CLAUDE.md` — regras anti-pirraça
- `docs/karpathy.md` — Karpathy Guidelines (regra 22)
- `docs/learnings.md` — ler antes de qualquer prompt MID/HIGH (regra obrigatória)
- `docs/PRODUCT.md` — North Star "Clinical Memory", paywall fora da primeira leitura
- `docs/DESIGN.md` — Number-First, Vital Mint, Glass restrito a navegação
- `docs/interacao-claude-codex/08-direcao-visual-primeiros-3-minutos.md` §5 (Home) + §6 (Voice & Tone) + §7 (componentes) + §8 (métricas)
- `docs/interacao-claude-codex/decisoes.md` D015 (P009=A — sem citações nominais a estudos)
- `docs/adr/0001-labels-deterministicos-edge-onboarding.md` — contrato do PR #36 reaproveitado
- `docs/adr/0002-persistencia-hibrida-educational-insights.md` — onde o insight do onboarding mora
- `types/api.ts` — `OnboardingInsightContract` (8 campos)
- `app/(tabs)/index.tsx` — Home atual
- `components/home/{NextDoseCard,InsightCard,GreetingHeader}.tsx` — componentes a refatorar
- `hooks/{useDoseSummary,useDailyInsight,useProfile}.ts` — fontes de dados
- `lib/supabase/queries/insights.ts` — função `callMemoryDailyInsight` (Movimento 1)

---

## Objetivo desta tarefa

Redesenhar a Home pra ser **continuação visual do Result do onboarding**. Hoje a Home D0 (sem dose registrada) tem card vazio sem CTA primário; D1+ não respeita Number-First e mostra paywall na primeira leitura. Esse prompt corrige tudo isso, alinhando Home com a sensação clínica/calma estabelecida no Welcome → Loading → Result.

Fecha 2 dos critérios objetivos da Fase 1 (§8.1):
- Home D0: insight do onboarding visível, CTA "Registrar dose" visível
- Home D1+: Number-First respeitado, Premium fora da primeira leitura

E o critério subjetivo (§8.2): Welcome → Onboarding → Loading → Result → **Home** parece uma conversa contínua.

---

## Critérios de aceitação

- [ ] **Home D0** (sem dose registrada): `EmptyDoseStateCard` novo com headline + body + CTA primário "Registrar dose" em Vital Mint
- [ ] **Home D1+** (com dose): `NextDoseCard` em Number-First — dias-até-dose em 48pt Vital Mint, medicação em 17pt, data em 13pt text-secondary
- [ ] **Insight do dia (D0)** reaproveita `OnboardingInsightContract.shortInsight + nextStep` (lido via Movimento 1 `educational_insights` trigger=`onboarding`)
- [ ] **Insight do dia (D1+)** lê `callMemoryDailyInsight` (já existe), fallback estático "Vamos acompanhar seu tratamento dia a dia."
- [ ] **Sem paywall** na primeira leitura emocional (Premium fica em sub-tela ou aba Perfil, fora da Home)
- [ ] **Greeting** mantido como está (regra: não tocar em copy aprovada sem motivo)
- [ ] **Glass apenas em navegação** — tab bar mantém, cards Home são `Surface elevated` sem blur
- [ ] **Zero citação nominal a estudos** no insight da Home (D015)
- [ ] **Vital Mint Rarity** preservado: aparece **só** em hero number (D1+) ou CTA "Registrar dose" (D0)
- [ ] Zero `as any`, `// @ts-ignore`, `// eslint-disable`
- [ ] `npx tsc --noEmit` PASS
- [ ] `npm run lint` PASS (warnings preexistentes aceitos)
- [ ] Screenshots reais em `assets/screenshots/2026-05-21-prompt32/`:
  - `home-d0-empty.png` — usuário recém-saído do onboarding, sem dose
  - `home-d1-com-dose.png` — usuário com 1 dose registrada
  - `home-d7-meio-tratamento.png` — usuário em tratamento ativo
- [ ] `/impeccable critique` score ≥ 32/40
- [ ] `/impeccable detect` PASS sem achados

---

## Restrições explícitas

- **Karpathy regra 22:** decisão arquitetural deve constar no plano (cada linha traceia ao pedido). Zero scope creep.
- **Não tocar** em onboarding/result/welcome/loading (já mergeados em PRs #36, #39, #44 + Prompt 34 paralelo)
- **Não tocar** em tab bar (já Liquid Glass migrado em PR #22)
- **Não criar** `<EmptyState />` genérico — `EmptyDoseStateCard` é específico da Home (regra D012 — componentes transversais nascem reativos)
- **Não criar** paywall, modal Premium, banner upsell — explicitamente fora do escopo Fase 1
- **Não silenciar** warnings i18n
- **Não copiar** lógica de `Result.tsx` — se precisar reaproveitar, extrair pra hook compartilhado em `hooks/useOnboardingInsightFromDB.ts` ou similar
- **Glass de conteúdo proibido** — `Surface elevated` é a textura permitida nos cards Home (DESIGN.md)

---

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Planejamento | `superpowers:writing-plans` | Persistir plano em `docs/superpowers/plans/2026-05-21-home-continuidade-d0-d1.md` (regra 21) |
| Planejamento | `grill-with-docs` | Stress-test contra `CONTEXT.md` + ADRs 0001/0002 antes de codar (regra 11) |
| Implementação | `ios-medical-design` | Padrão clínico/calmo iOS pra cards Home |
| Implementação | `/impeccable craft` | Construir 1 componente novo (`EmptyDoseStateCard`) + refator de 2 (`NextDoseCard`, `InsightCard`) |
| Implementação | `karpathy-guidelines` | Diff cirúrgico, success criteria verificáveis |
| Validação | `react-native-devtools-mcp` | 3 screenshots reais em estados diferentes (regra 20) |
| Validação | `/impeccable critique` | Score ≥ 32/40 |
| Validação | `/impeccable detect` | Zero achados |
| Compliance | `security-review` | RLS check no read de `educational_insights` na Home |

### B) Plano de execução

1. **Ler estado atual** — `app/(tabs)/index.tsx` + 3 componentes Home + hooks usados. Mapear o fluxo: greeting → query summary → render NextDose → query insight → render InsightCard. Checkpoint: diagrama de 4 estados (D0 sem dose, D0 com dose mas onboarding insight, D1+ com dose, D1+ vazio sem insight do dia).
2. **Persistir plano** com `superpowers:writing-plans`.
3. **Rodar `grill-with-docs`** contra CONTEXT.md + ADRs 0001/0002. Confirmar que terminologia ("insight do dia", "próxima dose", "memória do tratamento") está alinhada com glossário. Atualizar CONTEXT.md se aparecer termo novo.
4. **Criar hook compartilhado** `hooks/useOnboardingInsightFromDB.ts` — lê `educational_insights.context.output` (jsonb, contrato D015) filtrando `trigger_source = 'onboarding'`. Retorna `OnboardingInsightContract | null`. Checkpoint: Léo aprova superfície da API.
5. **Refatorar `NextDoseCard`** — 2 modos via prop `state`: `'empty'` (usado pelo `EmptyDoseStateCard` quando D0) ou `'preenchido'` (Number-First D1+). NextDoseCard preenchido renderiza `dias até próxima dose` em 48pt Vital Mint.
6. **Criar `EmptyDoseStateCard`** — Surface elevated, headline "Comece sua jornada", body "Registre sua primeira dose pra começar a memória do tratamento.", CTA "Registrar dose" Vital Mint que abre `/dose/registrar`.
7. **Refatorar `InsightCard`** — aceitar prop `source: 'onboarding' | 'daily'`. Quando `'onboarding'` (D0), lê do hook novo + renderiza `shortInsight` + `nextStep`. Quando `'daily'` (D1+), comportamento atual (Movimento 1). Sem paywall.
8. **Refatorar `app/(tabs)/index.tsx`** — lógica de switch: se `doseSummary.lastDoseId == null` → renderiza `<EmptyDoseStateCard />` + `<InsightCard source='onboarding' />`; senão → `<NextDoseCard state='preenchido' />` + `<InsightCard source='daily' />`. Greeting mantido.
9. **Validar com `react-native-devtools-mcp`**:
   - Conta D0: `leonardo-d0@teste.com` (criar via Supabase MCP se não existir) — login → screenshot `home-d0-empty.png`
   - Conta D1: `leonardo-d1@teste.com` com 1 dose registrada — screenshot `home-d1-com-dose.png`
   - Conta D7: `leonardo-d7@teste.com` em tratamento ativo — screenshot `home-d7-meio-tratamento.png`
10. **Rodar `/impeccable critique`** e `/impeccable detect`. Iterar até score ≥ 32/40.
11. **Rodar `security-review`** — confirmar RLS em `educational_insights` (user_id = auth.uid()) e que cliente não usa service_role.
12. **Abrir PR** `feature/32-home-continuidade-d0-d1` com título `feat(home): continuidade D0/D1 + Number-First + EmptyDoseStateCard` + body referenciando §5 do `08-direcao-visual` + 3 screenshots reais.

### C) Riscos identificados

| Risco | Severidade | Mitigação |
|---|---|---|
| Hook novo `useOnboardingInsightFromDB` duplicar leitura com `useOnboardingInsight` (do Result) | Alta | Hook do Result usa Edge Function (geração); hook novo da Home lê DB. APIs separadas, dados compatíveis (ambos retornam `OnboardingInsightContract`) |
| Insight do onboarding ausente no banco quando usuário V4 migra | Média | Fallback estático no `InsightCard` quando `useOnboardingInsightFromDB` retorna null. Não navegar pra Result da onboarding |
| RLS quebrar leitura de `educational_insights` | Média | `security-review` etapa 11 valida. Se faltar policy, criar via migration MCP |
| Number-First de `dias até dose` quando dose é hoje (0 dias) | Média | Copy específico: "Hoje" em 48pt Vital Mint em vez de "0" |
| Number-First quando dose já passou (overdue) | Alta | Estado `overdue` herdado de PR #12 — número negativo NÃO usado. Em vez disso, badge vermelho + copy "Atrasada por N dias" sem Number-First |
| Premium aparecer indiretamente via gate de outro componente | Média | Grep `Premium\|paywall\|RevenueCat` no `app/(tabs)/index.tsx` pós-refator deve retornar 0 ocorrências |
| Greeting + InsightCard juntos passarem do scroll inicial | Baixa | Layout testado nos 3 screenshots |
| Vital Mint aparecer em mais de 1 lugar simultâneo | Baixa | Em D0: só no CTA do EmptyDoseStateCard. Em D1+: só no hero number do NextDoseCard. Validar visual |

### D) Arquivos que vai criar/editar

| Arquivo | Ação | Resumo |
|---|---|---|
| `app/(tabs)/index.tsx` | editar | Switch D0/D1+ + cleanup imports. ≤30 linhas alteradas |
| `components/home/NextDoseCard.tsx` | editar | Prop `state` + modo Number-First D1+. ≤80 linhas alteradas |
| `components/home/InsightCard.tsx` | editar | Prop `source: 'onboarding' \| 'daily'` + remover paywall. ≤50 linhas alteradas |
| `components/home/EmptyDoseStateCard.tsx` | criar | Surface elevated + CTA Vital Mint. ~60 linhas |
| `hooks/useOnboardingInsightFromDB.ts` | criar | Lê `educational_insights.context.output` filtrando onboarding. ~50 linhas |
| `docs/superpowers/plans/2026-05-21-home-continuidade-d0-d1.md` | criar | Plano persistido |
| `assets/screenshots/2026-05-21-prompt32/home-d0-empty.png` | criar | D0 |
| `assets/screenshots/2026-05-21-prompt32/home-d1-com-dose.png` | criar | D1 |
| `assets/screenshots/2026-05-21-prompt32/home-d7-meio-tratamento.png` | criar | D7 |
| `CONTEXT.md` | editar (talvez) | Termo "insight do dia" + "empty state da dose" se faltar |

**Não tocar em:**
- Onboarding (todos os arquivos em `app/(onboarding)/`)
- Tab bar / navegação (`app/(tabs)/_layout.tsx`)
- Edge Functions
- RevenueCat config (paywall fora desse prompt)

### E) Como vai validar

- [ ] `npx tsc --noEmit` PASS
- [ ] `npm run lint` PASS
- [ ] Greps de segurança pós-implementação retornam 0:
  - `grep -r "SURMOUNT\|SURPASS\|STEP" components/home/` (D015)
  - `grep -r "Premium\|paywall\|RevenueCat" app/\(tabs\)/index.tsx components/home/` (sem upsell na Home)
  - `grep -r "GlassView\|BlurView" components/home/` (sem glass em conteúdo)
  - `grep -rn "colors.brand" components/home/ | wc -l` ≤ 2 (Vital Mint Rarity)
- [ ] Screenshot D0 mostra: greeting + EmptyDoseStateCard com CTA + InsightCard onboarding
- [ ] Screenshot D1 mostra: greeting + NextDoseCard Number-First (Vital Mint no hero) + InsightCard daily
- [ ] Screenshot D7 mostra: mesma estrutura do D1 com dados ativos
- [ ] Console limpo durante navegação Home → Doses → Home
- [ ] `/impeccable critique` score ≥ 32/40
- [ ] `/impeccable detect` zero achados
- [ ] `security-review` PASS (RLS em `educational_insights`)
- [ ] Aprendizado #N+1 em `docs/learnings.md` (reaproveitamento de contrato D015 na Home)

### F) Otimização de tokens

Arquivos prováveis acima de 200 linhas (usar `rtk read`):
- `app/(tabs)/index.tsx` (verificar)
- `lib/supabase/queries/insights.ts` (~150 linhas estimado)
- `docs/PRODUCT.md` (~600 linhas — `rtk read` obrigatório)
- `docs/DESIGN.md` (~800 linhas — `rtk read` obrigatório)

Greps grandes (resultado >50 linhas): usar `rtk grep`.

---

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.

---

## Diagnóstico técnico (informação pra acelerar o plano)

### Reaproveitamento do contrato D015

O PR #36 estabeleceu `OnboardingInsightContract` em `types/api.ts` + persistência híbrida (ADR 0002) salvando o contrato completo em `educational_insights.context.output` (jsonb). A Home D0 deve ler **direto do DB**, não chamar a Edge Function de novo (custo desnecessário + onboarding já gerou).

Query esperada no hook novo:

```typescript
const { data: row } = await supabase
  .from('educational_insights')
  .select('context')
  .eq('user_id', user.id)
  .eq('trigger_source', 'onboarding')
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle()

const contract = row?.context?.output as OnboardingInsightContract | undefined
return onboardingInsightContractSchema.safeParse(contract).data ?? null
```

Validação Zod garante que dado corrompido no DB não quebra UI.

### Switch D0 vs D1+ na Home

Proposta lógica em `app/(tabs)/index.tsx`:

```typescript
const hasDose = doseSummary?.lastDoseAt != null
const onboardingInsight = useOnboardingInsightFromDB()
const dailyInsight = useDailyInsight()  // já existe

return (
  <View>
    <GreetingHeader name={firstName} />
    {hasDose ? (
      <NextDoseCard state="preenchido" summary={doseSummary} />
    ) : (
      <EmptyDoseStateCard onPressRegister={() => router.push('/dose/registrar')} />
    )}
    <InsightCard
      source={hasDose ? 'daily' : 'onboarding'}
      onboarding={onboardingInsight}
      daily={dailyInsight}
    />
  </View>
)
```

Linhas: ≤25.

### Number-First no NextDoseCard D1+

Wireframe §5.3:

```
Number: dias-até-dose (48pt Vital Mint, ex: "7")
Label: "dias até sua próxima dose" (15pt text-secondary)
Separator: ── (8pt)
Medicação: "Mounjaro · 5 mg" (17pt)
Data: "Quarta-feira, 27/05" (13pt text-secondary)
```

Quando `daysUntilDose === 0` → renderiza "Hoje" em vez de "0". Vital Mint preservado.

---

## Pós-PR (entra em `docs/learnings.md` como aprendizado N+1)

```
#N — 2026-05-21 — Contrato D015 reaproveitado na Home sem chamar Edge Function de novo.
Leitura direta de `educational_insights.context.output` (jsonb) via hook + validação Zod
economiza ~$0.003 por sessão e ~3s de cold start. Padrão aplicável: qualquer tela
que mostre conteúdo já gerado deve ler do DB, não da Edge Function. Edge Function só
pra gerar; DB pra reaproveitar.
```

---

**Fim do Prompt 32.**
