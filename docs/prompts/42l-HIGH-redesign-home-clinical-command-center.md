# Prompt 42l — HIGH — Redesign da Home: Clinical Command Center (sem feature nova)

**Branch:** `feat/redesign-home-clinical-command-center` (criar a partir de `main`, #94 já mergeado)
**Tipo:** redesign visual de UMA tela. Reescrita ampla do `HomeV7Content`, mas SEM feature/dado/schema novo.
**PR target:** main

**Skills obrigatórias:**
- `karpathy-guidelines` (user) — mudanças cirúrgicas, simplicidade, zero drive-by refactor
- `superpowers:writing-plans` (user/plugin) — plano antes de codar, com pausa para aprovação
- `react-native-best-practices` (user — MUST USE em Expo/RN) — acessibilidade, performance, touch targets, safe area, componentes nativos
- `antigravity-bundle-expo-react-native:react-native-architecture` (plugin — nome qualificado) — SOMENTE para respeitar a estrutura existente de arquivos/rotas/componentes. NÃO propor refatoração arquitetural ampla.
- `impeccable` — usar no modo critique/polish ANTES de marcar pronto.

**A autoridade visual/médica real deste projeto é o `DESIGN.md`** (tokens + Named Rules) + a seção North Star deste prompt. Não há skill geradora de design primária — a direção já está decidida (mockup aprovado + DESIGN.md); o trabalho é execução fiel.

**NÃO usar:**
- `ui-ux-pro-max` (conflito de vocabulário com impeccable — regra do projeto)
- `expo-liquid-glass` (Liquid Glass foi rebaixado de pilar no ADR 0007; não aplicar em conteúdo)
- `ios-medical-design` como fonte primária. Se existir no ambiente, usar APENAS como referência secundária; em qualquer conflito, `DESIGN.md` e North Star vencem.

**Referências (ler via @file):**
- `@docs/DESIGN.md` — paleta Clinical Midnight, tipografia, Named Rules (Vital Mint Rarity, Number-First, Flat-by-Default, One Action Home, Consolidated Memory)
- `@docs/redesign-home/home-prototype-reference.tsx` — protótipo aprovado (Figma Make). **Referência ESTRUTURAL/composição, NÃO copiar cego.** É web/React; o app é React Native + NativeWind. Cores do protótipo são mint-heavy demais — ver seção "Tempero do Mint".
- `@docs/figma-make-briefing-home-redesign.md` — briefing com tokens exatos e dados de exemplo

---

# Objetivo

Transformar a Home (`components/home/HomeV7Content.tsx`) de uma lista de seções homogêneas em um **Clinical Command Center**: painel premium, sério e clínico, com hierarquia clara e papéis visuais diferenciados por bloco. Usar APENAS os blocos e dados que já existem. Nenhuma feature, query, schema ou rota nova.

Critério humano: ao abrir o app, o usuário sente em 3 segundos que está numa ferramenta séria e moderna de organizar o tratamento, e entende onde registrar algo.

# Contexto

- Todos os 9 blocos já existem no `HomeV7Content` com hooks de dados plugados: `useDoseSummary`, `useWeightLogs`, `useSymptomMemory`, `usePurchaseSummary`, `useConsultationNotes`, `useDiarioSummary`, `useProfile`. **NÃO criar hook/query novo.**
- Stack visual: NativeWind v4 + tokens em `lib/theme/tokens.ts` (ADR 0007). O `HomeV7Content` já usa `className`. Manter NativeWind; StyleSheet só onde NativeWind não der conta.
- Tab Bar: já está `display: 'none'` em `app/(tabs)/_layout.tsx`. **NÃO apagar o grupo `(tabs)` nem mexer em roteamento.** A Home é a tela principal rolável; navegação por cards.
- `nextDose` expõe: `scheduledDate`, `medicationName`, `dose`, `daysUntil`, `isOverdue`, `overdueBy`. **NÃO existe** dado de fase farmacocinética / Peak Effect — proibido inventar.
- O bloco de Consulta hoje (`ConsultationMemorySection`) é display-only (sem navegação).
- Bolinhas coloridas por tipo na Memória recente: JÁ ESTÃO NA MAIN (PR #95, commit 8de4ab9). `lib/memory/source.ts` existe e é a fonte única de `SOURCE_COLORS`/`getQuickLogSource`; `HomeV7Content` e `app/memoria/index.tsx` já consomem dela. Este redesign **preserva** esse comportamento, **não reimplementa** (ver Etapa 2).

# O que analisar antes de alterar

1. Ler `HomeV7Content.tsx` inteiro (o arquivo todo, independentemente da contagem atual de linhas) e mapear os componentes internos: hero próxima dose, peso, memória recente (`buildTimeline`, `TimelineItem`), consulta (`ConsultationMemorySection`), sintomas (`ObservationMemoryCard`), custos, disclaimer.
2. Ler `app/memoria/index.tsx` L26-58 e L403-407: `SOURCE_COLORS`, `symptomQuickLogTypes`, `getQuickLogSource` (3 saídas: `other→nota`, sintoma conhecido→`sintoma`, resto→`registro`). É essa lógica que será centralizada.
3. Confirmar via grep que `SOURCE_COLORS` só existe em `app/memoria/index.tsx`.
4. Confirmar as rotas existentes dos atalhos: `/diario/anotar-sintoma`, `/diario/anotar-memoria`, `/peso/registrar`, `/dose/registrar`, `/peso/historico`, `/diario/custos`, `/memoria`, `/(tabs)/doses`, `/configuracoes`.
5. Confirmar se `app/diario/anotar-memoria.tsx` aceita algum query param de contexto. Se não aceitar trivialmente, usar navegação simples (sem param).

# Ordem dos blocos (alvo)

1. Header: "Hoje no seu tratamento" + data + engrenagem (→ `/configuracoes`)
2. **HERO** — Próxima dose
3. Peso
4. Ações rápidas (bloco NOVO de composição — 4 atalhos)
5. Consulta (antes da Memória)
6. Memória recente (compacta, dots coloridos por tipo)
7. Grid 2 colunas: Sintomas + Custos
8. Disclaimer

# Instruções — implementar em 2 etapas DENTRO do mesmo PR, com checkpoint visual no meio

## Etapa 1 — Estrutura e hierarquia

- **ANTES de alterar qualquer código:** gerar screenshot baseline da Home atual em `assets/screenshots/redesign-home/00-baseline-before.png` (método conforme "Robustez de execução"). É a referência ANTES, para comparação no checkpoint.
- Reordenar os blocos para a ordem alvo acima.
- **Hero próxima dose** (card de maior destaque, fundo `colors` painel mais forte — usar `bgSurface`/painel graphite, leve elevação permitida por ser card clínico flutuante): eyebrow "PRÓXIMA DOSE"; `medicationName` grande (Bold); `dose` (ex "5,0 mg"); data programada; status countdown grande ("Em X dias"/"Hoje"/"Amanhã"/"X dias de atraso"); CTA principal (ver estados na Etapa 2).
- **Peso**: Number-First — `87,0` Ultralight 48pt + `kg`, label "peso atual"; chip de delta "−13,0 kg desde o início"; sparkline (linha azul clínico + ponto final Mint Soft); "atualizado há X dias"; chevron → `/peso/historico`. Corpo clicável.
- **Ações rápidas** (bloco novo): 4 atalhos em grid — Sintoma → `/diario/anotar-sintoma`; Dúvida/Nota → `/diario/anotar-memoria`; Peso → `/peso/registrar`; Dose → `/dose/registrar`. Estilo clínico discreto (ver Etapa 2 — menos playful que o protótipo).
- **Consulta** (antes da memória): eyebrow "PRÓXIMA CONSULTA" + resumo "N dúvidas para levar"; CTA "Anotar dúvida" → `/diario/anotar-memoria` (NÃO "Preparar consulta" — não implicar feature deferida). Card/CTA navegam pro fluxo existente de nota.
- **Memória recente** (compacta, 3-4 itens): timeline curta; "Ver memória completa" → `/memoria`.
- **Grid 2 colunas**: Sintomas (último sintoma, → `/memoria`) + Custos (total "R$ X", → `/diario/custos`).
- **Disclaimer**: texto pequeno terciário, "DoseDay organiza a memória do seu tratamento. Não substitui orientação médica."

### CHECKPOINT VISUAL 1 (obrigatório — PARE e aguarde aprovação explícita)
- Gerar screenshot real da Home (ver "Robustez de execução" abaixo para o método).
- Reportar o **caminho do screenshot**.
- **Resumir o que mudou** nesta etapa.
- **Comparar contra o protótipo aprovado.**
- **Listar os riscos visuais percebidos.**
- PARAR e aguardar **aprovação explícita** antes de iniciar a Etapa 2. Não prosseguir sem o "ok".

## Etapa 2 — Refinamento, estados e cor

- **CTA condicional do hero por estado** (substitui o "Ver dose" ambíguo do checkpoint 1):
  - Futuro/normal: "Ver doses" (ou "Detalhes do tratamento")
  - Hoje: "Registrar dose"
  - Atrasada: "Registrar dose atrasada"
- **Copy — placeholder da nota** (fix de regressão; toca `app/diario/anotar-memoria.tsx` — exceção de escopo explícita, 1 linha): trocar `"ex: bati o pé pra não comer doce hoje · domingo foi difícil"` (infantil, fora do tom clínico) por algo adulto/orientado à consulta, ex.: `"ex: dúvida para levar ao médico"` ou `"ex: ansiedade menor essa semana, sono melhor"`.
- **Cards Sintomas/Custos — papel = consultar estado (decisão de IA de produto):**
  - **Memória recente** continua → `/memoria` (é a timeline; papel legítimo).
  - **Sintomas**: para NÃO ter duas portas pro mesmo `/memoria`, e como NÃO existe tela de histórico de sintomas (não criar rota nova), o card vira **resumo/insight display-only** (último sintoma + quando), SEM chevron/navegação nesta etapa. Recebe destino real no PR futuro de timeline.
  - **Custos**: mantém → `/diario/custos` (tela própria existente, destino distinto — ok).
  - **NÃO** redesenhar nem tocar `/memoria` neste PR. Se mexer em copy da /memoria, é fora de escopo aqui — fica pro próximo PR.
- **Tempero do Vital Mint (DESIGN.md vence o protótipo — Vital Mint Rarity ≤10%):**
  - NÃO usar mint simultâneo em countdown gigante + botão + chip de peso + atalho Peso + dot. Evitar duas massas mint no mesmo card.
  - Countdown do hero por estado: normal/futuro = branco (`textPrimary`) ou azul clínico (`semanticInfo`); "Hoje" = mint pode ganhar prioridade (ação principal); atrasado = amber (`semanticWarning`)/vermelho clínico discreto, NUNCA mint.
  - Se o botão for mint, o countdown NÃO é mint (e vice-versa). Considerar CTA secondary/outline quando o countdown for o destaque mint.
  - Chip "−13,0 kg": mint no texto/ícone, fundo escuro/neutro (`bgElevated`).
  - Atalho Peso: ícone/borda mint em fundo escuro, NÃO círculo mint preenchido. Os 4 atalhos com tratamento clínico discreto (não círculos coloridos playful).
  - Dot de peso na memória: mint pequeno — uso mínimo e semântico, ok.
- **Dots da Memória recente por tipo — JÁ ESTÃO NA MAIN (PR #95, commit 8de4ab9). NÃO reimplementar.**
  - `lib/memory/source.ts` já existe com os 4 exports (`MemorySource`, `SOURCE_COLORS`, `symptomQuickLogTypes`, `getQuickLogSource`). **INTOCADO.**
  - `app/memoria/index.tsx` já importa do módulo. **INTOCADO.**
  - `HomeV7Content` já tem `source: MemorySource` no `TimelineItem` (L35), `buildTimeline` já usa `getQuickLogSource(log.logType)` (L694), e o dot já lê `SOURCE_COLORS[item.source]` (L442) — **nunca por índice.**
  - Nesta etapa: **apenas PRESERVAR** esse comportamento ao reescrever a Memória recente. Qualquer toque em dots/source só se o redesign quebrar algo, e mínimo. A cor do dot continua dependendo exclusivamente de `SOURCE_COLORS[item.source]`. Bolinhas discretas/clínicas, pequenas — marcadores semânticos, não decoração.
- Contraste de textos secundários; diferenciação visual Sintoma vs Custos; validar sparkline do peso.

### CHECKPOINT VISUAL 2 (final)
- Screenshot final real (método conforme "Robustez de execução").
- Rodar type-check + lint usando os **scripts reais** do `package.json` (ver "Robustez de execução").
- Testar navegação dos atalhos e cards (cada um abre a rota certa).
- `/impeccable critique` contra DESIGN.md Named Rules.
- Comparar com mockup + design system.

## Robustez de execução

Antes da validação final:
- **Ler `package.json` e confirmar os scripts reais.** Se `npm run type-check` não existir, usar o script equivalente (ex: `tsc --noEmit`) e reportar qual foi usado. Idem para lint.
- **Screenshot:** usar `react-native-devtools-mcp` se disponível; caso não esteja, usar o método real disponível no projeto/ambiente e **reportar qual método foi usado**.

# O que preservar

- Grupo de rotas `(tabs)` e roteamento — intocados.
- Hooks, queries, schemas, Supabase — intocados.
- Comportamento de navegação existente (Sintomas→/memoria, Custos→/diario/custos, etc.).
- Tokens em `lib/theme/tokens.ts` — usar os existentes, NÃO editar.
- Tela `/memoria` continua sendo o hub completo; comportamento idêntico após centralizar `SOURCE_COLORS`.
- Componentes/telas fora da Home — intocados.

# Critérios de sucesso (verificáveis)

- [ ] A Home não parece mais lista de seções (avaliação no checkpoint visual + impeccable critique).
- [ ] Próxima dose é claramente o hero; countdown destacado por tamanho.
- [ ] Peso forte: número grande + sparkline + delta + contexto.
- [ ] Memória recente compacta (3-4 itens) com dots coloridos por tipo. A cor do dot depende **exclusivamente** de `SOURCE_COLORS[item.source]`, **nunca** do índice do item na lista.
- [ ] 4 atalhos navegam pras rotas existentes corretas.
- [ ] Consulta com CTA "Anotar dúvida" → `/diario/anotar-memoria`; sem "Preparar consulta", sem tela nova.
- [ ] `SOURCE_COLORS`/`getQuickLogSource` definidos UMA vez em `lib/memory/source.ts` (grep: 1 def cada); `app/memoria/index.tsx` importando.
- [ ] Vital Mint usado com raridade (≤10%); sem duas massas mint no mesmo card; countdown por estado.
- [ ] type-check e lint passam (usando os scripts reais do `package.json`, conforme "Robustez de execução").
- [ ] Screenshots reais antes/depois em `assets/screenshots/redesign-home/`.
- [ ] Dois checkpoints visuais cumpridos (1 no meio com pausa, 1 final).

# Restrições

- **Sem feature nova, sem dado novo, sem schema, sem Supabase, sem rota global nova, sem apagar `(tabs)`, sem feature completa de consulta, sem Peak Effect/roda Glapp, sem IA, sem onboarding, sem redesenhar telas internas.**
- PR pode ser grande visualmente, mas **não pode virar refatoração ampla**. Escopo = `components/home/HomeV7Content.tsx` (arquivo principal) + **1 linha de copy** em `app/diario/anotar-memoria.tsx` (placeholder da nota). `lib/memory/source.ts` e `app/memoria/index.tsx` ficam **INTOCADOS** (já estão na main via #95). Nenhuma outra fonte.
- Karpathy: declarar assumptions; preferir a menor mudança que entrega; cada bloco traceia ao alvo; zero drive-by refactor; helpers pequenos só se reduzirem duplicação real.
- **Validação antes de commit (CRÍTICA):** `git status --short` antes e depois; `git add` SÓ por path explícito; confirmar zero `graphify-out/*`, `.codegraph/*`, duplicados `" 2."`; reportar "git status validado, zero contaminação".

# North Star / Regras de desempate

Se houver conflito entre mockup, código atual, DESIGN.md e escopo:

1. **DESIGN.md vence** em cor, tom, tokens e regras visuais.
2. **Código atual vence** em dados, hooks, queries, rotas e comportamento existente.
3. **Mockup/protótipo vence** em composição, ordem dos blocos e hierarquia visual.
4. **Escopo vence** sobre qualquer melhoria extra.

Não implementar nada que não esteja diretamente ligado ao redesign visual da Home.

# Antes de codar, retorne (e PAUSE):
- Tabela Plano (2 etapas) + Riscos + Arquivos + Validação
- Output do grep que prova as premissas (SOURCE_COLORS única def, rotas existem)
- Diff planejado dos pontos principais (hero, dots/source module, atalhos)
- Aguarde meu "ok". Depois execute a Etapa 1 e PARE no Checkpoint Visual 1.
