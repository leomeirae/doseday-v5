# DoseDay V5 — Arquitetura

**Data:** 14 de maio de 2026
**Local canônico:** `/Users/leofrancaia/Desktop/dose-day-v5/docs/architecture.md`
**Status:** referência técnica do repo. Atualizar antes de mudanças estruturais.

---

## 1. Visão geral

DoseDay V5 é um app mobile iOS-first construído em React Native + Expo, com backend Supabase (mantido da V4), pagamento via RevenueCat (trial 14d configurado em produção) e IA via Anthropic SDK em Edge Functions.

A V5 é **refatoração completa do código** mas mantém **infraestrutura, marca e distribuição**. Bundle ID, App Store listing, Supabase project, RevenueCat project — tudo preservado.

---

## 2. Stack de runtime

| Camada | Tecnologia | Versão alvo |
|---|---|---|
| App | React Native + Expo | Expo SDK 54+ |
| Linguagem | TypeScript estrito | 5.x |
| Routing | Expo Router (file-based) | última |
| UI nativa iOS | `@expo/ui` + Liquid Glass | iOS 26+ |
| Estado de servidor | React Query (`@tanstack/react-query`) | 5.x |
| Estado de cliente | Context API + hooks | nativo |
| Validação de schema | Zod | última |
| Backend | Supabase (mantido) | Postgres 15 + Edge Functions Deno |
| IA | Anthropic SDK (Claude) via Edge Function | última |
| Pagamento | RevenueCat SDK | última |
| Push | Expo Notifications | nativo Expo |
| i18n | i18next + react-i18next | última |
| Analytics | PostHog + eventos custom Supabase | última |
| Crash reporting | Sentry React Native | última (entra antes do beta) |
| CI/CD | EAS Build + GitHub Actions | hospedado Expo |
| Date | date-fns + date-fns-tz | última |
| Storage seguro | expo-secure-store | nativo Expo |
| Háptica | expo-haptics | nativo Expo |

### O que **NÃO** vai no projeto

| Não usar | Por quê |
|---|---|
| Tailwind / NativeWind | V5 usa StyleSheet nativo + Liquid Glass |
| Redux / Zustand global | React Query + Context bastam |
| NativeBase / RN Paper / Tamagui | Componentes nascem do Impeccable |
| Lottie | Animações via Reanimated 4 / Skia / native |
| Moment.js | date-fns é mais leve e tree-shakeable |
| Axios | fetch nativo + helper tipado |

---

## 3. Estrutura de pastas (canônica)

```
/Users/leofrancaia/Desktop/dose-day-v5/
├── app/                              # Expo Router (file-based)
│   ├── _layout.tsx                   # Root layout (providers, theme, i18n)
│   ├── index.tsx                     # Splash → redirect
│   ├── (auth)/                       # Grupo de rotas: não-autenticado
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx               # Hero / 1º insight pré-cadastro
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── recover.tsx
│   ├── (onboarding)/                 # Grupo: onboarding pré-autenticação
│   │   ├── _layout.tsx
│   │   ├── personal-info.tsx
│   │   ├── medication.tsx
│   │   ├── dose.tsx
│   │   ├── weight.tsx
│   │   ├── goal.tsx
│   │   ├── medical-support.tsx
│   │   ├── consent.tsx               # LGPD Art. 11
│   │   ├── first-insight.tsx         # Aha-moment IA (Movimento 1)
│   │   └── result.tsx
│   ├── (app)/                        # Grupo: autenticado
│   │   ├── _layout.tsx               # Tab bar (5 abas, Liquid Glass)
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx             # Início (dashboard)
│   │   │   ├── doses.tsx             # Doses (com sub-seção Custos)
│   │   │   ├── diario.tsx            # Diário (sintomas + perguntas)
│   │   │   ├── relatorios.tsx        # Relatórios
│   │   │   └── perfil.tsx            # Perfil
│   │   ├── doses/
│   │   │   ├── new.tsx
│   │   │   └── [id].tsx
│   │   ├── diario/
│   │   │   ├── new-symptom.tsx
│   │   │   └── new-question.tsx
│   │   ├── relatorios/
│   │   │   ├── new.tsx
│   │   │   └── [id].tsx
│   │   └── perfil/
│   │       ├── account.tsx
│   │       ├── doctor.tsx
│   │       ├── subscription.tsx
│   │       ├── notifications.tsx
│   │       └── support.tsx
│   ├── (paywall)/
│   │   ├── _layout.tsx
│   │   └── paywall.tsx
│   ├── (modals)/
│   │   ├── _layout.tsx
│   │   ├── consent.tsx               # Modal LGPD reaberto
│   │   └── share.tsx
│   └── +not-found.tsx
│
├── components/                       # Componentes reutilizáveis
│   ├── ui/                           # Primitivos (gerados pelo Impeccable)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── GlassBar.tsx              # Liquid Glass APENAS aqui (navegação)
│   │   ├── Input.tsx
│   │   ├── Skeleton.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorState.tsx
│   ├── home/                         # Componentes da tela Início
│   │   ├── QuickMoodCheckin.tsx
│   │   ├── NextDoseCard.tsx
│   │   ├── WeightProgressBlock.tsx
│   │   ├── DailyInsightCard.tsx
│   │   ├── NextReportCard.tsx
│   │   └── AIProactiveQuestion.tsx
│   ├── doses/
│   ├── diario/
│   ├── relatorios/
│   ├── paywall/
│   └── shared/                       # Atomicos cross-tela
│
├── hooks/                            # React hooks customizados
│   ├── useAuth.ts
│   ├── useProfile.ts
│   ├── useTodayCheckin.ts
│   ├── useReportHistory.ts
│   ├── useSubscription.ts
│   ├── useAIInsight.ts
│   └── useTreatmentWeek.ts
│
├── lib/                              # Clients, utilitários
│   ├── supabase/
│   │   ├── client.ts                 # Cliente tipado
│   │   ├── types.ts                  # Tipos gerados via supabase-js
│   │   └── queries/                  # Queries reutilizáveis
│   ├── revenuecat/
│   │   └── client.ts
│   ├── ai/
│   │   ├── client.ts                 # Chamadas pra Edge Functions
│   │   └── prompts.ts                # System prompts dos 3 movimentos
│   ├── analytics/
│   │   └── client.ts                 # PostHog wrapper
│   ├── i18n/
│   │   └── index.ts
│   ├── theme/
│   │   ├── tokens.ts                 # Cores, spacing, radius — referencia DESIGN.md
│   │   ├── typography.ts
│   │   └── elevation.ts
│   ├── notifications/
│   │   └── index.ts                  # Expo Notifications setup
│   └── utils/
│       ├── treatmentWeek.ts
│       ├── doseSchedule.ts
│       ├── currency.ts
│       └── date.ts
│
├── types/                            # Tipos TypeScript compartilhados
│   ├── database.ts                   # Espelha schema Supabase
│   ├── domain.ts                     # Tipos de domínio (Dose, Symptom, etc.)
│   └── api.ts                        # Tipos de payload das Edge Functions
│
├── locales/                          # i18n
│   ├── pt-BR/
│   │   ├── common.json
│   │   ├── onboarding.json
│   │   ├── dashboard.json
│   │   ├── doses.json
│   │   ├── diario.json
│   │   ├── relatorios.json
│   │   ├── paywall.json
│   │   ├── perfil.json
│   │   └── ai.json                   # Strings dos disclaimers IA
│   ├── en/
│   └── es/
│
├── assets/                           # Imagens, fontes, ícones
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash.png
│   ├── notification-icon.png
│   ├── favicon.png
│   ├── images/
│   └── fonts/                        # Se não usar SF Pro nativo
│
├── supabase/                         # Migrations + Edge Functions
│   ├── migrations/                   # SQL versionado
│   ├── functions/                    # Edge Functions Deno
│   │   ├── insight-do-dia/
│   │   ├── memoria-perguntas/
│   │   └── relatorio-bilingue/
│   ├── seed.sql
│   └── config.toml
│
├── e2e/                              # Detox E2E (entra fase pre-ship)
│
├── CONTEXT.md                        # Glossário do domínio (Matt Pocock) — lazy, mantido por grill-with-docs
├── docs/                             # Documentação (NÃO TOCAR via prompts)
│   ├── plano-estrategico-v5.md
│   ├── skills-stack.md
│   ├── architecture.md               # Este arquivo
│   ├── design-system-preview.md
│   ├── PRODUCT.md                    # Criado via /impeccable teach
│   ├── DESIGN.md                     # Criado via /impeccable teach
│   ├── adr/                          # ADRs (Matt Pocock format) — criados sob demanda
│   ├── handoff/                      # Snapshots de sessão (mantido por skill /handoff)
│   │   └── HANDOFF.md                # Última sessão sempre aqui
│   └── prompts/                      # Prompts versionados
│
├── .github/
│   └── workflows/                    # GitHub Actions (lint, type-check)
│
├── .easignore
├── .gitignore
├── .env.example
├── .eslintrc.js                      # Lint Expo + TypeScript
├── .prettierrc
├── app.json                          # Config Expo (bundle id, plugins, splash)
├── eas.json                          # EAS Build config
├── babel.config.js
├── metro.config.js
├── tsconfig.json                     # Strict mode
├── package.json
├── CLAUDE.md                         # Working memory pro Claude Code
└── README.md
```

---

## 4. Configuração crítica

### 4.1 `app.json` — campos não-negociáveis

```json
{
  "expo": {
    "name": "DoseDay",
    "slug": "doseday",
    "version": "5.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "doseday",
    "userInterfaceStyle": "dark",
    "ios": {
      "bundleIdentifier": "com.doseday.premium",
      "supportsTablet": false,
      "buildNumber": "1",
      "infoPlist": {
        "NSHealthShareUsageDescription": "DoseDay lê peso e atividade do Apple Saúde para ajudar a entender seu tratamento.",
        "NSHealthUpdateUsageDescription": "DoseDay pode salvar peso e doses no Apple Saúde se você autorizar.",
        "NSMicrophoneUsageDescription": "DoseDay grava perguntas para sua consulta apenas se você autorizar (feature opcional).",
        "ITSAppUsesNonExemptEncryption": false
      },
      "associatedDomains": ["applinks:getdoseday.com"]
    },
    "plugins": [
      "expo-router",
      "expo-localization",
      "expo-secure-store",
      "expo-notifications",
      "expo-font",
      ["@expo/ui", { "ios": { "deploymentTarget": "26.0" } }]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": { "projectId": "<preencher com EAS init>" }
    },
    "runtimeVersion": "5.0.0"
  }
}
```

### 4.2 `tsconfig.json` — estrito

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["./components/*"],
      "@hooks/*": ["./hooks/*"],
      "@lib/*": ["./lib/*"],
      "@types/*": ["./types/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

### 4.3 Variáveis de ambiente (`.env.example`)

```bash
# Supabase (mesmo projeto da V4)
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# RevenueCat (mesmo projeto, app "Dose Day App" produção)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=

# PostHog
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Sentry (entra antes do beta)
EXPO_PUBLIC_SENTRY_DSN=

# Anthropic / OpenAI — APENAS no backend (Edge Functions). NUNCA no app
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

**Regra de segurança:** chaves de IA são exclusivamente server-side (Edge Functions Supabase). Nunca chegam no app. Se aparecerem em `EXPO_PUBLIC_*`, o `security-review` deve barrar.

---

## 5. Schema Supabase — tabelas core (mantidas da V4)

Schemas existentes que serão preservados:

| Tabela | Função | Comentário |
|---|---|---|
| `auth.users` | Auth Supabase | Padrão |
| `profiles` | Dados do usuário | Espelha `auth.users` com extras |
| `medications` | Catálogo de medicamentos GLP-1 | Estático/seed |
| `user_medications` | Medicamento ativo do usuário | FK pra `profiles` e `medications` |
| `doses` | Registro de cada dose aplicada | timestamp, local da aplicação, mg |
| `weights` | Registros de peso | timestamp, valor |
| `daily_checkins` | Check-in 1-tap diário | emotional_state, data |
| `symptom_logs` | Sintomas registrados | intensidade, contexto, FK pra checkin |
| `pending_ai_questions` | Perguntas que a IA quer fazer ao usuário | criada na V4.5 |
| `ai_insights` | Insights gerados pela IA (cache) | NOVO na V5 |
| `consultation_questions` | Perguntas do usuário pra próxima consulta | NOVO na V5 (Movimento 2) |
| `clinical_reports` | Relatórios bilíngues gerados | NOVO na V5 (Movimento 3) |
| `subscriptions` | Espelho do RevenueCat | webhook-fed |
| `user_settings` | Notificações, preferências | |
| `audit_logs` | LGPD — quem acessou o quê | NOVO na V5, obrigatório |

### Migrations novas necessárias na V5

| Migration | Função |
|---|---|
| `5xxxx_create_ai_insights.sql` | Cache dos insights gerados |
| `5xxxx_create_consultation_questions.sql` | Perguntas pra próxima consulta (Movimento 2) |
| `5xxxx_create_clinical_reports.sql` | Relatórios gerados (Movimento 3) |
| `5xxxx_create_audit_logs.sql` | Log LGPD obrigatório |
| `5xxxx_strengthen_rls_policies.sql` | RLS reforçada, FORCE ROW LEVEL SECURITY em todas as tabelas com PHI |

**Regra:** toda migration aplicada via MCP `apply_migration`, nunca via `supabase db push`. (Aprendizado da V4.5: divergência de migrations virou problema.)

---

## 6. Edge Functions — núcleo da IA

### 6.1 `insight-do-dia` (Movimento 1)

| | |
|---|---|
| Entrada | `user_id`, `checkin_id` (opcional) |
| Lê | `profiles`, `user_medications`, `doses`, `daily_checkins`, `symptom_logs` |
| Chama | Anthropic SDK com system prompt em `lib/ai/prompts.ts` |
| Devolve | `{ text, severity: 'normal'|'attention', disclaimer }` |
| Cacheia | em `ai_insights` por 24h |
| LGPD | log em `audit_logs` |

### 6.2 `memoria-perguntas` (Movimento 2)

| | |
|---|---|
| Entrada | `user_id` |
| Lê | `consultation_questions` (status='pending') |
| Faz | agrupa, prioriza, deduplica via Claude |
| Devolve | checklist estruturado + PDF |

### 6.3 `relatorio-bilingue` (Movimento 3)

| | |
|---|---|
| Entrada | `user_id`, `start_date`, `end_date` |
| Lê | `doses`, `weights`, `daily_checkins`, `symptom_logs`, `consultation_questions` |
| Faz | gera 2 versões (paciente + médico) via Claude |
| Devolve | PDF binário + JSON com dados |
| Salva | em `clinical_reports` |
| LGPD | log em `audit_logs` |

---

## 7. RevenueCat — configuração existente

App "Dose Day App" (produção):

| Item | Valor |
|---|---|
| Project ID | `proj521a5bc0` |
| Bundle ID | `com.doseday.premium` |
| Trial | 14 dias (P2W) |
| Produto mensal | `prodc19fd7f81e` (mensal_premium) |
| Produto anual | `prodedac9c7fe2` (anual_premium) |
| Webhook → Supabase | configurar pra alimentar `subscriptions` |

**Dívida técnica conhecida:** 3 apps misturados no project (legado + test store + produção). Limpar quando der tempo, não bloqueia V5.

---

## 8. LGPD — checklist arquitetural

| Item | Implementação |
|---|---|
| Consentimento explícito Art. 11 | Tela `consent.tsx` no onboarding, guardada em `profiles.consent_v5_at` |
| Base legal | "Consentimento" + "Execução de contrato" documentadas em `/docs/decisions/lgpd-base-legal.md` |
| Criptografia em repouso | nativa Supabase (AES-256) |
| Criptografia em trânsito | TLS 1.3 (default Supabase) |
| Acesso ao próprio dado | Tela "Meus Dados" em Perfil → export JSON |
| Direito ao esquecimento | Edge Function `delete-my-data` com confirmação dupla |
| Log de acesso | tabela `audit_logs`, escrita em toda leitura de PHI fora do dono |
| DPO / contato | E-mail dpo@getdoseday.com em Política de Privacidade |
| Política de Privacidade | versão V5 publicada em getdoseday.com/privacy |
| Termos de Uso | versão V5 publicada em getdoseday.com/terms |

---

## 9. Migração da V4 → V5 — checklist de transição

### O que migrar (manual ou via prompt)

- [ ] `app.json` com bundle ID `com.doseday.premium`
- [ ] `GoogleService-Info.plist` (Firebase ou só placeholder?)
- [ ] Variáveis de ambiente do `.env` (URLs Supabase + keys RevenueCat)
- [ ] Conteúdo dos `locales/` (pt-BR, en, es) — strings curadas
- [ ] Schema Supabase (já está no projeto remoto)
- [ ] Migrations relevantes da V4.5 (`pending_ai_questions`, drop `emotional_state` check)
- [ ] Apple keys da App Store Connect (mantém)

### O que NÃO migrar

- ❌ Componentes da V4 (refazer com Impeccable)
- ❌ Hooks legados (refazer)
- ❌ Edge Functions antigas (refazer)
- ❌ Screenshots da App Store (refazer com `appstore-creative-designer`)
- ❌ Migrations legacy com divergência (não tocar)

### Próxima versão na App Store

- Nome do app: DoseDay (mantém)
- Versão: **5.0.0**
- Build number: incrementa
- "What's New": copy a ser escrita via `/design:ux-copy` e `appstore-creative-designer`

---

## 10. Decisões arquiteturais registradas

ADRs (Architecture Decision Records) ficam em `/docs/decisions/`. Lista inicial:

| # | Decisão |
|---|---|
| 001 | Manter Supabase + RevenueCat existentes (não migrar provedores) |
| 002 | Bundle ID mantido — não criar app novo na Apple |
| 003 | StyleSheet nativo + Liquid Glass — sem Tailwind/NativeWind |
| 004 | Estado: React Query (servidor) + Context (cliente). Sem Redux |
| 005 | IA exclusivamente server-side via Edge Functions Supabase |
| 006 | Migrations sempre via MCP `apply_migration` (lição da V4.5) |
| 007 | Glass restrito à camada de navegação (regra liquid-glass) |
| 008 | TypeScript estrito — sem `as any`, sem `// @ts-ignore` |
| 009 | i18n carrega pt-BR sempre, en/es como opt-in |
| 010 | Sentry entra antes do beta, não no MVP do dia 1 |

Cada decisão tem doc em `/docs/decisions/NNN-titulo.md` com contexto, alternativas consideradas, escolha e consequências.

---

## 11. Padrões de código

### Imports
- Path aliases (`@/`, `@components/`, etc.) — não relativo profundo
- Ordenação: react → expo → third-party → @/ → relativo

### Naming
- Componentes: PascalCase
- Hooks: `useNomeCamelCase`
- Tipos: PascalCase + sufixo descritivo (`DoseEntry`, `CheckinPayload`)
- Constantes: SCREAMING_SNAKE_CASE
- Arquivos de rota Expo: kebab-case (Expo Router obriga)
- Arquivos de componente: PascalCase

### Componentes
- Functional only, com tipo de props inline ou `type Props = { ... }`
- Sem `React.FC`
- Estilo via `StyleSheet.create()` ao final do arquivo
- Tokens vêm de `lib/theme/tokens.ts`, nunca hardcoded

### Estado
- Server state → React Query (`useQuery`, `useMutation`)
- Client state local → `useState`
- Client state compartilhado → Context dedicado por feature

### Erros
- Try/catch nas calls async com mensagem traduzida (i18n)
- Logging via Sentry (production) e console (dev)
- Nunca silenciar erro sem log

---

## 11.0 Paralelismo via Agent View

DoseDay V5 usa **Agent View** (`claude agents`, Claude Code v2.1.139+) como motor único de paralelização. Substitui o setup manual de worktrees do plano original. Worktrees são criados automaticamente pelo Agent View em `.claude/worktrees/`.

### Setup técnico

```bash
cd /Users/leofrancaia/Desktop/dose-day-v5
claude agents
```

Abre o dashboard. Cada prompt dispatchado vira sessão background em worktree próprio. **Sem criar worktrees manualmente.**

### Como funciona

| Componente | Detalhe |
|---|---|
| Aba do terminal | 1 só — `claude agents` ocupa a tela |
| Sessões background | Cada prompt dispatchado vira Claude Code completo rodando isolado |
| Worktrees | Auto-criados em `.claude/worktrees/<session-name>/`. Removidos quando deletar a sessão (`Ctrl+X`) |
| Branches | Auto-criadas. Convenção: `feature/NN-area-curta` |
| Estados visuais | Working (animado) · Needs input (amarelo) · Completed (verde) · Failed (vermelho) · Idle (cinza) |
| Pull request status | Bolinha colorida no card (yellow checks/waiting · green passed · purple merged) |

### Regras de coordenação

1. **Léo é o único roteador.** Dispatcha cada prompt via input do Agent View
2. **Máx 3 sessões paralelas no início do projeto.** Quota some rápido
3. **Sem sobreposição de áreas.** Sessões paralelas só se editam arquivos distintos
4. **Decisões estruturais passam por Léo + Cowork antes** — toda sessão respeita
5. **Handoff por sessão.** `/handoff` salva em `docs/handoff/HANDOFF-<nome-sessao>.md`
6. **Rebase antes de mergear.** Branch rebasa em `main` antes de PR
7. **Sequenciar quando necessário.** Se 2 prompts tocam o mesmo arquivo, dispatcha um e espera mergear
8. **Skill obrigatória:** `superpowers:dispatching-parallel-agents` (orquestração interna)
9. **Cleanup ao finalizar.** `Ctrl+X` na sessão concluída libera worktree e quota

### Quando paralelizar vs sequencializar

| Cenário | Modo |
|---|---|
| 2 prompts tocam o **mesmo arquivo** | **Sequencial** |
| 2 prompts em **áreas distintas** (UI vs Edge Function vs migração) | **Paralelo** |
| Prompt HIGH demorado + LOW microcopy | Paralelo (áreas distintas) |
| Pre-ship (audit, harden, security-review) | **Sequencial** (visão única) |
| Bug crítico em produção | **Exclusivo, sequencial** |

### Quando escalar para 2 ou 3 sessões

| Fase do projeto | Nº sessões |
|---|---|
| Bootstrap (Prompts 00-03) | 1 só |
| Esqueleto navegável (Prompts 04-07) | 1-2 |
| Features paralelas (Prompts 10+) | 2-3 |
| Pre-ship | 1 só |

### Anti-padrões

| ❌ Nunca | Porquê |
|---|---|
| Duas sessões editando o mesmo arquivo simultaneamente | Race condition, silent overwrite |
| 4+ sessões paralelas no início | Quota some, sobrecarga cognitiva |
| Atualizar `CLAUDE.md` em duas sessões simultâneas | Conflito que perde decisões |
| Aprovar `--dangerously-skip-permissions` ou `auto` mode | Sessão executa sem você aprovar plano |
| Deletar sessão (`Ctrl+X`) antes de mergear PR | Perde worktree e commits não-mergeados |

### Subagents — fan-out dentro de 1 sessão

Skill `superpowers:dispatching-parallel-agents` invoca subagents automaticamente quando o prompt tem várias tarefas independentes internas. Você não precisa pensar nisso — é interno à sessão Claude Code.

### Agent Teams — NÃO usamos

Feature experimental (lead + teammates que conversam entre si). Não adotada no DoseDay V5. Razões: experimental + alto consumo + complexidade desnecessária pra PO solo.

### Cheatsheet completo

`docs/agent-view-cheatsheet.md` — atalhos de teclado, comandos, troubleshooting.

## 11.0.1 Custom Subagents — quando criar (decisão registrada)

**Decisão:** Agent View é motor padrão. Subagents só criados pra tarefas REPETITIVAS com regras CRÍTICAS.

**Gatilho de criação:** logo antes do **Prompt 16** (Edge Function Insight do Dia). Criar em sessão dedicada antes dos Prompts 16-18 dos Movimentos de IA.

### Subagents planejados pra DoseDay V5

| Subagent | Quando entra no fluxo | Por que vale especialista |
|---|---|---|
| **`security-reviewer`** | Toda migration Supabase + toda Edge Function que toca PHI | LGPD Art. 11 + criptografia em repouso são checks repetidos. Tools restritos a leitura |
| **`clinical-copy-writer`** | Toda copy nova (telas, push, email, notifications) | Vocabulário-âncora do PRODUCT.md (sem "endo", sem motivacional, sem culpa). Subagent força consistência |
| **`ia-prompt-author`** | Movimentos 1, 2, 3 (Insight do Dia, Memória de Perguntas, Relatório Bilíngue) | Disclaimer fixo + guardrails clínicos repetidos em 3+ edge functions |
| **`expo-deployer`** | EAS Build + App Store submission | Checklist de submissão se repete em toda subida. Garante que não pula passo |

### NÃO criar subagent pra

- Bootstrap (uma vez só)
- Tab bar (uma vez só)
- Migrar arquivos sensíveis (uma vez só)
- Aplicar tokens (uma vez só)
- Refactor pontual
- Qualquer feature one-shot

### Arquivos de subagent

Quando criar, vão em `.claude/agents/<nome>.md` com frontmatter:

```yaml
---
name: security-reviewer
description: Audita migrations Supabase e Edge Functions contra LGPD Art. 11
tools: [Read, Grep, Glob]  # tools restritos = só leitura
model: opus  # ou sonnet
permissionMode: plan  # nunca auto
isolation: worktree  # roda em worktree próprio
---

# System prompt do subagent
...
```

### Referência oficial

https://code.claude.com/docs/en/sub-agents — frontmatter completo, tools allowlist, isolation, model override.

---

## 11.1 RTK (Rust Token Killer) — otimização de tokens

Instalado globalmente via Homebrew (`brew install rtk`). Hook `PreToolUse` registrado em `~/.claude/settings.json` intercepta toda chamada ao tool `Bash` do Claude Code e comprime a saída em 60-90%.

| Item | Valor |
|---|---|
| Versão | v0.40.0+ |
| Binário | `/usr/local/bin/rtk` (Homebrew) ou `~/.local/bin/rtk` (install.sh) |
| Hook | `~/.claude/settings.json` — `hooks.PreToolUse[matcher=Bash]` → `rtk hook claude` |
| Documentação local | `~/.claude/RTK.md` |
| Comandos disponíveis no projeto | `rtk read`, `rtk grep`, `rtk ls`, `rtk find`, `rtk diff`, `rtk git *`, `rtk tsc`, `rtk lint`, `rtk jest`, `rtk gain` |

**Regra arquitetural:**
- Toda saída de comando shell via `Bash` é automaticamente comprimida pelo hook
- Tools `Read`, `Grep`, `Glob` do Claude Code **NÃO passam pelo hook** — pra arquivos grandes / buscas extensas, preferir `Bash: rtk <comando>`
- Analytics local: `Bash: rtk gain` mostra economia da sessão

## 12. Scripts npm padrão

```json
{
  "scripts": {
    "start": "expo start",
    "ios": "expo start --ios",
    "android": "expo start --android",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "test": "jest",
    "test:e2e": "detox test --configuration ios.sim.debug",
    "build:ios:dev": "eas build --platform ios --profile development",
    "build:ios:preview": "eas build --platform ios --profile preview",
    "build:ios:prod": "eas build --platform ios --profile production",
    "submit:ios": "eas submit --platform ios --latest",
    "supabase:types": "supabase gen types typescript --project-id pjesgdczasumgjzqyzzk > types/database.ts",
    "supabase:migration:new": "supabase migration new"
  }
}
```

---

## 13. EAS Build — `eas.json` (rascunho)

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "production": {
      "ios": { "autoIncrement": "buildNumber" }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "<preencher>",
        "ascAppId": "6756668672",
        "appleTeamId": "<preencher>"
      }
    }
  }
}
```

---

## 14. Aprendizados — Prompt 00 (Bootstrap)

Registrado em 2026-05-15 após execução do bootstrap. Não alteram o plano — documentam o que funcionou diferente do esperado.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 1 | **`@expo/ui` canary (`v0.2.0`) incompatível com SDK 54.** Usa `SafeAreaControllable` e `RNHostViewProtocol` ausentes no `expo-modules-core` SDK 54. | Reintroduzir no Prompt 04. Alternativa temporária: `expo-blur` para efeito de vidro. |
| 2 | **iOS 26 sem Expo Go.** `expo start --ios` falha com `TypeError: fetch failed` — o `xcrun simctl openurl` não tem app para abrir `exp://`. | Usar `npx expo run:ios` para todo dev local em iOS 26. EAS não afetado. |
| 3 | **`babel-preset-expo` deve ser `devDependency` explícita.** Não vem automaticamente ao recriar `package.json` manualmente. Metro não transpila sem ele. | Sempre incluir em `devDependencies` ao criar projeto Expo do zero. |
| 4 | **`react-native-worklets@0.5.1` é peer dep obrigatório do `react-native-reanimated@~4.1.x`.** | Sempre instalar os dois juntos. Sem ele, `pod install` falha com "Failed to validate worklets version". |

---

## 14.1 Aprendizados — Prompt 07 (ESLint flat config)

Registrado em 2026-05-17 após migração de `.eslintrc.js` → `eslint.config.js`.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 5 | **ESLint v10 não suporta mais legacy config.** Repos criados com bootstrap antigo precisam migrar pra flat config (`eslint.config.js`/`.mjs`) antes do primeiro `npm run lint`. | Em bootstraps futuros, já criar com flat config desde o início. |
| 6 | **`eslint-plugin-react@7.x` quebra no ESLint v10 quando `react.version: 'detect'`.** O plugin usa `context.getFilename()`, API removida na v10. Crash silencioso ao rodar lint. | Sempre pinar `react.version` explicitamente no `settings` do flat config — para Expo 54 + RN 0.81, usar `'18.0.0'`. |
| 7 | **Script `lint` em `package.json` precisa perder o `--ext .ts,.tsx`.** Flat config define os files via pattern no próprio config. Script correto: `"lint": "eslint ."`. | Aplicar em qualquer migração futura. |

---

## 14.2 Aprendizados — Prompt 09 (Supabase client + session)

Registrado em 2026-05-17 após implementação do cliente Supabase e AuthProvider.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 8 | **`@types/*` é namespace reservado pelo TypeScript.** Importar `from '@types/database'` gera TS6137 ("Cannot import type declaration files"). O tsconfig pode ter `@types/*` como path alias, mas TS bloqueia o import. | Sempre usar path relativo (ex: `../../types/database`) quando o arquivo está dentro de `lib/`. Alternativa: renomear o alias para `@db/*` ou `@schema/*`. |
| 9 | **Logs de `console.log` do React Native (Hermes) não aparecem no stdout do Metro quando redirecionado para arquivo.** Vão via CDP (Chrome DevTools Protocol) WebSocket. Capturar com Node.js conectando ao endpoint `ws://localhost:8081/inspector/debug?device=ID&page=1` e escutando eventos `Runtime.consoleAPICalled`. | Para validação headless de lógica JS no simulador, usar script Node.js com o WebSocket CDP. Não tentar capturar com `tee` ou `CI=1`. |

---

## 15. Ferramenta global de validação automatizada — `react-native-devtools-mcp`

**Instalado globalmente em 2026-05-17** após adoção do Prompt 09 (validação manual de auth ficou caro). Repo: https://github.com/pnarayanaswamy/react-native-devtools-mcp

**Localização local:** `~/react-native-devtools-mcp` (clonado + buildado)
**Registro no Claude Code:** `react-native` (global, qualquer projeto pode usar)
**Conecta a:** simulador iOS ou emulador Android atualmente booted

### Quando o Claude Code DEVE usar

| Cenário | Tool a usar |
|---|---|
| Validar visualmente uma tela após implementação | `screenshot` |
| Testar fluxo de auth (signIn, signUp, signOut) | `js_eval` chamando `supabase.auth.*` direto no runtime |
| Capturar logs do Metro durante teste | `get_js_logs` (duration, filter, level) |
| Verificar a11y de uma tela (regra clínica + LGPD) | `get_view_hierarchy` (tree ou raw, com filter) |
| Reproduzir bug reportado pelo Léo | `tap` + `type_text` + `screenshot` no fluxo descrito |
| Smoke test pós-merge | `screenshot` em cada tab + `get_view_hierarchy` |
| Validar deep link / URL scheme | `open_deeplink` |
| Logs de crash / errors do device | `get_device_logs` |

### Os 16 tools disponíveis

**Observação:** `screenshot`, `get_view_hierarchy`, `get_device_info`, `get_device_logs`, `get_metro_status`, `get_js_logs`
**Interação:** `tap`, `type_text`, `press_button`, `scroll`, `open_deeplink`, `js_eval`
**Utilidade:** `ping`, `start_recording`, `stop_recording`, `help`

### Mudança no modus operandi a partir do Prompt 10

| Antes (Prompts 04, 06, 08, 09) | A partir do Prompt 10 |
|---|---|
| Claude Code roda `expo run:ios` → Léo abre simulador → Léo manda screenshot → Claude Code analisa | Claude Code roda `expo run:ios` → Claude Code captura screenshot via `screenshot` tool → Claude Code analisa direto |
| Léo edita `useEffect` com signIn de teste → Léo cola logs no chat | Claude Code chama `js_eval('await supabase.auth.signInWithPassword(...)')` + lê logs via `get_js_logs` |
| `/impeccable critique` depende de Léo anexar screenshot | `/impeccable critique` recebe screenshot capturado automaticamente |
| Validação a11y manual (raro acontecer) | `get_view_hierarchy` no critério de aceitação de toda tela nova |

### Pré-requisitos (já satisfeitos)

- Node ≥ 20 ✅
- Xcode + iOS Simulator ✅
- Facebook IDB (instalado via `brew install idb-companion` + `pip3 install fb-idb`) — necessário para `get_view_hierarchy` no iOS

### Aprendizado integrado às regras anti-pirraça do CLAUDE.md

**Regra 20** (adicionada): Claude Code **NUNCA** delega validação manual repetitiva ao Léo se o `react-native-devtools-mcp` estiver disponível. Léo só valida o resultado final (PR + screenshots capturados pelo MCP), não os passos intermediários.

---

## 14.3 Aprendizados — Prompt 10 (telas signin/signup)

Registrado em 2026-05-17 após implementação do fluxo de autenticação completo.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 10 | **Expo Router route groups são transparentes na URL.** `(auth)` some da URL: o deep link para `app/(auth)/signin.tsx` é `/signin`, não `/(auth)/signin`. Ao usar `router.replace` ou `open_deeplink`, usar sempre o caminho sem o grupo. | Em qualquer tela nova dentro de grupos `(auth)`, `(tabs)`, etc, usar o caminho sem parênteses no deep link e no `router.push/replace`. |
| 11 | **`.expo/types/router.d.ts` não é regenerado automaticamente no type-check.** O Metro regenera ao rodar o dev server, mas `tsc --noEmit` offline não. Quando uma nova route group é criada (`(auth)`), estender manualmente o arquivo antes do type-check — caso contrário, `router.replace('/(auth)/signup')` gera TS2322. | Sempre incluir `.expo/types/router.d.ts` no escopo quando um prompt criar nova route group ou nova tela. `.expo/` está no `.gitignore`, então não commitar. |
| 12 | **`xcrun simctl io tap` não existe no Xcode / iOS 26 simulator.** O subcomando `io` do simctl não suporta `tap`, `swipe` ou `type`. Usar `idb ui tap --udid DEVICE_UDID x y` e `idb ui text --udid DEVICE_UDID "texto"` via Facebook IDB. | Toda automação de toque/texto no simulador iOS: sempre usar `idb ui *`, nunca `xcrun simctl io *`. Pré-requisito: `idb-companion` (Homebrew) + `fb-idb` (pip3). |
| 13 | **`js_eval` do MCP react-native não aguarda Promises.** Expressões async (`await supabase.auth.signIn(...)`) retornam `[]` ou `undefined`. Usar para evals síncronos apenas (ler estado, verificar valor de variável). Para auth async, preferir `open_deeplink` + verificar estado após navegação. | Nos critérios de aceitação de prompts futuros: nunca colocar `js_eval` para operações async. Usar `tap` + `type_text` + `screenshot` para fluxos de formulário. |
| 14 | **DEV link fica oculto quando existe sessão ativa.** `{__DEV__ && !session}` funciona como esperado — se há sessão persistida no SecureStore do Prompt 09, o link não aparece. Isso é comportamento correto; não confundir com bug. | Ao testar DEV links em futuros prompts: fazer `signOut` primeiro via `js_eval('supabase.auth.signOut()')` se a sessão existir. |

---

## 14.4 Aprendizados — Prompt 11 (AuthGuard + recover + perfil V1)

Registrado em 2026-05-18 após fechamento do ciclo de autenticação.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 15 | **`useRootNavigationState` é obrigatório no AuthGuard para evitar race condition.** Sem o guard `if (!navigationState?.key) return`, o `router.replace` dispara antes do navegador montar, causando crash silencioso (`navigate()` called before mount). | Todo guard de navegação baseado em sessão deve checar `navigationState?.key` antes de chamar qualquer `router.*`. |
| 16 | **`router` deve estar no array de deps do `useEffect` do AuthGuard.** O eslint `react-hooks/exhaustive-deps` sinaliza se omitido. Embora `router` seja estável, incluir é a abordagem correta para passar lint sem `// eslint-disable`. | Sempre incluir `router` nos deps de `useEffect` que chamam `router.replace/push`. |
| 17 | **Supabase `resetPasswordForEmail` retorna sucesso mesmo para emails inexistentes (segurança por design).** Não é um bug — é o comportamento intencional da API para não vazar existência de conta. Só expor erro de rede ao usuário; nunca expor o status real do email. | Em fluxos de recover/magic-link: usar `isNetworkError(error.message)` para filtrar o que exibir. Nunca mostrar `error.message` bruto do Supabase diretamente ao usuário. |
| 18 | **O `AuthButton` já computa `isDisabled = disabled || loading` internamente.** Não é necessário passar `disabled={!email || loading}` — passar só `disabled={!email}` já é suficiente; o loading bloqueia via prop `loading`. | Ao usar `AuthButton`, só passar `disabled` para a condição de negócio (campo vazio, validação falhou). Loading é separado. |
| 19 | **`idb ui text` trunca strings com `@` após ~16 caracteres.** Emails como `"leonardo@teste.com"` ficam `"leonardo@teste."` com o `@` sendo interpretado como separador de argumento. Workaround: enviar em dois fragmentos (`"leonardo@teste."` + `"com"`). | Ao digitar email via IDB em testes MCP: sempre dividir no ponto após `@` se o email total tiver >16 chars. |

---

**Fim do documento.**

---

## 14.5 Aprendizados — Prompt 12 (conectar Home e Doses ao Supabase)

Registrado em 2026-05-18 após primeiro prompt com dados reais.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 20 | **`staleTime: 5min` é adequado para dados clínicos de dose.** Doses semanais não mudam segundo a segundo. `refetchOnWindowFocus: false` é correto em mobile (não há conceito de window focus como na web). Configurado em `lib/queryClient.ts`. | Manter esses defaults para todas as queries clínicas. Queries de menor sensibilidade (config do perfil) podem usar `staleTime: Infinity`. |
| 21 | **`getDoseSummary` é a única fonte de verdade para cálculo da próxima dose.** Fórmula: `nextDate = last.applicationDate + last.daysUntilNextDose`. Diff em dias: `round((nextDateMidnight - todayMidnight) / 86400000)`. Não existe entrada futura em `medication_applications` (CHECK constraint `<= now() + 1h`). | Todo cálculo de "próxima dose" no client-side deve usar esta fórmula. Nunca buscar entradas futuras no DB — elas não existem por design. |
| 22 | **`mapQueryError` centraliza tradução de erros de rede para PT-BR.** Padrão estabelecido em `lib/supabase/queries/errors.ts`. Detecta erros de rede (fetch/network), JWT expirado (jwt/401), e genérico. | Todos os hooks que fazem queries Supabase devem usar `mapQueryError` para exibir mensagens ao usuário. Nunca exibir `error.message` bruto. |
| 23 | **DoseCard.time não tem equivalente no banco.** `medication_applications` não tem campo de horário (doses semanais). V1: mapper passa `'--'`. DoseCard guarda o campo mas omite visualmente quando `time === '--'`. | Em V2 (se horário for necessário): adicionar coluna `application_time` na tabela e popular no flow de registro. |
| 24 | **Loading inline (manter scaffold visível) é superior a full-screen spinner.** Home implementou corretamente desde o início; Doses foi corrigido no harden. Manter o contexto visual (headline, SectionHeaders) durante o fetch reduz desorientação. | Em telas com seções fixas (título, headers), sempre usar loading inline nas seções de dados, nunca substituir a tela inteira por spinner. |

## 14.6 Aprendizados — Prompt 13 (registrar nova dose)

Registrado em 2026-05-18 após primeiro fluxo de WRITE do projeto.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 25 | **`display="compact"` do DateTimePicker é invisível em iOS 26 dark mode.** Renderiza com altura/contraste zero. Workaround: botão `TouchableOpacity` customizado com toggle `showPicker` → `<DateTimePicker display="inline" />`. `maximumDate={new Date()}` bloqueia datas futuras no picker. | Sempre usar este padrão em qualquer tela que precise de DateTimePicker em iOS 26. Não tentar `display="compact"` nem `display="spinner"`. |
| 26 | **`simctl io tap` e `simctl io keyboard type` foram removidos no Xcode moderno.** Não funcionam via MCP. Substituir por `idb ui tap X Y --udid <DEVICE_ID>` e `idb ui text "texto"`. Coordenadas: `idb ui describe-all --udid <DEVICE_ID>`. IDB instalado em `/Users/leofrancaia/.local/bin/idb`. | Todos os testes MCP que precisam de tap ou digitação devem usar IDB. Mapear coordenadas com `describe-all` antes de rodar a bateria. |
| 27 | **Tab bar Liquid Glass não expõe items no accessibility tree do IDB.** Navegação entre abas via `mcp__react-native__open_deeplink` com `doseday:///(tabs)/<aba>` é a única abordagem confiável para testes automatizados. | Substituir tap em tab bar por `open_deeplink` em toda bateria MCP futura. |
| 28 | **Typed routes Expo Router:** `router.push('/dose/registrar')` gera TS error se o arquivo de rota não existir no momento da escrita. Criar o arquivo placeholder antes de referenciar a rota, depois substituir pela implementação. | Ao escrever código que navega para uma rota nova, criar o arquivo de rota primeiro (ainda que vazio), depois escrever o código que o referencia. |
| 29 | **Registro de dose ≠ Registro de sintomas. Separação de momentos é o que torna o V5 "memória inteligente".** O ato de aplicar a dose acontece em segundos (North Star: 6s). Efeitos colaterais aparecem horas/dias depois e pertencem ao Diário. Misturar os dois momentos no mesmo form quebra o "6 segundos pra registrar" e confunde ato clínico com experiência subjetiva. | Não migrar padrões da V4 sem questionar UX. Qualquer campo que não pertença ao momento de aplicação (hora, local, dose) deve ser avaliado para o Diário. `side_effects` foi removido do form de Dose e ficará no Prompt 14+ (Diário). |
| 30 | **`useRef` para inicialização única (autopop sem re-fill).** `autoFilledRef.current` permite inicializar um campo com valor do perfil uma única vez, sem re-popular quando usuário limpa o campo, e sem `exhaustive-deps` lint warning. | Usar este padrão em qualquer campo que precise de autopop one-shot a partir de dados assíncronos (perfil, contexto). |

## 14.7 Aprendizados — Prompt 15 (Diário V1)

Registrado em 2026-05-18 após implementação do Diário V1.

| # | Aprendizado | Impacto em prompts futuros |
|---|---|---|
| 31 | **Metro pode manter bundle stale após adicionar módulos/rotas novas.** Mesmo com `expo start -c`, o simulador carregou placeholder antigo e RedBox `Requiring unknown module` até o app ser encerrado e reaberto. | Após criar novos arquivos importados por uma rota já aberta, se o simulador mostrar módulo desconhecido ou tela antiga, executar `xcrun simctl terminate booted com.doseday.premium` e reabrir com `open_deeplink`. Não diagnosticar como bug de código antes do relaunch. |
| 32 | **MCP `tap`/`press_button` ainda pode cair em `simctl io`, que não suporta tap/key no Xcode atual.** A validação do Diário precisou usar IDB para toque/digitação, com coordenadas em points vindas de `idb ui describe-all`. | Em baterias MCP, usar `open_deeplink`, `screenshot` e `get_view_hierarchy` do MCP; para interação física em iOS, preferir `/Users/leofrancaia/.local/bin/idb ui tap/text/key-sequence --udid <DEVICE_ID>`. |
| 33 | **Email de teste via IDB é mais confiável em 3 fragmentos.** O split `"leonardo@teste." + "com"` ainda perdeu caracteres em uma tentativa (`leonardo@tescom`). O fluxo estável foi `"leonardo"` + `"@teste."` + `"com"`. | Ao digitar email com `@` via IDB, usar fragmentos curtos e validar por screenshot/árvore antes de enviar. Para `leonardo@teste.com`, preferir 3 fragmentos. |
| 34 | **Screenshots reais no PR ficam verificáveis quando versionadas como assets.** O MCP retorna imagem no chat, mas para embed estável no PR o caminho mais simples foi salvar PNG via `xcrun simctl io booted screenshot` em `assets/screenshots/prompt15/` e espelhar em `.impeccable/critique/screenshots/`. | Quando o critério exigir markdown `![desc](url)` no PR, salvar screenshots em `assets/screenshots/<prompt>/` e commitar junto. O PR pode referenciar raw URLs desses arquivos. |
| 35 | **`DiarioTimelineItem` deve renderizar discriminated union no caller, não com `item as never`.** O workaround do plano passa no TS, mas perde segurança de tipo justamente no merge da timeline. | Ao juntar arrays heterogêneos para timeline/feed, renderizar por branch (`entry.kind === ...`) e passar props discriminadas explícitas para o componente. |
