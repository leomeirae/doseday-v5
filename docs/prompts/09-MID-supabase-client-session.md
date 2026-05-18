# Prompt 09-MID-supabase-client-session

**Branch:** `feature/09-supabase-client-session`
**Modelo recomendado:** Sonnet (decisões arquiteturais — Context API, SecureStore adapter, fluxo de sessão)
**Pré-requisito:** Prompt 08 mergeado em `main`. `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` presentes em `.env` (Prompt 01).

---

## Contexto

O DoseDay V5 reaproveita 100% do projeto Supabase da V4 (`pjesgdczasumgjzqyzzk`). Estado confirmado via MCP:

- **105 usuários ativos** em `auth.users`
- **125 sessões ativas**
- **Schema robusto e em produção:** `user_profiles`, `medication_applications`, `daily_checkins`, `weight_logs`, `symptom_logs`, `quick_logs`, `medical_reports`, `consent_history`, `purchases`, `user_subscriptions`, `onboarding_events`, `educational_insights`, `pending_ai_questions`, `memory_summaries`, `memory_daily_insights`, `medical_visits`, `lifestyle_logs`, `push_schedules`, `push_automations`, etc.
- **RLS habilitado em TODAS as tabelas `public`**
- **Auth providers já configurados** (login funciona no app V4 em produção)
- **Postgres 17**

**Estratégia V5:** preservar continuidade dos 105 usuários V4 — Mariana abre o V5 com a senha que já usa e tudo continua.

Este prompt não cria UI, não cria tabelas, não modifica nada no Supabase. **Só wira o cliente** e a fundação de sessão que os Prompts 10 (telas Signin/Signup) e 11 (Session Guard + Recover) vão consumir.

---

## Tarefa

Instalar o SDK do Supabase, criar a infraestrutura de client + sessão + tipos, e envolver o app no AuthProvider.

### 1. Instalar dependência

```bash
npm install @supabase/supabase-js
```

`expo-secure-store` e `@react-native-async-storage/async-storage` — verificar se ambos estão em `package.json`. `expo-secure-store` já está (Prompt 00). `async-storage` pode precisar ser adicionado (Supabase SDK usa por default; nós override com SecureStore, mas o SDK pode reclamar se a peer dep não existir — investigar e instalar só se necessário).

### 2. `lib/supabase/client.ts`

Cliente Supabase singleton, configurado para React Native + Expo:

```typescript
import 'react-native-url-polyfill/auto' // Se necessário pro RN — investigar SDK v2 mais recente
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import type { Database } from '../../types/database'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase env vars. Check .env.')
}

// SecureStore adapter — tokens persistem em Keychain (iOS) / Keystore (Android)
const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // RN não usa URL pra detectar sessão
  },
})
```

**Detalhe importante:** se `react-native-url-polyfill/auto` não for necessário com a versão atual do SDK + RN 0.81, omitir. Investigar antes de adicionar.

**Limite do SecureStore:** valores até ~2KB. Tokens JWT do Supabase ficam bem dentro do limite. Caso o SDK tente armazenar algo maior (raro), considerar `MMKV` como alternativa — registrar como aprendizado se acontecer.

### 3. `lib/supabase/auth.ts`

Helpers tipados para os fluxos de auth (sem UI):

```typescript
import { supabase } from './client'
import type { AuthError, Session, User } from '@supabase/supabase-js'

export type AuthResult = {
  session: Session | null
  user: User | null
  error: AuthError | null
}

export async function signIn(email: string, password: string): Promise<AuthResult> { ... }
export async function signUp(email: string, password: string, metadata?: Record<string, unknown>): Promise<AuthResult> { ... }
export async function signOut(): Promise<{ error: AuthError | null }> { ... }
export async function recoverPassword(email: string): Promise<{ error: AuthError | null }> { ... }
export async function getCurrentSession(): Promise<Session | null> { ... }
export function onAuthStateChange(callback: (session: Session | null) => void): () => void { ... } // retorna unsubscribe
```

### 4. `contexts/AuthContext.tsx`

React Context com session state global:

```typescript
import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@lib/supabase/client'

export type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean // true durante o bootstrap inicial
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Bootstrap: ler sessão persistida do SecureStore
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // 2. Subscribe: refletir mudanças (signin/signout/refresh)
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 5. `hooks/useSession.ts`

Hook ergonômico para consumir o context:

```typescript
import { useContext } from 'react'
import { AuthContext } from '@contexts/AuthContext'

export function useSession() {
  return useContext(AuthContext)
}
```

### 6. Envolver o app

`app/_layout.tsx` (root layout) — envolver com `AuthProvider`. Posição: dentro do `<SafeAreaProvider>` (ou equivalente já existente), envolvendo `<Stack>` ou estrutura atual.

**Não criar route guards neste prompt.** Guard fica para o Prompt 11. Por enquanto, mesmo sem sessão, o app continua mostrando as tabs (Home/Doses mockadas). Quem está logado vê o mesmo que quem não está — isso é intencional, só vamos plugar dados reais nos prompts seguintes.

### 7. Tipos do banco — `types/database.ts`

Gerar tipos do schema V4 via MCP:

```bash
npm run supabase:types
```

Script já existe em `package.json`:
```json
"supabase:types": "supabase gen types typescript --project-id pjesgdczasumgjzqyzzk > types/database.ts"
```

**Alternativa se o CLI Supabase não estiver autenticado localmente:** o Claude Code tem acesso ao MCP do Supabase. Pode invocar a ferramenta de geração de tipos diretamente — equivalente a chamar `generate_typescript_types({project_id: 'pjesgdczasumgjzqyzzk'})` e gravar o output em `types/database.ts`.

Arquivo gerado é grande (~50-100KB). Commitar mesmo assim — é a fonte de verdade dos tipos.

### 8. Path aliases (TypeScript + Babel)

Confirmar que `@lib/*`, `@contexts/*`, `@hooks/*` estão configurados em `tsconfig.json` e `babel.config.js` (via `babel-plugin-module-resolver`). Se `@contexts` e `@hooks` ainda não existem como alias, adicionar. Manter consistência com aliases existentes.

---

## Estrutura final esperada

```
lib/
├── supabase/
│   ├── client.ts        ← NOVO
│   └── auth.ts          ← NOVO
├── theme/tokens.ts
├── i18n/index.ts
├── mocks/
└── utils/

contexts/
└── AuthContext.tsx      ← NOVO

hooks/
└── useSession.ts        ← NOVO

types/
└── database.ts          ← NOVO (gerado, ~50-100KB)

app/_layout.tsx          ← MODIFICAR (envolver com AuthProvider)
```

---

## Skills obrigatórias

| Skill | Por quê |
|---|---|
| `supabase-postgres-best-practices` | Padrões de cliente Supabase em RN, SecureStore como adapter de storage, RLS-aware querying |
| `react-native-best-practices` | Context API, hooks tipados, padrões Expo |

---

## Critérios de aceitação

- [ ] `@supabase/supabase-js` instalado e em `dependencies`
- [ ] `lib/supabase/client.ts` criado com SecureStore adapter, `autoRefreshToken: true`, `detectSessionInUrl: false`
- [ ] `lib/supabase/auth.ts` criado com 6 helpers (`signIn`, `signUp`, `signOut`, `recoverPassword`, `getCurrentSession`, `onAuthStateChange`)
- [ ] `contexts/AuthContext.tsx` criado com `AuthProvider` + `AuthContext`
- [ ] `hooks/useSession.ts` criado, retorna `{ session, user, loading }`
- [ ] `app/_layout.tsx` envolvido em `<AuthProvider>` sem quebrar a árvore atual
- [ ] `types/database.ts` gerado e commitado (schema V4 completo)
- [ ] Path aliases `@lib`, `@contexts`, `@hooks` funcionando (TS + Babel)
- [ ] `npm run type-check` zero erros
- [ ] `npm run lint` zero erros novos (warning preexistente de i18n persiste)
- [ ] `npx expo run:ios` abre o app, Home + Doses continuam renderizando idênticas (zero regressão visual)
- [ ] **Validação manual de sessão** (instruções abaixo, na seção "Como validar")
- [ ] Sem `as any` / `// @ts-ignore`
- [ ] Sem mudanças no Supabase (zero migrations, zero novas tabelas, zero RLS alterado)
- [ ] Commit: `feat(auth): supabase client + auth provider + session hook (sem UI)`
- [ ] PR aberto

---

## Como validar (manual, sem UI)

Após o code estar pronto, validar via debugger / console RN:

```typescript
// Em qualquer lugar temporariamente — por exemplo, dentro de um useEffect no app/(tabs)/index.tsx
import { supabase } from '@lib/supabase/client'

useEffect(() => {
  // Teste 1: cliente conectado?
  supabase.auth.getSession().then(({ data }) => {
    console.log('Sessão atual:', data.session?.user?.email ?? 'nenhuma')
  })

  // Teste 2: signIn com credenciais conhecidas (Léo passa as credenciais de um usuário test da V4)
  // supabase.auth.signInWithPassword({ email: 'TEST_EMAIL', password: 'TEST_PASS' })
  //   .then(({ data, error }) => console.log('signIn result:', error ?? data.session?.user?.email))
}, [])
```

**Léo fornecerá credenciais de teste** (um usuário V4 dedicado a testes, NÃO um usuário real). Esse `useEffect` deve ser **removido antes do commit final** — é só pra validar localmente.

**Critério de sucesso da validação:**
- App não crasha ao montar `AuthProvider`
- `getSession()` retorna `null` na primeira execução (sem sessão prévia)
- `signInWithPassword(test_credentials)` retorna `session !== null` e log mostra o email do test user
- Reabrir o app SEM signIn → `getSession()` retorna a sessão persistida (SecureStore funcionou)
- Chamar `signOut()` → próximo `getSession()` retorna `null` e SecureStore foi limpo

---

## Restrições

- **Zero UI nova.** Sem telas, sem componentes visuais. Só infraestrutura
- **Zero modificação no Supabase.** Não criar tabelas, não criar RLS, não alterar policies, não criar funções, não criar buckets de storage
- **Zero quebra das telas atuais.** Home + Doses devem continuar idênticas (mocks intactos)
- **Sem instalar libs além de `@supabase/supabase-js`** (e `async-storage` SE for peer dep obrigatória do SDK)
- **Sem tocar em** `lib/theme/tokens.ts`, `lib/i18n/`, `components/`, `app/(tabs)/*.tsx`

---

## Antes de executar

1. Ler `docs/architecture.md` seções 14.0 e 14.1 (Aprendizados)
2. Confirmar que `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` existem em `.env` (`grep EXPO_PUBLIC_SUPABASE .env` — deve retornar 2 linhas)
3. Confirmar versão atual do `@supabase/supabase-js` recomendada para RN/Expo SDK 54 (consultar docs oficiais)
4. Verificar se `babel-plugin-module-resolver` suporta os novos aliases (`@contexts`, `@hooks`)

## Validação rápida pós-execução

```bash
# Type-check + lint
npm run type-check
npm run lint

# Confirma estrutura criada
ls lib/supabase contexts hooks types

# Confirma SDK instalado
cat package.json | grep "@supabase/supabase-js"

# Confirma tipos gerados (deve ter milhares de linhas)
wc -l types/database.ts

# Garante zero regressão nas telas
# (visual: testar Home + Doses no simulador, ambas renderizam idênticas)
```

---

## Pós-execução

1. Validar manualmente o fluxo de signIn/signOut conforme seção "Como validar" — Léo fornece credenciais de test user
2. Remover o `useEffect` de teste antes do commit
3. Atualizar `docs/architecture.md` seção "Aprendizados" se algo novo for descoberto (especialmente se o SDK tiver gotchas com Expo SDK 54)
4. Atualizar `CLAUDE.md` tabela "Histórico" com linha do Prompt 09
5. Abrir PR com título: `feat(auth): supabase client + auth provider + session hook (sem UI)`
6. No PR description, mencionar:
   - "Zero UI nova. Fundação para Prompts 10 (telas Signin/Signup) e 11 (Session Guard + Recover)."
   - "Reaproveita projeto Supabase V4 (105 usuários preservados)."
   - "2 security advisors pendentes (não bloqueantes): `function_search_path_mutable` em `update_medical_visits_updated_at` + Leaked Password Protection desativado. Resolver no Prompt 11."
