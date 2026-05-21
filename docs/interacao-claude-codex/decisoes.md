# Decisões consolidadas — Codex App ↔ Cowork ↔ Léo

Log das decisões estratégicas tomadas durante essa rodada de Frontend North Star + Auditoria + Redesign.

**Formato:** ID — data — decisão — contexto — quem decidiu — link pra arquivo de origem.

---

## D001 — 2026-05-20 — Mudança de eixo: frontend como produto, não polish
**Decisão:** Antes de novas features (paywall, push backend real, export PDF), elevamos craft de UI/UX das telas existentes ao padrão "Mariana mostra pra amiga".
**Contexto:** V4 falhou por D7 6% e 1 pagante / 96 cadastros. Diagnóstico: app funcional sem desejo de uso. V5 não pode repetir.
**Quem:** Léo (PO), proposto por Codex App, validado por Cowork.
**Origem:** mensagem de Codex App via Léo em 2026-05-20.
**Implicação:** regra anti-pirraça #27 (paridade V4→V5 antes de feature nova) **se expande** para incluir paridade de craft, não só de feature.

---

## D002 — 2026-05-20 — Pasta `docs/interacao-claude-codex/` é canal estratégico
**Decisão:** Respostas longas viram Markdown nessa pasta. Chat só com resumo + arquivo criado/atualizado.
**Contexto:** Conversas longas se perdem no chat. Documentação inline em arquivo permite Codex App ler direto, debater no mesmo arquivo, evitar retrabalho.
**Quem:** Codex App propôs, Léo aprovou, Cowork operacionalizou.
**Origem:** mensagem de Codex App via Léo em 2026-05-20.

---

## D003 — 2026-05-20 — Frontend North Star em uma frase
**Decisão:** "O app que a Mariana abre porque quer, não porque o push tocou. O app que ela mostra pra médica e diz: olha o que eu trouxe."
**Contexto:** Necessidade de norte único pra calibrar todas as decisões de UI/UX da V5.
**Quem:** Cowork escreveu, aguarda validação de Codex App + Léo.
**Origem:** `01-frontend-north-star.md` seção 0.

---

## D004 — 2026-05-20 — Sequência canônica de redesign: Fundação → Top 3 → Polish → Sub-telas
**Decisão:** 4 fases sequenciais, 19 prompts, 8-13 dias estimados. Detalhe em `03-plano-redesign-frontend.md`.
**Contexto:** Definir ordem antes de executar evita "redesign caótico tela a tela".
**Quem:** Cowork propôs, aguarda Codex App + Léo.
**Origem:** `03-plano-redesign-frontend.md` seção 7.

---

## D005 — 2026-05-20 — Princípios estruturais do North Star consolidados
**Decisão:** Clinical Memory ≠ Wellness App, Sobriedade > Animação, Number-First Rule, Vital Mint raro (≤10%), 30% Glass Rule. Qualquer prompt futuro que viole esses princípios é rejeitado em revisão.
**Quem:** Codex App + Cowork (consenso) + Léo (aprovou em P006).
**Origem:** `01-frontend-north-star.md` seção 1, validado em `04-resposta-codex-app.md` ponto 1.

---

## D006 — 2026-05-20 — Auditoria precisa separar fato de hipótese
**Decisão:** Próxima versão da auditoria (`06-auditoria-v2.md`) usa 3 colunas: Fato observado / Hipótese / Evidência pendente. Score só onde há evidência visual real.
**Quem:** Codex App apontou, Cowork aceitou.
**Origem:** `04-resposta-codex-app.md` ponto 2.

---

## D007 — 2026-05-20 — Papel do Codex App expandido
**Decisão:** Codex App é parceiro estratégico + auditor técnico-produto. Lê repo direto, roda skills, audita visualmente no simulador, valida hipóteses contra código, eventualmente implementa PRs LOW/MID. Não é só opinião — é leitura técnica + julgamento de produto. Pode editar diretamente arquivos em `docs/interacao-claude-codex/` sem pedir.
**Quem:** Codex App pediu correção, Cowork aceitou.
**Status:** Aprovada por Léo em 2026-05-20 ("iniciem!!").
**Origem:** `04-resposta-codex-app.md` ponto 3. Atualiza `00-protocolo.md`.

---

## D008 — 2026-05-20 — Taxonomia de UI corrigida
**Decisão:** Unidades de UI separadas em 6 categorias: Tela raiz / Tela de fluxo / Sub-tela / Modal / Componente de fluxo / Overlay-sheet. "25 telas" da auditoria v1 estava incorreto. Contagem real será refeita em `05-mapa-de-telas-corrigido.md` após Fase 0.
**Quem:** Codex App apontou, Cowork aceitou.
**Origem:** `04-resposta-codex-app.md` ponto 4.

---

## D009 — 2026-05-20 — Glass nunca resolve hierarquia visual fraca
**Decisão:** Anti-padrão #1 da V5: "Glass nunca é solução pra hierarquia visual fraca. Se um card precisa de glass pra parecer importante, a hierarquia tipográfica está errada." Vai pro DESIGN.md.
**Quem:** Codex App reforçou, Cowork aceitou.
**Origem:** `04-resposta-codex-app.md` ponto 7.

---

## D010 — 2026-05-20 — P006 = B (North Star aprovada, plano precisa v2)
**Decisão:** North Star aprovada como direção. Plano `03-plano-redesign-frontend.md` arquivado como v1. Plano v2 sai após Fase 0 + Fase 1. Prompt 30 e seguintes bloqueados.
**Quem:** Léo via Codex App.
**Origem:** resposta de Léo + Codex App em 2026-05-20.

---

## D011 — 2026-05-20 — Fase 0 no-code obrigatória antes de implementação
**Decisão:** Antes de qualquer prompt de código, executar Fase 0: evidência visual (30-50 screenshots) + correção do mapa de telas + auditoria v2 com fato/hipótese separados. Bloqueia tudo.
**Quem:** Codex App propôs, Cowork aceitou.
**Status:** Aprovada por Léo em 2026-05-20 ("iniciem!!").
**Origem:** `04-resposta-codex-app.md` seção 2.

---

## D012 — 2026-05-20 — Componentes transversais nascem reativos, não proativos
**Decisão:** `<EmptyState />`, `<ErrorState />`, etc só são criados quando 2+ telas precisam deles após redesign de Home/Welcome/Onboarding expor duplicação real. Evita over-engineering antecipado (Karpathy).
**Quem:** Cowork propôs como ajuste ao Ponto 6 do Codex App.
**Origem:** `04-resposta-codex-app.md` ponto 6.

---

## D013 — 2026-05-20 — Comunicação longa por arquivos, chat só como ponte curta
**Decisão:** Codex App e Cowork respondem em Markdown na pasta `docs/interacao-claude-codex/` com cabeçalho mínimo + 5 seções (TL;DR / Decisões / Divergências / Riscos / Ação esperada). Chat só carrega aviso curto com caminho e ação esperada.
**Quem:** Codex App propôs em `04b-protocolo-canal-arquivo.md`, Cowork aceitou em `04c-cowork-aceite-canal-arquivo.md`, Léo aprovou em 2026-05-20 ("iniciem!!").
**Status:** Aprovada.
**Origem:** `04b-protocolo-canal-arquivo.md`.

---

## D014 — 2026-05-20 — Espera mínima de 2 minutos antes de consultar Cowork em tarefas densas
**Decisão:** Após enviar ao Cowork uma tarefa que exige leitura longa, raciocínio estratégico, avaliação visual, criação de Markdown, revisão de screenshots, plano de execução ou prompt complexo, Codex App aguarda no mínimo 120 segundos antes de consultar a interface do Claude novamente por Computer Use. Se o pedido envolve arquivo, Codex App checa primeiro o filesystem antes de chamar a UI.
**Contexto:** Consultas frequentes por Computer Use gastam chamadas e podem interromper o ritmo de raciocínio do Cowork. A espera padrão preserva tokens e reduz polling ansioso.
**Quem:** Léo determinou; Codex App registrou no protocolo.
**Status:** Aprovada.
**Origem:** Pedido direto de Léo em 2026-05-20; registrado em `00-protocolo.md` seção 4.1.

---

## D015 — 2026-05-20 — P009 = A: Result IA sem citações nominais a estudos clínicos
**Decisão:** O output de IA voltado ao paciente não deve citar estudos clínicos por nome, incluindo `SURMOUNT-1`, `SURMOUNT-3` e `SURPASS`. O Result IA deve focar em dados próprios da pessoa, organização do tratamento, próximo passo no app e disclaimer simples.
**Contexto:** A captura da Opção A mostrou o Result IA citando trials farmacêuticos nominalmente em tela de onboarding. Cowork elevou ONB-08 para P0 Legal/Compliance; Codex App concordou e recomendou P009 = A. Léo confirmou `A` em 2026-05-20.
**Quem:** Léo decidiu; Codex App e Cowork recomendaram.
**Status:** Aprovada.
**Origem:** `06c-cowork-resposta-evidencia-onboarding-opcao-a.md`, `06d-codex-app-resposta-06c-p009.md`, `perguntas-para-leo.md` P009.
**Implicação:** `07-auditoria-v2.md` pode considerar a política de compliance decidida, mas a edge function só deve ser alterada por prompt/PR específico aprovado por Léo.

---

## Decisões pendentes (movem pra cá quando consolidadas)

Ver `perguntas-para-leo.md`.

---

**Fim do decisoes.md.**
