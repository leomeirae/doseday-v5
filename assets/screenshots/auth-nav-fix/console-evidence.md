# Evidência de console — fix/auth-nav-redirect-race

Capturado via react-native devtools MCP (Metro CDP), simulador iPhone 17, app `com.doseday.premium`.

## ANTES (código original, buffer de startup da sessão)

| Warning | Ocorrências |
|---|---|
| `WARNING [Layout children]: No route named "configuracoes" exists in nested children` | **6×** |
| `ERROR The action 'REPLACE' with payload {"name":"(tabs)",...}` ... not handled | **1×** (disparado pelo signup que levou o app ao estado de onboarding) |
| `GO_BACK ... not handled` | **0×** (não ocorreu) |

## DEPOIS (com fix, app recarregado via expo.reloadAppAsync)

Dois reloads completos + captura no mount:

| Warning | Ocorrências |
|---|---|
| `No route named "configuracoes"` / `[Layout children]` | **0×** |
| `REPLACE ... (tabs) ... not handled` | **0×** |
| `GO_BACK ... not handled` | **0×** |

Liveness confirmada: na mesma janela de captura pós-reload, o startup ainda emitiu um
warning não-relacionado (`[notifications] failed to get push token: ... Invalid uuid`,
pré-existente, fora de escopo) — provando que logs de mount estão sendo capturados e que
o warning de rota órfã genuinamente sumiu (não é conexão morta).

## Nota sobre o REPLACE
As duas únicas chamadas `router.replace('/(tabs)')` no grupo `(auth)` (signup.tsx:69,
signin.tsx:63 — provadas por grep, exatamente 2) foram removidas. Sem elas, nenhum caminho
do fluxo de auth dispara o REPLACE prematuro; o gate de auth do root `_layout` assume o
roteamento (conta nova → `(onboarding)`, login → `(tabs)`). Estado atual do simulador após
o fix: app em `(onboarding)` sem warning — consistente com o roteamento esperado pelo gate.
