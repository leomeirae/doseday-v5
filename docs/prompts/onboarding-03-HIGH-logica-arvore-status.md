# Onboarding — Prompt 3 (HIGH) — Árvore lógica por status (PLANO, não código)

**Tipo:** análise + plano. **NÃO É PRA CODAR.** Entrega = plano que o Léo aprova. Implementação vem depois.
**Repo:** `/Users/leofrancaia/Desktop/dose-day-v5` · **main** = `719825d` (pós-#98, onboarding visual+15→11 já mergeado).

**Skills:** `karpathy-guidelines`, `superpowers:writing-plans`, `/impeccable onboard`. (Sem skills de código nesta rodada.)

**Antes de tudo:**
1. Rodar `/claude-mem:learn-codebase` se disponível.
2. Ler `CLAUDE.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`.
3. Ler o prompt detalhado do PO: `/Users/leofrancaia/Desktop/DoseDay-onboarding-logic-audit-prompt.md` e os comentários/screenshots em `/Users/leofrancaia/Desktop/Screenshots Onboarding Dose Day v5`.
4. Ler os arquivos: `app/(onboarding)/{treatment-status,treatment-duration,medication,dose,weight,medical-support,concerns,consent,loading,result}.tsx`, `lib/types/onboarding.ts`, `lib/validation/onboardingSchemas.ts`, `locales/pt-BR/onboarding.json`, `hooks/useOnboardingInsight.ts`, `contexts/OnboardingContext.tsx`.

---

# Problema central (não é tela feia)

O onboarding se comporta como **formulário sequencial**, não como conversa que **entende o status do tratamento**. Sintoma principal: quem responde "vou começar em breve" (planning) ainda vê "qual sua dose atual?" — como se já estivesse em tratamento.

**Instrução central: NÃO corrigir tela por tela. Primeiro redesenhar a ÁRVORE LÓGICA por `treatment_status`.** O resto (frequência, altura, loading, final) deriva disso.

# Fatos já verificados (use, não re-derive)

- ⚠️ **Mismatch de dose (corrigido):** `current_dose` é nullable no TIPO/persistência, MAS o `doseSchema` da tela é `z.coerce.number().positive().max(20)` — **exige número, não aceita null/vazio**. Então hoje um planning não consegue passar sem dose. O plano DEVE tratar explicitamente: o caminho "Ainda não sei", a validação da dose nullable/opcional (provavelmente schema condicional por status), e **testes para planning sem dose**.
- Já existe branch parcial: `treatment-status` faz `planning → pula treatment-duration → medication`. A infra de navegação condicional por status existe e pode ser estendida.
- `height` **não é usado** em nenhum cálculo (sem BMI/IMC; fora do payload do insight) → removível do onboarding, null-safe.
- O insight **já pula planning** (`shouldRequestInsight: treatment_status !== 'planning'`). Logo o `result` PRECISA ramificar (planning não tem insight → tela de "preparação", não "memória pronta"). **Não alterar o contrato/payload do `useOnboardingInsight`.**
- `dose_frequency_days` **já é nullable** no schema (aceita "configurar depois").

# Como resolver a lógica (sem inchar arquitetura)

NÃO espalhar copy/condição `if status === ...` por todas as telas. Propor **helpers simples e centralizados** (ex.: um módulo que, dado o `treatment_status`, devolve labels/copy/quais campos pedir/quais branches pular). Pequeno e testável — sem máquina de estado nem abstração grande. Karpathy: a menor coisa que centraliza a lógica.

# A árvore lógica desejada (mapear aos valores reais de TREATMENT_STATUS_OPTIONS)

- **planning / vai começar em breve:** ainda não tomou a 1ª dose. Nada de "dose atual"/"dose que usa hoje". Se perguntar dose: "Você já sabe qual será sua dose inicial?" + permitir "Ainda não sei" (`current_dose = null`). loading/result/home **não inventam** dose nem próxima dose. Result = "sua preparação está pronta".
- **starting / começando agora:** pode perguntar dose inicial. Copy "dose inicial"/"primeira dose". **PULAR a pergunta "Há quanto tempo?" (treatment-duration)** — quem diz "primeira dose foi essa semana" já é, por definição, <1 mês. Auto-setar `treatment_duration = '<1m'` (mesmo padrão do planning, que auto-seta null), preservando o `treatment_week` do insight (deriveTreatmentWeek('<1m')=2). Bug verificado ao vivo: hoje starting cai em "Há quanto tempo?" com faixas de meses — redundante e ilógico.
- **ongoing / em tratamento:** pode perguntar dose atual + há quanto tempo.
- **restart / retomando:** dose de retomada ou última dose, copy em tom de retomada. Result = "vamos reorganizar sua retomada".

**Critério de aceite transversal:** cada tela parece que entende a resposta anterior.

# Os 6 pontos a resolver no plano

1. **Lógica por status** (acima) — o coração do plano.
2. **Frequência/lembrete:** não forçar só 7/10 dias. Inteiro livre **1–90 dias** (5, 14, 15…). Campo customizado **visível e fácil** (não abaixo da dobra). Copy: "A cada quantos dias você toma ou pretende tomar?" / "Se ainda não souber, você pode configurar depois."
3. **Remover altura do onboarding:** verificado que não é cálculo crítico → propor remover do fluxo, manter null-safe, deixar pra perfil/config futuro. Nada pode quebrar.
4. **Consent LGPD (ANALISAR, não implementar):** avaliar tela dedicada mais leve vs mover consent obrigatório pro signup (checkbox + links). **NÃO mexer em auth/signup/legal sem aprovação explícita** — só recomendação no plano.
5. **Loading/animação:** substituir a bolinha genérica por algo premium/clínico (checklist animado, cards de preparação, progresso elegante, microinterações suaves). Respeitar reduced motion. Evitar dependência pesada sem necessidade. Propor a abordagem (não implementar).
6. **Tela final = valor + conversão:** não só resumo. Deve transmitir "esse app vai lembrar coisas importantes por mim / vai me ajudar na consulta / talvez valha pagar". Mostrar: memória clínica, lembrete de dose (se existir), peso/meta, sintomas/dúvidas pra consulta, relatório inteligente, insights semanais, ponte pro valor premium. **Sem promessa médica, sem "dose recomendada".** Usar: "dose atual", "dose inicial", "próxima dose agendada", "lembrete da dose". Ramificar por status (planning = preparação).

# Entrega que o PO quer agora (PLANO, pausar)

1. **Diagnóstico por tela.**
2. **Nova árvore lógica do onboarding** (por status, com o que cada branch pergunta/pula e a copy-chave).
3. **Arquivos que mudam** (telas, types, schema, context, locale, loading, result) + os **helpers centralizadores** propostos.
4. **Riscos** — com destaque OBRIGATÓRIO para:
   - **Retomada do onboarding (`inferCompletedSteps`):** remover `height` e permitir planning sem dose **afeta a lógica de "qual etapa está completa"**. Plano deve testar: conta nova → parar no meio → fechar/reabrir → **retomar na etapa correta** (em cada branch de status).
   - Não quebrar o insight; planning sem dose; navegação `router.replace` hardcoded entre telas consistente (nenhuma aponta pra tela apagada/pulada errada); back/voltar em cada branch.
5. **Plano de implementação em 2 FASES:**
   - **Fase 1 (bloqueadora de release):** árvore/status · dose+frequência (incl. "Ainda não sei" + inteiro 1–90) · remover altura · `result` null-safe (contrato por branch, abaixo) · navegação/back/retomada.
   - **Fase 2 (polish/conversão):** loading premium · tela final mais forte (conversão) · consent **só análise**, sem mexer em signup agora.
6. **Perguntas que precisam da aprovação do Léo antes de codar** (ex.: forma de tornar dose opcional p/ planning — schema condicional vs nullable; abordagem do loading; consent tela-vs-signup).

# Contrato da tela final (result) por branch — obrigatório

- **planning:** "sua preparação está pronta". SEM dose, SEM próxima dose, SEM insight inventado.
- **starting:** "sua primeira semana está organizada".
- **ongoing:** "sua memória de tratamento está pronta".
- **restart:** "sua retomada está organizada".

**Critério ABSOLUTO (vale pra todas as telas, não só o result):** nenhuma tela pode mostrar **dose, frequência, próxima dose ou insight quando esse dado não existe**. Se o campo é null/ausente, a tela omite a linha — nunca inventa nem mostra placeholder que pareça dado real.

# O result É o momento UAU + a provocação pro Premium

O result pós-animação é a recompensa que faz o usuário sentir "esse app entendeu meu tratamento e vai me ajudar". Não pode ser só cards soltos — deve ser uma **análise que reflete as respostas** da pessoa (estágio, medicação/dose se houver, foco escolhido, meta), por branch.

- **IA do onboarding = GRÁTIS (decisão de produto travada).** O insight gerado aqui (`useOnboardingInsight`) é a **degustação/isca** — NÃO gatear atrás de paywall. Mantém como está (free, non-planning). A IA CONTÍNUA (insights diários, relatório pro médico, análise avançada) é que será Premium — fora deste prompt.
- **Provocação pro Premium (sem gatear o onboarding):** o result pode terminar com um teaser/preview do que o Premium entrega ("toda semana o DoseDay vai resumir seus padrões e preparar sua consulta") + CTA suave. Texto de conversão, não bloqueio. Sem promessa médica; IA = organização/resumo, não orientação.
- **planning** (sem insight de IA): o wow vem da preparação ("seu tratamento está pronto pra começar — vamos lembrar sua primeira dose, peso e dúvidas"), não de análise inventada.

# Critério obrigatório — dados do onboarding refletidos no Dashboard

Validar (no plano e no QA) que o que o usuário respondeu aparece na Home logo após o onboarding: medicação/dose no card de próxima dose, peso/meta no card de peso, foco/concerns onde aplicável. Onboarding que coleta dado que não aparece no Dashboard = quebra de confiança. Mapear cada resposta → onde reflete.

# Restrições

- **Não codar.** Saída = plano (em chat; persistir em `docs/` só após o "ok").
- Não mexer em Supabase/migrations/edge/**contrato de IA**/paywall/auth-signup-legal sem aprovação.
- Mapear branches aos valores reais de `TREATMENT_STATUS_OPTIONS` (não inventar status).
- Karpathy: declarar suposições, menor solução que resolve, critérios verificáveis.

# Complementos do PO (verificados — incorporar ao plano)

6. **Remover altura exige checagem de persistência.** Não basta não ser usada em cálculo. Verificado: a coluna DB é nullable e `toProfileUpdate` só grava `height` se definido (`.update()` null-safe) — MAS o schema da tela peso+meta tem `height: z.coerce.number()` **sem `.optional()`** (mesma armadilha da dose). O plano deve: tornar height opcional no schema da tela, confirmar null-safe em types/persistência, e **não** criar migration. Se algum ponto exigir height non-null, parar e pedir aprovação.

7. **Inconsistência de dose (verificada):** o locale diz `"doseRange": "Dose entre 0,25 e 30 mg"` (L149) mas o `doseSchema` valida `.max(20, 'Dose máxima é 20 mg')`. App fala 30, valida 20. Alinhar validação e copy **sem inventar regra médica nova**. Na dúvida, manter a regra técnica atual (max 20) e corrigir só a copy.

# O plano PRECISA deixar explícito (checklist de aceite do plano)

- Como **planning sem dose** passa pela validação (schema condicional ou dose nullable/opcional).
- Como a etapa **dose fica "concluída"** quando o usuário escolhe "Ainda não sei" (`inferCompletedSteps`).
- Como o **`inferCompletedSteps` retoma** corretamente em cada branch (conta nova → para no meio → reabre → etapa certa).
- Como **weight fica concluído sem height**.
- Como o **result não inventa** dose, frequência, próxima dose nem insight (contrato por branch).
- **Quais arquivos** mudam.
- **Quais testes/QA** comprovam cada um dos itens acima.

**Pause e entregue o plano. Aguarde o "ok" do Léo.**
