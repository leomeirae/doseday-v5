# Prompt 42i — MID — Auditoria + fix sistêmico de Pressable callback-style quebrado pelo NativeWind v4

**Skills obrigatórias:** `karpathy-guidelines`, `superpowers:writing-plans`, `react-native-best-practices`
**Branch:** `feature/42i-pressable-callback-style-fix`
**Pré-requisito:** PR #91 mergeado em `main`
**Agente recomendado:** Claude Code (usar codegraph para auditoria)
**Tipo:** auditoria sistêmica + fix dirigido — escopo determinado pela auditoria

---

# Objetivo

Resolver de vez o bug estrutural identificado nos PRs #90 (SettingsRow) e #91 (AuthButton):

> Com `jsxImportSource: 'nativewind'` ativo, `<Pressable style={({pressed}) => [...]}` faz o NativeWind v4 **descartar silenciosamente** o style base. Resultado visual: componente colapsa pro conteúdo (texto puro, sem padding, sem fundo, sem border).

O **PO** já viu o bug em 3 lugares (SettingsRow, AuthButton, e agora chips de "Acompanhamento médico"). O grep encontrou **43 ocorrências em 20+ arquivos** — muitas potencialmente afetadas.

Este prompt vai:
1. **Auditar** sistematicamente os 43 casos via codegraph + grep
2. **Categorizar** quais têm o bug (styles base no array do callback) vs quais não têm (só pressed style)
3. **Aplicar fix sistemático** em todos os afetados usando o padrão estabelecido nos PRs #90/#91 (state local + onPressIn/onPressOut + array estático)
4. **Priorizar** os casos visíveis ao PO (chips do médico = caso reportado) — esses não podem ficar pra depois

# Contexto

- PRs #90 e #91 estabeleceram o padrão de fix:
  ```tsx
  const [pressed, setPressed] = useState(false)
  
  <Pressable
    onPress={...}
    onPressIn={() => setPressed(true)}
    onPressOut={() => setPressed(false)}
    style={[styles.base, condicionais..., pressed && styles.pressed]}
  >
  ```

- Bug identificado em:
  - `app/configuracoes/tratamento/medico.tsx` L126-150 (segmented control "Acompanhamento médico" — PO reportou visualmente)
  - 42 outras ocorrências no app (potencialmente afetadas)

- Auditoria preliminar via `grep "style={({\s*pressed" app/ components/`:
  ```
  app/peso/historico.tsx                      app/(onboarding)/dose-frequency.tsx
  app/perfil/account.tsx                       app/diario/anotar-custo.tsx
  app/perfil/protocolo.tsx                     app/diario/anotar-sintoma.tsx
  app/perfil/notificacoes.tsx                  app/diario/custos.tsx
  app/(onboarding)/dose.tsx                    app/diario/notas.tsx
  app/diario/quick-log.tsx                     app/configuracoes/lembretes.tsx
  app/configuracoes/tratamento/medico.tsx     app/configuracoes/dados.tsx
  components/settings/SettingsHeader.tsx       components/home/EmptyDoseStateCard.tsx
  components/home/HomeQuickActions.tsx         components/perfil/SettingsRow.tsx
  components/welcome/WelcomeActionDock.tsx     components/relatorios/WeightChartCard.tsx
  ... + 3-5 outros
  ```

- **Importante:** nem todos os 43 casos têm o bug. Bug aparece quando o array do callback inclui **styles base** (não-condicionais). Casos seguros: callback que aplica APENAS `pressed && styles.X`.

# O que analisar antes de alterar

1. **Usar codegraph para mapear:**
   ```
   codegraph_search "Pressable"
   ```
   Pra ter contexto rápido dos componentes.

2. **Auditoria sistemática via grep:**
   ```bash
   grep -rn "style={({\s*pressed" app/ components/ 2>/dev/null
   ```
   Lista todas as 43 ocorrências com linha exata.

3. **Para cada ocorrência, classificar:**
   - **🔴 AFETADO:** array do callback tem styles base (não-condicionais) tipo `styles.foo` direto, sem condicional
   - **🟢 SEGURO:** array só tem `pressed && styles.X` ou `condicao && styles.X` — sem styles "soltos"

4. **Confirmar visualmente** que `medico.tsx` segmented control é caso afetado:
   - Ler L126-150 — tem `styles.option`, `styles.optionDivider`, `styles.optionSelected` no array — **AFETADO**

5. **Decidir estratégia de fix:**
   - **Opção A:** refatorar caso por caso (cirúrgico, mas repetitivo)
   - **Opção B:** criar componente wrapper `<PressableSafe>` que abstrai o padrão (DRY, mas adiciona componente novo) → discutir trade-off antes

# Arquivos prováveis

**Modificar (lista completa será determinada pela auditoria):**
- `app/configuracoes/tratamento/medico.tsx` — caso PO reportou (prioridade máxima)
- Outros arquivos da lista de 20+ que a auditoria identificar como AFETADOS

**Potencialmente:**
- `components/ui/PressableSafe.tsx` — novo componente wrapper (se Opção B for escolhida)

**NÃO modificar:**
- Casos classificados como SEGURO (só pressed style)
- Tela `/perfil/protocolo` se já foi corrigida via `AuthButton.tsx` no PR #91
- `lib/theme/tokens.ts`, hooks, queries, schemas
- Componentes já corrigidos (SettingsRow do PR #90, AuthButton do PR #91)

# Instruções

## 1. Auditoria (antes de codar)

Rodar os 2 comandos de auditoria, e produzir uma **tabela classificada**:

```
| Arquivo                                            | Linha | Componente             | Categoria | Quebra visualmente? |
|----------------------------------------------------|-------|------------------------|-----------|---------------------|
| app/configuracoes/tratamento/medico.tsx            | 136   | Segmented control      | AFETADO   | SIM (PO reportou)   |
| app/configuracoes/tratamento/medico.tsx            | 179   | Date button            | AFETADO?  | a confirmar         |
| ...                                                | ...   | ...                    | ...       | ...                 |
```

A categoria "AFETADO" exige verificação manual do código de cada caso. Não chutar.

## 2. Decisão estratégica

Após a auditoria, escolher entre:

- **Opção A — caso por caso:** menos abstração, fix repetitivo mas explícito
- **Opção B — componente wrapper:** criar `<PressableSafe>` que abstrai o padrão

**Reportar decisão e justificativa** antes de codar. Se Opção B, mostrar a API do wrapper proposto.

## 3. Aplicar o fix

Para cada caso AFETADO, aplicar o padrão dos PRs #90/#91:

```diff
-<Pressable
-  onPress={...}
-  style={({ pressed }) => [
-    styles.base,
-    selected && styles.selected,
-    pressed && styles.pressed,
-  ]}
->
+<Pressable
+  onPress={...}
+  onPressIn={() => setPressed(true)}
+  onPressOut={() => setPressed(false)}
+  style={[
+    styles.base,
+    selected && styles.selected,
+    pressed && styles.pressed,
+  ]}
+>
```

Adicionando o state local:
```diff
+const [pressed, setPressed] = useState(false)
```

## 4. Priorização

- **Caso #1 (PO reportou — prioridade máxima):** `app/configuracoes/tratamento/medico.tsx` segmented control
- **Caso #2 (PO pode ver em breve):** date button do mesmo arquivo (L179)
- **Caso #3 (PO pode ver em breve):** clear button (L209)
- **Casos #4+:** outros AFETADOS — corrigir todos no mesmo PR se sair cabível, senão deferir explicitamente pra 42j

## 5. Validação local

```bash
npm run type-check
npm run lint
npx expo start --clear
```

Validar visualmente no simulador:
- **`/configuracoes/tratamento/medico`** — 3 chips de Acompanhamento médico aparecem como botões reais (border, padding, label legível); segmentado e clicável; "Selected" tem destaque
- Outras telas afetadas se houver

**Capturar 4+ screenshots em `assets/screenshots/prompt42i/`:**
- Antes/Depois dos chips do médico
- Quaisquer outros componentes corrigidos (com antes/depois)

## 6. Commit + PR

**Validação anti-contaminação OBRIGATÓRIA (3 PRs falharam até 42g, depois ficou OK):**

```bash
git status --short  # VALIDAR PRIMEIRO
# Se houver graphify-out/* ou .codegraph/* no staging:
git restore --staged graphify-out/ .codegraph/
git add -A
git status --short  # VALIDAR DE NOVO
git commit -m "fix(ui): Pressable callback-style — fix sistêmico do bug NativeWind v4 em N componentes"
git push -u origin feature/42i-pressable-callback-style-fix
```

Walkthrough deve confirmar EXPLICITAMENTE: "git status validado pré-commit, ZERO graphify-out/ ou .codegraph/."

Abrir PR via MCP GitHub. Description deve incluir:
- Lista completa de arquivos modificados
- Tabela da auditoria (todos os 43 casos com categoria)
- Decisão sobre Opção A vs B com justificativa
- Screenshots antes/depois
- Casos deferidos explicitamente (se houver)

# O que preservar

- **Lógica de pressed state já estabelecida** nos PRs #90/#91 — usar mesmo padrão
- **AuthButton e SettingsRow já corrigidos** — não tocar
- **Casos categorizados como SEGURO** — não tocar (não tem o bug)
- **Hooks, queries, schemas, tokens** — intocados
- **Settings Hub mergeado** — estrutura intacta

# Critérios de sucesso (verificáveis)

- [ ] Tabela completa de auditoria com 43 casos categorizados (AFETADO/SEGURO) entregue no plano
- [ ] Decisão A/B reportada com justificativa
- [ ] `medico.tsx` segmented control corrigido (PO viu — prioridade máxima)
- [ ] Lista clara de todos os arquivos modificados E todos os casos deferidos
- [ ] `grep "style={({\s*pressed" app/ components/` mostra **menos ocorrências** após o fix
- [ ] `npm run type-check` passa
- [ ] `npm run lint` passa
- [ ] 4+ screenshots em `assets/screenshots/prompt42i/`
- [ ] `git status --short` confirma **ZERO** `graphify-out/*`, `.codegraph/*`, prompts antigos
- [ ] Walkthrough lista cada caso corrigido + reson visual (antes/depois)
- [ ] PR description menciona "fix sistêmico do bug NativeWind v4 Pressable callback-style"

# Restrições

- **Não mudar APIs externas** — só mudar interno do componente que renderiza o Pressable
- **Não criar tokens novos** — usar `colors.brand`, `colors.brandDim`, etc existentes
- **Não migrar componentes pra NativeWind** (continua StyleSheet)
- **Não tocar em hooks, queries, schemas**
- **Não refatorar pra reformular UX** — só desfazer o bug. Se um componente fica visualmente diferente, capturar antes/depois.
- **Não deferir casos AFETADOS visualmente óbvios** — corrigir agora. Defer só de casos onde é incerto.
- **Validar `git status --short` 3× antes de commitar.**

---

**Karpathy assumptions explícitos:**
- Bug do Pressable callback-style é causa raiz comum em 43 casos
- Padrão de fix dos PRs #90/#91 é a solução validada
- Nem todos os 43 casos quebram visualmente (depende se tem styles base no array do callback)
- Caso do médico (L136-141) é confirmado AFETADO (visual já reportado pelo PO)
- CodeGraph + grep complementares dão cobertura completa do escopo
- Wrapper `<PressableSafe>` pode ou não ser criado — decidir empiricamente após auditoria

**Could 50 lines do this?** Depende da auditoria. Mínimo é fix do médico (~6 linhas). Máximo é wrapper + uso em 15-20 componentes (~200-400 linhas).

**Success criteria verificáveis:** ver checklist acima.

**Próximos passos (roadmap, não dependência):**
- Prompt 42j: localização iOS pra resolver "Done" (`app.json` + `expo prebuild --clean`)
- Se 42i deferir casos SEGUROS ou de baixa prioridade, eles podem ficar pra 42k (audit residual)
