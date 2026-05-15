> **ARQUIVADO em 2026-05-15.** Sistema canônico vive em `docs/DESIGN.md`. Este arquivo é referência histórica das decisões tomadas em 14/mai/2026 que alimentaram o `/impeccable teach` do Prompt 02.

# DoseDay V5 — Design System (Preview)

**Data:** 14 de maio de 2026
**Status:** PREVIEW. Será refinado e formalizado em `/docs/DESIGN.md` (6 seções Impeccable) ao rodar `/impeccable teach` no Prompt 02.
**Local canônico:** `/Users/leofrancaia/Desktop/dose-day-v5/docs/design-system-preview.md`
**Saída do skill:** `/design:design-system extend <sistema completo>`

---

## Problem

A V4 do DoseDay teve design "bonito-mas-leve". Glass empilhado, mockups 3D, 3 cores de botão primário diferentes (verde-menta, amarelo mostarda, laranja descolorido), tom motivacional/culposo ("Seu médico precisa de você"), tipografia genérica.

Em um app médico para tratamento que custa R$1.500-2.500/mês, isso quebra confiança clínica. Os concorrentes globais sérios (Shotsy, Glapp) escolheram sobriedade. Aqueles que escolheram aesthetic-forward não venceram (V4 do próprio DoseDay).

A V5 precisa de um design system que:

1. **Transmita confiança clínica** sem virar formulário do INSS
2. **Mantenha o Liquid Glass** como diferencial visual real (nenhum concorrente usa) — mas confinado à navegação
3. **Padronize tudo** que estava drift na V4 (botões, cards, paletas, copy)
4. **Sirva como fonte única** para o Claude Code rodar `/impeccable craft` com resultado consistente

---

## Existing Patterns

| Fonte | O que aproveitamos | O que rejeitamos |
|---|---|---|
| **DoseDay V4** | Verde-menta como cor de marca, palette dark, conceito de check-in 1-tap, ícones | Mockups 3D, glass empilhado, 3 cores de botão primário, tom culposo |
| **Shotsy** | Sobriedade clínica, cards limpos | Sem IA significativa |
| **Glapp** | "Log once, get insight", uso restrito de cor | Visual flat demais |
| **Apple HIG iOS 26** | Liquid Glass nativo, SF Pro, hierarquia padrão | Não aplicável a 100% (precisamos de identidade própria) |
| **Anti-Noom** | Comunicação direta, sem coaching scriptado | (referência negativa) |
| **Oura / WHOOP** | Glamour pontual sobre base instrumental | Não estamos em wearable |

---

## Proposed Design — Sistema Completo

### 1. Princípios

| Princípio | Em prática |
|---|---|
| **Sobriedade clínica primeiro** | Base sólida, alto contraste, tipografia densa |
| **Glass restrito à navegação** | Regra dos 30% — máximo de área com glass numa tela |
| **Cor com propósito** | Cor sinaliza estado (positivo, alerta, dado clínico) — nunca decoração |
| **Tipografia faz o trabalho pesado** | Hierarquia clara, peso significa importância |
| **Espaço respira** | Densidade vem do conteúdo, não do compressão visual |
| **Texto antes de ícone** | Ícone acompanha texto, nunca substitui (acessibilidade + credibilidade) |
| **Estados de erro tratam o usuário como adulto** | Mensagem clara, ação de recuperação, nunca culpa |

---

### 2. Tokens

#### 2.1 Cores

##### Background

**Direção confirmada (decisão Léo, 14/mai/2026):** verde-menta + **azul-grafite** (sem violeta da V4)

| Token | Hex | Uso |
|---|---|---|
| `bg.base` | `#050B12` | Background geral de telas — azul-grafite profundo |
| `bg.elevated` | `#0E1620` | Cards, modais — um nível acima |
| `bg.surface` | `#1B2433` | Cards de dado clínico — mais elevado |
| `bg.overlay` | rgba(5,11,18,0.80) | Backdrop de modal |

##### Brand / Action

| Token | Hex | Uso |
|---|---|---|
| `brand.primary` | `#00D4AA` | Cor da marca, botão primário, accent positivo |
| `brand.primary.dim` | `#00B894` | Hover/pressed do primary |
| `brand.primary.fade` | rgba(0,212,170,0.12) | Background sutil de elemento ativo |

##### Semantic

| Token | Hex | Uso |
|---|---|---|
| `semantic.positive` | `#00D4AA` | Sucesso, progresso bom |
| `semantic.warning` | `#FFB347` | Atenção (não emergência) |
| `semantic.critical` | `#E64545` | Erro grave, alerta clínico real |
| `semantic.info` | `#5BA8D9` | Informação neutra, dado de referência |
| `semantic.muted` | `#5C6878` | Estado desativado, secundário |

##### Texto

| Token | Hex | Uso |
|---|---|---|
| `text.primary` | `#F2F4F7` | Texto principal (branco quente) |
| `text.secondary` | `#9CA8B8` | Subtítulo, metadado |
| `text.tertiary` | `#6B7280` | Hint, placeholder |
| `text.inverse` | `#050B12` | Texto sobre fundo claro (raro) |
| `text.brand` | `#00D4AA` | Link, texto destacado |
| `text.disabled` | rgba(242,244,247,0.30) | Texto desativado |

##### Glass

| Token | Valor | Uso |
|---|---|---|
| `glass.regular` | iOS 26 `.regular` style | Tab bar, toolbar padrão |
| `glass.clear` | iOS 26 `.clear` style | Sobre fotos / hero |
| `glass.tint.brand` | tint com brand.primary @ 8% | Hover de tab ativa |
| `glass.tint.surface` | tint com bg.surface @ 12% | Background sutil de paywall |

**REGRA:** glass aplica APENAS em: tab bar, toolbar, header de navegação, botão primário em paywall, botão de modal-sheet, splash. **Nunca** em: card de dado, lista, texto corrido, gráfico, relatório.

##### Cores de dado clínico (gráficos)

| Token | Hex | Uso |
|---|---|---|
| `clinical.weight.line` | `#00D4AA` | Linha de peso no gráfico |
| `clinical.weight.bg` | rgba(0,212,170,0.18) | Área sob linha de peso |
| `clinical.dose.dot` | `#5BA8D9` | Marcadores de dose |
| `clinical.symptom.mild` | `#7DD3A0` | Sintoma leve |
| `clinical.symptom.moderate` | `#FFB347` | Sintoma moderado |
| `clinical.symptom.severe` | `#E64545` | Sintoma intenso |

---

#### 2.2 Tipografia

Família: **SF Pro** (iOS nativo, sem custo, sem licença, integração perfeita)

| Token | Tamanho | Peso | Line height | Uso |
|---|---|---|---|---|
| `type.display` | 32pt | Bold | 38pt | Headline de tela-marco (welcome, paywall) |
| `type.h1` | 28pt | Semibold | 34pt | Headline de tela padrão |
| `type.h2` | 22pt | Semibold | 28pt | Seção dentro de tela |
| `type.h3` | 18pt | Semibold | 24pt | Sub-seção |
| `type.body` | 16pt | Regular | 22pt | Texto padrão |
| `type.body-emph` | 16pt | Semibold | 22pt | Body com ênfase |
| `type.body-clinical` | 15pt | Regular | 24pt | Texto longo de relatório (legibilidade prioritária) |
| `type.caption` | 13pt | Regular | 18pt | Metadado, footer de card |
| `type.label-button` | 16pt | Semibold | 20pt | Texto de botão |
| `type.label-tab` | 11pt | Medium | 14pt | Texto de tab bar |
| `type.number-large` | 40pt | Bold (SF Pro Display) | 48pt | Peso, dose principal |
| `type.number-medium` | 28pt | Bold (SF Pro Display) | 34pt | Valor secundário (delta de peso) |
| `type.mono-data` | 14pt | Regular (SF Mono) | 20pt | Tabela de dado clínico |

---

#### 2.3 Espaçamento (grid 4pt)

| Token | Valor |
|---|---|
| `space.xxs` | 4pt |
| `space.xs` | 8pt |
| `space.sm` | 12pt |
| `space.md` | 16pt |
| `space.lg` | 24pt |
| `space.xl` | 32pt |
| `space.xxl` | 48pt |
| `space.xxxl` | 64pt |

**Padrões:**
- Padding interno de card padrão: `space.md` (16pt)
- Padding de tela (margem lateral): `space.lg` (24pt) em iPhone padrão
- Gap entre cards: `space.md` (16pt)
- Gap entre seções: `space.xl` (32pt)

---

#### 2.4 Border radius

| Token | Valor | Uso |
|---|---|---|
| `radius.xs` | 6pt | Chip, badge |
| `radius.sm` | 10pt | Input, botão pequeno |
| `radius.md` | 14pt | Card padrão |
| `radius.lg` | 20pt | Card de destaque, modal |
| `radius.xl` | 28pt | Paywall hero, splash |
| `radius.full` | 9999pt | Avatar, dot indicator |

---

#### 2.5 Border / divisor

| Token | Valor | Uso |
|---|---|---|
| `border.subtle` | 0.5px @ rgba(255,255,255,0.06) | Border de card |
| `border.standard` | 0.5px @ rgba(255,255,255,0.10) | Divisor de lista |
| `border.emphasis` | 1px @ brand.primary | Estado selecionado |
| `border.error` | 1px @ semantic.critical | Input com erro |

---

#### 2.6 Elevation (sombras)

| Token | Sombra | Uso |
|---|---|---|
| `elevation.0` | nenhuma | Padrão |
| `elevation.1` | 0 1px 2px rgba(0,0,0,0.20) | Card padrão |
| `elevation.2` | 0 4px 12px rgba(0,0,0,0.30) | Card flutuante / floating action |
| `elevation.3` | 0 12px 32px rgba(0,0,0,0.45) | Modal, sheet |
| `elevation.glass` | nativo iOS 26 `.glassEffect()` | Único elemento que NÃO usa shadow custom |

---

#### 2.7 Motion

| Token | Duração | Easing | Uso |
|---|---|---|---|
| `motion.instant` | 100ms | linear | Feedback de tap |
| `motion.quick` | 200ms | ease-out | Hover, fade, micro-interaction |
| `motion.standard` | 300ms | cubic-bezier(0.4, 0.0, 0.2, 1) | Modal in/out, sheet |
| `motion.slow` | 500ms | cubic-bezier(0.4, 0.0, 0.2, 1) | Transição grande, onboarding |
| `motion.spring` | spring | dampingRatio: 0.8 | Botão de check-in (1-tap), paywall confirm |

**Princípio:** motion sinaliza estado (entrou, saiu, foi tocado). Nunca decoração. Em app médico, motion gratuita parece amador.

---

### 3. Componentes

Lista priorizada. **Marcados com 🟢 entram no Prompt 04+ pelo Impeccable.** **🟡 entram conforme necessidade.** **🔴 não fazem parte do MVP.**

#### 3.1 Primitivos (`/components/ui/`)

| Componente | Prioridade | Notas |
|---|---|---|
| **Button** | 🟢 | 3 variants (primary, secondary, ghost), 3 sizes (sm/md/lg), 5 states |
| **GlassBar** | 🟢 | Wrapper que aplica Liquid Glass em tab bar/toolbar APENAS |
| **Card** | 🟢 | 3 variants (default, elevated, clinical-data) |
| **Input** | 🟢 | text, password, number, date. Com label flutuante |
| **Select / Picker** | 🟢 | iOS-native wheel + bottom sheet |
| **Switch** | 🟢 | iOS-native, accent brand.primary |
| **Checkbox** | 🟡 | Pouca aplicação inicial |
| **Radio Group** | 🟢 | Estados emocionais (5 botões) |
| **Slider** | 🟡 | Pra intensidade de sintoma (futuro) |
| **Skeleton** | 🟢 | Loading inteligente, com frase contextual |
| **EmptyState** | 🟢 | Padrão pra lista sem dado ainda |
| **ErrorState** | 🟢 | Linguagem humana + ação de recuperação |
| **Badge** | 🟢 | Status, prioridade (premium, IA, urgente) |
| **Chip** | 🟢 | Filtros, tags de sintoma |
| **Avatar** | 🟡 | Pra mostrar médico vinculado |
| **Divider** | 🟢 | Visual, com label opcional |
| **Toast** | 🟢 | Feedback de ação (não bloqueante) |
| **Modal** | 🟢 | Confirmação, escolha simples |
| **BottomSheet** | 🟢 | Ações secundárias, picker |
| **ProgressBar** | 🟢 | Onboarding (4 pontos), progresso de peso |

#### 3.2 Compostos por feature

##### Home (`/components/home/`)

| Componente | Prioridade | Função |
|---|---|---|
| `QuickMoodCheckin` | 🟢 | 5 botões grid 2x3 (péssimo/mal/ok/bem/ótimo) — 1 tap |
| `NextDoseCard` | 🟢 | Próxima dose com contagem regressiva, botão "Registrar" |
| `WeightProgressBlock` | 🟢 | Peso atual + delta + mini gráfico + label motivacional |
| `DailyInsightCard` | 🟢 | Insight IA do dia com badge "IA" + disclaimer |
| `NextReportCard` | 🟢 | Próximo relatório (já gerou X dias, faltam Y) |
| `AIProactiveQuestion` | 🟢 | Card de pergunta proativa quando padrão detectado |

##### Doses (`/components/doses/`)

| Componente | Prioridade | Função |
|---|---|---|
| `DoseListItem` | 🟢 | Linha de histórico (data, mg, local, status) |
| `NextDoseLarge` | 🟢 | Card hero da próxima dose |
| `LogDoseSheet` | 🟢 | Bottom sheet pra registrar nova dose |
| `CostBreakdown` | 🟢 | Sub-seção de Doses — custo do tratamento |

##### Diário (`/components/diario/`)

| Componente | Prioridade | Função |
|---|---|---|
| `SymptomLogCard` | 🟢 | Sintoma com intensidade visualizada |
| `AddSymptomSheet` | 🟢 | Bottom sheet pra registrar sintoma |
| `QuestionForDoctorCard` | 🟢 | Pergunta pra próxima consulta |
| `AddQuestionSheet` | 🟢 | Bottom sheet (texto + voz opcional) |

##### Relatórios (`/components/relatorios/`)

| Componente | Prioridade | Função |
|---|---|---|
| `ReportListItem` | 🟢 | Linha de relatório gerado (período, status) |
| `ReportPreviewPager` | 🟢 | Visualização dual (paciente / médico) |
| `ShareReportSheet` | 🟢 | Compartilhar PDF (e-mail, WhatsApp, AirDrop) |

##### Paywall (`/components/paywall/`)

| Componente | Prioridade | Função |
|---|---|---|
| `PaywallHero` | 🟢 | Hero com Liquid Glass + valor da mensagem |
| `PlanCardRow` | 🟢 | Mensal vs anual com price anchor |
| `FeatureList` | 🟢 | Lista do que destrava no premium |
| `TrustSignals` | 🟢 | "Sem cobrança automática misteriosa", "Cancele com 1 tap" |

---

### 4. Variants do componente-chave: Button

| Variant | Visual | Uso |
|---|---|---|
| **primary** | Background brand.primary, texto inverse | Ação principal da tela |
| **primary-glass** | Liquid Glass + tint brand.primary | Botão de tab bar, paywall confirm, splash CTA |
| **secondary** | Border 1px brand.primary, texto brand.primary, bg transparente | Ação secundária |
| **ghost** | Sem border, texto brand.primary, bg transparente | Link inline, "Saiba mais" |
| **destructive** | Background semantic.critical, texto text.primary | Cancelar assinatura, deletar dados |
| **disabled** | bg.surface, texto text.disabled | Estado inválido |

### 5. States do Button

| State | Descrição | Comportamento |
|---|---|---|
| Default | Estado padrão | Aguarda interação |
| Pressed | Tap em curso | Background `.dim`, scale 0.97, motion.instant |
| Loading | Operação em curso | Spinner inline, label "Carregando..." ou contextual ("Salvando dose...") |
| Disabled | Não interativo | Opacity 0.30, não responde a tap |
| Success (transient) | Após ação bem-sucedida | Background semantic.positive por 1s, depois volta |
| Error (transient) | Após falha | Background semantic.critical por 1.5s + toast |

---

### 6. Tokens usados (referência cruzada)

Cada componente declara quais tokens consome. Exemplo Button (primary):

```ts
{
  background: 'brand.primary',
  text: 'text.inverse',
  padding: 'space.md space.lg',
  radius: 'radius.md',
  font: 'type.label-button',
  shadow: 'elevation.1',
  motion: { press: 'motion.instant', loading: 'motion.standard' }
}
```

**Princípio:** componentes NUNCA usam valor literal (hex, pt, ms). Sempre token. Drift começa aqui.

---

### 7. Acessibilidade (vai pro `/impeccable audit`)

| Critério | Padrão |
|---|---|
| Contraste texto/bg | Mínimo 4.5:1 (WCAG AA), 7:1 quando possível |
| Tamanho de toque | Mínimo 44x44pt (HIG) |
| VoiceOver | Todo componente interativo tem `accessibilityLabel` + `accessibilityHint` |
| Dynamic Type | Suporta até `accessibility5` (200%) sem quebrar layout |
| Reduce Motion | Motion sensíveis desativam quando `prefersReducedMotion === true` |
| Cor não-comunicativa | Estado nunca depende SÓ de cor (sintoma intenso tem cor + ícone + label) |
| Foco visível | Estado `pressed` claramente diferente |
| Idioma | `accessibilityLanguage="pt-BR"` por padrão |

---

### 8. Regras especiais

#### 8.1 A regra do glass

Glass aplica APENAS em:
- Tab bar
- Toolbar de navegação
- Header de modal/sheet
- Botão primário em paywall
- Splash screen
- Welcome screen (1ª tela do onboarding)

Glass NUNCA aplica em:
- Card de dado clínico
- Lista de doses, sintomas, perguntas
- Texto corrido (descrição, body)
- Gráfico
- Relatório bilíngue
- Estados de erro

#### 8.2 A regra do "ação necessária"

Banner "Ação necessária" da V4 cria pressão clínica falsa. Removido da V5. Em vez disso:

| Antes (V4) | Depois (V5) |
|---|---|
| "Ação necessária — Seu médico precisa de você hoje" | "Como você está hoje?" |
| Vermelho saturado + ícone de alerta | Neutro, calmo |
| Implica obrigação | Convida resposta |

#### 8.3 A regra do disclaimer IA

Todo output de IA tem disclaimer fixo no rodapé:
> *Este conteúdo não substitui orientação médica. Sempre consulte sua endo ou outro profissional habilitado.*

Aparece em: insight do dia, relatório, antecipação de efeitos, tradução da consulta.

#### 8.4 A regra do "sem coaching scriptado"

Anti-Noom positioning. Copy do app evita:
- Frases motivacionais genéricas ("Você consegue!", "Continue assim!")
- Streaks visíveis com pressão ("Você quebrou sua sequência de 7 dias")
- Coaching humano fake

Copy do app prefere:
- Reconhecimento factual ("Você registrou peso 4 vezes nesta semana")
- Insight informativo ("70% dos pacientes nessa fase relatam X")
- Convite, não obrigação ("Quer registrar agora?")

---

### 9. Decisões fixadas (Léo, 14/mai/2026)

As 7 perguntas que eram open questions agora estão decididas:

| # | Decisão | Detalhe |
|---|---|---|
| 1 | **Paleta:** verde-menta `#00D4AA` + **azul-grafite** (sem violeta) | Define `bg.base`, `bg.elevated`, `bg.surface` |
| 2 | **Splash com Liquid Glass leve** | Único momento de glass acentuado fora de navegação. Marca a identidade na entrada |
| 3 | **Dark-only no V5.0** | Light entra como tarefa futura. Foco em capturar diferencial Liquid Glass primeiro |
| 4 | **Share-sheet nativo iOS** | Não amarra usuário a WhatsApp ou outro canal. Respeita autonomia |
| 5 | **Warning `#FFB347` mantido** | Validar visualmente quando aparecer no mockup. Ajusta se necessário |
| 6 | **Tipografia: alias "system" (não "SF Pro" literal)** | Apple recomenda. Pega atualizado automático em futuras versões de iOS |
| 7 | **Tab bar com ícone + texto** | Acessibilidade + credibilidade clínica. Não regredir pra ícone-only |

Todas essas decisões alimentam o `/impeccable teach` no Prompt 02 — gerar PRODUCT.md + DESIGN.md já consistentes.

---

### 10. Como esse preview vira o DESIGN.md final

Este documento é PREVIEW. O DESIGN.md final segue o **formato Impeccable 6-seções**:

1. **Overview** — register (product), audience, anti-references, design principles
2. **Colors** — todos os tokens de cor com hex + uso
3. **Typography** — todos os tokens de type + família + uso
4. **Elevation** — sombras, glass, borders
5. **Components** — primitivos + compostos com variants e states
6. **Do's and Don'ts** — regras especiais traduzidas como par "✅ Faça / ❌ Não faça"

O Prompt 02 (`02-MID-criar-product-design-md`) vai rodar `/impeccable teach`, que entrevista o Claude Code e gera PRODUCT.md + DESIGN.md alinhados a este preview. Depois disso, este `design-system-preview.md` pode ser arquivado ou virar histórico.

---

**Fim do documento.**
