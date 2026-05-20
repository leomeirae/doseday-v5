# Prompt 28: Welcome Splash Liquid Glass

## Summary

Implementar a primeira tela pre-auth do DoseDay V5 como gap P1 de paridade V4 -> V5: welcome de 3 slides, entrada antes de signin/signup para usuario novo, flag persistente `has_seen_welcome` e splash com Clinical Midnight. O visual segue Clinical Midnight, tipografia system/SF Pro via tokens e Liquid Glass restrito a CTA/page indicator.

Pre-validacoes confirmadas:

- `main` esta em `499a5b8579caf5ef996aa09ab9458c61ddaae42c`, atende `499a5b8+`.
- `npm ls @react-native-async-storage/async-storage --depth=0` retornou `empty`; AsyncStorage precisa ser instalado.
- `npm ls react-native-pager-view --depth=0` retornou `empty`; usar `ScrollView horizontal pagingEnabled`, sem dependencia nova de pager.
- `expo-glass-effect@0.1.10` ja esta instalado.
- `app/_layout.tsx` tem AuthGuard 3-way: sem sessao -> signin; sessao sem onboarding -> onboarding; sessao completa -> tabs.
- `app.json` usa splash `backgroundColor: "#111827"` e deve trocar para `#050B12`.

## Skills

| Skill | Aplicacao |
|---|---|
| `react-native-best-practices` | Expo/RN strict, Reanimated, reduce motion, acessibilidade e fluxo mobile |
| `expo-liquid-glass` | `GlassView` guardado com `BlurView` fallback em CTA e page indicator |
| `building-native-ui` | Expo Router route group, safe area e pager iOS com `ScrollView pagingEnabled` |
| `/impeccable craft` | Direcao visual product UI ja travada pelo prompt, PRODUCT e DESIGN |
| `design-audit` | Auditoria final contra Vital Mint Rarity, 30% Glass e Number-First N/A |
| `/impeccable critique` | Critique pre-PR com meta maior ou igual a 30/40 |

## Karpathy Declarations

| Disciplina | Aplicacao |
|---|---|
| Assumptions | AsyncStorage e a unica dependencia nova; welcome so aparece sem sessao e sem flag; users autenticados nunca veem welcome; splash `#111827` e legado; pager aceita `ScrollView pagingEnabled` |
| Simplicity First | Sem `react-native-pager-view`; sem abstracao generica; 3 slides estaticos via i18n e componentes pequenos |
| Surgical Changes | Tocar apenas welcome, i18n, storage, AuthGuard, splash, package lock e docs finais; zero refactor em auth/tabs/onboarding |
| Goal-Driven | User novo ve welcome, navega 3 slides, toca criar conta ou ja tenho conta; user retornando sem sessao pula welcome para signin |

## Implementation

1. Criar worktree isolado `/private/tmp/dose-day-v5-welcome` e branch `feature/28-welcome-splash-liquid-glass` a partir de `main`.
2. Instalar `@react-native-async-storage/async-storage` via Expo.
3. Criar `lib/utils/welcomeStorage.ts` com `hasSeenWelcome()` e `markWelcomeSeen()` usando chave `has_seen_welcome`.
4. Criar `locales/pt-BR/welcome.json`, `locales/en/welcome.json`, `locales/es/welcome.json` e registrar namespace em `lib/i18n/index.ts`.
5. Expandir `app/_layout.tsx` para AuthGuard 4-way:
   - sem sessao + sem flag -> `/(welcome)`
   - sem sessao + flag -> `/(auth)/signin`
   - sessao + onboarding incompleto -> `/(onboarding)`
   - sessao + onboarding completo -> `/(tabs)`
6. Criar `app/(welcome)/_layout.tsx` com `headerShown: false`, `gestureEnabled: false` e background `colors.bgBase`.
7. Criar `app/(welcome)/index.tsx` com `ScrollView horizontal pagingEnabled`, snap por largura, 3 slides, haptics leves no avanco, reduce motion sem animacao spring.
8. Criar `components/welcome/WelcomeSlide.tsx` sem glass, usando SF Symbol central, headline display e body regular.
9. Criar `components/welcome/WelcomePageIndicator.tsx` com glass somente na camada de navegacao/indicador, Vital Mint apenas no ativo.
10. Atualizar `app.json` splash background para `#050B12`.

## Constraints

- Nao tocar telas existentes exceto `app/_layout.tsx`.
- Nao usar `react-native-pager-view`.
- Zero gradiente e zero ilustracao custom.
- Glass apenas em CTA primario final e page indicators; nunca no conteudo dos slides.
- Vital Mint apenas no CTA final e indicator ativo.
- Zero hex hardcoded nos novos arquivos de welcome; usar tokens.
- Copy nova restrita ao namespace `welcome`.
- Nao usar `as any`, `@ts-ignore` ou `eslint-disable`.
- Nao mergear PR.

## Files

| Arquivo | Acao |
|---|---|
| `locales/pt-BR/welcome.json` | Criar |
| `locales/en/welcome.json` | Criar |
| `locales/es/welcome.json` | Criar |
| `lib/i18n/index.ts` | Editar |
| `lib/utils/welcomeStorage.ts` | Criar |
| `app/(welcome)/_layout.tsx` | Criar |
| `app/(welcome)/index.tsx` | Criar |
| `components/welcome/WelcomeSlide.tsx` | Criar |
| `components/welcome/WelcomePageIndicator.tsx` | Criar |
| `app/_layout.tsx` | Editar AuthGuard 4-way |
| `app.json` | Editar splash background |
| `package.json`, `package-lock.json` | Atualizar AsyncStorage |
| `assets/screenshots/prompt28/` | Criar screenshots reais |
| `docs/history.md` | Atualizar ao final |
| `docs/learnings.md` | Atualizar apenas se houver aprendizado novo |

## Validation

- `npm run type-check`
- `npm run lint`
- `npx expo run:ios`
- MCP react-native: cold start com storage limpo -> welcome; slide 1/2/3; tap `Ja tenho uma conta` -> signin + flag; relaunch sem sessao -> signin direto.
- 5 screenshots reais em `assets/screenshots/prompt28/`: slide 1, slide 2, slide 3, splash, indicator intermediario.
- Design audit contra `docs/DESIGN.md`: Vital Mint <=10%, Glass <=30%, Number-First N/A.
- `/impeccable critique` meta >=30/40.

## Commits

1. `feat(welcome): foundation — i18n + storage + AuthGuard 4-way`
2. `feat(welcome): 3 slides + page indicator + Liquid Glass CTA`
3. `chore(splash): atualiza backgroundColor pra Clinical Midnight`

## PR

Abrir PR contra `main`, incluir checklist, outputs de `type-check` e `lint`, score de critique, screenshots reais versionadas e nota explicita de que o PR nao deve ser mergeado automaticamente.
