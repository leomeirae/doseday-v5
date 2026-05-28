# Prompt 42f — MID — Fix sheet/tela Registrar Dose (chips visíveis + navegação segura)

**Skills obrigatórias:** `karpathy-guidelines`, `superpowers:writing-plans`, `react-native-best-practices`
**Branch:** `feature/42f-fix-registrar-dose-navegacao`
**Pré-requisito:** PR #88 mergeado em `main`
**Tipo:** fix de 3 bugs reportados pelo PO no teste — cirúrgico, sem refactor

---

# Objetivo

Corrigir 3 bugs reportados pelo PO ao testar o fluxo de registro de dose pós ciclo 42 completo:

1. **Chips de "Local da aplicação" parecem texto plano.** O componente `Chip` em `app/dose/registrar.tsx` existe e é funcional (Pressable + onPress), mas a aparência visual usa `bgElevated` (#0E1620) sobre `bgBase` (#050B12) — contraste imperceptível (~3% de luminância). Borda `rgba(255,255,255,0.12)` é 12% de opacidade — quase invisível. Resultado: usuário não sabe que os locais são clicáveis.

2. **Erro "GO_BACK was not handled by any navigator"** ao tentar sair de `/dose/registrar`. Há 3 chamadas `router.back()` nas linhas 97, 111 e 117 do arquivo — todas **sem fallback**. Quando a tela é aberta via deep-link ou quando o stack está vazio, o navegador não tem pra onde voltar.

3. **Tela `/(tabs)/doses` sem botão de voltar.** A tela foi desenhada como rota de tab (Tab Bar visível), mas a tab bar foi oculta no Prompt 42b. Agora, quando o usuário entra via `router.push('/(tabs)/doses')` (do card "Próxima dose" do Dashboard), fica **preso** lá sem botão de voltar.

# Contexto

- PO testou pós PR #88. Detectou os 3 bugs no mesmo fluxo (registrar dose + voltar).
- Estado real do código em `main`:
  - `app/dose/registrar.tsx` linha 213-222: `<View style={styles.chips}>` com `INJECTION_SITES.map((site) => <Chip ...>)` — funciona, só falta contraste visível.
  - `app/dose/registrar.tsx` linhas 97, 111, 117: 3× `router.back()` sem fallback.
  - `app/(tabs)/doses.tsx` linhas 25-46 aprox: header tem apenas `<Text>Doses</Text>` + Pressable com `+`. Sem chevron.left.
- Padrão de fallback de navegação que outras telas já usam (consultar `app/diario/anotar-sintoma.tsx` ou `app/memoria/index.tsx`):
  ```tsx
  function dismiss() {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(tabs)/index' as Href)
    }
  }
  ```

# O que analisar antes de alterar

1. **Ler `app/dose/registrar.tsx` linhas 350-376** — entender os styles atuais do Chip (`chip`, `chipSelected`, `chipPressed`, `chipLabel`, `chipLabelSelected`). Identificar o problema de contraste pra propor ajustes mínimos.

2. **Ler `app/dose/registrar.tsx` linhas 85-130** — identificar exatamente as 3 chamadas de `router.back()`. Confirmar contexto de cada uma (onSuccess do submit, onDismiss do modal, header X button).

3. **Ler `app/(tabs)/doses.tsx` linhas 25-50** — entender o `headlineRow` atual e onde inserir o botão de voltar. Confirmar que a tela usa `<SymbolView name="plus" .../>` como referência de padrão.

4. **Ler `app/diario/anotar-sintoma.tsx` ou `app/memoria/index.tsx`** — pegar o padrão exato de fallback (`router.canGoBack() ? router.back() : router.replace(...)`). Validar destino do replace (`/(tabs)/index`? `/memoria`?).

5. **Verificar `colors.bgSurface`** no `lib/theme/tokens.ts` — é `#1B2433`, mais claro que `bgElevated` (#0E1620). É o fundo correto pra chips destacados.

6. **Conferir cor `colors.brand`** (#00D4AA) — usar como destaque do selected do chip se já não for.

# Arquivos prováveis

**Modificar:**
- `app/dose/registrar.tsx` — ajustar styles do chip + adicionar fallback nas 3 `router.back()`
- `app/(tabs)/doses.tsx` — adicionar Pressable com chevron.left no `headlineRow`

**NÃO modificar:**
- Outros arquivos em `app/(tabs)/*` — esse PR é focado, não vai propagar fix de voltar pra `diario`, `relatorios`, `perfil` (mesmo que esses também tenham o problema — Léo não pediu)
- `lib/theme/tokens.ts` — usar cores existentes (`bgSurface`, `brand`), não inventar tokens
- Hooks, queries, schemas, outras telas

# Instruções

## 1. Fix chips de "Local da aplicação" (`app/dose/registrar.tsx`)

Atualizar styles do `Chip` pra ter contraste visível. Mudanças mínimas:

```diff
   chip: {
     paddingHorizontal: spacing.md,
     paddingVertical: spacing.xs,
     borderRadius: radius.full,
-    backgroundColor: colors.bgElevated,
-    borderWidth: 0.5,
-    borderColor: 'rgba(255,255,255,0.12)',
+    backgroundColor: colors.bgSurface,
+    borderWidth: StyleSheet.hairlineWidth,
+    borderColor: 'rgba(255,255,255,0.18)',
   },
   chipSelected: {
+    backgroundColor: 'rgba(0,212,170,0.15)',
     borderColor: colors.brand,
     borderWidth: 1,
   },
```

**Mudanças explicadas:**
- `backgroundColor: colors.bgSurface` (#1B2433) — agora tem contraste claro contra `bgBase` (#050B12). 
- `borderColor: 'rgba(255,255,255,0.18)'` — sobe de 12% pra 18% (mantém sutileza mas fica visível)
- `chipSelected` ganha `backgroundColor: 'rgba(0,212,170,0.15)'` — tom mint translúcido confirma seleção visualmente

Manter `chipLabel`/`chipLabelSelected` como estão (cor do texto já é boa).

## 2. Fix `router.back()` sem fallback (`app/dose/registrar.tsx`)

Adicionar função helper `dismiss` no topo do componente:

```tsx
function dismiss() {
  if (router.canGoBack()) {
    router.back()
  } else {
    router.replace('/(tabs)/index' as Href)
  }
}
```

Substituir as 3 chamadas:

- **Linha 97** (onSuccess do submit, após save): `router.back()` → `dismiss()`
- **Linha 111** (PermissionRequestModal onDismiss): `router.back()` → `dismiss()`
- **Linha 117** (botão X do header): `() => router.back()` → `dismiss`

**Importante:** verificar se `Href` já está importado em `app/dose/registrar.tsx`. Se não, adicionar: `import type { Href } from 'expo-router'`.

## 3. Adicionar botão de voltar em `app/(tabs)/doses.tsx`

Modificar o `headlineRow` pra ter 3 elementos: voltar (esquerda) + título (centro) + `+` (direita).

Atual:
```tsx
<View style={styles.headlineRow}>
  <Text style={styles.headline}>Doses</Text>
  <Pressable onPress={() => router.push('/dose/registrar')} ...>
    <SymbolView name="plus" size={22} tintColor={colors.brand} />
  </Pressable>
</View>
```

Novo:
```tsx
<View style={styles.headlineRow}>
  <Pressable
    onPress={() => {
      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace('/(tabs)/index' as Href)
      }
    }}
    hitSlop={8}
    accessibilityRole="button"
    accessibilityLabel="Voltar"
  >
    <SymbolView name="chevron.left" size={22} tintColor={colors.textPrimary} />
  </Pressable>
  <Text style={styles.headline}>Doses</Text>
  <Pressable
    onPress={() => router.push('/dose/registrar')}
    hitSlop={8}
    accessibilityLabel="Registrar nova dose"
    accessibilityRole="button"
  >
    <SymbolView name="plus" size={22} tintColor={colors.brand} />
  </Pressable>
</View>
```

**Atenção:** essa mudança aparece em **2 lugares** no arquivo (linhas 35-46 do estado de loading + linhas 95-100 do estado normal). Manter consistência nos dois.

**Validar `styles.headlineRow`** — provavelmente é `flexDirection: 'row'` com `justifyContent: 'space-between'`. Se sim, com 3 elementos pode ficar desalinhado. Pode precisar trocar pra `justifyContent: 'space-between' + alignItems: 'center'` ou usar `<View style={{width: 24}}/>` como spacer. **Decidir empiricamente no simulador.**

**Importante:** verificar se `Href` já está importado. Se não, adicionar.

## 4. Validação local

```bash
npm run type-check
npm run lint
npx expo start --clear
```

No simulador iOS, validar 6 fluxos:

1. Dashboard → toca em **card "Próxima dose"** → abre `/(tabs)/doses`
2. `/(tabs)/doses`: **botão de voltar (chevron.left)** visível no canto superior esquerdo + título "Doses" + `+` no canto direito
3. Toca em voltar → volta pro Dashboard
4. Toca em `+` → abre `/dose/registrar` (sheet)
5. Em `/dose/registrar`: chips de "Local da aplicação" têm **fundo visível e borda destacada**. Toca em "Abdome" → fica selecionado (border + bg com tom mint)
6. Toca em X (canto superior esquerdo) → fecha o sheet **sem erro** GO_BACK

Capturar 4 screenshots em `assets/screenshots/prompt42f/`:
- Tela `/(tabs)/doses` com botão de voltar visível
- Sheet `/dose/registrar` com chips visíveis (não selecionados)
- Sheet `/dose/registrar` com chip selecionado (mostrando estado visual)
- Fluxo de fechar sheet sem erro

## 5. Commit + PR

```bash
git add -A
git status --short  # validar zero artifacts
git commit -m "fix(dose,doses): chips visíveis + navegação com fallback + botão de voltar em /(tabs)/doses"
git push -u origin feature/42f-fix-registrar-dose-navegacao
```

Abrir PR via MCP GitHub. Description menciona: "Prompt 42f — fix 3 bugs reportados no fluxo de Registrar Dose."

# O que preservar

- **Lógica do submit do form** (`handleSubmit`) intocada — só substitui `router.back()` por `dismiss()`
- **`PermissionRequestModal`** intacto — só substitui `onDismiss` interno
- **Outros elementos do `/(tabs)/doses`** — botão `+` continua igual, listas de Próximas/Histórico intactas
- **Tokens** `colors.bgSurface`, `colors.brand`, `radius.full` — reutilizar, não inventar novos
- **Tela `/(tabs)/doses` em StyleSheet** — não migrar pra NativeWind aqui (consistência)

# Critérios de sucesso (verificáveis)

- [ ] `grep -c "router.back()" app/dose/registrar.tsx` retorna **0** (todas substituídas)
- [ ] `grep -c "dismiss()" app/dose/registrar.tsx` retorna **≥3** (3 lugares trocados)
- [ ] `grep -c "canGoBack" app/dose/registrar.tsx` retorna **≥1** (função helper criada)
- [ ] `grep -c "chevron.left" "app/(tabs)/doses.tsx"` retorna **≥2** (2 estados: loading + normal)
- [ ] `grep "backgroundColor: colors.bgSurface" app/dose/registrar.tsx` retorna match no chip
- [ ] `npm run type-check` passa
- [ ] `npm run lint` passa
- [ ] 4 screenshots em `assets/screenshots/prompt42f/`
- [ ] `git diff --stat` mostra **apenas** 2 arquivos modificados (app/dose/registrar.tsx + app/(tabs)/doses.tsx) + screenshots + plano persistido + docs/history.md
- [ ] `git status --short` confirma zero artifacts antigos

# Restrições

- **Não propagar fix de voltar pra outras tabs** (`diario`, `relatorios`, `perfil`). PO não pediu. Pode entrar em prompt futuro se precisar.
- **Não criar componente Chip novo** em `components/ui/`. Manter o `function Chip` interno do arquivo.
- **Não mexer em tokens** (`lib/theme/tokens.ts`). Usar cores existentes (`bgSurface`, `brand`) e literais quando necessário (rgba mint translúcido).
- **Não tocar em hooks, queries, schemas, validação Zod**.
- **Não tocar em `PermissionRequestModal`** internamente.
- **Não migrar pra NativeWind** nesse prompt (mantém StyleSheet).
- **Validar `git status --short` antes de `git add`**.
- **Parar e reportar** se `Href` não estiver importável de `expo-router` na versão atual.

---

**Karpathy assumptions explícitos:**
- `Href` é exportado de `expo-router` (já usado em vários arquivos do projeto)
- `router.canGoBack()` retorna `boolean` confiável (padrão Expo Router 6)
- Padrão de fallback `router.replace('/(tabs)/index')` é coerente com outras telas (validar)
- `colors.bgSurface` (#1B2433) tem contraste suficiente contra `bgBase` (#050B12) — diferença de ~22% de luminância vs ~3% antes
- Chip selecionado com `rgba(0,212,170,0.15)` (mint 15% opacity) é visível mas não chamativo demais — alinhado com guideline iOS
- Mudança em `/(tabs)/doses.tsx` afeta 2 estados (loading + normal) — manter consistência
- Não há outras telas em `(tabs)/*` sendo acessadas via `router.push` no momento (só `/(tabs)/doses` via card Dashboard)

**Could 50 lines do this?** **Sim, próximo de 50.** 3 fixes cirúrgicos em 2 arquivos. Cada um é um diff pequeno.

**Success criteria verificáveis:** ver checklist acima — todos rodáveis via grep + npm.

**Próximos passos (roadmap, não dependência):**
- Avaliar se outras telas `(tabs)/*` precisam de botão de voltar (depende se serão acessadas via push)
- Possível Prompt 42g caso outros bugs apareçam no teste
- Eventualmente fechar ciclo 42 e abrir conversa nova pra próximo tema
