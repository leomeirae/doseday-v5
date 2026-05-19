# Prompt 17-MID-tela-relatorios-v1

**Branch:** `feature/17-tela-relatorios-v1`
**Modelo recomendado:** Sonnet (decisões de design com 4 tipos de gráfico + queries agregadas Supabase + edge cases vazios)
**Pré-requisito:** Prompts 16, 18 e 19 mergeados (IA Movimento 1, Perfil V2 LGPD, Liquid Glass). `react-native-gifted-charts`, `expo-linear-gradient`, `react-native-svg` instalados.

---

## Contexto

A tab Relatórios hoje é placeholder. Esta tela é onde a Mariana **revisa o tratamento ao longo do tempo** — peso evoluindo, doses aderidas, sintomas recorrentes, taxa de aderência. É o que ela mostra pro médico na consulta seguinte.

**Posicionamento:** premium-grade. V5 não é V1 — esta tela tem que **impressionar visualmente** desde o primeiro tap. Gráficos animados, gradient fills, layout sofisticado.

### Decisão de lib (revisada — Karpathy Think Before Coding)

Recharts é **WEB-only** (SVG via DOM, não funciona em React Native). **Lib correta:** `react-native-gifted-charts` v1.4.76.

| Item | Detalhe |
|---|---|
| Lib principal | `react-native-gifted-charts` (Bar/Line/Area/Pie/Donut/Stacked/Radar/Bubble/Scatter, 2D + 3D + gradient + animação + live updates) |
| Peer deps | `expo-linear-gradient` + `react-native-svg` (instalados) |
| Skia | **NÃO obrigatório** (peer dep do gifted-charts é apenas SVG + linear-gradient) |
| Compatível com | React 19, RN 0.81, Expo SDK 54 ✅ |

**Aprendizado a registrar:** `Recharts é WEB-only — não usar em RN. Lib correta pra V5: react-native-gifted-charts.`

### Schema confirmado via MCP (Prompt 16+18 leituras)

| Tabela V4 | Uso no Prompt 17 |
|---|---|
| `weight_logs` | Peso ao longo do tempo (line chart) — 13 registros V4 (poucos no Leonardo — fixtures podem ajudar) |
| `medication_applications` | Doses aplicadas (bar chart) — 23 registros V4 (4 Leonardo) |
| `quick_logs` + `daily_checkins.symptoms` | Distribuição de sintomas (donut) — sintomas agregados |
| `medical_reports` | Relatórios médicos gerados (84 V4) — **futuro: listar relatórios PDF gerados, V2+** |

`medical_reports` NÃO entra no V1 — fica como nota "Em breve: relatórios PDF para imprimir e levar ao médico" (CTA placeholder visível, sem ação funcional ainda).

---

## Tarefa

Substituir placeholder `app/(tabs)/relatorios.tsx` por tela funcional com **4 gráficos premium**, lendo dados reais. Padrão visual: cards `bgElevated` + tonal layering (sem Glass — regra 30%).

### 4 gráficos previstos

| # | Gráfico | Tipo | Fonte | Periodicidade |
|---|---|---|---|---|
| 1 | **Peso ao longo do tempo** | LineChart com gradient fill | `weight_logs` | Últimos 90 dias |
| 2 | **Doses aplicadas (vs puladas se houver)** | BarChart (single ou stacked) | `medication_applications` | Últimas 8 semanas (semanal) |
| 3 | **Distribuição de sintomas** | DonutChart | `quick_logs.log_type` + `daily_checkins.symptoms` | Últimos 30 dias |
| 4 | **Aderência ao tratamento** | Progress Ring | `medication_applications` / `days_until_next_dose` | Acumulado treatment_start_date |

### Estrutura de arquivos

```
lib/supabase/queries/
└── reports.ts                          ← NOVO (4 queries agregadas)

hooks/
├── useWeightHistory.ts                 ← NOVO
├── useDoseAdherence.ts                 ← NOVO
└── useSymptomDistribution.ts           ← NOVO

components/relatorios/
├── WeightChartCard.tsx                 ← NOVO (LineChart + Δ peso atual vs inicial)
├── DoseAdherenceCard.tsx               ← NOVO (BarChart + label de aderência)
├── SymptomDistributionCard.tsx         ← NOVO (DonutChart + legenda)
├── AdherenceRingCard.tsx               ← NOVO (Progress ring + % aderência)
└── ChartEmptyState.tsx                 ← NOVO (estado vazio com ícone + texto)

components/ui/
└── SectionHeader.tsx                   ← REUSAR (já existe)

app/(tabs)/relatorios.tsx               ← MODIFICAR (substituir placeholder)
```

### 1. Queries — `lib/supabase/queries/reports.ts`

```typescript
import { supabase } from '@lib/supabase/client'

// ── Weight history ─────────────────────────────────────────────

export type WeightPoint = {
  date: Date
  weight: number
  notes: string | null
}

export async function getWeightHistory(userId: string, daysBack: number = 90): Promise<WeightPoint[]> {
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('weight_logs')
    .select('weight, date, notes')
    .eq('user_id', userId)
    .gte('date', since)
    .order('date', { ascending: true })
  if (error) throw error
  return (data ?? []).map((r) => ({
    date: new Date(r.date),
    weight: Number(r.weight),
    notes: r.notes,
  }))
}

// ── Dose adherence (semanal) ────────────────────────────────────

export type DoseWeek = {
  weekStart: Date         // segunda-feira da semana
  applied: number          // doses aplicadas naquela semana
}

export async function getDoseHistoryByWeek(userId: string, weeksBack: number = 8): Promise<DoseWeek[]> {
  const since = new Date(Date.now() - weeksBack * 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('medication_applications')
    .select('application_date')
    .eq('user_id', userId)
    .gte('application_date', since)
    .order('application_date', { ascending: true })
  if (error) throw error

  // Agrupar por semana (Mon-Sun)
  const buckets = new Map<string, DoseWeek>()
  for (const row of data ?? []) {
    const d = new Date(row.application_date)
    const monday = new Date(d)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day
    monday.setDate(d.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    const key = monday.toISOString().slice(0, 10)
    if (!buckets.has(key)) {
      buckets.set(key, { weekStart: monday, applied: 0 })
    }
    buckets.get(key)!.applied += 1
  }
  return Array.from(buckets.values()).sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
}

// ── Symptom distribution (últimos 30 dias) ──────────────────────

export type SymptomCount = {
  type: string             // 'nausea' | 'fatigue' | ... (compat com QuickLogType)
  count: number
}

export async function getSymptomDistribution(userId: string, daysBack: number = 30): Promise<SymptomCount[]> {
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString()
  // Quick logs
  const { data: qlData, error: qlErr } = await supabase
    .from('quick_logs')
    .select('log_type')
    .eq('user_id', userId)
    .gte('logged_at', since)
  if (qlErr) throw qlErr

  // Daily checkins symptoms (array)
  const { data: ckData, error: ckErr } = await supabase
    .from('daily_checkins')
    .select('symptoms')
    .eq('user_id', userId)
    .gte('date', since.slice(0, 10))
  if (ckErr) throw ckErr

  const counts = new Map<string, number>()
  for (const r of qlData ?? []) {
    counts.set(r.log_type, (counts.get(r.log_type) ?? 0) + 1)
  }
  for (const r of ckData ?? []) {
    for (const s of r.symptoms ?? []) {
      counts.set(s, (counts.get(s) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

// ── Aderência ───────────────────────────────────────────────────

export type AdherenceStats = {
  startDate: Date | null
  totalExpected: number     // doses esperadas desde treatment_start_date
  totalApplied: number      // doses aplicadas
  percentage: number        // 0-100
}

export async function getAdherenceStats(userId: string): Promise<AdherenceStats> {
  // Lê profile pra treatment_start_date
  const { data: profileData, error: profErr } = await supabase
    .from('user_profiles')
    .select('treatment_start_date')
    .eq('user_id', userId)
    .maybeSingle()
  if (profErr) throw profErr
  const startDate = profileData?.treatment_start_date ? new Date(profileData.treatment_start_date) : null
  if (!startDate) {
    return { startDate: null, totalExpected: 0, totalApplied: 0, percentage: 0 }
  }

  // Conta doses aplicadas desde start
  const { count, error: countErr } = await supabase
    .from('medication_applications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('application_date', startDate.toISOString())
  if (countErr) throw countErr

  // Doses esperadas (semanal): semanas decorridas desde start
  const weeksElapsed = Math.floor((Date.now() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
  const totalExpected = Math.max(1, weeksElapsed)
  const totalApplied = count ?? 0
  const percentage = Math.min(100, Math.round((totalApplied / totalExpected) * 100))

  return { startDate, totalExpected, totalApplied, percentage }
}
```

### 2. Hooks React Query

Padrão equivalente aos hooks anteriores (`useProfile`, `useDoseSummary`, etc):

- `hooks/useWeightHistory.ts` — `useQuery({ queryKey: ['weightHistory', userId], ... })`
- `hooks/useDoseAdherence.ts` — combina `getDoseHistoryByWeek` + `getAdherenceStats` em 1 hook
- `hooks/useSymptomDistribution.ts` — `useQuery` simples
- `staleTime: 10min` (dados clínicos não mudam rápido)

### 3. Componentes — gráficos premium

Cada card segue padrão:
- Container `bgElevated` + border `0.5px rgba(255,255,255,0.06)` + `radius.lg` + `padding.lg`
- Header: subtitle (typography.subtitle, textSecondary) + opcional "Últimos N dias" caption
- Gráfico animado com `gifted-charts`
- **Vital Mint Rarity**: brand color SOMENTE no Δ peso atual vs inicial (Number-First Rule no peso) OU no anel de aderência se ≥80%. NÃO no fill dos charts (seria saturação)

**WeightChartCard** — LineChart com gradient fill:

```typescript
<LineChart
  data={weightHistory.map((p) => ({
    value: p.weight,
    label: format(p.date, 'd/MM', { locale: ptBR }),
  }))}
  color={colors.semanticInfo}              // azul-grafite — leitura clínica, NÃO brand
  areaChart                                 // gradient fill
  startFillColor={colors.semanticInfo}
  endFillColor={colors.bgBase}
  startOpacity={0.3}
  endOpacity={0.05}
  thickness={2}
  curved
  hideRules
  yAxisColor={colors.textTertiary}
  xAxisColor={colors.textTertiary}
  yAxisTextStyle={{ color: colors.textSecondary, ...typography.caption }}
  xAxisLabelTextStyle={{ color: colors.textSecondary, ...typography.caption }}
  noOfSections={4}
  isAnimated
  animationDuration={800}
/>
```

**Acima do gráfico**, mostrar peso atual + delta:
- Peso atual em `typography.numberLarge` (e.g. "78.4 kg")
- Delta: "−6.6 kg desde o início" em caption `semanticPositive` se perdeu, `semanticWarning` se ganhou

**DoseAdherenceCard** — BarChart:

```typescript
<BarChart
  data={doseHistory.map((w) => ({
    value: w.applied,
    label: format(w.weekStart, 'dd/MM', { locale: ptBR }),
    frontColor: colors.semanticInfo,
    topLabelComponent: w.applied > 0 ? () => <Text>{w.applied}</Text> : undefined,
  }))}
  barWidth={22}
  spacing={14}
  roundedTop
  hideRules
  yAxisTextStyle={{ color: colors.textSecondary }}
  xAxisLabelTextStyle={{ color: colors.textSecondary }}
  noOfSections={3}
  maxValue={2}                   // doses esperadas por semana (ajustar dinâmico futuro)
  isAnimated
  animationDuration={800}
/>
```

**SymptomDistributionCard** — DonutChart:

```typescript
<PieChart
  donut
  innerRadius={50}
  data={symptomDistribution.slice(0, 5).map((s, i) => ({
    value: s.count,
    color: SYMPTOM_COLORS[i],
    text: `${s.count}`,
  }))}
  centerLabelComponent={() => (
    <View>
      <Text style={typography.numberMedium}>{total}</Text>
      <Text style={typography.caption}>registros</Text>
    </View>
  )}
/>
```

`SYMPTOM_COLORS`: 5 cores semânticas (NÃO brand): `clinicalMild`, `clinicalModerate`, `clinicalSevere`, `semanticInfo`, `textTertiary`. Legenda lateral lista nome+contagem.

**AdherenceRingCard** — Progress Ring (gifted-charts não tem progress ring nativo — usar `react-native-svg` circle simples):

```typescript
import Svg, { Circle } from 'react-native-svg'
// progress ring custom em ~30 linhas (radius 60, strokeWidth 8, dasharray calculado)
// Center: percentage (numberLarge) + caption "aderência"
// stroke: colors.brand SE percentage >= 80, semanticInfo se entre 50-79, semanticWarning se <50
```

Aderência ≥80% = Vital Mint brand (raridade — só ativa em desempenho excepcional). É a única aplicação de brand em todo o Prompt 17.

### 4. Tela `app/(tabs)/relatorios.tsx`

Layout vertical com 4 cards em ScrollView + 1 footer placeholder pra `medical_reports`:

```
┌────────────────────────────────────┐
│ Relatórios                         │ ← typography.headline
│                                    │
│ ┌──────────────────────────────┐   │
│ │ Peso                          │   │
│ │                               │   │
│ │ 78.4 kg                       │   │ ← numberLarge, textPrimary
│ │ −6.6 kg desde o início        │   │ ← caption, semanticPositive
│ │                               │   │
│ │ [Line chart 90 dias]          │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ Doses aplicadas               │   │
│ │ Últimas 8 semanas             │   │
│ │                               │   │
│ │ [Bar chart]                   │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ Sintomas                      │   │
│ │ Últimos 30 dias               │   │
│ │                               │   │
│ │ [Donut chart]    [Legenda]    │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ Aderência                     │   │
│ │                               │   │
│ │     ╭─────╮     8 de 10       │   │
│ │     │ 80% │     doses          │   │
│ │     ╰─────╯                   │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ Relatórios médicos            │   │
│ │ Em breve: gere PDF pra        │   │ ← placeholder V2
│ │ levar à consulta              │   │
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

### Estados especiais por card

| Estado | Render |
|---|---|
| Loading | Skeleton (View bgSurface com altura aproximada do chart) |
| Error | `ChartEmptyState` com ícone `exclamationmark.triangle` + texto + retry |
| Empty (zero dados) | `ChartEmptyState` com mensagem específica: "Registre seu peso pra ver a evolução aqui" / "Suas doses vão aparecer aqui" / "Sintomas começam a aparecer com a 1ª semana" |

---

## Skills obrigatórias

| Skill | Por quê |
|---|---|
| `react-native-best-practices` | Hooks, performance de gráficos, SafeAreaView + ScrollView |
| `supabase-postgres-best-practices` | Queries agregadas, indices em `(user_id, date)`, `head:true` em count |
| `data:create-viz` | Decisão de tipo de gráfico vs dados (line p/ contínuo, bar p/ discreto, donut p/ proporção, ring p/ %) |
| `data:data-visualization` | Princípios de chart design — color theory, acessibilidade, legibilidade |
| `/impeccable craft` | Hierarquia visual, gradient sutil, animations |
| `/impeccable harden` | Edge cases: zero dados, 1 ponto único, períodos sem registro, dados outliers |
| `superpowers:writing-plans` | **OBRIGATÓRIO** salvar plano em `docs/superpowers/plans/2026-05-19-tela-relatorios-v1.md` antes de tocar em código (regra 21) |

---

## Validação automatizada via `react-native-devtools-mcp`

### Pré-condição — popular fixtures

Leonardo tem poucos dados clínicos (1 peso, 4 doses, 0 quick_logs). **Pra testar gráficos cheios**, popular fixtures via SQL antes:

```sql
-- 12 weight_logs (últimos 90 dias, perdendo peso gradualmente)
INSERT INTO weight_logs (user_id, weight, date) VALUES
  ('7f42257c-...', 85.0, CURRENT_DATE - 90),
  ('7f42257c-...', 84.2, CURRENT_DATE - 80),
  -- ... 10 mais até 78.4 hoje
;

-- 5 quick_logs (sintomas variados)
INSERT INTO quick_logs (user_id, log_type, intensity, logged_at) VALUES
  ('7f42257c-...', 'nausea', 2, NOW() - INTERVAL '5 days'),
  ('7f42257c-...', 'fatigue', 1, NOW() - INTERVAL '8 days'),
  -- ...
;
```

### Bateria (12 testes)

| # | Ação | Tool | Critério |
|---|---|---|---|
| 1 | Popular fixtures via SQL | `mcp__supabase__execute_sql` | ≥10 weight_logs, ≥5 quick_logs |
| 2 | Cold start + signin Leonardo | `tap` + `type_text` (3 fragmentos) | Home renderiza |
| 3 | Navegar tab Relatórios | `tap` | 4 cards visíveis |
| 4 | Screenshot tela completa | `screenshot` + scroll | Todos os 4 cards renderizam com dados |
| 5 | A11y geral | `get_view_hierarchy` | Cards com `accessibilityLabel` agrupado descrevendo o gráfico |
| 6 | WeightChart com gradient visível | `screenshot` close-up | Gradient fill semanticInfo→bgBase, linha curva |
| 7 | DoseAdherence bars com labels | `screenshot` | Bars verticais com count no topo |
| 8 | SymptomDistribution donut | `screenshot` | Centro mostra total + "registros", segmentos coloridos |
| 9 | AdherenceRing percentage | `screenshot` | % no centro + cor brand se ≥80%, info se 50-79, warning se <50 |
| 10 | Empty state (delete all weight_logs temp) | `screenshot` | Card mostra ChartEmptyState com mensagem |
| 11 | Restaurar fixtures | `execute_sql DELETE` + INSERT | Estado original recuperado |
| 12 | Performance — scroll fluido | `scroll` + `screenshot` durante | Sem stuttering, animações suaves |

### Greps técnicos

```bash
npm run type-check    # 0 erros
npm run lint          # 0 erros novos

# Vital Mint Rarity — brand SÓ no AdherenceRing
grep -rn "colors\.brand" components/relatorios/
# Esperado: aparece SOMENTE em AdherenceRingCard.tsx (1 ocorrência, condicional ≥80%)

# Recharts NÃO importado em lugar nenhum
grep -rn "recharts\|from 'recharts'" .
# Esperado: vazio

# gifted-charts usado nos 3 charts (não no Ring que é SVG puro)
grep -rn "from 'react-native-gifted-charts'" components/relatorios/
# Esperado: 3 ocorrências (WeightChartCard, DoseAdherenceCard, SymptomDistributionCard)

# Zero hex hardcoded
grep -rE "#[0-9A-Fa-f]{6}" components/relatorios/
# Esperado: vazio
```

---

## Karpathy self-tests (declarar no plano antes do `ok`)

### Think Before Coding — assumptions
1. **Recharts é WEB-only.** Confirmado via pesquisa. Lib correta: `react-native-gifted-charts`. **Erro registrado em architecture.md como cautionary tale.**
2. **Skia NÃO é peer dep** do gifted-charts (peer deps: svg + linear-gradient apenas). Confirmado via npm
3. **Vital Mint Rarity preservado** — brand SOMENTE em `AdherenceRingCard` quando `>= 80%`. Charts usam `semanticInfo` (azul-grafite — leitura clínica) ou cores semânticas/clinicais
4. **Aderência calculada como** `(applied since treatment_start) / weeks_elapsed`. Doses esperadas = 1 por semana (default). Se profile.treatment_start_date null → mostrar "Defina sua data de início no perfil"
5. **medical_reports tabela NÃO entra no V1** — apenas placeholder no rodapé "Em breve"

### Simplicity First
- ~400 linhas total (4 cards + 4 queries + 3 hooks + 1 empty state + tela)
- Sem retry no cliente
- Sem cache complexo (staleTime 10min suficiente)
- Sem agregação em tempo real (queries em chunks)
- Sem feature toggle por user (todos veem os 4 cards iguais)

### Surgical Changes
- Modifica APENAS `app/(tabs)/relatorios.tsx` (substituição)
- Outras tabs INTOCADAS
- Tokens INTOCADOS
- Componentes existentes (SectionHeader, etc) reusados, não modificados

### Goal-Driven Execution
- 12 testes MCP com critérios verificáveis
- Confirmação visual via screenshots de cada card
- Performance medida via scroll smooth

---

## Critérios de aceitação

- [ ] `lib/supabase/queries/reports.ts` criado com 4 queries agregadas
- [ ] 3 hooks React Query (`useWeightHistory`, `useDoseAdherence`, `useSymptomDistribution`) + 1 hook combinado se fizer sentido
- [ ] 5 componentes em `components/relatorios/` (WeightChartCard, DoseAdherenceCard, SymptomDistributionCard, AdherenceRingCard, ChartEmptyState)
- [ ] `app/(tabs)/relatorios.tsx` substituído por tela funcional com 4 cards + footer placeholder
- [ ] **Vital Mint Rarity preservado**: `colors.brand` SOMENTE em `AdherenceRingCard.tsx` condicional `>= 80%`. Zero em outros componentes
- [ ] Charts animados (`isAnimated` + `animationDuration: 800`)
- [ ] Gradient fill no WeightChart usando `expo-linear-gradient` (via gifted-charts areaChart)
- [ ] Empty states específicos por card (não genérico)
- [ ] Loading skeletons (não ActivityIndicator genérico — usar bgSurface View com altura aproximada do chart)
- [ ] Zero `as any` / `// @ts-ignore`
- [ ] Zero hex hardcoded (`grep #` vazio em components/relatorios)
- [ ] `npm run type-check` zero erros
- [ ] `npm run lint` zero erros novos
- [ ] Bateria 12 testes MCP executada
- [ ] **5 screenshots REAIS** no PR (commit SHA na URL — padrão Codex PR #20):
  1. Tela completa scroll-up (4 cards visíveis)
  2. WeightChart close-up (gradient fill + delta peso)
  3. DoseAdherenceCard close-up (bars + labels)
  4. SymptomDistributionCard close-up (donut + legenda)
  5. AdherenceRingCard close-up (ring com %)
- [ ] `/impeccable critique` ≥ 28/40
- [ ] **Plano salvo em `docs/superpowers/plans/2026-05-19-tela-relatorios-v1.md` ANTES de executar** (regra 21)
- [ ] Fixtures de teste DELETADAS pós-validação (popular pra testar, deletar pra deixar estado original)
- [ ] **Aprendizado registrado em `docs/architecture.md`:** "Recharts é WEB-only — não usar em React Native. Lib certa pra RN: `react-native-gifted-charts` (peer deps: svg + linear-gradient). Skia é opcional pra animações avançadas, não obrigatório."
- [ ] Commit: `feat(relatorios): tela Relatórios V1 com 4 gráficos premium (gifted-charts)`
- [ ] PR aberto via MCP github

---

## Restrições

- **Sem Recharts** (web-only — confirmado)
- **Sem `react-native-skia`** neste prompt (não necessário; pode entrar em V2 pra animações avançadas)
- **Sem `medical_reports` no V1** — apenas placeholder "Em breve" no rodapé
- **Sem CSV/PDF export** — V2+ (Prompt 21+)
- **Sem filtros de período por usuário** — V1 usa períodos fixos (90/30/8 semanas/treatment)
- **Sem `colors.brand` fora do AdherenceRing condicional** (Vital Mint Rarity)
- **Sem glass em cards de relatórios** (regra 30% Glass — só navegação)
- **Sem mudanças em** `lib/theme/tokens.ts`, infra auth, outras tabs, Diário, Dose, Perfil, Home

---

## Antes de executar

1. Ler `CLAUDE.md` (regras 14, 20, 21, 22 Karpathy)
2. Ler `docs/architecture.md` seções 14.x e 15 + aprendizados 20-39
3. Ler `docs/DESIGN.md` Named Rules (Vital Mint Rarity, Number-First, 30% Glass)
4. Ler `lib/supabase/queries/{doses,profile}.ts` (padrões a seguir)
5. Ler `hooks/useDoseSummary.ts` (padrão React Query a replicar)
6. Confirmar via `ping` que simulador booted
7. Confirmar via SQL: `SELECT COUNT(*) FROM weight_logs WHERE user_id = '7f42257c-...'` (espera 1 ou poucos)
8. **Popular fixtures** ANTES da bateria MCP (10+ weight_logs, 5+ quick_logs, mais doses_applications se possível)
9. Credenciais teste: `leonardo@teste.com` / `123456`

## Pós-execução

1. Rodar `/impeccable critique` na tela Relatórios scroll completo
2. Rodar `/impeccable harden` (empty states, 1 ponto único, outliers, network drop)
3. Resolver P1/P2 antes do commit
4. **DELETAR fixtures populadas** pós-validação (deixar estado original do Leonardo)
5. 5 screenshots reais via MCP no PR (commit SHA na URL)
6. Atualizar `docs/architecture.md`:
   - Novo aprendizado: Recharts vs gifted-charts (cautionary tale)
   - Novo aprendizado: padrão de query agregada em chunks (semanal/30d/90d) com Date math no client
7. Atualizar `CLAUDE.md` tabela "Histórico"
8. PR description deve incluir:
   - "Tela Relatórios V1 com 4 gráficos premium"
   - 5 screenshots reais
   - Aprendizados (especialmente Recharts vs gifted-charts)
   - Pendências: PDF export, filtros customizáveis, integração `medical_reports`
