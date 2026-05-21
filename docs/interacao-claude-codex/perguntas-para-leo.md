# Perguntas pra Léo

Dúvidas que **exigem PO judgment**. Léo responde inline. Quando respondida, migra pra `decisoes.md`.

**Marcadores de urgência:**
- 🚨 **Bloqueia próximo prompt** — sem resposta, não avança
- ⏳ **Bloqueia médio prazo** — pode esperar 1-3 dias
- 💭 **Standby** — pode ficar parado, mas vale ter visão de Léo

---

## P001 ⏳ — Onboarding tem 14 steps. Consolidar?

**Contexto:** Apps de saúde sérios têm 6-10 steps (Oura 8, Calm 6). 14 pode ser fadiga.

**Opções:**
- **A.** Manter 14 (cada um tem razão clara, copy clínica boa) — risco de churn no meio
- **B.** Consolidar 4 telas em 2 (Personal Info + Weight em uma, Goal Weight + Treatment Status em outra) — perde respiro
- **C.** Manter 14, mas adicionar "Você está indo bem" sutil entre steps 5 e 6 — risco de virar Duolingo

**Recomendação Cowork:** A, mas com craft de transição (Prompt 37). 14 não é o problema se cada step respira.

**Resposta Léo:** _(aguarda)_

---

## P002 ⏳ — Home: imagem/ilustração no hero?

**Contexto:** Hero card da nova Home (Prompt 35) — só tipografia + número, ou inclui ilustração leve (linha minimalista de caneta GLP-1)?

**Opções:**
- **A.** Só tipografia + número (sobriedade clínica máxima)
- **B.** Ilustração leve monoline em Vital Mint discreto (caneta esquemática)
- **C.** Ícone SF Symbol "cross.case.fill" pequeno (decoração mínima)

**Recomendação Cowork:** A, alinhado com North Star "Number-First". Ilustração arrisca virar wellness.

**Resposta Léo:** _(aguarda)_

---

## P003 ⏳ — Glass no Welcome pré-auth: modal vs faixa decorativa?

**Contexto:** PR #34 implementou Liquid Glass. Hoje aparentemente com modal flutuante. Discutir alternativa.

**Opções:**
- **A.** Modal central com glass (atual) — quebra um pouco a regra "glass só em navegação"
- **B.** Faixa horizontal sutil no rodapé (acima do safe area) — respeita regra mais à risca
- **C.** Tab bar simulada no rodapé (mock visual da real) — preview do que vem

**Recomendação Cowork:** B. Mais discreto, respeita DESIGN.md.

**Resposta Léo:** _(aguarda)_

---

## P004 ⏳ — Card de peso: sparkline ou gráfico dedicado?

**Contexto:** Home pode mostrar peso atual + delta. Visualização?

**Opções:**
- **A.** Apenas número herói + delta ("82.4 kg • −0.3 kg em 7d")
- **B.** Número herói + sparkline minúsculo (8 pontos, sem eixo)
- **C.** Card maior com gráfico cheio (eixo X, eixo Y, pontos)

**Recomendação Cowork:** A na Home, B na tab Peso dedicada (quando existir), C na tab Relatórios.

**Resposta Léo:** _(aguarda)_

---

## P005 💭 — Push notifications: precisamos de skill de copy específica?

**Contexto:** Voice & Tone PRODUCT.md cobre app inteiro. Push tem restrições próprias (≤40 chars, sem markdown, contexto pobre).

**Opções:**
- **A.** Cowork resolve caso a caso com PRODUCT.md aberto
- **B.** Criar mini-skill `push-copywriting-doseday` dedicada
- **C.** Adicionar seção "Push" em PRODUCT.md com 5-6 regras

**Recomendação Cowork:** C. Push é pequeno demais pra justificar skill. Seção em PRODUCT.md cobre.

**Resposta Léo:** _(aguarda)_

---

## ~~P006~~ ✅ RESOLVIDA — Aprovar visão do North Star + sequência de Fase 1?
**Resposta:** **B** — North Star aprovada, plano precisa v2. Ver D010 + D011 em `decisoes.md`.

---

## P007 ⏳ — Manter 5 tabs ou adicionar tab "Peso" dedicada?

**Contexto:** Hoje peso é modal + sub-tela `/peso/historico`. Mas peso é central pra GLP-1. Mereceria tab própria?

**Opções:**
- **A.** Manter 5 tabs (Início, Doses, Diário, Relatórios, Perfil) — peso continua em sub-tela e card na Home
- **B.** Substituir tab "Diário" por "Peso" — diário fica sub-tela
- **C.** 6 tabs (adicionar Peso) — sobrecarrega tab bar
- **D.** Substituir "Doses" e "Diário" por "Hoje" + "Histórico" e ter peso como modal rápido

**Recomendação Cowork:** A inicialmente, reavaliar depois do redesign de Home. Se Home tem hero de dose + atalho de peso, talvez 5 tabs continue ótimo.

**Resposta Léo:** _(aguarda)_

---

## P010 ⏳ — Quick-log direto no Diário é intencional?

**Contexto:** No Diário, tocar o chip `Náusea` registrou um evento imediatamente, sem abrir modal e sem feedback visual forte de confirmação. Isso pode ser uma boa feature de registro rápido, mas do jeito atual também pode gerar dado clínico acidental sem a pessoa perceber.

**Opções:**
- **A.** Manter quick-log direto, mas exigir feedback visível + haptic + opção de desfazer.
- **B.** Trocar quick-log por modal de confirmação antes de salvar.
- **C.** Remover quick-log por enquanto e deixar só check-in completo.

**Recomendação Codex App:** A. O registro rápido é coerente com o princípio "loop curto, valor longo", mas precisa deixar claro que salvou e permitir desfazer.

**Recomendação Cowork:** A, se Léo considerar o comportamento intencional; B se preferir máxima segurança contra registro acidental.

**Resposta Léo:** _(aguarda)_

---

## ~~P009~~ ✅ RESOLVIDA — Result IA pode citar estudos clínicos por nome?

**Contexto:** A captura de onboarding mostrou o Result IA citando `SURMOUNT-1`, `SURMOUNT-3` e `SURPASS` nominalmente em texto voltado ao paciente. Cowork elevou ONB-08 para P0 Legal/Compliance. Codex App concorda com a elevação.

**Opções:**
- **A.** Remover citações nominais a estudos clínicos do output do paciente. Manter dados próprios, organização do tratamento, próximo passo e disclaimer simples.
- **B.** Manter citações, mas reforçar disclaimer.
- **C.** Mover citações para camada "Saiba mais" ou relatório avançado, após revisão médica/jurídica.
- **D.** Suspender todo output IA até revisão médica formal.

**Recomendação Codex App:** A. É o menor caminho seguro: preserva valor do onboarding sem expor o app a claim médico/comercial desnecessário.

**Recomendação Cowork:** A. Apagar referências nominais a estudos da edge function antes de qualquer ship.

**Resposta Léo:** **A** — remover citações nominais a estudos clínicos do output voltado ao paciente. Manter dados próprios, organização do tratamento, próximo passo no app e disclaimer simples. Confirmado em 2026-05-20.

---

## Perguntas resolvidas (movem pra `decisoes.md` quando respondidas)

- **P009** → consolidada em `decisoes.md` como D015.

---

**Fim do perguntas-para-leo.md.**
