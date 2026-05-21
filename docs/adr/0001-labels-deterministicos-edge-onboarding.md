# ADR 0001 — Labels determinísticos no servidor (Edge Function `generate-onboarding-insight`)

**Data:** 2026-05-20
**Status:** Aceito
**Origem:** Prompt 33 (contrato estruturado do onboarding insight)
**Decisores:** Léo (PO) + Codex App (arquitetura) + Cowork (validação)

---

## Contexto

A Fase 1 do redesign (`08-direcao-visual-primeiros-3-minutos.md`) definiu um contrato estruturado pra Edge Function `generate-onboarding-insight`:

```typescript
{
  stageLabel: string       // ex: "Semana 8"
  medicationLabel: string  // ex: "Mounjaro 5mg"
  goalLabel: string        // ex: "Meta de peso"
  deltaLabel: string       // ex: "Faltam 10kg"
  shortInsight: string     // texto narrativo curto
  nextStep: string         // próximo passo no app
  contextBullets: string[] // bullets opcionais "como o DoseDay vai acompanhar"
  disclaimer: string       // disclaimer LGPD/clínico fixo
}
```

A questão arquitetural: **quem calcula cada campo?**
- Opção A: IA gera todos os 8 campos
- Opção B: servidor calcula labels factuais (stage, medication, goal, delta) determinísticamente; IA gera apenas os 3 campos narrativos (`shortInsight`, `nextStep`, `contextBullets`)

P009 = A (D015) já bloqueou citações nominais a estudos clínicos. Mas restam outros riscos de alucinação IA em campos críticos: errar a semana do tratamento, errar a dose, inverter peso atual e meta.

## Decisão

**Opção B — labels factuais determinísticos no servidor.**

| Campo | Calculado por | Origem |
|---|---|---|
| `stageLabel` | Servidor | `treatment_week` já normalizado pelo onboarding → "Semana N do tratamento" |
| `medicationLabel` | Servidor | `${medication} ${dose}mg` direto do payload estruturado |
| `goalLabel` | Servidor | `goal_weight` direto do payload estruturado |
| `deltaLabel` | Servidor | `initial_weight - current_weight` + direção → "Xkg abaixo/acima do peso inicial" |
| `shortInsight` | IA | Texto narrativo de 1-2 frases, sem citar estudos, sem claims clínicos |
| `nextStep` | IA | Sugestão de próximo passo dentro do app (registrar dose, marcar sintoma, etc.) |
| `contextBullets` | IA | 2-3 bullets "como o DoseDay vai acompanhar", sem fisiologia |
| `disclaimer` | Servidor | String fixa da Edge Function, igual ao disclaimer do onboarding |

Schema Zod valida output da IA. Servidor monta resposta final juntando campos determinísticos + campos IA validados.

## Alternativas consideradas

| Alternativa | Por que rejeitada |
|---|---|
| Tudo IA (Opção A) | Risco real de alucinação em campos factuais. Edge Function da V4 já errou semana e dose em testes. Em produto clínico, custo de erro factual >> ganho de "fluidez" |
| Cliente calcula labels | Duplica lógica em cada plataforma. Cliente não tem fonte canônica de `treatment_start_date` confiável (depende do que onboarding salvou) |
| Edge Function devolve só dados crus, cliente formata | Quebra promessa de "memória clínica organizada pelo backend" e dificulta i18n |

## Consequências

### Positivas
- Zero risco de IA alucinar campo factual (semana errada, dose trocada, meta invertida)
- Permite trocar provedor de IA sem mexer em campos críticos
- i18n centralizado no servidor (labels com placeholders)
- Edge Function fica mais barata: prompt mais curto, output mais curto

### Negativas
- Lógica de cálculo de `stageLabel` e `deltaLabel` vive em TS no servidor — precisa de teste próprio no fluxo da Edge Function
- Mudar formato de label exige redeploy da Edge Function (não é tunável só por prompt)

### Neutras
- Schema Zod fica mais simples (só valida campos IA), mas o tipo final que volta ao client tem 8 campos garantidos

## Implementação

Ver Prompt 33 (`docs/prompts/33-HIGH-onboarding-insight-contract.md`) etapa 7 + plano persistido em `docs/superpowers/plans/2026-05-20-edge-onboarding-insight-contrato.md`.

## Reversibilidade

**Difícil de reverter.** Cliente (Result + Home) vai consumir o contrato estruturado. Voltar pra "tudo IA" exigiria mudança em 3+ arquivos do cliente. Reverter campo a campo é possível mas custoso.

Por isso esse ADR existe.
