# Prompt 10-MID-telas-signin-signup

**Branch:** `feature/10-telas-signin-signup`
**Modelo recomendado:** Sonnet (decisões visuais reais + integração auth + edge cases)
**Pré-requisito:** Prompt 09 mergeado em `main`. `react-native-devtools-mcp` instalado e conectado (validado via `ping`).

---

## Contexto

Auth infra do Prompt 09 funcionando — `supabase` client, `AuthProvider`, `useSession`, helpers `signIn/signUp/signOut/recoverPassword`. Agora vamos plugar a **UI** que consome essa fundação.

Persona-alvo: **Mariana** (38 anos, classe B, pouco tempo de tela, em tratamento ativo com canetinha GLP-1). Veja `docs/PRODUCT.md` para Voice & Tone (tom calmo, 2ª pessoa, presente, sem cobrança, sem jargão técnico desnecessário).

**Posicionamento ANCORA:** "Memória inteligente do seu tratamento" — tagline da tela de boas-vindas.

Este é o **primeiro prompt onde o Léo não toca no simulador.** Validação ponta-a-ponta via `react-native-devtools-mcp`:
- `screenshot` em cada estado relevante
- `js_eval` testando signIn/signUp programaticamente
- `tap` + `type_text` simulando interação real
- `get_view_hierarchy` validando a11y
- `get_js_logs` capturando erros

---

## Tarefa

Criar Stack `(auth)` route group com 2 telas (signin + signup), form components reutilizáveis, validação Zod, integração com `lib/supabase/auth.ts`. Após auth bem-sucedido, redirecionar manualmente para `/(tabs)`. Navigation guard global (auto-redirect) fica para o Prompt 11.

### Estrutura

```
app/(auth)/
├── _layout.tsx          ← Stack navigator headerless
├── signin.tsx           ← Tela de login
└── signup.tsx           ← Tela de cadastro

components/auth/
├── TextField.tsx        ← Input com label + error state + secureTextEntry
├── AuthButton.tsx       ← Botão primário com loading state
├── AuthLink.tsx         ← Link textual ("Já tem conta?")
└── AuthHeader.tsx       ← Logo placeholder + tagline ("Memória inteligente do seu tratamento")

lib/validation/
└── authSchemas.ts       ← Zod schemas (signInSchema, signUpSchema)
```

### Componentes — especificação

**1. `AuthHeader`**
- Layout vertical centralizado
- Top: ícone placeholder (View 64×64, radius `xl`, bg `bgElevated` com letra "D" em `display` color `brand` — temporário, substitui por logo no futuro)
- Texto 1 (typography `headline`, color `textPrimary`): "DoseDay"
- Texto 2 (typography `body`, color `textSecondary`): "Memória inteligente do seu tratamento"
- Padding top `xxl`, bottom `xl`

**2. `TextField`**
- Props: `label: string`, `value: string`, `onChangeText: (v: string) => void`, `error?: string`, `secureTextEntry?: boolean`, `keyboardType?: KeyboardType`, `autoCapitalize?: 'none' | 'sentences'`, `placeholder?: string`, `accessibilityLabel?: string`, `testID?: string`
- Layout vertical:
  - Label (typography `label`, color `textSecondary`)
  - Input (`TextInput` do RN):
    - bg `bgElevated`, padding horizontal `md`, padding vertical `sm`
    - radius `md`, border `1px` color `bgSurface` (default) ou `semanticCritical` (se `error`)
    - typography `body`, color `textPrimary`
    - placeholderTextColor: `textTertiary`
    - selectionColor: `brand`
  - Error (se houver): typography `caption`, color `semanticCritical`, marginTop `xxs`
- A11y: `accessibilityLabel` (vem de props) + `accessibilityHint` derivado do error

**3. `AuthButton`**
- Props: `label: string`, `onPress: () => void`, `loading?: boolean`, `disabled?: boolean`, `variant?: 'primary' | 'secondary'`, `accessibilityLabel?: string`, `testID?: string`
- **Primary:** bg `brand`, text color `textInverse`, typography `label`. Esta é a aplicação intencional de Vital Mint (CTA principal — regra Rarity respeitada porque é exclusivo do botão de auth)
- **Secondary:** bg transparente, border `1px` `bgSurface`, text color `textPrimary`
- Loading: troca label por `ActivityIndicator` (color `textInverse` no primary, `textPrimary` no secondary)
- Disabled: opacity 0.5, `disabled={true}` no Pressable, sem onPress
- Altura: 52pt, padding horizontal `lg`, radius `md`
- Press feedback: scale 0.98 via Pressable (sem haptic — auth não é frequente)

**4. `AuthLink`**
- Props: `label: string`, `onPress: () => void`, `accessibilityLabel?: string`
- Text simples, typography `body`, color `textSecondary`, com sublinhado underline
- Centro horizontal
- Padding vertical `sm`

### Telas

**`app/(auth)/_layout.tsx`**
- `<Stack>` do expo-router
- `screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgBase } }}`
- Sem tab bar (já está fora de `(tabs)`)

**`app/(auth)/signin.tsx`**
- `SafeAreaView` + `KeyboardAvoidingView` (behavior: padding no iOS) + `ScrollView`
- Estados: `email`, `password`, `loading`, `error`
- Layout vertical, padding horizontal `lg`:
  1. `<AuthHeader />`
  2. `<TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={emailError} accessibilityLabel="Campo de email" />`
  3. `<TextField label="Senha" value={password} onChangeText={setPassword} secureTextEntry error={passwordError} accessibilityLabel="Campo de senha" />`
  4. `<AuthButton label="Entrar" onPress={handleSignIn} loading={loading} disabled={!email || !password} />` (marginTop `lg`)
  5. (Erro geral, se houver): `<Text>` com `caption` em `semanticCritical` (centro)
  6. `<AuthLink label="Não tem conta? Cadastre-se" onPress={() => router.replace('/(auth)/signup')} />`
- `handleSignIn`:
  - Valida via `signInSchema.safeParse({ email, password })`
  - Se inválido: seta `emailError` / `passwordError`
  - Se válido: `setLoading(true)`, chama `signIn(email, password)`, se OK → `router.replace('/(tabs)')`, se erro → seta erro geral
  - Mapeia erros comuns do Supabase pra mensagens em PT-BR:
    - `Invalid login credentials` → "Email ou senha incorretos"
    - `Email not confirmed` → "Confirme seu email antes de entrar"
    - Network errors → "Sem conexão com a internet. Tente novamente."
    - Genérico (fallback) → "Não foi possível entrar. Tente novamente."

**`app/(auth)/signup.tsx`**
- Mesma estrutura da signin, com diferenças:
  - Tagline: "Comece sua memória do tratamento"
  - Campo extra: `<TextField label="Nome" value={name} onChangeText={setName} autoCapitalize="words" accessibilityLabel="Campo de nome" />`
  - Botão: "Criar conta"
  - Link: "Já tem conta? Entrar" → `router.replace('/(auth)/signin')`
- `handleSignUp`:
  - Valida via `signUpSchema.safeParse({ name, email, password })`
  - Se OK: `signUp(email, password, { full_name: name })` → se sessão criada → `router.replace('/(tabs)')`
  - Mapeia erros:
    - `User already registered` → "Esse email já tem uma conta. Tente entrar."
    - `Password should be at least 6 characters` → "Senha deve ter pelo menos 6 caracteres"
    - Network → "Sem conexão com a internet. Tente novamente."
    - Genérico → "Não foi possível criar a conta. Tente novamente."

### Validação Zod (`lib/validation/authSchemas.ts`)

```typescript
import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const signUpSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
```

**Nota:** signup exige 8 chars, signin aceita 6 (legado V4 — 105 usuários podem ter senhas curtas). Novo usuário tem padrão maior.

### Entry point — onde o app começa hoje sem auth guard?

Por enquanto, a Home (`app/(tabs)/index.tsx`) é o entry. Após este prompt, o app continua entrando na Home — sessão pode estar vazia ou cheia. Sem redirect automático ainda.

**Decisão deste prompt:** adicionar **um link discreto temporário** no rodapé da Home pra navegar pra `/(auth)/signin` durante o desenvolvimento. Algo como:
```tsx
{__DEV__ && !session && (
  <Pressable onPress={() => router.push('/(auth)/signin')}>
    <Text style={{ color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xl }}>
      [DEV] Ir pra signin
    </Text>
  </Pressable>
)}
```

Esse link some em produção (`__DEV__ === false`) e some quando há sessão. **Será removido completamente no Prompt 11** quando o navigation guard global entrar.

---

## Skills obrigatórias

| Skill | Por quê |
|---|---|
| `react-native-best-practices` | Forms, KeyboardAvoidingView, a11y, type-safe props |
| `/impeccable craft` | Hierarquia visual + Vital Mint Rarity (CTA principal) + consistência com Home/Doses |
| `/impeccable harden` | Edge cases auth: rede caída, email duplicado, credenciais inválidas, email não confirmado |

---

## Validação automatizada (via `react-native-devtools-mcp`)

**Claude Code NÃO delega passos manuais ao Léo.** Toda validação visual e funcional roda via MCP.

### Bateria de validação (executar em ordem)

| # | Ação | Tool MCP | Critério de sucesso |
|---|---|---|---|
| 1 | App abre, navegar pra signin | `tap` no link [DEV] da Home | Tela `/(auth)/signin` renderiza |
| 2 | Screenshot signin (estado inicial) | `screenshot` | Header + 2 inputs + botão "Entrar" + link "Cadastre-se" visíveis |
| 3 | Validação a11y signin | `get_view_hierarchy` | Inputs têm `accessibilityLabel`, botão tem `accessibilityRole="button"` |
| 4 | Type email + senha (válidos) | `tap` + `type_text` no campo email com `leonardo@teste.com`, depois senha com `123456` | Inputs aceitam texto |
| 5 | Tap "Entrar" | `tap` no botão | Loading state aparece (screenshot) |
| 6 | Captura logs durante signIn | `get_js_logs duration=5` | Log de signIn sem erro |
| 7 | Verificação de redirect | `screenshot` após 2-3s | Mostra Home (sessão criada, redirect funcionou) |
| 8 | Testar erro: senha errada | Limpar campos → `type_text` email correto + senha "errada1" → `tap` Entrar | Mensagem "Email ou senha incorretos" aparece |
| 9 | Screenshot do erro | `screenshot` | Erro renderiza em semanticCritical |
| 10 | Navegar pra signup | `tap` no link "Não tem conta? Cadastre-se" | Tela signup renderiza |
| 11 | Screenshot signup | `screenshot` | Header + 3 inputs (nome, email, senha) + botão "Criar conta" |
| 12 | Validação a11y signup | `get_view_hierarchy` | Todos campos com a11y |
| 13 | Voltar pra signin | `tap` no link "Já tem conta? Entrar" | Tela signin renderiza |
| 14 | js_eval: signOut + tentar acessar tabs sem sessão | `js_eval('await window.supabase.auth.signOut()')` (se exposto) ou via `tap` no botão de logout (futuro) | Sessão limpa (depois Prompt 11 cuidará do redirect) |

**Resultado esperado:** anexar **5 screenshots** ao PR (signin inicial, signin com erro, signin loading, signup inicial, transição pós-signin pra Home).

### Greps de validação técnica

```bash
# Zero hard-coded color/font/spacing em components/auth e app/(auth)
grep -rE "#[0-9A-Fa-f]{6}" components/auth/ app/\(auth\)/
# Esperado: vazio (rgba pode aparecer em border, OK se em variável)

# Brand color SÓ no botão primário (AuthButton primary)
grep -rn "colors.brand" components/auth/ app/\(auth\)/
# Esperado: aparece SÓ em AuthButton.tsx (variant primary) + AuthHeader.tsx (letra D placeholder)

# Sem BlurView
grep -r "BlurView" components/auth/ app/\(auth\)/
# Esperado: vazio

# Type-check + lint
npm run type-check
npm run lint
```

---

## Critérios de aceitação

- [ ] Stack `(auth)` criada com `_layout.tsx`, `signin.tsx`, `signup.tsx`
- [ ] Componentes `TextField`, `AuthButton`, `AuthLink`, `AuthHeader` criados e reutilizáveis
- [ ] `lib/validation/authSchemas.ts` com `signInSchema` + `signUpSchema` + types
- [ ] Telas usam `KeyboardAvoidingView` (iOS padding) e `ScrollView`
- [ ] `handleSignIn` e `handleSignUp` com validação Zod + integração com `lib/supabase/auth.ts`
- [ ] Mapeamento de erros do Supabase pra PT-BR (lista completa acima)
- [ ] Redirect manual para `/(tabs)` após auth bem-sucedido
- [ ] Link temporário `[DEV]` na Home pra acessar signin (some em prod e quando há sessão)
- [ ] Zero hard-coded color/font/spacing — tudo via tokens
- [ ] Vital Mint usado SÓ no botão primário (CTA) e na letra "D" do placeholder do header
- [ ] A11y validado via `get_view_hierarchy` (todos inputs e botões com labels)
- [ ] Sem `BlurView`/glass nas telas de auth (camada de conteúdo)
- [ ] Sem `as any` / `// @ts-ignore`
- [ ] `npm run type-check` zero erros
- [ ] `npm run lint` zero erros novos (warning preexistente de i18n persiste)
- [ ] Bateria de 14 testes via MCP executada com sucesso
- [ ] 5 screenshots anexados ao PR (capturados via MCP)
- [ ] `/impeccable critique` score ≥ 28/40
- [ ] `/impeccable harden` rodado, edge cases cobertos
- [ ] Issues bloqueantes (P1, P2) do critique resolvidos antes do commit
- [ ] Commit: `feat(auth): telas signin + signup com validação Zod + redirect manual`
- [ ] PR aberto com screenshots anexados

---

## Restrições

- **Sem navigation guard global.** Redirect só dentro de `handleSignIn`/`handleSignUp` (`router.replace('/(tabs)')`). Guard global fica para Prompt 11
- **Sem recover password.** Fica para Prompt 11
- **Sem Apple Sign In.** Fica para Prompt 12+
- **Sem onboarding.** Fica para Prompt 13+
- **Sem mudanças no Supabase.** Zero migrations, zero RLS, zero new tables
- **Sem mudanças em** `lib/supabase/client.ts`, `lib/supabase/auth.ts`, `contexts/AuthContext.tsx`, `hooks/useSession.ts`, `lib/theme/tokens.ts`
- **Sem alterar Home/Doses** além do link temporário `[DEV]` na Home

---

## Antes de executar

1. Ler `docs/architecture.md` seções 14.0, 14.1 e **15** (Aprendizados + uso do `react-native-devtools-mcp`)
2. Ler `docs/PRODUCT.md` seções "Persona primária — Mariana" e "Voice & Tone"
3. Ler `docs/DESIGN.md` seções "Named Rules", "Components > Buttons", "Components > Inputs"
4. Ler `lib/supabase/auth.ts` (helpers já existentes — não recriar)
5. Ler `components/home/InsightCard.tsx` (padrão de border 0.5px é reaproveitado em TextField)
6. Confirmar via `ping` do MCP que simulador está rodando antes de começar

## Pós-execução

1. Rodar `/impeccable critique` com screenshot capturado via MCP
2. Resolver P1 e P2 antes do commit
3. Rodar `/impeccable harden` pra revisar edge cases (rede caída, retry, etc)
4. Capturar 5 screenshots finais via MCP + anexar no PR description
5. Atualizar `docs/architecture.md` seção "Aprendizados" se algo novo for descoberto (especialmente com `js_eval` ou edge cases do supabase em RN)
6. Atualizar `CLAUDE.md` tabela "Histórico" com linha do Prompt 10
7. PR description deve incluir:
   - "Primeiro prompt com validação 100% via `react-native-devtools-mcp`"
   - Lista dos 5 screenshots e o que cada um valida
   - Lista de erros mapeados (Supabase → PT-BR)
   - Confirmação que o link `[DEV]` na Home some em produção
