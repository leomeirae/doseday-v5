# Plano — Prompt 38-MID Settings Hub Screens

**Status:** Aguardando aprovação do Léo
**Data:** 2026-05-25
**Branch:** `feature/38-settings-hub-screens`
**Worktree:** `/private/tmp/dose-day-v5-settings-76`
**Prompt fonte:** `docs/prompts/38-MID-settings-hub-screens.md`
**Estimativa:** ~6h efetivas

---

## 0. Confirmação de leitura do contexto obrigatório

15 itens lidos. Confirmações chave:

- Coordenação com PR #75 (Home V7 Clean) e PR #77 (gear icon + remove tab bar) — escopo cirúrgico só de Settings
- Karpathy §1-§4 aplicáveis; LGPD crítica (export + delete)
- Zero mint, zero glass em conteúdo, zero schema change Supabase
- Tab "Perfil" mantida até PR #77 — vira link pro hub neste PR

---

## 1. Memórias relevantes (`claude-mem search "settings hub configuracoes perfil"`)

| ID | Quando | Tipo | Relevância |
|---|---|---|---|
| **#1153** | hoje 7:10 PM | ⚖️ | "Settings Hub Implementation Plan Documented" — referência prévia. Confirmado: nenhum arquivo `.md` físico salvo até esta entrada (este arquivo é o primeiro). |
| **#1137** | hoje 7:05 PM | 🔵 | "Existing Settings/Profile Architecture Inventory" — confirma `app/perfil/{account,protocolo,notificacoes}.tsx` como rotas-destino a LINKAR (não refatorar). |
| **#1121** | hoje 6:41 PM | ⚖️ | `SETTINGS_DESIGN_DIRECTION.md` finalizado: hub completo com 6 grupos + telas filhas; padrão Shotsy iOS-native. |

Bônus: **#1127** (6:42 PM) confirma separação Onboarding (entry) vs Settings (maintenance) — regra 7 documentada em PRODUCT_COHERENCE.

---

## 2. Verificação Supabase MCP

### `user_profiles` — schema **REAL** (snake_case, ≠ do prompt)

| Coluna no prompt (camelCase) | Coluna REAL (snake_case) | Tipo | Observação |
|---|---|---|---|
| `currentMedication` | `current_medication` | text | ok |
| `doseMg` | **`current_dose`** | numeric | **nome diferente** — ajustar |
| `doseFrequencyDays` | `dose_frequency_days` | int (1-90, nullable) | ok |
| `goalWeight` | `goal_weight` | numeric | snake_case |
| `hasMedicalSupport` | `has_medical_support` | **text yes/no/pending** | **não é boolean** — UI 3-way |
| `doctorName` | `doctor_name` | text | ok |
| `mainConcerns` | `main_concerns` | text[] | comment diz "up to 2" |
| `nextAppointmentDate` | `next_appointment_date` | date | ok |

RLS ✅ enabled em todas as tabelas tocadas. FK em `auth.users.id`.

### `user_settings` ✅
- `notifications_enabled` boolean default true
- `notification_time` time default 20:00
- Bônus: `notification_days` int[] e `dark_mode` boolean (não usar neste PR)

### `consent_history` ✅ (225 rows em prod)
Colunas: `consent_type` (`terms` | `privacy` | `data_collection`), `version`, `granted`, `ip_address`, `user_agent`, `created_at`.

### `medical_visits` ✅ (descoberta)
Tem `visit_date`, `doctor_name`, `next_visit_date`, `current_dose_mg`.
**Decisão aberta:** "Próxima consulta" lê de `medical_visits.next_visit_date` (canônico) ou `user_profiles.next_appointment_date` (denormalizado)?
**Default deste plano:** ler de `user_profiles.next_appointment_date` (compat com onboarding atual). Documentar no ADR.

### Edge Function `delete-user-account` ✅
ACTIVE v4, `verify_jwt: true`. Etapa 2 vai fazer `get_edge_function` pra confirmar body shape antes do modal.

---

## 3. Packages — gap identificado

| Package | Status | Ação |
|---|---|---|
| `expo-constants` | ✅ 18.0.13 | Usar pra version + buildNumber |
| `expo-web-browser` | ❌ **AUSENTE** | `npx expo install expo-web-browser` |
| `expo-store-review` | ❌ **AUSENTE** | `npx expo install expo-store-review` |
| `expo-sharing` | ❌ **AUSENTE** | `npx expo install expo-sharing` |
| `Share` (RN built-in) | ✅ implícito | Pra "Compartilhar link" |
| `expo-symbols` | ✅ 1.0.8 | Pra ícones SF Symbols nas SettingsRow |

**3 packages a instalar.** Adicionada etapa 5.0.

---

## A) Skills

| Fase | Skill | Por quê |
|---|---|---|
| Pré-leitura | `andrej-karpathy-skills:karpathy-guidelines` | ✅ já invocada — assumptions + 50 lines + cirurgia + sucesso verificável |
| Pré-leitura | `claude-mem:mem-search` | ✅ já invocada — 3 memórias relevantes encontradas |
| Planejamento | `superpowers:writing-plans` | Persistir este arquivo (regra 21) |
| Planejamento | `grill-with-docs` | Adicionar 3 entradas em CONTEXT.md + gerar ADR 0007 |
| Implementação | `impeccable` (craft/distill) | 9 telas iOS-native; refinamento de hierarquia visual |
| Implementação | `react-native-best-practices` | SafeArea, Pressable, KeyboardAvoidingView, hairlineWidth |
| Implementação | `building-native-ui` | Expo Router stack patterns + tipos |
| Validação | `impeccable` (audit + critique) | Gate ≥ 32/40 nas 3 telas críticas (Hub, Tratamento, Dados) — fallback manual contra DESIGN.md se `/impeccable critique` ainda bloqueado |
| Validação | `impeccable` (harden) | Edge cases LGPD: export vazio, delete falha, modal cancel |
| Validação | `security-review` | LGPD: RLS no export, double-confirm no delete, consent read-only |
| Sessão | `claude-mem` | Compactação session-end |

**Não usar:** `liquid-glass` (glass proibido em Settings), `ui-ux-pro-max` (regra 5: conflito com impeccable), `caveman` (regra 16).

---

## B) Plano numerado (~6h efetivas)

| # | Etapa | Tempo | Checkpoint |
|---|---|---|---|
| 1 | Pré-leitura + mem-search + Supabase MCP | ✅ 10min | 3 memórias citadas, schema confirmado |
| 2 | `get_edge_function delete-user-account` — confirmar body shape | 5min | Contract documentado |
| 3 | Persistir este plano via `superpowers:writing-plans` | ✅ 15min | Arquivo salvo (este aqui) |
| 4 | `git worktree add /private/tmp/dose-day-v5-settings-76 feature/38-settings-hub-screens` | 1min | Worktree limpo, branch criada |
| 5.0 | `npx expo install expo-web-browser expo-store-review expo-sharing` | 5min | package.json atualizado |
| 5a | `components/settings/SettingsGroup.tsx` | 10min | Renderiza filhos, radius lg, bg-elevated |
| 5b | `components/settings/SettingsRow.tsx` — icon, label, chevron, destructive, value, onPress, accessibilityRole | 25min | Touch target ≥44pt, ícone SF Symbol |
| 5c | `components/settings/SettingsFooter.tsx` — versão dinâmica via Constants | 15min | Versão + build aparecem; Termos/Política abrem browser |
| 5d | `components/settings/SettingsSectionHeader.tsx` | 10min | Header opcional pra subsections |
| 6 | `app/configuracoes/index.tsx` — hub com 6 grupos | 60min | Tap em cada grupo navega corretamente |
| 7 | `app/configuracoes/conta.tsx` — email + assinatura placeholder | 30min | Email do useSession; "Sua assinatura" → toast "Em breve" |
| 8a | `app/configuracoes/tratamento.tsx` — 5 sections read-only display | 45min | Lê snake_case real (`current_dose`, `goal_weight`, etc) |
| 8b | `app/configuracoes/tratamento/peso-meta.tsx` — form único | 25min | Save persiste em `goal_weight` via useUpdateProfile |
| 8c | `app/configuracoes/tratamento/medico.tsx` — 3 campos (`doctor_name`, `has_medical_support` 3-way, `next_appointment_date`) | 30min | Persistem; NÃO reabre onboarding |
| 9 | `app/configuracoes/lembretes.tsx` — toggle + time picker | 30min | Sincroniza com `user_settings` |
| 10a | `hooks/useExportUserData.ts` — SELECT em 8 tabelas (RLS-bound) | 30min | JSON gerado, RLS verificada |
| 10b | `app/configuracoes/dados.tsx` — 3 linhas + expo-sharing + modal duplo | 45min | Export funcional, modal "EXCLUIR" gating |
| 10c | Modal duplo de exclusão chamando Edge Function | 25min | Após confirm, signout + redirect (welcome) |
| 11 | `app/configuracoes/privacidade.tsx` — 4 linhas (2 placeholders, 2 web browser) | 25min | Tap em consents → tela read-only de consent_history |
| 12 | `app/configuracoes/suporte.tsx` + `suporte/sobre.tsx` — StoreReview + Share API | 40min | Store review prompt aparece; share sheet abre |
| 13 | `app/(tabs)/perfil.tsx` — substituir por botão único + helper text | 10min | Tap navega pra `/configuracoes` |
| 14 | `app/_layout.tsx` — 10 Stack.Screen registrations em bloco contíguo no fim | 10min | Sem `presentation: 'formSheet'` |
| 15 | `grill-with-docs` — ADR 0007, SETTINGS_DESIGN_DIRECTION §8/§9, CONTEXT.md +3 entradas | 25min | Docs atualizadas |
| 16 | `docs/history.md` entry Prompt 38 | 3min | Tabela atualizada |
| 17 | `npm run type-check && npm run lint` | 3min | 0 errors |
| 18 | Screenshots reais via `react-native-devtools-mcp` — 10 PNGs | 30min | 10 PNGs commitados |
| 19 | `/impeccable critique` 3 telas críticas — fallback manual | 20min | ≥32/40 cada |
| 20 | `security-review` foco LGPD | 10min | 0 críticos |
| 21 | `impeccable audit` accessibility | 10min | 0 críticos |
| 22 | Commit cirúrgico + push + PR com screenshots embedados | 10min | PR aberto |

**Total: ~6h efetivas**

---

## C) Riscos com mitigação

| # | Risco | Mitigação |
|---|---|---|
| 1 | **Schema é snake_case**, prompt usa camelCase | ✅ Identificado. Verificar `lib/supabase/queries/profile.ts` antes de codar telas |
| 2 | `has_medical_support` é text 3-way (yes/no/pending), não boolean | UI usa segmented control 3-way; ADR documenta |
| 3 | **3 packages faltam** | Etapa 5.0 instala via `npx expo install` |
| 4 | Plano anterior #1153 podia já existir | ✅ Verificado: não existia arquivo físico — este é o primeiro |
| 5 | `delete-user-account` contract pode mudar | Etapa 2 lê código; provavelmente `Authorization: Bearer <jwt>` |
| 6 | "Próxima consulta": canônico em `medical_visits` ou `user_profiles`? | Default: `user_profiles.next_appointment_date`. Documentar no ADR. Decisão aberta pro Léo |
| 7 | `/impeccable critique` bloqueado pelos PRs #73/74 | Fallback manual contra DESIGN.md + Named Rules |
| 8 | Export JSON > 10MB em users V4-migrados | Limitar a 12 meses no MVP |
| 9 | Conflito `app/_layout.tsx` vs PR #75 | 10 Stack.Screens em bloco contíguo no fim. Rebase trivial pós-#75 |
| 10 | URLs `dose-day.com/{termos,privacidade,faq}` placeholder | TODO no ADR. Léo confirma em PR futuro |
| 11 | Modal "digite EXCLUIR" — fricção alta | LGPD + ANVISA recomendam confirmação explícita. Decisão consciente no ADR |
| 12 | `expo-store-review.requestReview()` silencia em dev | Esperado; validar em TestFlight |

---

## D) Arquivos a criar/editar

### Criar (18 arquivos, ~1.260 LOC)
| Arquivo | LOC est. |
|---|---|
| `docs/superpowers/plans/2026-05-25-settings-hub-screens.md` | (este arquivo) |
| `docs/adr/0007-settings-hub-implementation.md` | ~200 |
| `components/settings/SettingsGroup.tsx` | ~40 |
| `components/settings/SettingsRow.tsx` | ~90 |
| `components/settings/SettingsFooter.tsx` | ~60 |
| `components/settings/SettingsSectionHeader.tsx` | ~30 |
| `app/configuracoes/index.tsx` | ~150 |
| `app/configuracoes/conta.tsx` | ~80 |
| `app/configuracoes/tratamento.tsx` | ~120 |
| `app/configuracoes/tratamento/peso-meta.tsx` | ~80 |
| `app/configuracoes/tratamento/medico.tsx` | ~110 |
| `app/configuracoes/lembretes.tsx` | ~70 |
| `app/configuracoes/dados.tsx` | ~140 |
| `app/configuracoes/privacidade.tsx` | ~70 |
| `app/configuracoes/suporte.tsx` | ~90 |
| `app/configuracoes/suporte/sobre.tsx` | ~60 |
| `hooks/useExportUserData.ts` | ~70 |
| `assets/screenshots/settings-hub/*.png` | 10 PNGs |

### Editar (6 arquivos — diff cirúrgico)
| Arquivo | Mudança |
|---|---|
| `app/_layout.tsx` | +10 `<Stack.Screen>` em bloco contíguo no fim |
| `app/(tabs)/perfil.tsx` | Conteúdo → botão único "Abrir Configurações" + helper |
| `docs/SETTINGS_DESIGN_DIRECTION.md` | §8 + §9 atualizados via grill-with-docs |
| `CONTEXT.md` | +3 entradas (hub de Configurações, Settings Row, Lista Agrupada iOS) |
| `docs/history.md` | +1 entry Prompt 38 |
| `package.json` | +3 packages via `expo install` (+ lockfile) |

### NÃO TOCAR
- `components/home/HomeV7Content.tsx` — gear icon é PR #77
- `app/perfil/{account,protocolo,notificacoes}.tsx` — rotas existentes mantidas
- `app/(tabs)/_layout.tsx` — gate pro PR #77
- Schema Supabase — zero migration
- Edge Functions — usar `delete-user-account` existente
- `hooks/{useProfile,useUpdateProfile,useNotifications}.ts` — reusar intactos
- Onboarding screens — Settings nunca reabre onboarding (regra 7)

---

## E) Checklist de validação

### Navegação
- [ ] Tap em tab "Perfil" → vê botão "Abrir Configurações"
- [ ] Tap em "Abrir Configurações" → navega pra `/configuracoes`
- [ ] Tap em cada grupo navega pra rota correta
- [ ] Back arrow em cada sub-tela volta pro hub

### Tela Conta
- [ ] Email visível e correto
- [ ] Tap em "Sua assinatura" → toast "Em breve"

### Tela Tratamento
- [ ] 5 sections com valores atuais (snake_case)
- [ ] Tap em "Medicamento" → `/perfil/protocolo`
- [ ] Tap em "Peso meta" → form de edição funcional, save persiste
- [ ] Tap em "Acompanhamento médico" → 3-way para `has_medical_support`
- [ ] Próxima consulta date picker funcional
- [ ] Salvar NÃO reabre onboarding

### Tela Lembretes
- [ ] Toggle de notificações sincroniza com `user_settings.notifications_enabled`
- [ ] Time picker salva `notification_time`

### Tela Dados (LGPD)
- [ ] Tap "Exportar" gera JSON com dados do user via expo-sharing
- [ ] JSON contém só dados do user logado (RLS preservada)
- [ ] Tap "Histórico de consentimento" mostra lista read-only
- [ ] Tap "Excluir conta" abre modal de confirmação dupla
- [ ] Botão final "Excluir" só habilita após digitar "EXCLUIR"
- [ ] Confirmação chama Edge Function existente e signout + redirect

### Tela Privacidade
- [ ] Tap em Política/Termos abre web browser externo
- [ ] Tap em "Compartilhamento de dados" mostra consents ativos

### Tela Suporte
- [ ] Tap em "Sobre" mostra nome + versão dinâmica + build dinâmico
- [ ] Tap em "Avalie" chama `StoreReview.requestReview()`
- [ ] Tap em "Compartilhar" abre Share sheet iOS

### Footer global
- [ ] Versão renderiza dinamicamente
- [ ] Tap em Termos/Política abre browser

### Visual / Tokens
- [ ] Zero mint em qualquer tela do hub
- [ ] Background `colors.bgBase` em todas as telas
- [ ] Cards `bg-elevated` com radius lg
- [ ] Touch targets ≥ 44pt
- [ ] Hairline separators internos

### Gates de qualidade
- [ ] `npm run type-check` → 0 errors
- [ ] `npm run lint` → 0 errors (1 warning preexistente i18n aceitável)
- [ ] `/impeccable critique` nas 3 telas críticas → ≥ 32/40 cada (ou critique manual)
- [ ] `security-review` → LGPD validada
- [ ] `design:accessibility-review` → screen reader labels em todos `SettingsRow`
- [ ] 10 screenshots reais em `assets/screenshots/settings-hub/`

### Adendos do plano (descobertas)
- [ ] `expo-web-browser`, `expo-store-review`, `expo-sharing` instalados sem warning
- [ ] `has_medical_support` 3-way handled (não tratado como boolean)
- [ ] Mapeamento snake_case ↔ camelCase consistente nos hooks
- [ ] Export JSON limita-se a 12 meses (registrado no ADR)

---

## F) Otimização de tokens

- RTK: leituras de `app/perfil/*.tsx` via `rtk read`; grep com `rtk grep "SettingsRow\|configuracoes"`
- RTK em `npm install/run` (etapa 5.0, 17)
- Plano persistido em arquivo (regra 21) — este aqui
- Outputs de install salvos em `/tmp/install.log` referenciados via `@file`
- Memória entre sessões via `claude-mem` (regra 30)
- Doc updates via grill-with-docs (etapa 15) — não duplicar
- `/btw` pra perguntas laterais sem injetar na conversa principal (regra 26)

---

## Karpathy §1-§4

### §1 — Assumptions explícitas
1. Schema confirmado snake_case ✅
2. `has_medical_support` é text 3-way (yes/no/pending) — UI deve refletir ⚠️
3. Edge Function `delete-user-account` v4 ATIVA com `verify_jwt: true` ✅
4. RLS ativa em todas as tabelas exportadas ✅
5. **3 packages faltam** (expo-web-browser, expo-store-review, expo-sharing) — etapa 5.0 instala ⚠️
6. Hooks existentes (`useProfile`, `useUpdateProfile`, `useNotifications`) mapeiam snake/camel — verificar etapa 5a
7. URLs `dose-day.com/{termos,privacidade,faq}` permanecem placeholder neste PR ⚠️
8. Tab "Perfil" mantida — gate fica pro PR #77 ✅
9. Footer global repete em todas as telas (decisão §3 SETTINGS_DESIGN_DIRECTION) ✅
10. Zero mint em Settings — §5.4 HOME_DESIGN_DIRECTION ✅
11. "Próxima consulta": lê de `user_profiles.next_appointment_date` (decisão aberta) ⚠️

### §2 — Could 50 lines do this?
Não. Total: 9 telas + 4 componentes + 1 hook + edits em 6 arquivos.
- 4 componentes (~220 LOC)
- Hub principal (~150 LOC)
- 6 telas filhas média 80 LOC (~480 LOC)
- 2 sub-telas tratamento (~190 LOC)
- 1 hook export (~70 LOC)
- Modal excluir conta (~80 LOC)

**Total novo:** ~1.260 LOC. **Edits:** ~80 LOC.

Cada linha traceia a um critério da seção E. Zero drive-by refactor.

### §3 — Cirurgia
Tabela D declara escopo de cada arquivo. Lista NÃO TOCAR explícita. Diff esperado: 6 arquivos editados, 18 criados, zero arquivos surpresa.

### §4 — Sucesso verificável
Seção E é checklist binário. Comportamento observável apenas. Critérios: `requestReview` chamado, modal só habilita após "EXCLUIR", JSON exportado contém só dados RLS-scoped, type-check + lint pass.

---

## Decisões abertas pra Léo

1. **"Próxima consulta"** — ler de `user_profiles.next_appointment_date` (default neste plano) ou de `medical_visits.next_visit_date` (canônico)?
2. **`has_medical_support` 3-way UI** — segmented control (Sim/Não/Pendente) [default] ou outro padrão?
3. **URLs `dose-day.com/{termos,privacidade,faq}`** — placeholders ok pro MVP, ou Léo confirma URLs reais antes deste PR?

---

## ⏸️ Aguardando aprovação do Léo

Manda "ok" ou ajuste as decisões abertas e eu sigo do passo 2 em diante (worktree + branch + install packages + componentes + telas).

**Manual approve recomendado** (não auto mode) — esse PR toca LGPD (export + delete) e cada edit merece revisão.

**Coordenação com PR #75:** Quando #75 mergear, este PR rebaseia em `main` (deve ser trivial — conflito previsto só em `app/_layout.tsx` com bloco isolado no fim). Quando ambos mergeados, PR #77 entra com gear icon na Home + remoção da tab bar.
