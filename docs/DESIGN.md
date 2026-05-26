---
name: DoseDay V5
description: Memória inteligente do tratamento com canetinhas emagrecedoras (GLP-1)
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
  destructive: "#FF453A"
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
    fontFamily: "system"
    fontSize: "32"
    fontWeight: 700
    lineHeight: "38"
  display-ultralight:
    fontFamily: "system"
    fontSize: "28"
    fontWeight: 300
    lineHeight: "34"
  headline:
    fontFamily: "system"
    fontSize: "28"
    fontWeight: 600
    lineHeight: "34"
  title:
    fontFamily: "system"
    fontSize: "22"
    fontWeight: 600
    lineHeight: "28"
  subtitle:
    fontFamily: "system"
    fontSize: "18"
    fontWeight: 600
    lineHeight: "24"
  body:
    fontFamily: "system"
    fontSize: "16"
    fontWeight: 400
    lineHeight: "22"
  body-clinical:
    fontFamily: "system"
    fontSize: "15"
    fontWeight: 400
    lineHeight: "24"
  label:
    fontFamily: "system"
    fontSize: "16"
    fontWeight: 600
    lineHeight: "20"
  caption:
    fontFamily: "system"
    fontSize: "13"
    fontWeight: 400
    lineHeight: "18"
  tab-label:
    fontFamily: "system"
    fontSize: "11"
    fontWeight: 500
    lineHeight: "14"
  number-large:
    fontFamily: "system"
    fontSize: "40"
    fontWeight: 700
    lineHeight: "48"
  number-personal:
    fontFamily: "system"
    fontSize: "48"
    fontWeight: 300
    lineHeight: "54"
  number-medium:
    fontFamily: "system"
    fontSize: "28"
    fontWeight: 700
    lineHeight: "34"
  mono-data:
    fontFamily: "SF Mono, monospace"
    fontSize: "14"
    fontWeight: 400
    lineHeight: "20"
rounded:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "20px"
  xl: "28px"
  full: "9999px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  xxxl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.md}"
    typography: "{typography.label}"
    padding: "16px 24px"
  button-primary-hover:
    backgroundColor: "{colors.brand-dim}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.md}"
    typography: "{typography.label}"
    padding: "16px 24px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.brand}"
    rounded: "{rounded.md}"
    typography: "{typography.label}"
    padding: "15px 23px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.brand}"
    rounded: "{rounded.md}"
    typography: "{typography.label}"
    padding: "16px 24px"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    typography: "{typography.label}"
    padding: "16px 24px"
  card-default:
    backgroundColor: "{colors.bg-elevated}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  card-clinical:
    backgroundColor: "{colors.bg-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  input-text:
    backgroundColor: "{colors.bg-elevated}"
    rounded: "{rounded.sm}"
    typography: "{typography.body}"
    padding: "12px 16px"
---

# Design System: DoseDay V5

## 1. Overview: The Clinical Memory

**Creative North Star: "The Clinical Memory"**

DoseDay é uma ferramenta clínica que parece um diário pessoal. A base visual é sólida, densa e controlada — alto contraste, tipografia assertiva, dados que ocupam espaço com autoridade. Não tentamos parecer um app de wellness. Não tentamos parecer um prontuário digital. Somos a memória entre os dois: o que o paciente viveu, organizado para que o profissional de saúde entenda em 2 minutos.

O único momento de glamour é intencional e restrito: a navegação em Liquid Glass (iOS 26). Tab bar, toolbar, splash — esses são os 30% que podem brilhar. Os outros 70% são sobriedade clínica pura. Essa dicotomia não é inconsistência de design — é posicionamento. Mariana usa iPhone 13+, valoriza o iOS nativo, e reconhece instantaneamente que esse app cuida dos detalhes dela com o mesmo cuidado que ela dedica ao tratamento.

O que este sistema explicitamente rejeita: gradiente roxo + rosa da V4 (visual wellness genérico), mockups 3D flutuantes (agência de design sem propósito), glass em conteúdo clínico (trust-breaker em app médico), gamificação visual (streaks, badges motivacionais, animações de celebração). Se parece Noom, Duolingo, ou wellness illustration stock — está errado.

**Key Characteristics:**
- Sobriedade clínica como estado padrão de toda superfície de conteúdo
- Liquid Glass exclusivo de camada de navegação (tab bar, toolbar, paywall, splash)
- Verde-menta (`#00D4AA`) como sinal de vida ativo, nunca decoração
- SF Pro (`system`) como única família tipográfica — pesado no dado, leve na explicação
- Profundidade via camadas tonais (bg-base → bg-elevated → bg-surface), não via sombra decorativa
- Cor semântica estrita: positivo, alerta, crítico, informativo — nunca uso decorativo

---

## 2. Colors: The Clinical Midnight Palette

Três backgrounds progressivamente mais claros criam hierarquia sem sombra. Uma cor de marca (`#00D4AA`) aparece em menos de 10% de qualquer tela — sua raridade é o ponto.

### Primary

- **Vital Mint** (`#00D4AA` / oklch(75% 0.19 175)): A cor de marca. Usada em botão primário, estado ativo de tab, accent positivo, linha de peso no gráfico. Nunca como background de card, nunca como texto corrido, nunca em área clínica neutra. Sua presença sinaliza "ação" ou "progresso positivo".

- **Vital Mint Dim** (`#00B894`): Variante pressed/hover do primary. Aparece apenas em estados de interação — tap em botão primário, item de tab pressionado.

- **Mint Soft** (`#A3E6D2`): Variante suave para indicador de estado atual em visualização de dado pessoal, como o ponto final do sparkline de peso. Não substitui Vital Mint como marca, CTA primário, tab ativa ou linha principal de gráfico.

### Semantic

- **Warm Amber** (`#FFB347`): Atenção moderada. Sintoma de intensidade moderada (4-6/10), aviso de dado incompleto, período próximo da próxima consulta. Nunca para situação urgente — isso é Alert Red.

- **Alert Red** (`#E64545`): Emergência clínica real. Sintoma severo (7+/10), erro grave no dado, alerta que requer ação imediata. Reservado — uso frequente quebra confiança.

- **Destructive Red** (`#FF453A`): Ação irreversível. Exclusivo para apagar conta, excluir dados, encerrar sessão crítica ou outra ação destrutiva confirmada. Não substitui Alert Red para erro comum.

- **Clinical Blue** (`#5BA8D9`): Informação neutra de referência. Marcadores de dose no gráfico, dado de contexto ("média da população"), informação de período. Sem conotação positiva ou negativa.

- **Muted Slate** (`#5C6878`): Estado desativado, item secundário, metadado que não requer atenção. Texto de placeholder, label de campo inativo.

### Neutral

- **Clinical Midnight** (`#050B12`): Background base de todas as telas. Azul-grafite profundo — não é preto puro (#000000 é banido). O tint azul no escuro é sutil mas deliberado: ancora o clima de sobriedade clínica noturna sem ser frio.

- **Elevated Surface** (`#0E1620`): Cards, modais — um nível acima do background. Usado para qualquer elemento que precisa de separação visual da tela sem usar sombra.

- **Data Surface** (`#1B2433`): Cards de dado clínico — o nível mais elevado de background. Tabelas de sintoma, gráficos, relatório. O contraste com bg-base é suficiente para separar sem bordas decorativas.

- **Primary Text** (`#F2F4F7`): Texto principal — branco quente, não branco puro. O tint leve evita o cansaço visual do contraste extremo em uso prolongado (relatório bilíngue).

- **Secondary Text** (`#9CA8B8`): Subtítulo, metadado, label de dado. Legível mas hierarquicamente abaixo do primário.

- **Tertiary Text** (`#6B7280`): Hint, placeholder, data de registro antiga. Mínimo 4.5:1 contra bg-elevated.

- **Inverse Text** (`#050B12`): Texto sobre fundo Vital Mint (botão primário). Único uso de texto escuro.

### Clinical Data (gráficos e visualizações)

- **Weight Line** (`#00D4AA`): Linha de peso no gráfico — coincide com brand para reforçar que progresso de peso é dado principal.
- **Dose Dot** (`#5BA8D9`): Marcadores de dose no gráfico de linha. Visualmente separado do peso.
- **Symptom Mild** (`#7DD3A0`): Sintoma leve (1-3/10) no histórico.
- **Symptom Moderate** (`#FFB347`): Sintoma moderado (4-6/10) — coincide com Warm Amber.
- **Symptom Severe** (`#E64545`): Sintoma severo (7+/10) — coincide com Alert Red.

### Named Rules

**The Vital Mint Rarity Rule.** Vital Mint (`#00D4AA`) aparece em ≤10% de qualquer tela. Sua raridade é o que o torna poderoso. Um app onde todo botão e todo ícone é verde não tem cor de marca — tem poluição visual.

**The Mint Soft State Rule.** Mint Soft (`#A3E6D2`) é permitido somente como indicador discreto de estado atual em dado pessoal já exibido, especialmente o ponto final do sparkline de peso. Não comunica ação, sucesso clínico ou marca.

**The 30% Glass Rule.** Glass aplica em no máximo 30% da área visível de qualquer tela. Nenhuma área de conteúdo toca glass. Se um card, lista, texto ou gráfico estiver sobre glass, está errado. Glass é camada de navegação, não padrão de card.

**The Semantic Integrity Rule.** Cor semântica (positivo, warning, critical, info) não é reutilizada para fins decorativos. Alert Red em um badge de marketing é um bug, não uma escolha de design.

**The Destructive Action Rule.** `colors.destructive` (`#FF453A`) é reservado exclusivamente para ações irreversíveis, como excluir conta, excluir dados ou encerrar uma sessão crítica. Não usar para erros não-destrutivos, validação de campo, alerta clínico ou estado negativo comum.

---

## 3. Typography: SF Pro System-Only

**Display Font:** SF Pro (alias `system` — nunca string literal "SF Pro")
**Body Font:** SF Pro (alias `system`)
**Data Mono Font:** SF Mono (`"SF Mono, monospace"`) — apenas para tabelas de dado clínico

**Character:** Uma família única em dois pesos extremos. Bold para números clínicos (peso, dose, delta), Regular para corpo de texto explicativo. A hierarquia é declarada pelo peso e tamanho, nunca por família diferente. SF Pro é o iOS — usar outra família seria competir com o sistema operacional num app que celebra o Liquid Glass como diferencial.

### Hierarchy

- **Display** (Bold, 32pt, 38pt line-height): Headline de tela-marco. Welcome screen, paywall hero, tela de relatório gerado. Máximo 2-3 palavras. Nunca em tela de dado corrente.

- **Display Ultralight** (Light, 28pt, 34pt line-height): Header emocional e calmo em tela pessoal, quando a função é acolher sem competir com os dados. Exemplo: frase de Home que contextualiza a memória do tratamento. Nunca usar em label, botão, dose, alerta ou título técnico.

- **Headline** (Semibold, 28pt, 34pt): Título de tela padrão — "Seu tratamento", "Doses", "Relatório". Uma por tela.

- **Title** (Semibold, 22pt, 28pt): Seção dentro de tela — "Esta semana", "Histórico de sintomas".

- **Subtitle** (Semibold, 18pt, 24pt): Sub-seção, card de destaque. "Próxima dose", "Insight do dia".

- **Body** (Regular, 16pt, 22pt): Texto padrão de conteúdo. Máximo 65-75ch de comprimento de linha. Insights de IA, descrições, copy de onboarding.

- **Body Clinical** (Regular, 15pt, 24pt): Relatório bilíngue e texto longo clínico. Line-height deliberadamente mais generoso (24pt) para facilitar leitura de texto médico denso.

- **Label** (Semibold, 16pt, 20pt): Texto de botão, tab ativa. Nunca em corpo de texto.

- **Caption** (Regular, 13pt, 18pt): Metadado, footer de card, data de registro, disclaimer secundário.

- **Tab Label** (Medium, 11pt, 14pt): Exclusivo para texto de tab bar. Peso Medium equilibra legibilidade e discrição.

- **Number Large** (Bold, 40pt, 48pt): Peso atual, dose principal. O número é o herói — o label é Caption abaixo dele.

- **Number Personal** (Light, 48pt, 54pt): Dado corporal pessoal do paciente quando a tela precisa parecer memória, não painel clínico. Uso principal: peso atual na Home. Nunca usar para dose, delta de dose, valor financeiro, alerta, relatório técnico ou número comparativo.

- **Number Medium** (Bold, 28pt, 34pt): Delta de peso (−2.3 kg), valor secundário de dose.

- **Mono Data** (Regular SF Mono, 14pt, 20pt): Tabelas de cronologia clínica, logs de dado bruto no relatório técnico. Alinhamento de coluna precisa de mono.

### Named Rules

**The Number-First Rule.** Em qualquer card de dado clínico, o número precede e domina o label. `Number Large` ou `Number Medium` tem no mínimo 2× o tamanho do label adjacente. Um card que mostra "Peso atual: 72.3kg" está na ordem errada — deve ser "72.3 kg" grande, "peso atual" pequeno abaixo.

**The System-Only Rule.** Nunca usar string literal `"SF Pro"` em código — Apple recomenda `System` (ou `-apple-system` em web). Usar a string literal quebra em atualizações do iOS. Todo token de `fontFamily` no DESIGN.md usa `"system"` ou `"SF Mono, monospace"`.

**The Weight-Is-Importance Rule.** Peso comunica importância. Bold = dado crítico. Semibold = label de seção. Regular = conteúdo explicativo. Medium = suporte de interface (tab, chip). Nunca usar Bold para decoração.

**The Ultralight-Is-Personal Rule.** Ultralight é uma exceção deliberada para dado próprio e emocionalmente sensível, não para dado clínico de referência. Se o número orienta decisão, compara risco, define protocolo ou aparece em relatório para profissional, use `Number Large`/`Number Medium` Bold. Se o número representa o corpo do paciente na Home, `Number Personal` pode reduzir dureza visual sem perder hierarquia.

---

## 4. Elevation: Flat by Default

DoseDay usa um sistema de elevação híbrido: profundidade primária via **camadas tonais de background** (Clinical Midnight → Elevated Surface → Data Surface), com **sombras reais** reservadas para elementos genuinamente flutuantes (modais, sheets, floating action). Glass é tratado como categoria separada — exclusivamente para camada de navegação nativa iOS 26.

O princípio central: uma superfície plana em repouso não pede atenção. Sombra deve significar algo: "este elemento está acima dos outros e aguarda sua ação" (modal) ou "este card contém dado que merece destaque" (card clínico flutuante). Sombra decorativa em card de lista não significa nada — e num app médico, significado falso quebra confiança.

### Shadow Vocabulary

- **elevation.0** (nenhuma sombra): Estado padrão de toda superfície. Cards de lista, linhas de histórico, backgrounds de tela.

- **elevation.1** (`0 1px 2px rgba(0,0,0,0.20)`): Card padrão que precisa de separação sutil do background. Uso: cards de dashboard (NextDoseCard, WeightProgressBlock) quando não há diferença tonal suficiente.

- **elevation.2** (`0 4px 12px rgba(0,0,0,0.30)`): Card flutuante / floating action. Uso: FAB de registro de dose, card de insight proativo que sobe sobre a lista.

- **elevation.3** (`0 12px 32px rgba(0,0,0,0.45)`): Modal e bottom sheet. O maior nível de sombra real — comunica "você está bloqueado aqui até tomar uma decisão".

- **elevation.glass** (nativo iOS 26 `.glassEffect()`): Tab bar, toolbar de navegação, header de modal com glass, paywall hero, splash screen. Nunca customizar manualmente com `backdrop-filter` — usar o `.glassEffect()` nativo para fidelidade ao iOS 26.

### Named Rules

**The Flat-By-Default Rule.** Toda superfície nasce plana (`elevation.0`). Sombra é adicionada apenas quando o elemento precisa comunicar que está acima de outro. "Decorativo" não é justificativa para sombra. Se você está adicionando sombra para "dar profundidade ao design", remova e use diferença tonal de background.

**The Glass-Navigation-Only Rule.** Glass aplica exclusivamente em: tab bar, toolbar de navegação, header de modal/sheet, botão primário em paywall, splash screen, welcome screen. É proibido em: card de dado clínico, lista de doses/sintomas/perguntas, texto corrido, gráfico, relatório bilíngue, estados de erro. Se glass aparece em conteúdo, é um bug de design.

**The Tonal Layering Rule.** Antes de adicionar sombra a um card, tente usar `bg-elevated` em vez de `bg-base`. Se o contraste entre as duas camadas de fundo já comunica a hierarquia, não adicione `elevation.1`. Reserve sombras para quando a camada tonal não é suficiente.

---

## 5. Components

### Buttons

Tactile e confident. Raio `md` (14px) — nem arredondado demais (wellness app), nem quadrado (app de banco). O primário usa Vital Mint cheio; o glass-primary usa Liquid Glass com tint de marca para contextos de navegação.

- **Shape:** `rounded.md` (14px) em todos os variants
- **Primary:** Background `brand` (#00D4AA), texto `text-inverse` (#050B12), padding `16px 24px`, fonte `label` Semibold 16pt. State pressed: background `brand-dim`, scale 0.97 (100ms ease-out)
- **Primary-Glass:** Liquid Glass nativo + tint Vital Mint 8%. Exclusivo de paywall CTA e splash. Nunca em tela de conteúdo.
- **Secondary:** Border 1px `brand`, background transparente, texto `brand`. Ação alternativa na mesma tela que o primary.
- **Ghost:** Background transparente, texto `brand`, sem border. Links inline ("Ver histórico completo"), ações terciárias.
- **Destructive:** Background `destructive` (#FF453A), texto `text-primary`. Apenas em ações irreversíveis: cancelar assinatura, deletar dados. Nunca como CTA padrão.
- **Disabled:** Background `bg-surface`, texto `text-disabled` (opacity 0.30), não responde a tap. Nunca finge ser interativo.
- **Loading state:** Spinner inline, label contextual ("Salvando dose...", "Gerando relatório..."). Nunca "Loading...".

### Cards

Três variantes com hierarquia de background tonal.

- **Card Default** (`bg-elevated` #0E1620): Lista padrão de conteúdo — itens de dose, sintomas, perguntas para a consulta. Padding interno `spacing.md` (16px). Border `0.5px rgba(255,255,255,0.06)`.

- **Card Elevated** (`bg-surface` #1B2433): Card de destaque no dashboard — NextDoseCard, WeightProgressBlock, DailyInsightCard. Um nível acima do default. Raio `radius.lg` (20px) para diferenciação visual.

- **Card Clinical Data** (`bg-surface` #1B2433 + `elevation.1`): Card que exibe dado clínico quantitativo (número grande + gráfico). Única exceção ao Flat-By-Default: recebe `elevation.1` para comunicar que contém informação de referência. Border `1px rgba(255,255,255,0.10)`.

### Inputs

- **Style:** Background `bg-elevated`, border `0.5px rgba(255,255,255,0.08)`, raio `radius.sm` (10px), padding `12px 16px`, fonte `body` Regular 16pt.
- **Focus:** Border muda para `1px brand` (#00D4AA), sem glow extra — a mudança de cor é suficiente.
- **Error:** Border `1px semantic-critical`, label de erro em Caption abaixo do campo. Mensagem explica por quê e como corrigir — nunca só "Campo inválido".
- **Disabled:** Background `bg-base`, texto `text-disabled`, border transparente.
- **Floating label:** Label sobe para `Caption` acima do input quando campo está ativo ou preenchido. Nunca esconde informação.

### Navigation: GlassBar

O componente de assinatura do DoseDay. A única superfície do app que usa Liquid Glass fora de paywall/splash.

- **Tab bar:** 5 tabs (Home, Doses, Diário, Relatórios, Perfil). Em iOS 26+, usa `expo-glass-effect` com `GlassView` nativo, `glassEffectStyle="regular"` e `colorScheme="dark"`. Em iOS <26 e Android, mantém `expo-blur` `BlurView` como fallback visual, nunca `<View />` puro. Ícone SF Symbol + label `tab-label` (11pt Medium) abaixo. Tab ativa: ícone e label em `text-brand`; não usar `tintColor` no `GlassView` para preservar Vital Mint Rarity. Tab inativa: ícone e label em `text-secondary`.
- **Toolbar:** Botões de ação secundária em telas com ações (Gerar Relatório, Compartilhar). Glass `.regular`. Botões em `text-brand` ou `text-secondary` dependendo de estado.
- **Header de navegação:** Título de tela em `headline` (28pt Semibold `text-primary`). Backdrop em Glass `.clear` em telas com hero visual (relatório, paywall). Em telas de dado: sem glass no header — apenas background `bg-base`.

### Signature Component: QuickMoodCheckin

O check-in de humor diário — 1 toque, 5 estados. Grid 2×3 (5 botões + 1 vazio). Cada botão: ícone SF Symbol + label em Caption, fundo `bg-elevated`, raio `radius.lg`. Estado selecionado: fundo `brand-fade` (rgba Vital Mint 12%), border `1px brand`. Spring animation no tap (dampingRatio 0.8).

Estados: Péssimo / Mal / Ok / Bem / Ótimo. Mapeados para escala de dado (1-5) enviada ao Supabase. Sem emojis — SF Symbols para consistência com iOS e acessibilidade.

---

## 6. Do's and Don'ts

### Do:

- **Do** usar `#050B12` (Clinical Midnight) como background base de todas as telas. Nunca `#000000`.
- **Do** reservar Vital Mint (`#00D4AA`) para ≤10% de qualquer tela. Botão primário, aba ativa, e linha de peso no gráfico são os usos canônicos.
- **Do** usar glass APENAS em tab bar, toolbar, header de navegação, paywall hero, e splash screen.
- **Do** nomear superfícies por papel semântico nos tokens: `bg-base`, `bg-elevated`, `bg-surface` — não por valor hex (`#050B12`).
- **Do** usar `Number Large` (40pt Bold) para o valor principal de qualquer card clínico. O número lidera, o label é Caption abaixo.
- **Do** escrever mensagens de erro com causa + ação de recuperação. "Não consegui salvar. Sem internet?" é correto. "Erro 500" é proibido.
- **Do** aplicar `accessibilityLabel` + `accessibilityHint` em todo componente interativo, sem exceção.
- **Do** desativar animações sensíveis quando `prefersReducedMotion === true`.
- **Do** usar `system` (alias SF Pro) em todo `fontFamily`. Nunca a string literal `"SF Pro"`.
- **Do** mostrar disclaimer de IA em todo output gerado: *"Isso é uma anotação inteligente, não orientação médica. Sempre fale com um profissional de saúde."*

### Don't:

- **Don't** aplicar glass em card de dado clínico, lista de doses, texto corrido, gráfico, ou relatório. Glass é camada de navegação.
- **Don't** usar gradiente roxo + rosa. A V4 usou — foi banido na V5. Substituído por verde-menta + azul-grafite.
- **Don't** colocar mockups 3D flutuantes ou cards atravessando a tela. Visual de agência sem propósito.
- **Don't** usar Alert Red (`#E64545`) como cor de destaque decorativa. Reserve para situação clínica real.
- **Don't** escrever "Ação necessária — Seu médico precisa de você hoje". Pressão clínica falsa. Proibida.
- **Don't** mostrar streak ou sequência com pressão ("Você quebrou sua sequência de 7 dias"). Gamificação fake.
- **Don't** usar copy motivacional: "Você consegue!", "Continue assim!", "Transforme sua vida!". Anti-Noom.
- **Don't** criar texto de botão genérico ("OK", "Confirmar"). Todo botão diz o que acontece ao tocar ("Salvar dose", "Gerar relatório").
- **Don't** usar "diagnóstico", "prescrição", "recomendação médica" em qualquer copy ou label. Compliance ANVISA/Apple Medical.
- **Don't** usar fotos stock de modelos felizes ou ilustrações cartoonescas tipo "wellness illustration".
- **Don't** usar fonte custom. SF Pro é o iOS. Fonte custom seria competir com o sistema operacional.
- **Don't** adicionar sombra decorativa a cards de lista. `elevation.0` é o padrão. Sombra significa algo — use só quando tiver significado.

---

> **Nota de implementação:** Os tokens em `lib/theme/tokens.ts` ainda contêm placeholders do Prompt 00 (ex: `primary: '#00B37E'`). Serão atualizados com os valores canônicos deste DESIGN.md no próximo prompt de código. Até lá, este DESIGN.md é a fonte de verdade normativa.
