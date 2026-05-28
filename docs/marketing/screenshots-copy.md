# Copy dos Screenshots — App Store (PT-BR)

> **Prompt 43 — peça estratégica.** Apenas o **texto** (caption) de cada screenshot. As imagens entram em prompt futuro com geração de assets. Zero código de produto.
>
> **Regra:** cada screenshot mostra uma feature que **já existe** no app (confirmada em `app/`). Nada inventado.
>
> **Formato Apple:** captions sobem como overlay sobre o screenshot. Título curto (4-7 palavras) + subtítulo (1 frase). Os 2-3 primeiros são os que mais convertem — por isso a sequência começa pela tese.

---

## Sequência narrativa (6 screenshots)

### Screenshot 1 — Hero / tese da marca
- **Tela base:** Dashboard (home) com visão geral
- **Título:** Sua memória do tratamento, num só lugar
- **Subtítulo:** Tudo do seu tratamento com caneta, organizado pra você não esquecer nada.
- **CTA implícito:** "É isto que eu precisava." (ancorar a tese antes de mostrar features)

### Screenshot 2 — Dashboard (próxima dose, peso, notas)
- **Tela base:** `app/(tabs)/index.tsx` — próxima dose, peso, notas recentes
- **Título:** Seu dia, num relance
- **Subtítulo:** Próxima dose, seu peso e suas notas logo na abertura.
- **CTA implícito:** "Abri o app e já sei onde estou."

### Screenshot 3 — Anotar sintoma inline (chips frequentes)
- **Tela base:** `app/diario/anotar-sintoma.tsx` — chips de sintomas frequentes + intensidade
- **Título:** Anote o que sentiu em 1 toque
- **Subtítulo:** Sintomas frequentes viram atalho. Leve, moderado ou forte — você escolhe.
- **CTA implícito:** "Registrar é rápido, não vou esquecer de fazer."

### Screenshot 4 — Linha do tempo unificada (memória)
- **Tela base:** `app/memoria/index.tsx` — timeline de doses, sintomas, peso, notas
- **Título:** Tudo do tratamento, em ordem
- **Subtítulo:** Doses, sintomas, peso e notas numa linha do tempo só.
- **CTA implícito:** "Quando a médica perguntar, eu mostro."

### Screenshot 5 — Custos do tratamento
- **Tela base:** `app/diario/custos.tsx` — soma de custos
- **Título:** Veja quanto está investindo
- **Subtítulo:** Os custos do tratamento somados, com clareza.
- **CTA implícito:** "Faz sentido o que eu gasto."

### Screenshot 6 — Prepare a próxima consulta (semente)
- **Tela base:** memória + dados do médico (`app/configuracoes/tratamento/medico.tsx`)
- **Título:** Chegue na consulta lembrando de tudo
- **Subtítulo:** Sintomas, peso e notas reunidos pro momento com sua endo.
- **CTA implícito:** "Vou aproveitar melhor a consulta."

> **Nota:** o screenshot 6 planta a semente da futura "Memória da Consulta" (ver `sementes-de-consulta-no-produto.md`) **usando só o que já existe hoje** — não promete feature inexistente. A copy fala de "reunir o que já está registrado", não de gerar resumo automático.

---

## Princípios de copy (aplicados acima)

- **Verbo no comando gentil** ("Anote", "Veja", "Chegue") — convida, não ordena.
- **Benefício antes de feature** — o título diz o ganho; o subtítulo diz como.
- **Zero promessa clínica** — nenhuma menção a kg perdidos ou eficácia.
- **"sua endo"** mantém o tom coloquial brasileiro.

## Para o prompt de geração de imagens (futuro)

- Manter identidade **mint** (verde-menta) — **não** copiar roxo/branco do Glapp.
- Screenshots reais levemente inclinados (5-10°), shadow sutil — `plano-estrategico-v5.md` §9.
- Primeiros 2-3 frames legíveis em thumbnail (a maioria não rola a galeria).
