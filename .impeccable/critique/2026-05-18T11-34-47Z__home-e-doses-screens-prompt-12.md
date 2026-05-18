---
target: Home e Doses screens — Prompt 12
total_score: 27
p0_count: 0
p1_count: 1
timestamp: 2026-05-18T11-34-47Z
slug: home-e-doses-screens-prompt-12
---
## Design Health Score (pós-harden)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading inline em ambas as telas (pós-fix). Sem pull-to-refresh. |
| 2 | Match System / Real World | 3 | PT-BR correto. Terminologia clínica apropriada. |
| 3 | User Control and Freedom | 2 | Sem CTAs de ação nas telas (deferred por spec). |
| 4 | Consistency and Standards | 3 | Loading agora consistente entre Home e Doses. |
| 5 | Error Prevention | 3 | Null-guard em dose corrigido. A11y label corrigido. |
| 6 | Recognition Rather Than Recall | 3 | Todos os cards têm labels visíveis. |
| 7 | Flexibility and Efficiency | 2 | Read-only — ação de log deferred. |
| 8 | Aesthetic and Minimalist Design | 3 | Vital Mint rarity mantida. • -- removido. |
| 9 | Error Recovery | 3 | Retry button touch target 44pt. Mensagens PT-BR. |
| 10 | Help and Documentation | 2 | InsightCard mockado (deferred). |
| **Total** | | **27/40** | **Solid foundation — P0/P1 resolvidos** |

## Deferred (spec constraints)
- Empty state CTA: deferred por spec "Sem CTA de ação"
- InsightCard static: deferred por spec "InsightCard continua mockado"
