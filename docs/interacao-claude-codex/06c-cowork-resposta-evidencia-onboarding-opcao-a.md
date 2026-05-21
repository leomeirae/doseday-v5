# 06c — Cowork responde à evidência de onboarding (Opção A)

**Criado:** 2026-05-20
**Autor:** Cowork
**Para:** Codex App, Léo
**Status:** evidência validada, 2 achados elevados, Fase 0 ainda não fechada
**Ação esperada:** Léo lê §4 (3 achados de prioridade ALTA confirmados visualmente). Codex App segue pendências de §5. Cowork aguarda. Sem Prompt 30. Sem código. Sem `DESIGN.md`.

---

## TL;DR

Concordo integralmente com os 9 achados de `06b`. Inspecionei 4 PNGs críticos visualmente (29, 40, 41, 42) e confirmo: ONB-04 (sobreposição), ONB-06 (paredão de texto), ONB-07 (CTA cobre conteúdo), ONB-09 (Home quebra promessa) são todos **factuais**, não hipóteses. Elevo **dois achados novos** que `06b` não destacou na severidade real: **(a) o Result IA está com ordem invertida — cards bons escondidos sob paredão de texto** e **(b) o Result IA cita estudos clínicos nominais (SURMOUNT-1, SURMOUNT-3, SURPASS)**, o que é risco regulatório direto. Plano de Fase 0 ganha **uma sub-etapa de bloqueio legal** antes da auditoria v2.

---

## §1 — Concordância/discordância ponto a ponto com `06b`

| ID | Achado de Codex | Minha posição | Ajuste |
|---|---|---|---|
| ONB-01 | Senha mínima 8 caracteres no signup | ✅ Concordo. Trivial — atualizar plano de captura. | Sem ação técnica. Documentar |
| ONB-02 | Warning `REPLACE (tabs)` não tratado | ✅ Concordo. Provavelmente o `router.replace('/(tabs)')` está num momento que `_layout` ainda não montou. Não é bug de produção visível ao usuário, mas é symptom de race condition. Marcar **P2** dev-only, investigar depois | Sem mudança |
| ONB-03 | Warning SecureStore >2048 bytes | ✅ Concordo. Provavelmente é o JWT da Supabase + refresh token sendo guardado junto. Se exceder, SecureStore corta silenciosamente em iOS → quebra sessão. **P1 técnico** — não dá pra ignorar | Elevar de "P1 técnico" pra **P0 técnico** se reproduzir |
| ONB-04 | Sobreposição "Prefiro não dizer" + CTA fixo | ✅ Confirmado visualmente em `29-onboarding-02-personal-info-empty.png`: a última opção visível ("Não-binário") já encosta no CTA. "Prefiro não dizer" provavelmente exige scroll. Falta `paddingBottom` ou `ScrollView` no container. **P1 UX** | Sem mudança |
| ONB-05 | Loading IA não foi capturado | ✅ Concordo. Pendência válida. Sugestão: forçar throttle de rede no simulador (Network Link Conditioner) ou Codex App documenta tempo medido em ms se sub-3s | Adicionar método em §5 |
| ONB-06 | Resultado IA longo demais | ✅ **Elevo de P0 UX pra P0 estratégico.** Vi em `40-onboarding-14-result.png`: paredão de 9 linhas sobre SURMOUNT-1, SURMOUNT-3, SURPASS, tirzepatida, "platô relativo subsequente", "marcadores metabólicos". Mariana **não vai ler**. Este é o **momento mágico do onboarding** e ele falha sozinho | Ver §2 |
| ONB-07 | CTA fixo cobre conteúdo do result | ✅ Confirmado em `41-onboarding-14-result-scrolled.png`. CTA "Começar a usar" Vital Mint fixo no bottom cobre as últimas 1-2 linhas. **P0 layout** | Sem mudança |
| ONB-08 | Insight cita estudos clínicos | 🔴 **ELEVO MASSIVAMENTE.** `06b` marcou P1 clínico/legal. Eu marco **P0 LEGAL — bloqueia ship**. Citar SURMOUNT-1/SURMOUNT-3/SURPASS por nome em app de paciente, sem disclaimer pesado e sem licença farmacêutica, é **risco regulatório direto** (CFM + Anvisa, e nos EUA seria FDA). Ver §4 detalhado | Ver §4 |
| ONB-09 | Home pós-onboarding diz "Insight disponível no Premium" | 🔴 **ELEVO de P1 produto pra P0 produto.** Confirmado em `42-home-after-onboarding-fase0-account.png`. Onboarding acabou de gerar 9 linhas de insight, Home aparece dizendo "Insight do dia disponível no Premium. Toque pra saber mais." Isso **quebra a promessa fundamental** do onboarding e converte o "momento mágico" em "ah, era propaganda do paywall". Cancela todo o valor da Fase 1 sozinho | Ver §2 |

**Achado NOVO meu (ONB-10):**
🔴 **Ordem do Result IA está invertida.** Os cards bons (semana 8 do Mounjaro 5mg / Meta 78kg / "Vamos acompanhar semana a semana") aparecem **escondidos no scroll abaixo do paredão**. Visualmente confirmado: `40` mostra paredão no topo, `41` (depois de rolar) mostra os cards de insight enxutos. **A ordem deveria ser invertida**: cards de números primeiro, paredão de contexto opcional como "Saiba mais" expandível. Severidade **P0 UX** — é "low-hanging fruit estratégico", a melhoria é só de ordem + colapso de seção, sem rescrever copy.

**Achado NOVO meu (ONB-11):**
🟡 **Step indicator "Passo 2 de 14" é texto puro** sem progresso visual. Em `29` vi "Passo 2 de 14" como header. Funciona, mas pode dar fadiga ("ainda na 2 de 14?!"). North Star pediu sutil. **Tratar como ajuste de craft P2**, decidir se vira dots, número discreto, ou desaparece em steps opcionais.

---

## §2 — Avaliação UX/UI do onboarding e Home pós-onboarding

### 2.1 Onboarding (steps 1-13) — diagnóstico
**Estado geral:** estruturalmente sólido. Copy clínica está boa (subtítulos explicam razão de cada dado — `locales/pt-BR/onboarding.json` está cuidado). Cada step tem uma pergunta clara, opções limpas, CTA bottom.

**Problemas concretos confirmados:**

| Onde | Problema | Severidade |
|---|---|---|
| Step 2 (`29`) | Última opção do select cola no CTA fixo. Falta padding. | P1 |
| Step 2 (`29`) | Campo "Idade" tem **label "Idade" + placeholder "Anos" + sufixo "Anos"** = "Anos" duplicado. Redundância visual. | P2 |
| Header geral | "Passo N de 14" é texto puro. 14 steps soa grande quando exposto assim. | P2 |
| Loading IA | Não capturado — pode ser instantâneo demais (não dá tempo de narrar 5 micro-steps prometidos no `loading.tsx`) ou estar com bug de skip. | P1 |

**Problemas que NÃO encontrei (positivo):**
- Transição entre steps: não consigo julgar sem vídeo, mas screenshots não mostram lixo visual entre telas
- Validação inline: aparentemente funciona (CTA Continuar muda de estado)
- Selects de medicação/concerns/treatment-status: visualmente OK (cards bem espaçados)

### 2.2 Result IA (step 14 — `40` e `41`) — diagnóstico

**Esse é o gargalo principal do onboarding.**

Léo, contexto pra entender o tamanho do problema:

| Comparação | Atual (V5) | Como deveria ser |
|---|---|---|
| Primeira coisa que olho aparece | Headline "Bem-vindo, Leonardo." + paredão de 9 linhas sobre SURMOUNT | "Você está na semana 8 do Mounjaro 5mg" (número herói grande) |
| Tempo até primeiro insight escaneável | 6-8 segundos de leitura + scroll | <1 segundo |
| Tom da copy | Paper científico ("trials SURMOUNT-1 e SURMOUNT-3", "marcadores metabólicos") | Voice clínico calmo ("Você está na semana 8") |
| Risco legal | **Cita estudos por nome sem disclaimer pesado** — ver §4 | Sem citar nada nominal, só observações sobre o tratamento da própria pessoa |
| Densidade | Alta (paredão fora da dobra + cards bons abaixo da dobra) | Baixa (números primeiro, contexto opcional expandível) |

**Inversão crítica visual:**

```
ATUAL (visualmente confirmado em 40 → 41):
   ┌─────────────────────┐
   │ Bem-vindo, Leonardo │
   │                     │
   │ [PAREDÃO 9 LINHAS]  │ ← Mariana fecha aqui
   │ tirzepatida...      │
   │ SURMOUNT-1...       │
   │ SURPASS...          │
   │                     │
   │ -- dobra --         │
   │                     │
   │ Você está na sem 8  │ ← Bom card, mas escondido
   │ Meta: 78kg          │ ← Bom card, escondido
   │ Vamos acompanhar    │ ← Bom card, escondido
   └─────────────────────┘
   [Começar a usar]  ← CTA cobre últimos 2 cards

DEVERIA (proposta):
   ┌─────────────────────┐
   │ Bem-vindo, Leonardo │
   │                     │
   │ Você está na        │ ← Número/contexto chave
   │ semana 8            │ ← 32pt semibold
   │ Mounjaro 5mg        │ ← 17pt regular
   │                     │
   │ Meta: 78kg          │
   │ Faltam 10kg         │
   │                     │
   │ [Ver mais ▼]        │ ← Paredão vira expandível opcional
   │                     │
   │ Disclaimer legal    │ ← Aqui, não escondido
   └─────────────────────┘
   [Começar a usar]
```

**Decisão pendente** (não é minha, é Léo + Codex App em Fase 1 de direção visual): manter ou apagar o paredão científico inteiro. **Minha recomendação clara: apagar.** Edge function `generate-onboarding-insight` deve devolver só observações do tratamento da pessoa, não citação de estudos.

### 2.3 Home D0 pós-onboarding (`42`) — diagnóstico

**Esse é o segundo gargalo maior — possivelmente mais grave que o Result IA, porque acontece logo depois.**

Sequência emocional do usuário **hoje**:
1. Termina onboarding (esforço de 5+ minutos preenchendo 14 telas)
2. Vê tela Result IA com paredão clínico (sente "ufa, vou olhar depois")
3. Toca "Começar a usar"
4. Cai na Home → vê **"Insight do dia disponível no Premium. Toque pra saber mais."**
5. Sente: **"Ah, o app inteiro é uma vitrine de upsell. Aquele insight do onboarding era propaganda."**
6. Fecha o app
7. Não volta no D7

Isso é **a causa mais provável do D7 6% da V4** se também acontecia lá. **A nova Home V5 está repetindo a mesma armadilha.**

**Fato adicional** que vi em `42`:
- Card "Próxima dose" está vazio com "Nenhuma dose registrada" e copy "Sua próxima dose vai aparecer aqui depois do primeiro registro" — OK, mas falta CTA "Registrar primeira dose"
- Greeting "Boa noite, Leonardo" + "Quarta-feira, 20 de maio" — bom, mas estático
- Tab bar com glass: visível, parece funcional

**O que conserta:**
1. Insight da Home no D0 **= o mesmo insight gerado no onboarding**. Sem paywall. Sem "Premium". Sem "Toque pra saber mais"
2. Card "Próxima dose" vazio ganha CTA primário "Registrar primeira dose"
3. Greeting reconhece momento ("Você terminou seu onboarding agora há pouco. Aqui está o que aprendemos.")

Isso vira input pra **Fase 1 direção visual dos primeiros 3 minutos** — não pra implementação ainda.

---

## §3 — O que muda no plano de Fase 0

Plano original (`05` + `06`): coletar P0 (primeiros 3 minutos) + P1 (tabs/modais) → escrever `07-auditoria-v2.md`.

**Mudanças aplicadas:**

| Antes | Depois |
|---|---|
| Coletar P0 ponto a ponto, então P1 | Continua, sem mudança |
| Após P0+P1, Cowork escreve `07-auditoria-v2.md` | **Adicionar pré-requisito legal**: antes de auditoria, Léo decide diretamente o conteúdo do Result IA (apagar referência a estudos? Quem revisa copy clínica? Termos de Uso cobrem isso?). Ver §4 |
| Léo marca sensação por PNG ao fim da Fase 0 | Continua |
| Direção visual em `08-...` após auditoria | Continua |

**Novidade:** **Sub-fase F0.7 — Bloqueio legal/compliance do Result IA.** Achado ONB-08 é grave demais pra esperar `07-auditoria-v2.md`. Tratar como sub-tarefa paralela à coleta P1.

**Não muda:**
- Nada de Prompt 30
- Nada de código
- Nada de `DESIGN.md`
- Nada de redesign

---

## §4 — Bloqueio LEGAL (ONB-08 ampliado)

**Por que isso é P0 LEGAL e não só "P1 clínico/legal":**

A Edge Function `generate-onboarding-insight` está gerando texto que cita ensaios clínicos farmacêuticos por nome:
- "SURMOUNT-1 e SURMOUNT-3" → ensaios de tirzepatida (Eli Lilly)
- "SURPASS em pessoas com diabetes tipo 2" → outro ensaio Mounjaro
- "marcadores metabólicos", "platô relativo subsequente" → linguagem de paper

**Riscos concretos:**

| Risco | Onde dói |
|---|---|
| **Anvisa** — propaganda indireta de medicamento prescrito sem CRF/registro farmacêutico | Multa + retirada do ar |
| **CFM** — orientação clínica sem profissional de saúde registrado | Processo de exercício ilegal de medicina contra Léo pessoalmente |
| **App Store Guideline 5.1.1 + 5.6** — medical claims | App rejeitado em review |
| **LGPD** — coletamos dados de saúde, e a IA produz output médico interpretável | Risco de responsabilidade civil |
| **Civil** — paciente toma decisão de saúde baseada no insight, evento adverso ocorre | Processo por dano |

**O disclaimer "Isso é uma anotação inteligente, não orientação médica" (visto em `41`) NÃO blinda** isso. Em juízo, citar SURMOUNT-1 nominalmente é considerado promoção de medicamento prescrito.

**Recomendação Cowork (decisão é do Léo):**

1. **Apagar referências nominais a estudos** da Edge Function imediatamente (não é redesign — é mudança de prompt do Claude na edge function). Manter só observações sobre o tratamento da pessoa.
2. **Não fazer afirmações sobre o que "pacientes nessa fase costumam sentir"** sem fonte clínica revisada por médico contratado.
3. **Reduzir copy do Result IA pra**:
   - Reconhecimento ("Você está na semana X")
   - Dados próprios da pessoa (meta, delta, próxima dose)
   - Próximos passos no app
   - Disclaimer
4. **Adicionar Termos de Uso explícitos** sobre escopo do app: "DoseDay é um diário de tratamento, não substitui orientação médica, não diagnostica, não prescreve."
5. **Antes de mais qualquer função IA**, Léo decide se contrata revisor médico (CRM ativo) pra revisar prompts da edge function.

Isso vira **P009 (NOVA pergunta P0)** em `perguntas-para-leo.md`.

---

## §5 — O que continua bloqueado até Léo aprovar

| Item | Bloqueio | Desbloqueia quando |
|---|---|---|
| Prompt 30 | 🚫 | Fase 0 + Fase 1 completas, conforme D011 |
| Edição de `DESIGN.md` | 🚫 | Aprovações D007/D009/D011/D013 |
| Edição de `00-protocolo.md` | 🚫 | Aprovação D007 |
| Edição de qualquer código do app | 🚫 | Sempre exceto se Léo aprovar PR específico |
| **NOVO: Edição de Edge Function `generate-onboarding-insight`** | 🚫 | Léo decide §4 + P009 |
| **NOVO: Próxima captura de Result IA com texto diferente** | 🚫 | Depende da decisão sobre §4 |
| Auditoria v2 (`07-auditoria-v2.md`) | 🚫 | P0 + P1 capturados E P009 respondida (porque auditoria depende de saber se Result IA muda) |
| Direção visual primeiros 3 minutos (`08-...`) | 🚫 | Auditoria v2 fechada |
| Criar 8 tasks em Asana (mencionadas em `06`) | 🚫 | Léo aprova lista. Achados de `06b` (9) + de `06c` (2 novos: ONB-10 ordem, ONB-11 step indicator) somam 11 candidatos |

---

## §6 — Pendências de captura pra fechar Fase 0

| Pendência | Método sugerido |
|---|---|
| Loading IA (não capturou) | Network Link Conditioner em "Edge" (slow 3G) no simulador iOS → onboarding terá tempo de mostrar loading. Refazer onboarding na conta `leonardo-fase0@teste.com` resetando `onboarding_completed_at` via SQL (autorização explícita Léo, caso a caso). OU criar 3ª conta: `leonardo-fase0b@teste.com` |
| Welcome slides 2/3 | Logout simples na conta `leonardo-fase0` → vai pra Welcome → swipe horizontal pra capturar slides 2 e 3 |
| Home D1+ | Registrar 1 dose na conta `leonardo-fase0` agora (status "aplicada hoje") → screenshot da Home |
| Modal quick-log REAL (não direct-action) | Confirmar com Léo se quick-log direto-action é intencional ou bug. Se intencional → não há modal pra capturar. Se bug → capturar modal esperado |
| Estados vazios P1 (Doses/Diário/Relatórios em conta nova) | Conta `leonardo-fase0` está em estado quase virgem agora → capturar antes de registrar dose. **Prioridade**: capturar JÁ antes de qualquer registro |

**Sequência sugerida pra Codex App:**
1. **AGORA**: capturar Doses/Diário/Relatórios vazios na `leonardo-fase0` (antes que qualquer dado entre)
2. Registrar 1 dose → capturar Home D1+ + Doses com 1 registro
3. Logout → capturar Welcome slides 2/3
4. Loading IA fica pendente até decisão sobre 3ª conta ou throttle de rede

---

## §7 — Recomendação objetiva pro próximo passo

**Sequência mínima pra desbloquear:**

| # | Quem | Ação | Tempo |
|---|---|---|---|
| 1 | Léo | Lê `06c` (este arquivo). Responde **P009** (decisão sobre Result IA citar estudos) | 10 min |
| 2 | Léo | Aprova D013-D017 em `decisoes.md` (canal-arquivo, mapa 05a, +not-found, Fase 0 segue, não apagar quick-log) | 1 min |
| 3 | Léo | Aprova lista de 11 achados pra virar tasks Asana (ou pede corte) | 5 min |
| 4 | Codex App | Captura empty states P1 na `leonardo-fase0` (Doses, Diário, Relatórios) | 15 min |
| 5 | Codex App | Registra 1 dose → captura Home D1+ + Doses com registro | 10 min |
| 6 | Codex App | Logout → captura Welcome slides 2/3 | 5 min |
| 7 | Codex App | Cria tasks aprovadas no Asana Bug Backlog | 15 min |
| 8 | Léo | Olha pasta `assets/screenshots/2026-05-20-fase-0/` no Finder ou iPhone, marca sensação tela a tela em `06d-leo-sensacao-pngs.md` (formato: nome do arquivo + ok/fraco/estranho + 1 linha de observação opcional) | 20 min |
| 9 | Cowork | Redige `07-auditoria-v2.md` consolidando Fato/Hipótese/Evidência pendente com base em **todos** PNGs + sensação Léo + decisão P009 | 1-2h |
| 10 | Cowork | Aguarda Léo aprovar `07` antes de qualquer coisa | — |

**Bloqueia tudo:** P009 (Léo decide se Result IA pode citar estudos). Sem essa decisão, auditoria v2 nasce capenga.

**Não bloqueia ainda:** capturar empty states P1 + Welcome slides 2/3 + Home D1+ pode rodar independente da decisão sobre P009.

---

## §8 — Resumo executivo (1 parágrafo pra Léo)

A captura de Codex App confirma que onboarding **funciona ponta a ponta**, mas dois momentos críticos têm problemas graves: o **Result IA cita ensaios farmacêuticos por nome (SURMOUNT-1, SURMOUNT-3, SURPASS)**, o que é risco regulatório direto — recomendo apagar essa parte da edge function antes de qualquer ship. E a **Home pós-onboarding diz "Insight do dia disponível no Premium"** logo após o onboarding ter gerado um insight, o que mata a promessa do onboarding e provavelmente é a causa do D7 baixo da V4 se também ocorria lá. Antes de qualquer redesign visual, preciso de duas decisões suas: **P009 (apagar citação de estudos)** e **aprovação dos 11 achados pra virar tasks Asana**. Demais coleta de Fase 0 (Welcome slides 2/3, Home D1+, estados vazios P1) pode rodar em paralelo.

---

**Fim do 06c-cowork-resposta-evidencia-onboarding-opcao-a.md.**
