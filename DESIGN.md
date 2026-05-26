---
name: DoseDay V5
tagline: Memória inteligente do tratamento com canetas emagrecedoras (GLP-1)
audience:
  primary: Mariana — 30-55 anos, brasileira, paciente GLP-1 (Mounjaro, Ozempic, Wegovy, Saxenda), leiga em tecnologia, valoriza organização sem burocracia
  context: Tratamento ambulatorial entre consultas. App usado em casa, no consultório, ou ao mostrar histórico para profissional de saúde
  language: pt-BR (default), en/es opt-in
platform:
  primary: iOS 17+ (Liquid Glass exige iOS 26+)
  stack: React Native + Expo SDK 54+
  appearance: Dark mode obrigatório como default
north-star: "Seu tratamento está organizado até aqui."
positioning: Memória organizada entre consultas — não prontuário médico, não diário motivacional, não tracker genérico
colors:
  bg-base: "#050B12"
  bg-elevated: "#0E1620"
  bg-surface: "#1B2433"
  brand: "#00D4AA"
  brand-dim: "#00B894"
  mint-soft: "#A3E6D2"
  semantic-positive: "#00D4AA"
  semantic-warning: "#FFB347"
  semantic-critical: "#E64545"
  semantic-info: "#5BA8D9"
  semantic-muted: "#5C6878"
  text-primary: "#F2F4F7"
  text-secondary: "#9CA8B8"
  text-tertiary: "#6B7280"
  text-inverse: "#050B12"
  text-brand: "#00D4AA"
  clinical-weight: "#00D4AA"
  clinical-dose: "#5BA8D9"
  clinical-mild: "#7DD3A0"
  clinical-moderate: "#FFB347"
  clinical-severe: "#E64545"
typography:
  display:
    fontFamily: system
    fontSize: 32
    fontWeight: 700
    lineHeight: 38
  display-ultralight:
    fontFamily: system
    fontSize: 28
    fontWeight: 300
    lineHeight: 34
  headline:
    fontFamily: system
    fontSize: 28
    fontWeight: 600
    lineHeight: 34
  title:
    fontFamily: system
    fontSize: 22
    fontWeight: 600
    lineHeight: 28
  subtitle:
    fontFamily: system
    fontSize: 18
    fontWeight: 600
    lineHeight: 24
  body:
    fontFamily: system
    fontSize: 16
    fontWeight: 400
    lineHeight: 22
  body-clinical:
    fontFamily: system
    fontSize: 15
    fontWeight: 400
    lineHeight: 24
  label:
    fontFamily: system
    fontSize: 16
    fontWeight: 600
    lineHeight: 20
  caption:
    fontFamily: system
    fontSize: 13
    fontWeight: 400
    lineHeight: 18
  tab-label:
    fontFamily: system
    fontSize: 11
    fontWeight: 500
    lineHeight: 14
  number-large:
    fontFamily: system
    fontSize: 40
    fontWeight: 700
    lineHeight: 48
  number-personal:
    fontFamily: system
    fontSize: 48
    fontWeight: 300
    lineHeight: 54
  number-medium:
    fontFamily: system
    fontSize: 28
    fontWeight: 700
    lineHeight: 34
  mono-data:
    fontFamily: "SF Mono, monospace"
    fontSize: 14
    fontWeight: 400
    lineHeight: 20
rounded:
  xs: 6
  sm: 10
  md: 14
  lg: 20
  xl: 28
  full: 9999
spacing:
  xxs: 4
  xs: 8
  sm: 12
  md: 16
  lg: 24
  xl: 32
  xxl: 48
  xxxl: 64
elevation:
  e0: { shadowOpacity: 0, shadowRadius: 0 }
  e1: { shadowOpacity: 0.20, shadowRadius: 2 }
  e2: { shadowOpacity: 0.30, shadowRadius: 12 }
  e3: { shadowOpacity: 0.45, shadowRadius: 32 }
  glass: "iOS 26 native .glassEffect() — navigation layer only"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.md}"
    typography: "{typography.label}"
    padding: "16px 24px"
    haptic: "medium on tap"
  button-secondary:
    backgroundColor: transparent
    borderColor: "{colors.brand}"
    borderWidth: 1
    textColor: "{colors.brand}"
    rounded: "{rounded.md}"
    typography: "{typography.label}"
    padding: "15px 23px"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.brand}"
    rounded: "{rounded.md}"
    typography: "{typography.label}"
    padding: "16px 24px"
  button-destructive:
    backgroundColor: "{colors.semantic-critical}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    typography: "{typography.label}"
    padding: "16px 24px"
  card-default:
    backgroundColor: "{colors.bg-elevated}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    border: "0.5px rgba(255,255,255,0.06)"
  card-clinical:
    backgroundColor: "{colors.bg-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    elevation: "{elevation.e1}"
    border: "1px rgba(255,255,255,0.10)"
  input-text:
    backgroundColor: "{colors.bg-elevated}"
    rounded: "{rounded.sm}"
    typography: "{typography.body}"
    padding: "12px 16px"
    border: "0.5px rgba(255,255,255,0.08)"
  settings-row:
    height: 44
    paddingVertical: 14
    paddingHorizontal: 16
    leadingIcon: "SF Symbol outline, 16-20pt, semantic-muted"
    label: "{typography.body}"
    trailingChevron: "SF Symbol chevron.right, 14pt, semantic-muted"
    pressed:
      backgroundColor: "{colors.bg-surface}"
  sheet-form:
    presentation: "iOS Form Sheet (formSheet) with detents [0.5, 1.0] OR 'fitToContents'"
    cornerRadius: 20
    grabber: visible
    dismissable: "swipe-down + X button"
    backdrop: "parent dashboard visible behind (peek)"
---

# Design System: DoseDay V5

## 0. Persona & Context

**Primary user — Mariana:**

- 30-55 anos, brasileira
- Em tratamento com caneta emagrecedora GLP-1 (Mounjaro, Ozempic, Wegovy, Saxenda, Poviztra)
- Não-técnica. Usa iPhone como ferramenta diária, não como hobby
- Quer organização sem precisar virar enfermeira de si mesma
- Reconhece quando um app é feito com cuidado (vs templates genéricos)
- Compartilha histórico com médico em consultas trimestrais

**Job-to-be-done:**

> "Quero lembrar o que aconteceu entre consultas — doses, peso, sintomas, custos — sem virar um exercício de digitação chato."

**Anti-personas:**

- Não é tracker quantified-self. Não obsessivo com métricas.
- Não é wellness coach. Não busca motivação.
- Não é médico. Não toma decisões clínicas dentro do app.

---

## 1. Creative North Star: "The Clinical Memory"

DoseDay é uma ferramenta clínica que parece um diário pessoal. A base visual é sólida, densa e controlada — alto contraste, tipografia assertiva, dados que ocupam espaço com autoridade. Não tentamos parecer um app de wellness. Não tentamos parecer um prontuário digital. Somos a memória entre os dois: o que o paciente viveu, organizado para que o profissional de saúde entenda em 2 minutos.

O único momento de glamour é intencional e restrito: a navegação em Liquid Glass (iOS 26). Tab bar, toolbar, splash — esses são os 30% que podem brilhar. Os outros 70% são sobriedade clínica pura. Essa dicotomia não é inconsistência de design — é posicionamento.

**Frase de norte na Home:** "Seu tratamento está organizado até aqui."

**Key characteristics:**

- Sobriedade clínica como estado padrão de toda superfície de conteúdo
- Liquid Glass exclusivo de camada de navegação
- Verde-menta (`#00D4AA`) como sinal de vida ativo, nunca decoração
- SF Pro (`system`) como única família tipográfica
- Profundidade via camadas tonais, não via sombra decorativa
- Cor semântica estrita: positivo, alerta, crítico, informativo

**O que este sistema explicitamente rejeita:**

- Gradiente roxo + rosa wellness genérico (V4)
- Mockups 3D flutuantes / agência sem propósito
- Glass em conteúdo clínico (trust-breaker)
- Gamificação visual (streaks, badges, animações de celebração)
- Visual tipo Noom, Duolingo, ou wellness illustration stock

---

## 2. Colors: The Clinical Midnight Palette

Três backgrounds progressivamente mais claros criam hierarquia sem sombra. Uma cor de marca aparece em menos de 10% de qualquer tela — sua raridade é o ponto.

### Primary

- **Vital Mint** (`#00D4AA`): Cor de marca. Botão primário, estado ativo de tab, accent positivo, linha de peso no gráfico. **Nunca** como background de card, **nunca** como texto corrido, **nunca** em área clínica neutra.
- **Vital Mint Dim** (`#00B894`): Variante pressed/hover do primary.
- **Mint Soft** (`#A3E6D2`): Indicador discreto de estado atual em dado pessoal (ex.: ponto final do sparkline de peso).

### Semantic

- **Warm Amber** (`#FFB347`): Atenção moderada (sintoma 4-6/10, aviso de dado incompleto).
- **Alert Red** (`#E64545`): Emergência clínica real ou ação destrutiva (excluir conta).
- **Clinical Blue** (`#5BA8D9`): Informação neutra de referência.
- **Muted Slate** (`#5C6878`): Estado desativado, item secundário, chevron, ícones discretos.

### Neutral

- **Clinical Midnight** (`#050B12`): Background base de todas as telas. Azul-grafite profundo (não preto puro).
- **Elevated Surface** (`#0E1620`): Cards, modais, inputs.
- **Data Surface** (`#1B2433`): Cards de dado clínico, tabelas, gráficos.
- **Primary Text** (`#F2F4F7`): Texto principal — branco quente.
- **Secondary Text** (`#9CA8B8`): Subtítulo, metadado, label.
- **Tertiary Text** (`#6B7280`): Hint, placeholder, data antiga.
- **Inverse Text** (`#050B12`): Único uso de texto escuro — sobre botão Vital Mint.

### Named Rules — Cores

**The Vital Mint Rarity Rule.** Vital Mint (`#00D4AA`) aparece em ≤10% de qualquer tela. Sua raridade é o que o torna poderoso.

**The Mint Soft State Rule.** Mint Soft (`#A3E6D2`) é permitido somente como indicador discreto de estado atual em dado pessoal já exibido, especialmente o ponto final do sparkline de peso.

**The Destructive Action Rule.** Alert Red (`#E64545`) também serve para ações irreversíveis (excluir conta, deletar dados). Nunca como destaque decorativo.

**The Semantic Integrity Rule.** Cor semântica não é reutilizada para fins decorativos. Alert Red em badge de marketing é bug.

---

## 3. Typography: SF Pro System-Only

**Display Font:** SF Pro (alias `system`)
**Body Font:** SF Pro (alias `system`)
**Data Mono Font:** SF Mono — apenas para tabelas de dado clínico

Uma família única em dois pesos extremos. Bold para números clínicos (peso, dose, delta), Regular para corpo de texto. Hierarquia declarada pelo peso e tamanho, nunca por família diferente.

### Hierarchy

- **Display** (Bold 32pt): Headline de tela-marco (welcome, paywall hero, relatório). Máximo 2-3 palavras.
- **Display Ultralight** (Light 28pt): Header emocional e calmo em tela pessoal (frase-norte da Home).
- **Headline** (Semibold 28pt): Título de tela padrão.
- **Title** (Semibold 22pt): Seção dentro de tela.
- **Subtitle** (Semibold 18pt): Sub-seção, card de destaque.
- **Body** (Regular 16pt): Texto padrão de conteúdo.
- **Body Clinical** (Regular 15pt, line-height 24): Relatório bilíngue, texto médico denso.
- **Label** (Semibold 16pt): Texto de botão, tab ativa.
- **Caption** (Regular 13pt): Metadado, footer, data, disclaimer.
- **Tab Label** (Medium 11pt): Exclusivo de tab bar.
- **Number Large** (Bold 40pt): Peso atual, dose principal.
- **Number Personal** (Light 48pt): Dado corporal pessoal na Home (peso atual).
- **Number Medium** (Bold 28pt): Delta de peso, valor secundário de dose.
- **Mono Data** (Regular SF Mono 14pt): Tabelas de cronologia clínica.

### Named Rules — Typography

**The Number-First Rule.** Em card de dado clínico, o número precede e domina o label. Number Large/Medium ≥ 2× o tamanho do label adjacente.

**The System-Only Rule.** Nunca usar string literal `"SF Pro"` em código — usar `system` (ou `-apple-system` em web).

**The Weight-Is-Importance Rule.** Bold = dado crítico. Semibold = label de seção. Regular = conteúdo explicativo. Medium = suporte de interface.

**The Ultralight-Is-Personal Rule.** Ultralight é exceção deliberada para dado próprio e emocionalmente sensível (peso na Home), não para dado clínico de referência.

---

## 4. Elevation: Flat by Default

Profundidade primária via **camadas tonais de background** (bg-base → bg-elevated → bg-surface). Sombras reais reservadas para elementos genuinamente flutuantes (modais, sheets, FAB). Glass é categoria separada — exclusivamente para camada de navegação iOS 26.

### Shadow Vocabulary

- **e0** (sem sombra): Estado padrão de toda superfície.
- **e1** (`0 1px 2px rgba(0,0,0,0.20)`): Card padrão que precisa de separação sutil.
- **e2** (`0 4px 12px rgba(0,0,0,0.30)`): Card flutuante / floating action.
- **e3** (`0 12px 32px rgba(0,0,0,0.45)`): Modal, bottom sheet.
- **glass** (`.glassEffect()` nativo iOS 26): Tab bar, toolbar, header de modal, paywall hero, splash.

### Named Rules — Elevation

**The Flat-By-Default Rule.** Toda superfície nasce plana (`e0`). Sombra é adicionada apenas quando o elemento precisa comunicar que está acima de outro.

**The Glass-Navigation-Only Rule.** Glass aplica exclusivamente em: tab bar, toolbar, header de modal/sheet, botão de paywall, splash. Proibido em: card clínico, lista, texto, gráfico, relatório.

**The Tonal Layering Rule.** Antes de adicionar sombra a um card, tente usar `bg-elevated` em vez de `bg-base`. Reserve sombras para quando a camada tonal não basta.

**The 30% Glass Rule.** Glass aplica em no máximo 30% da área visível de qualquer tela.

---

## 5. Components

### Buttons

- **Primary:** Background `brand` (#00D4AA), texto `text-inverse` (#050B12), `rounded.md`, padding 16×24, fonte `label`. Haptic medium on tap. Pressed: `brand-dim`, scale 0.97.
- **Primary-Glass:** Liquid Glass + tint Vital Mint 8%. Exclusivo de paywall CTA e splash.
- **Secondary:** Border 1px `brand`, background transparente, texto `brand`.
- **Ghost:** Transparente, texto `brand`, sem border. Links inline, ações terciárias.
- **Destructive:** Background `semantic-critical` (#E64545). Apenas ações irreversíveis.
- **Disabled:** Background `bg-surface`, texto opacity 0.30.

### Cards

- **Card Default** (`bg-elevated`): Lista padrão. Padding `spacing.md`. Border `0.5px rgba(255,255,255,0.06)`.
- **Card Elevated** (`bg-surface`): Dashboard hero — NextDoseCard, WeightProgressBlock. Rounded `radius.lg`.
- **Card Clinical Data** (`bg-surface` + `e1` + border): Dado clínico quantitativo com gráfico. Única exceção ao Flat-By-Default.

### Inputs

- **Style:** `bg-elevated`, border `0.5px rgba(255,255,255,0.08)`, rounded `sm`, padding 12×16, fonte `body`.
- **Focus:** Border muda para `1px brand`.
- **Error:** Border `1px semantic-critical`, label de erro abaixo explicando causa + ação de recuperação.
- **Floating label:** Sobe para `Caption` acima quando ativo.

### Settings Row (lista agrupada iOS-native)

- Height 44pt mínimo, paddingVertical 14, paddingHorizontal 16
- Ícone outline SF Symbol 16-20pt em `semantic-muted` (cinza), à esquerda
- Label `body` Regular ao centro
- Chevron `chevron.right` SF Symbol 14pt em `semantic-muted` à direita
- Pressed: background `bg-surface` (#1B2433)
- Hairline separator interno: `StyleSheet.hairlineWidth` em `rgba(255,255,255,0.06)`
- Destructive variant: texto em `semantic-critical` (excluir conta)

### Sheet (Form Sheet iOS-native)

- Presentation: `'formSheet'` do Expo Router 6+
- Detents: `[0.5, 1.0]` para sheets com input livre · `'fitToContents'` para forms curtos
- Corner radius: 20pt
- Drag handle nativo iOS, visível
- Dismissable via swipe-down + botão X no canto superior esquerdo
- Backdrop: dashboard parent visível atrás (peek), não preto opaco
- Header: título centralizado em `title` (Semibold 22pt)
- Body: padding `spacing.lg`
- Footer: CTA primary fixo no rodapé

### Navigation: GlassBar

Tab bar (5 tabs) em iOS 26+ usa `expo-glass-effect` `GlassView` nativo, `glassEffectStyle="regular"`. Em iOS <26 e Android, fallback `expo-blur` `BlurView`. Ícone SF Symbol + label `tab-label` (11pt Medium). Tab ativa: ícone e label em `text-brand`. Tab inativa: `text-secondary`.

---

## 6. Layout Patterns

### Home v7 — Memória do tratamento (single screen)

Tela única vertical, sem tabs internas. Ordem dos blocos:

1. **Header de memória** — frase-norte ("Seu tratamento está organizado até aqui.") + data atual em `caption`
2. **PRÓXIMA DOSE** (card interativo) — eyebrow uppercase + Number Personal + helper + chevron direita. Tap → `/perfil/protocolo`. Header tem `+` SF Symbol pra abrir sheet Anotar Dose.
3. **PESO** (card interativo) — eyebrow uppercase + delta em `caption` + Number Personal + sparkline real (8 pontos max, dot final em mint-soft) + chevron direita. Tap → `/peso/historico`. Header tem `+`.
4. **NOTAS RECENTES** (timeline read-only) — eyebrow + lista vertical com dot indicator + label de tempo + texto factual. Header tem `+`.
5. **SINTOMAS** (read-only) — eyebrow + último sintoma registrado em card discreto. Header tem `+`.
6. **PARA A CONSULTA** (read-only, opcional) — lista de itens para próxima consulta.
7. **CUSTOS REGISTRADOS** (condicional, só se count > 0) — total em `caption`. Header tem `+`.
8. **Disclaimer** — "Este conteúdo organiza seus registros e não substitui uma conversa com um profissional de saúde."

### Sheets de Captura (Anotar Dose, Peso, Nota, Sintoma, Custo)

Todos via Form Sheet (ver §5 Components > Sheet). Detents calibrados:

| Sheet | Detent | Razão |
|---|---|---|
| Anotar dose | `[0.7, 1.0]` | Form longo (medicamento + dose + datetime + local + observações) |
| Anotar peso | `'fitToContents'` | Form curto (número + data + notes opcional) |
| Anotar sintoma | `[0.5, 1.0]` | Textarea + chips "Frequentes" — precisa altura ajustável |
| Anotar nota | `[0.5, 1.0]` | Textarea grande |
| Anotar custo | `[0.5, 1.0]` | R$ + descrição multiline |

### Settings Hub (`/configuracoes`)

Lista agrupada iOS-native (estilo Shotsy/Apple Settings). 6 grupos em cards `bg-elevated`:

1. **Conta** — Email, Sua assinatura (RevenueCat)
2. **Tratamento** — Medicamento, Protocolo de dose, Peso meta, Acompanhamento médico (segmented control yes/sometimes/no), Preocupações, Próxima consulta
3. **Lembretes** — Notificações de dose (toggle), Horário (time picker)
4. **Dados** (LGPD) — Exportar JSON (expo-sharing), Histórico de consentimento, **Excluir minha conta** (destructive, confirmação dupla)
5. **Privacidade** — Política, Termos, Compartilhamento de dados
6. **Suporte** — Sobre, FAQ, Contate-nos, Avalie (StoreReview), Compartilhar (Share API)

Footer global em todas as telas filhas: `Termos · Versão X.Y.Z · Política`

**Zero mint em Settings** (§Vital Mint Rarity).

---

## 7. Microcopy & Tone

### Voz

| Característica | Direção |
|---|---|
| Tom | Calmo, clínico sem hospital, respeitoso |
| Pessoa | Você (PT-BR), 3ª pessoa em contexto clínico |
| Comprimento | Curto. Sem prosa motivacional. |
| Linguagem | Direto, sem jargão técnico. Se jargão usado, explicado em 1 frase. |

### Vocabulário canônico (decisões §11.3 PRODUCT_COHERENCE.md)

| Conceito interno | UI visível |
|---|---|
| `quick_logs` com `log_type='other'` | "Nota" / "Notas recentes" (substitui "Memória") |
| `symptom_logs` | "Sintoma" / "Sintomas" (substitui "Observações") |
| `purchases` | "Custo" / "Custos registrados" |
| `medication_applications` | "Dose" / "Próxima dose" |
| `weight_logs` | "Peso" / "Histórico de peso" |
| Frase de norte do produto | "Memória organizada do tratamento" |

### Anti-vocabulário (proibido)

- "Diagnóstico", "prescrição", "recomendação médica" — compliance ANVISA/Apple Medical
- "Parabéns!", "Você consegue!", "Transforme sua vida!" — anti-Noom
- "Você quebrou sua sequência" — gamificação fake
- "Ação necessária — Seu médico precisa de você hoje" — pressão clínica falsa
- "Loading...", "OK", "Confirmar" — copy genérica
- Causalidade dose-sintoma ("Esta dose causou náusea") — compliance ANVISA

### Disclaimer obrigatório

Em todo output gerado por IA e no rodapé da Home:

> "Este conteúdo organiza seus registros e não substitui uma conversa com um profissional de saúde."

---

## 8. Do's and Don'ts

### Do

- Usar `#050B12` como background base de todas as telas. Nunca `#000000`.
- Reservar Vital Mint (`#00D4AA`) para ≤10% de qualquer tela.
- Usar glass APENAS em tab bar, toolbar, header de navegação, paywall hero, splash.
- Nomear superfícies por papel semântico nos tokens.
- Number Large/Medium para valor principal de qualquer card clínico — número lidera.
- Mensagens de erro com causa + ação de recuperação ("Não consegui salvar. Sem internet?").
- `accessibilityLabel` + `accessibilityHint` em todo componente interativo.
- Desativar animações sensíveis quando `prefersReducedMotion === true`.
- Usar `system` em todo `fontFamily`.
- Touch target ≥ 44pt em todos os elementos interativos.
- Haptic medium no submit dos sheets (via prop opcional em `AuthButton`).
- Press feedback (scale 0.98 + opacity 0.85) em cards tapáveis.

### Don't

- Aplicar glass em card clínico, lista, texto, gráfico, relatório.
- Usar gradiente roxo + rosa (V4 banido).
- Mockups 3D flutuantes / cards atravessando a tela.
- Alert Red como cor de destaque decorativa.
- Streak ou sequência com pressão ("Você quebrou sua sequência").
- Copy motivacional ("Você consegue!", "Continue assim!").
- Texto de botão genérico ("OK", "Confirmar"). Todo botão diz o que acontece.
- "Diagnóstico", "prescrição", "recomendação médica" em qualquer copy.
- Fotos stock de modelos felizes / ilustrações wellness cartoonescas.
- Fonte custom — SF Pro é o iOS.
- Sombra decorativa em cards de lista.
- Chips engessados como input primário (texto livre + sugestões adaptativas opcionais).
- Tab bar como navegação primária do app (vai sair via PR Gear Icon — gear no header da Home aponta pra `/configuracoes`).

---

## 9. North Star & Outcomes

### Outcome 1 — Captura sem fricção

Paciente registra dose, peso, sintoma, nota ou custo em < 15 segundos. Texto livre primário. Sheets ancorados no fundo mantém dashboard visível atrás (não quebra contexto).

### Outcome 2 — Memória organizada

Timeline factual de eventos (sem causalidade, sem interpretação clínica). "Dose 5mg administrada · há 3 dias" — não "Dose 5mg causou náusea".

### Outcome 3 — Hub de personalização

Configurações como hub completo — não só "ajustes do app", mas controle do próprio tratamento (medicamento, protocolo, peso meta, médico, preocupações, próxima consulta).

### Outcome 4 — Saída clínica fluída

Em < 2 minutos, profissional de saúde vê histórico organizado: doses, pesos, sintomas, custos, notas para consulta. Pro feature: resumo gerado por IA (sem orientação médica, só agrupamento factual).

### Outcome 5 — Liquid Glass como assinatura

Tab bar e header com Liquid Glass iOS 26 — o único momento de glamour intencional. Conteúdo permanece sobriedade clínica.

---

## 10. Anti-references (não inspirar)

| App | Por quê NÃO replicar |
|---|---|
| **Noom** | Motivacional excessivo, gamificação fake |
| **Voy** (UK/US GLP-1) | Coach speak, IA generativa dando conselho — viola compliance |
| **MyFitnessPal** | Data overload, complexo demais |
| **NovoCare** (Novo Nordisk oficial) | Frio, médico-first, sem cuidado com paciente |
| **Healthi** (BR) | Wellness genérico, sem foco GLP-1 |
| **Duolingo** | Streaks, badges, animações de celebração |

## 11. References (inspirar parcialmente)

| App | O que aprender |
|---|---|
| **Shotsy** (US GLP-1) | Lista agrupada Settings iOS-native · captura simples |
| **Apple Health** | Tipografia sóbria · número como herói · cores semânticas estritas |
| **Apple Notes** | Texto livre como input primário · zero fricção |
| **Things 3** | Hierarquia visual via spacing e peso, não chrome |

---

## 12. Implementation notes

- Stack: React Native + Expo SDK 54+
- Routing: Expo Router 6+ (file-based)
- UI iOS-nativa: `@expo/ui` + Liquid Glass (iOS 26+)
- Estado servidor: React Query (queries versionadas tipo `'protocol-v2'`)
- Estado cliente: Context API
- Validação: Zod
- Backend: Supabase (RLS obrigatória em todas as tabelas)
- IA: OpenAI SDK via Edge Function Deno (Structured Outputs com JSON schema)
- Pagamento: RevenueCat (trial 14 dias)
- Push: Expo Notifications
- i18n: i18next (pt-BR default)
- Analytics: PostHog
- Crash: Sentry

**Compliance:**

- LGPD: exportação de dados (JSON) + histórico de consentimento + exclusão de conta (confirmação dupla via Edge Function `delete-user-account`)
- ANVISA RDC 96/2008: zero claims médicos · zero causalidade dose-sintoma · disclaimer obrigatório em todo output IA
- Apple App Review Guidelines: §1.4 Safety Medical · §4.3 Spam · §5.1.1 Data Collection

---

> Source of truth normativa do design system do DoseDay V5.
> Atualizado: 2026-05-26.
> Use este arquivo como input para Stitch (Google), Claude Design (Anthropic), Antigravity, Claude Code, ou qualquer ferramenta de geração de UI que respeite o formato `DESIGN.md`.
