# ADR 0007 — Pivot da stack visual: NativeWind v4 + react-native-reusables

**Data:** 2026-05-27
**Status:** Aceita
**Contexto do trabalho:** Prompt 40 — `chore/40-pivot-stack-visual-nativewind`
**Decisores:** Léo (PO)

---

## Contexto

A V5 foi iniciada com StyleSheet nativo + Liquid Glass (iOS 26+) como pilares visuais. Após testes no app, o PO identificou que o resultado não está entregando o "moderno + intuitivo" almejado. Três constatações motivaram o pivot:

1. **Liquid Glass como pilar gera rigidez.** Restringir glass à camada de navegação é correto do ponto de vista do HIG, mas não há tab bar no app atualmente — ela foi removida e substituída por navegação via cards do Dashboard (`router.push()`). Sem tab bar, o principal ponto de Liquid Glass sumiu.

2. **StyleSheet nativo tem DX mais lenta.** Cada ajuste visual exige modificar objetos de estilo separados, sem a co-locação e reutilização que Tailwind oferece. A iteração UI está lenta demais pra um produto pré-PMF.

3. **react-native-reusables entrega componentes prontos.** A biblioteca é inspirada em shadcn/ui — componentes acessíveis, estilizáveis via NativeWind, com primitivas (`Button`, `Card`, `Sheet`, `Badge`, `Dialog`) que cobrem a maioria dos casos de uso do DoseDay sem build from scratch.

Nota histórica: a regra anti-pirraça #4 do `CLAUDE.md` bloqueava NativeWind explicitamente. Essa regra foi criada no início do projeto como proteção contra regressão estética, mas tornou-se contraproducente dado o ritmo atual de iteração.

---

## Decisão

Adotar **NativeWind v4 + react-native-reusables** como stack visual principal do DoseDay V5.

| Aspecto | Antes | Depois |
|---|---|---|
| Styling | StyleSheet nativo | NativeWind v4 (Tailwind no RN) |
| Componentes | Build from scratch | react-native-reusables (shadcn/ui para RN) |
| Liquid Glass | Pilar arquitetural | Opcional — usar quando agregar, não como regra |
| Tab bar | Era item de UX | **Removida.** Navegação via `router.push()` em cards do Dashboard |
| Navegação | Tab bar 5 abas | Dashboard cards + `router.push()` para telas de detalhe |

Stack técnica após o pivot:

- `nativewind@^4.x` — Tailwind classes em componentes React Native
- `tailwindcss@^3.x` — config com tokens extraídos de `lib/theme/tokens.ts`
- `react-native-reusables` — primitivas acessíveis baseadas em Radix UI
- `@expo/ui` — mantido para componentes nativos iOS quando aplicável
- `expo-glass-effect` — disponível como opcional para casos de navegação com glass

Componentes legados em StyleSheet continuam funcionando — migração é progressiva, não big-bang.

---

## Alternativas consideradas

| Alternativa | Por que rejeitada |
|---|---|
| Manter StyleSheet + polish visual intensivo | DX lenta. Cada mudança de spacing/cor em múltiplos componentes é manual. Não escala pré-PMF. |
| NativeWind puro sem reusables | Válido, mas deixa o time construindo primitivas de acessibilidade do zero (Sheet, Dialog, Select). react-native-reusables resolve isso com padrão shadcn/ui já validado. |
| gluestack-ui | API diferente do Tailwind, curva de aprendizado extra, menos alinhada com DX web que o time conhece. |
| nativewindui | Alternativa próxima ao react-native-reusables mas menor ecosystem e menos issues resolvidos na data desta decisão. |

---

## Consequências

### Positivas

- DX Tailwind: co-locação de estilo, IntelliSense, classes semânticas
- Kit de componentes pronto: `Button`, `Card`, `Sheet`, `Badge`, `Dialog`, `Select`, `Input` — menos código proprietário
- Velocidade de iteração visual aumenta substancialmente
- Design tokens de `lib/theme/tokens.ts` podem ser mapeados para `tailwind.config.js` — uma fonte canônica de verdade
- Migração progressiva: componentes legados continuam sem erro até serem migrados

### Negativas

- `babel.config.js` + `metro.config.js` precisam de configuração adicional (Prompt 41)
- `tailwind.config.js` precisa mapear tokens existentes (Prompt 41)
- Alguns componentes nativos iOS podem perder o "feel" Liquid Glass — aceito, dado que Liquid Glass não é mais pilar
- Learning curve para a equipe em como NativeWind se comporta no New Architecture (principalmente em animações Reanimated — continuar usando StyleSheet nesses casos)

### Em aberto (decidir em Prompt 41+)

- Como tratar dark mode no NativeWind (tokens semânticos vs classes `dark:`)
- Onde usar `PlatformColor` vs tokens NativeWind
- Animações complexas com Reanimated — continuar com `useAnimatedStyle` + StyleSheet inline ou usar NativeWind com `animated` prefix?
- Quais componentes de `react-native-reusables` instalar na Fase 1 vs progressivamente

---

## Próximos passos (roadmap, não dependência hard)

1. **Prompt 41** — Setup técnico: instalar `nativewind@v4`, `tailwindcss`, configurar `babel.config.js` + `metro.config.js` + `tailwind.config.js`, instalar `react-native-reusables`, testar build.
2. **Prompt 42** — Fechar gap de features "órfãs": identificar componentes que dependiam de Liquid Glass e precisam de alternativa visual.
3. **Prompt 43+** — Migração progressiva tela-a-tela, começando pela Home e Diário.

---

## Reversibilidade

**Reversível com custo médio.** Componentes migrados para NativeWind precisariam de reescrita manual de volta para StyleSheet. Componentes legados (não migrados) são revertíveis a custo zero. Se o pivot não funcionar nos primeiros 2-3 prompts, reavaliar antes de migrar mais de 20% do codebase.
