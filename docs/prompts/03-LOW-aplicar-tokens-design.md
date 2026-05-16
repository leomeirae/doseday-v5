# DoseDay V5 — Prompt 03-LOW-aplicar-tokens-design

**Instância de destino:** ☑ Agent View (sessão dedicada). Dispatch via `claude agents`.
**Worktree:** automático em `.claude/worktrees/`
**Branch a criar:** `feature/03-aplicar-tokens-design`
**Caveman:** N/A (decisão estratégica: não usar no projeto)

> **Importante:** este prompt assume que os Prompts 00, 01 e 02 já foram mergeados em `main`. Verifica `git log --oneline -n 5` antes de começar.

## Contexto obrigatório (leia antes de qualquer coisa)

- `/Users/leofrancaia/Desktop/dose-day-v5/CLAUDE.md` — memória do projeto
- `/Users/leofrancaia/Desktop/dose-day-v5/docs/PRODUCT.md` — persona Mariana, tom, vocabulário-âncora
- `/Users/leofrancaia/Desktop/dose-day-v5/docs/DESIGN.md` — **fonte de verdade dos tokens canônicos** (cores, tipografia, elevation, spacing)
- `/Users/leofrancaia/Desktop/dose-day-v5/.impeccable/design.json` — sidecar com tokens em formato máquina
- `/Users/leofrancaia/Desktop/dose-day-v5/docs/architecture.md` — estrutura técnica
- `/Users/leofrancaia/Desktop/dose-day-v5/docs/skills-stack.md` — quais skills usar

## Objetivo desta tarefa

Substituir os tokens placeholder em `lib/theme/tokens.ts` pelos **tokens canônicos do DESIGN.md**. Resultado: o código React Native passa a referenciar os mesmos tokens documentados, eliminando o drift entre design e implementação.

Após este prompt, todo componente futuro do app pode importar tokens (`colors.brand`, `spacing.md`, etc.) com a garantia de que estão alinhados com a fonte de verdade.

## Critérios de aceitação

- [ ] `lib/theme/tokens.ts` substituído pelos tokens do `DESIGN.md` (19 cores + 11 tipografias + spacing + radius + elevation)
- [ ] Estrutura exportada em 5 namespaces: `colors`, `typography`, `spacing`, `radius`, `elevation`
- [ ] Todos os valores hex casam **exatamente** com o `frontmatter YAML` do `DESIGN.md` e com `.impeccable/design.json`
- [ ] Tipos TypeScript estritos: `as const` em todos os objetos (token literal types)
- [ ] `tsc --noEmit` passa sem erros
- [ ] `app/index.tsx` ainda renderiza sem warnings (substituir os tokens placeholder por canônicos onde for usado)
- [ ] Nenhum hardcoded hex resta em `app/` ou `components/` (apenas references via tokens)
- [ ] Commit descritivo: `feat(theme): aplica tokens canônicos do DESIGN.md em lib/theme/tokens.ts`
- [ ] Branch `feature/03-aplicar-tokens-design` mergeada em `main` via PR

## Restrições explícitas

- **NÃO** redefinir tokens. Use literalmente os valores do `DESIGN.md` e `design.json`.
- **NÃO** adicionar tokens novos que não existam no `DESIGN.md`.
- **NÃO** mudar nomes dos tokens (`colors.brand`, não `colors.primary`).
- **NÃO** usar `as any`, `// @ts-ignore`, `// eslint-disable` sem justificativa explícita.
- **NÃO** instalar bibliotecas novas (sem `npm install`).
- **NÃO** modificar `DESIGN.md` ou `design.json` — são fonte de verdade.
- **NÃO** modificar `app.json`, `package.json`, ou configs.

## Detalhes técnicos

### Estrutura esperada do `lib/theme/tokens.ts`

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

  // Clinical data (gráficos)
  clinicalWeight: '#00D4AA',
  clinicalDose: '#5BA8D9',
  clinicalMild: '#7DD3A0',
  clinicalModerate: '#FFB347',
  clinicalSevere: '#E64545',
} as const;

export const typography = {
  display: { fontFamily: 'system', fontSize: 32, fontWeight: '700' as const, lineHeight: 38 },
  headline: { fontFamily: 'system', fontSize: 28, fontWeight: '600' as const, lineHeight: 34 },
  title: { fontFamily: 'system', fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  subtitle: { fontFamily: 'system', fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontFamily: 'system', fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyClinical: { fontFamily: 'system', fontSize: 15, fontWeight: '400' as const, lineHeight: 24 },
  label: { fontFamily: 'system', fontSize: 16, fontWeight: '600' as const, lineHeight: 20 },
  caption: { fontFamily: 'system', fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  tabLabel: { fontFamily: 'system', fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
  numberLarge: { fontFamily: 'system', fontSize: 40, fontWeight: '700' as const, lineHeight: 48 },
  numberMedium: { fontFamily: 'system', fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  monoData: { fontFamily: 'SF Mono', fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const elevation = {
  0: { shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 } },
  1: { shadowOpacity: 0.20, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  2: { shadowOpacity: 0.30, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  3: { shadowOpacity: 0.45, shadowRadius: 32, shadowOffset: { width: 0, height: 12 } },
} as const;
```

(A estrutura acima é uma sugestão. Confira contra `DESIGN.md` e use os valores exatos.)

### Atualizar `app/index.tsx`

O `app/index.tsx` atualmente usa tokens placeholder. Substituir pelas referências canônicas:

```typescript
// Antes (placeholders genéricos)
backgroundColor: colors.background,
color: colors.text,

// Depois (tokens canônicos do DESIGN.md)
backgroundColor: colors.bgBase,
color: colors.textPrimary,
```

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Planejamento | `superpowers:writing-plans` | Plano estruturado |
| Implementação | Edit + Read | Editar `tokens.ts` |
| Validação | `Bash: tsc --noEmit` | TypeScript checa |
| Code review | `review` (do Impeccable) | Confirmar conformidade com DESIGN.md |

### B) Plano de execução

Lista numerada com checkpoints. Sugestão:

1. Criar branch `feature/03-aplicar-tokens-design`
2. Ler `DESIGN.md` e `design.json` pra extrair todos os tokens
3. Reescrever `lib/theme/tokens.ts` com namespaces canônicos
4. Atualizar `app/index.tsx` pra usar nomes corretos (`bgBase`, `textPrimary`)
5. Atualizar `app/+not-found.tsx` se referenciar tokens antigos
6. Rodar `tsc --noEmit` — deve passar
7. Rodar `npx expo start --ios` — app deve abrir sem warnings
8. Commit + PR

### C) Riscos identificados

- Tokens placeholder podem estar sendo importados em outros arquivos além de `app/index.tsx` — fazer busca por `from '@lib/theme/tokens'` antes de mudar
- Mudança de nome (`colors.primary` → `colors.brand`) pode quebrar import existente — atualizar todos os usos
- TypeScript pode reclamar de `as const` se tokens forem usados como string genérica em outro lugar

### D) Arquivos que vai criar/editar

| Arquivo | Ação | Resumo |
|---|---|---|
| `lib/theme/tokens.ts` | substituir | Tokens canônicos completos |
| `app/index.tsx` | editar | Atualizar refs de tokens (`background` → `bgBase`, `text` → `textPrimary`) |
| `app/+not-found.tsx` | editar (se tiver refs antigas) | Idem |

### E) Como vai validar

- [ ] `Bash: tsc --noEmit` passa (zero erros novos)
- [ ] `Bash: rtk grep "from '@lib/theme/tokens'" .` confirma todos os imports atualizados
- [ ] `Bash: rtk grep "#" lib/theme/tokens.ts | wc -l` = quantidade esperada de hex (~19 cores + outros)
- [ ] `npx expo start --ios` abre app sem warnings
- [ ] Simulador renderiza "DoseDay / V5 — Inicializando" sem mudança visual perceptível (substituições foram semânticas, não visuais — a paleta é a mesma)

### F) Otimização de tokens (RTK)

Comandos `rtk *` específicos pra esta tarefa:
- `rtk read lib/theme/tokens.ts` — lê arquivo atual compactado
- `rtk read docs/DESIGN.md` — lê DESIGN compactado
- `rtk grep "from '@lib/theme/tokens'" .` — encontra todos os imports antigos
- `rtk tsc --noEmit` — TypeScript check com saída comprimida

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.

---

## Observação adicional

Este é o primeiro prompt executado via Agent View. Boas práticas:

1. Dispatch via `claude agents` na pasta principal
2. Aguarda "Needs input" pra entregar o plano
3. Léo aprova ou ajusta via peek (`Space`)
4. Execução roda em worktree separado (auto-criado)
5. Ao final, gera PR + Léo mergeia + `Ctrl+X` 2× pra deletar sessão e limpar worktree

Sem essa rotina, sessões e worktrees acumulam.
