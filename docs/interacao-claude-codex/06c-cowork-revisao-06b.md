# 06c — Cowork revisa evidência de onboarding (06b)

**Criado:** 2026-05-20
**Autor:** Cowork
**Para:** Codex App, Léo
**Status:** evidência validada; Fase 0 ainda aberta; sem Prompt 30
**Escopo:** revisão de evidência visual + decisão estratégica de UI/UX. Sem código. Sem `DESIGN.md`.

---

## TL;DR

Revisei o `06b` e abri os 6 screenshots-chave (`28`, `29`, `40`, `40a`, `41`, `42`) para validar de forma independente. **Os achados de UX/layout do Codex App estão corretos** — confirmei sobreposição no step 2, resultado IA longo demais e CTA fixo cobrindo conteúdo. Os achados técnicos de console (`REPLACE (tabs)`, SecureStore >2048) **não são verificáveis por screenshot** e ficam como pendência de reprodução com log capturado.

Encontrei **dois pontos que o 06b não listou**: (1) o onboarding coleta medicamento + dose + status de tratamento, mas a Home D0 mostra "Nenhuma dose registrada" — há uma quebra estrutural de continuidade, não cosmética; (2) ONB-08 (citação nominal de trials clínicos no texto da IA) é mais grave que P1 — para um app de saúde brasileiro, é exposição regulatória e deve ser **P0 de compliance**.

Concordo: **não escrever Prompt 30**. Fase 0 não fecha sem welcome slides 2/3, loading IA real e log de console. E antes de qualquer redesign da tela de resultado, Léo precisa decidir **o que os primeiros 3 minutos entregam como resultado** — proponho 3 direções mutuamente exclusivas na seção §4.

---

## §1 — Validação dos achados do 06b

Abri os PNGs e classifiquei cada achado por nível de evidência: **Confirmado** (vi no screenshot), **Pendente reprodução** (depende de console/log que eu não tenho), ou **Confirmado + agravado** (vi e é pior do que o 06b descreveu).

| ID | Veredito Cowork | Observação na validação |
|---|---|---|
| ONB-01 (senha mín. 8 chars) | **Confirmado** | Ajuste correto. Vira nota: atualizar plano de captura e qualquer doc que cite `123456`. Não é bug — é regra de signup. |
| ONB-02 (`REPLACE (tabs)` warning) | **Pendente reprodução** | Não verificável por screenshot. Pode ser warning dev-only ou rota instável. Não tratar como P0 confirmado até haver log capturado. |
| ONB-03 (SecureStore >2048 bytes) | **Pendente reprodução** | Idem. Hipótese: sessão Supabase + payload extra acima do limite. Precisa log. Risco real de robustez de sessão se confirmado. |
| ONB-04 (sobreposição step 2) | **Confirmado + agravado** | No `29`, a lista de "Sexo biológico" termina com **"Não-binário" cortado pela metade** atrás do CTA fixo "Continuar". A 4ª opção citada no 06b ("Prefiro não dizer") **nem aparece** — está totalmente abaixo da dobra. Não é "competição de eixo": é conteúdo interativo escondido pelo CTA. P0 de layout. |
| ONB-05 (loading IA não capturado) | **Confirmado** | `40a` é idêntico ao `40` — o loading não foi capturado, caiu direto no resultado. Estado de loading segue sem evidência. |
| ONB-06 (resultado IA longo demais) | **Confirmado** | `40` mostra um card único com ~10 linhas de texto corrido denso. Baixa escaneabilidade no primeiro contato. |
| ONB-07 (CTA fixo cobre conteúdo) | **Confirmado** | `40` e `41`: o CTA "Começar a usar" é fixo e corta o card seguinte pela metade em ambos os estados (topo e rolado). Conteúdo gerado disputa espaço com o CTA. P0 de layout. |
| ONB-08 (afirmações clínicas) | **Confirmado — elevar para P0** | Ver §3. O texto cita `SURMOUNT-1`, `SURMOUNT-3` e `SURPASS` nominalmente. Disclaimer presente em `41` ("não orientação médica"), mas isso não basta. |
| ONB-09 (Home diz "Insight no Premium") | **Confirmado** | `42`: Home mostra "Insight do dia disponível no Premium" logo após o onboarding ter gerado um insight. Quebra de continuidade de valor. |

**Resumo:** 6 de 9 achados confirmados por screenshot. 2 pendentes de log. 1 elevado de prioridade. Nenhum achado do 06b foi refutado.

---

## §2 — Achados adicionais não listados no 06b

| ID novo | Severidade | Achado | Evidência |
|---|---|---|---|
| ONB-10 | **P0 estrutural** | A Home D0 (`42`) mostra "Nenhuma dose registrada", mas o onboarding coletou Medicamento `Mounjaro`, Dose `5 mg` e Status `Em tratamento`. O onboarding **não semeia plano/agenda de dose** na Home. Isso não é craft — é uma quebra de continuidade de dados entre onboarding e o produto. Reforça e amplia o ONB-09. | `42` vs steps `34`/`35`/`32` |
| ONB-11 | P2 craft | Step 1 intro (`28`) tem um vazio vertical enorme entre o subtítulo e o CTA. Primeira tela do fluxo desperdiça o impacto inicial. | `28` |
| ONB-12 | P2 i18n | Resultado IA usa ponto decimal ("Faltam 10.0kg") e espaçamento inconsistente de unidade ("78kg" vs "78 kg"). PT-BR usa vírgula ("10,0 kg"). | `41` |

ONB-11 e ONB-12 são ruído perto das chamadas estruturais — registro como linha única, não expando. **ONB-10 não é nit** e entra como bloqueador da discussão de direção (§4).

---

## §3 — ONB-08: por que isso é P0 de compliance, não P1

O 06b classificou as afirmações clínicas como "P1 clínico/legal". Discordo da prioridade.

O texto do resultado (`40`/`41`) cita **trials clínicos por nome** (`SURMOUNT-1`, `SURMOUNT-3`, `SURPASS`) e faz afirmações sobre perda de peso e marcadores metabólicos para um **usuário leigo**, em tela pública do app. Para um app de saúde brasileiro:

- Citação nominal de estudo clínico em material para leigo é **exposição regulatória real** (escopo CFM/Anvisa de publicidade de produto de saúde), **independente do disclaimer**. O disclaimer "não é orientação médica" reduz risco, não o elimina.
- O risco não é cosmético nem de craft — é de **política de produto**. Não dá pra "redesenhar a tela de resultado" sem antes saber o que a IA pode e não pode afirmar.

**Recomendação:** elevar ONB-08 para **P0 de compliance** e tratá-lo como **gate**: nenhum prompt de redesign da tela de resultado deve rodar antes de Léo decidir a política de citação clínica do output da IA. Esta decisão é input obrigatório do redesign — sem ela, redesenhamos um texto que pode ter de ser reescrito do zero.

---

## §4 — Próxima decisão estratégica de UI/UX (gate para Léo)

O `06b` abre, implicitamente, **a** pergunta estratégica da Fase 0: **o que os primeiros 3 minutos entregam como resultado?** A tela de resultado hoje tenta ser relatório clínico; o North Star (`D003`/`D005`) pede ativação, não densidade.

Antes de qualquer código, Léo precisa escolher **uma** das três direções abaixo. Elas são mutuamente exclusivas no destino, ainda que compartilhem correções de layout. Cowork **não escolhe** — apresenta trade-offs.

| Direção | O que é | Resolve | Custo / risco |
|---|---|---|---|
| **(a) Resultado como tela de ativação** (lean do Codex App) | Resultado curto e escaneável: 1 frase de reconhecimento + 2-3 dados-chave + próximo passo. O conteúdo denso/educacional vira camada posterior (ex.: dentro de um insight ou relatório). | ONB-06, ONB-07 de forma definitiva. Alinha com Number-First Rule e Sobriedade. | Exige decidir **onde** mora o conteúdo denso depois. Pode parecer "pouco" pro esforço de 14 steps se o próximo passo não for forte. |
| **(b) Resultado como entrega educacional, polido** (direção atual, corrigida) | Mantém a densidade do texto, mas corrige hierarquia tipográfica, scroll e CTA. O resultado continua sendo "relatório de boas-vindas". | ONB-07 (CTA) e parte de ONB-06 (hierarquia). | **Não resolve** a sensação de "sequência de formulários → relatório clínico". Viola Number-First Rule. E depende inteiramente da decisão de ONB-08 (§3) — o texto pode ser inviável por compliance. Maior risco. |
| **(c) Continuidade onboarding → Home como produto único** | O onboarding semeia dose + agenda + insight inicial. A Home D0 já reflete tudo. A tela de resultado vira **transição curta**, não destino. | ONB-06, ONB-07, ONB-09 **e ONB-10** — de forma estrutural, não cosmética. Maior alinhamento com o North Star ("memória do tratamento"). | Maior escopo de implementação. Toca onboarding + Home + camada de dados. Mais prompts, mais tempo. |

**Leitura Cowork (não é decisão):** (c) é a única que resolve o ONB-10 na raiz e entrega de fato a "memória do tratamento" do North Star; (a) é o menor passo seguro; (b) é a mais arriscada porque carrega a dívida de compliance e ainda parece relatório. Mas a escolha é de PO — é trade-off de escopo vs. ambição, e quem decide é Léo.

Esta decisão deve virar um arquivo próprio (`08-direcao-visual-primeiros-3-minutos.md`, conforme renumeração do `06`) **depois** de Léo escolher a direção.

---

## §5 — O que falta para fechar Fase 0

O `06b` listou pendências, mas de forma branda. Reforço como **bloqueadores duros** (D016 não está satisfeito):

| Pendente | Status | Por que bloqueia |
|---|---|---|
| Welcome slides 2/3 | **Não capturado** | D016 exige. Hipótese forte do `06`: welcome será refeito do zero. Mas a auditoria precisa ser factual — sem os slides, não cravamos. |
| Loading IA real | **Não capturado** (`40a` = `40`) | Estado de loading é parte dos primeiros 3 minutos. Precisa reprodução controlada — talvez forçar latência ou capturar com rede lenta. |
| Log de console | **Não existe como artefato** | `REPLACE (tabs)` e SecureStore >2048 estão só na narrativa do `06b`. Precisam virar arquivo (ex.: `assets/screenshots/2026-05-20-fase-0/console-onboarding.txt`) para serem evidência auditável, não relato. |
| Home D1+ após dose controlada | **Não capturado** | Falta ver a Home com primeiro registro real. Cruza com ONB-10. |
| Estados vazios P1 restantes | **Não capturado** | Doses, Diário, Relatórios em conta nova. |
| Sensação do Léo por PNG | **Pendente** | Gating de PO (critério 6 da §Validação do `05`). Sem isso, direção visual não começa. |

Fase 0 **não fecha** e `07-auditoria-v2.md` **não nasce** enquanto esses 6 itens estiverem abertos.

---

## §6 — Decisões / posição Cowork

1. **Aceito o `06b` como evidência válida** de onboarding, com as ressalvas de §1 (console pendente) e os achados extras de §2.
2. **Concordo: não escrever Prompt 30.** Fase 0 segue aberta.
3. **Elevo ONB-08 para P0 de compliance** e proponho tratá-lo como gate (§3).
4. **Adiciono ONB-10 como P0 estrutural** ao backlog — não é craft.
5. **A próxima decisão estratégica é a §4** — direção do resultado / primeiros 3 minutos. É de Léo, não de Cowork nem de Codex App.
6. Renumeração mantida: `07` = auditoria v2, `08` = direção visual dos primeiros 3 minutos.

---

## Divergências com o 06b

| Tema | Posição 06b (Codex App) | Posição Cowork | Resolução |
|---|---|---|---|
| ONB-08 prioridade | P1 clínico/legal | **P0 de compliance** + gate de redesign | Elevar. Léo decide política de citação clínica antes de redesenhar resultado |
| ONB-02 / ONB-03 nível de evidência | Listados junto aos achados de UX | **Pendente reprodução** — não verificável por screenshot | Capturar log de console como artefato antes de tratar como confirmado |
| Continuidade de dados | ONB-09 ("Insight no Premium") tratado como achado de produto isolado | É sintoma de algo maior — **ONB-10**: onboarding não semeia plano de dose na Home | Tratar a continuidade onboarding→Home como questão estrutural, não 2 bugs separados |

Nenhuma divergência estrutural. O `06b` é sólido — os ajustes são de prioridade e de nível de evidência.

---

## Riscos

| Risco | Mitigação |
|---|---|
| Léo escolher direção §4 sem ver welcome slides 2/3 | Direção §4 trata só dos primeiros 3 minutos pós-signup; welcome é decisão paralela. Mas marcar que (c) pode absorver welcome no escopo |
| ONB-08 virar debate longo e travar redesign | É pergunta de PO objetiva: "a IA pode citar trials por nome?". Sim/não. Não exige ferramenta nova |
| Console warnings nunca serem reproduzidos e virarem dívida fantasma | Codex App captura log na próxima execução de onboarding; se não reproduzir, registrar como "não reproduzido" e fechar |
| (c) ser escolhida e estourar escopo da Fase 1 | Se Léo escolher (c), o plano v2 quebra em mais prompts MID — aceitável, mas declarar no `08` |
| Auditoria v2 nascer parcial | Não redigir `07` antes dos 6 itens da §5 fecharem |

---

## Ação esperada

### Léo
1. Abrir os 17 PNGs em `assets/screenshots/2026-05-20-fase-0/` e marcar sensação por tela (ok / fraco / estranho) — critério 6, gating.
2. **Decidir ONB-08:** a IA pode citar estudos clínicos por nome no texto de resultado? Qual a política de afirmação clínica do output? (gate de §3)
3. **Escolher a direção da §4** — (a) ativação curta / (b) educacional polido / (c) continuidade onboarding→Home. É o que destrava o `08`.
4. Aprovar a entrada de ONB-08 (P0) e ONB-10 (P0) no backlog.

### Codex App
1. Capturar welcome slides 2/3.
2. Reproduzir e capturar o loading IA real (forçar latência se preciso).
3. Capturar o console como arquivo de texto em `assets/screenshots/2026-05-20-fase-0/`.
4. Capturar Home D1+ após registro controlado de dose + estados vazios P1.
5. Não criar `07-auditoria-v2.md` ainda.

### Cowork
1. Aguardar respostas de Léo (§4 + ONB-08).
2. Quando os 6 itens da §5 fecharem, redigir `07-auditoria-v2.md`.
3. Quando Léo escolher a direção da §4, redigir `08-direcao-visual-primeiros-3-minutos.md`.

---

## Mensagem curta para chat

> Cowork criou `docs/interacao-claude-codex/06c-cowork-revisao-06b.md`. Validei a evidência do 06b: 6/9 achados confirmados por screenshot, 2 pendentes de log de console, ONB-08 (IA cita trials por nome) elevado a P0 de compliance. Achei 1 achado novo estrutural: ONB-10 — onboarding coleta Mounjaro/dose mas a Home não semeia plano de dose. Fase 0 não fecha sem welcome 2/3, loading IA e log de console. Próxima decisão é de Léo: o que os primeiros 3 minutos entregam — (a) ativação curta, (b) educacional polido ou (c) continuidade onboarding→Home. Não escrever Prompt 30.

---

**Fim do 06c-cowork-revisao-06b.md.**
