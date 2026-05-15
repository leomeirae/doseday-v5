# Aplicar Tokens Canônicos do Design System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir os tokens placeholder em `lib/theme/tokens.ts` pelos tokens canônicos do `docs/DESIGN.md`, eliminando drift entre design e implementação.

**Architecture:** Reescrita completa de `tokens.ts` em 5 namespaces (`colors`, `typography`, `spacing`, `radius`, `elevation`) com valores exatos do frontmatter YAML do `docs/DESIGN.md`. Dois arquivos consomem tokens hoje (`app/index.tsx` e `app/+not-found.tsx`) — ambos têm referências a nomes antigos que precisam ser atualizadas.

**Tech Stack:** TypeScript estrito, React Native StyleSheet, `as const` para literal types.

---

## Mapeamento de arquivos

| Arquivo | Ação | Resumo |
|---|---|---|
| `lib/theme/tokens.ts` | **Reescrever** | 5 namespaces canônicos com 20 cores + 12 tipografias + 8 spacings + 6 radii + 4 elevations |
| `app/index.tsx` | **Editar** | 3 refs antigas → nomes canônicos |
| `app/+not-found.tsx` | **Editar** | 3 refs antigas → nomes canônicos |

### Mapeamento de nomes antigos → canônicos

| Nome antigo | Nome canônico | Valor muda? |
|---|---|---|
| `colors.background` | `colors.bgBase` | `#111827` → `#050B12` ⚠️ |
| `colors.text` | `colors.textPrimary` | `#F9FAFB` → `#F2F4F7` (sutil) |
| `colors.textMuted` | `colors.textSecondary` | `#9CA3AF` → `#9CA8B8` (sutil) |
| `colors.primary` | `colors.brand` | `#00B37E` → `#00D4AA` ⚠️ |
| `spacing.sm` (app usa) | `spacing.sm` | 8px → 12px ⚠️ |
| `spacing.lg` (app usa) | `spacing.lg` | 24px → 24px ✓ |

> ⚠️ **Nota visual:** As mudanças de cor são intencionais — os placeholders eram apenas aproximações. A tela "DoseDay V5 — Inicializando" vai ficar visualmente diferente (fundo mais escuro, brand mais brilhante). Isso é o comportamento correto.

### Discrepância `design.json` vs `docs/DESIGN.md`

O `.impeccable/design.json` contém metadados oklch + tonalRamps — **não** define os hex canônicos diretos. O frontmatter YAML do `docs/DESIGN.md` é a fonte de verdade para todos os hex values. Exemplo: `bg-base` no `design.json` tem tonalRamp[0]=`#0D1520`, mas o DESIGN.md define `bg-base: "#050B12"` — **use DESIGN.md**.

### `monoData.fontFamily`

O prompt 03 sugere `'SF Mono'` como exemplo, mas o `DESIGN.md` define `fontFamily: "SF Mono, monospace"`. **Use o valor do DESIGN.md:** `'SF Mono, monospace'`.

### Namespace `radius` vs `rounded`

O frontmatter YAML do DESIGN.md usa a chave `rounded` (convenção web). O namespace TypeScript exportado deve ser `radius` (convenção do projeto, alinhada com o template do Prompt 03 e sem conflito com `BorderRadius` do RN).

---

## Task 1: Reescrever `lib/theme/tokens.ts`

**Files:**
- Modify: `lib/theme/tokens.ts`

- [ ] **Step 1: Reescrever o arquivo com tokens canônicos completos**

Substituir o conteúdo inteiro de `lib/theme/tokens.ts` por:

```typescript
// lib/theme/tokens.ts
// Tokens canônicos do design system DoseDay V5.
// Fonte de verdade: docs/DESIGN.md + .impeccable/design.json
// Atualizado via Prompt 03 (aplicar tokens canônicos do DESIGN.md)

export const colors = {
  // Background
  bgBase: '#050B12',
  bgElevated: '#0E1620',
  bgSurface: '#1B2433',

  // Brand
  brand: '#00D4AA',
  brandDim: '#00B894',

  // Semantic
  semanticPositive: '#00D4AA',
  semanticWarning: '#FFB347',
  semanticCritical: '#E64545',
  semanticInfo: '#5BA8D9',
  semanticMuted: '#5C6878',

  // Text
  textPrimary: '#F2F4F7',
  textSecondary: '#9CA8B8',
  textTertiary: '#6B7280',
  textInverse: '#050B12',
  textBrand: '#00D4AA',

  // Clinical (gráficos)
  clinicalWeight: '#00D4AA',
  clinicalDose: '#5BA8D9',
  clinicalMild: '#7DD3A0',
  clinicalModerate: '#FFB347',
  clinicalSevere: '#E64545',
} as const

export const typography = {
  display:      { fontFamily: 'system', fontSize: 32, fontWeight: '700' as const, lineHeight: 38 },
  headline:     { fontFamily: 'system', fontSize: 28, fontWeight: '600' as const, lineHeight: 34 },
  title:        { fontFamily: 'system', fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  subtitle:     { fontFamily: 'system', fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body:         { fontFamily: 'system', fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyClinical: { fontFamily: 'system', fontSize: 15, fontWeight: '400' as const, lineHeight: 24 },
  label:        { fontFamily: 'system', fontSize: 16, fontWeight: '600' as const, lineHeight: 20 },
  caption:      { fontFamily: 'system', fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  tabLabel:     { fontFamily: 'system', fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
  numberLarge:  { fontFamily: 'system', fontSize: 40, fontWeight: '700' as const, lineHeight: 48 },
  numberMedium: { fontFamily: 'system', fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  monoData:     { fontFamily: 'SF Mono, monospace', fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
} as const

export const spacing = {
  xxs:  4,
  xs:   8,
  sm:  12,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  xxxl: 64,
} as const

export const radius = {
  xs:   6,
  sm:  10,
  md:  14,
  lg:  20,
  xl:  28,
  full: 9999,
} as const

export const elevation = {
  0: { shadowOpacity: 0,    shadowRadius: 0,  shadowOffset: { width: 0, height: 0  } },
  1: { shadowOpacity: 0.20, shadowRadius: 2,  shadowOffset: { width: 0, height: 1  } },
  2: { shadowOpacity: 0.30, shadowRadius: 12, shadowOffset: { width: 0, height: 4  } },
  3: { shadowOpacity: 0.45, shadowRadius: 32, shadowOffset: { width: 0, height: 12 } },
} as const
```

- [ ] **Step 2: Confirmar contagem de entradas no namespace colors**

```bash
grep -c "^\s\+[a-z].*'#" lib/theme/tokens.ts
```

Esperado: `20` linhas com hex no `colors` (20 entradas: bgBase até clinicalSevere).

---

## Task 2: Atualizar `app/index.tsx`

**Files:**
- Modify: `app/index.tsx`

- [ ] **Step 1: Substituir referências antigas pelos nomes canônicos**

O arquivo atual usa `colors.background`, `colors.text`, `colors.textMuted`. Reescrever:

```typescript
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing } from '@lib/theme/tokens'

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DoseDay</Text>
      <Text style={styles.subtitle}>V5 — Inicializando</Text>
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
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
})
```

---

## Task 3: Atualizar `app/+not-found.tsx`

**Files:**
- Modify: `app/+not-found.tsx`

- [ ] **Step 1: Substituir referências antigas pelos nomes canônicos**

O arquivo atual usa `colors.background`, `colors.text`, `colors.primary`. Reescrever:

```typescript
import { View, Text, StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { colors } from '@lib/theme/tokens'

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela não encontrada</Text>
      <Link href="/" style={styles.link}>
        Voltar ao início
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgBase,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 18,
    marginBottom: 16,
  },
  link: {
    color: colors.brand,
    fontSize: 16,
  },
})
```

---

## Task 4: Validação TypeScript + busca de tokens obsoletos

**Files:** (verificação apenas — sem edições)

- [ ] **Step 1: TypeScript check**

```bash
tsc --noEmit
```

Esperado: zero erros. Se houver erros `Property 'background' does not exist` ou similar → algum arquivo foi esquecido. Rodar `grep -rn "colors\.background\|colors\.text\b" app/ components/` para localizar.

- [ ] **Step 2: Confirmar zero referências a nomes antigos**

```bash
grep -rn "colors\.background\|colors\.text\b\|colors\.textMuted\|colors\.primary\|colors\.surface" app/ components/ 2>/dev/null
```

Esperado: zero resultados.

- [ ] **Step 3: Confirmar zero hardcoded hex em `app/` e `components/`**

```bash
grep -rn "'#[0-9a-fA-F]\{3,6\}'" app/ components/ 2>/dev/null
```

Esperado: zero resultados. Todos os hex devem estar apenas em `lib/theme/tokens.ts`.

---

## Task 4.5: Teste visual no simulador iOS

**Files:** (nenhuma edição — verificação apenas)

- [ ] **Step 1: Iniciar Expo no simulador**

```bash
npx expo start --ios
```

Aguardar saída de "Metro waiting on" e compilação inicial. Confirmar ausência de erros de compilação/bundle.

- [ ] **Step 2: Confirmar resultado esperado**

A tela "DoseDay / V5 — Inicializando" deve abrir com:
- **Fundo mais escuro** (era `#111827`, agora `#050B12` — Clinical Midnight)
- **Brand mais brilhante** (era `#00B37E`, agora `#00D4AA` — Vital Mint)
- **Zero warnings** novos no Metro bundler

Se houver warnings ou errors não esperados, investigar antes de continuar.

- [ ] **Step 3: Encerrar servidor**

Pressionar `Ctrl+C` para encerrar o Metro bundler após confirmação.

---

## Task 5: Commit + PR

- [ ] **Step 1: Verificar staging**

```bash
git status
```

Esperado: 3 arquivos modificados: `lib/theme/tokens.ts`, `app/index.tsx`, `app/+not-found.tsx`. Nenhum arquivo não esperado.

- [ ] **Step 2: Commit**

```bash
git add lib/theme/tokens.ts app/index.tsx app/+not-found.tsx
git commit -m "feat(theme): aplica tokens canônicos do DESIGN.md em lib/theme/tokens.ts"
```

- [ ] **Step 3: Push + PR**

```bash
git push -u origin feature/03-aplicar-tokens-design
gh pr create \
  --title "feat(theme): aplica tokens canônicos do DESIGN.md" \
  --body "$(cat <<'EOF'
## O que mudou

- \`lib/theme/tokens.ts\` reescrito com 5 namespaces canônicos (colors, typography, spacing, radius, elevation)
- 20 cores + 12 tipografias + 8 spacings + 6 radii + 4 elevations — valores exatos do DESIGN.md
- \`app/index.tsx\` e \`app/+not-found.tsx\` atualizados para usar nomes canônicos
- Zero hardcoded hex em \`app/\` ou \`components/\`

## Validação

- [x] \`tsc --noEmit\` zero erros
- [x] Zero refs a nomes antigos (\`colors.background\`, \`colors.primary\`, etc.)
- [x] Zero hardcoded hex fora de \`lib/theme/tokens.ts\`

## Referência

Executado via Prompt 03-LOW-aplicar-tokens-design
EOF
)"
```

---

## Self-Review — Spec Coverage

| Critério do Prompt 03 | Coberto? | Onde |
|---|---|---|
| `tokens.ts` substituído por tokens canônicos | ✅ | Task 1 |
| 5 namespaces: colors, typography, spacing, radius, elevation | ✅ | Task 1 |
| Valores hex exatos do DESIGN.md (não do design.json) | ✅ | Task 1 + nota discrepância |
| `as const` em todos os objetos | ✅ | Task 1 |
| `tsc --noEmit` sem erros | ✅ | Task 4 Step 1 |
| `app/index.tsx` atualizado | ✅ | Task 2 |
| `app/+not-found.tsx` atualizado (se tiver refs antigas) | ✅ | Task 3 |
| Zero hardcoded hex em `app/` e `components/` | ✅ | Task 4 Step 3 |
| Commit descritivo exato | ✅ | Task 5 Step 2 |
| Branch `feature/03-aplicar-tokens-design` + PR | ✅ | Task 5 Step 3 |
| NÃO instalar libs novas | ✅ | nenhum npm install no plano |
| NÃO modificar DESIGN.md ou design.json | ✅ | somente leitura |
| NÃO modificar app.json / package.json / configs | ✅ | fora do escopo |
