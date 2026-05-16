# Tab Bar 5 Abas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a tela "DoseDay / V5 — Inicializando" por uma tab bar com 5 abas usando expo-blur (BlurView) + expo-symbols (SF Symbols), com animação de tap via Reanimated 4 + haptic feedback.

**Architecture:** `app/(tabs)/_layout.tsx` define o `<Tabs>` navigator com BlurView como background. `app/index.tsx` é deletado; `app/(tabs)/index.tsx` assume a rota raiz. Um componente `TabBarButton` customizado encapsula Reanimated scale + Haptics.selectionAsync. Cada tela placeholder renderiza título + subtítulo "em construção" com tokens canônicos.

**Tech Stack:** expo-router Tabs, expo-blur BlurView, expo-symbols SymbolView, react-native-reanimated 4.x, expo-haptics, react-native-safe-area-context, lib/theme/tokens.ts (somente leitura)

---

## Contexto crítico (ler antes de qualquer coisa)

| Item | Estado |
|---|---|
| `expo-blur` | ✅ já instalado (v15.0.8) |
| `expo-haptics` | ✅ já instalado (v15.0.8) |
| `react-native-reanimated` | ✅ já instalado (~4.1.1) |
| `expo-symbols` | ❌ precisa instalar via `npx expo install expo-symbols` |
| `@expo/ui` | ❌ PROIBIDO — aprendizado #1 do Prompt 00 |
| `lib/theme/tokens.ts` | ❌ NÃO TOCAR — finalizado no Prompt 03 |
| `app.json` deploymentTarget | ⚠️ não explícito → Expo SDK 54 default iOS 15.1 |
| `chart.bar.doc.horizontal` | ⚠️ iOS 16+ → usar fallback `chart.bar.fill` (iOS 14+) |
| `typography.tabLabel.fontFamily` | ⚠️ `'system'` não é font válida no RN → extrair apenas fontSize/fontWeight/lineHeight |

---

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `app/index.tsx` | **DELETAR** | Rota raiz migra para (tabs)/index.tsx |
| `app/_layout.tsx` | **SEM ALTERAÇÃO** | Stack + providers já corretos |
| `app/(tabs)/_layout.tsx` | **CRIAR** | Tabs navigator com BlurView, 5 screens, SafeArea |
| `app/(tabs)/index.tsx` | **CRIAR** | Tela Início — placeholder |
| `app/(tabs)/doses.tsx` | **CRIAR** | Tela Doses — placeholder |
| `app/(tabs)/diario.tsx` | **CRIAR** | Tela Diário — placeholder |
| `app/(tabs)/relatorios.tsx` | **CRIAR** | Tela Relatórios — placeholder |
| `app/(tabs)/perfil.tsx` | **CRIAR** | Tela Perfil — placeholder |
| `components/ui/TabBarButton.tsx` | **CRIAR** | Custom button: scale 0.96 + haptic seleção |

---

## Task 1: Criar branch e instalar expo-symbols

**Files:**
- Nenhum arquivo de código — apenas setup

- [ ] **Step 1: Criar a branch de feature**

```bash
git checkout -b feature/04-tab-bar-5-abas
```

Expected: `Switched to a new branch 'feature/04-tab-bar-5-abas'`

- [ ] **Step 2: Instalar expo-symbols**

```bash
npx expo install expo-symbols
```

Expected: saída do npm install sem erros. O comando garante versão compatível com SDK 54.

- [ ] **Step 3: Verificar instalação**

```bash
grep '"expo-symbols"' package.json
```

Expected: linha contendo `"expo-symbols": "~..."` com versão preenchida.

---

## Task 2: Remover rota raiz conflitante

**Files:**
- Delete: `app/index.tsx`

⚠️ **IMPORTANTE:** `app/index.tsx` e `app/(tabs)/index.tsx` resolveriam para a mesma rota `/`. Manter os dois gera erro de rota duplicada. Deletar o antigo primeiro.

- [ ] **Step 1: Deletar app/index.tsx**

```bash
rm app/index.tsx
```

Expected: sem output. O arquivo não existe mais.

- [ ] **Step 2: Verificar que foi removido**

```bash
ls app/
```

Expected: apenas `_layout.tsx` e `+not-found.tsx` listados. Sem `index.tsx`.

---

## Task 3: Criar TabBarButton com animação + haptic

**Files:**
- Create: `components/ui/TabBarButton.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
// components/ui/TabBarButton.tsx
import { Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import type {
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
  AccessibilityRole,
} from 'react-native'

const ACTIVE_TINT = 'rgba(0, 212, 170, 0.12)' as const

type TabBarButtonProps = {
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: ((e: GestureResponderEvent) => void) | null
  onLongPress?: ((e: GestureResponderEvent) => void) | null
  accessibilityState?: { selected?: boolean; disabled?: boolean }
  accessibilityLabel?: string
  accessibilityRole?: AccessibilityRole
  testID?: string
}

export function TabBarButton({
  children,
  style,
  onPress,
  onLongPress,
  accessibilityState,
  accessibilityLabel,
  accessibilityRole,
  testID,
}: TabBarButtonProps) {
  const scale = useSharedValue(1)
  const isSelected = accessibilityState?.selected === true

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: isSelected ? ACTIVE_TINT : 'transparent',
  }))

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 100 })
        Haptics.selectionAsync()
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 })
      }}
      onPress={onPress ?? undefined}
      onLongPress={onLongPress ?? undefined}
      style={style}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      testID={testID}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  )
}
```

> Nota: `ACTIVE_TINT` é um inline const porque `rgba(0, 212, 170, 0.12)` não existe em `colors` e tokens.ts não pode ser modificado.

- [ ] **Step 2: Verificar que o arquivo foi criado**

```bash
ls components/ui/TabBarButton.tsx
```

Expected: arquivo listado.

---

## Task 4: Criar app/(tabs)/_layout.tsx — Tab Bar principal

**Files:**
- Create: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Criar o diretório e o arquivo de layout**

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { BlurView } from 'expo-blur'
import { SymbolView } from 'expo-symbols'
import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@lib/theme/tokens'
import { TabBarButton } from '@components/ui/TabBarButton'

const TAB_BAR_HEIGHT = 49

export default function TabsLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          lineHeight: 14,
        },
        tabBarButton: (props) => <TabBarButton {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          accessibilityLabel: 'Início',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name={focused ? 'house.fill' : 'house'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="doses"
        options={{
          title: 'Doses',
          accessibilityLabel: 'Doses',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name={focused ? 'cross.case.fill' : 'cross.case'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="diario"
        options={{
          title: 'Diário',
          accessibilityLabel: 'Diário',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name={focused ? 'book.closed.fill' : 'book.closed'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="relatorios"
        options={{
          title: 'Relatórios',
          accessibilityLabel: 'Relatórios',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name={focused ? 'chart.bar.fill' : 'chart.bar'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          accessibilityLabel: 'Perfil',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name={focused ? 'person.crop.circle.fill' : 'person.crop.circle'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
    </Tabs>
  )
}
```

> Nota: `chart.bar.doc.horizontal` usa iOS 16+. Como `app.json` não define `deploymentTarget` (Expo SDK 54 default = iOS 15.1), usamos `chart.bar.fill` que é iOS 14+.

> Nota: `tabBarLabelStyle` usa valores diretos de `typography.tabLabel` sem `fontFamily` — `'system'` não é fonte válida em RN e causaria warning.

- [ ] **Step 2: Verificar estrutura criada**

```bash
ls app/\(tabs\)/
```

Expected: `_layout.tsx` listado.

---

## Task 5: Criar as 5 telas placeholder

**Files:**
- Create: `app/(tabs)/index.tsx`
- Create: `app/(tabs)/doses.tsx`
- Create: `app/(tabs)/diario.tsx`
- Create: `app/(tabs)/relatorios.tsx`
- Create: `app/(tabs)/perfil.tsx`

- [ ] **Step 1: Criar app/(tabs)/index.tsx**

```tsx
// app/(tabs)/index.tsx
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@lib/theme/tokens'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Início</Text>
      <Text style={styles.subtitle}>em construção</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgBase,
    padding: spacing.lg,
  },
  title: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
})
```

- [ ] **Step 2: Criar app/(tabs)/doses.tsx**

```tsx
// app/(tabs)/doses.tsx
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@lib/theme/tokens'

export default function DosesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Doses</Text>
      <Text style={styles.subtitle}>em construção</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgBase,
    padding: spacing.lg,
  },
  title: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
})
```

- [ ] **Step 3: Criar app/(tabs)/diario.tsx**

```tsx
// app/(tabs)/diario.tsx
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@lib/theme/tokens'

export default function DiarioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diário</Text>
      <Text style={styles.subtitle}>em construção</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgBase,
    padding: spacing.lg,
  },
  title: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
})
```

- [ ] **Step 4: Criar app/(tabs)/relatorios.tsx**

```tsx
// app/(tabs)/relatorios.tsx
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@lib/theme/tokens'

export default function RelatoriosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relatórios</Text>
      <Text style={styles.subtitle}>em construção</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgBase,
    padding: spacing.lg,
  },
  title: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
})
```

- [ ] **Step 5: Criar app/(tabs)/perfil.tsx**

```tsx
// app/(tabs)/perfil.tsx
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@lib/theme/tokens'

export default function PerfilScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.subtitle}>em construção</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgBase,
    padding: spacing.lg,
  },
  title: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
})
```

- [ ] **Step 6: Verificar estrutura completa**

```bash
ls app/\(tabs\)/
```

Expected: `_layout.tsx  diario.tsx  doses.tsx  index.tsx  perfil.tsx  relatorios.tsx`

---

## Task 6: TypeScript check

**Files:**
- Nenhum

- [ ] **Step 1: Rodar tsc**

```bash
npx tsc --noEmit
```

Expected: zero linhas de output (sem erros).

Se aparecer erro sobre `TabBarButton` props, verificar se o tipo de `onPress`/`onLongPress` aceita `null`. A definição usa `| null` explicitamente.

Se aparecer erro sobre `SymbolView`, confirmar que `expo-symbols` foi instalado corretamente e que o `.expo/types` foi gerado.

---

## Task 7: Build e testar no simulador

**Files:**
- Nenhum

- [ ] **Step 1: Build para iOS 26**

```bash
npx expo run:ios
```

> ⚠️ NÃO usar `npx expo start --ios` — aprendizado #2 do Prompt 00. iOS 26 não tem Expo Go.

Expected: build sem erros, simulador abre com tab bar visível na parte inferior.

- [ ] **Step 2: Validar cada aba manualmente no simulador**

Verificar:
1. Tab bar aparece na parte inferior com blur glass discreto
2. Aba "Início" ativa (ícone house.fill em #00D4AA, label em verde)
3. Tela "Início · em construção" com fundo #050B12 (Clinical Midnight)
4. Tocar "Doses" → navega, ícone ativo em verde, ícones inativos em #9CA8B8
5. Tocar "Diário" → navega
6. Tocar "Relatórios" → navega (ícone chart.bar)
7. Tocar "Perfil" → navega
8. Glass não aparece em conteúdo de tela — APENAS na tab bar
9. Haptic vibra levemente no tap (testar em device físico se disponível)
10. Safe area inferior respeitada (sem sobreposição com home indicator)

---

## Task 8: Commit + PR + Handoff

**Files:**
- Nenhum (commit dos arquivos criados/deletados)

- [ ] **Step 1: Adicionar arquivos ao staging**

```bash
git add app/\(tabs\)/_layout.tsx \
        app/\(tabs\)/index.tsx \
        app/\(tabs\)/doses.tsx \
        app/\(tabs\)/diario.tsx \
        app/\(tabs\)/relatorios.tsx \
        app/\(tabs\)/perfil.tsx \
        components/ui/TabBarButton.tsx \
        package.json \
        package-lock.json
git rm app/index.tsx
```

- [ ] **Step 2: Verificar staging**

```bash
git status
```

Expected: 7 arquivos novos + 1 deletado + package.json/lock alterados no staging.

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(nav): tab bar 5 abas com BlurView glass + SF Symbols + haptic

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Push e abrir PR**

```bash
git push -u origin feature/04-tab-bar-5-abas
gh pr create \
  --title "feat(nav): tab bar 5 abas com BlurView glass + SF Symbols" \
  --body "$(cat <<'EOF'
## O que muda

- Estrutura de navegação `app/(tabs)/` com 5 rotas criada
- Tab bar com `expo-blur` BlurView (tint dark, intensity 80) — glass exclusivo na navegação
- SF Symbols via `expo-symbols` — ícones nativos iOS sem emoji
- Estado ativo em `colors.brand` (#00D4AA), inativo em `colors.textSecondary` (#9CA8B8)
- Animação de tap: scale 0.96 via Reanimated 4 + haptic `selectionAsync`
- Safe Area inferior respeitada via `useSafeAreaInsets`
- 5 telas placeholder com tokens canônicos (title + subtitle "em construção")
- `app/index.tsx` removido (conflito de rota com `(tabs)/index.tsx`)

## Por que chart.bar em vez de chart.bar.doc.horizontal

`chart.bar.doc.horizontal` é iOS 16+. `app.json` não define `deploymentTarget` → Expo SDK 54 default é iOS 15.1. Usando `chart.bar` (iOS 14+) para garantir compatibilidade.

## O que NÃO muda

- `lib/theme/tokens.ts` intocado
- `app/_layout.tsx` intocado (Stack + providers continuam corretos)
- `app.json`, `eas.json`, configs de build: intocados

## Critérios de aceitação

- [x] 5 abas navegáveis no simulador iOS 26
- [x] Glass APENAS na tab bar
- [x] `tsc --noEmit` zero erros
- [x] Ativo em verde-menta, inativo em cinza-azulado
- [x] Safe area respeitada

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Rodar /handoff**

Executar `/handoff` para salvar estado em `docs/handoff/HANDOFF-prompt-04.md`.

---

## Self-Review contra o spec

| Critério de aceitação do Prompt 04 | Coberto? |
|---|---|
| Pasta `app/(tabs)/` com 5 rotas | ✅ Task 5 |
| `app/(tabs)/_layout.tsx` define tab bar | ✅ Task 4 |
| `app/_layout.tsx` root mantém providers | ✅ sem alteração necessária |
| Tab bar usa BlurView (expo-blur) | ✅ Task 4 |
| 5 tabs com SF Symbol via expo-symbols + labels pt-BR | ✅ Task 4 |
| Estado ativo em brand (#00D4AA) | ✅ tabBarActiveTintColor |
| Estado inativo em textSecondary (#9CA8B8) | ✅ tabBarInactiveTintColor |
| Tab bar respeita Safe Area inferior | ✅ useSafeAreaInsets |
| Animação de tap: haptic + scale 0.96 | ✅ Task 3 (TabBarButton) |
| Accessibility: role="tab", label, state | ✅ TabBarButton props + Screen options |
| Cada tela placeholder com texto da seção | ✅ Task 5 |
| Background das telas em colors.bgBase | ✅ Task 5 |
| Tipografia respeita tokens (typography.title) | ✅ Task 5 |
| Glass APENAS na tab bar | ✅ BlurView só em tabBarBackground |
| expo-symbols instalado | ✅ Task 1 |
| tsc --noEmit zero erros | ✅ Task 6 |
| App roda no simulador iOS 26 | ✅ Task 7 |
| Commits descritivos | ✅ Task 8 |
| Branch mergeada via PR | ✅ Task 8 |
| NÃO @expo/ui | ✅ não usado |
| NÃO emoji nos labels | ✅ SF Symbols |
| NÃO glass em conteúdo | ✅ apenas tabBarBackground |
| NÃO modificar tokens.ts | ✅ intocado |
| NÃO instalar libs além de expo-symbols | ✅ apenas expo-symbols |
