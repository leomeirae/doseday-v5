# Prompt 11-MID-session-guard-recover

**Branch:** `feature/11-session-guard-recover`
**Modelo recomendado:** Sonnet (race conditions de Expo Router + lógica de roteamento condicional)
**Pré-requisito:** Prompt 10 mergeado em `main`. Telas signin/signup funcionando. `react-native-devtools-mcp` conectado.

---

## Contexto

Hoje o app abre na Home sem checar sessão. Há um link `[DEV]` no rodapé pra abrir signin manualmente. Funciona pra dev, **não funciona pra produção**.

Este prompt fecha o ciclo de auth:

1. **Navigation guard global** — app decide automaticamente onde a Mariana entra (signin ou tabs) baseado em sessão
2. **Tela recover password** — fluxo "esqueci minha senha" que envia email de reset
3. **Logout no Perfil** — botão "Sair" simples na tab Perfil (hoje placeholder)
4. **Link "Esqueci minha senha"** — na tela signin
5. **Splash discreta** — enquanto a sessão é checada no cold start
6. **Remoção do link `[DEV]`** — o guard global cobre

Após este prompt, o app está pronto pra ter o fluxo de auth **completo** e o foco volta pras telas de conteúdo real (Diário, Relatórios, integração com dados reais do Supabase).

Persona-alvo: **Mariana**. Veja `docs/PRODUCT.md`.

---

## Tarefa

### 1. Navigation guard global no `app/_layout.tsx`

Padrão Expo Router para evitar race condition entre router mount + session bootstrap:

```typescript
import { useEffect } from 'react'
import { useRouter, useSegments, useRootNavigationState } from 'expo-router'
import { useSession } from '@hooks/useSession'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession()
  const segments = useSegments()
  const router = useRouter()
  const navigationState = useRootNavigationState()

  useEffect(() => {
    if (loading) return
    if (!navigationState?.key) return // navigator ainda não montou

    const inAuthGroup = segments[0] === '(auth)'

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/signin')
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [session, loading, navigationState?.key, segments])

  // Splash discreta enquanto loading
  if (loading) {
    return <SplashView />
  }

  return <>{children}</>
}
```

Wrap `<AuthGuard>` dentro do `<AuthProvider>` no root layout, envolvendo o `<Stack>`.

**SplashView (componente novo, `components/auth/SplashView.tsx`):**
- `<View>` fullscreen com bg `bgBase`
- Centralizado: mesmo logo placeholder do `AuthHeader` (letra "D" em brand) — sem texto, sem ActivityIndicator. Minimalista.
- Reaproveita o style do logo do `AuthHeader` se possível (extrair pra util ou aceitar passar como prop)

### 2. Tela `app/(auth)/recover.tsx`

Estrutura espelha `signin.tsx`:

- `SafeAreaView` + `KeyboardAvoidingView` + `ScrollView`
- `AuthHeader` com tagline customizada: "Recuperar acesso"
  - **Atenção:** `AuthHeader` precisa aceitar prop opcional `tagline` pra customizar. Default continua "Memória inteligente do seu tratamento"
- `<TextField label="Email" ... />`
- `<AuthButton label="Enviar link" onPress={handleRecover} loading={loading} disabled={!email} />`
- (Erro geral, se houver): caption em `semanticCritical`
- `<AuthLink label="Voltar para o login" onPress={() => router.replace('/(auth)/signin')} />`

**Estados internos:**
- `email`, `loading`, `error`, **`sent`** (boolean — após sucesso)

**Quando `sent === true`**, render alternativo:
- Substitui inputs e botão por:
  - Texto centralizado (typography `subtitle`, color `textPrimary`): "Email enviado"
  - Texto secundário (typography `body`, color `textSecondary`): "Verifique sua caixa de entrada e siga o link para criar uma nova senha."
  - `<AuthButton variant="secondary" label="Voltar para o login" onPress={() => router.replace('/(auth)/signin')} />`

**`handleRecover`:**
- Valida via Zod (novo schema `recoverSchema = z.object({ email: z.string().email('Email inválido') })`)
- Chama `recoverPassword(email)` do `lib/supabase/auth.ts`
- Se sucesso → `setSent(true)`
- Se erro → mapear:
  - `Email not found` (ou similar) → "Email não encontrado. Verifique e tente novamente."
  - Network → "Sem conexão com a internet. Tente novamente."
  - Genérico → "Não foi possível enviar o email. Tente novamente."

**Decisão de UX:** mesmo se email não existir, retornar a tela de sucesso (não vazar quais emails estão cadastrados — segurança). Mas se houver erro de **rede**, mostrar erro real.

Atualizar para:
- Sempre que `recoverPassword` retornar sem erro de rede → `setSent(true)`, mesmo se email não for cadastrado (Supabase já trata isso silenciosamente — confirmar)
- Só se erro for de rede ou inesperado → exibir mensagem

### 3. Link "Esqueci minha senha" no `signin.tsx`

Adicionar entre o botão "Entrar" e o link "Não tem conta? Cadastre-se":

```tsx
<AuthLink
  label="Esqueci minha senha"
  onPress={() => router.push('/(auth)/recover')}
  accessibilityLabel="Recuperar senha"
/>
```

Layout: marginTop `sm` após o botão, antes do divisor pro "Cadastre-se".

### 4. Logout no Perfil

`app/(tabs)/perfil.tsx` hoje é placeholder. Substituir por uma versão mínima:

- `SafeAreaView` + `ScrollView`
- Header da tela: "Perfil" (typography `headline`)
- Card com email do usuário logado (typography `label` + `body`, lendo `session.user.email` via `useSession()`)
- Spacer
- `<AuthButton variant="secondary" label="Sair" onPress={handleSignOut} loading={loadingSignOut} />`
- Sem placeholder de "em construção" (é uma versão V1 funcional, mesmo que mínima)

**`handleSignOut`:**
- `setLoadingSignOut(true)`
- `await signOut()` (helper já existe)
- Guard global detecta `session: null` e redireciona automaticamente pra signin
- Não chamar `router.replace` manual aqui — confia no guard

### 5. Remover link `[DEV]` da Home

`app/(tabs)/index.tsx`:
- Remover o bloco `{__DEV__ && !session && (...)}` inteiro
- Remover imports não usados (`useSession`, `useRouter`, `Pressable`) se não forem mais necessários na Home

### 6. SplashView component

`components/auth/SplashView.tsx`:

```typescript
import { View, StyleSheet } from 'react-native'
import { colors, spacing, radius, typography } from '@lib/theme/tokens'

export function SplashView() {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.letter}>D</Text>
      </View>
    </View>
  )
}

// (styles equivalentes ao logo placeholder do AuthHeader)
```

### 7. AuthHeader — aceitar `tagline` opcional

```typescript
type AuthHeaderProps = {
  tagline?: string // default: "Memória inteligente do seu tratamento"
}

export function AuthHeader({ tagline = 'Memória inteligente do seu tratamento' }: AuthHeaderProps) { ... }
```

Sem breaking change — telas existentes (signin, signup) continuam funcionando sem props.

---

## Skills obrigatórias

| Skill | Por quê |
|---|---|
| `react-native-best-practices` | Expo Router patterns, useEffect dependencies, race conditions |
| `/impeccable craft` | Splash minimalista, tela "Email enviado" com hierarquia clara, consistência com signin/signup |
| `/impeccable harden` | Edge cases auth: cold start, sessão expirada, logout offline, double-tap |

---

## Validação automatizada via `react-native-devtools-mcp`

### Bateria de testes (executar em ordem)

| # | Ação | Tool | Critério de sucesso |
|---|---|---|---|
| 1 | App reload com sessão ativa | `js_eval('require("expo-updates").reload?.()')` ou kill+restart | Splash aparece brevemente → Home renderiza (não signin) |
| 2 | Screenshot Home com sessão | `screenshot` | Mostra Home (não link [DEV], que deve ter sumido) |
| 3 | Logout via Perfil | Navegar pra Perfil via `tap` na tab → `tap` no botão "Sair" | Loading no botão → guard redireciona pra signin automaticamente |
| 4 | Screenshot signin pós-logout | `screenshot` | Mostra tela signin (sessão limpa) |
| 5 | Tentar acessar `/(tabs)` sem sessão via deep link | `open_deeplink('doseday://tabs')` ou `js_eval` chamando router | Redireciona pra signin (guard global funcionando) |
| 6 | Signin novamente | `type_text` email + senha → `tap` Entrar | Redirect pra Home |
| 7 | Tentar acessar `/(auth)/signin` com sessão | `open_deeplink('doseday://auth/signin')` ou navegar manualmente | Redireciona pra tabs (guard reverso) |
| 8 | Tela recover password | A partir da signin: `tap` no link "Esqueci minha senha" | Tela recover renderiza com tagline "Recuperar acesso" |
| 9 | Screenshot recover inicial | `screenshot` | Header com tagline customizada + 1 input + botão "Enviar link" + link voltar |
| 10 | Envio com email válido | `type_text` `leonardo@teste.com` → `tap` Enviar link | Loading → tela "Email enviado" |
| 11 | Screenshot "Email enviado" | `screenshot` | Substituiu form pela mensagem de sucesso + botão "Voltar para o login" |
| 12 | Voltar pra signin | `tap` "Voltar para o login" | Tela signin renderiza |
| 13 | A11y splash + recover | `get_view_hierarchy` em ambas | Elementos com labels apropriados |
| 14 | Captura de logs durante sequência | `get_js_logs duration=30 level=error` | Sem erros JS (warnings de i18n preexistentes OK) |

### Greps técnicos

```bash
# Tipo-check + lint
npm run type-check
npm run lint

# Garantir que link [DEV] foi removido
grep -r "DEV" app/\(tabs\)/index.tsx
# Esperado: vazio

# Garantir que SplashView existe
ls components/auth/SplashView.tsx

# Garantir que recover schema foi adicionado
grep -n "recoverSchema" lib/validation/authSchemas.ts
# Esperado: 1+ linha

# Garantir que AuthGuard está no root layout
grep -n "AuthGuard\|useRootNavigationState" app/_layout.tsx
# Esperado: 2+ linhas

# Zero hard-coded em arquivos novos/modificados
grep -rE "#[0-9A-Fa-f]{6}" app/\(auth\)/recover.tsx app/\(tabs\)/perfil.tsx components/auth/SplashView.tsx
# Esperado: vazio
```

---

## Critérios de aceitação

- [ ] `AuthGuard` implementado no root layout, usando `useRootNavigationState()` + `useSegments()` + `useRouter()`
- [ ] `SplashView` criado em `components/auth/SplashView.tsx` (minimalista, sem ActivityIndicator)
- [ ] `app/(auth)/recover.tsx` funcional com estado `sent` que muda render
- [ ] `recoverSchema` adicionado em `lib/validation/authSchemas.ts`
- [ ] `AuthHeader` aceita prop opcional `tagline` (sem breaking change)
- [ ] Link "Esqueci minha senha" adicionado no `signin.tsx`
- [ ] `app/(tabs)/perfil.tsx` V1 com email do usuário + botão "Sair"
- [ ] Link `[DEV]` removido da Home + imports não usados removidos
- [ ] `handleSignOut` confia no guard global (não chama `router.replace` manual)
- [ ] Zero `as any` / `// @ts-ignore`
- [ ] Zero hard-coded color/font/spacing
- [ ] Vital Mint usado SÓ nos botões primários e logo placeholder
- [ ] A11y validado via `get_view_hierarchy` em recover + perfil + splash
- [ ] `npm run type-check` zero erros
- [ ] `npm run lint` zero erros novos
- [ ] **Bateria de 14 testes MCP executada com sucesso**
- [ ] **5 screenshots** capturados via MCP e anexados no PR:
  1. Splash discreta (cold start)
  2. Tela recover inicial
  3. Tela "Email enviado" pós-sucesso
  4. Tela Perfil com botão "Sair"
  5. Redirecionamento automático pós-logout (signin renderizada)
- [ ] `/impeccable critique` ≥ 28/40, P1/P2 resolvidos
- [ ] `/impeccable harden` rodado, edge cases endereçados
- [ ] Commit: `feat(auth): navigation guard + recover password + logout no Perfil`
- [ ] PR aberto com screenshots

---

## Restrições

- **Sem Apple Sign In** → Prompt 12+
- **Sem onboarding flow** → Prompt 13+
- **Sem profile editor** (Perfil V1 é só email + logout) → futuro
- **Sem mudanças no Supabase** (zero migrations, zero RLS)
- **Sem mudar** `lib/supabase/client.ts`, `lib/supabase/auth.ts`, `contexts/AuthContext.tsx`, `hooks/useSession.ts`, `lib/theme/tokens.ts`
- **Sem mudar Home/Doses além da remoção do [DEV] na Home**

---

## Antes de executar

1. Ler `docs/architecture.md` seções 14.0, 14.1, 15 (Aprendizados + uso do MCP)
2. Ler `docs/PRODUCT.md` seções "Persona primária — Mariana" e "Voice & Tone"
3. Ler `app/(auth)/signin.tsx` e `app/(auth)/signup.tsx` (recover.tsx segue o mesmo padrão)
4. Ler `lib/supabase/auth.ts` (`recoverPassword` helper já existe — não recriar)
5. Confirmar via `ping` do MCP que simulador está rodando
6. Confirmar credenciais de teste: `leonardo@teste.com` / `123456`

## Pós-execução

1. Rodar `/impeccable critique` com screenshot
2. Rodar `/impeccable harden` (edge cases: sessão expirada no meio do uso, logout offline, network durante recover)
3. Resolver P1/P2 do critique antes do commit
4. Capturar 5 screenshots finais via MCP e anexar no PR
5. Atualizar `docs/architecture.md` seção "Aprendizados" se houver descobertas (especialmente sobre `useRootNavigationState` ou comportamento de redirect em Expo Router 6+)
6. Atualizar `CLAUDE.md` tabela "Histórico" com linha do Prompt 11
7. PR description deve incluir:
   - Lista dos 5 screenshots e o que cada um valida
   - Explicação curta do padrão `AuthGuard` (1 frase)
   - Confirmação que link [DEV] sumiu
