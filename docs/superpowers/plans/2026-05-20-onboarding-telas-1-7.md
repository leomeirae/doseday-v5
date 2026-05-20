# Plano — Prompt 24b Onboarding telas 1-7

Data: 2026-05-20
Branch: `feature/24b-onboarding-telas-1-7`

## Skills

| Skill | Aplicação |
|---|---|
| `react-native-best-practices` | Expo/RN, `Controller`, forms pequenos, acessibilidade e touch targets |
| `/impeccable craft` | UI das 7 telas e 3 componentes compartilhados |
| `/impeccable harden` | Edge cases de input numérico, seleção obrigatória, texto longo e persistência falhando |
| `/impeccable critique` | Gate visual final com alvo >=30/40 |
| `supabase-postgres-best-practices` | Conferir update em `user_profiles` sob RLS, sem refactor/migration se não houver blocker |

## Assumptions

| Assumption | Validação |
|---|---|
| Copy 24b está em `locales/{pt-BR,en,es}/onboarding.json` | Listar keys antes de codar |
| Foundation 24a está mergeada em `main` | `OnboardingShell`, `OnboardingContext`, schemas, queries e types existem |
| API real de 24a manda sobre o pseudocódigo do prompt | Usar `submitStep(step, data)` e `useOnboardingForm` em vez de inventar persistência |
| Onboarding 24b não altera AuthGuard, shell, schemas ou queries | Diff restrito |

## Plano

| Passo | Ação | Verificação |
|---|---|---|
| 1 | Revalidar locale keys e dependências | Keys 1-7 presentes, `react-hook-form` e resolver instalados |
| 2 | Criar `SelectionCard`, `NumericInput`, `WeightDeltaDisplay` | Sem hex hardcoded; acessibilidade; componentes pequenos |
| 3 | Implementar `welcome` | CTA inicia onboarding e avança para personal-info |
| 4 | Implementar `personal-info`, `weight`, `goal-weight` | Zod via `useOnboardingForm`, erros inline, CTA disabled quando inválido |
| 5 | Implementar `treatment-status`, `treatment-duration`, `medication` | Cards selecionáveis com radio visual e persistência por step |
| 6 | Atualizar `app/(onboarding)/index.tsx` | Redireciona para primeiro step incompleto/currentStep |
| 7 | Hardening e QA | Inputs numéricos, seleção obrigatória, copy longa, erro de persist preserva estado local |
| 8 | Validação final | `npm run type-check`, `npm run lint`, simulador com 5 screenshots reais, Supabase update confirmado |
| 9 | Critique, docs finais, commit e PR | `/impeccable critique` >=30/40, `CLAUDE.md` histórico, PR aberto e não mergeado |

## Arquivos

| Arquivo | Mudança |
|---|---|
| `components/onboarding/SelectionCard.tsx` | Novo componente compartilhado |
| `components/onboarding/NumericInput.tsx` | Novo componente compartilhado |
| `components/onboarding/WeightDeltaDisplay.tsx` | Novo componente compartilhado |
| `app/(onboarding)/welcome.tsx` | Nova tela |
| `app/(onboarding)/personal-info.tsx` | Nova tela |
| `app/(onboarding)/weight.tsx` | Nova tela |
| `app/(onboarding)/goal-weight.tsx` | Nova tela |
| `app/(onboarding)/treatment-status.tsx` | Nova tela |
| `app/(onboarding)/treatment-duration.tsx` | Nova tela |
| `app/(onboarding)/medication.tsx` | Nova tela |
| `app/(onboarding)/index.tsx` | Redirecionamento |
| `CLAUDE.md` | Linha de histórico ao final |
| `assets/screenshots/prompt24b/` | Screenshots reais de QA |

## Riscos

| Risco | Mitigação |
|---|---|
| Copy ainda incompleta em algum idioma | Parar antes de inventar texto |
| `submitStep` navega localmente mesmo se persist falhar | Aceito pelo prompt; toast + retry em avanço posterior |
| Componentes virarem genéricos demais | Props mínimas, sem variants abstratos |
| Vital Mint aparecer demais | Usar só CTA primário e radio/estado selecionado mínimo |
| RLS bloquear update | Confirmar com usuário autenticado; só propor migration se falhar de fato |

## Critérios de sucesso

| Critério | Meta |
|---|---|
| Fluxo 1-7 | Welcome -> personal-info -> weight -> goal -> status -> duration -> medication |
| Validação | Zod bloqueia CTA inválido e mostra erro inline |
| Persistência | `user_profiles` recebe campos das telas 1-7 |
| Design | Zero glass, zero hex hardcoded em telas/componentes, Vital Mint raro |
| Checks | `type-check` e `lint` PASS |
| Evidência | 5 screenshots reais em `assets/screenshots/prompt24b/` |
| PR | Aberto sem merge |
