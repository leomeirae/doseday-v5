# Prompt 06-MID-home-screen

**Branch:** `feature/06-home-screen`
**Modelo recomendado:** Sonnet (decisões visuais reais)
**Pré-requisito:** Prompt 05 mergeado em `main`. Tokens canônicos disponíveis em `lib/theme/tokens.ts`.

---

## Contexto

Hoje `app/(tabs)/index.tsx` mostra só um placeholder ("Início / em construção"). Esta é a **primeira tela de conteúdo real** do V5 — define o padrão visual que todas as outras vão seguir.

Persona-alvo: **Mariana** (38 anos, em tratamento com Mounjaro/Ozempic/Wegovy, pouco tempo de tela, quer chegar na consulta sabendo o que aconteceu). Veja `docs/PRODUCT.md` para detalhes da persona e Voice & Tone.

A Home V1 é **leitura passiva** — sem botões de ação, sem inputs. Mostra três blocos que respondem a perguntas que a Mariana faz ao abrir o app:

1. "Onde estou?" → Greeting + data
2. "Quando é minha próxima dose?" → NextDoseCard
3. "O que eu deveria saber hoje?" → InsightCard

Todos os dados são **mockados** neste prompt. Substituição por React Query + Supabase fica para prompts futuros.

---

## Tarefa

Substituir o conteúdo placeholder de `app/(tabs)/index.tsx` por uma Home Screen funcional com 3 blocos verticais, usando exclusivamente tokens de `lib/theme/tokens.ts`.

### Blocos da tela (de cima pra baixo)

**1. GreetingHeader**
- Saudação contextual baseada na hora do device:
  - 05h00 – 11h59 → "Bom dia, Mariana"
  - 12h00 – 17h59 → "Boa tarde, Mariana"
  - 18h00 – 04h59 → "Boa noite, Mariana"
- Data atual abaixo em `caption`: "Sexta-feira, 16 de maio" (formatar via `date-fns/locale/pt-BR`)
- Typography: `headline` (saudação) + `caption` (data)
- Color: `textPrimary` (saudação) + `textSecondary` (data)

**2. NextDoseCard**
- Aplica **Number-First Rule**: número grande, label embaixo
- Layout:
  - Subtítulo da seção: "Próxima dose" (typography `subtitle`, color `textSecondary`)
  - Card com background `bgElevated`, radius `lg`, padding `lg`:
    - Número grande: `2` (typography `numberLarge`, color `brand` — esta é a aplicação intencional do Vital Mint Rarity)
    - Label: "dias até sua próxima dose" (typography `body`, color `textSecondary`)
    - Separator visual (linha sutil, 1pt, color `bgSurface`) com margin vertical `md`
    - Detalhes em row:
      - Esquerda: "Mounjaro 5mg" (typography `label`, color `textPrimary`)
      - Direita: "Domingo, 18 de maio" (typography `caption`, color `textTertiary`)

**3. InsightCard**
- Layout:
  - Subtítulo da seção: "Insight do dia" (typography `subtitle`, color `textSecondary`)
  - Card com background `bgElevated`, radius `lg`, padding `lg`:
    - Texto do insight (typography `body`, color `textPrimary`):
      > "Você está completando 4 semanas de tratamento. Cerca de 70% das pessoas relatam que o efeito sobre a fome se estabiliza entre a 4ª e 6ª semana — é normal sentir variação."

### Estrutura

```
app/(tabs)/index.tsx          ← substituir (composição)
components/home/
  ├── GreetingHeader.tsx      ← novo
  ├── NextDoseCard.tsx        ← novo
  └── InsightCard.tsx         ← novo
lib/mocks/
  └── home.ts                 ← novo (dados mockados)
```

### Detalhes técnicos

- Container raiz: `SafeAreaView` (react-native-safe-area-context) + `ScrollView` vertical
- Background da tela: `colors.bgBase`
- Padding horizontal da tela: `spacing.lg`
- Padding top abaixo do SafeArea: `spacing.lg`
- Gap entre blocos: `spacing.xl`
- Gap entre subtitle de seção e card: `spacing.sm`
- Nenhum glass (regra 30% Glass — Home é camada de conteúdo)
- Brand color (`#00D4AA`) aparece SÓ no número `2` da NextDoseCard (regra Vital Mint Rarity ≤10%)

### Mocks em `lib/mocks/home.ts`

```typescript
export const homeMock = {
  user: { name: 'Mariana' },
  nextDose: {
    daysUntil: 2,
    medication: 'Mounjaro 5mg',
    scheduledDate: new Date(2026, 4, 18), // 18 de maio 2026 (domingo)
  },
  insight: {
    text: 'Você está completando 4 semanas de tratamento. Cerca de 70% das pessoas relatam que o efeito sobre a fome se estabiliza entre a 4ª e 6ª semana — é normal sentir variação.',
  },
}
```

---

## Skills obrigatórias

| Skill | Por quê |
|---|---|
| `react-native-best-practices` | Padrões StyleSheet, SafeAreaView, ScrollView, type-safe component props |
| `/impeccable craft` | Refino visual + aplicação das Named Rules (Vital Mint Rarity, Number-First, 30% Glass) |

Skills opcionais (consultar se houver dúvida específica):
- `iOS Liquid Glass Expo` — caso surja dúvida sobre SDK 54 / Expo Router

---

## Critérios de aceitação

- [ ] App abre na tab "Início" e mostra os 3 blocos sem scroll horizontal
- [ ] Greeting muda conforme hora do device (testar mudando relógio do simulador, ou mockando com `jest.useFakeTimers` se aplicável)
- [ ] NextDoseCard segue Number-First: `2` é visualmente ≥2× maior que o label adjacente
- [ ] Vital Mint (`#00D4AA`) aparece SÓ no número da NextDoseCard (nenhum outro elemento da Home usa `colors.brand`)
- [ ] Zero hard-coded color/font/spacing — todos os valores vêm de `lib/theme/tokens.ts`
- [ ] Sem `as any` / `// @ts-ignore` / `// eslint-disable`
- [ ] Sem `BlurView` ou qualquer glass na Home (camada de conteúdo)
- [ ] `npm run type-check` zero erros
- [ ] `npm run lint` zero warnings novos
- [ ] `npx expo run:ios` abre o app, navega pra tab Início, renderiza os 3 blocos corretamente
- [ ] `/impeccable critique` rodado e issues bloqueantes resolvidas
- [ ] Commit: `feat(home): tela inicial com greeting, próxima dose e insight (mockados)`
- [ ] PR aberto

---

## Restrições

- **Sem backend.** Tudo lido de `lib/mocks/home.ts`. Substituição por React Query/Supabase fica para prompts futuros
- **Sem auth.** Nome do usuário é hard-coded "Mariana" no mock
- **Sem ações.** Cards são leitura — sem onPress, sem botões, sem CTAs
- **Sem onboarding.** Esta tela é só a Home; onboarding entra em outro prompt
- **Sem novas libs.** `date-fns` já está instalado para formatação de data; usar `date-fns/locale/pt-BR`
- **Sem glass na Home.** Regra 30% Glass do DESIGN.md — glass é exclusivo da camada de navegação (já implementado no Prompt 04)
- **Não tocar em** `app/(tabs)/_layout.tsx`, `components/ui/TabBarButton.tsx`, `lib/theme/tokens.ts`

---

## Antes de executar

1. Ler `docs/architecture.md` seção "Aprendizados" (registros dos prompts 00-04)
2. Ler `docs/DESIGN.md` seções "Named Rules" (cores + typography + elevação)
3. Ler `docs/PRODUCT.md` seções "Persona primária — Mariana" e "Voice & Tone"
4. Fazer `grep` pra confirmar imports atuais de `lib/theme/tokens.ts` (não deve afetar nenhum, mas vale checar)

## Validação rápida pós-execução

```bash
# Type-check
npm run type-check

# Lint
npm run lint

# Garante que brand color só aparece nos 2 lugares esperados
# (tokens.ts define + index.tsx usa via numberLarge da NextDoseCard)
grep -r "brand" --include="*.tsx" --include="*.ts" app components lib

# Garante que não há BlurView na Home
grep -r "BlurView" app/\(tabs\)/index.tsx components/home/

# Garante zero hard-coded colors em hex nos componentes home
grep -rE "#[0-9A-Fa-f]{6}" components/home/ app/\(tabs\)/index.tsx
```

Esperado:
- type-check: 0 erros
- lint: 0 warnings novos
- grep brand: aparece em `tokens.ts` e em `components/home/NextDoseCard.tsx`
- grep BlurView: vazio
- grep hex: vazio

---

## Pós-execução

1. Rodar `/impeccable critique` na Home renderizada (passar screenshot)
2. Resolver issues bloqueantes (se houver)
3. Tirar screenshot final pra anexar no PR
4. Abrir PR com título: `feat(home): Home Screen V1 com greeting + próxima dose + insight (mockados)`
5. Atualizar `docs/architecture.md` seção "Aprendizados" se algo novo for descoberto
6. Atualizar `CLAUDE.md` tabela "Histórico" com linha do Prompt 06
