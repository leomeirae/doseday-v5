# Plano — fix navegação auth (redirect race + rota órfã)

**Data:** 2026-05-29
**Branch:** `fix/auth-nav-redirect-race` (a partir de `main`, #96 mergeado)
**PR target:** `main`

## Objetivo

Eliminar 3 warnings de navegação no fluxo de auth e engrenagem, **sem tocar na lógica do gate de auth** do root `_layout`:

1. `REPLACE (tabs) not handled`
2. `No route named configuracoes`
3. (investigar, não corrigir) `GO_BACK not handled` — se persistir, só reportar onde ocorre.

## Causa (validada via grep/read)

| # | Premissa | Evidência |
|---|----------|-----------|
| 1 | `name="configuracoes"` é órfã; rota real é `configuracoes/index` | `app/configuracoes/index.tsx` existe; demais Stack.Screen usam path completo. `_layout.tsx:231` único incompleto |
| 2 | signup faz `router.replace('/(tabs)')` manual, correndo com o gate | `signup.tsx:69` |
| 3 | signin faz `router.replace('/(tabs)')` manual | `signin.tsx:63` |
| 4 | Gate cobre todo o roteamento por sessão/onboarding/grupo | `_layout.tsx:112-120` |

## Mudanças (3 pontos, 3 arquivos)

1. **`app/_layout.tsx:231`** — `name="configuracoes"` → `name="configuracoes/index"`. Nada mais.
2. **`app/(auth)/signup.tsx:68-73`** — remover `router.replace('/(tabs)')`; preservar branch de confirmação de email (`if (!session)` mostra a mensagem). Gate roteia quando há sessão.
3. **`app/(auth)/signin.tsx:57-64`** — remover `router.replace('/(tabs)')` e tirar `session` do destructure (`const { error } = ...`) p/ evitar unused-var. Gate roteia.

## Restrições

- Gate de auth (`_layout.tsx:49-144`) **INTOCADO**.
- Tratamento de erro (mensagens) preservado.
- Nenhuma outra rota/tela/hook/schema.
- `git add` só por path explícito dos 3 arquivos. Zero `graphify-out/`, `.codegraph/`, `" 2."`.

## Validação

1. `npm run type-check` (exit 0)
2. `npm run lint` (exit 0)
3. Console do simulador: 3 warnings sumiram (capturar log antes/depois).
4. `GO_BACK not handled` persistir → reportar local, sem fix.
5. `git status --short` antes/depois; reportar "git status validado, zero contaminação".
6. PR p/ `main` com log do console no corpo.
