# Prompt 19-MID-migracao-liquid-glass

**Branch:** `feature/19-migracao-liquid-glass`
**Modelo recomendado:** Sonnet (decisão de fallback runtime + compatibilidade entre iOS 17/26)
**Pré-requisito:** Prompt 18 (Perfil V2 LGPD) mergeado em `main`. Xcode 26 instalado (Léo já tem — iPhone 17 Simulator funciona).

---

## Contexto

A tab bar do V5 (Prompt 04) usa `expo-blur` BlurView — efeito de blur aproximação, **NÃO é Liquid Glass real**. O Aprendizado #1 do bootstrap forçou fallback porque `@expo/ui` canary era incompatível com SDK 54.

**Situação atualizada (confirmada via docs Expo oficial):** existe pacote estável **`expo-glass-effect`** que renderiza Liquid Glass NATIVO iOS 26+ via `UIVisualEffectView`. Funciona em SDK 54+. Compatível com Xcode 26.

### API confirmada via [docs.expo.dev/versions/latest/sdk/glass-effect](https://docs.expo.dev/versions/latest/sdk/glass-effect/)

```typescript
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'

// Componente
<GlassView
  glassEffectStyle="regular"  // 'clear' | 'regular' | 'none'
  colorScheme="dark"           // 'auto' | 'light' | 'dark'
  tintColor={undefined}        // opcional (NÃO usar — Vital Mint Rarity)
  isInteractive={false}
  style={StyleSheet.absoluteFill}
/>
```

| Comportamento | Detalhe |
|---|---|
| iOS 26+ | Renderiza Liquid Glass nativo via `UIVisualEffectView` |
| iOS <26 | Fallback automático para `<View />` (sem efeito) |
| Android | Fallback automático para `<View />` |
| Runtime check | `isGlassEffectAPIAvailable()` (algumas versões iOS 26 beta crashavam — usar essa função, não `isLiquidGlassAvailable()`) |

### Strategy do DoseDay

Como `<View />` puro perde o efeito (Liquid Glass em iOS 26 → vidro liso em iOS 25), implementamos **fallback cirúrgico**: se Glass API disponível → `GlassView`; senão → `BlurView` (atual).

```typescript
function TabBarBackground() {
  if (isGlassEffectAPIAvailable()) {
    return <GlassView glassEffectStyle="regular" colorScheme="dark" style={StyleSheet.absoluteFill} />
  }
  return <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
}
```

Garante visual premium em iOS 26+ E mantém visual aceitável em iOS 17-25.

### Aprendizado a registrar

- `expo-glass-effect` Estável a partir do SDK 54. Substitui o workaround de `BlurView` que tínhamos como aproximação
- Runtime check `isGlassEffectAPIAvailable()` (não `isLiquidGlassAvailable()`) — necessário por causa de versões iOS 26 beta que podem crashar
- `tintColor` no GlassView NÃO deve receber `colors.brand` (Vital Mint Rarity ≤10%)

---

## Tarefa

Migração cirúrgica em 2 arquivos + 1 novo componente.

### Estrutura

```
package.json                              ← MODIFICAR (+ expo-glass-effect)
components/ui/TabBarBackground.tsx        ← NOVO (switch GlassView/BlurView)
app/(tabs)/_layout.tsx                    ← MODIFICAR (usa TabBarBackground em vez de BlurView inline)
```

### 1. Instalar `expo-glass-effect`

```bash
npx expo install expo-glass-effect
```

Não `npm install` direto — `npx expo install` escolhe versão compatível com SDK 54.

### 2. Criar `components/ui/TabBarBackground.tsx`

```typescript
import { StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'

/**
 * Background da tab bar.
 * - iOS 26+: GlassView (Liquid Glass nativo via UIVisualEffectView)
 * - iOS 17-25 / Android: BlurView fallback
 *
 * Runtime check via `isGlassEffectAPIAvailable()` (não `isLiquidGlassAvailable()`)
 * por causa de versões iOS 26 beta que podem crashar — ver Aprendizado #N em docs/architecture.md
 */
export function TabBarBackground() {
  if (isGlassEffectAPIAvailable()) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme="dark"
        style={StyleSheet.absoluteFill}
      />
    )
  }

  return (
    <BlurView
      intensity={80}
      tint="dark"
      style={StyleSheet.absoluteFill}
    />
  )
}
```

### 3. Modificar `app/(tabs)/_layout.tsx`

Substituir o `tabBarBackground` (atualmente BlurView inline) por `TabBarBackground` componente.

**Antes:**
```typescript
tabBarBackground: () => (
  <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
),
```

**Depois:**
```typescript
import { TabBarBackground } from '@components/ui/TabBarBackground'
// ...
tabBarBackground: () => <TabBarBackground />,
```

**Não mexer em mais nada do `_layout.tsx`** — TabBarButton custom (scale 0.96 + haptic) preservado, SF Symbols preservados, route screens intactos.

---

## Restrições (Karpathy Surgical)

- ❌ NÃO migrar pra **Native Tabs** do Expo Router (`expo-router/unstable-native-tabs`) — perde customização TabBarButton (scale + haptic), beta status
- ❌ NÃO aplicar Glass em conteúdo (regra 30% Glass — cards, inputs, etc continuam tonal layering)
- ❌ NÃO usar `tintColor` com `colors.brand` (Vital Mint Rarity ≤10%)
- ❌ NÃO mudar `glassEffectStyle="regular"` para `"clear"` neste prompt (clear é mais translúcido — pode misturar com conteúdo embaixo)
- ❌ NÃO criar wrapper desnecessário pra Android (`GlassView` já tem fallback automático — só usamos BlurView porque queremos blur visual em iOS 17-25, não View puro)
- ❌ NÃO tocar em `TabBarButton.tsx`, tokens, outras telas, navegação além do `tabBarBackground` callback
- ❌ NÃO instalar `react-native-blur` ou outras libs (já temos `expo-blur`)

---

## Skills obrigatórias

| Skill | Por quê |
|---|---|
| `react-native-best-practices` | Component switch pattern, fallback iOS version |
| `ios-liquid-glass-expo` | Skill específica pra Liquid Glass + Expo SDK 54 (instalada no projeto) |
| `/impeccable craft` | Validação visual Glass vs BlurView (comparação) |
| `superpowers:writing-plans` | **OBRIGATÓRIO** salvar plano em `docs/superpowers/plans/2026-05-18-migracao-liquid-glass.md` antes de tocar em código (regra 21) |

---

## Validação automatizada via `react-native-devtools-mcp`

### Bateria (8 testes — escopo cirúrgico justifica bateria curta)

| # | Ação | Tool | Critério |
|---|---|---|---|
| 1 | Cold start + signin Leonardo | `tap` + `type_text` (3 fragmentos) | Home renderiza, tab bar visível |
| 2 | Screenshot tab bar (estado pós-Glass) | `screenshot` Home | Tab bar mostra Liquid Glass nativo (efeito de refração/blur do conteúdo embaixo, **mais sofisticado** que BlurView) |
| 3 | Comparação visual antes/depois | `screenshot` Home + DIFF visual com Prompt 04 | Diferença perceptível — Glass tem mais profundidade e reage ao conteúdo |
| 4 | Confirmar API disponível em runtime | `js_eval` chamando `require('expo-glass-effect').isGlassEffectAPIAvailable()` | Retorna `true` no iPhone 17 (iOS 26+) |
| 5 | TabBarButton custom preservado | `tap` em tab Doses | Scale 0.96 + haptic ainda funcionam (mesmo de antes) |
| 6 | Tabs navegáveis | `tap` em Início, Doses, Diário, Relatórios, Perfil | Todas as telas renderizam normalmente |
| 7 | A11y tab bar | `get_view_hierarchy` na tela inicial | Estrutura intacta — tabs com role + labels preservados |
| 8 | Screenshot scroll Home + tab bar | `screenshot` durante scroll | Glass refrata o conteúdo da Home embaixo (efeito visível) |

### Greps técnicos

```bash
npm run type-check          # 0 erros
npm run lint                # 0 erros novos

# Confirma instalação
cat package.json | grep "expo-glass-effect"
# Esperado: presente em dependencies

# Confirma uso correto da função runtime check
grep -rn "isGlassEffectAPIAvailable" components/ui/TabBarBackground.tsx
# Esperado: 1 ocorrência (não usar isLiquidGlassAvailable)

# Garantir que BlurView fallback foi mantido (não deletado)
grep -rn "BlurView" components/ui/TabBarBackground.tsx
# Esperado: 1 import + 1 uso no fallback

# Garantir que nada novo usa tintColor em GlassView (Vital Mint Rarity)
grep -rn "tintColor.*colors.brand\|tintColor=\"#00D4AA" components/
# Esperado: vazio

# Garantir que _layout.tsx não tem mais BlurView inline (foi extraído pro TabBarBackground)
grep -rn "BlurView" app/\(tabs\)/_layout.tsx
# Esperado: vazio (BlurView só existe em components/ui/TabBarBackground.tsx)
```

---

## Karpathy self-tests (declarar no plano antes do `ok`)

### 1. Think Before Coding — assumptions
1. **`isGlassEffectAPIAvailable()` retorna `true` no iPhone 17 Simulator** (iOS 26+, sem ser beta crashable). Confirmar via `js_eval` no teste #4
2. **`glassEffectStyle="regular"`** é a escolha certa pra tab bar (mais opaco). `"clear"` seria mais translúcido e poderia confundir com conteúdo embaixo
3. **`tintColor` propositadamente omitido** — Vital Mint Rarity preservado. Adicionar tint quebraria a regra
4. **Fallback BlurView mantido** porque `<View />` puro perde efeito em iOS <26 + Android — UX degrada mais que vale a pena
5. **TabBarBackground extraído como componente reutilizável** — se Modal sheets futuros (Prompt 21+) quiserem Glass também, single source of truth

### 2. 3 Alternativas avaliadas

| Alternativa | Veredito |
|---|---|
| **JS Tabs + GlassView (escolhida)** | ✅ Cirúrgico, preserva TabBarButton custom, runtime fallback |
| Native Tabs do Expo Router | ❌ Perde TabBarButton custom (scale + haptic), beta, mudança grande de código |
| Manter BlurView (não migrar) | ❌ Perde diferencial premium da V5 — "memória inteligente" merece Liquid Glass real |

### 3. Simplicity First
- ~30 linhas de código novo (componente switch)
- 2 linhas modificadas em `_layout.tsx` (import + tabBarBackground callback)
- Zero abstrações especulativas — não criar HOC, hook ou context
- Sem animações de transição (já é nativo)

### 4. Surgical Changes
- 1 arquivo novo (`TabBarBackground.tsx`)
- 2 arquivos modificados (`package.json` + `_layout.tsx`)
- TabBarButton.tsx INTOCADO
- Tokens INTOCADOS
- Outras telas INTOCADAS

### 5. Goal-Driven Execution
- 8 testes MCP verificáveis
- Confirmação visual via screenshot side-by-side (antes/depois)
- Runtime check confirmado via `js_eval`
- Critique ≥ 28/40

---

## Critérios de aceitação

- [ ] `expo-glass-effect` instalado via `npx expo install` (versão compatível com SDK 54)
- [ ] `components/ui/TabBarBackground.tsx` criado com switch `isGlassEffectAPIAvailable()` → GlassView, senão BlurView
- [ ] `app/(tabs)/_layout.tsx` modificado — `tabBarBackground` callback usa `<TabBarBackground />` em vez de BlurView inline
- [ ] `glassEffectStyle="regular"` + `colorScheme="dark"` (NÃO `"clear"`, NÃO `tintColor`)
- [ ] TabBarButton custom (scale 0.96 + haptic) preservado e funcionando
- [ ] BlurView fallback mantido pra iOS <26 + Android
- [ ] Zero `as any` / `// @ts-ignore`
- [ ] `npm run type-check` zero erros
- [ ] `npm run lint` zero erros novos
- [ ] Bateria 8 testes MCP executada com screenshots reais
- [ ] **5 screenshots REAIS** no PR (markdown `![desc](url)` com commit SHA na URL — padrão Codex PR #20):
  1. Tab bar com Liquid Glass nativo iOS 26 (close-up)
  2. Tab bar antes (referência do Prompt 04 com BlurView) — opcional, pra comparação
  3. Home com tab bar Glass + conteúdo embaixo (efeito refração visível)
  4. Doses com tab bar Glass (mesmo padrão)
  5. Tab bar com TabBarButton em estado pressed (scale 0.96 preservado)
- [ ] `/impeccable critique` ≥ 28/40
- [ ] **Plano salvo em `docs/superpowers/plans/2026-05-18-migracao-liquid-glass.md` ANTES de executar** (regra 21)
- [ ] Atualizar `docs/architecture.md`:
  - Marcar Aprendizado #1 do Bootstrap como **RESOLVIDO** (`@expo/ui` canary era incompatível; agora usamos `expo-glass-effect` estável)
  - Adicionar novo Aprendizado: runtime check `isGlassEffectAPIAvailable()` vs `isLiquidGlassAvailable()`
- [ ] Atualizar `CLAUDE.md` tabela "Histórico"
- [ ] Atualizar `docs/DESIGN.md` seção Glass — mencionar que Glass agora é Liquid Glass nativo (não BlurView aproximação)
- [ ] Commit: `feat(ui): migra tab bar pra Liquid Glass nativo iOS 26+ via expo-glass-effect`
- [ ] PR aberto via MCP github

---

## Restrições explícitas

- **Sem Native Tabs** do Expo Router
- **Sem migration de outros lugares** pra Glass neste prompt (só tab bar)
- **Sem `tintColor`** no GlassView (Vital Mint Rarity)
- **Sem `glassEffectStyle="clear"`** (manter "regular" — mais opaco)
- **Sem mexer em** TabBarButton.tsx, tokens, outras telas, navegação
- **Sem instalar libs adicionais** (apenas `expo-glass-effect` via `npx expo install`)

---

## Antes de executar

1. Ler `CLAUDE.md` (regras 14 RTK, 20 screenshots reais, 21 plano, 22 Karpathy)
2. Ler `docs/architecture.md` seção 14 (Aprendizado #1 sobre `@expo/ui` canary)
3. Ler `docs/DESIGN.md` seção Glass + Named Rules (30% Glass Rule, Vital Mint Rarity)
4. Ler `app/(tabs)/_layout.tsx` (estrutura atual com BlurView)
5. Ler `components/ui/TabBarButton.tsx` (entender o que NÃO mexer)
6. Confirmar via `ping` que iPhone 17 booted
7. Confirmar via SQL (se quiser): subscription Leonardo ativa (não muda nada visualmente nesse prompt)

## Pós-execução

1. Rodar `/impeccable critique` na tab bar
2. Resolver P1/P2 antes do commit
3. **Screenshots side-by-side (antes vs depois)** se possível — Codex pode capturar do PR #04 históricomente OU só mostrar o "depois" com nota
4. 5 screenshots reais via MCP no PR (com commit SHA na URL)
5. Atualizar `docs/architecture.md`:
   - Aprendizado #1 marcado RESOLVIDO + nota explicando
   - Novo aprendizado sobre runtime check vs compile-time check
6. Atualizar `CLAUDE.md` tabela "Histórico"
7. Atualizar `docs/DESIGN.md` seção Glass:
   - Antes: "Glass via expo-blur BlurView (aproximação até `@expo/ui` estável)"
   - Depois: "Glass via `expo-glass-effect` GlassView (Liquid Glass nativo iOS 26+, fallback BlurView)"
8. PR description deve incluir:
   - Detalhe da migração + runtime check
   - 5 screenshots
   - Confirmação visual side-by-side (se possível)
   - Aprendizados atualizados em architecture.md
