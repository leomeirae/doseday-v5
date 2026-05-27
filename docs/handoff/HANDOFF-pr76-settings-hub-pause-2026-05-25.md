# HANDOFF — PR Settings Hub (PAUSADO)

**Data da pausa:** 2026-05-25
**Branch:** `feature/38-settings-hub-screens`
**Último commit pushed:** `1b95261` (5d SettingsSectionHeader)
**Worktree:** `/private/tmp/dose-day-v5-settings-76`
**Status:** componentes base prontos. Pausado antes da etapa 6 (telas em `app/configuracoes/`).

> **Nota sobre nomenclatura:** este PR é chamado internamente de **"PR Settings Hub"** (sem número) porque ainda não foi aberto formalmente no GitHub. O número real só será atribuído quando a etapa 22 do plano executar `gh pr create`. O PR #76 oficial no GitHub é este handoff doc (`d9d0e75`).

---

## Por que está pausado

Léo optou por finalizar primeiro a etapa do PR #75 (Pivot Home Sheets, mergeado em `3b7e93e`) antes de seguir com Settings. Trabalho NÃO foi perdido — 5 commits novos pushed na branch `feature/38-settings-hub-screens`, prontos pra retomada.

---

## O que está feito (commits pushed)

| Etapa | Commit | Descrição |
|---|---|---|
| 1–4 | `586aa9f` (pós-rebase) | Plano persistido em `docs/superpowers/plans/2026-05-25-settings-hub-screens.md` |
| 5.0 | `06f15da` | 3 packages instalados via `npx expo install`: `expo-web-browser`, `expo-store-review`, `expo-sharing` |
| 5a | `594ff6d` | `components/settings/SettingsGroup.tsx` (~30 LOC) — wrapper card iOS-native |
| 5b | `047d04c` | `components/settings/SettingsRow.tsx` (~90 LOC) — linha com `icon` + `label` + `chevron` + `destructive` + `accessibilityRole="button"` + token `colors.destructive` (iOS HIG red) |
| 5c | `3edf9ac` | `components/settings/SettingsFooter.tsx` (~60 LOC) — rodapé com Termos · Versão dinâmica · Política via `expo-web-browser` |
| 5d | `1b95261` | `components/settings/SettingsSectionHeader.tsx` (~30 LOC) — header opcional pra subsections (caption uppercase) |
| Rebase | (em `1b95261`) | Branch rebaseada em `origin/main @ 3b7e93e` (pós-PR #75). Rebase clean — `app/_layout.tsx` ainda não foi tocado neste PR |

**Branch state após rebase:** 5 commits ahead do main, 0 behind.

---

## O que falta executar (~5h)

| # | Etapa | Arquivo | LOC est. |
|---|---|---|---|
| 6 | Hub principal | `app/configuracoes/index.tsx` | ~150 |
| 7 | Tela Conta | `app/configuracoes/conta.tsx` | ~80 |
| 8a | Tela Tratamento (hub das 5 sections) | `app/configuracoes/tratamento.tsx` | ~120 |
| 8b | Sub-tela Peso meta | `app/configuracoes/tratamento/peso-meta.tsx` | ~80 |
| 8c | Sub-tela Acompanhamento médico (3-way) | `app/configuracoes/tratamento/medico.tsx` | ~110 |
| 9 | Tela Lembretes | `app/configuracoes/lembretes.tsx` | ~70 |
| 10a | Hook export | `hooks/useExportUserData.ts` | ~70 |
| 10b | Tela Dados (LGPD) | `app/configuracoes/dados.tsx` | ~140 |
| 10c | Modal Excluir conta (confirmação dupla) | inline em `dados.tsx` | ~80 |
| 11 | Tela Privacidade | `app/configuracoes/privacidade.tsx` | ~70 |
| 12 | Tela Suporte | `app/configuracoes/suporte.tsx` | ~90 |
| 12b | Sub-tela Sobre | `app/configuracoes/suporte/sobre.tsx` | ~60 |
| 13 | Modificar `(tabs)/perfil.tsx` → botão "Abrir Configurações" | edit | ~30 |
| 14 | Adicionar 10 `<Stack.Screen>` em `app/_layout.tsx` | edit | ~50 |
| 15 | Atualizar `SETTINGS_DESIGN_DIRECTION.md` §8 §9 + criar `docs/adr/0008-settings-hub-implementation.md` + 3 entradas em `CONTEXT.md` (via grill-with-docs) | edits | ~80 |
| 16 | `docs/history.md` entry Prompt 38 | edit | ~5 |
| 17 | type-check + lint | gates | 3min |
| 18 | 10 screenshots em `assets/screenshots/settings-hub/` | capture | 30min |
| 19 | `/impeccable critique` 3 telas críticas (Hub, Tratamento, Dados) | gate ≥ 32/40 | 20min |
| 20 | `security-review` LGPD (export + delete) | gate 0 críticos | 10min |
| 21 | `design:accessibility-review` | gate | 10min |
| 22 | Commit + push + abrir PR via `gh` (vai pegar próximo número GitHub disponível) | finaliza | 10min |

---

## 3 decisões já cravadas (não precisam re-decidir na retomada)

| # | Decisão |
|---|---|
| **D1** | **"Próxima consulta"** lê de `user_profiles.next_appointment_date` (não `medical_visits.next_visit_date`). `medical_visits` é histórico de consultas que aconteceram. |
| **D2** | `has_medical_support` UI = **segmented control 3-way** usando **vocabulário EXATO** do onboarding (`app/(onboarding)/medical-support.tsx`). Importa via `useTranslation()` as i18n keys `medicalSupport.options.{yes,sometimes,no}.{label,caption}` do `onboarding.json`. **Não duplicar strings**. O comment do schema Supabase (yes/no/pending) está STALE — TODO no ADR pra atualizar. |
| **D3** | URLs `dose-day.com/{termos,privacidade,faq}` ficam como **placeholder MVP**. TODO no ADR 0007 — Léo confirma URLs reais em PR futuro. |

---

## Decisões arquiteturais consolidadas (do plano original)

1. **Caminho B** — sem migration de schema. Hooks adaptam ao schema real do Supabase (snake_case + `has_medical_support` text 3-way).
2. **Linkagem** — `app/perfil/{account,protocolo,notificacoes}.tsx` ficam onde estão. Hub novo só linka.
3. **`/configuracoes`** — rota nova (não reaproveita `/perfil`).
4. **Os 6 grupos** no MVP — não MVP-faseado.
5. **Tab "Perfil" mantida** — vira link pro hub. Saída completa fica pro PR Gear Icon.
6. **Footer global** repete em todas as telas (Termos · Versão · Política).
7. **Zero mint** em Settings — §5.4 HOME_DESIGN_DIRECTION.
8. **Zero IA paciente-facing** — §11.3 PRODUCT_COHERENCE.
9. **Cleanup branch local** após merge — padrão consolidado.

---

## Como retomar

### 1. Abrir Aba 2 do Terminal apontando pro worktree

```bash
cd /private/tmp/dose-day-v5-settings-76
claude
```

Se Claude Code retomar sessão antiga automaticamente, manda mensagem abaixo. Se for sessão nova, manda mensagem expandida abaixo.

### 2. Mensagem pra colar (sessão nova ou retomada)

```
Retomando PR Settings Hub.

Leia primeiro este handoff:
@docs/handoff/HANDOFF-pr76-settings-hub-pause-2026-05-25.md

Resumo: 4 componentes base prontos (5a-5d) + 3 packages instalados (5.0) + rebase 
em main pós-PR #75 já feito. Último commit: 1b95261. Branch já pushed.

3 decisões cravadas (não re-decida): user_profiles.next_appointment_date · 
segmented 3-way usando i18n do onboarding · URLs placeholder OK.

Próxima etapa: 6 — app/configuracoes/index.tsx (hub principal, ~150 LOC).

Antes de codar, confirme:
- git status limpo
- git log origin/feature/38-settings-hub-screens --oneline | head -6 — deve mostrar 
  os 5 commits novos + d55590b ou anterior
- npm run type-check passa

Manual approve segue.
```

### 3. Sequência de retomada

| # | Ação | Tempo |
|---|---|---|
| 1 | Validar estado (git status + type-check) | 2min |
| 2 | Etapa 6 — Hub principal | 60min |
| 3 | Etapa 7 — Conta | 30min |
| 4 | Etapas 8a/b/c — Tratamento + 2 sub-telas | 90min |
| 5 | Etapa 9 — Lembretes | 30min |
| 6 | Etapas 10a/b/c — Dados + Hook export + Modal Excluir | 60min |
| 7 | Etapa 11 — Privacidade | 30min |
| 8 | Etapas 12+12b — Suporte + Sobre | 45min |
| 9 | Etapa 13 — modificar perfil tab | 10min |
| 10 | Etapa 14 — registrations no _layout.tsx | 10min |
| 11 | Etapa 15 — grill-with-docs (ADR 0007, CONTEXT.md, SETTINGS_DESIGN_DIRECTION §8/§9) | 25min |
| 12 | Etapas 16-21 — history, gates, screenshots, critique, security, accessibility | ~90min |
| 13 | Etapa 22 — Commit + push + PR (vai pegar próximo número GitHub disponível) | 10min |

**Total estimado para terminar:** ~7h efetivas após retomada.

---

## Links

- **Prompt original:** `docs/prompts/38-MID-settings-hub-screens.md`
- **Plano detalhado:** `docs/superpowers/plans/2026-05-25-settings-hub-screens.md`
- **Direção de design:** `docs/SETTINGS_DESIGN_DIRECTION.md`
- **Branch:** [github.com/leomeirae/doseday-v5/tree/feature/38-settings-hub-screens](https://github.com/leomeirae/doseday-v5/tree/feature/38-settings-hub-screens)

---

## Bloqueadores conhecidos (a tratar na retomada)

1. **`/impeccable critique` indisponível** (mesmo blocker dos PRs #73/74/75). Fallback: critique manual contra DESIGN.md + Named Rules.
2. **Schema comment stale** em `has_medical_support` — TODO no ADR 0007.
3. **URLs `dose-day.com`** placeholder — TODO no ADR 0007.

---

## Coordenação com PR Gear Icon

**PR Gear Icon** (Gear icon na Home + remove tab bar) está **gated por este PR**. Quando Settings Hub mergear:

- Aba 1 (worktree principal) abre PR Gear Icon
- Cria branch tipo `feature/<próximo número>-home-gear-icon-remove-tabbar`
- Adiciona gear icon no `HomeV7Content.tsx` header top-right
- Remove `app/(tabs)/_layout.tsx` ou esconde tab bar
- Modifica `app/(tabs)/perfil.tsx` (já modificado neste PR como botão único) — provavelmente delete

---

## Nomenclatura de PRs (referência)

| Apelido interno | Estado real |
|---|---|
| **PR #75** | mergeado em `3b7e93e` — Pivot Home Sheets |
| **PR #76** | mergeado em `d9d0e75` — este handoff doc |
| **PR Settings Hub** | branch `feature/38-settings-hub-screens` @ `1b95261`, ainda não aberto |
| **PR Gear Icon** | TBD, gated por Settings Hub |
| **PR Polish** | TBD, acumula issues do uso real |

PRs sem número são apelidos internos. Recebem número real GitHub apenas quando abertos via `gh pr create`.

---

## Tasks relacionadas (Cowork)

- **#8** [completed] Handoff doc Settings pause
- **#15** [completed via PR #75] Investigar entrypoints faltantes
- **#17** [completed] Compilar prompt PR #75
- **#19** [pending, gated] PR Gear Icon
- **#20** [completed] Documentar handoff de pausa do PR Settings Hub
