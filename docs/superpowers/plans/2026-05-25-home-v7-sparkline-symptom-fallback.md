# Home v7 — sparkline expand + symptom fallback

**Status:** planejado, aprovado por Léo em 2026-05-25.
**Branch:** `codex/complete-home-v7-clean` (worktree em `/private/tmp/dose-day-v5-home-v7-clean-20260525`).
**Origem:** segundo round do `/impeccable critique components/home/HomeV7Content.tsx`. Worktree já tem trabalho não-commitado que resolveu P1 (token drift, hero ultralight codificado, reorder de seções), P2 primary action, e quase todos os minors. Restam dois itens do critique original: P2 sparkline ainda decorativa, e fallback silencioso em `formatSymptomMemory` para tipos não mapeados.

## Karpathy

**Assumptions:**
1. Sparkline fica **quieta** (companion ao 48pt ultralight, não chart primário). The Mint Soft State Rule (recém-adicionado a DESIGN.md §2) posiciona sparkline endpoint como indicador de estado, não como linha de marca. Fix é geométrico (tamanho), não cromático.
2. Dose markers ficam fora de escopo: exigiriam cross-query weight × dose por data e quebram o registro quieto.
3. Concordância de gênero em "registrada" é bug pré-existente — fora de escopo. Sinalizar em run notes.
4. Screenshots do simulador enviados por Léo em 2026-05-25 16:07 são o baseline visual.

**Could 50 lines do this?** Yes. ~17 linhas.

**Each line traces:**
- 2 linhas em `styles.sparkline`: `width '60%' → '100%'`, `height 32 → 48` → P2 sparkline.
- 6-linha helper `prettifySymptomType` + 2-linha update em `formatSymptomMemory` → minor `formatSymptomMemory` silencia tipo.

## Files

| Arquivo | Mudança |
|---|---|
| `components/home/HomeV7Content.tsx` | `styles.sparkline`: width 100%, height 48. `formatSymptomMemory`: usa `prettifySymptomType(symptom.type)` em vez de "Uma observação". Adiciona helper `prettifySymptomType`. |

## Riscos

1. Sparkline 100% × 48pt pode dominar visualmente. Mitigação: screenshot diff. Se sobrepuser o número, escalar para 80% × 40pt antes do commit.
2. Tipos não mapeados renderizam com identificador raw em-ish ("Vomiting severe registrada em..."). Pior que tradução, melhor que silêncio. Aceitável como fallback; fix correto é crescer `SYMPTOM_LABELS`.
3. "Cansaço registrada" (concordância) continua quebrado. Pré-existente — flag, não corrige aqui.

## Fora de escopo

- Dose markers no sparkline.
- Promover sparkline a primary chart com `clinicalWeight` mint + `clinicalDose` blue.
- Concordância de gênero / forma verbal.
- Expansão completa de `SYMPTOM_LABELS`.
- First-run onboarding, undo affordance (escopo futuro).

## Critérios de sucesso (verificáveis)

1. `grep -E "width: '60%'|height: 32" components/home/HomeV7Content.tsx` retorna 0 dentro do bloco `styles.sparkline`.
2. `prettifySymptomType` existe; `formatSymptomMemory` não retorna mais a string genérica "Uma observação foi registrada em...".
3. `npx tsc --noEmit` limpo.
4. `npx eslint components/home/HomeV7Content.tsx` limpo.
5. Screenshot simulador salvo em `assets/screenshots/home-v7-clean/03-sparkline-fallback.png` — sparkline mais larga e alta; seção de peso balanceada.

## Execução

Edits diretos via Edit. Type-check + lint via Bash. Screenshot via react-native MCP (simulador já bootado).
