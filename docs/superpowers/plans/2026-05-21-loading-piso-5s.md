# Plano — Prompt 34: Loading piso 5s + skip em cache-hit

**Branch:** `feature/34-loading-piso-5s`
**Data:** 2026-05-21
**Origem:** `docs/prompts/34-LOW-loading-piso-5s.md` · §10 de `08-direcao-visual-primeiros-3-minutos.md`

## Contexto

`app/(onboarding)/loading.tsx` orquestra Welcome → Loading → Result: mostra 5
micro-steps animados enquanto a Edge Function `generate-onboarding-insight`
gera o insight, e então navega pro Result.

O piso temporal de 5s **já está implementado** (via `MIN_DURATION_MS=5000` +
estado `minElapsed`, combinado com `stepsDone` + `aiSettled` na condição
`ready`). O cap de 15s (`MAX_DURATION_MS`) e o fallback de erro
(`insight.isError`) também já existem.

Gap único: quando o insight já está cacheado no React Query
(`staleTime/gcTime: Infinity`), o piso de 5s ainda é aplicado — vira UX de
"parou". Falta o branch de saída.

## Decisão (Opção 2 + 3 ajustes, aprovada pelo Léo)

Inferir cache-hit do estado do React Query, **sem flag nova no hook**.
`hooks/useOnboardingInsight.ts` não é tocado.

1. Detecção: `insight.isFetched && insight.data && !insight.isFetching` no 1º
   render, capturado via `useState(() => ...)`.
2. Cache-hit pula `minElapsed` (piso=0) mas mantém `stepsDone` — os 5
   micro-steps renderizam (estado `done`), sem espera temporal entre eles.
3. Screenshot extra `T0-cache-hit-instant.png`.

## Implementação — `app/(onboarding)/loading.tsx` (único arquivo de código)

- `const [cacheHit] = useState(() => insight.isFetched && !!insight.data && !insight.isFetching)`
- `stepIndex` inicia em `cacheHit ? STEP_KEYS.length : 0`
- `minElapsed` inicia em `cacheHit`
- `useEffect` dos timers: `if (cacheHit) return` antes de montar timers; dep `[cacheHit]`
- Resto inalterado (constantes, copy dos steps, JSX, styles).

Resultado em cache-hit: `ready = minElapsed && aiSettled && stepsDone` → true no
próximo tick → navega imediato pro Result.

## Restrições (Karpathy regra 22)

- Diff cirúrgico (~12 add / ~4 alt). Sem componente novo. Sem `Promise.all`
  rewrite — o state-machine atual já é não-bloqueante e correto.
- Não tocar `useOnboardingInsight.ts`, Edge Function, `result.tsx`.
- Reduce Motion já honrado no arquivo — nada a fazer.
- Zero `as any` / `@ts-ignore` / `eslint-disable`.

## Verificação

1. `npx tsc --noEmit` PASS · `npm run lint` PASS (1 warning preexistente em
   `lib/i18n/index.ts` aceito).
2. `react-native-devtools-mcp` — login `leonardo-fase0@teste.com`, 4
   screenshots em `assets/screenshots/2026-05-21-prompt34/`:
   `T0-loading-start.png`, `T2_5s-loading-meio.png`, `T5s-loading-fim.png`,
   `T0-cache-hit-instant.png`.
3. Stopwatch via `js_eval`: caminho feliz ≥ 5s; cache-hit < 1s.
4. Console limpo durante a animação.
5. `/impeccable critique` ≥ 28/40.
6. Aprendizado #55 em `docs/learnings.md` (feito).

## PR

`feat(onboarding): piso de 5s no Loading IA + skip em cache-hit` — body
referenciando §10 do `08-direcao-visual` + 4 screenshots reais.
