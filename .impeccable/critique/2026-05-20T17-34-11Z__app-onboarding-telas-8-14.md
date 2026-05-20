---
target: onboarding telas 8-14 (24c)
total_score: 36
p0_count: 0
p1_count: 0
timestamp: 2026-05-20T17-34-11Z
slug: app-onboarding-telas-8-14
---
# Critique — Onboarding telas 8-14 (Prompt 24c)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | "Passo X de 14" sempre visível; loading com 5 etapas spinner→check; CTAs com spinner |
| 2 | Match System / Real World | 4 | Copy clínica PT-BR direta; chips de dose comum por medicamento |
| 3 | User Control and Freedom | 3 | Back nos steps 8-12, skip nos opcionais; sem affordance de sair do onboarding (OnboardingShell.onClose não usado) |
| 4 | Consistency and Standards | 4 | OnboardingShell/SelectionCard/CTA consistentes em todas as telas |
| 5 | Error Prevention | 4 | Zod por step; CTA disabled até válido; consent CTA disabled até checkbox |
| 6 | Recognition Rather Than Recall | 4 | Chips de dose comum; valores hidratados pré-preenchidos no retorno |
| 7 | Flexibility and Efficiency | 3 | Chips de dose como atalho; skip nos opcionais; sem atalhos avançados (ok p/ onboarding) |
| 8 | Aesthetic and Minimalist Design | 4 | Sóbrio clínico; Vital Mint restrito (CTA, seleção, pulse); zero glass em conteúdo |
| 9 | Error Recovery | 3 | Fallback de IA gracioso; complete() reembala erro real como genérico "Erro ao concluir onboarding" |
| 10 | Help and Documentation | 3 | Subtítulo explicativo por step; nota de skip; links Termos/Política (stub "em breve") |
| **Total** | | **36/40** | **Strong** |

## Anti-Patterns Verdict

**LLM assessment:** Não parece AI-slop. Tema graphite-escuro + Vital Mint é anti-reflexo deliberado (healthcare costuma ser branco+teal). Zero gradient text, zero glass em conteúdo, zero side-stripe border, zero hero-metric template. SelectionCards são lista de rádio (não grid de cards idênticos). PulseAnimation dá personalidade à loading sem exagero.

**Deterministic scan:** Detector não suporta arquivos React Native (.tsx nativo, sem markup web) — `detector not found` para o path. Revisão manual de bans: aprovado.

## Overall Impression

Fluxo coeso e clínico que cumpre a estratégia de "onboarding como captação" do PRODUCT.md. A tela loading + result entrega percepção de valor real (insight de IA citando trials SURMOUNT) antes do paywall. Maior força: a IA processa dados reais. Maior oportunidade: melhorar o surfacing de erro em `complete()`.

## What's Working

1. **Loading screen como gatilho de valor** — PulseAnimation + 5 etapas sequenciais + insight de IA real. Não é placebo: a Edge Function processa os dados do user.
2. **Result dual** — card de IA (educacional, com trials nomeados) + cards de fato local computados client-side. Disclaimer fixo presente.
3. **Consistência visual** — OnboardingShell unifica header/progresso/CTA nas 14 telas.

## Priority Issues

- **[P2] `complete()` mascara o erro real do Supabase.** PostgrestError (objeto puro) é reembalado como "Erro ao concluir onboarding". Dificulta diagnóstico (foi o que escondeu o bug do `recordConsent`). Fix: preservar/loggar o erro original. Comando: `harden`.
- **[P2] Sem affordance de abandonar o onboarding.** Telas 8-12 não passam `onClose` ao OnboardingShell. Baixo risco, mas usuário fica sem saída exceto back-até-o-início. Comando: `harden`.
- **[P3] Card de insight de IA muito longo no result.** Body de 260-310px de texto num momento de alta carga. Aceitável (é o "valor"), mas considerar truncar com "ver mais".

## Persona Red Flags

**Mariana (paciente, dia corrido):** Fluxo é tappável em 1 toque por step, copy curta. Loading de 5s respeita o tempo dela com transparência. Sem cobrança/gamificação. Sem red flags relevantes.

**Profissional de saúde (leitor secundário):** Não vê o onboarding diretamente, mas os dados capturados (dose, medicamento, concerns) alimentam o relatório. Captura completa.

## Minor Observations

- `consent.dataCollection` (checkbox opcional de analytics) existe no i18n mas não é renderizado — decisão documentada (sem coluna de persistência; checkbox falso seria dark pattern).
- `treatment_status='planning'` pula a IA corretamente — result mostra só cards locais.

## Questions to Consider

- O insight de IA no result deveria ter um teto de tamanho para não competir com o CTA?
- Faz sentido registrar o consentimento no momento do step `consent` (não em `complete()`), para sobreviver a app-kill?
