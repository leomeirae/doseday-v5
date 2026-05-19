# Audit Frontend V4 ↔ V5 — Paridade

**Data:** 2026-05-19
**Responsável:** Cowork
**Status:** documento permanente — usar como referência antes de qualquer prompt de feature.

---

## Resumo executivo

| Métrica | Valor |
|---|---|
| Telas V4 | 43 |
| Telas V5 (atual) | 16 |
| Cobertura | 37% |
| Gaps P0 (bloqueador de fluxo) | 2 |
| Gaps P1 (importante) | 5 |
| Gaps P2 (cosmético) | 1 |

**Gap dominante:** onboarding inteiro da V4 (15 telas) NÃO FOI portado. Por isso o user cria conta e cai em app vazio — sem `current_medication`, `treatment_start_date`, `goal_weight`, etc. Schema Supabase JÁ tem todas as colunas. Só falta UI.

---

## Comparação por fluxo

### Welcome / Splash

| Item | V4 | V5 | Status |
|---|---|---|---|
| Welcome inicial | `(welcome)/index.tsx` | ❌ | P1 — UX inicial pobre, vai direto pra auth |

### Auth

| Item | V4 | V5 | Status |
|---|---|---|---|
| Sign in | `(auth)/sign-in.tsx` | `(auth)/signin.tsx` | ✅ |
| Sign up | `(auth)/sign-up.tsx` | `(auth)/signup.tsx` | ✅ |
| Confirm email | `(auth)/confirm.tsx` | ❌ | P2 — Supabase resolve via deeplink |
| Recover password | ❌ | `(auth)/recover.tsx` | ✅ V5 é melhor aqui |

### Onboarding — 🔴 P0 CRÍTICO

| Tela V4 | Path V4 | Existe V5? | Captura |
|---|---|---|---|
| Welcome onboarding | `(onboarding)/welcome.tsx` | ❌ | Introdução produto |
| Personal info | `(onboarding)/personal-info.tsx` | ❌ | `full_name`, `age`, `biological_sex` |
| Weight | `(onboarding)/weight.tsx` | ❌ | `initial_weight`, `current_weight`, `height` |
| Goal weight | `(onboarding)/goal-weight.tsx` | ❌ | `goal_weight` |
| Treatment status | `(onboarding)/treatment-status.tsx` | ❌ | `treatment_status` |
| Treatment duration | `(onboarding)/treatment-duration.tsx` | ❌ | `treatment_duration` |
| Medication | `(onboarding)/medication.tsx` | ❌ | `current_medication` ← **causa do bug atual** |
| Dose | `(onboarding)/dose.tsx` | ❌ | `current_dose` |
| Doctor name | `(onboarding)/doctor-name.tsx` | ❌ | `doctor_name` |
| Medical support | `(onboarding)/medical-support.tsx` | ❌ | `has_medical_support` |
| Concerns | `(onboarding)/concerns.tsx` | ❌ | `main_concerns` (array) |
| Consent | `(onboarding)/consent.tsx` | ❌ | LGPD consent |
| Social proof | `(onboarding)/social-proof.tsx` | ❌ | Trust building |
| Validation | `(onboarding)/validation.tsx` | ❌ | Validação dados |
| Loading | `(onboarding)/loading.tsx` | ❌ | Transition |
| Result | `(onboarding)/result.tsx` | ❌ | Confirmação |

**15 telas faltando. Schema Supabase JÁ tem todas as colunas** (validado via `information_schema.columns` em `user_profiles`).

### App principal (tabs)

| Item | V4 | V5 | Status |
|---|---|---|---|
| Dashboard / Home | `(app)/dashboard.tsx` | `(tabs)/index.tsx` | ✅ |
| Doses | `(app)/doses.tsx` | `(tabs)/doses.tsx` + `dose/registrar.tsx` | ✅ (depende de onboarding) |
| Reports | `(app)/reports.tsx` | `(tabs)/relatorios.tsx` | ✅ Prompt 17 |
| Weight | `(app)/weight.tsx` | ❌ (parcial em relatorios) | P1 |
| Financial | `(app)/financial.tsx` | ❌ | P1 — feature de valor (caneta GLP-1 cara) |
| Add action | `(app)/add-action.tsx` | distribuído em `dose/registrar` + `diario/quick-log` | ✅ refatorado |

### Check-in / Diário

| Item | V4 | V5 | Status |
|---|---|---|---|
| Check-in | `(check-in)/check-in.tsx` | `(tabs)/diario.tsx` + `diario/checkin.tsx` | ✅ Prompt 15 |
| Check-in success | `(check-in)/check-in-success.tsx` | ❌ (inline em diario) | ✅ aceito |
| Quick log | ❌ | `diario/quick-log.tsx` | ✅ V5 melhor |

### Paywall — 🔴 P0

| Item | V4 | V5 | Status |
|---|---|---|---|
| Paywall | `(paywall)/paywall.tsx` | ❌ | **P0** — RevenueCat configurado com trial 14d mas zero UI = zero conversão |

### Settings (Perfil expandido)

| Item | V4 | V5 | Status |
|---|---|---|---|
| Settings root | `(settings)/settings.tsx` | `(tabs)/perfil.tsx` (simples) | P1 — V5 minimal demais |
| Account settings | `(settings)/account-settings.tsx` | ❌ | P1 |
| Health data | `(settings)/health-data.tsx` | ❌ | P1 |
| Medical references | `(settings)/medical-references.tsx` | ❌ | P1 |
| Notifications | `(settings)/notifications.tsx` | `perfil/notificacoes.tsx` | ✅ Prompt 23 (com 5 bugs descobertos) |

---

## Bugs descobertos hoje (não-paridade — bugs reais)

| # | Bug | Local | Severidade |
|---|---|---|---|
| 1 | Row `user_settings` não criada no upsert | `usePushTokenRegistration` | P0 |
| 2 | Botão "Testar notificação" ausente da tela settings | `app/perfil/notificacoes.tsx` | P1 |
| 3 | Card "Permissão" não tappable | `app/perfil/notificacoes.tsx` | P1 |
| 4 | Toggle "Lembretes de dose" sem handler funcional | `app/perfil/notificacoes.tsx` | P1 |
| 5 | Modal contextual não dispara pra users com `dose_count > 1` | `useDoseSummary` + trigger | P1 |
| 6 | Tela registrar dose diz "Defina seu medicamento no perfil →" mas o link não existe | `app/dose/registrar.tsx` | P0 — coberto por onboarding |

---

## Sequência corrigida de PRs

| Ordem | PR | Severidade | Justificativa |
|---|---|---|---|
| 1 | **Onboarding V5 completo** (15 telas — adaptar V4 pra Clinical Memory) | P0 | Sem isso, app não funciona pro user real |
| 2 | **Paywall + integração RevenueCat** | P0 | Trial 14d configurado mas zero UI |
| 3 | **Fix 5 bugs PR #27** (notificações UX) | P1 | Polish após onboarding |
| 4 | **Tela Financial** (custos do tratamento) | P1 | Feature de valor |
| 5 | **Tela Weight dedicada** | P1 | Validar se cobertura em Relatórios é suficiente primeiro |
| 6 | **Settings expandido** (account, health-data, medical-references) | P1 | Pós-onboarding faz mais sentido |
| 7 | **Welcome / Splash** | P1 | UX inicial |
| 8 | Confirm email | P2 | Supabase deeplink resolve |
| 9 | Movimento 2 IA | P2 | Sem fluxo core, diferencial não importa |

---

## Backend (Supabase) — está pronto?

**SIM.** Schema `user_profiles` tem TODAS as colunas que o onboarding V4 capturava:

```
height, goal_weight, initial_weight, current_weight,
treatment_start_date, age, doctor_name, biological_sex,
current_medication, current_dose, treatment_status,
has_medical_support, treatment_duration, main_concerns (array),
next_appointment_date, locale, onboarding_completed_at,
smart_weight_reminder, preferred_day_of_week, preferred_time
```

**Conclusão:** erro 100% no frontend. Backend foi pensado, só não foi capturado via UI.

Tabelas relacionadas que servem onboarding:
- `user_profiles` ✅ (todos os campos do onboarding)
- `user_settings` ✅ (notifications_enabled, notification_time)
- `medical_visits` ✅ (médico)
- `medication_applications` ✅ (doses)
- `weight_logs` ✅ (peso)

Nenhuma migration nova necessária pro onboarding. **Backend cobre tudo.**

---

## Causa raiz do erro estratégico

Olhando histórico de prompts (`docs/history.md`):

| Prompt | Foco | Onboarding tocado? |
|---|---|---|
| 00-13 | Bootstrap + auth + telas tab principais + doses | ❌ |
| 14-18 | AuthHeader, Diário, IA Movimento 1, Perfil V2 LGPD | ❌ |
| 19-23 | Liquid Glass, Edge Functions IaC, Push Notifications | ❌ |

**Onboarding nunca foi escopo de nenhum prompt.** Erro de priorização — Cowork sugeriu features novas (Push V1, Liquid Glass) sem auditar paridade com V4 primeiro.

Registrado como Aprendizado #43 em `docs/learnings.md` + Regra 27 anti-pirraça em `CLAUDE.md`.

---

## Procedimento obrigatório daqui em diante

Antes de qualquer prompt MID/HIGH de feature nova:

1. **Consultar este audit** — confirmar que o gap não está aqui na lista P0/P1
2. **Se está:** priorizar o gap antes da feature nova
3. **Se não está:** prosseguir com a feature

Sem exceção. Errar de novo é inaceitável.
