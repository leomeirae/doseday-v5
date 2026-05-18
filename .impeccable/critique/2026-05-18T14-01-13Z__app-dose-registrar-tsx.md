---
target: app/dose/registrar.tsx
total_score: 31
p0_count: 0
p1_count: 0
timestamp: 2026-05-18T14-01-13Z
slug: app-dose-registrar-tsx
---
## Design Health Score (pós-fixes P1/P2)

| # | Heurística | Score | Achado principal |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Loading no CTA, erro inline. Sem feedback do autopop |
| 2 | Match / real world | 3 | PT-BR correto. chevron.down metáfora de dropdown |
| 3 | User control and freedom | 3 | hitSlop=13 → 44pt efetivos (fix aplicado) |
| 4 | Consistency and standards | 3 | Tokens consistentes |
| 5 | Error prevention | 3 | "(opcional)" adicionado ao label de chips (fix aplicado) |
| 6 | Recognition over recall | 3 | Autopop correto |
| 7 | Flexibility and efficiency | 3 | Chips em flexWrap — todos visíveis (fix aplicado) |
| 8 | Aesthetic and minimalist design | 4 | Vital Mint < 10%, sem decoração excessiva |
| 9 | Error recovery | 3 | Zod messages específicas. errors.form sem render (P3 defer) |
| 10 | Help and documentation | 3 | Empty state tappable → /perfil (fix aplicado) |
| **Total** | | **31/40** | **Boa qualidade** |

## P3 defer: errors.form sem render no JSX
