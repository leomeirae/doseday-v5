# ASO — App Store Connect (PT-BR)

> **Prompt 43 — peça estratégica.** PT-BR apenas (EN/ES ficam pra prompt futuro). Zero código de produto.
>
> **Mapeamento de campos Apple (confirmado pelo PO):** "descrição curta" = **Texto Promocional** (170 chars, editável sem submeter app).
>
> ⚠️ **Contagens são aproximadas.** Acentos (á, é, ç) contam como **1 caractere** na Apple. Validar a contagem final dentro do App Store Connect antes de publicar.

---

## Limites Apple (referência)

| Campo | Limite | Observação |
|---|---|---|
| Nome | 30 | Indexado para busca |
| Subtítulo | 30 | Indexado para busca |
| Texto Promocional | 170 | **Editável sem submeter build** |
| Descrição | 4000 | **NÃO indexada** pela busca Apple |
| Keywords | 100 | vírgulas sem espaço; sem plurais; **não repetir** palavras do nome/subtítulo |
| What's New | 4000 | — |

---

## 1. Nome do app (30 chars)

| | Nome | Chars |
|---|---|---|
| Atual | `DoseDay` | 7 |
| Sugerido *(recomendado)* | `DoseDay: Memória do Tratamento` | 30 ✓ |
| Alternativa | `DoseDay — Memória do GLP-1` | 26 ✓ |

**Por quê o sugerido:** ocupa os 30 chars cravados, indexa "memória" e "tratamento" (alto valor) e mantém a marca "DoseDay". A alternativa fala GLP-1 direto (mais nichada na campanha atual, menos elástica pra marca).

## 2. Subtítulo (30 chars) — 3 propostas

| # | Subtítulo | Chars |
|---|---|---|
| A *(recomendada)* | `Registre o mínimo na caneta` | 27 ✓ |
| B | `Lembre de tudo na consulta` | 26 ✓ |
| C | `Doses, sintomas, peso e custos` | 30 ✓ |

> **Atenção à regra anti-duplicação:** se o nome escolhido já contém "Memória" e "Tratamento", evite repeti-las no subtítulo (a Apple já as indexa). As 3 opções acima respeitam isso.

## 3. Texto Promocional / "descrição curta" (170 chars) — 3 propostas

| # | Texto | Chars (aprox.) |
|---|---|---|
| A *(recomendada)* | `Registre dose, peso e sintomas em 1 toque. O DoseDay junta tudo numa linha do tempo pra você chegar na consulta lembrando do que importa. A IA só organiza.` | ~155 |
| B | `Tudo do seu tratamento com caneta num só lugar: doses, sintomas, peso e custos. Chegue na consulta sem esquecer nada. A IA organiza sua memória — quem decide é seu médico.` | ~170 |
| C | `Está na caneta emagrecedora? O DoseDay é a memória do seu tratamento: anote rápido, acompanhe o gasto e prepare a consulta com calma.` | ~132 |

## 4. Descrição (4000 chars) — versão única estruturada

> 5 parágrafos conforme briefing. Texto abaixo (~1.700 chars, folga grande). Copiar a partir da linha `---`.

---

**A memória inteligente do seu tratamento.**

O DoseDay reúne tudo do seu tratamento num só lugar, em ordem, pra você nunca mais chegar na consulta tentando lembrar o que aconteceu no mês. Você registra o mínimo no dia a dia e o app transforma isso numa linha do tempo clara — a memória do seu tratamento.

**Feito pra quem está na caneta.**

Se você usa Mounjaro, Ozempic, Wegovy, Zepbound ou outra caneta emagrecedora (semaglutida, tirzepatida), o DoseDay acompanha o seu caminho de perto: cada dose aplicada, como você se sentiu, como o peso evoluiu e quanto está investindo.

**O que dá pra fazer:**
• Registrar doses em poucos toques
• Anotar sintomas com intensidade (leve, moderado, forte)
• Acompanhar o peso ao longo das semanas
• Somar os custos do tratamento e ver o investimento com clareza
• Guardar notas e organizar o que levar pra próxima consulta

**Pensado pra conversar com sua médica.**

O DoseDay reúne sintomas, evolução de peso e suas anotações de forma organizada, pra você aproveitar melhor o tempo da consulta. A inteligência artificial ajuda a **organizar e resumir** a sua memória — ela não diagnostica, não prescreve e não substitui a avaliação do seu médico. Quem decide a conduta é sempre o profissional de saúde.

**Seus dados, com cuidado.**

Levamos privacidade a sério. O DoseDay trata seus registros de saúde com o cuidado que dados sensíveis exigem, em conformidade com a LGPD, com consentimento explícito antes de qualquer registro. Você controla seus dados e pode exportá-los ou apagá-los quando quiser.

O DoseDay é um app de organização pessoal do seu tratamento. Não é serviço médico e não substitui consulta, diagnóstico ou prescrição.

---

## 5. Keywords (100 chars) — vírgulas sem espaço

**String principal (recomendada) — ~95 chars:**

```
glp1,mounjaro,ozempic,wegovy,zepbound,semaglutida,tirzepatida,caneta,dose,sintoma,peso,consulta
```

> Respeita a regra: sem espaços após vírgula, sem plurais, e **não repete** "memória"/"tratamento" (já indexadas no nome/subtítulo).

**Banco de keywords pra trocar (PO ajusta conforme ranking):**

| Keyword | Intenção | Nota |
|---|---|---|
| `glp1` | classe do medicamento | sem hífen (economiza char) |
| `mounjaro` `ozempic` `wegovy` `zepbound` | marca (alta intenção) | maior valor de busca |
| `semaglutida` `tirzepatida` | princípio ativo | público mais informado |
| `caneta` | termo coloquial BR | "caneta emagrecedora" |
| `dose` `sintoma` `peso` `custo` | feature/registro | menor concorrência |
| `consulta` `endocrino` `relatorio` `diario` | contexto médico | candidatos a swap |

> Para incluir `endocrino` (9) ou `relatorio` (9), remova um termo de igual peso (ex.: trocar `consulta` por `endocrino`). Sempre revalidar ≤100 chars.

## 6. What's New — V5.0.0

> Marco de reposicionamento. ≤4000 chars (texto abaixo ~480).

```
DoseDay 5.0 — a memória do seu tratamento, repensada do zero.

• Nova tela inicial: sua próxima dose, seu peso e suas notas num relance
• Registro em 1 toque: dose, sintoma, peso, custo e nota, sem formulário longo
• Linha do tempo unificada: tudo do tratamento em ordem, pra você lembrar na consulta
• Custos do tratamento somados num lugar só
• Visual mais leve e calmo, do começo ao fim

Está na caneta emagrecedora? Agora ficou mais fácil registrar o mínimo e lembrar de tudo na hora que importa.
```

---

## Checklist de publicação (PO)

- [ ] Escolher: nome, subtítulo (1 de 3), texto promocional (1 de 3)
- [ ] Validar contagem real de cada campo dentro do App Store Connect
- [ ] Confirmar keywords ≤100 chars após qualquer swap
- [ ] Conferir categoria **Health & Fitness** (nunca Medical) — `plano-estrategico-v5.md` §5
- [ ] Revisar descrição contra o vocabulário evitado (`posicionamento-marca.md` §5)
