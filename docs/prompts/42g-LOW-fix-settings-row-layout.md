# Prompt 42g — LOW — Fix layout do SettingsRow (chevron quebrando linha)

**Skills obrigatórias:** `karpathy-guidelines`, `superpowers:writing-plans`, `react-native-best-practices`
**Branch:** `feature/42g-fix-settings-row-layout`
**Pré-requisito:** PR #89 mergeado em `main`
**Tipo:** fix cirúrgico em 1 arquivo, 1 causa raiz hipotetizada

---

# Objetivo

Corrigir o layout do `SettingsRow` em `app/configuracoes/index.tsx` que está renderizando os 3 elementos (ícone + label + chevron) **em coluna** em vez de em **row**, mesmo com `flexDirection: 'row'` declarado nos styles.

# Contexto

PO testou pós PR #89 e abriu `/configuracoes`. Cada item do menu (Conta, Tratamento, Lembretes, etc) está renderizando assim:

```
[ícone]
Label
>
```

Em vez do esperado:

```
[ícone]  Label                     >
```

Investigação inicial via Bash confirmou:
- `components/settings/SettingsRow.tsx` styles têm `flexDirection: 'row'`, `alignItems: 'center'`, `gap: spacing.sm`. **Estruturalmente correto.**
- `components/settings/SettingsGroup.tsx` não força column nem corta largura.
- `app/configuracoes/index.tsx` envelopa cada `SettingsGroup` em View, com `gap: spacing.lg`. Não interfere no row interno.

**Hipótese principal:** `SymbolView` do `expo-symbols` precisa de `style={{ width, height }}` explícito além do prop `size`. Sem isso, em algumas versões do `expo-symbols`, o componente pode tomar largura intrínseca grande e quebrar o flex parent.

Evidência: outras telas do app que usam `SymbolView` em flex-row sempre passam `style={{ width: SIZE, height: SIZE }}`:

```tsx
// app/memoria/index.tsx (funciona)
<SymbolView name="note.text" size={18} tintColor={colors.brand} style={{ width: 18, height: 18 }} />

// components/settings/SettingsRow.tsx (NÃO funciona — falta style)
<SymbolView name={icon} size={20} tintColor={iconColor} />
<SymbolView name="chevron.right" size={14} tintColor={colors.textTertiary} />
```

# O que analisar antes de alterar

1. **Ler `components/settings/SettingsRow.tsx` linhas 35-58** — confirmar exatamente como `SymbolView` está sendo chamado (ícone E chevron) e que NÃO tem `style` com width/height.

2. **Conferir uso de `SymbolView` em outras telas** que funcionam corretamente em flex-row (`app/memoria/index.tsx`, `app/peso/historico.tsx`, `app/(tabs)/doses.tsx`). Confirmar que essas telas passam `style={{ width, height }}` explicitamente.

3. **Verificar versão de `expo-symbols`** no `package.json`. Se for muito recente, pode ter mudado o comportamento.

4. **Se a hipótese principal estiver errada**, considerar alternativas:
   - Há algum `flexWrap: 'wrap'` herdado de um pai?
   - O `text` tem `flexShrink` insuficiente?
   - Tem `width: '100%'` em algum elemento que quebra o row?

# Arquivos prováveis

**Modificar:**
- `components/settings/SettingsRow.tsx` — adicionar `style={{ width: SIZE, height: SIZE }}` aos 2 `SymbolView` (ícone e chevron)

**NÃO modificar:**
- `components/settings/SettingsGroup.tsx`
- `app/configuracoes/index.tsx`
- Hooks, queries, schemas, outros componentes
- `lib/theme/tokens.ts`
- `tailwind.config.js`

# Instruções

## 1. Fix do SymbolView no SettingsRow

Em `components/settings/SettingsRow.tsx`:

```diff
-  <SymbolView name={icon} size={20} tintColor={iconColor} />
+  <SymbolView name={icon} size={20} tintColor={iconColor} style={{ width: 20, height: 20 }} />
```

E:

```diff
   {chevron ? (
-    <SymbolView name="chevron.right" size={14} tintColor={colors.textTertiary} />
+    <SymbolView name="chevron.right" size={14} tintColor={colors.textTertiary} style={{ width: 14, height: 14 }} />
   ) : null}
```

**Importante:** essas são as 2 únicas ocorrências de `SymbolView` em `SettingsRow.tsx` (validar via grep).

## 2. Validar localmente

```bash
npm run type-check
npm run lint
npx expo start --clear
```

No simulador iOS, abrir `/configuracoes` (engrenagem do Dashboard) e validar:

1. Cada item (Conta, Tratamento, Protocolo de dose, Lembretes, Dados, Privacidade, Suporte) renderiza com ícone à esquerda, label no centro, chevron `>` à direita — **tudo na mesma linha horizontal**.
2. Espaçamento entre itens consistente.
3. Toque em cada item abre a tela correspondente (não testar fluxo completo — só confirmar que o Pressable funciona).

Capturar 2 screenshots em `assets/screenshots/prompt42g/`:
- Tela `/configuracoes` com layout corrigido
- Detalhe de um row (ex: linha "Conta") mostrando alinhamento horizontal

## 3. Commit + PR

```bash
git add -A
git status --short  # validar zero artifacts (graphify-out/*, .codegraph/*)
git commit -m "fix(settings): SymbolView com style width/height explícito pra corrigir layout do SettingsRow"
git push -u origin feature/42g-fix-settings-row-layout
```

**ATENÇÃO CRÍTICA:** dos últimos 2 PRs (42d e 42f) o agente contaminou o commit com `graphify-out/*`. Rodar `git status --short` ANTES do `git add` e fazer `git restore --staged graphify-out/` se houver. Reportar essa validação explicitamente no walkthrough.

Abrir PR via MCP GitHub. Description menciona: "Prompt 42g — fix cirúrgico do layout do SettingsRow (SymbolView precisava de style width/height explícito)."

# O que preservar

- **Toda a estrutura do componente `SettingsRow`** intacta — só adiciona `style={{ width, height }}` nos 2 `SymbolView`.
- **Estilos** (`styles.row`, `styles.label`, etc) intactos — não modificar.
- **Comportamento** (variants `stacked`, `destructive`, `divider`, `disabled`) intacto.
- **`SettingsGroup.tsx`, `app/configuracoes/*`** intocados.
- **Hooks, queries, schemas** intocados.

# Critérios de sucesso (verificáveis)

- [ ] `grep -c "style={{ width: 20, height: 20 }}" components/settings/SettingsRow.tsx` retorna **1** (ícone principal)
- [ ] `grep -c "style={{ width: 14, height: 14 }}" components/settings/SettingsRow.tsx` retorna **1** (chevron)
- [ ] `npm run type-check` passa
- [ ] `npm run lint` passa
- [ ] 2 screenshots em `assets/screenshots/prompt42g/`
- [ ] `git diff --stat` mostra **apenas** `components/settings/SettingsRow.tsx` modificado + screenshots + plano persistido + docs/history.md
- [ ] `git status --short` confirma zero `graphify-out/*`, `.codegraph/*`, prompt42a-f artifacts
- [ ] PR description menciona "Prompt 42g — fix layout SettingsRow"
- [ ] Walkthrough confirma EXPLICITAMENTE que `git status` foi validado pré-commit (sem contaminação)

# Restrições

- **Mudança mínima.** Apenas 2 linhas alteradas no `SettingsRow.tsx` (adicionar `style` em 2 `SymbolView`).
- **Não tocar em outros componentes** do design system de Settings (`SettingsGroup`, `SettingsHeader`, `SettingsFooter`, `SettingsSectionHeader`, `SettingsRow` outras props).
- **Não refatorar** `SettingsRow` pra usar NativeWind.
- **Não validar o fix em outros componentes** que usam `SymbolView` — se tiverem o mesmo problema, fica pra prompts futuros.
- **Se a hipótese estiver errada** e o fix do `style` não corrigir o layout, **parar e reportar**. Não tentar refatoração ampla.
- **Validar `git status --short` antes de `git add`** — confirmar zero artifacts (essa regra falhou em 42d/42f, agora é crítica).

---

**Karpathy assumptions explícitos:**
- Causa raiz é falta de `style={{ width, height }}` no `SymbolView` (hipótese 1, baseada em comparação com outras telas que funcionam)
- A solução cirúrgica é adicionar a prop `style` apenas nas 2 ocorrências de `SymbolView` no `SettingsRow.tsx`
- Não há outros componentes em `SettingsRow.tsx` afetados (validar via leitura completa do arquivo)
- Versão atual de `expo-symbols` no `package.json` é estável (validar)

**Could 50 lines do this?** Sim, MENOS de 50. É 2 linhas alteradas em 1 arquivo. Prompt LOW.

**Success criteria verificáveis:** ver checklist acima — todos via grep + visual no simulador.

**Próximos passos (roadmap, não dependência):**
- Se o fix funcionar e Léo aprovar, ciclo 42 efetivamente fechado (a-g completo)
- Próximo tema: pre-ship App Store, onboarding refinado, ou outro a decidir com PO
