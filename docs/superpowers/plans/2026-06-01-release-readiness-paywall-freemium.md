# Plano — Reta final: Paywall + Freemium (Fase 1, sem SDK nativo)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para implementar este plano task-by-task. Steps usam checkbox (`- [ ]`).

**Data:** 2026-06-01
**Status:** ✅ APROVADO POR LÉO (2026-06-01) — em execução. Subfases 1-4 nesta entrega; Subfase 5 aguarda novo "ok".
**Brief:** `docs/release/2026-06-01-reta-final-brief.md`
**Branch:** `feature/paywall-freemium-fase1` (base `origin/main` = `1564344`, inclui #102)

**Goal:** Entregar a experiência completa freemium/premium (paywall UI + entitlement central + gating) validável hoje com mock dev-only, deixando a "costura" pronta pra trocar o mock pelo RevenueCat SDK na Fase 2 — sem instalar nada nativo nesta fase.

**Arquitetura:** Um único `SubscriptionProvider` (padrão idêntico ao `AuthContext`) expõe `useEntitlements()` como fonte ÚNICA de "é premium?". Telas premium consomem só esse hook — nunca RevenueCat, nunca `isPremium` espalhado. O mock dev-only vive DENTRO do provider, atrás de guard `__DEV__` duplo + função pura testada em unit test. Na Fase 2, o RevenueCat entra no provider e nenhum consumidor muda.

**Stack:** Expo Router (rota nova `/paywall` como formSheet) · Context API (provider) · NativeWind v4 + react-native-reusables (UI nova, padrão do `HomeV7Content`) · AsyncStorage (persistência do mock dev) · i18next (namespace `subscription` já registrado) · Jest (teste do guard).

---

## 1. O que JÁ existe (confirmado no código em 2026-06-01)

| Item | Onde | Estado |
|---|---|---|
| Welcome | `app/(welcome)/index.tsx` + `locales/pt-BR/welcome.json` | ✅ Pronto. Headline "Sua memória do tratamento." + botões Criar conta / Já tenho conta |
| Auth | `app/(auth)/{signin,signup,recover}.tsx` | ✅ Prontos |
| Roteamento install limpo → welcome → auth → onboarding → tabs | `app/_layout.tsx:49-144` (`AuthGuard` + `hasSeenWelcome`) | ✅ Funciona. Critério "install limpo mostra welcome" já é atendido |
| Padrão de provider | `contexts/AuthContext.tsx` (45 linhas) | ✅ Modelo a copiar pro `SubscriptionContext` |
| Copy de paywall i18n | `locales/{pt-BR,en,es}/subscription.json` + namespace registrado em `lib/i18n/index.ts:18,37,56` | ⚠️ Existe mas precisa de limpeza (ver Riscos #4) |
| IA do onboarding (GRÁTIS, decisão travada) | `hooks/useOnboardingInsight.ts` → `app/(onboarding)/{loading,result}.tsx` | ✅ Funciona. NÃO gatear |
| Insight da Home (componente) | `components/home/InsightCard.tsx` (usa `useDailyInsight` + `useOnboardingInsightFromDB`) | ⚠️ Só renderiza na **LegacyHome** — ver Discrepância A |
| IA contínua (hook) | `hooks/useDailyInsight.ts` → `callMemoryDailyInsight` | ⚠️ P0-contained: retorna fallback hardcoded, não chama Edge Function (`lib/supabase/queries/insights.ts:68-71`) |
| Tela Relatórios | `app/(tabs)/relatorios.tsx` + `components/relatorios/*` (4 cards de gráfico + placeholder "Relatórios médicos: Em breve") | ⚠️ Existe mas é **órfã** — ver Discrepância B |
| Exportação LGPD (NUNCA gatear) | `hooks/useExportUserData.ts` → `app/configuracoes/dados.tsx:49,137` | ✅ Funciona. Fica intocada |
| Linha "Sua assinatura" | `app/configuracoes/conta.tsx:74-83` (value="Em breve", sem onPress) | ⚠️ Morta — vira ponto de status + abrir paywall |
| Registro básico (dose/peso/sintoma/nota/custo), Home V7, memória, lembretes, configurações | `components/home/HomeV7Content.tsx`, `app/diario/*`, `app/peso/*`, etc. | ✅ Freemium, sem parede. Ficam intocados |
| Config RevenueCat externa | `docs/architecture.md` §7: project `proj521a5bc0`, produtos `mensal_premium`/`anual_premium`, trial 14d, env `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | ✅ Existe no dashboard (Fase 2 usa) |
| Jest configurado | `package.json` ("test": "jest") + `lib/utils/__tests__/` como padrão | ✅ Pronto pro teste do guard |

## 2. O que NÃO existe (greenfield)

- `react-native-purchases` — **não será instalado nesta fase** (decisão do brief)
- `SubscriptionProvider` / `useEntitlements()` — nada
- Tela de paywall / rota `/paywall` — nada
- `lib/revenuecat/` ou `lib/subscription/` — nada
- Qualquer gating premium — zero (`grep -ri "isPremium\|entitlement" app/ components/ hooks/ contexts/` = vazio)
- Mock de entitlement — nada
- "Análise avançada do histórico" como feature — **não existe** (nada a gatear)
- "Export/compartilhar relatório inteligente" — **não existe** (placeholder "Em breve" em `relatorios.tsx:69-79`; nada a gatear)

## 3. ⚠️ Discrepâncias entre o mapa do brief e o código real

**A — "IA contínua na Home" não tem superfície viva hoje.**
A Home ativa é `HomeV7Content` (`app/(tabs)/index.tsx:15` → `ENABLE_HOME_V7 = true`) e ela **não renderiza nenhum InsightCard**. O `InsightCard` com `useDailyInsight` só existe na `LegacyHomeScreen` (caminho morto). Além disso `callMemoryDailyInsight` está P0-contained (devolve fallback fixo). Ou seja: o critério "grátis ao tocar IA → vê paywall" **não tem onde disparar** sem criarmos a superfície.

**B — Relatórios é tela órfã.**
A tab bar está `display: 'none'` (`app/(tabs)/_layout.tsx:21`) e nenhum card da Home navega pra `/(tabs)/relatorios`. Gatear uma tela inalcançável é gating de mentira.

**C — Export de relatório e análise avançada não existem.**
Nada a gatear. Ficam **fora de escopo** — quando essas features nascerem (Fase 2+), já nascem dentro do `PremiumGate`.

**Consequência:** o gating demonstrável desta fase = **Relatórios (com entry point novo na Home) + InsightCard (gate defensivo/dormente) + linha Assinatura em Configurações + teaser no result do onboarding**.

## 4. Decisões do Léo (✅ respondidas em 2026-06-01)

| # | Pergunta | Decisão do Léo |
|---|---|---|
| 1 | **Entry points na Home V7** | ✅ Adicionar atalho **Relatórios** na Home (destino premium vivo gateável). **NÃO** ressuscitar o card de Insight da home antiga |
| 2 | **CTA "Assinar" em produção (Fase 1)** | ✅ Produção = estado "estamos finalizando". Dev = ativa o mock |
| 3 | **Limpeza de copy do `subscription.json`** | ✅ Limpar agora (pt-BR): **remover** qualquer copy que trate registro básico (dose/peso/custo) como premium e o `trialExpired`/"Desbloqueie" do modelo antigo. Nada pode insinuar que registro básico expira ou é pago → a seção `blocker` inteira **sai** (não fica "intocada" como o plano original sugeria) |
| 4 | **Paywall no fluxo do onboarding** | ✅ Sheet por cima do result; fecha e continua; nunca bloqueia conclusão |
| — | **Welcome** | ✅ Manter "Sua memória do tratamento." (não trocar) |

---

## 5. Arquitetura proposta (a "costura" pro RevenueCat)

```
app/_layout.tsx
└── QueryClientProvider
    └── AuthProvider                    (existente)
        └── SubscriptionProvider        (NOVO — precisa de session? não na Fase 1; na Fase 2 usa user.id pro logIn do RevenueCat)
            └── AuthGuard               (existente)
                └── Stack
                    ├── ... rotas existentes
                    └── paywall          (NOVA — formSheet)
```

### `contexts/SubscriptionContext.tsx` (novo, ~70 linhas — espelho do AuthContext)

```tsx
import { createContext, useContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getDevEntitlementOverride, resolveEntitlement, type EntitlementSource } from '@lib/subscription/entitlement'

export type Entitlements = {
  isPremium: boolean
  isLoading: boolean
  source: EntitlementSource
  refresh: () => Promise<void>
}

const SubscriptionContext = createContext<Entitlements>({
  isPremium: false,
  isLoading: true,
  source: 'none',
  refresh: async () => {},
})

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ isPremium: false, isLoading: true, source: 'none' as EntitlementSource })

  const refresh = useCallback(async () => {
    // FASE 1: a única fonte possível é o override de dev (mock).
    // FASE 2 (RevenueCat): aqui entram Purchases.getCustomerInfo() +
    //   Purchases.addCustomerInfoUpdateListener; resolveEntitlement() passa a
    //   receber o customerInfo real e o mock vira apenas fallback de dev.
    //   NENHUM consumidor de useEntitlements() muda.
    const devOverride = await getDevEntitlementOverride()
    const resolved = resolveEntitlement({ isDevBuild: __DEV__, devOverride })
    setState({ isPremium: resolved.isPremium, isLoading: false, source: resolved.source })
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<Entitlements>(() => ({ ...state, refresh }), [state, refresh])

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useEntitlements(): Entitlements {
  return useContext(SubscriptionContext)
}
```

### `lib/subscription/entitlement.ts` (novo, ~40 linhas — guard puro + storage)

```ts
import AsyncStorage from '@react-native-async-storage/async-storage'

const DEV_PREMIUM_KEY = 'dev_entitlement_premium'

export type EntitlementSource = 'none' | 'mock-dev' // Fase 2 adiciona: 'revenuecat'

export type ResolvedEntitlement = { isPremium: boolean; source: EntitlementSource }

// Função PURA — coberta por unit test. Regra de segurança:
// fora de build dev, o mock NUNCA ativa premium. Sem exceção.
export function resolveEntitlement(input: { isDevBuild: boolean; devOverride: boolean }): ResolvedEntitlement {
  if (!input.isDevBuild) return { isPremium: false, source: 'none' }
  return input.devOverride
    ? { isPremium: true, source: 'mock-dev' }
    : { isPremium: false, source: 'none' }
}

// Guard duplo: em release nem sequer lê o storage.
export async function getDevEntitlementOverride(): Promise<boolean> {
  if (!__DEV__) return false
  const value = await AsyncStorage.getItem(DEV_PREMIUM_KEY)
  return value === 'true'
}

export async function setDevEntitlementOverride(enabled: boolean): Promise<void> {
  if (!__DEV__) return
  await AsyncStorage.setItem(DEV_PREMIUM_KEY, enabled ? 'true' : 'false')
}
```

**Por que isso é "impossível ativar em produção" (critério verificável):**
1. `resolveEntitlement` retorna `free` sempre que `isDevBuild === false` — coberto por unit test;
2. `getDevEntitlementOverride` retorna `false` antes de tocar o storage quando `!__DEV__`;
3. `__DEV__` é constante de build do Metro — em release vira `false` e o bundler elimina os branches mortos;
4. Nenhuma outra fonte de premium existe na Fase 1.

### Padrão de gating (consumidores)

```tsx
// Telas/áreas premium — ÚNICO padrão permitido:
const { isPremium, isLoading } = useEntitlements()
// free  → renderiza preview de conversão + CTA → router.push('/paywall')
// premium → renderiza o conteúdo
// NUNCA: prop drilling de isPremium, consulta direta a storage/RevenueCat, flag local
```

---

## 6. Subfases e tasks

> Granularidade: cada task é um commit. Validação (`npm run type-check && npm run lint`) roda ao fim de CADA task, não só no fim.

### Subfase 1 — Paywall UI com dados mockados

#### Task 1.1 — Limpeza da copy `subscription.json` (pt-BR) + chaves novas

**Files:**
- Modify: `locales/pt-BR/subscription.json`

- [ ] **Step 1:** Na seção `paywall` existente, remover violações de PRODUCT.md:
  - `"🧠 IA aplicada à saúde, não achismo"` → `"Padrões reais dos seus registros"` (remove emoji + copy defensiva banida)
  - `"🩺 Relatório clínico pronto..."` → `"Relatório claro pra sua consulta"` (remove emoji; "clínico pronto para o seu médico" vira linguagem de organização, não promessa médica)
  - `"📊 Acompanhamento de progresso..."` → sem emoji
  - `"MELHOR OFERTA -40%"` → `"Melhor valor"` (desconto real virá do RevenueCat na Fase 2; nunca hardcoded)
  - `"Bem-vindo ao Premium! 🎉"` → `"Premium ativo."` (sucesso afirmativo, breve — sem celebração exagerada)
  - `"Restaurar Compras"` → manter (obrigatório de compliance)
- [ ] **Step 2:** Adicionar chaves novas (mesma seção `paywall`):
  ```json
  "pricePlaceholder": "—",
  "priceFromStore": "Preço e condições exibidos pela App Store na confirmação",
  "trialNote": "14 dias grátis. Cancele quando quiser.",
  "legal": { "terms": "Termos de Uso", "privacy": "Política de Privacidade" },
  "unavailable": {
    "title": "Assinatura ainda não disponível nesta versão",
    "message": "Estamos finalizando a integração com a App Store. Seus registros continuam funcionando normalmente."
  },
  "loadError": {
    "title": "Não consegui carregar os planos",
    "message": "Verifique sua conexão e tente de novo.",
    "retry": "Tentar de novo"
  }
  ```
  E uma seção nova `gate` (copy de conversão dos pontos de gating):
  ```json
  "gate": {
    "reports": {
      "title": "Relatórios são Premium",
      "description": "Gráficos de peso, adesão às doses e distribuição de sintomas — sua memória organizada pra consulta.",
      "cta": "Conhecer o Premium"
    },
    "dailyInsight": {
      "title": "Insight diário é Premium",
      "description": "A IA organiza seus registros e devolve um resumo todo dia.",
      "cta": "Conhecer o Premium"
    },
    "resultTeaser": {
      "title": "Isso foi uma amostra",
      "description": "No Premium, o DoseDay resume seus padrões toda semana e prepara sua consulta.",
      "cta": "Ver como funciona"
    }
  }
  ```
- [ ] **Step 3:** **Remover a seção `blocker` inteira** (decisão #3 do Léo): ela é o modelo antigo de "trial expirado" que trata registro básico (dose/peso/custo) como recurso pago. Nada no código referencia `blocker.*` (verificado: `grep -rn "blocker" app/ components/ hooks/ lib/` = vazio), então a remoção é segura. Remover também `subscribe.*` se nenhum código referenciar (mesma verificação).
- [ ] **Step 4:** `npm run type-check && npm run lint` → PASS
- [ ] **Step 5:** Commit: `feat(paywall): limpa copy do subscription.json e adiciona chaves de gate`

#### Task 1.2 — Mock de offerings (placeholder de planos)

**Files:**
- Create: `lib/subscription/mockOfferings.ts`

- [ ] **Step 1:** Criar o arquivo:
  ```ts
  // PLACEHOLDER Fase 1 — espelha o shape mínimo de um offering do RevenueCat.
  // Preço NUNCA é número real: o paywall exibe pricePlaceholder + nota
  // "preço exibido pela App Store". Na Fase 2 este arquivo é substituído
  // por Purchases.getOfferings() dentro do SubscriptionProvider.
  export type PaywallPlan = {
    id: 'monthly' | 'yearly'
    titleKey: string         // ex.: 'paywall.plans.yearly'
    periodKey: string        // ex.: 'paywall.plans.perYear'
    badgeKey: string | null  // ex.: 'paywall.plans.bestOffer' (só anual)
  }

  export const MOCK_PLANS: PaywallPlan[] = [
    { id: 'yearly', titleKey: 'paywall.plans.yearly', periodKey: 'paywall.plans.perYear', badgeKey: 'paywall.plans.bestOffer' },
    { id: 'monthly', titleKey: 'paywall.plans.monthly', periodKey: 'paywall.plans.perMonth', badgeKey: null },
  ]
  ```
- [ ] **Step 2:** `npm run type-check && npm run lint` → PASS
- [ ] **Step 3:** Commit: `feat(paywall): mock de offerings com placeholder de preço`

#### Task 1.3 — Tela de paywall + rota formSheet

**Files:**
- Create: `app/paywall.tsx` (tela; nota: `app/(paywall)/paywall.tsx` do architecture.md vira grupo desnecessário pra 1 tela só — rota final é `/paywall` igual)
- Create: `components/paywall/PaywallPlanCard.tsx`
- Create: `components/paywall/PaywallFeatureRow.tsx`
- Modify: `app/_layout.tsx` (registrar Stack.Screen `paywall` como formSheet, mesmo padrão de `dose/registrar`:160-169)

- [ ] **Step 1:** `components/paywall/PaywallFeatureRow.tsx` — linha de benefício (ícone SF Symbol + título + descrição), NativeWind. Dados das chaves `paywall.features.{ai,report,goal}`.
- [ ] **Step 2:** `components/paywall/PaywallPlanCard.tsx` — card selecionável de plano (rádio visual): título (`titleKey`), preço `paywall.pricePlaceholder` ("—") + `periodKey`, badge opcional. Estado selecionado: borda `brand`. Acessível (`accessibilityRole="radio"`, `accessibilityState={{ selected }}`).
- [ ] **Step 3:** `app/paywall.tsx` — estrutura da tela (NativeWind + tokens, padrão HomeV7Content):
  - Header: botão fechar (X) + hero `paywall.hero` (typography `display`) + `paywall.subtitle`
  - 3× `PaywallFeatureRow`
  - 2× `PaywallPlanCard` (de `MOCK_PLANS`, anual pré-selecionado)
  - Nota de preço: `paywall.priceFromStore` (caption, textTertiary) — **placeholder explícito, nunca número**
  - CTA primário: `paywall.cta.startTrial` + `paywall.trialNote`
  - Botão ghost: `paywall.cta.restorePurchases`
  - Footer: links `paywall.legal.terms` / `paywall.legal.privacy` (abrem getdoseday.com/terms e /privacy via `Linking`) + `paywall.cta.cancelAnytime`
  - **Compliance:** disclaimer fixo de IA NÃO é necessário aqui (não é output de IA), mas a feature de IA é descrita como organização/resumo (já garantido na copy da Task 1.1)
  - **Estados (máquina local `idle | processing | success | error | unavailable`):**
    - `idle` → tela completa
    - `processing` → CTA com spinner inline + label "Ativando..." (nunca "Loading...")
    - `success` → `paywall.success.welcomePremium` + botão `paywall.success.startButton` que fecha o sheet
    - `error` → `paywall.errors.purchaseFailed` inline (não Alert) + CTA volta a `idle`
    - `unavailable` → `paywall.unavailable.*` (estado do CTA em build sem mock — produção Fase 1)
    - Erro de carregamento de planos (simulável em dev): `paywall.loadError.*` + botão retry
  - **Comportamento do CTA na Fase 1:**
    - `__DEV__`: ativa o mock (`setDevEntitlementOverride(true)` → `refresh()`) → estado `success`. Restore: `getDevEntitlementOverride()` → se true, `success` de restore; se false, `paywall.restore.notFound*`
    - Release: estado `unavailable` (decisão #2 do Léo)
- [ ] **Step 4:** Registrar a rota em `app/_layout.tsx` dentro do `<Stack>`:
  ```tsx
  <Stack.Screen
    name="paywall"
    options={{
      presentation: 'formSheet',
      headerShown: false,
      sheetAllowedDetents: [1.0],
      sheetGrabberVisible: true,
      sheetCornerRadius: 20,
    }}
  />
  ```
- [ ] **Step 5:** Validar no simulador: `router.push('/paywall')` temporário OU deeplink `npx uri-scheme open "doseday:///paywall" --ios`. Screenshot de cada estado.
- [ ] **Step 6:** `npm run type-check && npm run lint` → PASS
- [ ] **Step 7:** Commit: `feat(paywall): tela de paywall com estados e dados mockados`

> Nota: a Task 1.3 referencia `setDevEntitlementOverride`/`refresh()` que nascem nas Subfases 2-3. Na PRÁTICA a ordem de execução é Subfase 2 → 3 → 1.3 (ver seção 8). A numeração das subfases segue o brief; a ordem de commits segue a dependência.

### Subfase 2 — SubscriptionProvider + useEntitlements()

#### Task 2.1 — Guard puro + storage do entitlement

**Files:**
- Create: `lib/subscription/entitlement.ts` (código completo na seção 5)

- [ ] **Step 1:** Criar `lib/subscription/entitlement.ts` exatamente como na seção 5.
- [ ] **Step 2:** `npm run type-check && npm run lint` → PASS
- [ ] **Step 3:** Commit: `feat(subscription): resolveEntitlement com guard de produção`

#### Task 2.2 — SubscriptionContext + integração no root layout

**Files:**
- Create: `contexts/SubscriptionContext.tsx` (código completo na seção 5)
- Modify: `app/_layout.tsx:150-152` (envolver `AuthGuard` com `SubscriptionProvider`, dentro de `AuthProvider`)

- [ ] **Step 1:** Criar `contexts/SubscriptionContext.tsx` exatamente como na seção 5.
- [ ] **Step 2:** Em `app/_layout.tsx`:
  ```tsx
  <AuthProvider>
    <SubscriptionProvider>
      <StatusBar style="light" />
      <AuthGuard>
        ...
      </AuthGuard>
    </SubscriptionProvider>
  </AuthProvider>
  ```
- [ ] **Step 3:** `npm run type-check && npm run lint` → PASS
- [ ] **Step 4:** Smoke test no simulador: app abre normal, nenhuma tela muda (provider está montado mas ninguém consome ainda).
- [ ] **Step 5:** Commit: `feat(subscription): SubscriptionProvider + useEntitlements como fonte única`

### Subfase 3 — Mock dev-only verificável

#### Task 3.1 — Unit test do guard (critério "nenhum mock em produção")

**Files:**
- Create: `lib/subscription/__tests__/entitlement.test.ts`

- [ ] **Step 1:** Escrever o teste (padrão de `lib/utils/__tests__/formatMedicationName.test.ts`):
  ```ts
  import { resolveEntitlement } from '../entitlement'

  describe('resolveEntitlement', () => {
    it('NUNCA retorna premium fora de build dev, mesmo com override ligado', () => {
      expect(resolveEntitlement({ isDevBuild: false, devOverride: true })).toEqual({
        isPremium: false,
        source: 'none',
      })
    })

    it('retorna premium em build dev com override ligado', () => {
      expect(resolveEntitlement({ isDevBuild: true, devOverride: true })).toEqual({
        isPremium: true,
        source: 'mock-dev',
      })
    })

    it('retorna free em build dev com override desligado', () => {
      expect(resolveEntitlement({ isDevBuild: true, devOverride: false })).toEqual({
        isPremium: false,
        source: 'none',
      })
    })
  })
  ```
- [ ] **Step 2:** `npm test -- entitlement` → 3 testes PASS
- [ ] **Step 3:** Commit: `test(subscription): guard do mock nunca ativa premium em produção`

#### Task 3.2 — Toggle dev de premium em Configurações > Conta

**Files:**
- Modify: `app/configuracoes/conta.tsx:74-83`

- [ ] **Step 1:** Substituir a linha morta "Sua assinatura: Em breve" por:
  ```tsx
  const { isPremium, refresh } = useEntitlements()
  // ...
  <SettingsSectionHeader title="Assinatura" />
  <SettingsGroup>
    <SettingsRow
      icon="creditcard"
      label="Sua assinatura"
      value={isPremium ? 'Premium' : 'Gratuito'}
      chevron
      onPress={() => router.push('/paywall')}
      testID="settings-account-subscription"
    />
    {__DEV__ ? (
      <SettingsRow
        icon="hammer"
        label="[DEV] Simular Premium"
        value={isPremium ? 'Ligado' : 'Desligado'}
        chevron={false}
        onPress={async () => {
          await setDevEntitlementOverride(!isPremium)
          await refresh()
        }}
        testID="settings-dev-premium-toggle"
      />
    ) : null}
  </SettingsGroup>
  ```
- [ ] **Step 2:** Validar no simulador: toggle liga/desliga, valor persiste após reload (AsyncStorage), linha [DEV] some em build release (verificável pelo guard, não testável no simulador dev).
- [ ] **Step 3:** `npm run type-check && npm run lint` → PASS
- [ ] **Step 4:** Commit: `feat(subscription): status de assinatura + toggle dev em Configurações`

### Subfase 4 — Gating freemium/premium

#### Task 4.1 — Componente PremiumGate (preview de conversão)

**Files:**
- Create: `components/subscription/PremiumGate.tsx`

- [ ] **Step 1:** Criar o gate (NativeWind):
  ```tsx
  import { type ReactNode } from 'react'
  import { useRouter } from 'expo-router'
  import { useTranslation } from 'react-i18next'
  import { useEntitlements } from '@contexts/SubscriptionContext'
  // + View, Text, Pressable, SymbolView

  type Props = {
    children: ReactNode
    gateKey: 'reports' | 'dailyInsight'  // mapeia pra subscription:gate.<key>.*
    testID?: string
  }

  export function PremiumGate({ children, gateKey, testID }: Props) {
    const { isPremium, isLoading } = useEntitlements()
    const { t } = useTranslation('subscription')
    const router = useRouter()

    if (isLoading) return null            // gate nunca pisca conteúdo premium
    if (isPremium) return <>{children}</>

    return (
      // Card de conversão: ícone lock.fill + gate.<key>.title + gate.<key>.description
      // + CTA (botão primário) → router.push('/paywall')
      // Tom calmo, sem dark pattern. Sem blur de conteúdo real (não renderizar children escondido).
    )
  }
  ```
- [ ] **Step 2:** `npm run type-check && npm run lint` → PASS
- [ ] **Step 3:** Commit: `feat(subscription): PremiumGate com preview de conversão`

#### Task 4.2 — Gatear Relatórios + entry point na Home V7

**Files:**
- Modify: `app/(tabs)/relatorios.tsx` (envolver conteúdo no gate)
- Modify: `components/home/HomeV7Content.tsx` (card/atalho "Relatórios" — depende da decisão #1)

- [ ] **Step 1:** Em `relatorios.tsx`, extrair os 3 hooks de dados (`useWeightHistory`, `useDoseAdherence`, `useSymptomDistribution`, hoje em `relatorios.tsx:15-17`) + os 4 cards + placeholder pra um componente filho `RelatoriosContent` no MESMO arquivo. A tela vira:
  ```tsx
  export default function RelatoriosScreen() {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView ...>
          {/* header título + subtítulo: sempre visível, free e premium */}
          <PremiumGate gateKey="reports" testID="reports-premium-gate">
            <RelatoriosContent />
          </PremiumGate>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // Os hooks vivem AQUI — só executam quando o gate renderiza o filho (premium).
  // Free não dispara nenhuma query de relatório.
  function RelatoriosContent() {
    const weight = useWeightHistory()
    const dose = useDoseAdherence()
    const symptoms = useSymptomDistribution()
    return (
      <>
        <WeightChartCard ... />
        <DoseAdherenceCard ... />
        <SymptomDistributionCard ... />
        <AdherenceRingCard ... />
        {/* placeholder Relatórios médicos */}
      </>
    )
  }
  ```
  ⚠️ NÃO usar a forma "envolver o JSX no gate deixando os hooks no topo da tela" — hooks no topo executam mesmo com gate fechado (queries disparadas pra dado que o free não vê).
- [ ] **Step 2:** Em `HomeV7Content.tsx`, adicionar atalho "Relatórios" (mesmo padrão visual dos panels existentes — `SymptomMiniCard`/`ExpenseMiniCard`), navegando pra `/(tabs)/relatorios` (a tela já mostra o gate pra free):
  ```tsx
  onPress={() => router.push('/(tabs)/relatorios' as Href)}
  ```
  Posição: na grade de mini-cards, depois de Sintomas/Custos. Free e premium veem o atalho — a diferença está na tela de destino (free vê preview de conversão).
- [ ] **Step 3:** Validar no simulador (free): Home → Relatórios → vê gate → CTA → paywall abre. (premium mock): Home → Relatórios → vê os 4 gráficos.
- [ ] **Step 4:** `npm run type-check && npm run lint` → PASS
- [ ] **Step 5:** Commit: `feat(gating): Relatórios premium + entry point na Home`

#### Task 4.3 — Gate defensivo no InsightCard (IA contínua)

**Files:**
- Modify: `components/home/InsightCard.tsx`

- [ ] **Step 1:** No `InsightCard`, o gate acontece ANTES do hook disparar query: `useDailyInsight` já aceita `{ enabled }` (`hooks/useDailyInsight.ts:5`), então passar `enabled: source === 'daily' && isPremium`. Quando `source === 'daily'` e `!isPremium`: renderizar card de conversão (`gate.dailyInsight.*`) com CTA → `/paywall` no lugar do conteúdo (free não dispara query nem vê skeleton).
  Quando `source === 'onboarding'`: comportamento atual intocado (decisão travada — onboarding insight é grátis).
- [ ] **Step 2:** Este gate é **dormente** (componente só renderiza na LegacyHome), mas garante que QUALQUER tela futura que renderize `<InsightCard source="daily" />` já nasce gateada. Zero mudança visual no app ativo.
- [ ] **Step 3:** `npm run type-check && npm run lint` → PASS
- [ ] **Step 4:** Commit: `feat(gating): gate defensivo no InsightCard de IA contínua`

#### Task 4.4 — Verificação anti-gating (o que NÃO pode ter parede)

- [ ] **Step 1:** Confirmar (leitura + simulador) que NENHUM destes caminhos consulta `useEntitlements`:
  - `app/(onboarding)/*` (insight do onboarding É grátis)
  - `app/configuracoes/dados.tsx` (export LGPD — direito legal, Art. 18)
  - `app/dose/registrar.tsx`, `app/peso/registrar.tsx`, `app/diario/*` (registro básico)
  - `components/home/HomeV7Content.tsx` exceto o atalho de Relatórios (dashboard é grátis)
  - `app/configuracoes/lembretes.tsx` (lembretes básicos)
- [ ] **Step 2:** Rodar `grep -rn "useEntitlements" app/ components/ hooks/` e colar o output no PR — a lista DEVE conter apenas: `paywall.tsx`, `conta.tsx`, `relatorios.tsx`, `PremiumGate.tsx`, `InsightCard.tsx`, `SubscriptionContext.tsx` (+ result.tsx após Task 5.2).
- [ ] **Step 3:** Sem commit (verificação apenas; entra como evidência no PR).

### Subfase 5 — Encaixe Onboarding-03 Fase 2 (depende do PR onboarding-03 mergeado)

#### Task 5.1 — Loading premium (trocar a bolinha pulsante)

**Files:**
- Create: `components/onboarding/PremiumLoadingAnimation.tsx`
- Modify: `app/(onboarding)/loading.tsx:74` (trocar `<PulseAnimation />`)

- [ ] **Step 1:** Criar `PremiumLoadingAnimation`: animação Reanimated mais rica que a bolinha — anel de progresso com gradiente Vital Mint + ícones das etapas orbitando (ou equivalente aprovado no `/impeccable critique`). OBRIGATÓRIO: prop `reducedMotion` respeitada (fallback estático), igual ao `PulseAnimation` atual.
- [ ] **Step 2:** Em `loading.tsx`, substituir `<PulseAnimation reducedMotion={reducedMotion} />` por `<PremiumLoadingAnimation reducedMotion={reducedMotion} />`. Nada mais muda (timers, steps e navegação intocados).
- [ ] **Step 3:** Validar no simulador: onboarding completo → loading roda 5-15s → result. Screenshot.
- [ ] **Step 4:** `npm run type-check && npm run lint` → PASS
- [ ] **Step 5:** Commit: `feat(onboarding): loading premium substitui bolinha pulsante`

#### Task 5.2 — Teaser de Premium no result

**Files:**
- Modify: `app/(onboarding)/result.tsx` (depois dos insight cards / facts, antes do disclaimer)
- Reuso: chaves `gate.resultTeaser.*` da Task 1.1

- [ ] **Step 1:** Adicionar card de teaser no fim do stack do result (ambos os branches — com e sem insight de IA). Atenção: `result.tsx` hoje só carrega o namespace `onboarding` — adicionar:
  ```tsx
  const { t: tSub } = useTranslation('subscription')
  ```
  E o card:
  ```tsx
  <PremiumTeaserCard
    title={tSub('gate.resultTeaser.title')}
    description={tSub('gate.resultTeaser.description')}
    ctaLabel={tSub('gate.resultTeaser.cta')}
    onPress={() => router.push('/paywall')}
    testID="result-premium-teaser"
  />
  ```
  (componente inline no result ou `components/onboarding/PremiumTeaserCard.tsx` — ~40 linhas; texto de conversão, NÃO bloqueio: o CTA principal "Começar" do result continua funcionando sem tocar no teaser.)
- [ ] **Step 2:** Regra do onboarding-03: **branch `planning` também vê o teaser** (copy genérica serve), mas nada de dose/insight inventado.
- [ ] **Step 3:** Validar no simulador: onboarding → result → teaser visível → tap → paywall formSheet abre → fechar → result intacto → "Começar" → Home.
- [ ] **Step 4:** `npm run type-check && npm run lint` → PASS
- [ ] **Step 5:** Commit: `feat(onboarding): teaser de Premium no result apontando pro paywall`

---

## 7. Arquivos (resumo)

| Ação | Arquivo | Subfase |
|---|---|---|
| Create | `lib/subscription/entitlement.ts` | 2 |
| Create | `lib/subscription/__tests__/entitlement.test.ts` | 3 |
| Create | `lib/subscription/mockOfferings.ts` | 1 |
| Create | `contexts/SubscriptionContext.tsx` | 2 |
| Create | `app/paywall.tsx` | 1 |
| Create | `components/paywall/PaywallPlanCard.tsx` | 1 |
| Create | `components/paywall/PaywallFeatureRow.tsx` | 1 |
| Create | `components/subscription/PremiumGate.tsx` | 4 |
| Create | `components/onboarding/PremiumLoadingAnimation.tsx` | 5 |
| Create (opcional) | `components/onboarding/PremiumTeaserCard.tsx` | 5 |
| Modify | `locales/pt-BR/subscription.json` | 1 |
| Modify | `app/_layout.tsx` (provider + rota paywall) | 1, 2 |
| Modify | `app/configuracoes/conta.tsx` | 3 |
| Modify | `app/(tabs)/relatorios.tsx` | 4 |
| Modify | `components/home/HomeV7Content.tsx` (atalho Relatórios) | 4 |
| Modify | `components/home/InsightCard.tsx` | 4 |
| Modify | `app/(onboarding)/loading.tsx` | 5 |
| Modify | `app/(onboarding)/result.tsx` | 5 |
| **NÃO tocar** | `hooks/useExportUserData.ts`, `app/configuracoes/dados.tsx`, `hooks/useOnboardingInsight.ts`, `app/dose/*`, `app/peso/*`, `app/diario/*`, `locales/{en,es}/subscription.json` (Fase 2), seção `blocker` do JSON | — |

## 8. Ordem de execução (dependências reais)

```
0. Pré-requisito: PR do onboarding-03 resolvido (mergeado ou fechado).
   Branch nova: git checkout origin/main -b feature/paywall-freemium-fase1
1. Task 1.1  copy subscription.json          (sem dependências)
2. Task 2.1  entitlement.ts                  (sem dependências)
3. Task 3.1  unit test do guard              (depende de 2.1)
4. Task 2.2  SubscriptionProvider + layout   (depende de 2.1)
5. Task 1.2  mockOfferings                   (sem dependências)
6. Task 1.3  tela paywall + rota             (depende de 1.1, 1.2, 2.2 — CTA dev usa o provider)
7. Task 3.2  toggle dev em Configurações     (depende de 2.2, 1.3 — linha navega pro paywall)
8. Task 4.1  PremiumGate                     (depende de 2.2, 1.3)
9. Task 4.2  gating Relatórios + Home        (depende de 4.1)
10. Task 4.3 gate defensivo InsightCard      (depende de 2.2)
11. Task 4.4 verificação anti-gating         (depende de tudo acima)
12. /impeccable critique no paywall + PremiumGate + teaser (CLAUDE.md regra 6 —
    UI nova não é "pronta" sem critique). Ajustes que saírem viram fixups.
13. QA completo + screenshots → PR #1 (Subfases 1-4)
14. Tasks 5.1 + 5.2 (encaixe onboarding)     → mesmo PR se onboarding-03 já mergeou,
                                               senão PR #2 separado depois
```

> A numeração das subfases (1 UI / 2 provider / 3 mock / 4 gating) segue o brief; a ordem de COMMITS acima segue dependência técnica (provider antes da tela que o consome).

## 9. Riscos

| # | Risco | Mitigação |
|---|---|---|
| 1 | **Conflito com onboarding-03**: `result.tsx` está sujo no working tree (PR onboarding-03 pendente, HEAD detached). Tasks 5.1/5.2 tocam os mesmos arquivos | Subfase 5 só começa DEPOIS do PR onboarding-03 mergeado. Branch do paywall nasce de `origin/main` limpa. Se onboarding-03 atrasar, Subfases 1-4 viram PR próprio (são independentes) |
| 2 | **Gating de tela órfã** = gating de mentira | Task 4.2 cria o entry point na Home junto com o gate (decisão #1) |
| 3 | **Mock vazar pra produção** | Guard duplo + unit test (Task 3.1) + grep de verificação no PR (Task 4.4). `__DEV__` é eliminado pelo bundler em release |
| 4 | **Copy atual do subscription.json viola PRODUCT.md** (emoji, "-40%", copy defensiva) e a seção `blocker` gateia registro básico | Task 1.1 limpa o que o paywall novo usa; `blocker` não é referenciado por código novo |
| 5 | **Free user dispara queries de dado premium** (custo de rede/Supabase sem valor) | Hooks de relatórios/insight recebem `enabled: isPremium` (Tasks 4.2/4.3) |
| 6 | **Paywall em produção sem caminho de compra** (Fase 1 não tem SDK) | Decisão #2: estado `unavailable` amigável em release; merge da Fase 1 não dispara release pra App Store |
| 7 | **Esquecer en/es** ao mudar chaves do pt-BR | Fase 1 só adiciona chaves novas em pt-BR (idioma padrão; en/es são opt-in V5.x). Chave ausente em en/es cai no fallback pt-BR do i18next. Sincronizar na Fase 2 |
| 8 | **`sheetAllowedDetents` formSheet** pode cortar conteúdo do paywall em telas menores | Paywall usa detent `[1.0]` + ScrollView interno |

## 10. Critérios de aceite (verificáveis)

| # | Critério | Como verificar |
|---|---|---|
| 1 | Install limpo mostra welcome | Simulador: apagar app → abrir → tela welcome (já funciona; regressão não permitida) |
| 2 | Signup e signin funcionam | Simulador: criar conta nova + logar com existente |
| 3 | Usuário grátis registra dose, peso, sintoma, nota e custo SEM parede | Simulador com mock OFF: cada registro completa sem ver paywall |
| 4 | Grátis ao tocar Relatórios → vê gate de conversão → CTA → paywall | Simulador com mock OFF: Home → Relatórios |
| 5 | Premium (mock ON) acessa Relatórios direto, sem paywall | Simulador: ligar toggle dev → Home → Relatórios → 4 gráficos |
| 6 | Restore tem estado visual (sucesso e "nada encontrado") | Simulador: paywall → Restaurar Compras nos dois estados do mock |
| 7 | Erro de offering/paywall tem fallback amigável | Simulador: estado `loadError` + `unavailable` renderizam (forçar via flag dev na tela) |
| 8 | Nenhum mock premium em produção | `npm test -- entitlement` (3 PASS) + code review do guard duplo |
| 9 | Nenhum recurso básico gateado | Task 4.4: grep `useEntitlements` cola no PR só com os 6-7 arquivos esperados |
| 10 | type-check + lint + testes passam | `npm run type-check && npm run lint && npm test` |
| 11 | Screenshots reais no PR | `assets/screenshots/paywall-freemium/` (PNG via MCP do simulador) |
| 12 | Onboarding insight continua grátis (sem regressão) | Simulador: onboarding completo → result mostra insight sem paywall |
| 13 | Export LGPD continua sem parede | Simulador: Configurações → Dados → Exportar meus dados funciona com mock OFF |

## 11. QA no simulador (roteiro pós-implementação)

Ferramentas: `react-native-devtools-mcp` / `ios-simulator` MCP (screenshot, tap, deeplink). Screenshots salvos em `assets/screenshots/paywall-freemium/`.

| Passo | Fluxo | Screenshot |
|---|---|---|
| 1 | Apagar app do simulador → `npx expo run:ios` → welcome | `01-welcome.png` |
| 2 | Criar conta → onboarding completo (branch ongoing) → loading novo → result + teaser | `02-loading.png`, `03-result-teaser.png` |
| 3 | Tap teaser → paywall formSheet (estado idle) | `04-paywall-idle.png` |
| 4 | Fechar paywall → "Começar" → Home com atalho Relatórios | `05-home-relatorios.png` |
| 5 | (mock OFF) Tap Relatórios → gate de conversão | `06-reports-gate.png` |
| 6 | Gate CTA → paywall → CTA Assinar (dev) → estado processing → success | `07-paywall-success.png` |
| 7 | (agora premium) Relatórios → 4 gráficos visíveis | `08-reports-premium.png` |
| 8 | Configurações → Conta → "Sua assinatura: Premium" + toggle dev | `09-settings-premium.png` |
| 9 | Toggle dev OFF → Relatórios volta a mostrar gate | `10-reports-gate-back.png` |
| 10 | Paywall → Restaurar Compras (mock OFF) → "Nenhuma compra encontrada" | `11-restore-not-found.png` |
| 11 | Registrar dose + peso + sintoma + nota + custo com mock OFF (sem parede) | `12-free-registers.png` |
| 12 | Configurações → Dados → Exportar meus dados (mock OFF, funciona) | `13-lgpd-export.png` |
| 13 | Estados de erro do paywall (loadError + unavailable) | `14-paywall-error.png`, `15-paywall-unavailable.png` |

## 12. Comandos de validação

```bash
npm run type-check
npm run lint
npm test -- entitlement
```

(Os três rodam ao fim de cada task e obrigatoriamente antes do PR. Output colado no PR.)

## 13. Karpathy check

**Assumptions declaradas:**
1. Fase 1 não vai pra App Store sozinha — é base validável (decisão #2 confirma ou nega)
2. Relatórios (4 gráficos atuais) é a feature premium demonstrável desta fase; export/análise avançada não existem e ficam fora
3. UI nova em NativeWind v4 (padrão do `HomeV7Content` + ADR 0007); telas legadas tocadas (conta.tsx, relatorios.tsx, result.tsx) mantêm StyleSheet — diff cirúrgico, sem migração drive-by
4. en/es ficam pra Fase 2 (pt-BR é o idioma padrão e único ativo)
5. Nenhuma migration Supabase nesta fase (tabela `subscriptions` webhook-fed é assunto da Fase 2)

**Could 50 lines do this?** O núcleo SIM e é assim que está desenhado: provider (~70) + guard (~40) + teste (~25). O volume restante é UI irredutível (paywall, gate, teaser) — sem abstração especulativa, sem "PaywallManager", sem feature flag framework.

**Cada linha traceia ao pedido:** Subfases 1-4 = itens 2-5 do escopo do Léo; Subfase 5 = item 7; costura RevenueCat = item 6 (só comentários + shape do provider, zero código de SDK); welcome/auth = item 1 (nenhum ajuste necessário — confirmado no código).

**Success criteria verificáveis:** seção 10 (cada critério tem comando ou passo de simulador).

## 14. Fora de escopo (não fazer nesta fase)

- Instalar `react-native-purchases` / SDK nativo / dev build EAS
- Compra ou restore reais / App Store Connect / sandbox tester
- Migration Supabase (tabela `subscriptions` espelho do webhook)
- Gatear: registro básico, dashboard, histórico básico, lembretes, configurações, onboarding insight, export LGPD
- Refatorar telas existentes além do diff mínimo de gating
- Sincronizar `locales/{en,es}/subscription.json`
- Re-ativar `callMemoryDailyInsight` (P0 containment é assunto separado)
