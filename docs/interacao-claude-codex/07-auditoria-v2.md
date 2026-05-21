# 07 — Auditoria Frontend V5 (v2 baseada em evidência)

**Criado:** 2026-05-20
**Autor:** Cowork (consolidação)
**Fontes:** `05a` (inventário), `05b` (evidência inicial), `06b` (onboarding pós-Opção A), `06c` (resposta de Cowork), `06d` (P009), `06e` (complemento pós-P009)
**PNGs em:** `assets/screenshots/2026-05-20-fase-0/` (41 arquivos atuais)
**Status:** v1 da v2 — pronta pra Léo marcar sensação e Codex App ratificar
**Bloqueia:** direção visual primeiros 3 minutos (`08-...`)
**Não bloqueia:** coleta paralela pendente de Loading IA + console persistido

---

## §0 — TL;DR (1 página)

Onboarding funciona ponta a ponta. Welcome, Home D0+D1, Result IA e Home pós-dose estão estruturalmente OK mas falham em entregar **continuidade de valor** e em alguns pontos **violam compliance**. Achados decisivos:

| ID | Severidade | Tema | Bloqueia ship? |
|---|---|---|---|
| ONB-08 | **P0 Legal** | Result IA cita SURMOUNT-1/SURMOUNT-3/SURPASS por nome | Sim |
| ONB-09 + F0-12 | **P0 Produto** | Home D0 e D1+ mostram "Insight disponível no Premium" depois do onboarding entregar insight | Sim |
| ONB-07 | **P0 Layout** | CTA "Começar a usar" fixo cobre conteúdo do Result | Sim |
| ONB-10 | **P0 UX** | Ordem invertida do Result: paredão denso aparece antes dos cards de números | Sim |
| BUG-i18n-Account | **P0 Confiança** | Tela Conta renderiza chaves `header.title`, `delete.label` etc cruas | Sim |
| ONB-06 | P0 UX | Result IA com paredão de 9 linhas científicas indigestos | Sim |
| ONB-03 | **P0/P1 técnico** | SecureStore >2048 bytes — risco silencioso de quebra de sessão | Confirmar console |
| ONB-04 | P1 UX | Sobreposição "Prefiro não dizer" + CTA no Onboarding step 2 | Não bloqueia |
| F0-13 | P1 Ativação | Doses vazia sem CTA primário pra primeiro registro | Não bloqueia |
| ONB-02 | P2 dev-only | Warning REPLACE (tabs) | Confirmar console |

**6 P0 bloqueiam ship.** Quatro deles (ONB-08, ONB-09/F0-12, ONB-07, BUG-i18n) são de copy/produto/i18n — não exigem redesign visual amplo, só correção cirúrgica. ONB-06 + ONB-10 exigem reformatação do Result IA. Sequência recomendada: corrigir compliance + continuidade ANTES de redesign de Home/Welcome.

**Próxima ação:** Léo abre pasta PNGs e marca sensação em `07b-leo-sensacao-pngs.md`.

---

## §1 — Welcome pré-auth (3 slides)

**Caminho:** `app/(welcome)/index.tsx` (295 LOC) • **PNGs:** `01`, `48`, `49`, `50`

### §1.1 Slide 1 (`48`)
| Coluna | Conteúdo |
|---|---|
| Fato | Headline "Sua memória do tratamento." + sub "Anote como cada semana foi indo. O DoseDay organiza tudo pra você lembrar do que importa." + ícone caneta colorido + dots indicador horizontal Vital Mint + link "Já tenho uma conta". **Sem CTA primário visível** |
| Hipótese | Carrossel obriga swipe → CTA único aparece só no slide 3. Mariana pode fechar antes de chegar lá |
| Evidência pendente | Tempo médio de saída do Welcome (sem analytics) |
| Severidade | **P1 First Impression** |
| Recomendação | Direção visual da Fase 1 decide se mantém carrossel ou colapsa em tela única com headline + 2 CTAs (North Star pediu uma frase, 2 CTAs). Slide 1 isolado já viola |

### §1.2 Slide 2 (`49`)
| Coluna | Conteúdo |
|---|---|
| Fato | "Pronto pra consulta." — promessa de valor prática |
| Hipótese | Mensagem mais forte que slide 1 — talvez deveria ser slide 1 |
| Evidência pendente | — |
| Severidade | P2 |
| Recomendação | Se manter carrossel: reordenar slides com a promessa mais concreta primeiro |

### §1.3 Slide 3 (`50`)
| Coluna | Conteúdo |
|---|---|
| Fato | "Vamos começar." + CTA "Criar conta" — único CTA primário do Welcome inteiro |
| Hipótese | Usuário só vê esse CTA depois de 2 swipes. Esforço mínimo de 3 toques pra começar |
| Severidade | P1 |
| Recomendação | Idem §1.1 |

### §1.4 Síntese Welcome
Welcome é **sóbrio mas não memorável**. Direção e tom estão alinhados com North Star (clinical, sem hype). Falta **necessidade emocional** clara e CTA primário acessível desde a entrada. Decisão estratégica em Fase 1: refatorar pra tela única ou manter carrossel com ordem reescrita.

---

## §2 — Onboarding (steps 1–13)

**Caminhos:** `app/(onboarding)/*.tsx` (14 arquivos) • **PNGs:** `28-39`

### §2.1 Step 1 — Intro (`28`)
| Coluna | Conteúdo |
|---|---|
| Fato | Tela de boas-vindas do fluxo de onboarding logado, antes do step 1 do questionário. Conteúdo: headline + body + CTA "Começar" |
| Severidade | OK |
| Recomendação | Manter |

### §2.2 Step 2 — Personal info (`29`)
| Coluna | Conteúdo |
|---|---|
| Fato | 3 campos: Nome / Idade / Sexo biológico. Headline "Como você se chama?" + sub clínico. Última opção "Não-binário" encosta visualmente no CTA "Continuar". Campo "Idade" tem **"Anos" duplicado** (label + placeholder + sufixo) |
| Hipótese | "Prefiro não dizer" exige scroll que não está óbvio |
| Severidade | **P1 UX** (sobreposição) + **P2 UX** (Anos duplicado) |
| Recomendação | Adicionar paddingBottom no ScrollView. Remover sufixo redundante "Anos" |

### §2.3 Steps 3–11 — Weight → Concerns (`30-38`)
| Coluna | Conteúdo |
|---|---|
| Fato | 9 steps lineares: Peso atual+inicial+altura / Meta peso / Status tratamento (4 opções) / Duração tratamento (4 opções) / Medicação (5 opções) / Dose (chips) / Nome médico (opcional) / Acompanhamento médico (3 opções) / Concerns (multi-select de 9 opções) |
| Hipótese | Copy clínica está boa (verificado em `locales/pt-BR/onboarding.json`). Transições não consigo julgar sem vídeo |
| Evidência pendente | Tempo médio de cada step, churn por step, comportamento de validação inline |
| Severidade | OK |
| Recomendação | Manter copy. Auditar craft de transição + microinteração nos selects em prompt futuro (Fase 3) |

### §2.4 Step 12 — Consent LGPD (`39`)
| Coluna | Conteúdo |
|---|---|
| Fato | Consentimento aceito no fluxo. Existem 2 toggles (Termos obrigatório / Dados anônimos opcional) |
| Hipótese | Copy do consent é fato sensível (LGPD) — exige revisão jurídica antes do ship |
| Severidade | P1 Legal |
| Recomendação | Revisão jurídica de copy + alinhamento com Termos de Uso (que ainda mostra "em breve") |

### §2.5 Step indicator (transversal)
| Coluna | Conteúdo |
|---|---|
| Fato | Header de cada step mostra "Passo N de 14" em texto puro |
| Hipótese | Expor "14 steps" pode parecer fadiga (referência: Oura 8, Calm 6) |
| Severidade | P2 craft |
| Recomendação | Decidir em Fase 1: dots sutis / número discreto / ocultar em opcionais |

### §2.6 Síntese Onboarding
Onboarding é o maior **acerto estrutural** da V5. Cada step tem razão clara, subtítulos explicam motivo do dado, copy é clínica e calma. Gap real está em 1 detalhe de layout (step 2 sobreposição) + 1 redundância (Anos duplo). Resto é craft de microinteração que entra em Fase 3, não bloqueia ship.

---

## §3 — Loading IA

**Caminho:** `app/(onboarding)/loading.tsx` (122 LOC) • **PNGs:** `40a` (tentativa, falhou)

| Coluna | Conteúdo |
|---|---|
| Fato observado | `06b` registra que tentativa de captura caiu rápido no Result, sem capturar steps narrados |
| Fato no codebase | `loading.tsx` tem 5 micro-steps documentados em `locales/*/onboarding.json` (stage / patterns / reminders / memory / insight) |
| Hipótese | (a) Edge function `generate-onboarding-insight` responde tão rápido que rotation entre os 5 steps não dá tempo de aparecer; (b) tem bug de skip; (c) há fallback que pula loading se a IA já retornou |
| Evidência pendente | **Capturar Loading com throttle de rede ativado** (Network Link Conditioner "Edge") OU criar 3ª conta `leonardo-fase0b@teste.com` e capturar em rede normal pra medir timing real |
| Severidade | **P1** — Loading IA é o momento que vende "isso aqui está pensando em mim". Se passar batido, perdemos esse momento |
| Recomendação | Esperar coleta pendente. Direção visual de Loading em Fase 1 pode prosseguir baseado no que sabemos do `loading.tsx` |

---

## §4 — Result IA (step 14)

**Caminho:** `app/(onboarding)/result.tsx` (104 LOC) • **PNGs:** `40` (topo), `41` (rolado)

### §4.1 Achado P0 LEGAL (ONB-08)
| Coluna | Conteúdo |
|---|---|
| Fato | `40` mostra paredão de 9 linhas com texto: "Na faixa de 8 semanas com tirzepatida... Nos trials SURMOUNT-1 e SURMOUNT-3, a tirzepatida mostrou reduções de peso progressivas ao longo dos meses... Em paralelo, estudos SURPASS em pessoas com diabetes tipo 2..." |
| Risco | Anvisa (propaganda indireta de medicamento prescrito), CFM (orientação clínica sem profissional registrado), App Store Guideline 5.1.1 + 5.6, LGPD, civil (paciente decide baseado no insight) |
| Decisão Léo | **P009 = A** (D015): remover citações nominais a estudos do output ao paciente |
| Severidade | **P0 LEGAL — BLOQUEIA SHIP** |
| Recomendação | Alterar prompt da Edge Function `generate-onboarding-insight` para gerar texto apenas sobre dados próprios da pessoa + organização do tratamento + próximo passo no app + disclaimer simples. Não menciona estudos, não faz claims terapêuticos |

### §4.2 Achado P0 LAYOUT (ONB-07)
| Coluna | Conteúdo |
|---|---|
| Fato | CTA "Começar a usar" Vital Mint fixo no bottom cobre 1-2 linhas finais do conteúdo (visível em `41`) |
| Severidade | **P0 Layout — BLOQUEIA SHIP** |
| Recomendação | Adicionar paddingBottom ao ScrollView do content = altura do CTA fixo + safe area |

### §4.3 Achado P0 UX (ONB-10)
| Coluna | Conteúdo |
|---|---|
| Fato | Ordem visual atual: headline + paredão científico no topo / cards de números enxutos (semana 8 Mounjaro 5mg / meta 78kg / "Vamos acompanhar semana a semana") abaixo da dobra |
| Hipótese | Mariana fecha no paredão e nunca chega nos cards bons |
| Severidade | **P0 UX — BLOQUEIA SHIP** |
| Recomendação | Inverter ordem: cards de números primeiro (Number-First Rule do North Star), paredão de contexto opcional como "Saiba mais" expandível. Direção visual exata em Fase 1 |

### §4.4 Achado P0 UX (ONB-06)
| Coluna | Conteúdo |
|---|---|
| Fato | Mesmo após resolver ONB-08 (sem estudos), texto continua denso. "consolidação inicial dos efeitos e adaptação do organismo" é jargão pra primeiro uso |
| Severidade | **P0 UX** |
| Recomendação | Result IA vira ativação curta, não relatório: 1 frase reconhecimento + 2-3 dados-chave + próximo passo + disclaimer. Detalhe em §13 |

### §4.5 Disclaimer (positivo a preservar)
| Coluna | Conteúdo |
|---|---|
| Fato | `41` mostra disclaimer "Isso é uma anotação inteligente, não orientação médica. Sempre fale com um profissional de saúde." no rodapé |
| Severidade | OK |
| Recomendação | **Preservar**. Trazer pra posição mais visível (topo ou meio do card, não escondido no scroll) |

---

## §5 — Home (D0 e D1+)

**Caminho:** `app/(tabs)/index.tsx` (52 LOC) • **PNGs:** `12`, `42` (D0), `47` (D1+)

### §5.1 Estrutura D0 (`42`)
| Coluna | Conteúdo |
|---|---|
| Fato | Greeting "Boa noite, Leonardo" + "Quarta-feira, 20 de maio" / Card "Próxima dose" com "Nenhuma dose registrada" + sub "Sua próxima dose vai aparecer aqui depois do primeiro registro" / Card "Insight do dia" com badge "Conteúdo educacional · Não substitui orientação médica" + texto "Insight do dia disponível no Premium. Toque pra saber mais." |
| Severidade | **P0 Produto (ONB-09)** |
| Recomendação | Ver §5.3 |

### §5.2 Estrutura D1+ (`47`)
| Coluna | Conteúdo |
|---|---|
| Fato | Greeting idêntico ao D0 / Card "Próxima dose" agora mostra Number-First excelente: "7" grande Vital Mint + "dias até sua próxima dose" + "Mounjaro · 5mg" + data "Quarta-feira, 27 de maio" / **Card "Insight do dia" continua idêntico**: "Insight do dia disponível no Premium" |
| Severidade | **P0 Produto (F0-12)** — reforça ONB-09 |
| Recomendação | Ver §5.3 |

### §5.3 Achado P0 PRODUTO (ONB-09 + F0-12) — quebra de promessa
| Coluna | Conteúdo |
|---|---|
| Fato | (a) Onboarding entrega insight personalizado no Result. (b) Home D0 não reaproveita esse insight — mostra paywall "Premium". (c) Home D1+ continua igual após registrar dose. **Quebra fundamental:** app promete memória, entrega upsell |
| Hipótese forte | **Causa principal do D7 6% se também ocorria na V4**. Mariana fecha o app pensando "ah, era propaganda do paywall" |
| Severidade | **P0 PRODUTO — BLOQUEIA SHIP** |
| Recomendação | (1) Home D0 mostra o **mesmo insight gerado no onboarding**, sem paywall. (2) Home D1+ atualiza insight com base no registro de dose (mesmo que com fallback estático calmo: "Sua primeira dose foi registrada. Vamos acompanhar.") . (3) Premium fica fora da primeira leitura emocional pós-onboarding. (4) Card "Próxima dose" vazio do D0 ganha CTA primário "Registrar primeira dose" |

### §5.4 Achado P1 Ativação (D0 → primeiro registro)
| Coluna | Conteúdo |
|---|---|
| Fato | Card "Próxima dose" vazio do D0 explica passivamente, mas não tem CTA pra registrar |
| Severidade | P1 Ativação |
| Recomendação | CTA "Registrar primeira dose" Vital Mint no próprio card. Toque leva ao modal Registrar dose |

### §5.5 Greeting estático
| Coluna | Conteúdo |
|---|---|
| Fato | "Boa noite, Leonardo" + data atual. Mesmo em D0 (acabou de fazer onboarding) e D1+ (já tem dose registrada) |
| Hipótese | Greeting poderia reconhecer momento ("Você terminou o onboarding agora há pouco" / "Sua primeira dose foi registrada hoje") |
| Severidade | P2 craft |
| Recomendação | Fase 1 ou Fase 2. Reconhecimento de momento é diferenciador de "memória clínica" |

---

## §6 — Tabs raiz (Doses, Diário, Relatórios, Perfil)

### §6.1 Doses (`14`, `46`, `43`)
| Coluna | Conteúdo |
|---|---|
| Fato com dados | `14` mostra "Próximas" + "Histórico" com cards de doses, headline "Doses" + ícone "+" |
| Fato pós 1 dose | `46` mostra próxima dose agendada (27 de maio) + histórico de dose aplicada (20 de maio) |
| Fato vazio | `43` explica empty state mas só tem ícone "+" no header como ação. **Sem CTA primário visível** pra registrar primeira |
| Severidade | **P1 Ativação (F0-13)** vazio / OK com dados |
| Recomendação | Empty state ganha CTA primário "Registrar primeira dose" no centro do card vazio |

### §6.2 Diário (`17`, `44`)
| Coluna | Conteúdo |
|---|---|
| Fato vazio | `44` não é vazio passivo: já oferece chips horizontais ("Náusea", "Dor de cabeça", "Cansaço") + opção de check-in |
| Comportamento sensível | Tocar chip "Náusea" registra evento **imediatamente** sem confirmação visível (visto em `26`) — quick-log direct-action |
| Severidade | **P1 UX (F0-15)** — decisão de produto |
| Recomendação | **Pergunta P010 ainda aberta pra Léo:** quick-log direto é intencional (zero fricção pra log rápido) ou bug (registro acidental)? Se intencional, precisa feedback visual de "registrado" (haptic + toast). Se bug, abrir modal |

### §6.3 Relatórios (`18`, `45`)
| Coluna | Conteúdo |
|---|---|
| Fato com dados | `18` mostra 4 cards (peso / aderência doses / sintomas / ring de aderência) + placeholder "Relatórios médicos em breve". Primeiro card de peso ocupa quase metade da tela |
| Fato vazio | `45` mostra estrutura correta: "Peso (Últimos 90 dias)" + "Doses aplicadas (Últimas 8 semanas) — 0" + CTAs internos ("Registre seu peso" / "Suas doses vão aparecer aqui") |
| Severidade | **P2 Craft (UX-relatorios-card-peso-alto)** com dados / **P1 Craft (F0-16)** vazio |
| Recomendação | Card de peso reduz altura quando há ≤3 pontos. Vazio precisa de prêmio de utilidade futura ("Em consultas, esses dados viram seu relatório clínico"). Ordem dos cards: peso primeiro (correto), mas reduzir altura |

### §6.4 Perfil (`19`)
| Coluna | Conteúdo |
|---|---|
| Fato | Menu de rows (PR #33 refatorado). Sub-telas Health profile + Sobre aparecem como "Em breve" |
| Severidade | **P1 Confiança (UX-account-em-breve)** |
| Recomendação | Decisão estratégica em Fase 4: preencher sub-telas placeholder OU remover do menu até existirem. "Em breve" em tela de Perfil baixa confiança clínica |

---

## §7 — Modais

### §7.1 Registrar dose (`20`)
| Coluna | Conteúdo |
|---|---|
| Fato | Modal cheio: dose + data + local + observações + CTA. 7 blocos antes do CTA |
| Console | Warning `GO_BACK was not handled by any navigator` ao fechar — pode ser dev-only |
| Severidade | **P1 UX (UX-modal-dose-pesado)** + **P2 técnico (ONB-06 da v1)** |
| Recomendação | Simplificar pra **3 blocos**: dose (default = dose atual do perfil) + data (default = hoje) + salvar. Detalhes (local, observações) opcional via "Adicionar detalhes". Meta: registrar em 10s |

### §7.2 Registrar peso (`21`)
| Coluna | Conteúdo |
|---|---|
| Fato | Modal simples: input numérico + data + notas |
| Severidade | OK |
| Recomendação | Manter |

### §7.3 Diário check-in (`25`)
| Coluna | Conteúdo |
|---|---|
| Fato | Modal completo com múltiplos chips horizontais — alguns chips excedem largura visível |
| Severidade | P2 UX |
| Recomendação | Wrap dos chips em múltiplas linhas ou scroll horizontal com hint visual |

### §7.4 Quick-log direto (`26`)
| Coluna | Conteúdo |
|---|---|
| Fato | Ao tocar chip "Náusea" no Diário tab, app registrou evento sem abrir modal. Tela aparente: nenhuma — direct action |
| Severidade | **P1 UX (F0-15)** — ver §6.2 |
| Recomendação | Decisão Léo pendente |

### §7.5 Prompt de notificações pós-dose (`46a`)
| Coluna | Conteúdo |
|---|---|
| Fato | Prompt iOS de permissão aparece **logo após** a primeira dose registrada |
| Hipótese | Timing pode estar bom (depois de entregar valor) ou ruim (interrupção) |
| Severidade | **P1 Produto (F0-14)** — decisão de produto |
| Recomendação | Avaliar A/B em pós-launch. Por ora, manter — pedir depois de 1ª dose tem precedente (entregou valor antes do pedido) |

---

## §8 — Sub-telas (Perfil)

### §8.1 Conta (`23`)
| Coluna | Conteúdo |
|---|---|
| Fato | Tela renderiza **chaves de i18n cruas**: `header.title`, `NAME.LABEL`, `email.readonlyHint`, `delete.label`, `delete.description`, `delete.button` |
| Diagnóstico | `locales/pt-BR/account.json` **tem todas as keys corretas** (verificado por mim). Bug está no carregamento do namespace `account` no bootstrap do i18next, OU `useTranslation('account')` não acha namespace e cai em fallback que renderiza key crua |
| Severidade | **P0 Confiança (BUG-i18n-Account) — BLOQUEIA SHIP** |
| Recomendação | Investigar `lib/i18n/` (bootstrap do i18next) e confirmar que `account.json` está registrado em `resources`. Provavelmente faltou import + add no init. Fix cirúrgico, deve ser <30 LOC |

### §8.2 Notificações (`24`)
| Coluna | Conteúdo |
|---|---|
| Fato | Tela estruturada: permissão + lembretes + horário + próximo lembrete + teste (disabled) |
| Severidade | OK |
| Recomendação | Manter. Botão de teste habilita quando há configuração válida |

### §8.3 Histórico de peso (`22`)
| Coluna | Conteúdo |
|---|---|
| Fato | Mostra registros + CTA "Registre seu peso" no bottom |
| Severidade | P2 craft (Number-First poderia estar mais forte) |
| Recomendação | Fase 3 polish |

---

## §9 — Componentes de fluxo (do inventário 05a)

**Total identificado:** 28 componentes em 9 grupos.

| Grupo | Componentes | Status auditoria |
|---|---|---|
| Home | GreetingHeader, NextDoseCard, InsightCard | NextDoseCard OK / InsightCard falha (P0) / GreetingHeader estático (P2) |
| Doses | DoseCard, StatusBadge | OK estrutural / DoseCard pode ter variação por status (P2) |
| Diário | CheckinCard, CheckinInsightView, DiarioTimelineItem, EmotionalStatePicker, QuickLogChips, SymptomsMultiSelect, TriggersMultiSelect | QuickLogChips central na decisão F0-15 |
| Onboarding | OnboardingShell, SelectionCard, NumericInput, ConcernsChips, ConsentCheckbox, LoadingStepIndicator, PulseAnimation, WeightDeltaDisplay, InsightCard | Bem estruturado |
| Perfil | SettingsRow, SettingsSection | OK |
| Peso | WeightHistoryRow, WeightStatsCard | OK |
| Relatórios | WeightChartCard, DoseAdherenceCard, SymptomDistributionCard, AdherenceRingCard, ChartEmptyState | WeightChartCard altura excessiva (P2) |
| UI compartilhada | AuthButton, AuthHeader, AuthLink, InsightDisclaimer, SectionHeader, TabBarBackground, TabBarButton, TextField, toastConfig | InsightDisclaimer é o componente que entrega o disclaimer LGPD — preservar |
| Notificações | PermissionDeniedBanner, PermissionRequestModal | OK |
| Welcome | WelcomePageIndicator, WelcomeSlide | Direção de Fase 1 decide se mantém |

---

## §10 — Bugs técnicos transversais

| ID | Severidade | Bug | Reprodução |
|---|---|---|---|
| BUG-i18n-Account | **P0 Confiança** | Chaves cruas em Conta | 100% — visível em qualquer render da tela |
| ONB-03 SecureStore | **P0/P1 técnico (provisional)** | Warning "valor maior que 2048 bytes" — pode cortar silenciosamente, quebrando sessão Supabase | Aguarda console persistido |
| ONB-02 REPLACE (tabs) | **P2 dev-only (provisional)** | Warning "REPLACE não tratado por nenhum navigator" — race condition em `_layout` | Aguarda console persistido |
| ONB-06 GO_BACK em modal dose | P2 dev-only | Warning ao fechar — pode ser visual no console apenas | Aguarda console persistido |

---

## §11 — Evidência pendente

| Item | Por que pendente | Método pra resolver |
|---|---|---|
| Loading IA real (5 micro-steps narrados) | Edge function respondeu rápido demais OU bug de skip | (a) Network Link Conditioner "Edge" no simulador + criar 3ª conta `leonardo-fase0b@teste.com`; (b) ou Codex App mede timing real em ms e decide se é race |
| Console/log persistido | Warnings observados mas não capturados como artefato | Codex App roda Metro com `--log-level verbose` + redireciona `console.log/warn/error` pra arquivo `assets/screenshots/2026-05-20-fase-0/console-NN.log` |
| Sensação Léo por PNG | Gating de PO | Léo abre pasta, marca ok/fraco/estranho por arquivo em `07b-leo-sensacao-pngs.md` |

**Importante:** essa seção não bloqueia próximos passos. Direção visual da Fase 1 pode prosseguir sem Loading IA capturado, pois `loading.tsx` no codebase + intenção declarada (5 steps) bastam pra direção. Quando evidência fechar, atualizamos linhas específicas (§3 + §10).

---

## §12 — Síntese por prioridade

### §12.1 Bloqueiam ship — 6 P0 (correção cirúrgica, não redesign amplo)

| # | Área | Tipo | Esforço |
|---|---|---|---|
| 1 | ONB-08 — Result IA cita estudos | Edge function | 1 prompt + revisão |
| 2 | ONB-09 + F0-12 — Home Premium quebra promessa | Frontend (`index.tsx` + `InsightCard`) | 1 prompt MID |
| 3 | BUG-i18n-Account — chaves cruas | i18n bootstrap | 1 prompt LOW |
| 4 | ONB-07 — CTA Result cobre conteúdo | Layout `result.tsx` | trivial |
| 5 | ONB-10 — Ordem invertida Result | Layout `result.tsx` | 1 prompt MID |
| 6 | ONB-06 — Result denso | Copy + reformatação | combinado com #5 |

**Padrão:** todos os 6 podem ser resolvidos sem redesign visual amplo. Maioria é correção cirúrgica em arquivos específicos.

### §12.2 Sub-bloqueio técnico (aguarda console)

| # | Área | Decisão |
|---|---|---|
| 7 | ONB-03 SecureStore | Se reproduzir → P0 técnico; se dev-only → P2 |

### §12.3 Não bloqueia ship mas degrada confiança

| # | Área | Tipo |
|---|---|---|
| 8 | F0-13 Doses vazia sem CTA primário | Ativação |
| 9 | ONB-04 Sobreposição step 2 | Layout |
| 10 | F0-15 Quick-log direto | Decisão Léo P010 |
| 11 | UX-account-em-breve | Confiança |
| 12 | Greeting estático Home | Craft |

### §12.4 Polish — Fase 3+

- Anos duplicado no step 2
- Step indicator (dots vs número)
- Card peso altura excessiva
- Modal dose pesado
- Chips de check-in excedem largura
- Welcome slides 1/2 sem CTA

---

## §13 — Direção que emerge desta auditoria

**Esta seção não é decisão, é matéria-prima pra Fase 1 (`08-direcao-visual-primeiros-3-minutos.md`).**

A auditoria revela que **a V5 não precisa de redesign visual amplo no curto prazo**. Precisa de **correção cirúrgica de 6 P0** e **direção visual focada em 3 momentos**:

| Momento | Direção emergente |
|---|---|
| Welcome → entrada | Necessidade emocional + CTA acessível desde a entrada (carrossel ou tela única) |
| Result IA → ativação | Curto + Number-First + sem citar estudos + cards de números primeiro + paredão opcional expandível |
| Home D0 + D1+ → continuidade | Insight do onboarding aparece direto. Premium fora da primeira leitura. CTA "Registrar primeira dose" no D0 vazio |

Tabs secundárias (Doses, Diário, Relatórios, Perfil) **funcionam** estruturalmente. Polish entra em Fase 3+. Não bloqueia.

---

## §14 — Próximas ações

### Léo
1. Abre pasta `assets/screenshots/2026-05-20-fase-0/` no Finder ou simulador
2. Marca sensação por área em `07b-leo-sensacao-pngs.md` (formato: nome do PNG + ok/fraco/estranho + 1 linha opcional)
3. Responde **P010** (quick-log direto: intencional ou bug?) — última pergunta aberta de Fase 0
4. Aprova auditoria v2 → desbloqueia Codex App + Cowork iniciarem `08-direcao-visual-primeiros-3-minutos.md`

### Codex App
1. Tenta fechar Loading IA + console persistido em paralelo
2. Quando fechar, edita §3 + §10 + §11 desta auditoria com info real (edição cirúrgica)
3. Pode propor mudanças no §13 antes de Fase 1 começar

### Cowork
1. Aguarda sensação Léo + aprovação
2. Não escreve `08` antes da aprovação
3. Atualiza esta auditoria se Codex fechar pendências

---

**Fim do 07-auditoria-v2.md.**
