---
status: aprovado por Leo
prompt: docs/prompts/19-MID-migracao-liquid-glass.md
branch alvo: feature/19-migracao-liquid-glass
worktree: /private/tmp/doseday-liquid-glass
data: 2026-05-18
---

# Prompt 19 — Migracao Liquid Glass real iOS 26+

## TL;DR

Migrar a tab bar do fallback aproximado com `expo-blur` para Liquid Glass nativo via `expo-glass-effect` no iOS 26+, preservando `BlurView` como fallback visual em iOS <26 e Android.

Escopo cirurgico:

| Arquivo | Acao |
|---|---|
| `package.json` / lockfile | Adicionar `expo-glass-effect` via `npx expo install` |
| `components/ui/TabBarBackground.tsx` | Novo switch `isGlassEffectAPIAvailable()` -> `GlassView`; fallback -> `BlurView` |
| `app/(tabs)/_layout.tsx` | Trocar `BlurView` inline por `<TabBarBackground />` |
| `docs/DESIGN.md` | Atualizar descricao de Glass para `expo-glass-effect` + fallback `BlurView` |
| `docs/architecture.md` | Marcar Aprendizado #1 como resolvido no Prompt 19, sem deletar historico |
| `CLAUDE.md` | Atualizar Historico ao final |
| `assets/screenshots/prompt19/` | Screenshots reais para PR |

Fora de escopo: Native Tabs, `@expo/ui`, glass em conteudo, `tintColor`, `glassEffectStyle="clear"`, edicoes em `TabBarButton.tsx`, tokens, telas ou navegacao alem do background da tab bar.

## Skills aplicadas

| Skill | Uso |
|---|---|
| `react-native-best-practices` | Padrao RN/Expo para componente pequeno com fallback runtime |
| `liquid-glass:liquid-glass` | Glass somente na camada de navegacao, iOS 26+, estilo regular |
| `impeccable:impeccable` | Shape brief antes do codigo e critique antes de marcar pronto |
| `superpowers:writing-plans` | Regra 21 cumprida por este plano persistido antes do codigo |

Observacao: a skill local `ios-liquid-glass-expo` nao estava disponivel na sessao. A intencao foi coberta por `liquid-glass` e docs oficiais Expo SDK 54.

## Karpathy Self-Tests

| Disciplina | Decisao |
|---|---|
| Think Before Coding | Assumir iPhone 17 Simulator em iOS 26+; confirmar runtime via `js_eval`; usar `isGlassEffectAPIAvailable()` e nao `isLiquidGlassAvailable()` |
| Simplicity First | Um componente novo pequeno, uma troca no layout, dependencia oficial Expo |
| Surgical Changes | Cada linha deve rastrear para a migracao da tab bar ou para docs/historico exigidos |
| Goal-Driven Execution | `type-check`, `lint`, greps, MCP runtime, screenshots reais e PR com URLs raw usando commit SHA |

## Shape Brief

| Item | Decisao |
|---|---|
| Superficie | Tab bar existente, camada de navegacao |
| Visual lane | Produto restrained: Clinical Midnight + Liquid Glass nativo somente na tab bar |
| Cena | Mariana abre o app a noite, em iPhone atualizado, para checar o tratamento em segundos |
| Interacao | JS Tabs existentes com `TabBarButton` preservado |
| Anti-goals | Sem Native Tabs, sem glass em conteudo, sem `tintColor`, sem `"clear"` |

## Plano

| Checkpoint | Acao | Validacao |
|---|---|---|
| 1 | Criar worktree `/private/tmp/doseday-liquid-glass/` na branch `feature/19-migracao-liquid-glass` | `git status --branch` |
| 2 | Instalar `expo-glass-effect` com `npx expo install expo-glass-effect` | `package.json` e lockfile atualizados |
| 3 | Criar `TabBarBackground` e trocar `_layout.tsx` | Greps confirmam runtime check, fallback BlurView e ausencia de BlurView inline |
| 4 | Atualizar docs e historico | `docs/DESIGN.md`, `docs/architecture.md`, `CLAUDE.md` consistentes |
| 5 | Validar, capturar screenshots, commitar, pushar e abrir PR via MCP GitHub | `type-check`, `lint`, bateria MCP, PR com imagens reais |

## Riscos e mitigacoes

| Risco | Mitigacao |
|---|---|
| Dependencia nativa exige rebuild | Rodar `npx expo run:ios` apos instalacao |
| Runtime check retorna `false` no simulador | Fallback `BlurView` permanece e o achado sera registrado |
| Tap em tab bar instavel | Usar `open_deeplink` para navegacao e IDB/MCP apenas para pressed state |
| Worktree principal sujo | Trabalhar somente em `/private/tmp/doseday-liquid-glass/` |
| Warning preexistente no lint | Reportar como preexistente, sem introduzir erro novo |

## Bateria MCP

| # | Ferramenta | Criterio |
|---|---|---|
| 1 | `ping` + `get_metro_status` | MCP conectado ao iPhone 17 e Metro ativo |
| 2 | `open_deeplink` / signin se necessario | Home renderiza com tab bar |
| 3 | `js_eval` | `require('expo-glass-effect').isGlassEffectAPIAvailable()` retorna valor esperado |
| 4 | `screenshot` Home | Tab bar com Glass real ou fallback documentado |
| 5 | `open_deeplink` Doses/Diario/Relatorios/Perfil | Todas as tabs renderizam |
| 6 | `get_view_hierarchy` | Labels/roles da navegacao preservados |
| 7 | `tap` ou IDB no botao de tab | Pressed state preserva scale/haptic, screenshot do estado |
| 8 | `scroll` + `screenshot` | Glass/fallback permanece correto com conteudo por baixo |

## Greps tecnicos

```bash
npm run type-check
npm run lint
rg "expo-glass-effect" package.json
rg "isGlassEffectAPIAvailable" components/ui/TabBarBackground.tsx
rg "isLiquidGlassAvailable" .
rg "BlurView" components/ui/TabBarBackground.tsx
rg "BlurView" 'app/(tabs)/_layout.tsx'
rg 'tintColor.*colors.brand|tintColor="#00D4AA' components
```
