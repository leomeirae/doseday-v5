# Prompt 08-MID-tela-doses

**Branch:** `feature/08-tela-doses`
**Modelo recomendado:** Sonnet (decisões visuais reais)
**Pré-requisito:** Prompt 07 mergeado em `main` (`npm run lint` funcional).

---

## Contexto

Hoje `app/(tabs)/doses.tsx` é só placeholder. Esta é a **segunda tela de conteúdo do V5** — testa se o padrão visual da Home escala bem pra listas (cards repetidos, seções com header).

Persona-alvo: Mariana (38 anos, em tratamento com Mounjaro 5mg uma vez por semana — domingos 08:00). Veja `docs/PRODUCT.md` para detalhes.

Pergunta que a Mariana faz ao abrir essa tela: **"Quando foi minha última dose? Quando é a próxima? Estou em dia?"**

A Doses V1 é **leitura passiva** — sem botões de ação. Padrão alinhado com a Home (Prompt 06). Ações (marcar como aplicada, editar, pular) entram só depois da integração com Supabase.

---

## Tarefa

Substituir o placeholder de `app/(tabs)/doses.tsx` por uma tela com 2 seções verticais ("Próximas" e "Histórico"), cada uma com 4 doses mockadas.

### Estrutura da tela

```
Doses                              ← headline (1ª linha após SafeArea)

Próximas                           ← subtitle (label de seção)
┌─ DoseCard ─────────────────┐
│ Hoje, 18 de maio           │    ← title + caption acima do separator
│ Mounjaro 5mg • 08:00       │    ← body
│ ●  Agendada                │    ← StatusBadge semanticInfo
└────────────────────────────┘
[3 cards de "próximas" adicionais]

Histórico                          ← subtitle
┌─ DoseCard ─────────────────┐
│ Domingo, 11 de maio        │
│ Mounjaro 5mg • 08:00       │
│ ●  Aplicada                │    ← StatusBadge semanticPositive
└────────────────────────────┘
[3 cards de "histórico" — incluir 1 "Pulada" (StatusBadge semanticWarning)]
```

### Componentes

**1. SectionHeader (`components/doses/SectionHeader.tsx`)**
- Props: `title: string`
- Typography: `subtitle`, color: `textSecondary`
- Margem: `marginBottom: spacing.sm`, `marginTop: spacing.xl` (entre seções)
- Reutilizável (Home pode trocar pra esse padrão num refactor futuro)

**2. StatusBadge (`components/doses/StatusBadge.tsx`)**
- Props: `status: 'scheduled' | 'applied' | 'skipped'`
- Layout: dot 8×8 + label horizontal
- Map status → cor semântica + label:
  - `scheduled` → `colors.semanticInfo` + "Agendada"
  - `applied` → `colors.semanticPositive` + "Aplicada"
  - `skipped` → `colors.semanticWarning` + "Pulada"
- Typography: `caption`, color: cor semântica do status
- Regra "cor não-comunicativa" (a11y): dot + label texto + cor — nunca SÓ cor

**3. DoseCard (`components/doses/DoseCard.tsx`)**
- Props: `dose: { id, date: Date, medication, dosage, time, status }`
- Card: bg `bgElevated`, radius `lg`, padding `lg`, marginBottom `sm`
- Border: `0.5px` rgba(255,255,255,0.06) (Card Default spec do DESIGN.md — mesmo padrão do InsightCard da Home)
- Conteúdo:
  - Linha 1: data formatada (typography `subtitle`, color `textPrimary`)
    - Formatos: "Hoje, 18 de maio", "Amanhã, 19 de maio", "Domingo, 25 de maio" (relativo até 7 dias, absoluto depois)
  - Linha 2: medicamento + horário inline (typography `body`, color `textSecondary`)
    - Formato: "Mounjaro 5mg • 08:00"
  - Linha 3: `<StatusBadge status={dose.status} />` com `marginTop: spacing.sm`
- A11y: `accessible={true}` + `accessibilityLabel` agrupando tudo (ex: "Domingo 25 de maio, Mounjaro 5 miligramas às 8 horas, Agendada")

**4. doses.tsx (substituir placeholder)**
- Layout: `SafeAreaView` (react-native-safe-area-context) + `ScrollView` vertical
- `contentContainerStyle.paddingBottom`: `spacing.xxxl` (64) — garante que último card não fique sob a tab bar
- Padding horizontal: `spacing.lg`
- Header da tela: `<Text>Doses</Text>` typography `headline`, color `textPrimary`, marginTop `lg`, marginBottom `xl`
- Renderiza:
  1. SectionHeader "Próximas" + map de `mockNextDoses` em DoseCard
  2. SectionHeader "Histórico" + map de `mockHistoryDoses` em DoseCard

**5. mocks (`lib/mocks/doses.ts`)**

```typescript
import { addDays } from 'date-fns'

export type DoseStatus = 'scheduled' | 'applied' | 'skipped'

export interface Dose {
  id: string
  date: Date
  medication: string
  dosage: string
  time: string // HH:mm
  status: DoseStatus
}

const today = new Date(2026, 4, 18) // 18 de maio 2026 (domingo) — alinha com Home mock

export const mockNextDoses: Dose[] = [
  { id: 'n1', date: today,                medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'scheduled' },
  { id: 'n2', date: addDays(today, 7),    medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'scheduled' },
  { id: 'n3', date: addDays(today, 14),   medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'scheduled' },
  { id: 'n4', date: addDays(today, 21),   medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'scheduled' },
]

export const mockHistoryDoses: Dose[] = [
  { id: 'h1', date: addDays(today, -7),   medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'applied' },
  { id: 'h2', date: addDays(today, -14),  medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'applied' },
  { id: 'h3', date: addDays(today, -21),  medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'skipped' },
  { id: 'h4', date: addDays(today, -28),  medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'applied' },
]
```

### Formatação de data (helper sugerido em `lib/utils/dateFormat.ts`)

- Hoje → "Hoje, 18 de maio"
- Amanhã → "Amanhã, 19 de maio"
- Demais futuros (até 7 dias) → "Domingo, 25 de maio"
- Demais futuros (>7 dias) → "Domingo, 1 de junho"
- Passado (qualquer) → "Domingo, 11 de maio"

Usar `date-fns` + `isToday`, `isTomorrow`, `format`, `locale/ptBR`. Se preferir manter o helper inline em `DoseCard.tsx`, OK também — desde que não duplique a lógica em outros lugares.

---

## Skills obrigatórias

| Skill | Por quê |
|---|---|
| `react-native-best-practices` | Padrões RN, ScrollView, a11y, type-safe props |
| `/impeccable craft` | Refino visual, Status semantic colors, Card consistency |

---

## Critérios de aceitação

- [ ] Tela "Doses" renderiza com 2 seções (Próximas + Histórico), 4 cards cada
- [ ] Status badges aparecem com dot + label texto + cor semântica
- [ ] Pelo menos 1 card no histórico mostra "Pulada" (semanticWarning)
- [ ] Datas relativas funcionam: "Hoje, ...", "Amanhã, ...", "Domingo, ..."
- [ ] Zero hard-coded color/font/spacing — tudo via `lib/theme/tokens.ts`
- [ ] **Zero uso de `colors.brand`** (Vital Mint Rarity — Doses não usa Vital Mint)
- [ ] Sem `BlurView`/glass (camada de conteúdo)
- [ ] Sem `as any` / `// @ts-ignore` / `// eslint-disable`
- [ ] A11y: todos os DoseCard têm `accessible={true}` + `accessibilityLabel` agrupado
- [ ] `npm run type-check` zero erros
- [ ] `npm run lint` zero erros novos (warning preexistente de i18n pode persistir)
- [ ] `npx expo run:ios` abre, navega pra tab Doses, scroll vertical funciona, último card não fica colado/atrás da tab bar
- [ ] `/impeccable critique` rodado e issues bloqueantes resolvidos (não-bloqueantes podem ser adiados com nota no PR)
- [ ] Commit: `feat(doses): tela de doses com próximas e histórico (mockados)`
- [ ] PR aberto

---

## Restrições

- **Sem backend.** Tudo lido de `lib/mocks/doses.ts`
- **Sem ações.** Cards são leitura. Sem onPress, sem swipe, sem botões
- **Sem `colors.brand` na tela.** Vital Mint gasta só na Home (regra Rarity)
- **Sem glass.** Camada de conteúdo
- **Sem `FlatList`.** Lista pequena (8 itens) — `ScrollView` simples. Migrar pra FlatList em prompt futuro quando o histórico crescer
- **Não tocar em** `app/(tabs)/_layout.tsx`, `components/ui/`, `components/home/`, `lib/theme/tokens.ts`

---

## Antes de executar

1. Ler `docs/architecture.md` seção "Aprendizados" (14.0 e 14.1)
2. Ler `docs/DESIGN.md` seções "Named Rules" (cores semânticas, 30% Glass, Vital Mint Rarity) e "Components > Cards"
3. Ler `components/home/InsightCard.tsx` — DoseCard segue o mesmo padrão de border 0.5px (Card Default spec)
4. Conferir que `colors.semanticInfo`, `semanticPositive`, `semanticWarning` existem em `lib/theme/tokens.ts`

## Validação rápida pós-execução

```bash
# Type-check + lint
npm run type-check
npm run lint

# Garante zero uso de brand color na tela Doses
grep -r "colors.brand\|colors\.textBrand" components/doses/ app/\(tabs\)/doses.tsx
# Esperado: vazio

# Garante zero glass
grep -r "BlurView" components/doses/ app/\(tabs\)/doses.tsx
# Esperado: vazio

# Garante zero hex hard-coded
grep -rE "#[0-9A-Fa-f]{6}" components/doses/ app/\(tabs\)/doses.tsx
# Esperado: vazio (rgba do border pode aparecer mas é OK se for em variável)

# Cobertura semantic
grep -rE "semanticPositive|semanticWarning|semanticInfo" components/doses/
# Esperado: aparece em StatusBadge.tsx
```

---

## Pós-execução

1. Rodar `/impeccable critique` com screenshot da tela
2. Resolver issues bloqueantes (P2 a11y geralmente)
3. Tirar screenshot final + anexar no PR description
4. Abrir PR: `feat(doses): tela de doses V1 com próximas e histórico (mockados)`
5. Atualizar `docs/architecture.md` se algo novo for descoberto
6. Atualizar `CLAUDE.md` tabela "Histórico" com linha do Prompt 08
