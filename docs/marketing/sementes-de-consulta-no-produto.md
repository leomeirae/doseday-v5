# Sementes de "Memória da Consulta" no Produto

> **Prompt 43 — peça estratégica.** ⚠️ **Este é o único artefato que sugere mudança de produto — mas NÃO é implementação.** É briefing pro próximo prompt técnico (44/45). **Nada aqui foi codado.**
>
> **Regra de ouro do Prompt 43:** zero código de produto. Estas sementes existem porque, durante a redação da copy, surgiram oportunidades baratas de reforçar a tese "memória do tratamento" — registradas aqui em vez de implementadas.

---

## Contexto

A copy de ASO e landing promete "chegar na consulta lembrando de tudo". Hoje o app **reúne** os dados (memória/timeline), mas não tem um momento explícito de "preparar consulta". As sementes abaixo fecham essa lacuna de forma **incremental e barata**, sem refatorar schema — reservadas pra pós-TestFlight.

> A hero feature de verdade — "Memória da Consulta" gerando resumo por IA (Movimento 2 do `plano-estrategico-v5.md` §6) — fica pro Prompt 44/45 com MVP definido. Estas são só as sementes baratas.

---

## Semente 1 — Mostrar "Próxima consulta em X dias"

- **Descrição:** já existe data da próxima consulta no perfil/tratamento (`app/configuracoes/tratamento/medico.tsx`). Exibir "Próxima consulta em X dias" no Dashboard ou no topo da tela Memória.
- **Por que reforça a tese:** transforma a consulta no evento-âncora que a marca promete servir. Liga o registro diário ao momento de maior valor.
- **Custo estimado:** **Baixo.** Lê campo já existente, sem migration. Componente de exibição + cálculo de dias. ~1 prompt LOW.
- **Risco:** se o usuário não preencheu a data, precisa de empty state calmo ("Quando marcar sua consulta, acompanhamos aqui").

## Semente 2 — Tag visual "dúvida pra médico" nas notas

- **Descrição:** a rota `app/diario/anotar-memoria.tsx` já grava notas livres (`quick_logs`, `log_type='other'`). Adicionar uma tag/flag visual opcional "dúvida pra médico" na nota — filtro na timeline pra ver só as dúvidas.
- **Por que reforça a tese:** começa a construir o "checklist pra consulta" (Movimento 2) sem a IA ainda. O usuário marca o que quer perguntar; o app só agrupa visualmente.
- **Custo estimado:** **Baixo-médio.** Pode usar campo existente sem migration (ex.: convenção de tag no texto) ou exigir migration leve pra um booleano. **Decidir no Prompt 44** — se exigir migration, vira MID com `security-review`.
- **Risco:** não deixar virar "campo clínico". É lembrete pessoal, não prontuário (`plano-estrategico-v5.md` §5, App Store Guideline 1.4).

## Semente 3 — Botão "Preparar consulta" na tela Memória

- **Descrição:** botão na tela Memória que reúne sintomas + evolução de peso + notas do período num resumo. **Hero da Fase 2.**
- **Por que reforça a tese:** é a entrega literal da promessa de ASO ("chegue na consulta lembrando de tudo"). Materializa o Movimento 2.
- **Custo estimado:** **Médio-alto.** Versão simples (agrupar dados já existentes numa view de leitura) é média; versão com IA gerando resumo priorizado + export PDF é alta (Edge Function, `security-review`, disclaimers). **NÃO é prompt LOW.**
- **Risco:** disclaimer obrigatório em qualquer output ("não substitui avaliação médica"). Se houver IA, guardrails do `plano-estrategico-v5.md` Apêndice B.

---

## Resumo pro PO (priorização sugerida)

| Semente | Custo | Reforça tese | Quando |
|---|---|---|---|
| 1. "Próxima consulta em X dias" | Baixo | Alto | Prompt 44 (LOW) — quick win |
| 2. Tag "dúvida pra médico" | Baixo-médio | Alto | Prompt 44 (decidir migration) |
| 3. Botão "Preparar consulta" | Médio-alto | Altíssimo | Prompt 45 (pós-TestFlight, MVP definido) |

> **Ordem recomendada:** 1 → 2 → 3. As duas primeiras entregam sinal da narrativa rápido e barato; a terceira é a aposta grande que merece validação de TestFlight antes.

---

**Nenhuma destas sementes deve ser implementada neste prompt.** São entrada pro planejamento técnico futuro.
