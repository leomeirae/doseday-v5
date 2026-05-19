# Prompt 17: Tela Relatorios V1

## Summary

Criar a tela `Relatorios` como superficie clinica premium para Mariana revisar o tratamento antes da consulta: 4 cards de chart com dados reais, periodos fixos visiveis por card, estados vazios robustos, sem glass em conteudo e com Vital Mint restrito ao `AdherenceRingCard` quando aderencia for `>=80%`.

Branch de execucao: `feature/17-relatorios-v1`.

Referencia V4 lida antes do plano, sem copy-paste:
`reports.tsx`, `useWeightLogs.ts`, `useReportHistory.ts`, `reportTemplate.ts` em `/Users/leofrancaia/Desktop/Dose-Day-Jules-1/`. Reaproveitar apenas aprendizados de produto: copy clinica objetiva, periodo legivel com correcao de timezone/date-only, semana/periodo como contexto, loading com feedback e relatorio medico como evolucao futura.

## Skills

| Fase | Skill | Uso |
|---|---|---|
| Planejamento | `impeccable /shape` | Shape brief para 4 cards + periodos fixos |
| Implementacao UI | `impeccable /craft` | Cards em StyleSheet nativo, Surface elevated, sem glass |
| RN | `react-native-best-practices` + `svg` | Expo/RN, charts, `react-native-svg` para ring |
| Queries | `supabase-postgres-best-practices` | Queries em `reports.ts`, filtros por `user_id` + datas |
| Refinamento | `impeccable /polish` | Espacamento, cor, motion antes do PR |
| Edge cases | `impeccable /harden` | Sem dados, periodo vazio, peso com 1 ponto |
| Pre-merge | `impeccable /critique` | Score alvo `>=30/40` |
| Plano persistido | `superpowers:writing-plans` | Salvar plano antes de qualquer codigo |

## Execution Plan

| Etapa | O que fazer | Checkpoint |
|---|---|---|
| 1 | Criar branch `feature/17-relatorios-v1` e salvar plano | Plano versionado antes de codigo |
| 2 | Implementar queries em `lib/supabase/queries/reports.ts` | Dados tipados de peso, doses semanais, sintomas, aderencia |
| 3 | Criar hooks React Query | `enabled: !!userId`, query keys por usuario, sem `as any` |
| 4 | Criar cards em `components/relatorios/` | 4 cards + `ChartEmptyState`, StyleSheet nativo |
| 5 | Substituir placeholder de `app/(tabs)/relatorios.tsx` | Scroll vertical com cards + placeholder `medical_reports` |
| 6 | Rodar `/impeccable polish` | Ajustes de densidade, spacing, cor e motion |
| 7 | Popular fixtures via Supabase MCP `apply_migration` | Dados completos para validacao visual/performance |
| 8 | Rodar 12 testes MCP + greps tecnicos | Evidencia real, screenshots, cleanup fixtures |
| 9 | Rodar `/impeccable harden` e `/impeccable critique` | Edge cases cobertos, score `>=30/40` |
| 10 | Atualizar `CLAUDE.md` e `docs/architecture.md`, abrir PR com screenshots reais | PR verificavel |

## Data And Color Rules

| Item | Regra travada |
|---|---|
| Peso | Fonte canonica: `weight_logs`. Nao usar `daily_checkins.weight`, porque nao existe no schema atual |
| Sintomas | `quick_logs.log_type` + `daily_checkins.symptoms` |
| Doses | `medication_applications`, agrupadas por semana |
| Aderencia | `user_profiles.treatment_start_date` + aplicacoes desde inicio; V1 assume 1 dose esperada por semana |
| `colors.brand` | So no `AdherenceRingCard` quando aderencia `>=80%` |
| `semanticPositive` | So no delta de peso quando perda alinha com expectativa do tratamento |
| `semanticInfo` | Cor padrao de linhas, bars e donut |
| Grep obrigatorio | `colors.brand` em `components/relatorios` deve aparecer em exatamente 1 arquivo e 1 contexto condicional `>=80%` |

## Karpathy Checks

| Disciplina | Decisao |
|---|---|
| Assumptions | Nao ha skipped dose real no schema atual; bar chart V1 mostra aplicadas, sem inventar puladas. `medical_reports` fica placeholder V2. |
| Could 50 lines do this? | Peso, doses, sintomas e ring devem ficar simples. Se um card virar abstracao grande, reescrever menor. |
| Surgical changes | Cada arquivo novo traceia direto para queries, hooks, cards, tela, screenshots ou docs finais do Prompt 17. Sem refactor adjacente. |
| Goal-driven | Sucesso = 4 cards reais, fixtures limpas, 12 testes MCP, greps passando, 5 screenshots reais, critique `>=30/40`. |

## Risks

| Risco | Mitigacao |
|---|---|
| Dados reais escassos | Fixtures via `apply_migration`, com marker rastreavel e cleanup confirmado |
| Lixo em producao | Deletar fixtures pos-validacao e conferir counts |
| Vital Mint vazar | Grep exato de `colors.brand`; bloqueia merge se aparecer fora do ring |
| Jank em charts | Medir scroll com fixtures completos e frame monitor via `js_eval` |
| Chart quebrar com 1 ponto | Fallback especifico no card de peso |
| Date off-by-one | Usar padrao V4 consciente: date-only com meio-dia quando necessario para display |
| MCP tap instavel | Preferir `open_deeplink`; IDB para interacao fisica se necessario |

## Files

| Arquivo | Acao |
|---|---|
| `docs/superpowers/plans/2026-05-19-tela-relatorios-v1.md` | criar antes do codigo |
| `lib/supabase/queries/reports.ts` | criar |
| `hooks/useWeightHistory.ts` | criar |
| `hooks/useDoseAdherence.ts` | criar |
| `hooks/useSymptomDistribution.ts` | criar |
| `components/relatorios/WeightChartCard.tsx` | criar |
| `components/relatorios/DoseAdherenceCard.tsx` | criar |
| `components/relatorios/SymptomDistributionCard.tsx` | criar |
| `components/relatorios/AdherenceRingCard.tsx` | criar |
| `components/relatorios/ChartEmptyState.tsx` | criar |
| `app/(tabs)/relatorios.tsx` | substituir placeholder |
| `assets/screenshots/prompt17/` | criar screenshots reais |
| `docs/architecture.md` | atualizar aprendizados |
| `CLAUDE.md` | atualizar historico |

## Validation

| # | Validacao | Criterio |
|---|---|---|
| 1 | Fixture setup via Supabase MCP `apply_migration` | >=10 `weight_logs`, doses 30d/8 semanas, sintomas e `daily_checkins` |
| 2 | Cold start + login Leonardo | Home renderiza |
| 3 | Abrir Relatorios | Tela renderiza sem crash |
| 4 | Screenshot geral | 4 cards + placeholder por scroll |
| 5 | A11y hierarchy | Cards com `accessibilityLabel` descritivo |
| 6 | WeightChart | Linha/area, delta e 1 ponto ok |
| 7 | DoseAdherence | Bars semanais com labels |
| 8 | SymptomDistribution | Donut + total central + legenda |
| 9 | AdherenceRing | Percentual e cor correta por faixa |
| 10 | Empty state | Remover peso temp, card mostra mensagem especifica |
| 11 | Restaurar/limpar fixtures | Counts confirmam limpeza |
| 12 | Performance scroll | Com fixtures completos, scroll do topo ate placeholder `medical_reports`; via `react-native-devtools-mcp js_eval`, medir frames `>16ms`; criterio: zero frame drops sustentados no scroll |
| 13 | `npm run type-check` | 0 erros |
| 14 | `npm run lint` | 0 erros novos |
| 15 | Greps tecnicos | Sem Recharts; gifted-charts em 3 cards; zero hex hardcoded; `colors.brand` exatamente no ring |
| 16 | `/impeccable polish` | Ajustes aplicados |
| 17 | `/impeccable harden` | Edge cases revisados |
| 18 | `/impeccable critique` | Score `>=30/40` |
| 19 | PR | 5 screenshots reais em `assets/screenshots/prompt17/` embedadas |

## Defaults

| Item | Default |
|---|---|
| Chart lib | `react-native-gifted-charts@1.4.76` |
| Ring | SVG puro, sem Skia |
| Periodos | 90 dias, 8 semanas, 30 dias, desde inicio |
| Glass | Apenas navegacao existente, nunca cards |
| `medical_reports` | Placeholder sem acao funcional |
| Commit alvo | `feat(relatorios): tela Relatorios V1 com 4 graficos premium` |
