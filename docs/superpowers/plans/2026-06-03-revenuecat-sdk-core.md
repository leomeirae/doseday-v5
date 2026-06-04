# RevenueCat SDK Core — Fase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Plugar StoreKit/RevenueCat real (compra, preço, trial, restore, entitlement `premium`) na UI e no provider já construídos na Fase 1, sem mudar nenhum consumidor de `useEntitlements()`.

**Architecture:** O SDK core `react-native-purchases` alimenta o `SubscriptionProvider` (fonte única). `Purchases.configure` roda uma vez no mount; `Purchases.logIn(supabaseUserId)` amarra o `app_user_id` à UUID do Supabase (o webhook `revenuecat-webhook` só casa a linha em `user_subscriptions` se `app_user_id` for UUID válida). O entitlement real entra em `resolveEntitlement` como campo opcional → o mock dev vira fallback (`isPremium = realPremium || (__DEV__ && devOverride)`). O paywall troca os planos mockados pela offering `default` (preço formatado pelo StoreKit, nunca hardcoded).

**Tech Stack:** Expo SDK 54, React Native 0.81.5, `react-native-purchases` ~10.2.0 (SDK core; **NÃO** `react-native-purchases-ui`), TypeScript estrito, Jest.

---

## Decisões travadas (PO, 2026-06-03)

1. Paywall = o **custom** existente (`app/paywall.tsx`). Instalar **somente** `react-native-purchases`. NÃO usar `react-native-purchases-ui` nem Paywall Builder como tela. (Sobrepõe o handoff, que pedia `-ui` — override intencional.)
2. Preço/trial/plano **sempre** do StoreKit/offering (`product.priceString`). Zero `R$` hardcoded.
3. `useEntitlements()` / `SubscriptionProvider` continuam fonte ÚNICA. SDK alimenta o provider; mock `__DEV__` vira fallback de dev. Nenhum consumidor muda.
4. **INCLUIR `Purchases.logIn(supabaseUserId)` / `logOut()`** — sem isso o `app_user_id` anônimo não passa no regex UUID do webhook e a linha em `user_subscriptions` fica órfã (`user_id` null).

### Dados verificados (não re-derivar)
- Projeto `proj521a5bc0` · app `appb2889aa078` (`com.doseday.premium`)
- Public SDK key iOS: `appl_PHRlWxAobfLUjIONONuBnndgkeJ` (chave **pública** de client — vai em `EXPO_PUBLIC_REVENUECAT_IOS_KEY`; nunca secret key)
- Offering: lookup_key `default` (current, active) · packages `$rc_monthly` / `$rc_annual` → `mensal_premium` / `anual_premium` (trial P2W=14d)
- Entitlement: lookup_key `premium`
- Buscar SEMPRE a offering por lookup key `default` (`all['default'] ?? current`), nunca por nome de paywall.

### Guards obrigatórios no logIn/logOut
1. **logOut:** `Purchases.logOut()` lança se o usuário atual já é anônimo. Checar `await Purchases.isAnonymous()` antes; sign-out NUNCA pode crashar por causa do RevenueCat (try/catch defensivo).
2. **logIn:** chamar só quando `user.id` realmente mudar — comparar com `await Purchases.getAppUserID()`. Não a cada render/refresh.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `lib/revenuecat/configure.ts` (novo) | `configure()` idempotente + `setLogLevel` em `__DEV__`; `identify(userId)` / `signOut()` com os 2 guards; re-export tipos |
| `lib/revenuecat/offerings.ts` (novo) | `getDefaultOffering()`, `purchase(pkg)`, `restore()` — todos com try/catch, erros viram retorno tratável |
| `lib/revenuecat/usePaywallPlans.ts` (novo) | Hook: offering `default` → lista de planos (id `monthly`/`yearly`, `priceString`, `package`), loading/erro |
| `lib/subscription/entitlement.ts` (modificar) | `resolveEntitlement` ganha campo opcional `entitlementActive?`; source union ganha `'revenuecat'` |
| `lib/subscription/__tests__/entitlement.test.ts` (modificar) | +2 testes do caminho RevenueCat (os 4 atuais intactos) |
| `contexts/SubscriptionContext.tsx` (modificar) | configure no mount + logIn/logOut por mudança de auth + `getCustomerInfo` + listener |
| `app/paywall.tsx` (modificar) | offering real, `purchase`/`restore`, preço via `priceString`; estados existentes reusados |
| `.env` / `.env.example` (modificar) | `EXPO_PUBLIC_REVENUECAT_IOS_KEY` |

`lib/subscription/mockOfferings.ts` permanece (fallback dev, não deletar).

---

## Task 1: Instalar SDK + env

**Files:**
- Modify: `package.json`, `package-lock.json`
- Modify: `.env`, `.env.example`

- [ ] **Step 1: Instalar o SDK core (só ele)**

```bash
npx expo install react-native-purchases
```

Expo escolhe a versão compatível com SDK 54 (~10.2.0). **Não** instalar `react-native-purchases-ui`.

- [ ] **Step 2: Confirmar autolink (sem config plugin)**

`react-native-purchases` autolinka via pods no prebuild — não precisa de entrada em `app.json > plugins`. Confirmar que o install NÃO pediu plugin. Se a doc da versão instalada exigir plugin, adicionar e anotar aqui.

- [ ] **Step 3: Adicionar a key pública ao env**

Em `.env.example` (com placeholder) e `.env` (com valor real):

```bash
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_PHRlWxAobfLUjIONONuBnndgkeJ
```

Confirmar que `.env` está no `.gitignore` (não commitar `.env`).

- [ ] **Step 4: type-check + lint**

Run: `npm run type-check && npm run lint`
Expected: PASS (sem uso novo ainda).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore(revenuecat): instala react-native-purchases (SDK core) + env key pública"
```

---

## Task 2: `resolveEntitlement` aceita entitlement real (TDD)

**Files:**
- Modify: `lib/subscription/entitlement.ts`
- Test: `lib/subscription/__tests__/entitlement.test.ts`

- [ ] **Step 1: Escrever os testes que falham**

Adicionar ao final do `describe` em `entitlement.test.ts`:

```ts
it('retorna premium quando o entitlement do RevenueCat está ativo, MESMO em produção', () => {
  expect(
    resolveEntitlement({ isDevBuild: false, devOverride: false, entitlementActive: true }),
  ).toEqual({ isPremium: true, source: 'revenuecat' })
})

it('entitlement real tem prioridade sobre o mock dev', () => {
  expect(
    resolveEntitlement({ isDevBuild: true, devOverride: false, entitlementActive: true }),
  ).toEqual({ isPremium: true, source: 'revenuecat' })
})

it('sem entitlement real em produção continua free (sem premium indevido)', () => {
  expect(
    resolveEntitlement({ isDevBuild: false, devOverride: true, entitlementActive: false }),
  ).toEqual({ isPremium: false, source: 'none' })
})
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- entitlement`
Expected: FAIL (campo `entitlementActive` ainda não existe / lógica não cobre).

- [ ] **Step 3: Implementar (campo opcional, real tem prioridade)**

Substituir o corpo de `lib/subscription/entitlement.ts` mantendo o cabeçalho de comentário:

```ts
export type EntitlementSource = 'none' | 'mock-dev' | 'revenuecat'

export type ResolvedEntitlement = {
  isPremium: boolean
  source: EntitlementSource
}

// Ordem: entitlement real do RevenueCat tem prioridade. Fora de build dev, o
// mock NUNCA ativa premium. Em dev sem entitlement real, o override de dev vale.
export function resolveEntitlement(input: {
  isDevBuild: boolean
  devOverride: boolean
  entitlementActive?: boolean
}): ResolvedEntitlement {
  if (input.entitlementActive) {
    return { isPremium: true, source: 'revenuecat' }
  }
  if (!input.isDevBuild) {
    return { isPremium: false, source: 'none' }
  }
  return input.devOverride
    ? { isPremium: true, source: 'mock-dev' }
    : { isPremium: false, source: 'none' }
}
```

Os 4 testes originais chamam sem `entitlementActive` (undefined → falsy) → continuam passando.

- [ ] **Step 4: Rodar e confirmar verde**

Run: `npm test -- entitlement`
Expected: PASS (7 testes).

- [ ] **Step 5: Confirmar que ninguém faz switch exaustivo em `source`**

Run: `grep -rn "\.source" --include="*.tsx" --include="*.ts" app components contexts hooks lib | grep -iv "datasource"`
Expected: nenhum `switch (…source)` que quebre com o novo membro. (Consumidores usam `isPremium`.) Se houver, ajustar.

- [ ] **Step 6: Commit**

```bash
git add lib/subscription/entitlement.ts lib/subscription/__tests__/entitlement.test.ts
git commit -m "feat(revenuecat): resolveEntitlement aceita entitlement real (source revenuecat)"
```

---

## Task 3: `lib/revenuecat/configure.ts` — configure + identify/signOut

**Files:**
- Create: `lib/revenuecat/configure.ts`

- [ ] **Step 1: Implementar**

```ts
import Purchases, { LOG_LEVEL, type CustomerInfo } from 'react-native-purchases'

// Configuração do SDK RevenueCat (iOS). A key é PÚBLICA de client.
// FONTE: o SubscriptionProvider é o único consumidor — nenhuma tela chama isto direto.

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY

let configured = false

// Idempotente: configura uma única vez por processo. Sem key → no-op (fallback free).
export function configureRevenueCat(): boolean {
  if (configured) return true
  if (!IOS_KEY) return false
  try {
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG)
    Purchases.configure({ apiKey: IOS_KEY })
    configured = true
    return true
  } catch {
    return false
  }
}

export function isRevenueCatConfigured(): boolean {
  return configured
}

// Guard 2: só chama logIn se o app_user_id atual difere da UUID do Supabase.
export async function identifyRevenueCatUser(userId: string): Promise<void> {
  if (!configured) return
  try {
    const current = await Purchases.getAppUserID()
    if (current === userId) return
    await Purchases.logIn(userId)
  } catch {
    // identidade é best-effort; nunca quebra o fluxo de auth.
  }
}

// Guard 1: logOut lança se já anônimo — checar antes; sign-out nunca crasha por RC.
export async function signOutRevenueCatUser(): Promise<void> {
  if (!configured) return
  try {
    const anonymous = await Purchases.isAnonymous()
    if (anonymous) return
    await Purchases.logOut()
  } catch {
    // best-effort.
  }
}

export type { CustomerInfo }
```

- [ ] **Step 2: type-check + lint**

Run: `npm run type-check && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/revenuecat/configure.ts
git commit -m "feat(revenuecat): configure idempotente + identify/signOut com guards"
```

---

## Task 4: `lib/revenuecat/offerings.ts` — offering/purchase/restore

**Files:**
- Create: `lib/revenuecat/offerings.ts`

- [ ] **Step 1: Implementar**

```ts
import Purchases, {
  PurchasesError,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases'

const PREMIUM_ENTITLEMENT = 'premium'

// Offering canônica por lookup key. Nunca depende de nome de paywall do dashboard.
export async function getDefaultOffering(): Promise<PurchasesOffering | null> {
  const offerings = await Purchases.getOfferings()
  return offerings.all['default'] ?? offerings.current ?? null
}

export function hasPremiumEntitlement(info: CustomerInfo): boolean {
  return info.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined
}

export type PurchaseOutcome =
  | { status: 'success'; info: CustomerInfo }
  | { status: 'cancelled' }
  | { status: 'error' }

export async function purchase(pkg: PurchasesPackage): Promise<PurchaseOutcome> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg)
    return { status: 'success', info: customerInfo }
  } catch (e) {
    const err = e as PurchasesError
    if (err?.userCancelled || err?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { status: 'cancelled' }
    }
    return { status: 'error' }
  }
}

export type RestoreOutcome =
  | { status: 'restored'; info: CustomerInfo }
  | { status: 'nothing'; info: CustomerInfo }
  | { status: 'error' }

export async function restore(): Promise<RestoreOutcome> {
  try {
    const info = await Purchases.restorePurchases()
    return hasPremiumEntitlement(info)
      ? { status: 'restored', info }
      : { status: 'nothing', info }
  } catch {
    return { status: 'error' }
  }
}
```

- [ ] **Step 2: type-check + lint**

Run: `npm run type-check && npm run lint`
Expected: PASS. (Se algum nome de tipo do SDK 10.x diferir — ex.: `userCancelled` vs `code` — ajustar pela d.ts instalada; manter o contrato de retorno.)

- [ ] **Step 3: Commit**

```bash
git add lib/revenuecat/offerings.ts
git commit -m "feat(revenuecat): helpers de offering default, purchase e restore"
```

---

## Task 5: `SubscriptionProvider` lê o SDK + listener + identidade

**Files:**
- Modify: `contexts/SubscriptionContext.tsx`

- [ ] **Step 1: Implementar a integração**

Reescrever o corpo do provider mantendo o tipo `Entitlements` e `useEntitlements()` idênticos:

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import Purchases, { type CustomerInfo } from 'react-native-purchases'
import { resolveEntitlement, type EntitlementSource } from '@lib/subscription/entitlement'
import { getDevEntitlementOverride } from '@lib/subscription/devEntitlementStorage'
import {
  configureRevenueCat,
  identifyRevenueCatUser,
  signOutRevenueCatUser,
} from '@lib/revenuecat/configure'
import { hasPremiumEntitlement } from '@lib/revenuecat/offerings'
import { useAuth } from '@contexts/AuthContext'

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
  const { user } = useAuth()
  const [state, setState] = useState<Omit<Entitlements, 'refresh'>>({
    isPremium: false,
    isLoading: true,
    source: 'none',
  })
  const configuredRef = useRef(false)

  // Resolve combinando entitlement real (se houver) + fallback mock dev.
  const resolveFrom = useCallback(async (info: CustomerInfo | null) => {
    const devOverride = await getDevEntitlementOverride()
    const resolved = resolveEntitlement({
      isDevBuild: __DEV__,
      devOverride,
      entitlementActive: info ? hasPremiumEntitlement(info) : false,
    })
    setState({ isPremium: resolved.isPremium, isLoading: false, source: resolved.source })
  }, [])

  const refresh = useCallback(async () => {
    let info: CustomerInfo | null = null
    if (configuredRef.current) {
      try {
        info = await Purchases.getCustomerInfo()
      } catch {
        info = null // RevenueCat indisponível → trata como free; mock dev ainda vale.
      }
    }
    await resolveFrom(info)
  }, [resolveFrom])

  // Configura uma vez + registra listener de mudança de customerInfo.
  useEffect(() => {
    configuredRef.current = configureRevenueCat()
    void refresh()
    if (!configuredRef.current) return
    const listener = (info: CustomerInfo) => {
      void resolveFrom(info)
    }
    Purchases.addCustomerInfoUpdateListener(listener)
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener)
    }
  }, [refresh, resolveFrom])

  // Amarra o app_user_id à UUID do Supabase (guards dentro de identify/signOut).
  useEffect(() => {
    if (!configuredRef.current) return
    if (user?.id) {
      void identifyRevenueCatUser(user.id).then(() => refresh())
    } else {
      void signOutRevenueCatUser().then(() => refresh())
    }
  }, [user?.id, refresh])

  const value = useMemo<Entitlements>(() => ({ ...state, refresh }), [state, refresh])

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useEntitlements(): Entitlements {
  return useContext(SubscriptionContext)
}
```

- [ ] **Step 2: type-check + lint**

Run: `npm run type-check && npm run lint`
Expected: PASS.

- [ ] **Step 3: Suite completa**

Run: `npm test`
Expected: PASS (entitlement 7/7 + restante intacto).

- [ ] **Step 4: Commit**

```bash
git add contexts/SubscriptionContext.tsx
git commit -m "feat(revenuecat): provider lê customerInfo real + listener + identidade Supabase"
```

> **CHECKPOINT 1 — PARAR AQUI.** Reportar a Léo: type-check + lint + npm test verdes, antes de tocar no paywall.

---

## Task 6: `usePaywallPlans` — offering `default` → cards

**Files:**
- Create: `lib/revenuecat/usePaywallPlans.ts`

- [ ] **Step 1: Implementar o hook**

```ts
import { useEffect, useState } from 'react'
import { PACKAGE_TYPE, type PurchasesPackage } from 'react-native-purchases'
import { getDefaultOffering } from '@lib/revenuecat/offerings'
import { isRevenueCatConfigured } from '@lib/revenuecat/configure'

export type PaywallPlanId = 'monthly' | 'yearly'

export type PaywallPlan = {
  id: PaywallPlanId
  priceString: string // formatado pelo StoreKit (ex.: "R$ 19,90") — nunca hardcoded
  package: PurchasesPackage
}

export type PaywallPlansState = {
  plans: PaywallPlan[]
  loading: boolean
  error: boolean
  available: boolean // SDK configurado E offering carregada
}

function mapType(pkg: PurchasesPackage): PaywallPlanId | null {
  if (pkg.packageType === PACKAGE_TYPE.ANNUAL) return 'yearly'
  if (pkg.packageType === PACKAGE_TYPE.MONTHLY) return 'monthly'
  return null
}

export function usePaywallPlans(): PaywallPlansState {
  const [state, setState] = useState<PaywallPlansState>({
    plans: [],
    loading: true,
    error: false,
    available: isRevenueCatConfigured(),
  })

  useEffect(() => {
    let active = true
    if (!isRevenueCatConfigured()) {
      setState({ plans: [], loading: false, error: false, available: false })
      return
    }
    void (async () => {
      try {
        const offering = await getDefaultOffering()
        if (!active) return
        if (!offering) {
          setState({ plans: [], loading: false, error: true, available: true })
          return
        }
        const plans = offering.availablePackages
          .map((pkg) => {
            const id = mapType(pkg)
            return id ? { id, priceString: pkg.product.priceString, package: pkg } : null
          })
          .filter((p): p is PaywallPlan => p !== null)
          // anual primeiro (mesma ordem visual da Fase 1)
          .sort((a, b) => (a.id === 'yearly' ? -1 : b.id === 'yearly' ? 1 : 0))
        setState({ plans, loading: false, error: plans.length === 0, available: true })
      } catch {
        if (active) setState({ plans: [], loading: false, error: true, available: true })
      }
    })()
    return () => {
      active = false
    }
  }, [])

  return state
}
```

- [ ] **Step 2: type-check + lint**

Run: `npm run type-check && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/revenuecat/usePaywallPlans.ts
git commit -m "feat(revenuecat): usePaywallPlans mapeia offering default em cards"
```

---

## Task 7: `app/paywall.tsx` — offering real, purchase, restore

**Files:**
- Modify: `app/paywall.tsx`
- Modify: `locales/pt-BR/subscription.json`, `locales/en/subscription.json`, `locales/es/subscription.json` (chave de período por plano, se necessário)

- [ ] **Step 1: Trocar mock por offering real**

No `paywall.tsx`:
- Remover `import { MOCK_PLANS, type PaywallPlanId } from '@lib/subscription/mockOfferings'`.
- Importar `usePaywallPlans, type PaywallPlanId` de `@lib/revenuecat/usePaywallPlans` e `purchase, restore` de `@lib/revenuecat/offerings`.
- `const { plans, loading: plansLoading, error: plansError, available } = usePaywallPlans()`.
- `selectedPlan` default `'yearly'`; se a lista não tiver yearly, cair pro primeiro plano via efeito.
- Render dos cards: mapear `plans`; `priceNote={plan.priceString}`; `periodLabel={t(plan.id === 'yearly' ? 'paywall.plans.perYear' : 'paywall.plans.perMonth')}`; `title={t(plan.id === 'yearly' ? 'paywall.plans.yearly' : 'paywall.plans.monthly')}`.
- Estado inicial: se `plansLoading` → spinner no corpo; se `plansError` → estado `loadError` existente; se `!available` → estado `unavailable` existente.

- [ ] **Step 2: `handleSubscribe` com compra real**

```tsx
async function handleSubscribe() {
  setPurchaseError(false)
  setRestoreNotFound(false)
  const plan = plans.find((p) => p.id === selectedPlan)
  if (!available || !plan) {
    setStatus('unavailable')
    return
  }
  setStatus('processing')
  const outcome = await purchase(plan.package)
  if (outcome.status === 'success') {
    await refresh()
    setStatus('success')
  } else if (outcome.status === 'cancelled') {
    setStatus('idle')
  } else {
    setStatus('idle')
    setPurchaseError(true)
  }
}
```

- [ ] **Step 3: `handleRestore` com restore real**

```tsx
async function handleRestore() {
  setPurchaseError(false)
  setRestoreNotFound(false)
  if (!available) {
    setStatus('unavailable')
    return
  }
  setStatus('processing')
  const outcome = await restore()
  if (outcome.status === 'restored') {
    await refresh()
    setStatus('restored')
  } else if (outcome.status === 'nothing') {
    setStatus('idle')
    setRestoreNotFound(true)
  } else {
    setStatus('idle')
    setPurchaseError(true)
  }
}
```

Remover os blocos `if (!__DEV__) { setStatus('unavailable') }` e o mock `MOCK_PROCESSING_DELAY_MS`/`setDevEntitlementOverride`. (O toggle dev de QA continua em `configuracoes/conta.tsx`, intacto.)

- [ ] **Step 4: type-check + lint**

Run: `npm run type-check && npm run lint`
Expected: PASS.

- [ ] **Step 5: Suite + bundle sanity**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/paywall.tsx locales/pt-BR/subscription.json locales/en/subscription.json locales/es/subscription.json
git commit -m "feat(revenuecat): paywall usa offering default real (preço StoreKit, purchase, restore)"
```

---

## Task 8: Validação no simulador (UI) + device via Xcode/TestFlight

- [x] **Step 1: Simulador — UI com toggle dev** ✅ (build local `expo run:ios`)

Build local de simulador com o módulo nativo (`pod install --repo-update` → `expo run:ios`). Achado: a offering `default` **carregou com preço real** (StoreKit) já no simulador — DoseDay Anual $39.99/ano, Mensal $4.99/mês (storefront US → `$`; vira `R$` com sandbox tester Brasil no device). App boota sem crash; toggle dev em `configuracoes/conta.tsx` desbloqueia os gates. 7 screenshots em `assets/screenshots/revenuecat-sdk-core/`.

> **CHECKPOINT 2 — feito.** Reportado ao Léo; PR aberto após o ok.

- [ ] **Step 2: Build device — Xcode/TestFlight (NÃO EAS)**

Decisão Léo 2026-06-03: validação device é via **Xcode local → TestFlight**, fluxo já estabelecido dele. **NÃO usar EAS** — não rodar `eas init`; o placeholder `<PREENCHER_COM_EAS_INIT>` em `app.json` fica como está (não bloqueia `expo run:ios` nem Xcode). IAP em TestFlight é **sandbox automático** (sem cobrança, moeda da conta = R$).

Passos (Léo): Archive no Xcode → distribuir pro TestFlight → instalar no device.

- [ ] **Step 3: Sandbox via TestFlight (pendente, pós-merge)**

Checklist: compra mensal e anual c/ trial 14d · preço/moeda em **R$** · restore · entitlement `premium` ativando gates (Relatórios / Memória do Tratamento) · cancelamento/expiração sandbox · listener reflete sem reabrir o app.

---

## Fora de escopo
`react-native-purchases-ui` / Paywall Builder · redesign do paywall · deploy/edição de webhook server-side · Android.

## Riscos
- **Validação device via Xcode/TestFlight (não EAS)** — decisão Léo 2026-06-03. O placeholder `<PREENCHER_COM_EAS_INIT>` fica como está; não bloqueia Xcode nem `expo run:ios`.
- SDK nativo não roda em Expo Go nem (compra real) no simulador → transação real só em device/TestFlight (sandbox automático).
- Nomes de tipos do SDK 10.x (`userCancelled`, `PACKAGE_TYPE`, `LOG_LEVEL`) podem diferir levemente da `.d.ts` instalada → ajustar pelo tipo real, mantendo contratos de retorno.
- Aviso "SDK 8.11.3+" do dashboard é sobre o **Builder** (fora de escopo); core 10.2.0 cobre offering/purchase/entitlement.

## Self-Review
- Cobertura: instala SDK (T1), entitlement real (T2,T5), configure+identidade (T3,T5), offering/purchase/restore (T4,T7), listener (T5), fallback seguro (T4,T5,T7), paywall real (T7), validação sandbox (T8). ✔
- Guards logIn/logOut: T3 (`isAnonymous` antes de logOut; `getAppUserID` antes de logIn). ✔
- 4 testes preservados: campo `entitlementActive` opcional (T2). ✔
- Nenhum consumidor de `useEntitlements()` muda: tipo `Entitlements` e hook idênticos (T5). ✔
</content>
</invoke>
