---
target: Home Screen V1
total_score: 28
p0_count: 0
p1_count: 1
timestamp: 2026-05-17T11-31-43Z
slug: app-tabs-index-tsx
---
## Anti-Patterns Verdict
LLM: Não parece gerado por AI. Clinical Midnight específico, Vital Mint com raridade real, dois cards com hierarquia diferente. Automated scan: [] — zero findings.

## Design Health Score
| # | Heurística | Score | Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Sem loading state (mock) |
| 2 | Match System / Real World | 4 | Linguagem natural perfeita |
| 3 | User Control and Freedom | 2 | Read-only intencional V1 |
| 4 | Consistency and Standards | 3 | Convenções iOS respeitadas |
| 5 | Error Prevention | 3 | Sem inputs = sem erros |
| 6 | Recognition Rather Than Recall | 4 | Tudo visível |
| 7 | Flexibility and Efficiency | 1 | Sem shortcuts (V1) |
| 8 | Aesthetic and Minimalist Design | 4 | 3 blocos, 3 perguntas |
| 9 | Error Recovery | 2 | N/A no mock |
| 10 | Help and Documentation | 2 | Sem first-run |
| **Total** | | **28/40** | |

## What's Working
1. Vital Mint Rarity perfeita — único elemento verde, olho vai direto ao "2"
2. Tonal layering sem sombra — bgBase→bgElevated separa cards, Flat-by-Default
3. Linguagem da Mariana — "dias até sua próxima dose", greeting contextual

## Priority Issues
[P1] InsightCard e NextDoseCard visualmente idênticos — fix: border 0.5px sutil no InsightCard
[P2] Sem accessibilityLabel nos elementos compostos — fix: accessible+accessibilityLabel nos containers
[P3] Sem disclaimer de IA no InsightCard — fix: prop disclaimer opcional

## Minor Observations
- Right-aligned date trunca em iPhones menores
- Testar Dynamic Island
- Greeting por hora: comportamento esperado (hora real JS != status bar screenshot)
