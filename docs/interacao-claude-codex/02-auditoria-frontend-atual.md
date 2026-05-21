# 02 — Auditoria de Frontend Atual (V5)

**Criado:** 20 de maio de 2026
**Autor v1:** Cowork
**Status:** v1 — base pra Codex App validar diretamente no codebase. Léo valida no simulador / iPhone.
**Critérios:** PRODUCT.md + DESIGN.md + `01-frontend-north-star.md` (esta pasta) + Apple HIG (modo dark)

---

## 0. Como ler essa auditoria

Cada tela tem três colunas:

- **Funciona?** — o usuário consegue completar o fluxo principal
- **Craft** — qualidade visual + microcopy + microinteração contra o North Star
- **Confiança clínica** — sensação de "isso aqui é sério, posso confiar"

Score por critério: ✅ pronto / 🟡 funciona mas precisa subir / 🔴 está abaixo do padrão V5

E **gap concreto** (o que falta), **risco** (o que acontece se não mexer), **recomendação** (próxima ação).

Esse documento é a **fonte-de-verdade** pra decidir quais telas entram em `03-plano-redesign-frontend.md`. Sem ele, redesign vira opinionismo solto.

---

## 1. Mapa de telas existentes (out 20/maio/2026)

**Total: 25 telas** distribuídas em 6 grupos de rota.

| Grupo | Tela | Caminho | LOC |
|---|---|---|---|
| `(welcome)` | Welcome pré-auth | `app/(welcome)/index.tsx` | 295 |
| `(auth)` | Sign in | `app/(auth)/signin.tsx` | — |
| `(auth)` | Sign up | `app/(auth)/signup.tsx` | — |
| `(auth)` | Recover password | `app/(auth)/recover.tsx` | — |
| `(onboarding)` | Welcome IA | `app/(onboarding)/welcome.tsx` | 33 |
| `(onboarding)` | Personal info | `app/(onboarding)/personal-info.tsx` | — |
| `(onboarding)` | Weight | `app/(onboarding)/weight.tsx` | — |
| `(onboarding)` | Goal weight | `app/(onboarding)/goal-weight.tsx` | — |
| `(onboarding)` | Treatment status | `app/(onboarding)/treatment-status.tsx` | — |
| `(onboarding)` | Treatment duration | `app/(onboarding)/treatment-duration.tsx` | — |
| `(onboarding)` | Medication | `app/(onboarding)/medication.tsx` | — |
| `(onboarding)` | Dose | `app/(onboarding)/dose.tsx` | — |
| `(onboarding)` | Doctor name | `app/(onboarding)/doctor-name.tsx` | — |
| `(onboarding)` | Medical support | `app/(onboarding)/medical-support.tsx` | — |
| `(onboarding)` | Concerns | `app/(onboarding)/concerns.tsx` | — |
| `(onboarding)` | Consent (LGPD) | `app/(onboarding)/consent.tsx` | — |
| `(onboarding)` | Loading IA | `app/(onboarding)/loading.tsx` | 122 |
| `(onboarding)` | Result | `app/(onboarding)/result.tsx` | 104 |
| `(tabs)` | **Início** | `app/(tabs)/index.tsx` | 52 |
| `(tabs)` | **Doses** | `app/(tabs)/doses.tsx` | 179 |
| `(tabs)` | **Diário** | `app/(tabs)/diario.tsx` | 177 |
| `(tabs)` | **Relatórios** | `app/(tabs)/relatorios.tsx` | 140 |
| `(tabs)` | **Perfil** | `app/(tabs)/perfil.tsx` | 126 |
| Modal | Registrar dose | `app/dose/registrar.tsx` | — |
| Modal | Registrar peso | `app/peso/registrar.tsx` | 312 |
| Sub-tela | Histórico de peso | `app/peso/historico.tsx` | 204 |
| Sub-tela | Account | `app/perfil/account.tsx` | 290 |
| Sub-tela | Notificações | `app/perfil/notificacoes.tsx` | 363 |
| Sub-tela | Diário check-in | `app/diario/checkin.tsx` | — |
| Sub-tela | Diário quick-log | `app/diario/quick-log.tsx` | — |

**Observação:** a tab bar tem 5 tabs (Início, Doses, Diário, Relatórios, Perfil) — **não** existe tab "Peso". Peso é sub-tela acessada via modal/push.

---

## 2. Auditoria — Telas críticas (top 10 que mais impactam desejo de uso)

### 2.1 🟡 Welcome pré-auth (`(welcome)/index.tsx`)

| Critério | Score | Nota |
|---|---|---|
| Funciona | ✅ | AuthGuard 4-way redireciona |
| Craft | 🟡 | Liquid Glass aplicado (PR #34) mas precisa validação visual no iPhone |
| Confiança clínica | 🟡 | Copy não validada contra North Star |

**Gap:** 295 LOC sugere acúmulo de elementos. North Star pede **uma frase só** + dois CTAs limpos. Suspeita: ainda há props decorativos, headline + subheadline + microcopy + CTA + CTA secundário + footer = denso demais.

**Risco:** primeira impressão acima do limiar de processamento. Mariana abre, sente "padrão de app saturado", esquece.

**Recomendação:** prompt de redesign craft com `/impeccable distill` + meta de **<150 LOC**, hierarquia "headline 32pt / sub 15pt / CTA primário Vital Mint / CTA secundário ghost".

---

### 2.2 🔴 Home / Início (`(tabs)/index.tsx`, 52 LOC)

| Critério | Score | Nota |
|---|---|---|
| Funciona | ✅ | Mostra GreetingHeader + NextDoseCard + InsightCard |
| Craft | 🔴 | 3 cards empilhados sem hero claro |
| Confiança clínica | 🔴 | Sem reconhecimento de "fase do tratamento" |

**Gap detalhado:**
- Não há **momento principal** — qual é o card que rouba a cena? Hoje empilha greeting + dose + insight em peso igual
- Greeting "Olá, [nome]" é genérico — não reconhece dia da dose, sintoma recente, peso registrado
- InsightCard parece placeholder estático (precisa confirmar com `@app/(tabs)/index.tsx` + componentes)
- NextDoseCard mostra dose mas não mostra **stage do tratamento** (Mariana está na semana 3 de Mounjaro 5mg — onde isso vive?)
- Nenhum atalho contextual: não tem "Como você está se sentindo hoje?" ou "Registrar peso agora"
- Sem haptic em nada, sem entrada animada

**Risco:** **principal causa potencial de D7 baixo na V5.** Mariana abre, vê "tudo igual", fecha. Sem motivo pra voltar amanhã.

**Recomendação:** **maior prioridade de redesign.** Prompt MID/HIGH dedicado. Hero card único + zona de insight + atalhos discretos. Inspiração: card hero do Apple Health, mas com Voice & Tone clínico.

---

### 2.3 🟡 Onboarding step `personal-info` → `concerns` (10 telas)

| Critério | Score | Nota |
|---|---|---|
| Funciona | ✅ | Fluxo end-to-end testado (PR #28-#31) |
| Craft | 🟡 | Copy clínica está boa (locales/onboarding.json). Visual provavelmente padrão |
| Confiança clínica | ✅ | Subtítulos explicam motivo de cada pergunta |

**Gap suspeito (precisa validação no simulador):**
- Step indicator presente mas possivelmente como barra de progresso clássica — North Star pede sutil
- Entrada/saída de cada step provavelmente sem transição (corte seco)
- Selects podem estar com toque seco (sem haptic, sem animação de seleção)
- Botão "Continuar" provavelmente sticky bottom — validar safe area + estado disabled visualmente claro
- Inputs podem estar próximos demais entre si (densidade vs respiro)
- 14 steps é muito — discutir consolidação (ver pergunta 1 em `01-frontend-north-star.md`)

**Risco:** churn entre step 3 e step 8 (zona de fadiga). Especialmente se transições sem craft.

**Recomendação:** auditoria visual no simulador + ajustes de craft em batch (1 prompt MID). Não redesenhar — elevar.

---

### 2.4 🟡 Onboarding `loading.tsx` + `result.tsx`

| Critério | Score | Nota |
|---|---|---|
| Funciona | ✅ | Edge Function `generate-onboarding-insight` rodando |
| Craft | 🟡 | Loading narra 5 steps (✅) — checar transição entre eles |
| Confiança clínica | 🟡 | Result mostra insight real (✅) — checar tipografia e disclaimer |

**Gap suspeito:**
- Loading: cada step troca em rotation de N segundos. Se a Edge Function devolve antes/depois, o usuário pode pular steps ou ficar travado. Validar timing real
- Result: 104 LOC, headline + insight + disclaimer + CTA. Precisa garantir que insight é **o herói visual** — não competir com "Bem-vindo, Mariana"
- Result → Home: transição imediata? Há momento de "guardando..."? Avaliar entrada calma na Home com insight já populado

**Risco:** se transição result → home é seca, perde-se o "momento mágico" da continuidade. Mariana entra na home e pensa "ah, voltei pro genérico".

**Recomendação:** validação visual + ajuste fino de timing. Se Edge Function responde rápido (<3s), considerar mínimo de 4-5s pra narrar todos os steps com calma.

---

### 2.5 🟡 Doses tab (`(tabs)/doses.tsx`, 179 LOC)

| Critério | Score | Nota |
|---|---|---|
| Funciona | ✅ | Próximas + Histórico + CTA "+" no header |
| Craft | 🟡 | Lista cronológica com `DoseCard`. Header com headline + ícone "+" |
| Confiança clínica | 🟡 | "Sua próxima dose vai aparecer aqui depois do primeiro registro" — empty state OK |

**Gap:**
- Empty state secundário "Sem doses registradas ainda" sem CTA
- `formatMedicationName` formata nome — checar visual: "Mounjaro" deveria ser hierarquicamente diferente de "5mg" (Number-First Rule sugere número herói)
- DoseCard provavelmente uniforme entre status `scheduled / taken / missed` — falta de visual diferenciado por estado
- PermissionDeniedBanner aparece no topo se push negado — confirmar copy não acusatória

**Risco:** Doses vira "lista de tarefas" em vez de "memória clínica". Mariana percebe como obrigação.

**Recomendação:** redesign de `DoseCard` + empty states. Médio impacto. Pode entrar depois do redesign de Home.

---

### 2.6 🟡 Diário tab (`(tabs)/diario.tsx`, 177 LOC)

| Critério | Score | Nota |
|---|---|---|
| Funciona | precisa validar | — |
| Craft | precisa validar | — |
| Confiança clínica | precisa validar | — |

**Gap:** auditoria visual pendente. Diário é central pra "memória clínica" — provável gap de craft.

**Recomendação:** prompt de auditoria visual com `react-native-devtools-mcp` + critique com `/impeccable critique`.

---

### 2.7 🟡 Relatórios tab (`(tabs)/relatorios.tsx`, 140 LOC)

| Critério | Score | Nota |
|---|---|---|
| Funciona | ✅ | WeightChart + DoseAdherence + SymptomDistribution + AdherenceRing |
| Craft | 🟡 | 4 cards + 1 placeholder "Relatórios médicos em breve" |
| Confiança clínica | 🟡 | Subtitle "Sua memória do tratamento organizada para a consulta" — alinhado com North Star |

**Gap:**
- 4 cards em sequência podem virar parede densa de gráficos — falta hierarquia
- Placeholder "Relatórios médicos em breve" é honesto mas precisa craft (ícone + tipografia)
- Gráficos com `react-native-gifted-charts` (Prompt 17) — checar se respeitam paleta Clinical Midnight e Vital Mint raro

**Risco:** parece dashboard de fitness em vez de página clínica.

**Recomendação:** auditoria visual + decisão sobre ordem dos cards (peso primeiro? aderência?). Médio impacto.

---

### 2.8 🟡 Perfil tab (`(tabs)/perfil.tsx`, 126 LOC) + sub-telas

| Critério | Score | Nota |
|---|---|---|
| Funciona | ✅ | Menu de rows (PR #33) |
| Craft | 🟡 | Refactorado mas placeholders ainda existem (Health Data, Medical References, Idioma, Tema) |
| Confiança clínica | 🟡 | Falta header com nome do usuário (Asana task 1214980083887119) |

**Gap:**
- Sub-telas Health Data, Medical References, Idioma, Tema são placeholders "Em breve" (Asana 1214980101424205)
- Account (290 LOC) — checar craft de delete account (LGPD)
- Notificações (363 LOC) — provavelmente bem populado, checar hierarquia de seções (permissão / dose / IA / horário)
- settings.json com keys legadas V4 (Asana 1214980253833532) — copy obsoleto

**Risco:** perfil vira "menu de configuração de app de utility" em vez de "settings clínico Apple-grade".

**Recomendação:** primeiro polish de craft (header com nome, ordem de rows, ícones consistentes). Depois preencher sub-telas placeholder uma a uma.

---

### 2.9 🟡 Peso modal (`peso/registrar.tsx`, 312 LOC) + histórico (`peso/historico.tsx`, 204 LOC)

| Critério | Score | Nota |
|---|---|---|
| Funciona | ✅ | CRUD com UNIQUE constraint (PR #32) |
| Craft | 🟡 | 312 LOC modal sugere muitos elementos — validar visual |
| Confiança clínica | 🟡 | Delta de peso talvez sem destaque |

**Gap:**
- 312 LOC pra modal de registrar peso é muito — provável input + validação + delta + histórico inline + share btn
- Number-First Rule no histórico: peso atual deveria ser hero, gráfico secundário
- Sparkline vs gráfico cheio (pergunta 4 em North Star)

**Risco:** modal pesado confunde uso rápido (registrar peso = 10 segundos, não 30).

**Recomendação:** simplificar modal pra **apenas input numérico grande + data + salvar**. Detalhes (delta, histórico) vão pra tela dedicada de Peso.

---

### 2.10 🟡 Dose modal (`dose/registrar.tsx`)

| Critério | Score | Nota |
|---|---|---|
| Funciona | precisa validar | — |
| Craft | precisa validar | — |
| Confiança clínica | precisa validar | — |

**Gap:** auditoria visual pendente. Modal central pra fluxo principal do app (Mariana aplica dose, registra).

**Recomendação:** prompt de auditoria + ajuste de copy ("Aplicada agora" / "Adiar 1 hora" / "Pular esta dose").

---

## 3. Auditoria — Telas auxiliares (rápida)

| Tela | Status atual | Prioridade redesign |
|---|---|---|
| Sign in / Sign up / Recover | Funcional, craft padrão Expo — provavelmente OK por enquanto | **Baixa** — auditar depois |
| Onboarding `welcome.tsx` (33 LOC) | Hello pré-onboarding logado, muito enxuto | **Baixa** — provavelmente já bom |
| Onboarding `consent.tsx` (LGPD) | Funcional, copy revisada | **Baixa** — auditar copy contra anti-dark-pattern |
| Diário `checkin.tsx` | Sub-tela de check-in diário | **Média** — central pra "memória diária" |
| Diário `quick-log.tsx` | Quick log de sintoma | **Média** — fluxo rápido, precisa fricção mínima |
| Perfil → Notificações | 363 LOC, bem populada | **Média** — hierarquia de seções |
| Perfil → Account | 290 LOC com delete LGPD | **Baixa** — funcional, polish menor |

---

## 4. Padrões transversais identificados

### 4.1 Componentes compartilhados (provável bem)

- `SectionHeader` — usado em Doses, talvez em Relatórios. Verificar consistência tipográfica
- `DoseCard` — usado em Doses tab. Precisa variação visual por status
- `PermissionDeniedBanner` — banner amarelo/vermelho. Verificar copy não-acusatória
- `TabBarBackground` + `TabBarButton` — Liquid Glass aplicado (boa)
- `GreetingHeader`, `NextDoseCard`, `InsightCard` — usados na Home. Possível over-fragmentação

### 4.2 Padrões a auditar especificamente

- **Hierarquia tipográfica entre headlines de tab**: "Doses" headline 28pt? "Relatórios" idem? Consistência crítica
- **Bottom CTA pattern**: onboarding usa sticky bottom. Outras telas usam header-action ("+"). Precisamos decidir padrão único
- **Empty states**: alguns têm CTA ("Adicione sua primeira dose"), outros são frase solta ("Sem registros") — padronizar
- **Loading states**: ActivityIndicator inline vs skeleton — padronizar
- **Error states**: alguns têm Tentar novamente, outros não — padronizar
- **Modal vs full screen vs push**: Peso e Dose são modais. Diário check-in é? Padronizar quando cada um se aplica

### 4.3 Anti-padrões do North Star ainda presentes (suspeitos)

| Anti-padrão | Onde checar |
|---|---|
| Greeting genérico sem reconhecimento de fase | Home |
| Empty state sem CTA | Doses (histórico vazio) |
| Ícone colorido competindo com texto | Relatórios (placeholder ícone azul) |
| Modal pesado pra ação rápida | Peso registrar (312 LOC) |
| Mais de 1 Vital Mint por tela | Validar caso a caso |
| Hierarquia plana sem hero | Home |

---

## 5. Validação no iPhone real — checklist do Léo

Quando Léo for testar no iPhone 13+ (iOS 26+ Liquid Glass funcional):

**Welcome pré-auth**
- [ ] Glass renderiza com profundidade real
- [ ] CTA primário tem peso visual claro
- [ ] Tempo de carregamento < 1s

**Onboarding**
- [ ] Cada step entra/sai com transição suave
- [ ] Botão Continuar fica disabled visível quando inválido
- [ ] Keyboard não cobre input ativo
- [ ] Step indicator não chama mais atenção que o conteúdo

**Home**
- [ ] Em 1 segundo, o olho sabe onde olhar primeiro
- [ ] Nada parece "vazio" mesmo no D0
- [ ] Insight personalizado aparece e faz sentido

**Doses**
- [ ] DoseCard pra "next" tem visual diferenciado de "history"
- [ ] CTA "+" no header tem haptic
- [ ] Empty state convida ação

**Relatórios**
- [ ] Gráficos respeitam paleta (Vital Mint apenas em destaques)
- [ ] Ordem dos cards faz sentido (peso primeiro)
- [ ] Placeholder "em breve" parece honesto, não placeholder de protótipo

**Perfil**
- [ ] Header tem nome do usuário
- [ ] Rows têm ícones consistentes em tom e tamanho
- [ ] Delete account exige confirmação explícita

---

## 6. O que essa auditoria NÃO cobre

- Performance (FPS de scroll, jank de animação)
- Acessibilidade detalhada (auditoria com VoiceOver)
- Internacionalização visual (en/es podem quebrar layouts pt-BR)
- iPad / tablet
- Light mode
- Edge cases de dados ausentes (perfil sem nome, dose sem dosagem, etc)

Esses entram em prompts de `/impeccable audit` + `/impeccable harden` na fase pre-ship.

---

## 7. Síntese — top 5 ações por impacto

| Ordem | Ação | Impacto em desejo de uso | Esforço |
|---|---|---|---|
| 1 | Redesign Home (hero + insight contextual + atalhos) | 🔥🔥🔥🔥🔥 | Alto |
| 2 | Auditoria visual + ajustes de craft no onboarding (14 steps) | 🔥🔥🔥🔥 | Médio |
| 3 | Welcome pré-auth: distill pra uma frase + 2 CTAs | 🔥🔥🔥 | Baixo |
| 4 | Simplificar modal de registrar peso (312 → ~150 LOC) | 🔥🔥🔥 | Médio |
| 5 | Padronizar empty states, loading states, error states | 🔥🔥 | Médio |

---

**Fim do 02-auditoria-frontend-atual.md.**

**Próximo passo:** Codex App lê, valida no codebase as suspeitas marcadas "precisa validar", aprova ou rebate. Em paralelo, Cowork escreve `03-plano-redesign-frontend.md` baseado nessa auditoria.
