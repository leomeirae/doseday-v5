# Aprendizados — DoseDay V5

> Aprendizados acumulados após cada prompt. Atualizar este arquivo (não architecture.md) quando registrar novos.

---

## 14. Aprendizados — Prompt 00 (Bootstrap)

Registrado em 2026-05-15 após execução do bootstrap. Não alteram o plano — documentam o que funcionou diferente do esperado.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 1 | **`@expo/ui` canary (`v0.2.0`) incompatível com SDK 54.** Usa `SafeAreaControllable` e `RNHostViewProtocol` ausentes no `expo-modules-core` SDK 54. | Reintroduzir no Prompt 04. Alternativa temporária: `expo-blur` para efeito de vidro. **RESOLVIDO no Prompt 19:** substituído por `expo-glass-effect` (pacote estável dedicado, não canary). `@expo/ui` foi abandonado em favor desta solução. |
| 2 | **iOS 26 sem Expo Go.** `expo start --ios` falha com `TypeError: fetch failed` — o `xcrun simctl openurl` não tem app para abrir `exp://`. | Usar `npx expo run:ios` para todo dev local em iOS 26. EAS não afetado. |
| 3 | **`babel-preset-expo` deve ser `devDependency` explícita.** Não vem automaticamente ao recriar `package.json` manualmente. Metro não transpila sem ele. | Sempre incluir em `devDependencies` ao criar projeto Expo do zero. |
| 4 | **`react-native-worklets@0.5.1` é peer dep obrigatório do `react-native-reanimated@~4.1.x`.** | Sempre instalar os dois juntos. Sem ele, `pod install` falha com "Failed to validate worklets version". |

---

## 14.1 Aprendizados — Prompt 07 (ESLint flat config)

Registrado em 2026-05-17 após migração de `.eslintrc.js` → `eslint.config.js`.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 5 | **ESLint v10 não suporta mais legacy config.** Repos criados com bootstrap antigo precisam migrar pra flat config (`eslint.config.js`/`.mjs`) antes do primeiro `npm run lint`. | Em bootstraps futuros, já criar com flat config desde o início. |
| 6 | **`eslint-plugin-react@7.x` quebra no ESLint v10 quando `react.version: 'detect'`.** O plugin usa `context.getFilename()`, API removida na v10. Crash silencioso ao rodar lint. | Sempre pinar `react.version` explicitamente no `settings` do flat config — para Expo 54 + RN 0.81, usar `'18.0.0'`. |
| 7 | **Script `lint` em `package.json` precisa perder o `--ext .ts,.tsx`.** Flat config define os files via pattern no próprio config. Script correto: `"lint": "eslint ."`. | Aplicar em qualquer migração futura. |

---

## 14.2 Aprendizados — Prompt 09 (Supabase client + session)

Registrado em 2026-05-17 após implementação do cliente Supabase e AuthProvider.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 8 | **`@types/*` é namespace reservado pelo TypeScript.** Importar `from '@types/database'` gera TS6137 ("Cannot import type declaration files"). O tsconfig pode ter `@types/*` como path alias, mas TS bloqueia o import. | Sempre usar path relativo (ex: `../../types/database`) quando o arquivo está dentro de `lib/`. Alternativa: renomear o alias para `@db/*` ou `@schema/*`. |
| 9 | **Logs de `console.log` do React Native (Hermes) não aparecem no stdout do Metro quando redirecionado para arquivo.** Vão via CDP (Chrome DevTools Protocol) WebSocket. Capturar com Node.js conectando ao endpoint `ws://localhost:8081/inspector/debug?device=ID&page=1` e escutando eventos `Runtime.consoleAPICalled`. | Para validação headless de lógica JS no simulador, usar script Node.js com o WebSocket CDP. Não tentar capturar com `tee` ou `CI=1`. |

---

## 14.3 Aprendizados — Prompt 10 (telas signin/signup)

Registrado em 2026-05-17 após implementação do fluxo de autenticação completo.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 10 | **Expo Router route groups são transparentes na URL.** `(auth)` some da URL: o deep link para `app/(auth)/signin.tsx` é `/signin`, não `/(auth)/signin`. Ao usar `router.replace` ou `open_deeplink`, usar sempre o caminho sem o grupo. | Em qualquer tela nova dentro de grupos `(auth)`, `(tabs)`, etc, usar o caminho sem parênteses no deep link e no `router.push/replace`. |
| 11 | **`.expo/types/router.d.ts` não é regenerado automaticamente no type-check.** O Metro regenera ao rodar o dev server, mas `tsc --noEmit` offline não. Quando uma nova route group é criada (`(auth)`), estender manualmente o arquivo antes do type-check — caso contrário, `router.replace('/(auth)/signup')` gera TS2322. | Sempre incluir `.expo/types/router.d.ts` no escopo quando um prompt criar nova route group ou nova tela. `.expo/` está no `.gitignore`, então não commitar. |
| 12 | **`xcrun simctl io tap` não existe no Xcode / iOS 26 simulator.** O subcomando `io` do simctl não suporta `tap`, `swipe` ou `type`. Usar `idb ui tap --udid DEVICE_UDID x y` e `idb ui text --udid DEVICE_UDID "texto"` via Facebook IDB. | Toda automação de toque/texto no simulador iOS: sempre usar `idb ui *`, nunca `xcrun simctl io *`. Pré-requisito: `idb-companion` (Homebrew) + `fb-idb` (pip3). |
| 13 | **`js_eval` do MCP react-native não aguarda Promises.** Expressões async (`await supabase.auth.signIn(...)`) retornam `[]` ou `undefined`. Usar para evals síncronos apenas (ler estado, verificar valor de variável). Para auth async, preferir `open_deeplink` + verificar estado após navegação. | Nos critérios de aceitação de prompts futuros: nunca colocar `js_eval` para operações async. Usar `tap` + `type_text` + `screenshot` para fluxos de formulário. |
| 14 | **DEV link fica oculto quando existe sessão ativa.** `{__DEV__ && !session}` funciona como esperado — se há sessão persistida no SecureStore do Prompt 09, o link não aparece. Isso é comportamento correto; não confundir com bug. | Ao testar DEV links em futuros prompts: fazer `signOut` primeiro via `js_eval('supabase.auth.signOut()')` se a sessão existir. |

---

## 14.4 Aprendizados — Prompt 11 (AuthGuard + recover + perfil V1)

Registrado em 2026-05-18 após fechamento do ciclo de autenticação.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 15 | **`useRootNavigationState` é obrigatório no AuthGuard para evitar race condition.** Sem o guard `if (!navigationState?.key) return`, o `router.replace` dispara antes do navegador montar, causando crash silencioso (`navigate()` called before mount). | Todo guard de navegação baseado em sessão deve checar `navigationState?.key` antes de chamar qualquer `router.*`. |
| 16 | **`router` deve estar no array de deps do `useEffect` do AuthGuard.** O eslint `react-hooks/exhaustive-deps` sinaliza se omitido. Embora `router` seja estável, incluir é a abordagem correta para passar lint sem `// eslint-disable`. | Sempre incluir `router` nos deps de `useEffect` que chamam `router.replace/push`. |
| 17 | **Supabase `resetPasswordForEmail` retorna sucesso mesmo para emails inexistentes (segurança por design).** Não é um bug — é o comportamento intencional da API para não vazar existência de conta. Só expor erro de rede ao usuário; nunca expor o status real do email. | Em fluxos de recover/magic-link: usar `isNetworkError(error.message)` para filtrar o que exibir. Nunca mostrar `error.message` bruto do Supabase diretamente ao usuário. |
| 18 | **O `AuthButton` já computa `isDisabled = disabled || loading` internamente.** Não é necessário passar `disabled={!email || loading}` — passar só `disabled={!email}` já é suficiente; o loading bloqueia via prop `loading`. | Ao usar `AuthButton`, só passar `disabled` para a condição de negócio (campo vazio, validação falhou). Loading é separado. |
| 19 | **`idb ui text` trunca strings com `@` após ~16 caracteres.** Emails como `"leonardo@teste.com"` ficam `"leonardo@teste."` com o `@` sendo interpretado como separador de argumento. Workaround: enviar em dois fragmentos (`"leonardo@teste."` + `"com"`). | Ao digitar email via IDB em testes MCP: sempre dividir no ponto após `@` se o email total tiver >16 chars. |

---

**Fim do documento.**

---

## 14.5 Aprendizados — Prompt 12 (conectar Home e Doses ao Supabase)

Registrado em 2026-05-18 após primeiro prompt com dados reais.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 20 | **`staleTime: 5min` é adequado para dados clínicos de dose.** Doses semanais não mudam segundo a segundo. `refetchOnWindowFocus: false` é correto em mobile (não há conceito de window focus como na web). Configurado em `lib/queryClient.ts`. | Manter esses defaults para todas as queries clínicas. Queries de menor sensibilidade (config do perfil) podem usar `staleTime: Infinity`. |
| 21 | **`getDoseSummary` é a única fonte de verdade para cálculo da próxima dose.** Fórmula: `nextDate = last.applicationDate + last.daysUntilNextDose`. Diff em dias: `round((nextDateMidnight - todayMidnight) / 86400000)`. Não existe entrada futura em `medication_applications` (CHECK constraint `<= now() + 1h`). | Todo cálculo de "próxima dose" no client-side deve usar esta fórmula. Nunca buscar entradas futuras no DB — elas não existem por design. |
| 22 | **`mapQueryError` centraliza tradução de erros de rede para PT-BR.** Padrão estabelecido em `lib/supabase/queries/errors.ts`. Detecta erros de rede (fetch/network), JWT expirado (jwt/401), e genérico. | Todos os hooks que fazem queries Supabase devem usar `mapQueryError` para exibir mensagens ao usuário. Nunca exibir `error.message` bruto. |
| 23 | **DoseCard.time não tem equivalente no banco.** `medication_applications` não tem campo de horário (doses semanais). V1: mapper passa `'--'`. DoseCard guarda o campo mas omite visualmente quando `time === '--'`. | Em V2 (se horário for necessário): adicionar coluna `application_time` na tabela e popular no flow de registro. |
| 24 | **Loading inline (manter scaffold visível) é superior a full-screen spinner.** Home implementou corretamente desde o início; Doses foi corrigido no harden. Manter o contexto visual (headline, SectionHeaders) durante o fetch reduz desorientação. | Em telas com seções fixas (título, headers), sempre usar loading inline nas seções de dados, nunca substituir a tela inteira por spinner. |

## 14.6 Aprendizados — Prompt 13 (registrar nova dose)

Registrado em 2026-05-18 após primeiro fluxo de WRITE do projeto.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 25 | **`display="compact"` do DateTimePicker é invisível em iOS 26 dark mode.** Renderiza com altura/contraste zero. Workaround: botão `TouchableOpacity` customizado com toggle `showPicker` → `<DateTimePicker display="inline" />`. `maximumDate={new Date()}` bloqueia datas futuras no picker. | Sempre usar este padrão em qualquer tela que precise de DateTimePicker em iOS 26. Não tentar `display="compact"` nem `display="spinner"`. |
| 26 | **`simctl io tap` e `simctl io keyboard type` foram removidos no Xcode moderno.** Não funcionam via MCP. Substituir por `idb ui tap X Y --udid <DEVICE_ID>` e `idb ui text "texto"`. Coordenadas: `idb ui describe-all --udid <DEVICE_ID>`. IDB instalado em `/Users/leofrancaia/.local/bin/idb`. | Todos os testes MCP que precisam de tap ou digitação devem usar IDB. Mapear coordenadas com `describe-all` antes de rodar a bateria. |
| 27 | **Tab bar Liquid Glass não expõe items no accessibility tree do IDB.** Navegação entre abas via `mcp__react-native__open_deeplink` com `doseday:///(tabs)/<aba>` é a única abordagem confiável para testes automatizados. | Substituir tap em tab bar por `open_deeplink` em toda bateria MCP futura. |
| 28 | **Typed routes Expo Router:** `router.push('/dose/registrar')` gera TS error se o arquivo de rota não existir no momento da escrita. Criar o arquivo placeholder antes de referenciar a rota, depois substituir pela implementação. | Ao escrever código que navega para uma rota nova, criar o arquivo de rota primeiro (ainda que vazio), depois escrever o código que o referencia. |
| 29 | **Registro de dose ≠ Registro de sintomas. Separação de momentos é o que torna o V5 "memória inteligente".** O ato de aplicar a dose acontece em segundos (North Star: 6s). Efeitos colaterais aparecem horas/dias depois e pertencem ao Diário. Misturar os dois momentos no mesmo form quebra o "6 segundos pra registrar" e confunde ato clínico com experiência subjetiva. | Não migrar padrões da V4 sem questionar UX. Qualquer campo que não pertença ao momento de aplicação (hora, local, dose) deve ser avaliado para o Diário. `side_effects` foi removido do form de Dose e ficará no Prompt 14+ (Diário). |
| 30 | **`useRef` para inicialização única (autopop sem re-fill).** `autoFilledRef.current` permite inicializar um campo com valor do perfil uma única vez, sem re-popular quando usuário limpa o campo, e sem `exhaustive-deps` lint warning. | Usar este padrão em qualquer campo que precise de autopop one-shot a partir de dados assíncronos (perfil, contexto). |

## 14.7 Aprendizados — Prompt 15 (Diário V1)

Registrado em 2026-05-18 após implementação do Diário V1.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 31 | **Metro pode manter bundle stale após adicionar módulos/rotas novas.** Mesmo com `expo start -c`, o simulador carregou placeholder antigo e RedBox `Requiring unknown module` até o app ser encerrado e reaberto. | Após criar novos arquivos importados por uma rota já aberta, se o simulador mostrar módulo desconhecido ou tela antiga, executar `xcrun simctl terminate booted com.doseday.premium` e reabrir com `open_deeplink`. Não diagnosticar como bug de código antes do relaunch. |
| 32 | **MCP `tap`/`press_button` ainda pode cair em `simctl io`, que não suporta tap/key no Xcode atual.** A validação do Diário precisou usar IDB para toque/digitação, com coordenadas em points vindas de `idb ui describe-all`. | Em baterias MCP, usar `open_deeplink`, `screenshot` e `get_view_hierarchy` do MCP; para interação física em iOS, preferir `/Users/leofrancaia/.local/bin/idb ui tap/text/key-sequence --udid <DEVICE_ID>`. |
| 33 | **Email de teste via IDB é mais confiável em 3 fragmentos.** O split `"leonardo@teste." + "com"` ainda perdeu caracteres em uma tentativa (`leonardo@tescom`). O fluxo estável foi `"leonardo"` + `"@teste."` + `"com"`. | Ao digitar email com `@` via IDB, usar fragmentos curtos e validar por screenshot/árvore antes de enviar. Para `leonardo@teste.com`, preferir 3 fragmentos. |
| 34 | **Screenshots reais no PR ficam verificáveis quando versionadas como assets.** O MCP retorna imagem no chat, mas para embed estável no PR o caminho mais simples foi salvar PNG via `xcrun simctl io booted screenshot` em `assets/screenshots/prompt15/` e espelhar em `.impeccable/critique/screenshots/`. | Quando o critério exigir markdown `![desc](url)` no PR, salvar screenshots em `assets/screenshots/<prompt>/` e commitar junto. O PR pode referenciar raw URLs desses arquivos. |
| 35 | **`DiarioTimelineItem` deve renderizar discriminated union no caller, não com `item as never`.** O workaround do plano passa no TS, mas perde segurança de tipo justamente no merge da timeline. | Ao juntar arrays heterogêneos para timeline/feed, renderizar por branch (`entry.kind === ...`) e passar props discriminadas explícitas para o componente. |

## 14.8 Aprendizados — Prompt 16 (Conectar IA Movimento 1)

Registrado em 2026-05-18 após conectar `memory-daily-insight` e `generate-checkin-insight` Edge Functions.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 36 | **Metro bundle cache stale após move de componentes pode reportar path `ui/AuthHeader` em vez de `auth/AuthHeader`.** O arquivo na disk estava correto (`@components/auth/AuthHeader`) mas o bundle cacheado resolveu para path antigo. Solução: `CI=1 npx expo start --port 8081 --clear` + relaunch do app. O hot-reload sozinho não limpa o cache de resolução de módulos. | Antes de diagnosticar "arquivo não existe" em erro Metro, verificar se o bundle foi reconstruído desde o último rename/move. Sempre usar `--clear` quando suspeitar de stale cache após refactor de imports. |
| 37 | **`generate-checkin-insight` Edge Function responde em <4s (gpt-5-mini).** O plan estimava 5-15s e o timeout de 20s foi pensado para P95. Na prática, a loading phase do `CheckinInsightView` foi tão rápida que não foi possível capturar screenshot do `ActivityIndicator`. | Para futuros testes de loading state, usar `js_eval` para injetar delay artificial ou `setTimeout` de 2-3s antes de submeter para garantir frame capturável. |
| 38 | **`deeplink doseday:///(tabs)/home` retorna "Tela não encontrada".** As abas do Expo Router não expõem rotas por nome no deeplink — apenas o índice da aba. Para navegar pra Home via deeplink usar `doseday:///` ou simplesmente terminar o app e reabrir. Para Diário, `doseday:///(tabs)/diario` funciona. | Ao usar `open_deeplink` para tab navigation, testar cada rota antecipadamente. Home é a rota raiz, não `/(tabs)/home`. |
| 39 | **`xcrun simctl io tap` falha no Xcode moderno mas `idb ui tap` funciona.** O MCP `tap` tool internamente usa `xcrun simctl io` que não suporta tap. Para taps em iOS simulador, usar `idb ui tap X Y` via Bash. As coordenadas do `get_view_hierarchy` são pontos lógicos e coincidem com as coordenadas do IDB. | Todos os taps em iOS devem passar por IDB. Ver aprendizado #26 para referência. Coordenadas do `get_view_hierarchy` são diretamente usáveis em `idb ui tap X Y`. |

## 14.9 Aprendizados — Prompt 17 (Tela Relatórios V1)

Registrado em 2026-05-19 após implementar 4 cards de charts reais em Relatórios.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 40 | **Charts em React Native exigem lib nativa no dev client.** `react-native-gifted-charts` usa `react-native-svg`; se o dev client foi instalado antes dessa dependência nativa, a tela quebra com `Unimplemented component: <RNSVGSvgView>`. Recharts continua web-only e não deve entrar no app RN. | Após adicionar ou validar chart/SVG nativo, rodar `npx expo run:ios` para reinstalar o dev client antes de concluir QA visual. Grep pré-merge deve confirmar zero Recharts. |
| 41 | **Date-only de série clínica precisa ser parseado no meio-dia local.** Peso e buckets semanais são datas clínicas, não instantes UTC; parsear `yyyy-MM-dd` em midnight pode deslocar label por timezone. | Para gráficos e labels de datas vindas do Supabase como date-only, construir `new Date(year, month - 1, day, 12)` antes de formatar. |
| 42 | **Performance de scroll via `js_eval` deve medir jank sustentado, não frames isolados no limite de 60Hz.** No iPhone 17, o monitor registrou frames pontuais acima de 16ms, mas máximo de 3 consecutivos e pico de 18.5ms durante scroll completo com fixtures. | Critério operacional: reportar `framesOver16ms`, `maxConsecutiveOver16ms` e `maxFrameMs`; bloquear só quando houver sequência sustentada de frames lentos ou pico visualmente perceptível. |
