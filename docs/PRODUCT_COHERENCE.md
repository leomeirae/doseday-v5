# DoseDay V5 — Mapa de Coerencia e Norte de Produto

**Data:** 2026-05-22
**Status:** documento de direcao. Nao e prompt de execucao.
**Fontes:** testes manuais do Leo, mapa de coerencia `doseday-mapa-coerencia_1.html`, auditoria Codex App, auditoria Claude Cowork, `docs/PRODUCT.md`, `docs/DESIGN.md` e codigo local.

Este documento existe para impedir que o DoseDay volte a ser apenas um tracker de dose, peso e sintomas. Ele deve orientar os proximos prompts do Claude Code, do Claude Cowork e do Codex App.

---

## 1. Tese central

DoseDay e a memoria inteligente do tratamento entre consultas.

O problema atual nao e falta de telas. O problema e **captura cega**: o app coleta dados em varios lugares e depois se comporta como se nao soubesse nada. Cada tela pergunta do zero, cada insight usa uma fonte diferente, e varios dados capturados no onboarding nao mudam o comportamento do app.

Um app de memoria nao deve apenas coletar. Ele deve lembrar, conectar e devolver.

**Regra de produto:** toda pergunta feita ao usuario precisa alterar pelo menos uma destas coisas:

| Destino | Exemplo |
|---|---|
| Home | estado atual, proxima melhor acao, insight contextual |
| Lembretes | frequencia, horario, preocupacao, proxima dose |
| Diario | memoria cronologica do que aconteceu |
| Relatorios | sintese para consulta |
| IA | contexto usado para gerar resposta segura e util |

Se a resposta nao muda nada, a pergunta e friccao.

---

## 2. Diagnostico fechado

| Achado | Veredito | Implicacao |
|---|---|---|
| Onboarding insight funciona melhor que o resto do app | Confirmado | O produto certo aparece no fim do onboarding, mas nao se sustenta no dia a dia. |
| Check-in atual e formulario pesado | Confirmado | Emoji/estado + sintomas + gatilhos + notas exige motivacao proativa justamente quando o usuario pode estar mal. |
| Check-in nao envia sintomas/gatilhos/notas para a IA | Confirmado no cliente | `callGenerateCheckinInsight` recebe contexto geral e humor, mas nao recebe o que acabou de ser marcado. |
| Edge Functions de IA estao em estados diferentes de maturidade | Confirmado localmente | Onboarding esta hardenizado; `generate-insights` existe mas esta desalinhado; `generate-checkin-insight` e `memory-daily-insight` sao chamadas pelo app, mas nao estao versionadas em `supabase/functions/`. |
| SURPASS/SURMOUNT em insight e P0 legal se aparecer para usuario | Confirmado como risco | A causa pode ser seed legado no banco, nao geracao ao vivo. Ainda assim, qualquer output visivel com ensaio de marca e bloqueante. |
| Home cai em frase fixa quando caminhos dinamicos falham | Confirmado | A frase "Vamos acompanhar seu tratamento dia a dia." e fallback, mas na experiencia do usuario parece IA morta. |
| Proxima dose depende de default de 7 dias | Confirmado no codigo e docs locais; pendente no banco real | O app nao pergunta frequencia/protocolo. Sem isso, Mounjaro pode parecer ok, Saxenda fica factualmente errado. |
| Aderencia percentual sem protocolo e enganosa | Confirmado | "100% aderencia" com 1 dose nao tem base suficiente sem frequencia prescrita/informada. |
| Altura no onboarding esta orfa | Confirmado | Coletada e persistida, sem uso relevante. Decisao: remover. |
| Placeholder do peso "Como voce esta se sentindo?" existe | Confirmado | Esta em `locales/pt-BR/weight.json` como `addModal.notesPlaceholder`. Decisao: remover/trocar. |
| Idade e sexo biologico estao orfaos no fluxo atual | Confirmado em runtime visivel | Podem ter valor futuro, mas hoje a copy promete precisao clinica que nao aparece. |
| `main_concerns` e uma das melhores perguntas e esta orfa | Confirmado | Nausea, consulta, dose timing etc. deveriam modular captura, lembrete, relatorio e insight. |
| Sintomas nao aparecem em Relatorios | Nao confirmado como arquitetura | O codigo agrega `quick_logs` e `daily_checkins`. Se falhou em teste, investigar cache/refetch ou dado especifico. |

---

## 3. Status das Edge Functions de IA

Nem toda IA do app esta no mesmo estado. Proximos prompts devem nomear a funcao alvo, em vez de falar genericamente "a IA". A tabela abaixo cruza o que esta deployado em producao (via Supabase MCP, 2026-05-22 read-only) com o que existe versionado em `supabase/functions/`.

| Edge Function | Versao deploy | verify_jwt | Source local? | Status |
|---|---|---|---|---|
| `generate-onboarding-insight` | v9 | ✓ | ✅ | Hardenizada no PR #50. Referencia de contrato, fallback, blacklist e `schemaVersion`. |
| `generate-insights` | **v28** (era v27) | ✓ | ✅ | **Frente 2 DEPLOYADA 2026-05-23 19:55Z via MCP.** Contencao deterministica sem OpenAI (`generate_insights_containment_v1`) substituiu v27 com tom coach/motivacional/celebratorio. Reescrita real alinhada a §6 continua pendente. |
| `generate-checkin-insight` | **v5** (era v4) | **✓ (era ✗ no gateway)** | ✅ em `supabase/functions/generate-checkin-insight/` + snapshot em `docs/handoff/edge-functions-snapshot-2026-05-22/` | **Frente 2 DEPLOYADA 2026-05-23 19:54Z via MCP. P0 compliance vivo FECHADO.** Contencao `checkin_insight_containment_v1` sem OpenAI substituiu v4 que exigia citar trials. **`verify_jwt` agora true** (era false) — alinha ADR 0003. Caller client-side da PR #64 ainda nao mergeado. |
| `memory-daily-insight` | **v5** (era v4) | ✓ | ✅ em `supabase/functions/memory-daily-insight/` + snapshot recuperado | **Frente 2 DEPLOYADA 2026-05-23 19:54Z via MCP.** Contencao `memory_daily_containment_v1` sem OpenAI substituiu v4 com prompt `[PLACEHOLDER]`. |
| `memory-summary` | **v3** (era v2) | ✓ | ✅ em `supabase/functions/memory-summary/` + snapshot recuperado | **Frente 2 DEPLOYADA 2026-05-23 19:53Z via MCP.** Contencao `memory_summary_containment_v1` sem OpenAI substituiu v2 com prompt `[PLACEHOLDER]`. Caller continua desconhecido. |
| `generate-report` | **v49** (era v48) | ✓ | ✅ | **Frente 2 DEPLOYADA 2026-05-23 19:56Z via MCP.** Contencao `generate_report_containment_v1` sem OpenAI substituiu v48 (91 relatorios ja gerados, nao auditados). Auditoria do source antigo + reescrita real continuam pendentes. |
| `delete-user-account` | v4 | ✓ | ✅ | Fora do escopo deste documento. |
| `get-revenuecat-metrics` | v2 | ✓ | ✅ | Fora do escopo deste documento. |
| `revenuecat-webhook` | v3 | ✗ (webhook) | ✅ | OK — webhook publico esperado. |
| `send-rich-notification` | v3 | ✗ | ✅ | Fora do escopo deste documento. |
| `trigger-weekly-reports` | v13 | ✗ | ✅ | Fora do escopo deste documento. |

**Conflitos atuais (multiplos):**

1. `generate-insights/index.ts` foi convertido localmente para contencao sem OpenAI na Frente 1 (2026-05-23). O conflito antigo de tom coach/motivacional fica resolvido no source local, mas **producao ainda depende de deploy explicito**.
2. `generate-checkin-insight` v4 em producao tem **system prompt que EXIGE citar trials por nome** (REGRA DE OURO 6) + `validateNumericClaims()` que **REJEITA** outputs com numeros nao-acompanhados de nome de trial. **Nao e gap de blacklist — e tese de produto antiga ("credibilidade clinica = citar trial").** A Frente 1 versionou contencao sem OpenAI e neutralizou o caller client-side; deploy ainda e passo separado.
3. `generate-checkin-insight` v4 esta com `verify_jwt=false` no gateway, mas com auth manual em codigo retorna 401 sem Bearer. **Nao e endpoint publico real**, mas e config nao-padrao que merece padronizacao (alinhar ao ADR 0003).
4. As 3 Edge Functions antes sem source versionado (`generate-checkin-insight`, `memory-daily-insight`, `memory-summary`) agora tem source local de contencao em `supabase/functions/`. **Ainda nao houve deploy.**
5. **`memory-daily-insight` e `memory-summary` rodam com `[PLACEHOLDER — sera preenchido pelo PO]` literal em prod ate deploy da contencao.** No source local da Frente 1 nao chamam OpenAI.
6. `memory-summary` esta ativa sem caller identificado no client local — risco de funcao orfa cobrando OpenAI sem entregar valor ou, pior, sendo chamada por agente externo nao mapeado.

---

## 4. Correcoes de precisao importantes

Nem tudo no mapa original estava com a causa certa. A direcao continua valida, mas o conserto muda.

### 4.1 SURPASS no check-in

O mapa apontou corretamente o risco: output com nome de ensaio de marca nao pode aparecer.

**Atualizacao 2026-05-22 (auditoria Supabase read-only + `get_edge_function`):** A hipotese inicial de "seed legado pre-hardening" + "EF sem source com guardrail esquecido" estava errada por dois motivos. Os fatos confirmados sao:

- A Edge Function `generate-checkin-insight` v4 **EXISTE em producao** e esta ATIVA. Source recuperado em `docs/handoff/edge-functions-snapshot-2026-05-22/` (NAO promovido).
- O `verify_jwt=false` no gateway nao significa endpoint publico real: o codigo faz auth manual via `supabase.auth.getUser()` e retorna 401 sem Bearer. **Config nao-padrao, mas nao e exposicao publica.** Reclassificado de P0 security para P1 config.
- **Nao e falha esquecida de hardening — e design intencional documentado.** O system prompt da v4 contem literalmente: *"REGRA DE OURO 6: Sempre referencie trials clinicos pelo nome (SURMOUNT, STEP, SURPASS, etc.)"*. A funcao `validateNumericClaims()` **REJEITA** outputs com numeros nao-acompanhados de nome de trial: `if (!numericNearTrial) return 'Numeric claim without trial attribution'`. **A blacklist foi propositalmente vazia desses termos** — a tese era "credibilidade clinica = citar trial".
- O caller `callGenerateCheckinInsight` NAO cai em catch silencioso — recebe insight valido e renderiza no `CheckinInsightView`.
- A geracao e AO VIVO: foram encontradas 2 rows em `educational_insights` com `trigger_source='first_checkin'` criadas em **2026-05-22 14:40 e 16:45** com `SURPASS` no body.
- Existem ainda 3 rows `trigger_source='onboarding'` mais antigas (2026-04-24, 2026-05-20 x2) com `SURMOUNT` — essas sim sao pre-hardening do `generate-onboarding-insight` (PR #50 deploy foi 2026-05-22 manha).

Total na auditoria: **5 rows com termos proibidos**.

**Implicacao:** ha tres frentes distintas, nao uma so:

1. **Tese de produto:** o conserto da geracao viva nao e tecnico — e estrategico. Antes de hardenizar, decidir se manter a tese "citar trials" ou pivotar (ver §6, decisao fechada em 2026-05-22).
2. **Geracao viva:** `generate-checkin-insight` v4 continuara produzindo SURPASS enquanto a tese atual estiver ativa. Conter via desativacao de caller (rapido, reversivel) ou redeploy com prompt reescrito (gated por decisao de produto + `security-review`).
3. **Limpeza de dados:** as 5 rows existentes precisam de plano separado de cleanup com criterio, backup e aprovacao explicita (ja gated por P0a-cleanup na §12). Nao iniciar antes da torneira fechada.

**Regra:** antes de qualquer release pre-Fase 2, **decidir tese de produto** (§6), conter geracao viva e depois executar cleanup de dados. Todas as 3 frentes exigem `security-review` previo onde envolverem codigo ou dados.

### 4.2 Proxima dose

Nao e exatamente `+7` hardcoded no componente da Home. O cliente calcula:

`ultima aplicação + days_until_next_dose`.

O problema e que o registro de dose nao envia `days_until_next_dose`, entao o banco usa o default. **Confirmado em 2026-05-22 via Supabase read-only**: a coluna `medication_applications.days_until_next_dose` esta declarada como `integer NOT NULL DEFAULT 7`. Como o usuario nunca informa frequencia, o sistema cria certeza falsa de "7 dias" para qualquer medicamento, mesmo Saxenda (diario).

**Regra:** nenhuma tela pode mostrar proxima dose, lembrete ou aderencia como fato sem uma frequencia/protocolo informado ou explicitamente assumido com possibilidade de ajuste.

**Copy enquanto nao houver frequencia confirmada (proxima dose):**

| Nao usar | Usar |
|---|---|
| "Proxima dose em 7 dias" | "Proxima dose: a definir" |
| Contagem regressiva ou data especifica | "Defina seu protocolo para ver sua proxima dose" |
| Card com numero grande de dias | CTA neutro convidando a configurar frequencia |

Nunca exibir contagem regressiva, data especifica ou alerta de "atraso" baseado em default de 7 dias. A regra para aderencia vive em §10.

### 4.3 Peso e sentimento

O Cowork nao confirmou a frase no modal de peso por busca textual, mas ela existe como locale:

`locales/pt-BR/weight.json -> addModal.notesPlaceholder = "Como voce esta se sentindo?"`

**Decisao:** remover esse enquadramento do input de peso. Peso registra peso. Se houver notas, o placeholder deve ser neutro, por exemplo "Observacao sobre este registro".

---

## 5. Regras de produto a partir de agora

### 5.1 Simples no uso, robusto na entrega

O usuario nao deve sentir que esta alimentando um sistema. Ele deve sentir que esta anotando o minimo necessario e recebendo memoria organizada.

**Bom:** "Nausea hoje?" com 1 toque, porque o onboarding ja disse que nausea preocupa.
**Ruim:** abrir um formulario vazio de quatro partes todo dia.

### 5.2 Captura contextual vence formulario generico

Check-in diario nao deve ser o centro do produto se depende do usuario abrir o app quando esta mal.

Captura deve acontecer por gatilhos:

| Gatilho | Captura esperada |
|---|---|
| Apos a aplicacao, em momento natural (NAO imediatamente, NAO em janela fixa) | "Desde a ultima aplicacao, sentiu algo que vale lembrar?" (formulacao aberta, sem timing presumido) |
| Preocupacao marcada | pergunta contextual sobre aquela preocupacao |
| Antes da consulta | "Quer revisar o que mudou desde a ultima dose?" |
| Registro rapido | 1 toque para sintoma recorrente |

**Regras:**
- NAO perguntar sobre efeitos imediatamente apos registrar dose. Friciona o registro principal.
- NAO presumir janela de pico de efeito (24h, 48h, 72h). Cada organismo funciona de forma diferente — pode aparecer em qualquer momento ou nunca aparecer.
- NAO escrever "nas ultimas 24h" ou "nas primeiras 48h" em copy de pergunta — isso e suposicao disfarcada de fato.
- Usar formulacao aberta: "Desde a ultima aplicacao..." (sem timing). A janela "quando o app oferece a pergunta" passa a ser definida por **proximidade da proxima dose** ou **proximidade da consulta**, nao por presumida janela biologica de pico.

O app ja tem parte da infraestrutura para captura leve: `quick_logs`, `QuickLogChips` e `useRegisterQuickLog`. Portanto, a direcao nao e construir tudo do zero, e sim evoluir essa base para uma captura contextual que use dados do onboarding.

### 5.3 Diario e memoria, nao obrigacao

O Diario deve mostrar a memoria cronologica do tratamento. Ele pode permitir registro, mas nao deve depender de um formulario completo como habito principal.

### 5.4 Relatorios interpretam, nao coletam

Relatorios nao devem ser a tela onde o usuario descobre que precisa inserir peso ou sintomas. Relatorios devem explicar o que os dados significam e preparar a consulta.

### 5.5 Home e o painel operacional

Home precisa responder:

1. Onde estou no tratamento?
2. O que preciso registrar agora?
3. O que o DoseDay ja percebeu?
4. O que devo levar para a consulta?

### 5.7 App de memoria, nao de inferencia (decidida 2026-05-22 19:00)

**Principio operacional do produto:** DoseDay e um aplicativo de memoria. **Ele NAO inventa memoria e NAO presume** protocolo, preco, estoque, proxima dose, adesao ou efeito. Trabalha com dados informados pelo usuario e devolve isso de forma clara.

**O app NUNCA assume:**
- frequencia de dose
- preco de medicamento
- que o medicamento esta acabando
- que houve efeito colateral
- **janela biologica de pico/inicio/duracao de efeito colateral** (24h, 48h, 72h, "primeira semana"). Cada organismo funciona de forma diferente — pode aparecer em qualquer momento ou nunca aparecer
- **relacao causal entre dose e sintoma**. O app NAO diz "essa nausea foi por causa da dose de ontem". Pode mostrar o registro do usuario e proximidade temporal, mas nao atribuir causa
- que a proxima dose e em 7 dias (corolario: derruba DEFAULT 7 do schema como verdade)
- "aderencia" em qualquer forma sem protocolo confirmado

**Regra geral:** tudo que aparece como **fato** na tela precisa ter vindo de **input explicito do usuario** OU de **calculo transparente baseado nesse input**. Quando o dado nao foi informado, mostrar estado neutro/cold-start ("a definir", "configure", "ainda sem historico"), nunca chute disfarcado de certeza.

Esta regra vale para UI, IA, copy, relatorio e lembretes.

### 5.6 IA precisa ser uma camada unica

Nao pode haver uma IA para onboarding, outra para check-in e outra para Home com contratos, tons e guardrails diferentes.

**Regra:** toda IA que toca PHI precisa ter:

| Exigencia | Motivo |
|---|---|
| fonte versionada no repo | rastreabilidade |
| contrato tipado/Zod | previsibilidade |
| `schemaVersion` | compatibilidade |
| fallback seguro | evitar quebra de UX |
| blacklist de ensaios/marcas | compliance |
| disclaimer fixo | seguranca |
| logs sem PHI | privacidade |
| `security-review` antes de deploy | regra do projeto |

---

## 6. Decisoes fechadas

Estas decisoes nao precisam de novo debate antes de virar prompt.

| Decisao | Direcao |
|---|---|
| Remover altura do onboarding | Sim. Nao vamos entrar em IMC agora. |
| Remover "Como voce esta se sentindo?" do peso | Sim. Trocar por nota neutra ou remover notas se nao houver uso claro. |
| Nao mostrar aderencia percentual sem protocolo | Sim. Ate existir frequencia, mostrar "doses registradas" ou "regularidade em formacao". |
| Nao aceitar output com SURPASS/SURMOUNT/ensaios | Sim. P0 legal/compliance. |
| Nao redesenhar Diario antes de decidir modelo de captura | Sim. O problema e de modelo, nao de layout. |
| **Tese de credibilidade clinica (decidida 2026-05-22)** | **Abandonar a tese antiga "credibilidade clinica = citar trials por nome".** Pivotar para **"traducao clinica em linguagem do paciente"** com disclaimer fixo e sem nomes de estudos. Aplica-se a TODA superficie voltada ao paciente. Camada profissional (relatorio medico, se vier) pode ter linguagem tecnica, mas mesmo ali evitar nome de trial salvo com revisao juridica. Implica reescrita do system prompt de `generate-checkin-insight` v4 (REGRA DE OURO 6 e `validateNumericClaims`) antes de qualquer redeploy. |
| **Nomenclatura do topo da tela unica (decidida 2026-05-22 17:25)** | **Topo da tela unica e "memoria personalizada do tratamento". A IA e o veiculo, NAO o produto.** Em docs de produto, evitar "leitura de IA" ou "IA topo" — usar "memoria personalizada". Em docs tecnicos pode aparecer como "memoria alimentada por IA" ou "AI-backed memory surface", mas nao como promessa publica. Motivo: GTM identifica IA como commodity (Glapp ja faz gratis); o moat e a combinacao de medicamentos BR + custo declarado + protocolo + medico + preocupacoes + memoria entre consultas + relatorio. Chamar o topo de "IA" empurra o time a otimizar pela IA — energia tem que ir para enriquecer o input local que alimenta a IA. **Bloqueio:** apenas ajuste de linguagem nos docs de direcao. Nao executar mudanca de front-end agora. |
| **Headline publica do GTM (decidida 2026-05-22 17:35)** | **Nova headline aprovada:** *"DoseDay organiza dose, peso, efeitos e gasto do seu Ozempic, Mounjaro, Poviztra ou similar — e transforma isso em memoria pronta pra proxima consulta."* Substitui a versao anterior que prometia "te diz o que fazer na semana". Motivo: a promessa "o que fazer" pode ser interpretada como conduta clinica, viola §11.1 + ANVISA, gera frustracao no usuario e risco de review/store. Nova promessa centra no relatorio pra consulta (vetor viral + canal medico = moat). Bloqueio: apenas linguagem dos docs GTM/direcao; nao executar redesign de landing/store agora. Atualizar `DoseDay-GTM-Brasil.pdf` quando ele for re-renderizado. |
| **DoseDay e app de ciclo, nao app diario (decidida 2026-05-22 17:50)** | **Formulacao oficial:** *"A tela unica e uma memoria do ciclo de tratamento. O topo muda conforme o momento da dose, registros recentes, peso e proximidade da consulta. O app nao cobra check-in diario."* Motivo: o ICP toma medicamento semanal (Mounjaro/Ozempic/Wegovy dominam o mercado BR); comportamento natural e abrir 3-5x/semana, nao diariamente. Forcar check-in diario foi causa de falha do app V4. Implicacoes: (1) trocar "check-in diario" por "check-in contextual"; (2) trocar "memoria diaria" por "memoria do ciclo"; (3) topo nao precisa parecer novo a cada abertura, precisa parecer correto para aquele momento do ciclo; (4) check-in inline so aparece apos dose / em janela provavel de efeito / quando preocupacao relevante / quando falta dado antes da consulta; (5) em dias estaveis a tela nao forca pergunta — mostra proxima dose, ultimo registro, peso/progresso, algo a levar pra consulta. **Medicamentos diarios (Saxenda, Poviztra, Extensior, Lirux, Olire):** se um dia forem suportados de fato, viram modo/protocolo diferente, NAO premissa do MVP. |
| **Tagline interna de produto (decidida 2026-05-22 17:50)** | *"Um toque quando importa. O DoseDay organiza o resto."* Substitui qualquer formulacao "1 toque por dia". Aplica-se a UX interna + copy de paywall + descricao do app. Nao usar "diario" como reforco de habito. |
| **Check-in: contextual, nao diario (decidida 2026-05-22 17:50)** | Movido de §7 (decisoes abertas) para §6 (decisoes fechadas). Check-in **so aparece quando faz sentido pelo ciclo** (apos dose / janela de efeito / preocupacao marcada / pre-consulta). Em dias estaveis o app nao pergunta. Estrutura: 1 toque se positivo; 1 pergunta contextual se negativo. |
| **Home insight: muda por momento do ciclo, nao diario (decidida 2026-05-22 17:50)** | Movido de §7 para §6. Topo da tela unica varia o conteudo conforme momento do ciclo (D0 da dose / D+1-3 janela de efeito / D+4-6 estabilidade / D-0 proxima dose / pre-consulta), NAO toda abertura. Cadencia da "memoria personalizada" e por evento (registro de dose, registro de peso, marco de semana, consulta agendada), nao por dia. |
| **Custo: campo livre opcional, fora do modal de dose (decidida 2026-05-22 18:00)** | **Custo NAO entra no modal de registro de dose** — momento errado de coletar (usuario gerencia canetas/ampolas, nao dose individual). **Custo e secao opcional inline na propria tela unica** (nao em modal sobreposto). **Campo aberto, sem categorias rigidas, sem botoes:** usuario digita brevemente o que e + valor. Exemplos: "Caixa de Mounjaro — R$X", "Consulta — R$X", "Analgesico — R$X", "Remedio nausea — R$X". Salva texto livre + numero. **Calculo e matematica simples (soma), sem IA.** **NAO vai para o relatorio do medico** — o medico nao tem interesse no valor pago. E memoria/organizacao pessoal do usuario. Implica: (a) revisar GTM que coloca "controle de custo" como gate de Pro; pode continuar como feature paga, mas sem promessa de relatorio de custo pro medico; (b) headline ja aprovada cita "gasto" — continua valida porque o usuario VE seu proprio gasto, so nao exporta pro medico. |
| **Relatorio: tela primaria, PDF opcional, em linguagem do paciente (decidida 2026-05-22 18:15)** | **O relatorio serve primariamente ao USUARIO** (memoria do tratamento). Medico e leitor secundario quando o paciente decidir compartilhar. **Sem jargao clinico, sem dados medicos, sem literatura cientifica.** Funciona como ferramenta de conversa na consulta ("Doutor, esse app gerou esse relatorio do meu uso") OU como envio via WhatsApp quando o usuario nao puder ir a consulta. **Formato:** **relatorio aparece na propria tela do app** (leitura nativa, sem sair do app — Leo nao quer acoes externas como default). Tem **2 acoes secundarias ao lado**: (1) "Compartilhar" (WhatsApp/outros, share sheet do iOS) e (2) "Salvar PDF" (gera PDF que o usuario salva no celular). **PDF NAO e fallback** — e opcao paralela ao share. Implicacoes: (a) `generate-report` EF continua valida, mas precisa estar alinhada a §6 (linguagem do paciente, sem trial) — auditar antes de qualquer release; (b) o canal medico do GTM continua funcionando — paciente abre a tela do app na consulta; PDF e vetor viral opcional, nao caminho unico. |
| **Efeitos colaterais: memoria contextual, nao produto principal (decidida 2026-05-22 18:30)** | **Efeitos sao dado importante para a memoria do tratamento, mas NAO sao o produto.** O produto NAO e "fazer check-in de sintomas" — e ajudar o usuario a entender o tratamento, lembrar doses, acompanhar peso, organizar efeitos relevantes e chegar melhor na consulta. **Formulacao oficial:** *"Efeitos entram como memoria contextual do ciclo da dose. O app pede pouco, no momento certo, e devolve valor claro: padrao, consulta e historico."* **Como captura:** 1 pergunta inline (nao modal), 1-2 chips no maximo, derivados de `main_concerns` do onboarding + momento do ciclo, sempre com opcao "Nao senti isso" ou "Esta tudo ok". Se bem, termina em 1 toque. Se mal, aprofunda so o minimo. **Exemplo:** D+1 da dose, usuario marcou "nausea" no onboarding → "Algum enjoo depois da dose?" [Nao] [Leve] [Forte]. **NAO sao:** "Como foi seu dia?" + emoji + sintomas + gatilhos + observacoes. **Posicao no produto:** efeitos NAO viram "Acao 4 — registrar efeitos" na tela unica; ficam embutidos no check-in contextual inline alimentando `symptom_logs`. **Regra de copy:** toda pergunta sobre efeito deve explicar o beneficio ("isso entra na memoria da sua proxima consulta", "ajuda a mostrar se isso se repete depois da dose", "fica registrado junto da dose desta semana"). |
| **Fonte canonica de sintomas: `symptom_logs` (decidida 2026-05-22 18:30)** | **Tres tabelas existiam concorrentes** (`symptom_logs`, `daily_checkins.symptoms`, `quick_logs`). **Decisao:** `symptom_logs` e a fonte canonica de efeitos clinicos (estruturada com `symptom_type`, `intensity`, `symptom_date`, `days_since_dose`, `checkin_id`). **Direcao:** (a) `symptom_logs` = fonte canonica de efeitos; (b) `daily_checkins` = estado/contexto do momento, NAO base de sintomas; (c) `quick_logs` = atalho de captura — mas se for sintoma relevante deve alimentar `symptom_logs` ou ser migrado para esse modelo; (d) `daily_checkins.symptoms` vira **legado a deprecar**, nao base futura. Implicacao: prompt da IA de `generate-checkin-insight` (quando reescrito por P0-novo-A) le `symptom_logs`. Relatorio (`generate-report`) le `symptom_logs`. Bloqueio: nao alterar schema ainda — primeiro decidir migracao de `daily_checkins.symptoms` em plano separado. |
| **Regra de Foco operacional — Opcao C (decidida 2026-05-22 18:45)** | **Freeze visual continua. Fase 2 visual ainda NAO comecou.** Durante o grill da tela unica, so estao permitidos: (1) documentacao de direcao, (2) auditorias read-only, (3) contencao P0/P1 de IA/compliance/PHI, (4) planejamento read-only do modelo de dados. **Bloqueado:** planejamento visual da tela unica, implementacao, prototipos code-light, qualquer front-end novo ou atual. **Loading polish + Home quick actions:** descartar trabalho pendente/nao-mergeado — vira retrabalho. O que ja foi mergeado em main fica como esta (nao reverter) ate a tela unica substituir a experiencia. **Detalhes operacionais:** ver Task #64 v3. **Proximas acoes possiveis, aguardando autorizacao item-a-item:** (a) contencao P0-novo-A; (b) investigacao read-only do modelo de dados; (c) investigacao read-only do caller de `memory-summary`. |
| **Camada 3 — atualizacao operacional (decidida 2026-05-25 13:43)** | A Camada 3 da Regra de Foco #64 (originalmente "freeze visual total" durante o grill da tela unica) passa de freeze a **freeze do front-end legado + implementacao ativa autorizada**. **Permitido em planejamento + execucao:** (1) Home v7 clean (rota `/home-v7`, `components/home/HomeV7Content.tsx` e hooks/queries adjacentes, incluindo `Observacoes` e `Para a consulta`); (2) Configuracoes expandida conforme `docs/SETTINGS_DESIGN_DIRECTION.md`; (3) Edge Functions paciente-facing em reescrita gradual apos o pivot registrado no §6. **Continua bloqueado:** (a) Loading polish descartado; (b) novas features na Home antiga `app/(tabs)/index.tsx`, exceto rollback; (c) redesign visual fora de Home v7 e Configuracoes; (d) tab bar inferior ate conclusao do hub de Configuracoes; (e) IA paciente-facing real ate decisao explicita. Esta entrada substitui somente o escopo operacional vigente, sem apagar ou revogar a decisao historica de 2026-05-22 18:45. |
| **Frequencia/protocolo de dose: input do usuario, no onboarding, editavel (decidida 2026-05-22 19:00)** | **Frequencia e input do usuario, NAO inferencia silenciosa.** Capturar no onboarding logo apos medicamento/dose, com sugestao apresentada como sugestao editavel (nunca como fato oculto). App so age com base em frequencia **confirmada pelo usuario**. **Formulacao publica:** *"Qual intervalo voce vai seguir entre as aplicacoes?"* — nao usar linguagem que pareca prescricao; perguntar o que foi combinado ou o que a pessoa esta seguindo. Exemplos: a cada 7 dias / 10 dias / 14 dias / outro intervalo. **Dados:** `dose_frequency_days` (numero de dias informado/confirmado) + `dose_frequency_source` (`user_confirmed`, `user_edited`). **Cascata enquanto NAO ha protocolo confirmado:** proxima dose = "a definir"; lembretes de aplicacao = nao agendar; aderencia = nao mostrar; memoria do ciclo = cold-start explicando que falta o intervalo; perguntas sobre efeitos = nao usar timing presumido se nao houver dose/protocolo suficientes; topo = pedido claro pra configurar o intervalo. **Mudanca de protocolo:** editavel a qualquer momento, NAO apaga historico (vale dali pra frente). Historico preserva: dose aplicada, data aplicada, intervalo usado naquele momento se disponivel, custo informado, efeitos registrados depois. Relatorio explica que o protocolo mudou, em vez de reescrever o passado. **Implicacao tecnica (sem executar):** P1 da §12 "Resolver frequencia/protocolo de dose" vira pre-requisito tecnico da memoria do ciclo, assim que P0-novo-A IA estiver resolvido. Planejamento de modelo de dados em modo read-only (Opcao C da Regra de Foco) — sem migration, sem schema, sem deploy agora. `medication_applications.days_until_next_dose` deve deixar de depender de DEFAULT 7 — cliente passa o valor calculado da frequencia confirmada. |
| **Acompanhamento medico no onboarding: opcional contextual, nao obrigatorio (decidida 2026-05-22 19:20)** | **App e memoria, nao triagem moral.** Capturar acompanhamento medico no onboarding e correto porque a promessa central virou "memoria pronta pra proxima consulta" e canal medico e moat — mas NAO obrigatorio. **Tela:** titulo *"Quem acompanha seu tratamento?"*; subtexto *"Isso ajuda o DoseDay a organizar sua memoria para a consulta. Voce pode adicionar depois."* **3 opcoes:** (1) *"Tenho um medico acompanhando"* (abre campo opcional "Nome do medico ou clinica", placeholder *"Ex: Dra. Marina"*); (2) *"Ainda nao tenho acompanhamento"*; (3) *"Adicionar depois"*. **NAO usar "automedicacao" como copy publica** — internamente pode existir estado "sem acompanhamento medico", mas UI fica neutra. **Copy futura adapta ao estado:** com medico → *"Levar para a consulta"*; sem acompanhamento → *"Guardar para lembrar"* ou *"Organizar minha memoria do tratamento"*. App pode recomendar de forma institucional sem tom de bronca: *"Sempre que possivel, acompanhe seu tratamento com um profissional de saude."* **Email/WhatsApp do medico NAO entra no onboarding** — capturar canal de envio so no momento de compartilhar relatorio (share sheet do iOS resolve a maioria sem armazenar contato). **Regra derivada (geral):** dado medico de terceiro so e pedido quando desbloqueia uma acao imediata. Nome do medico no onboarding personaliza a memoria; canal de envio (email/WhatsApp) fica fora do onboarding porque so serve na hora de compartilhar. |
| **Monetizacao: nao mexer agora; trial 14d; modo gratis limitado mantido (decidida 2026-05-22 19:45)** | **NAO migrar paywall agora.** Enquanto onboarding, IA, frequencia/protocolo e tela unica estao em revisao, qualquer mudanca de monetizacao e prematura. Risco real: cobrar antes do app demonstrar a memoria que promete. **Trial atual (14d) fica como esta** — registrado como hipotese de produto coerente com app de ciclo (7d so mostra 1 dose pra usuario de Mounjaro/Ozempic/Wegovy). A/B 7d vs 14d so quando houver volume e instrumentacao confiavel. **Nomenclatura correta:** o modelo futuro NAO e "hard paywall puro" — e **paywall pos-onboarding com trial destacado + modo gratis limitado secundario**. Hard paywall puro bloqueia tudo; o DoseDay precisa de piso gratuito util pra nao constranger o canal medico (se medico indica e paciente cai em bloqueio total antes de ver valor, atrito vira pra o medico). **Ordem operacional:** (1) fechar direcao do produto → (2) resolver P0/P1 IA/compliance → (3) resolver protocolo/frequencia sem suposicao → (4) redesenhar onboarding/tela unica → (5) medir ativacao → (6) so entao testar paywall. **Modelo futuro:** Free = registrar dose/peso/protocolo/historico basico; Pro = memoria inteligente, relatorio medico completo, analise de padroes, custo, exportacao/compartilhamento avancado. **Detalhe operacional + metricas bloqueantes:** ver §15. **Regra derivada:** monetizacao so entra depois que o app provar memoria. |
| **Versao Clinica B2B2C: REMOVIDA do escopo atual (decidida 2026-05-22 20:00)** | **Nao existe "versao clinica" no escopo atual do DoseDay.** O produto agora e app para usuarios/pacientes. **Sem:** dashboard medico, login medico, lista de pacientes, painel B2B2C, distribuicao formal por medicos, vinculo medico-paciente, permissionamento paciente-medico. Isso pode virar discussao futura SE o app ganhar tracao real (volume + sinal concreto de medicos interessados) — mas sai do escopo operacional e do GTM publico agora. **Direcao correta agora:** 1 app, 1 usuario/paciente, memoria do proprio tratamento, Free sem IA, Pro com IA, relatorio/memoria que o usuario pode levar ou compartilhar com o medico, sem produto clinico paralelo. **Medico continua importante como contexto narrativo e destino da memoria, NAO como cliente/operador/canal formal nesta fase.** **Implicacao no moat:** a frase "canal medico e o moat" do GTM precisa ser rebaixada/reescrita. Novo moat = app de memoria do tratamento + contexto brasileiro + medicamentos BR + custo + protocolo real informado pelo usuario + memoria pronta pra consulta + IA premium que transforma registros em entendimento. **Pricing:** remover "Versao Clinica" da tabela publica do GTM. Manter so Free e Pro. **Kit do medico** pode existir no futuro como material de apoio/marketing leve, mas NAO orienta arquitetura agora. |
| **Free sem IA, Pro com IA (decidida 2026-05-22 20:00)** | **IA e o principal motivo de conversao paga**, mas a comunicacao NAO vende "IA" como fim em si — vende **"memoria inteligente do tratamento"**. **Free:** registro basico de dose, peso, protocolo/frequencia, historico simples. Sem memoria inteligente, sem analise de padroes, sem relatorio inteligente, sem insight gerado por IA. **Pro:** memoria personalizada do tratamento, analise inteligente de registros, preparacao para consulta, relatorio/memoria compartilhavel, leitura de padroes quando houver dado suficiente, custo/organizacao avancada se fizer sentido. **Detalhe do split:** ver §15.2 (atualizado nesta decisao). |
| **Onboarding e mantenicao: 2 paradigmas, papeis claros (decidida 2026-05-22 20:20)** | **Onboarding = configuracao inicial guiada (passo-a-passo, com progresso).** **App em uso = memoria recorrente em tela unica.** **Edicao posterior = formulario direto em Perfil/Configuracoes** (sem progress bar, sem linguagem de onboarding, sem reabrir o fluxo guiado). Os 3 paradigmas tem papeis distintos: entrada (onboarding) / uso recorrente (tela unica) / manutencao (perfil). **Regra firme:** NAO reabrir onboarding depois que ele termina. Editar protocolo, medicamento, dose, medico, peso-alvo, custo ou proxima consulta acontece em tela propria de Perfil/Configuracoes com formulario curto e direto. |
| **Ramificacao do onboarding: condicional, nao por persona (decidida 2026-05-22 20:20)** | **NAO criar arquetipos complexos de usuario.** Aceita-se ramificacao simples por **resposta objetiva**: (a) tem acompanhamento medico / nao tem / adicionar depois; (b) ja esta em tratamento / vai comecar; (c) protocolo confirmado / nao confirmado; (d) tem ultima dose registrada / nao tem. Isso e logica condicional pra nao perguntar o obvio, NAO segmentacao por perfil. |
| **`generate-onboarding-insight` = previa unica da memoria Pro, NAO recurso Free (decidida 2026-05-22 20:20)** | **Excecao estrategica a regra "Free sem IA":** o insight final do onboarding funciona como **previa unica da memoria inteligente** antes do paywall, pra demonstrar o valor do Pro. **Nome correto interno e publico:** *"previa unica da memoria inteligente"* ou *"amostra unica da memoria Pro"* — NAO "recurso Free". **Regras:** (a) usuario recebe a previa **uma unica vez** no final do onboarding; (b) depois, se Free, NAO recebe novos insights, analise de padroes, relatorios inteligentes nem memoria dinamica por IA; (c) **Home Free NAO pode parecer alimentada por IA** — se a previa for persistida, a exibicao recorrente respeita o plano (nao mostrar pra Free indefinidamente via cache); (d) Pro ve memoria inteligente recorrente; (e) Free ve historico basico e registros basicos. **Objetivo:** mostrar rapidamente o que o Pro entrega sem transformar IA em feature gratis permanente. |
| **Regra principal do onboarding: cortar dados orfaos (decidida 2026-05-22 20:20)** | **Toda pergunta do onboarding precisa responder:** *"Isso melhora a memoria do tratamento ou alguma decisao operacional do app?"* Se nao melhora, **sai.** Decisoes especificas: (a) **altura** — REMOVER (ja decidido); (b) **idade** — REMOVER salvo uso claro e imediato (sem uso visivel hoje); (c) **sexo biologico** — REMOVER salvo uso claro e imediato (sem uso visivel hoje); (d) **`doctor-name`** — NAO tela isolada; consolidar dentro da tela "Acompanhamento medico"; (e) **`medical-support` + `doctor-name`** — 1 experiencia consolidada; (f) **`treatment-status` + `treatment-duration`** — revisar redundancia; duracao so quando realmente muda memoria ou calculo; (g) **`consent`/termos** — NAO etapa solta do onboarding de produto; migrar pra auth/signup ou gate juridico claro. **Meta de tamanho:** nao 18+ telas + paywall. Onboarding mais curto + perguntas que alimentam memoria real + uma previa de valor no final + paywall/trial depois (gated por §15). |
| **`main_concerns` como engine de personalizacao (decidida 2026-05-22 20:45)** | **`main_concerns` e contexto declarado pelo usuario** — NAO diagnostico, NAO risco, NAO previsao, NAO causalidade. **Serve para:** personalizar captura contextual, organizar memoria, preparar consulta, reduzir friccao, evitar perguntar tudo do zero. **NAO serve para:** alarmar, orientar conduta, assumir efeito colateral, assumir relacao com medicamento, criar rotina diaria de check-in. **Home/tela unica:** **Free** pode ver espelho bruto da preocupacao informada (ex: *"Voce marcou para acompanhar: nausea e lembrar consulta"*) — isso e espelho, NAO IA. Free NAO ve padrao detectado, cruzamento, frase interpretativa, prioridade automatica, "vale lembrar na consulta", analise de mudanca, insight. **Pro** ve preocupacao como memoria personalizada **so quando** ha (a) padrao factual detectado, (b) pre-consulta, (c) revisao de ciclo, (d) registro recente relacionado. NUNCA lista bruta, causalidade ou alarme na Home. **Relatorio:** **Free** lista preocupacoes + registros relacionados em ordem cronologica, sem interpretacao. **Pro** cruza factualmente (*"Nausea foi registrada 2 vezes desde 13/05. Voce marcou nausea como uma preocupacao no inicio do tratamento."*), conta ocorrencias, agrupa por periodo, destaca itens uteis pra consulta — **sem** causalidade e **sem** orientacao medica. Exemplo proibido: *"A nausea foi causada pelo Mounjaro"* ou *"A nausea e esperada apos a dose"*. **Cadencia (3 gatilhos passivos):** (1) gatilho de ciclo sem janela fixa e sem "pos-dose" imediato; (2) pre-consulta quando consulta for informada; (3) mudanca de padrao no Pro quando houver dado suficiente. **NAO usar push** pra preocupacao/sintoma na v1, salvo pedido explicito futuro do usuario. **Quantas/edicao:** lista fechada atual (`nausea`, `esquecer dose`, `lembrar consulta`, `outro`); subtexto recomenda 1-3; multipla escolha nao bloqueada acima disso (UI desincentiva visualmente); "outro" limitado a 40 chars; edicao em Perfil/Configuracoes (sem reabrir onboarding); **remover uma preocupacao NAO apaga historico** — registros antigos permanecem; mas a preocupacao removida para de orientar check-ins e memoria futura. **Regra firme:** check-in aparece como oportunidade de memoria, NAO como cobranca. Sem lembrete diario, sem "como voce esta hoje?", sem cobranca de sintoma, sem alerta de preocupacao, sem tom de urgencia. **Implicacao tecnica (sem executar):** schema atual `user_profiles.main_concerns` (array) suficiente — sem migration. IA da memoria Pro precisa receber `main_concerns` no prompt (hoje nao recebe — vira parte do P0-novo-A e futura reescrita de `generate-insights`). Cruzamento factual do relatorio Pro le `symptom_logs` (fonte canonica §6). |
| **Insight pos-check-in: removido como reflexo automatico (decidida 2026-05-22 21:00)** | **Check-in NAO e chat, recompensa automatica nem "IA responde toda vez".** Resposta default a um check-in registrado e *"Registrado."* Depois, quando houver materia-prima suficiente, o Pro transforma isso em memoria util. **Free:** sem insight pos-check-in. Registra, salva sintomas/efeitos estruturados, mostra confirmacao simples, fecha. A unica IA no Free continua sendo a previa unica da memoria Pro no final do onboarding — sem segunda amostra gratis. Implica **remover regra atual `count === 1`** do `app/diario/checkin.tsx:68` quando vier Fase 2 (hoje cria 2a previa Free). Se continuar temporariamente por contencao, tratar como legado. **Pro:** memoria pos-check-in **somente com gatilho claro**: (1) registro cruza com preocupacao declarada em `main_concerns`; (2) registro muda padrao factual ja observado; (3) usuario esta em pre-consulta declarada; (4) usuario **explicitamente pede** pra transformar aquele registro em memoria pra consulta. Se nada disso → salva, confirma, fecha; entra na memoria futura. **Regra:** mesmo no Pro, nem todo input merece resposta da IA. **Escopo do que a memoria pos-check-in pode dizer (quando dispara):** PODE espelhar o registro, organizar como memoria, conectar com preocupacao declarada, sugerir acao no app ("guardar pra consulta"), dizer que foi salvo no historico. NAO PODE orientar conduta, sugerir medicamento, sugerir ajuste de dose, dizer que algo foi causado pela dose, prever duracao, dizer "e esperado" como verdade clinica, citar trial/estudo/SURPASS/SURMOUNT/STEP, alarmar, usar tom de coach. **Implicacao tecnica futura (P0-novo-A + Fase 2):** caller (`checkin.tsx`) precisa: (a) verificar plano do usuario antes de chamar IA; (b) NAO chamar IA para Free; (c) avaliar gatilho antes de chamar IA para Pro; (d) passar `main_concerns`; (e) passar apenas dados necessarios; (f) usar `symptom_logs` como fonte canonica; (g) remover regra `count === 1`. |
| **Independencia em relacao a Glapp (decidida 2026-05-22 21:15, atualizada 21:40)** | A premissa do GTM *"IA e commodity porque Glapp faz gratis"* foi submetida a validacao externa (pesquisa web read-only). **Resultado: INCONCLUSIVO.** A App Store oficial do Glapp (US) NAO menciona IA na descricao, NAO tem avaliacoes suficientes pra exibir media, e o changelog ("Novidades") atual nao cita IA (so Progress Reports, sleep tracking, theme switch, UI). O site `glapp.io` vende "Ask any GLP-1 question" em marketing copy, mas isso pode ser Q&A generico ou placeholder — sem instalar e testar o app, nao da pra confirmar IA real personalizada por tratamento. **Asterisco honesto:** a analise inicial categorizou como "parcialmente confirmada (B)" baseada em fontes secundarias (Trustpilot, blogs review) — Leo cross-validou na fonte oficial e essa categoria caiu. Reclassificada como **inconclusiva**. **Premissa "IA e commodity" fica suspensa** (nem confirmada nem refutada). **Achado lateral confirmado independente:** existem **3+ concorrentes BR diretos** (DoseCerta — hosting BR + criptografia + subscription, Zemly, OzemPro PT, Pokii com PT, Shotsy PT). O white space "tracker GLP-1 BR" do GTM e menor do que parecia. **Direcao mantida:** decisoes ja fechadas no grill **NAO dependem da premissa Glapp** — dependem da tese propria do DoseDay (memoria do tratamento + contexto BR + protocolo informado + custo + preparacao pra consulta + zero inferencia clinica + sem citar trial). **DoseDay nao vende ter IA. DoseDay vende memoria inteligente do tratamento. IA e veiculo, nao produto.** Implicacao operacional pra GTM: a tese "concorrencia PT quase nula" (canal ASO) precisa revisao — concorrentes BR diretos existem. Diferenciacao real e **postura de produto** (sem inferencia, sem trial, com memoria pra consulta), nao categoria. |

---

## 7. Decisoes ainda abertas

Estas precisam de direcao antes de virar implementacao grande.

| Decisao | Pergunta |
|---|---|
(secao temporariamente sem itens — todas as decisoes anteriormente listadas foram fechadas e movidas para §6.)

**Decisoes movidas para §6 (fechadas):** Frequencia/protocolo (2026-05-22 19:00), Relatorio medico (2026-05-22 18:15), Idade/sexo (2026-05-22 20:20 — remover salvo uso claro e imediato), `main_concerns` como engine de personalizacao (2026-05-22 20:45), Insight pos-check-in (2026-05-22 21:00 — removido como reflexo automatico).

---

## 8. Informacao arquitetural canonica

| Superficie | Papel |
|---|---|
| Home | resumo operacional + proxima acao + insight/memoria curta |
| Doses | historico e gestao de aplicacoes |
| Diario | linha do tempo da memoria do tratamento |
| Relatorios | analise e sintese para consulta |
| Perfil | conta, privacidade, preferencias e dados pessoais |
| Onboarding | configurar contexto minimo que muda o app |

Se uma tela fizer papel de outra, a informacao fica dispersa. Se duas telas coletarem a mesma coisa com linguagens diferentes, o usuario perde confianca.

---

## 9. Dados do onboarding: pagar o pedagio

| Dado | Estado atual | Direcao |
|---|---|---|
| Nome | usado | manter |
| Peso inicial/atual/meta | usado | manter |
| Momento do tratamento | usado parcialmente | manter e refinar |
| Ha quanto tempo | redundante para alguns estados | ramificar melhor |
| Medicamento | usado | manter |
| Dose | usado | manter, permitir "ainda nao sei" |
| Frequencia/protocolo | ausente | **§6 fechada 2026-05-22 19:00:** capturar no onboarding apos medicamento/dose, com sugestao editavel, persistir como `dose_frequency_days` + `dose_frequency_source` |
| Acompanhamento medico | usado pouco | **§6 fechada 2026-05-22 19:20:** tela contextual "Quem acompanha seu tratamento?" com 3 opcoes; nome do medico opcional dentro dessa tela (NAO tela isolada `doctor-name`) |
| Nome de quem acompanha | opcional | **§6 fechada 2026-05-22 20:20:** consolidar dentro da tela de acompanhamento medico — sem tela isolada |
| Preocupacoes | orfa em IA e telas (verificado) | **§6 fechada 2026-05-22 18:30:** alimenta chip contextual do check-in. Outras superficies (lembrete, relatorio, Home) ainda em §7 |
| Idade | orfa em IA e telas (verificado) | **§6 fechada 2026-05-22 20:20:** REMOVER salvo uso claro e imediato na memoria do tratamento (sem uso visivel hoje → sai) |
| Sexo biologico | orfa em IA e telas (verificado) | **§6 fechada 2026-05-22 20:20:** REMOVER salvo uso claro e imediato (sem uso visivel hoje → sai). Copy atual promete "referencias clinicas mais precisas" — promessa quebrada |
| Altura | orfa em IA e telas (verificado) | **§6 fechada 2026-05-22:** REMOVER (sem IMC no escopo) |
| `treatment-status` + `treatment-duration` | parcialmente redundante | **§6 fechada 2026-05-22 20:20:** revisar redundancia; duracao so quando realmente muda memoria ou calculo |
| Consent/termos | tela solta do onboarding | **§6 fechada 2026-05-22 20:20:** NAO etapa solta de onboarding; migrar pra auth/signup ou gate juridico claro |

**Verificacao (2026-05-22):** os 4 campos marcados como "orfa" foram conferidos contra os callers e handlers das Edge Functions de IA: `callGenerateOnboardingInsight` (envia apenas medicacao, dose, semana, pesos e meta), `callGenerateCheckinInsight` (mesma lista + humor + dias desde ultima dose) e `generate-insights/index.ts` (lê profile, doses, peso, checkins e purchases, mas nunca usa `age`, `biological_sex`, `height` nem `main_concerns`). Confirmado: nenhum desses 4 campos entra em qualquer prompt de IA hoje. A copy do onboarding promete "referencias clinicas mais precisas" para sexo biologico, mas essa promessa nao se realiza em runtime.

---

## 10. Aderencia: regra temporaria

"Aderencia" e termo clinico valido, mas nao e bom termo primario para usuario comum no dashboard. Pode aparecer em relatorio profissional, com contexto.

Enquanto o app nao tiver frequencia/protocolo:

| Nao usar | Usar |
|---|---|
| 100% aderencia | 1 dose registrada |
| 1 esperada no periodo | Ainda sem protocolo definido |
| ritmo consistente | Continue registrando para formar seu historico |

Depois que houver protocolo:

- "regularidade" pode ser o termo para paciente;
- "aderencia ao tratamento" pode aparecer na secao profissional do relatorio;
- qualquer percentual precisa mostrar a base: doses registradas / doses esperadas / periodo / frequencia usada.

---

## 11. IA: regras de coerencia

### 11.1 O que a IA nao pode fazer

- citar nomes de ensaios, estudos de marca ou trials;
- dizer que o usuario esta tolerando bem se ele registrou mal-estar;
- responder sem ler o dado recem-capturado;
- dar orientacao medica, prescricao ou ajuste de dose;
- usar tom motivacional, celebratorio ou coach;
- gerar output sem disclaimer;
- existir em producao sem fonte versionada no repo.

### 11.2 O que a IA deve fazer

- reconhecer o contexto do usuario;
- distinguir fato, inferencia e sugestao de registro;
- devolver memoria util, nao frase generica;
- ajudar a preparar consulta;
- transformar dados dispersos em padrao compreensivel;
- quando nao souber, dizer que ainda nao ha historico suficiente.

### 11.3 Copy de comunicacao publica (GTM, store, landing, social, reviews respondidas)

Regra derivada da decisao §6 sobre headline (2026-05-22). Aplica-se a TODA superficie publica: landing, App Store/Play Store, Reels/TikTok, copy de paywall, descricao do app, resposta a review, e-mail marketing, kit do medico, qualquer texto que prometa o que o produto faz.

**Frases PROIBIDAS** (podem ser interpretadas como conduta clinica):
- "o que fazer"
- "como agir"
- "proximo passo clinico"
- "o que tomar"
- "como ajustar"
- "como reduzir sintoma"
- (e variacoes equivalentes)

**Frases PERMITIDAS** (ficam na banda segura de organizacao/memoria):
- "o que registrar"
- "o que lembrar"
- "o que levar para a consulta"
- "o que mudou desde a ultima dose"
- "memoria pronta pra proxima consulta"
- "organize", "acompanhe", "registre"
- "memoria do ciclo"
- "registro rapido de efeito"
- "como ficou depois da dose"
- "algo para lembrar desta dose"
- "isso entra na memoria da consulta"
- **"memoria inteligente do tratamento"** (forma preferida pra comunicar o que e Pro)
- **"previa unica da memoria inteligente"** ou **"amostra unica da memoria Pro"** (forma correta de chamar o insight final do onboarding pra usuario Free — NAO chamar de "recurso Free", "IA Free" ou "amostra de IA")

**Sobre IA na copy publica:**
- NAO vender "IA" como fim em si. IA e infraestrutura, nao promessa.
- Usar "memoria inteligente do tratamento" em vez de "IA premium" / "IA gera seu insight" / "powered by AI" / etc.
- Em docs tecnicos pode aparecer como "IA", mas em UI de paywall, store, landing, headline, hooks: **memoria inteligente**.

**Evitar tambem:**
- "check-in diario"
- "registre como voce esta todo dia"
- "todo dia" como reforco de habito
- **"automedicacao"** como copy publica (rotula o usuario; UI deve ser neutra). Estado interno pode usar, mas UI usa *"sem acompanhamento medico"* ou *"ainda nao tenho acompanhamento"*

**Copy condicional por estado de acompanhamento medico:**
- Com medico cadastrado → *"Levar para a consulta"* / *"Anote pra proxima consulta"*
- Sem acompanhamento → *"Guardar para lembrar"* / *"Organizar minha memoria do tratamento"*
- Recomendacao institucional permitida (1 toque, baixa frequencia): *"Sempre que possivel, acompanhe seu tratamento com um profissional de saude."* — nunca com tom de bronca

**Regra de teste:** antes de publicar qualquer frase, perguntar: *"isso pode ser interpretado como recomendacao clinica?"* Se sim ou em duvida, reformular dentro do vocabulario permitido. Em caso limite, validar com revisao juridica.

---

## 12. Ordem sugerida de ataque

Esta ordem nao e autorizacao de execucao. E apenas direcao para prompts futuros.

**Regra de Foco #64 e suspensao por P0 de seguranca/compliance:** promocao a PR continua gated pela Regra de Foco #64 (so vira PR o que cai nas frentes ativas de onboarding/primeiros 3 minutos, Home/ativacao inicial, Loading/espera do insight ou limpeza de PR antigo/divida que esteja gerando ruido) **EXCETO** para P0 de seguranca, compliance ou PHI — neste caso, contencao tem precedencia sobre Regra #64. Os P0-novo-A/B/C abaixo se enquadram nessa excecao e exigem plano de contencao separado antes de qualquer trabalho de Fase 1.

| Prioridade | Frente | Motivo |
|---|---|---|
| **P0-novo-A** | **Conter `generate-checkin-insight` v4** — pivotar tese de credibilidade (§6 decidida 2026-05-22) + remover geracao viva insegura | **Frente 1 (2026-05-23): source local versionado como contencao sem OpenAI; caller client-side e helper `callGenerateCheckinInsight` neutralizados.** Producao ainda depende de deploy explicito. Cleanup das rows antigas continua separado. |
| **P1-novo-A** | Padronizar `verify_jwt=true` no gateway da `generate-checkin-insight` (alinhar com ADR 0003) | Config nao-padrao. Auth manual em codigo ja existe e retorna 401 sem Bearer, entao **nao e endpoint publico real**. Reduzido de P0 security para P1 config/rastreabilidade. |
| **P0-novo-B** | **Conter `memory-daily-insight` e `memory-summary`** — atualmente `[PLACEHOLDER — sera preenchido pelo PO]` literal rodando em prod | **Frente 1 (2026-05-23): source local versionado como contencao sem OpenAI; `callMemoryDailyInsight` retorna fallback local.** Reescrita real da memoria Pro fica para contrato futuro. Producao ainda depende de deploy explicito. |
| **P0-novo-C (alto)** | **Investigar caller de `memory-summary`** (ativa em prod, sem caller identificado no client local) | Pode ser scheduler/server-side legitimo, scheduler antigo nao removido, ou caller fantasma. Auditoria read-only de logs Supabase pode fechar a duvida. Decidir: versionar + hardenizar, ou desativar. |
| P0-novo-D | **Decidir destino do snapshot** em `docs/handoff/edge-functions-snapshot-2026-05-22/` | Source ja foi recuperado mas NAO promovido para `supabase/functions/`. Decisao: promover via PR de IaC com revisao linha-a-linha, ou descartar e recriar do zero baseado em §6. |
| P0a-audit | **CONCLUIDA 2026-05-22** — auditoria read-only confirmou 5 rows proibidas em `educational_insights` (ver §13.2) | — |
| P0a-cleanup | **Plano separado** de remocao/sanitizacao das 5 rows confirmadas em P0a-audit | gated pela contencao P0-novo-A (primeiro fechar a torneira, depois limpar). Exige plano explicito com criterio de selecao, backup/snapshot e aprovacao antes de qualquer DELETE/UPDATE. |
| P0b | Conter `generate-insights` | **Frente 1 (2026-05-23): source local convertido para contencao sem OpenAI.** Hardening real da memoria Pro fica para contrato futuro. Producao ainda depende de deploy explicito. |
| P0c | **Substituido por P0-novo-A + P0-novo-B**. Decisao de produto sobre Check-in/Home insight (§7) continua valendo, mas agora condicionada a contencao tecnica primeiro. | — |
| P1 | Remover altura do onboarding | decisao fechada, reduz friccao |
| P1 | Remover/trocar placeholder de sentimento no peso | decisao fechada, reduz confusao |
| P1 | Suspender/renomear aderencia percentual sem protocolo | numero enganoso quebra confianca |
| P1 | Resolver frequencia/protocolo de dose | base para proxima dose, lembretes e aderencia |
| P2 | Conectar `main_concerns` a Home/check-in/relatorio | fecha melhor loop do onboarding |
| P2 | Redefinir check-in como captura contextual | evita repetir falha do app atual |
| P2 | Redefinir Home insight e memory-daily-insight | IA precisa continuar viva no dia a dia |
| P3 | Decidir idade/sexo | manter apenas se pagar pedagio |

---

## 13. Pendencias factuais antes de execucao

Antes de transformar os P0s/P1s em prompt operacional, confirmar:

| Fato | Como confirmar | Status | Por que importa |
|---|---|---|---|
| `medication_applications.days_until_next_dose` tem DEFAULT 7 no banco real | Supabase SQL/MCP: inspecionar default da coluna | **Fechada em 2026-05-22** — `integer NOT NULL DEFAULT 7` confirmado (ja refletido em §4.2) | Define se o conserto e schema, trigger, cliente ou todos. Confirmado: default e do schema, conserto envolve ambos (cliente passar valor + ajustar schema). |
| Existem rows atuais com `SURPASS`, `SURMOUNT`, `STEP` ou similares em `educational_insights` | Supabase SQL/MCP com filtros em `headline`, `body`, `context` | **Fechada em 2026-05-22 — 5 rows confirmadas** (ver §13.2) | Evita limpar seed inexistente e ancora o P0 legal em dado real. Quebra hipotese de "seed legado": 2 rows foram criadas HOJE por geracao viva. |
| Inconsistencia "Doses aplicadas" vs "Aderencia" | Cruzar queries de `DoseAdherenceCard` e `AdherenceRingCard` para o mesmo usuario | **Fechada em 2026-05-22 por investigacao local** (ver §13.1) | Pode haver bug numerico alem do problema conceitual de aderencia sem protocolo. |

### 13.1 Fechamento da inconsistencia "Doses aplicadas" vs "Aderencia"

**Data:** 2026-05-22. **Tipo:** investigacao local read-only. Sem Supabase, sem mudanca de codigo, sem PR.

**Diagnostico:**

- **DoseAdherenceCard** soma doses das **ultimas 8 semanas calendar** via `getDoseHistoryByWeek` em `lib/supabase/queries/reports.ts:48-70`. Sem filtro por `treatment_start_date` — inclui doses retroativas, seeds ou testes anteriores ao tratamento atual.
- **AdherenceRingCard** calcula desde `user_profiles.treatment_start_date` via `getAdherenceStats` em `lib/supabase/queries/reports.ts:110-140`. Filtra `application_date >= treatment_start_date`.
- **AdherenceRingCard assume `1 dose / semana` hardcoded** em `reports.ts:132-133`: `weeksElapsed = floor((agora - startDate) / WEEK_MS)` e `totalExpected = max(1, weeksElapsed + 1)`. Nao consulta frequencia, medicamento nem protocolo. Para Saxenda (diario) o calculo e factualmente errado; para Mounjaro (semanal) funciona por coincidencia.
- Tres mecanismos se sobrepoem: janelas diferentes + filtros diferentes + frequencia esperada hardcoded. Mesmo banco, dois numeros distintos na mesma tela.

**Implicacao operacional:**

- O percentual de aderencia **nao deve ser exibido** enquanto o app nao tiver frequencia/protocolo informado pelo usuario.
- O conserto correto **nao e debugar a query do anel**. E suspender o numero ate existir frequencia/protocolo (P1 da §12) e, quando ela existir, refazer `getAdherenceStats` consumindo o valor real.
- Confirma a regra ja escrita em §10: enquanto nao houver protocolo, mostrar **"doses registradas"** ou **"regularidade em formacao"**, nunca **"100% aderencia"** nem **"1 esperada no periodo"**.
- DoseAdherenceCard tambem merece revisao de produto: decidir se "doses aplicadas" deve filtrar por `treatment_start_date` ou nao. Decisao de produto, nao bug isolado.

### 13.2 Fechamento da pendencia "Rows proibidas em `educational_insights`"

**Data:** 2026-05-22. **Tipo:** auditoria Supabase SELECT-only (Supabase MCP, projeto `pjesgdczasumgjzqyzzk`). Sem mudanca de dado, sem deploy.

**Resultado:** 5 rows encontradas com termos `SURPASS`/`SURMOUNT` em `body` ou `headline`.

| `id` | `trigger_source` | `created_at` | Termo proibido | Preview |
|---|---|---|---|---|
| `29c11844-558e-40e0-b31b-701c6313f446` | `first_checkin` | **2026-05-22 16:45 UTC** | `SURPASS` | "É ótimo saber que você está tolerando bem nesta primeira semana…" + "ensaios SURPASS descrevem efeitos gastrointestinais leves a modera…" |
| `c92766d0-3f85-4096-a9e6-0e1571e7b742` | `first_checkin` | **2026-05-22 14:40 UTC** | `SURPASS` | "Sinto muito que você esteja se sentindo mal…" + "ensaios da família SURPASS documentam que náuseas…" |
| `572a3c02-a475-4b6c-8bcb-925c365042e3` | `onboarding` | 2026-05-20 21:43 UTC | `SURMOUNT-1` | "Nos trials SURMOUNT-1 e…" |
| `4bf615b9-a29a-44dd-94b6-9cedbd05deae` | `onboarding` | 2026-05-20 16:59 UTC | `SURMOUNT` | "No SURMOUNT…" |
| `6ae0e232-ab5e-4ce1-86ab-756317c0c593` | `onboarding` | 2026-04-24 19:23 UTC | `SURMOUNT-1`, `SURPASS` | "trials SURMOUNT-1 (obesidade/sem diabetes) e SURPASS (diabetes)" |

**Implicacoes:**

- As 2 rows `first_checkin` foram criadas **hoje** — sao output AO VIVO de `generate-checkin-insight` v4 (EF ativa em prod, ver §3 e P0-novo-A da §12).
- As 3 rows `onboarding` sao **pre-hardening** do `generate-onboarding-insight` (PR #50 deploy foi 2026-05-22 manha; essas 3 sao de antes).
- Cleanup das 5 rows fica gated por P0a-cleanup (§12) e exige plano separado com criterio, backup e aprovacao. **Nao executar DELETE sem instrucao especifica do Leo.**
- Contencao primaria e P0-novo-A (parar a torneira) — sem isso, novas rows com termos proibidos vao continuar a ser geradas.

### 13.3 Achado: 3 Edge Functions ativas em prod sem source versionado + inversao de hipoteses

**Data:** 2026-05-22. **Tipo:** auditoria Supabase `list_edge_functions` + `get_edge_function` read-only.

| EF deployada | versao | `verify_jwt` gateway | Auth manual no codigo | Snapshot recuperado | Promovido para `supabase/functions/`? | Comportamento real |
|---|---|---|---|---|---|---|
| `generate-checkin-insight` | **v5 deployada 2026-05-23** (era v4) | **true** (era false) | **✓ retorna 401 sem Bearer (+gateway agora valida)** | ✅ promovido em `supabase/functions/` + snapshot historico em `docs/handoff/edge-functions-snapshot-2026-05-22/` | **✅ Promovido + deployado como contencao** | v4 antiga (REGRA DE OURO 6 + `validateNumericClaims` exigindo trials) substituida por response deterministica sem OpenAI |
| `memory-daily-insight` | **v5 deployada 2026-05-23** (era v4) | true | ✓ | ✅ promovido + snapshot | **✅ Promovido + deployado como contencao** | Prompt `[PLACEHOLDER]` substituido por response deterministica sem OpenAI |
| `memory-summary` | **v3 deployada 2026-05-23** (era v2) | true | ✓ | ✅ promovido + snapshot | **✅ Promovido + deployado como contencao** | Prompt `[PLACEHOLDER]` substituido por response deterministica sem OpenAI. Caller continua desconhecido (investigacao pendente) |

**Inversao de hipoteses pos-`get_edge_function`:**

| Hipotese inicial (errada) | Realidade confirmada |
|---|---|
| `generate-checkin-insight` e endpoint publico sem protecao | Auth manual em codigo retorna 401 sem Bearer. **Nao e publico real.** Reclassificado para **P1 config** (gateway `verify_jwt=false` nao-padrao). |
| SURPASS no output e falha esquecida de blacklist | **Design intencional documentado.** System prompt EXIGE trial por nome; `validateNumericClaims` rejeita numeros sem trial associado. Conserto e decisao de produto, nao patch de regex. |
| `memory-daily-insight` ja roda IA hardenizada | Roda contra prompt **vazio** (`[PLACEHOLDER]`). Custa OpenAI sem qualidade controlada. |
| `memory-summary` e EF orfa simples | Continua orfa **e** tambem com prompt placeholder no modo `full`. |

**Status do snapshot:** os 3 sources foram salvos como **untracked** em `docs/handoff/edge-functions-snapshot-2026-05-22/` apenas para analise e referencia. **NAO foram movidos para `supabase/functions/`.** Decisao de promocao gated em P0-novo-D (§12).

**Os 4 itens (P0-novo-A/B/C/D + P1-novo-A) viraram trabalho rastreado na §12.** Tratamento detalhado em `docs/handoff/P0-CONTENCAO-2026-05-22.md`.

---

## 14. Prompt guardrail para proximas tarefas

Todo prompt operacional relacionado a onboarding, Diario, Home, Relatorios ou IA deve conter:

```text
BLOQUEANTE: respeitar docs/PRODUCT_COHERENCE.md.

Antes de implementar, responda:
1. Qual loop de memoria esta sendo fechado?
2. Qual dado existente esta sendo reutilizado?
3. Qual pergunta do usuario fica desnecessaria?
4. Qual output muda na Home, Diario, Relatorios ou IA?
5. Existe PHI, Edge Function ou output de IA? Se sim, aplicar security-review e guardrails.

Nao criar nova coleta se o dado nao muda comportamento do app.
Nao mostrar aderencia/proxima dose como fato sem frequencia/protocolo.
Nao citar ensaios, estudos de marca ou trials.
```

---

## 15. Monetizacao e gates de migracao (decidida 2026-05-22 19:45)

Esta secao detalha a §6 (decisao fechada sobre monetizacao). **Nada aqui autoriza execucao** — apenas registra modelo futuro + gates de migracao + instrumentacao minima.

### 15.1 Modelo atual vs modelo futuro

| Camada | Atual (V5, pre-tela-unica) | Futuro (pos-tela-unica + gates) |
|---|---|---|
| Modelo | Freemium com gate em IA/relatorio/custo | **Paywall pos-onboarding com trial destacado + modo gratis limitado secundario** |
| Trial | 14d configurado em prod (RevenueCat) | 14d mantido. Hipotese de produto coerente com app de ciclo. A/B 7d vs 14d so quando houver volume + instrumentacao |
| Cobranca cartao | Padrao Apple | Trial sem cartao ("introductory offer" sem upfront) — converte menos, reduz friccao |
| Piso gratuito | Existente | **Mantido obrigatoriamente** — Free e onde o paciente registra dose/peso/protocolo sem pagar; Pro destrava memoria inteligente. Sem piso o app perde a justificativa "app de memoria" pro paciente que nao quer IA agora |

**Nomenclatura correta:** o modelo futuro NAO e "hard paywall puro". Hard paywall puro bloqueia tudo se o usuario nao iniciar trial/assinar. O DoseDay tem **modo gratis limitado** como segunda opcao secundaria no paywall — preserva o segmento que nunca paga, captura email para remarketing, evita constranger o canal medico.

### 15.2 Split de features Free vs Pro (modelo futuro) — atualizado 2026-05-22 20:00

**Regra estrutural:** Free **NAO TEM IA**. Pro **TEM IA**. IA e o principal motivo de conversao, mas comunicacao vende "memoria inteligente do tratamento" e nao "IA" como fim.

| Camada | Free (sem IA, util como memoria basica) | Pro (com IA) |
|---|---|---|
| Registro de dose | ✓ | ✓ |
| Registro de peso | ✓ | ✓ |
| Protocolo/frequencia de dose | ✓ (configurar uma vez) | ✓ |
| Historico simples | ✓ | ✓ |
| Custo (campo livre + soma) | ✓ (memoria pessoal, sem IA) | ✓ |
| **Memoria do ciclo (topo da tela unica)** | ✗ (sem IA — topo mostra estado bruto: proxima dose, ultimo registro, peso) | ✓ Memoria personalizada do tratamento gerada por IA |
| **Analise inteligente de registros** | ✗ | ✓ |
| **Preparacao para consulta (texto gerado)** | Resumo basico estrutural | ✓ Relatorio inteligente |
| **Relatorio/memoria compartilhavel** | Resumo basico estrutural | ✓ Relatorio inteligente compartilhavel |
| **Leitura de padroes** | ✗ | ✓ (quando houver dado suficiente) |
| Multi-medicamento | ✗ | ✓ |
| Compartilhamento avancado (share/PDF) | Share basico | ✓ Share + PDF |
| **Preocupacoes (`main_concerns`) na Home** | Espelho bruto do que foi informado (ex: *"Voce marcou para acompanhar: nausea"*) | Memoria personalizada quando ha padrao/contexto (ex: *"Nausea apareceu 2x — vale lembrar na consulta"*) |
| **Preocupacoes no relatorio** | Lista + registros cronologicos | Cruzamento factual (contagem por preocupacao, sem causalidade) |
| **Check-in contextual baseado em `main_concerns`** | ✓ (sem IA — chip simples baseado no marcado) | ✓ (mesmo + IA pode interpretar contexto pra Pro) |

**Conversao:** o usuario Free vai longe o suficiente pra entender que o app organiza seus registros, mas nao recebe nem o topo de "memoria inteligente" nem o relatorio inteligente — esses sao o motivo de pagar Pro. **Importante:** este split ainda nao e final. Detalhar conforme decisoes de §7 forem fechadas (idade/sexo, preocupacoes, etc).

### 15.3 Gates bloqueantes para migrar (ordem)

A ordem operacional segue rigorosa. **Nao pular etapas.**

| Etapa | Status | Pre-requisito para proxima |
|---|---|---|
| 1. Fechar direcao do produto | em curso (grill atual) | — |
| 2. Resolver P0/P1 IA/compliance | P0-novo-A definido em `docs/handoff/P0-CONTENCAO-2026-05-22.md`, em standby aguardando autorizacao | direcao fechada |
| 3. Resolver protocolo/frequencia sem suposicao | planejamento read-only autorizavel | P0/P1 IA fechado |
| 4. Redesenhar onboarding + construir tela unica | bloqueado por Camada 2/3 da Regra de Foco #64 | protocolo/frequencia resolvido |
| 5. Medir ativacao (instrumentacao §15.5) | bloqueado por tela unica no ar | tela unica no ar |
| 6. Testar paywall | bloqueado por metricas §15.4 atingidas | metricas atingidas |

### 15.4 Metricas bloqueantes para testar paywall

**Onboarding:**
- Completion rate do onboarding ≥ **70%**
- Nenhuma tela individual com drop-off > **15%**
- Tempo ate primeira memoria util aceitavel, sem sensacao de formulario longo

**Ativacao:**
- ≥ **75%** dos usuarios que completam onboarding confirmam protocolo/frequencia
- ≥ **60%** registram ou confirmam uma dose inicial/ultima dose
- ≥ **50%** registram peso inicial ou confirmam peso atual
- Home/tela unica mostra uma memoria personalizada real, NAO fallback generico

**Qualidade/compliance:**
- P0 IA fechado
- Nenhuma geracao com `SURPASS`/`SURMOUNT`/`STEP`/trials/estudos clinicos em superficie de paciente (validado por SELECT em `educational_insights`)
- Nada de orientacao medica
- Nada de aderencia percentual sem protocolo confirmado
- Nada de proxima dose por DEFAULT 7 sem input do usuario

**Instrumentacao (sem isso nao da pra decidir paywall):** ver §15.5.

### 15.5 Eventos minimos de instrumentacao

Sem estes eventos, decidir paywall e tatear no escuro.

| Evento | Quando dispara |
|---|---|
| `onboarding_started` | usuario abre primeira tela do onboarding |
| `onboarding_step_completed` | a cada tela completada (com nome da tela como parametro) |
| `onboarding_completed` | usuario chega na tela final do onboarding |
| `protocol_confirmed` | usuario confirma frequencia/protocolo |
| `first_dose_registered` | primeira dose registrada apos onboarding |
| `first_weight_registered` | primeiro peso registrado apos onboarding |
| `first_memory_viewed` | primeira vez que o topo da tela unica mostra memoria personalizada real (nao fallback) |
| `paywall_viewed` | paywall renderizado |
| `trial_started` | usuario inicia trial |
| `subscription_started` | usuario converte de trial pra paid |
| `paywall_skipped` | usuario escolhe modo gratis limitado |

**Decisao:** instrumentacao entra na ordem do gate (etapa 4-5). Antes de testar paywall, todos os eventos acima precisam estar disparando e sendo lidos em PostHog (ou similar).

### 15.6 Regra derivada (resumo)

**Monetizacao so entra depois que o app provar memoria.** O usuario nao deve pagar por promessa abstrata de IA — ele deve ver rapidamente que o DoseDay entendeu o tratamento dele e consegue devolver uma memoria util pra ele e pra consulta.

**Atualizar `DoseDay-GTM-Brasil.pdf`** quando for re-renderizado: trocar "hard paywall" por "paywall pos-onboarding com trial + modo gratis limitado"; trocar trial 7d por 14d com justificativa de ciclo; adicionar gates §15.4 como pre-condicao de migracao.

---

## 16. Frase de alinhamento

DoseDay nao e um app para o usuario lembrar de preencher tudo.

DoseDay e o app que lembra o que o usuario ja disse, pergunta menos da proxima vez, e transforma isso em memoria util para a consulta.
