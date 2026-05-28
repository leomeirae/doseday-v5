# Plano de Implementação — Fix Layout do SettingsRow (Prompt 42g)

## Premissas e Suposições (Karpathy Guidelines)
1. **Causa Raiz**: O componente `SymbolView` do `expo-symbols` sem `style={{ width, height }}` explícito assume dimensões intrínsecas excessivas em algumas versões/telas, quebrando a disposição em linha (`flexDirection: 'row'`) do contêiner pai `SettingsRow` e empilhando os itens verticalmente.
2. **Solução Cirúrgica**: Adicionar a prop `style` com largura e altura correspondentes ao prop `size` do `SymbolView` (20 para o ícone e 14 para o chevron) no arquivo `components/settings/SettingsRow.tsx`.
3. **Escopo Mínimo**: Apenas 1 arquivo modificado, sem drive-by refactoring ou re-styling em NativeWind.

---

## Tabela: Plano + Riscos + Arquivos + Validação

| Etapa / Plano | Riscos Identificados | Arquivos Afetados | Critérios de Validação |
| :--- | :--- | :--- | :--- |
| **1. Fix de Layout do SettingsRow**<br>- Adicionar `style={{ width: 20, height: 20 }}` ao ícone.<br>- Adicionar `style={{ width: 14, height: 14 }}` ao chevron. | - Nenhum risco conhecido, mudança cirúrgica de CSS/layout. | - `components/settings/SettingsRow.tsx` | - `tsc` e `eslint` sem erros.<br>- Validar via grep o número exato de ocorrências modificadas. |
| **2. Validação Visual e Screenshots**<br>- Abrir `/configuracoes` no simulador e validar o alinhamento em linha.<br>- Capturar 2 screenshots. | - Metro cacheado ou não recarregado. | - `assets/screenshots/prompt42g/` | - 2 screenshots reais PNG na pasta indicada. |
| **3. Validação do Git Status**<br>- Garantir que não há contaminação de `graphify-out` ou `.codegraph`. | - Commitar arquivos gerados localmente indevidamente. | - `git status` | - `git status --short` contendo apenas `SettingsRow.tsx`, screenshots, plano e `history.md`. |

---

## Unified Diff Planejado

```diff
diff --git a/components/settings/SettingsRow.tsx b/components/settings/SettingsRow.tsx
index d7a5c8e..42f61a1 100644
--- a/components/settings/SettingsRow.tsx
+++ b/components/settings/SettingsRow.tsx
@@ -34,7 +34,7 @@ export function SettingsRow({
   const accessibilityLabel = value ? `${label}: ${value}` : label
   const rowContent = (
     <>
-      <SymbolView name={icon} size={20} tintColor={iconColor} />
+      <SymbolView name={icon} size={20} tintColor={iconColor} style={{ width: 20, height: 20 }} />
       {stacked && value ? (
         <View style={styles.copy}>
           <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
@@ -54,7 +54,7 @@ export function SettingsRow({
         </>
       )}
       {chevron ? (
-        <SymbolView name="chevron.right" size={14} tintColor={colors.textTertiary} />
+        <SymbolView name="chevron.right" size={14} tintColor={colors.textTertiary} style={{ width: 14, height: 14 }} />
       ) : null}
     </>
   )
```
