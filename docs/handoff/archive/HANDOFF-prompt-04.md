# Handoff — DoseDay V5 — Pós Prompt 04

**Data:** 2026-05-16
**Branch:** `feature/04-tab-bar-5-abas`
**Status:** ✅ Implementado, validado no simulador iOS 26, commit feito, PR #4 aberto. Aguarda merge do Léo.

---

## O que foi feito nesta sessão

### Prompt 04 — Tab Bar 5 Abas (concluído, aguarda PR merge)

**Objetivo:** Substituir a tela "DoseDay / V5 — Inicializando" por estrutura de navegação com tab bar glass + 5 rotas.

**Artefatos:**
- Plano: `docs/superpowers/plans/2026-05-16-tab-bar-5-abas.md`
- PR: https://github.com/leomeirae/doseday-v5/pull/4
- Prompt fonte: `docs/prompts/04-MID-tab-bar-5-abas.md`

**Arquivos criados/deletados:**

| Arquivo | Ação |
|---|---|
| `app/(tabs)/_layout.tsx` | CRIADO — Tabs + BlurView + SymbolView + SafeArea |
| `app/(tabs)/index.tsx` | CRIADO — placeholder Início |
| `app/(tabs)/doses.tsx` | CRIADO — placeholder Doses |
| `app/(tabs)/diario.tsx` | CRIADO — placeholder Diário |
| `app/(tabs)/relatorios.tsx` | CRIADO — placeholder Relatórios |
| `app/(tabs)/perfil.tsx` | CRIADO — placeholder Perfil |
| `components/ui/TabBarButton.tsx` | CRIADO — Reanimated scale 0.96 + Haptics |
| `app/index.tsx` | DELETADO — conflito de rota com (tabs)/index.tsx |
| `package.json` | expo-symbols@~1.0.8 adicionado |

---

## Decisões registradas (não no diff)

### `chart.bar` em vez de `chart.bar.doc.horizontal`
`app.json` não tem `deploymentTarget` explícito → Expo SDK 54 default iOS 15.1. `chart.bar.doc.horizontal` é iOS 16+. Usado `chart.bar` (iOS 14+) como fallback seguro.

### `tabBarLabelStyle` sem `fontFamily`
`typography.tabLabel.fontFamily = 'system'` não é fonte válida em RN. Extraídos apenas `fontSize: 11, fontWeight: '500', lineHeight: 14` sem tocar em `tokens.ts`.

### `ACTIVE_TINT` como inline const
`rgba(0, 212, 170, 0.12)` (brand-fade) não existe em `colors`. Como `tokens.ts` está congelado (Prompt 03), o valor foi definido como `const ACTIVE_TINT` em `TabBarButton.tsx`.

### `expo install --legacy-peer-deps`
O projeto tem conflito pré-existente `react@19.1.0` vs `react-dom@19.2.6`. O `expo install expo-symbols` falhou sem a flag. Solução: `npx expo install expo-symbols -- --legacy-peer-deps`. Não alteramos `.npmrc` — o conflito é pré-existente e não bloqueou builds.

### TypeScript fixes durante execução
- `accessibilityLabel` não existe em `Tabs.Screen` options → corrigido para `tabBarAccessibilityLabel`
- `exactOptionalPropertyTypes: true` no tsconfig forçou `| undefined` explícito em todos os campos opcionais do `TabBarButtonProps` + uso de `AccessibilityState` nativo do RN

---

## Estado atual do repositório

| Item | Estado |
|---|---|
| Branch | `feature/04-tab-bar-5-abas` |
| PR | [#4 aberto](https://github.com/leomeirae/doseday-v5/pull/4) — aguarda merge |
| `tsc --noEmit` | ✅ zero erros |
| Teste visual simulador iOS 26 | ✅ confirmado por Léo (screenshot) |
| `app/(tabs)/` | ✅ 6 arquivos (layout + 5 telas) |
| `components/ui/TabBarButton.tsx` | ✅ haptic + scale animation |
| Commit | ✅ `feat(nav): tab bar 5 abas com BlurView glass + SF Symbols + haptic` |

**Arquivos modificados externamente (não no PR #4, pendentes para próxima sessão):**
- `CLAUDE.md` — atualizado fora desta sessão
- `docs/architecture.md` — atualizado fora desta sessão
- `docs/guia-do-leo.md` — novo
- `.claude/settings.local.json` — settings locais

**Arquivos untracked não commitados (pré-existentes ou próximos prompts):**
- `AGENTS.md`
- `docs/agent-view-cheatsheet.md`
- `docs/prompts/03-LOW-aplicar-tokens-design.md`
- `docs/prompts/05-LOW-remover-fontfamily-system.md` — próximo prompt já preparado

---

## Próximas ações imediatas

1. **Léo faz merge do PR #4** no GitHub
2. **Verificar `docs/prompts/05-LOW-remover-fontfamily-system.md`** — prompt já existe para resolver o `fontFamily: 'system'` nos tokens (LOW, pode ser executado diretamente ou deferido)
3. **Próximo prompt de feature**: verificar `docs/prompts/README.md` para o próximo item da fila

---

## O que NÃO foi feito (fora do escopo do Prompt 04)

- Nenhuma tela com conteúdo real (todo placeholder)
- Nenhuma autenticação / rota de auth
- Haptic não testável no simulador (comportamento esperado — funciona em device físico)
- `@expo/ui` continua proibido (aprendizado #1 permanece)
- `deploymentTarget` não foi adicionado ao `app.json` (decisão deferida)

---

## Skills sugeridas para a próxima sessão

| Skill | Quando usar |
|---|---|
| `react-native-best-practices` | Qualquer tela nova com scroll, gesture ou animação |
| `impeccable` (craft/distill) | Para construir telas reais com conteúdo (Início, Doses) |
| `liquid-glass:liquid-glass` | Se `@expo/ui` estável for reintroduzido (SDK 54 stable release) |
| `superpowers:writing-plans` | Para qualquer prompt MID/HIGH seguinte |
| `grill-with-docs` | Se próximo prompt tocar domínio GLP-1 ou schema Supabase |
| `handoff` | Ao fim da próxima sessão |

---

## Referências

- Prompt executado: `docs/prompts/04-MID-tab-bar-5-abas.md`
- Plano de execução: `docs/superpowers/plans/2026-05-16-tab-bar-5-abas.md`
- PR: https://github.com/leomeirae/doseday-v5/pull/4
- Handoff anterior: `docs/handoff/HANDOFF-prompt-03.md`
- Tokens canônicos (congelados): `lib/theme/tokens.ts`
- Design system: `docs/DESIGN.md`
