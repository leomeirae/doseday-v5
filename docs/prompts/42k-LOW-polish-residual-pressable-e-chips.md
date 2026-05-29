# Prompt 42k — LOW — Polish residual: Pressable callback-style 🟡 BAIXO + layout chips Local da aplicação

**Skills obrigatórias:** `karpathy-guidelines`, `superpowers:writing-plans`, `react-native-best-practices`
**Branch:** `feature/42k-polish-residual`
**Pré-requisito:** PR #92 (42i) e PR #93 (43) mergeados em `main`
**Tipo:** polish visual cirúrgico — 2 escopos pequenos e independentes

---

# Objetivo

Fechar 2 issues de polish residuais do ciclo 42:

1. **Escopo A — 13 ocorrências 🟡 BAIXO remanescentes** do bug NativeWind v4 Pressable callback-style. PR #92 corrigiu os 30 🔴 ALTO (que colapsavam visualmente). Os 13 🟡 não colapsam mas perdem o feedback de `pressed` — ainda assim vale aplicar o padrão consistente.

2. **Escopo B — Layout dos chips "Local da aplicação" em `app/dose/registrar.tsx`** (sheet de Registrar dose). O Chip em si já foi corrigido (array estático), mas o container `styles.chips` é `flex-row + flexWrap: 'wrap'` com gap simples — chips ficam de larguras desiguais e a última linha fica órfã ("Braço esquerdo" sozinho). PO reportou como "desorganizado". Mudar pra grid 2 colunas com width igual.

# Contexto

- PRs #90, #91, #92 estabeleceram o padrão: `useState(pressed) + onPressIn/onPressOut + array estático`
- 13 casos remanescentes são "🟡 BAIXO": style base é só layout (flex/padding), não aparência. Não colapsam visualmente, só perdem o press feedback.
- Lista exata via grep (validada via Bash):
  ```
  app/peso/historico.tsx:76                — plusButton
  app/perfil/account.tsx:80                — backButton
  app/diario/anotar-custo.tsx:100          — botão "Salvar" no header
  app/diario/custos.tsx:46                 — plusButton
  app/diario/notas.tsx:45                  — plusButton
  app/configuracoes/lembretes.tsx:159      — row de switch
  app/configuracoes/lembretes.tsx:211      — row de horário
  app/configuracoes/tratamento/medico.tsx:211  — "Remover data" (link quieto)
  app/configuracoes/dados.tsx:213          — iconButton
  components/settings/SettingsHeader.tsx:26    — backButton
  components/perfil/SettingsRow.tsx:41     — row de menu
  components/onboarding/ConsentCheckbox.tsx:31 — row de checkbox
  components/onboarding/OnboardingShell.tsx:174 — iconButton
  ```
- Layout atual do `styles.chips` em `app/dose/registrar.tsx` L357-361:
  ```tsx
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  ```

# O que analisar antes de alterar

1. **Listar TODAS as 13 ocorrências via grep:**
   ```bash
   grep -rn "style={({\s*pressed" app/ components/
   ```
   Confirmar que retorna exatamente 13 (deve bater com a lista acima).

2. **Confirmar que `app/dose/registrar.tsx` o Chip JÁ NÃO TEM** callback-style:
   ```bash
   grep -n "callback\|({\s*pressed" app/dose/registrar.tsx
   ```
   Deve retornar zero ocorrências (Chip foi corrigido em PR anterior).

3. **Ler o componente Chip em `app/dose/registrar.tsx`** (L261-283) — confirmar que usa array estático com `[styles.chip, selected && styles.chipSelected]`. Não tocar nele.

4. **Para cada um dos 13 casos:** verificar se o callback aplica APENAS `pressed && styles.X` (singleton simples) ou se há lógica adicional. A maioria são padrões repetidos (backButton, plusButton, iconButton).

# Arquivos prováveis

**Escopo A — modificar (13 arquivos):**

Singletons simples (useState + onPressIn/Out + array estático):
- `app/peso/historico.tsx` (L76)
- `app/perfil/account.tsx` (L80)
- `app/diario/anotar-custo.tsx` (L100)
- `app/diario/custos.tsx` (L46)
- `app/diario/notas.tsx` (L45)
- `app/configuracoes/lembretes.tsx` (L159, L211)
- `app/configuracoes/tratamento/medico.tsx` (L211)
- `app/configuracoes/dados.tsx` (L213)
- `components/settings/SettingsHeader.tsx` (L26)
- `components/perfil/SettingsRow.tsx` (L41)
- `components/onboarding/ConsentCheckbox.tsx` (L31)
- `components/onboarding/OnboardingShell.tsx` (L174)

**Escopo B — modificar (1 arquivo):**
- `app/dose/registrar.tsx` — apenas `styles.chips` (L357-361) + `styles.chip` (L362+) — adicionar `justifyContent: 'space-between'` no container e `width: '48%'` + `alignItems: 'center'` no chip

**NÃO modificar:**
- Componente `Chip` em `app/dose/registrar.tsx` (L261-283) — já corrigido, intocado
- Outros componentes em `app/`, `components/`, `lib/`, `hooks/`
- `tailwind.config.js`, `global.css`, `lib/theme/tokens.ts`
- Settings Hub mergeado, Dashboard, NativeWind config

# Instruções

## Escopo A — aplicar padrão dos PRs #90/#91/#92 nos 13 singletons

Para cada arquivo, aplicar o padrão:

**Antes:**
```tsx
<Pressable
  onPress={...}
  style={({ pressed }) => [styles.plusButton, pressed && { opacity: 0.7 }]}
>
```

**Depois:**
```tsx
const [pressed, setPressed] = useState(false)
// ...
<Pressable
  onPress={...}
  onPressIn={() => setPressed(true)}
  onPressOut={() => setPressed(false)}
  style={[styles.plusButton, pressed && { opacity: 0.7 }]}
>
```

**Notas:**
- Adicionar `import { useState } from 'react'` se não estiver presente
- Se o Pressable está em um componente filho/loop (`.map`), considerar **dropar o branch `pressed`** (igual sub-padrão #2 do PR #92). Mas se for singleton, manter com state local.
- Se o style "pressed" for inline `{ opacity: 0.7 }`, manter inline (não precisa virar style nomeado).

## Escopo B — layout dos chips Local da aplicação

Em `app/dose/registrar.tsx`, alterar:

```diff
   chips: {
     flexDirection: 'row',
     flexWrap: 'wrap',
+    justifyContent: 'space-between',
     gap: spacing.xs,
   },
   chip: {
     paddingHorizontal: spacing.md,
     paddingVertical: spacing.xs,
     borderRadius: radius.full,
     backgroundColor: colors.bgSurface,
+    width: '48%',
+    alignItems: 'center',
     ...
   },
```

**Resultado visual esperado** (5 opções):
```
[ Abdome          ] [ Coxa direita    ]
[ Coxa esquerda   ] [ Braço direito   ]
[ Braço esquerdo  ]
```

Última linha tem 1 chip que fica à esquerda (intencional — `justifyContent: 'space-between'` posiciona à esquerda quando há item único).

**Cuidado:**
- Não mudar `borderRadius` ou `padding` (chips perderiam o look "pill")
- Validar empiricamente que `width: '48%'` + `gap: spacing.xs` cabe (precisa testar — pode precisar ajustar pra `width: '47%'` se gap fizer extrapolar)
- Texto longo ("Coxa esquerda", "Braço direito") deve caber sem truncar — se não couber, considerar `paddingHorizontal: spacing.sm` em vez de `spacing.md`

## Validação local

```bash
npm run type-check
npm run lint
npx expo start --clear
```

No simulador iOS, validar:

1. **Sheet `/dose/registrar`** — 5 chips em grid 2 colunas alinhado (Braço esquerdo sozinho na 3ª linha à esquerda)
2. **Press feedback restaurado** nos 13 singletons (toque longo no plusButton de peso/historico mostra opacity 0.7)
3. **Nada quebrou** em telas que continham os componentes alterados (Settings rows, onboarding consent, etc)

Capturar **3-4 screenshots em `assets/screenshots/prompt42k/`:**
- Chips Local da aplicação em grid 2 colunas (depois)
- Press feedback em 1-2 dos singletons corrigidos
- Comparativo opcional ANTES (do main) vs DEPOIS

## Commit + PR

**REGRA ANTI-CONTAMINAÇÃO (PRs do ciclo 42 que falharam: 42d, 42f, 42g; depois OK do #90 em diante — manter o padrão):**

```bash
git status --short  # VALIDAR primeiro
# Se houver graphify-out/* ou .codegraph/*:
git restore --staged graphify-out/ .codegraph/
git add docs/marketing/ docs/prompts/42k-* docs/superpowers/plans/ app/ components/ assets/screenshots/prompt42k/  # explícito por path
git status --short  # VALIDAR segunda vez
git commit -m "fix(ui): polish residual — 13 Pressable callback restantes + chips Local em grid 2 colunas"
git push -u origin feature/42k-polish-residual
```

Abrir PR via MCP GitHub. Description deve confirmar EXPLICITAMENTE:
- "git status validado pré-commit, zero código fora do escopo, zero contaminação"
- Antes/Depois dos chips Local
- Lista dos 13 arquivos corrigidos com nota "13/13 🟡 BAIXO concluído"

# O que preservar

- **Padrão estabelecido nos PRs #90/#91/#92** — usar exatamente isso
- **Componente Chip em `app/dose/registrar.tsx`** (L261-283) — intocado
- **`styles.chipSelected`, `styles.chipPressed`** se existirem — intocados (PR anterior já cuidou)
- **Tokens** (`colors.bgSurface`, `colors.brand`, `radius.full`, `spacing.*`) — usar existentes
- **Hooks, queries, schemas** — intocados
- **AuthButton, SettingsRow (do PR #90)** — já corrigidos, intocados

# Critérios de sucesso (verificáveis)

- [ ] `grep -rn "style={({\s*pressed" app/ components/` retorna **0** após o fix (era 13)
- [ ] `app/dose/registrar.tsx` `styles.chips` tem `justifyContent: 'space-between'`
- [ ] `app/dose/registrar.tsx` `styles.chip` tem `width: '48%'` + `alignItems: 'center'`
- [ ] Screenshot dos chips em grid 2 colunas no PR
- [ ] `npm run type-check` passa
- [ ] `npm run lint` passa
- [ ] 3-4 screenshots em `assets/screenshots/prompt42k/`
- [ ] `git diff --stat` mostra **apenas** arquivos esperados + screenshots + plano + prompt
- [ ] `git status --short` confirma **ZERO** `graphify-out/*`, `.codegraph/*`, artifacts antigos
- [ ] PR description menciona "git status validado pré-commit, zero contaminação"

# Restrições

- **Mudança cirúrgica.** Apenas os 13 + 1 arquivos. Zero refactor de outras telas.
- **Não criar componente wrapper** (rejeição mantida do PR #92).
- **Não tocar em tokens.ts** — usar cores existentes.
- **Não migrar pra NativeWind** — continua StyleSheet.
- **Não tocar em hooks, queries, schemas** — só visual.
- **Se algum 🟡 BAIXO virar 🔴 ALTO empiricamente** (style base não era só layout), reportar e tratar como caso especial.
- **Se grid 2 colunas no chips ficar feio empiricamente**, tentar 1 alternativa (ex: `width: '47%'`) — se ainda não convencer, parar e reportar.
- **Validar `git status --short` pelo menos 2× antes do commit.**

---

**Karpathy assumptions explícitos:**
- Padrão dos PRs #90/#91/#92 é a solução validada
- Os 13 🟡 BAIXO são singletons (não em .map) — useState funciona em todos
- Layout `width: '48%'` + `gap: spacing.xs` cabe em iPhone SE (320px)
- Texto dos chips ("Coxa esquerda", "Braço direito") cabe em metade da tela
- Chip em `dose/registrar.tsx` já corrigido — não tocar

**Could 50 lines do this?** Sim, aproximadamente. Cada singleton é ~4 linhas alteradas. Chips são 4-5 linhas em `styles`. Total: ~60-70 linhas em 14 arquivos. Cirúrgico.

**Success criteria verificáveis:** ver checklist acima.

**Próximos passos (roadmap):**
- Pós-merge: ciclo 42 100% encerrado (todas as 43 ocorrências do bug callback corrigidas + chips visíveis)
- Backlog restante: 42j (Done iOS), learn-codebase, revisão do conteúdo `docs/marketing/`
