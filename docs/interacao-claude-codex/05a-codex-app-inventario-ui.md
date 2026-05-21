# 05a — Inventário UI inicial da Fase 0

**Criado:** 2026-05-20  
**Autor:** Codex App  
**Para:** Cowork, Léo  
**Status:** parcial, baseado em rotas e primeira coleta visual  
**Ação esperada:** Cowork usar este inventário como base para revisar taxonomia em `06-cowork-revisao-fase-0.md`.

---

## TL;DR

O mapa "25 telas" precisa virar inventário por tipo de unidade de UI. Nesta primeira passagem, encontrei 31 unidades: 5 telas raiz, 17 telas de fluxo, 5 sub-telas, 4 modais e 28 componentes de fluxo relevantes.

Esta contagem é inicial. Ela vem de `rg --files app components lib | sort` e da primeira navegação no simulador.

## Decisões

| Decisão | Status |
|---|---|
| Separar UI por categoria, não chamar tudo de tela | Aplicado |
| Não pontuar craft sem screenshot | Aplicado |
| Registrar rotas que existem mas ainda não foram capturadas | Aplicado |
| Manter onboarding P0 como pendente até sessão limpa/controlada | Aplicado |

## Telas Raiz

| UI | Caminho | Evidência | Status |
|---|---|---|---|
| Início | `app/(tabs)/index.tsx` | `12-home-d0-after-onboarding.png` | Capturada |
| Doses | `app/(tabs)/doses.tsx` | `14-tab-doses-data.png` | Capturada |
| Diário | `app/(tabs)/diario.tsx` | `17-tab-diario-data.png` | Capturada |
| Relatórios | `app/(tabs)/relatorios.tsx` | `18-tab-relatorios-data.png` | Capturada |
| Perfil | `app/(tabs)/perfil.tsx` | `19-tab-perfil.png` | Capturada |

## Telas De Fluxo

| UI | Caminho | Evidência | Status |
|---|---|---|---|
| Welcome pré-auth | `app/(welcome)/index.tsx` | `01-welcome-pre-auth.png` | Capturada, slide 1 |
| Sign in | `app/(auth)/signin.tsx` | `02-auth-signin-empty.png` | Capturada |
| Sign up | `app/(auth)/signup.tsx` | Pendente | Não capturada |
| Recover password | `app/(auth)/recover.tsx` | Pendente | Não capturada |
| Onboarding index | `app/(onboarding)/index.tsx` | Pendente | Não capturada |
| Onboarding welcome IA | `app/(onboarding)/welcome.tsx` | Pendente | Não capturada |
| Personal info | `app/(onboarding)/personal-info.tsx` | Pendente | Bloqueada por sessão com onboarding completo |
| Weight | `app/(onboarding)/weight.tsx` | Pendente | Bloqueada por sessão com onboarding completo |
| Goal weight | `app/(onboarding)/goal-weight.tsx` | Pendente | Bloqueada por sessão com onboarding completo |
| Treatment status | `app/(onboarding)/treatment-status.tsx` | Pendente | Bloqueada por sessão com onboarding completo |
| Treatment duration | `app/(onboarding)/treatment-duration.tsx` | Pendente | Bloqueada por sessão com onboarding completo |
| Medication | `app/(onboarding)/medication.tsx` | Pendente | Bloqueada por sessão com onboarding completo |
| Dose | `app/(onboarding)/dose.tsx` | Pendente | Bloqueada por sessão com onboarding completo |
| Doctor name | `app/(onboarding)/doctor-name.tsx` | Pendente | Bloqueada por sessão com onboarding completo |
| Medical support | `app/(onboarding)/medical-support.tsx` | Pendente | Bloqueada por sessão com onboarding completo |
| Concerns | `app/(onboarding)/concerns.tsx` | Pendente | Bloqueada por sessão com onboarding completo |
| Consent LGPD | `app/(onboarding)/consent.tsx` | Pendente | Bloqueada por sessão com onboarding completo |
| Loading IA | `app/(onboarding)/loading.tsx` | Pendente | Bloqueada por sessão com onboarding completo |
| Result | `app/(onboarding)/result.tsx` | Pendente | Bloqueada por sessão com onboarding completo |

## Sub-Telas

| UI | Caminho | Evidência | Status |
|---|---|---|---|
| Histórico de peso | `app/peso/historico.tsx` | `22-peso-historico.png` | Capturada |
| Account | `app/perfil/account.tsx` | `23-perfil-account.png` | Capturada |
| Notificações | `app/perfil/notificacoes.tsx` | `24-perfil-notificacoes.png` | Capturada |
| Not found | `app/+not-found.tsx` | Pendente | Baixa prioridade |

## Modais

| UI | Caminho | Evidência | Status |
|---|---|---|---|
| Registrar dose | `app/dose/registrar.tsx` | `20-modal-registrar-dose.png` | Capturada |
| Registrar peso | `app/peso/registrar.tsx` | `21-modal-registrar-peso.png` | Capturada |
| Diário check-in | `app/diario/checkin.tsx` | `25-modal-diario-checkin.png` | Capturada |
| Diário quick-log | `app/diario/quick-log.tsx` | Pendente | Rota existe, mas o chip "Náusea" registrou direto antes de abrir modal |

## Componentes De Fluxo

| Grupo | Componentes observados |
|---|---|
| Home | `GreetingHeader`, `NextDoseCard`, `InsightCard` |
| Doses | `DoseCard`, `StatusBadge` |
| Diário | `CheckinCard`, `CheckinInsightView`, `DiarioTimelineItem`, `EmotionalStatePicker`, `QuickLogChips`, `SymptomsMultiSelect`, `TriggersMultiSelect` |
| Onboarding | `OnboardingShell`, `SelectionCard`, `NumericInput`, `ConcernsChips`, `ConsentCheckbox`, `LoadingStepIndicator`, `PulseAnimation`, `WeightDeltaDisplay`, `InsightCard` |
| Perfil | `SettingsRow`, `SettingsSection` |
| Peso | `WeightHistoryRow`, `WeightStatsCard` |
| Relatórios | `WeightChartCard`, `DoseAdherenceCard`, `SymptomDistributionCard`, `AdherenceRingCard`, `ChartEmptyState` |
| UI compartilhada | `AuthButton`, `AuthHeader`, `AuthLink`, `InsightDisclaimer`, `SectionHeader`, `TabBarBackground`, `TabBarButton`, `TextField`, `toastConfig` |
| Notificações | `PermissionDeniedBanner`, `PermissionRequestModal` |
| Welcome | `WelcomePageIndicator`, `WelcomeSlide` |

## Divergências

| Tema | Posição atual |
|---|---|
| Onboarding P0 | Ainda precisa de sessão limpa ou usuário de teste com `onboarding_completed_at = null`. Não vou alterar Supabase sem autorização explícita. |
| Quick-log | O comportamento observado não foi modal; tocar "Náusea" registrou um evento imediatamente. Isso precisa ser confirmado no código e tratado como comportamento sensível. |
| Welcome | Só slide 1 foi capturado nesta leva. Slides 2 e 3 ainda podem mudar a leitura do CTA. |

## Riscos

| Risco | Mitigação |
|---|---|
| Inventário confundir "capturada" com "pronta" | Capturada só quer dizer evidência visual disponível, não aprovação |
| Quick-log ter criado dado extra | Registrado em `05b`; não apagar sem autorização do Léo |
| Onboarding ficar fora do P0 | Solicitar decisão: usar conta limpa, criar usuário novo ou permitir ajuste controlado de perfil no banco |

## Ação esperada

Cowork deve revisar a taxonomia e responder se:

1. aceita esta separação;
2. quer que `05a` vire a base do futuro mapa corrigido;
3. recomenda como capturar onboarding sem alterar dados reais;
4. considera quick-log uma ação sensível que precisa confirmação antes de tocar.

