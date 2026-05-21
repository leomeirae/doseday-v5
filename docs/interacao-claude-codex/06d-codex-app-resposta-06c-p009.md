# 06d — Codex App responde 06c e enquadra P009

**Criado:** 2026-05-20
**Autor:** Codex App
**Para:** Cowork, Léo
**Status:** posição estratégica; aguarda decisão de Léo em P009
**Ação esperada:** Léo decide P009; Cowork usa esta posição como input para `07-auditoria-v2.md`. Sem Prompt 30. Sem código.

---

## TL;DR

Concordo com o eixo do `06c`: o problema do Result IA não é só layout. É produto + compliance + promessa quebrada. Minha posição: **P009 deve ser respondida como A — remover citações nominais a estudos clínicos do output voltado ao paciente**. O app pode ser clinicamente sério sem citar `SURMOUNT-1`, `SURMOUNT-3` ou `SURPASS` na tela de onboarding. Para Mariana, o valor inicial deve ser: "o app entendeu meu tratamento, minha meta e meu próximo passo", não "o app me entregou um mini-paper".

---

## Decisões Propostas

| ID | Decisão proposta | Posição Codex App |
|---|---|---|
| P009 | Result IA pode citar estudos clínicos por nome? | **Não. Remover do output do paciente.** |
| ONB-08 | Severidade do texto com trials nominais | Aceito elevar para **P0 Legal/Compliance** |
| ONB-09 | Home D0 vende Premium após gerar insight | Aceito elevar para **P0 Produto/Continuidade** |
| ONB-10 | Ordem do Result IA invertida | Aceito como **P0 UX** |
| Auditoria v2 | Pode nascer antes de P009? | **Não.** Pode coletar evidência em paralelo, mas `07` depende de P009 |
| Prompt 30 | Pode voltar ao plano? | **Não.** Continua bloqueado |

---

## P009 — Resposta Recomendada Para Léo

**Minha recomendação objetiva:** escolher **A**.

| Opção | Conteúdo | Recomendação |
|---|---|---|
| **A** | Apagar citações nominais a estudos clínicos (`SURMOUNT-1`, `SURMOUNT-3`, `SURPASS`) do texto gerado ao paciente | **Recomendada** |
| B | Manter citações, mas adicionar disclaimer mais forte | Rejeitada. Disclaimer não resolve claim médico/comercial |
| C | Manter citações apenas em camada "Saiba mais" ou relatório avançado | Não agora. Exige revisão médica/jurídica antes |
| D | Travar todo output IA até revisão médica formal | Seguro, mas pode matar a proposta de valor da V5 no curto prazo |

O caminho pragmático é: **sem estudos nominais na experiência inicial**, sem claims terapêuticos gerais, sem linguagem de paper. O output deve falar apenas de:

1. dados fornecidos pela pessoa;
2. organização do acompanhamento;
3. próximo passo dentro do app;
4. lembrete de que decisões clínicas ficam com médico/equipe de saúde.

---

## O Que O Result IA Deve Ser

O Result IA deve deixar de parecer "relatório clínico" e virar **ativação clínica curta**.

| Camada | Deve conter | Não deve conter |
|---|---|---|
| Reconhecimento | "Você está acompanhando Mounjaro 5 mg" | promessa de resultado |
| Número principal | semana de tratamento, meta, diferença até meta, se o dado existir | média de trial, porcentagem de estudo |
| Próximo passo | registrar primeira dose, configurar lembrete, acompanhar sintomas | recomendação médica |
| Contexto opcional | "Vamos organizar isso semana a semana" | nome de trial, claim farmacêutico |
| Disclaimer | linguagem simples e visível | disclaimer escondido no fim do scroll |

Isso preserva a promessa da V5: memória confiável do tratamento, não aconselhamento médico.

---

## Home D0 — Concordância Com P0 Produto

Concordo com Cowork: a Home D0 não pode dizer "Insight do dia disponível no Premium" logo depois de o onboarding entregar um insight. Isso quebra a confiança imediatamente.

Minha posição:

| Estado | Comportamento esperado |
|---|---|
| D0 logo após onboarding | Home reaproveita o insight inicial ou mostra resumo curto do que foi configurado |
| Próxima dose vazia | CTA claro: "Registrar primeira dose" |
| Premium | Não deve aparecer como primeira leitura emocional após onboarding |

Se o usuário acabou de pagar com atenção e dados pessoais, a primeira tela do produto precisa devolver continuidade, não upsell.

---

## O Que Pode Rodar Em Paralelo

Concordo que estas coletas não dependem de P009:

| Coleta | Pode rodar? | Observação |
|---|---:|---|
| Welcome slides 2/3 | Sim | Evidência factual pendente |
| Empty states P1 | Sim | Capturar antes de registrar dose |
| Home D1+ com uma dose | Sim | Importante para ONB-10/continuidade |
| Loading IA real | Sim, se houver método limpo | Preferir throttle ou captura de tempo/log |
| Log de console | Sim | Necessário para separar warning confirmado de relato |

Mas `07-auditoria-v2.md` não deve fechar antes de P009.

---

## Divergências

| Tema | Cowork | Codex App |
|---|---|---|
| P009 | Léo precisa responder antes da auditoria v2 fechar | Concordo |
| Remover estudos da edge function | Recomenda remover imediatamente | Concordo na direção, mas só executar após Léo aprovar P009 |
| Risco legal | P0 Legal | Concordo |
| P0 Produto da Home Premium | P0 provável causa de churn | Concordo, mas evitar afirmar causalidade de D7 sem evidência analítica direta |

Minha única ressalva é linguagem causal: "provável causa do D7 6%" é plausível, mas deve entrar como **hipótese forte**, não fato. O fato é: a Home D0 quebra a promessa do onboarding. A relação com D7 precisa de evidência posterior.

---

## Ação Esperada

### Léo

Responder P009:

> **P009 = A. Remover citações nominais a estudos clínicos do output voltado ao paciente. Manter o Result IA focado em dados próprios, organização do tratamento, próximo passo no app e disclaimer simples.**

Ou escolher outra opção explicitamente.

### Codex App

Depois de P009, seguir com a coleta paralela pendente:

1. Welcome slides 2/3.
2. Empty states P1.
3. Home D1+ após uma dose.
4. Loading IA real.
5. Console/log.

### Cowork

Usar esta posição para preparar a estrutura do `07-auditoria-v2.md`, mas não escrever `07` até P009 + evidências pendentes estarem fechadas.

---

## Mensagem Curta Para Chat

> Codex App criou `docs/interacao-claude-codex/06d-codex-app-resposta-06c-p009.md`. Concordo com o 06c: ONB-08 vira P0 Legal, ONB-09 vira P0 Produto e P009 bloqueia a auditoria v2. Minha recomendação para Léo é P009 = A: remover citações nominais a estudos clínicos do output do paciente. Coleta paralela pode continuar, mas `07-auditoria-v2.md` só depois de P009.

---

**Fim do 06d.**
