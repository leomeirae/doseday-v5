# DoseDay V5 — Prompt 04-MID-tab-bar-5-abas

**Instância de destino:** ☑ Agent View (sessão dedicada). Dispatch via `claude agents`.
**Worktree:** automático em `.claude/worktrees/`
**Branch a criar:** `feature/04-tab-bar-5-abas`
**Caveman:** N/A (decisão estratégica: não usar no projeto)

> **Importante:** este prompt assume que Prompts 00-03 estão mergeados em `main`. Verifica `git log --oneline -n 5` (deve mostrar `81eeec8` ou commit superior do Prompt 03). Estado atual: app abre tela "DoseDay / V5 — Inicializando" no simulador iOS 26.

---

## Contexto obrigatório (leia antes de qualquer coisa)

1. `/Users/leofrancaia/Desktop/dose-day-v5/CLAUDE.md` — memória do projeto, **regras anti-pirraça (especialmente #15: paralelismo via Agent View)**
2. `/Users/leofrancaia/Desktop/dose-day-v5/docs/PRODUCT.md` — persona Mariana, tom, anti-references
3. `/Users/leofrancaia/Desktop/dose-day-v5/docs/DESIGN.md` — **regra dos 30% glass**, tokens canônicos, Number-First Rule
4. `/Users/leofrancaia/Desktop/dose-day-v5/docs/architecture.md` — **seção 14 (Aprendizados) é crítica**, especialmente aprendizado #1
5. `/Users/leofrancaia/Desktop/dose-day-v5/docs/skills-stack.md` — skills disponíveis
6. `/Users/leofrancaia/Desktop/dose-day-v5/docs/agent-view-cheatsheet.md` — atalhos
7. `/Users/leofrancaia/Desktop/dose-day-v5/docs/handoff/HANDOFF-prompt-03.md` — estado pós Prompt 03

### Aprendizados relevantes do projeto (NÃO esquecer)

| # | Aprendizado | Impacto neste Prompt |
|---|---|---|
| 1 | **`@expo/ui` canary incompatível com SDK 54** | **NÃO USAR.** Glass via `expo-blur` (BlurView). `@expo/ui` re-introduz quando versão estável sair |
| 2 | iOS 26 sem Expo Go | Testar com `npx expo run:ios`, nunca `expo start --ios` |
| 3 | `babel-preset-expo` deve ser devDep | Já tratado, não tocar |
| 4 | `react-native-worklets@0.5.1` peer Reanimated 4 | Já tratado, não tocar |

---

## Objetivo desta tarefa

Substituir a tela única "Hello DoseDay" por uma **estrutura de navegação por tab bar com 5 abas**:

1. **Início** (`/`) — dashboard (placeholder com título)
2. **Doses** (`/doses`) — histórico de doses (placeholder)
3. **Diário** (`/diario`) — sintomas + perguntas pra consulta (placeholder)
4. **Relatórios** (`/relatorios`) — relatórios IA (placeholder)
5. **Perfil** (`/perfil`) — conta, médico, assinatura (placeholder)

A tab bar usa **glass via expo-blur** (BlurView com tint `dark` + intensidade adequada). Cada tab tem ícone SF Symbol (via `expo-symbols`) + label `tab-label` (11pt Medium).

**Estado ativo:** ícone e label em `colors.brand` (`#00D4AA`), background da tab com tint `brand-fade` (rgba 0,212,170, 0.12).

**Estado inativo:** ícone e label em `colors.textSecondary` (`#9CA8B8`).

**Animação de tap:** haptic leve (expo-haptics `selection`) + scale 0.96 (Reanimated).

Após este prompt, o app tem navegação básica funcional e pronta pra receber conteúdo real em cada tela.

---

## Critérios de aceitação

- [ ] Pasta `app/(tabs)/` criada com 5 rotas: `index.tsx`, `doses.tsx`, `diario.tsx`, `relatorios.tsx`, `perfil.tsx`
- [ ] `app/(tabs)/_layout.tsx` define a tab bar
- [ ] `app/_layout.tsx` root mantém os providers (QueryClient, i18n, Stack)
- [ ] Tab bar usa **BlurView** (`expo-blur`) — proibido `@expo/ui`
- [ ] 5 tabs com ícones SF Symbol via `expo-symbols` + labels em pt-BR
- [ ] Estado ativo em `brand` (#00D4AA), inativo em `textSecondary` (#9CA8B8)
- [ ] Tab bar respeita Safe Area inferior (`useSafeAreaInsets`)
- [ ] Animação de tap: haptic + scale 0.96 (Reanimated)
- [ ] Accessibility: `accessibilityRole="tab"`, `accessibilityLabel`, `accessibilityState={{ selected }}`
- [ ] Cada tela placeholder tem `<Text>` com o nome da seção (ex: "Doses · em construção")
- [ ] Background de cada tela em `colors.bgBase`
- [ ] Tipografia respeita tokens (`typography.title` no título de cada tela)
- [ ] **Glass APENAS na tab bar** — nenhuma tela usa glass em conteúdo (regra dos 30%)
- [ ] `expo-symbols` instalado via `npx expo install expo-symbols`
- [ ] `tsc --noEmit` zero erros
- [ ] App roda no simulador iOS 26 via `npx expo run:ios`, todas as 5 abas navegam
- [ ] Commits descritivos (1 commit consolidando ou 2-3 lógicos)
- [ ] Branch `feature/04-tab-bar-5-abas` mergeada em `main` via PR

---

## Restrições explícitas

- **NÃO** usar `@expo/ui` (Liquid Glass nativo). Aprendizado #1 do Prompt 00 vetou. Usar `expo-blur` apenas
- **NÃO** usar emoji nos labels da tab bar — SF Symbol via `expo-symbols`
- **NÃO** usar `Ionicons` ou outras fontes de ícone — `expo-symbols` (SF Symbols nativos iOS)
- **NÃO** colocar glass em conteúdo de tela — só na tab bar (regra dos 30% / Glass-Navigation-Only Rule)
- **NÃO** modificar `lib/theme/tokens.ts` (foi finalizado no Prompt 03)
- **NÃO** instalar libs além de `expo-symbols`
- **NÃO** usar `as any`, `// @ts-ignore`, `// eslint-disable` sem justificativa no plano
- **NÃO** mudar `bundleIdentifier` ou outras configs em `app.json`
- **NÃO** rodar `expo start --ios` — usar `expo run:ios` (aprendizado #2)
- **NÃO** criar lógica de negócio nas telas placeholder — apenas título estilizado por enquanto

---

## Estrutura proposta de arquivos

| Arquivo | Ação | Resumo |
|---|---|---|
| `app/_layout.tsx` | **Editar** | Wrap `<Stack>` ou trocar pra `<Slot>` se Stack atrapalhar tabs |
| `app/index.tsx` | **DELETAR** | Conteúdo move pra `app/(tabs)/index.tsx` |
| `app/(tabs)/_layout.tsx` | **CRIAR** | Tab bar com BlurView, 5 tabs, accessibility |
| `app/(tabs)/index.tsx` | **CRIAR** | Tela Início (placeholder com título) |
| `app/(tabs)/doses.tsx` | **CRIAR** | Tela Doses (placeholder) |
| `app/(tabs)/diario.tsx` | **CRIAR** | Tela Diário (placeholder) |
| `app/(tabs)/relatorios.tsx` | **CRIAR** | Tela Relatórios (placeholder) |
| `app/(tabs)/perfil.tsx` | **CRIAR** | Tela Perfil (placeholder) |
| `components/ui/GlassBar.tsx` | **CRIAR** (opcional) | Componente reutilizável de barra glass — extrair da tab bar se ficar limpo |
| `app/+not-found.tsx` | **Manter** | Não tocar |
| `lib/theme/tokens.ts` | **Não tocar** | Tokens finalizados no Prompt 03 |

### Ícones SF Symbol por tab

| Tab | SF Symbol name | Fallback (se symbol não existir no iOS 17) |
|---|---|---|
| Início | `house.fill` (ativo) / `house` (inativo) | mantém |
| Doses | `cross.case.fill` (ativo) / `cross.case` (inativo) | `pills` se cross.case não rolar |
| Diário | `book.closed.fill` (ativo) / `book.closed` (inativo) | mantém |
| Relatórios | `chart.bar.doc.horizontal.fill` (ativo) / `chart.bar.doc.horizontal` (inativo) | `chart.bar.fill` se não rolar |
| Perfil | `person.crop.circle.fill` (ativo) / `person.crop.circle` (inativo) | mantém |

---

## Detalhes técnicos

### Estrutura do `_layout.tsx` da tab group

Esqueleto sugerido (vai ser refinado no plano):

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { BlurView } from 'expo-blur'
import { SymbolView } from 'expo-symbols'
import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, typography } from '@lib/theme/tokens'

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
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarLabelStyle: typography.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name={focused ? 'house.fill' : 'house'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      {/* doses, diario, relatorios, perfil */}
    </Tabs>
  )
}
```

### Placeholder de tela

Esqueleto sugerido pra cada tela:

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
  title: { ...typography.headline, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
})
```

### Haptic feedback na troca de tab

Não há API direta no `<Tabs>` do expo-router pra interceptar tap. Solução:

```tsx
// listener via tabBarButton custom (opcional, pode ficar pra Prompt 05)
```

Se ficar complexo, **omitir haptic neste prompt** e marcar como TODO pra Prompt seguinte. Aceitação não bloqueia se haptic não rolar.

---

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Planejamento | `superpowers:writing-plans` | Plano estruturado |
| Implementação | `react-native-best-practices` | Layouts mobile, Safe Area, performance |
| Implementação | Edit + Read + Bash | Edição de arquivos + install deps |
| Validação | `Bash: tsc --noEmit` | TypeScript check |
| Code review | `review` ou `/impeccable critique` | Checa contra DESIGN.md + PRODUCT.md |

### B) Plano de execução

Lista numerada com checkpoints. Sugestão:

1. Criar branch `feature/04-tab-bar-5-abas`
2. Instalar `expo-symbols`: `npx expo install expo-symbols`
3. **Decisão:** mover `app/index.tsx` antes de criar `app/(tabs)/index.tsx` (evitar conflito de rota)
4. Criar `app/(tabs)/_layout.tsx` com tab bar + BlurView
5. Criar 5 telas placeholder em `app/(tabs)/`
6. Atualizar `app/_layout.tsx` se necessário pra acomodar tab group
7. Testar TypeScript (`tsc --noEmit`)
8. Testar no simulador (`npx expo run:ios`) — confirmar 5 abas navegam, glass aparece, ativo em verde
9. `/impeccable critique` na tab bar
10. Commit + PR + handoff

### C) Riscos identificados

Listar coisas que podem dar errado. Sugestões iniciais:

- `expo-symbols` pode não ter algum dos SF Symbols escolhidos no iOS 17 (deployment target). Solução: testar e ter fallback
- `expo-router` `<Tabs>` pode não respeitar BlurView corretamente — talvez precise `tabBarBackground` custom
- Mover `app/index.tsx` pra `app/(tabs)/index.tsx` pode causar conflito de rota se ambos existirem. **Deletar o antigo antes** de criar o novo
- `colors.bgBase` por trás do BlurView pode ficar quase opaco com `intensity={80}` — ajustar
- Safe Area inferior do iPhone com home indicator (notch inferior) precisa de padding extra na tab bar
- Haptic + scale animation pode adicionar complexidade — recomendar deixar pra Prompt seguinte se atrasar muito
- `expo-symbols` pode não estar listado em SDK 54 estável — checar `expo install` antes de assumir

### D) Arquivos que vai criar/editar

Tabela com cada arquivo + ação + resumo.

### E) Como vai validar

- [ ] `Bash: tsc --noEmit` zero erros
- [ ] `Bash: ls app/(tabs)/` mostra os 5 arquivos + `_layout.tsx`
- [ ] `Bash: npx expo run:ios` builda e abre simulador iOS 26
- [ ] Manualmente no simulador: 5 abas visíveis, glass na tab bar, tap em cada uma navega, label aparece, ícones aparecem
- [ ] Estado ativo (tab clicada) em verde-menta
- [ ] Estado inativo em cinza-azulado
- [ ] Background das telas em azul-grafite escuro
- [ ] Nenhuma área de conteúdo tem glass (apenas tab bar)
- [ ] `/impeccable critique` na tab bar — relatório anexado ao PR

### F) Otimização de tokens (RTK)

Comandos `rtk *` específicos pra esta tarefa:
- `rtk read app/_layout.tsx` — lê atual compactado
- `rtk read lib/theme/tokens.ts` — lê tokens compactado
- `rtk grep "from '@lib/theme/tokens'" .` — confirma imports
- `rtk tsc --noEmit` — TypeScript check
- `rtk ls app/` — lista estrutura

---

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.

---

## Observação adicional

A tab bar é o primeiro contato visual do usuário com a paleta verde-menta + azul-grafite + glass clínico. **Capricha:**

- Glass discreto (não brilhante demais)
- Tipografia respira (tab labels não comprimidas)
- Estado ativo é claramente diferente do inativo (cor + intensidade)
- Ícone + label sempre alinhados verticalmente, com espaçamento consistente

Se algo no plano não estiver claro ou tiver melhor solução técnica, **pergunte** antes de assumir. Não invente.

Após executar, **rodar `/handoff`** salvando em `docs/handoff/HANDOFF-prompt-04.md` antes do PR.
