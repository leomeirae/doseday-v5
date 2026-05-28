# Plano de Implementação — Correções do ciclo 42 (Prompt 42e)

## Premissas e Suposições (Karpathy Guidelines)
1. **Navegação Cirúrgica**: A rota `/perfil/protocolo` continua existindo e sendo acessível por outras áreas do app. O card "Próxima dose" no Dashboard passa a abrir `/(tabs)/doses`.
2. **SF Symbols Válidos**: `cross.case` e `scalemass` estão em uso ativo em outras telas do aplicativo (`DoseAdherenceCard`, `WeightStatsCard`), garantindo compatibilidade total no runtime.
3. **Consistência Estética**: Mantemos StyleSheet para estilizar `app/memoria/index.tsx` de forma a garantir a paridade visual dos botões já existentes.
4. **Layout Grid 2x2**: Para evitar o risco de truncamento e overflow em telas estreitas (como iPhone SE com 320px de largura de viewport), dividimos os 4 botões de ações rápidas em duas rows simétricas de 2 colunas cada.

---

## Tabela: Plano + Riscos + Arquivos + Validação

| Etapa / Plano | Riscos Identificados | Arquivos Afetados | Critérios de Validação |
| :--- | :--- | :--- | :--- |
| **1. Correção de Rota na Home**<br>- Alterar o callback de clique da NextDoseSection na Home para a aba de Doses com cast de `as Href`. | - Redirecionamento quebrado se digitado incorretamente. | - `components/home/HomeV7Content.tsx` | - Passar com sucesso pelo type-check e lint. |
| **2. Layout Grid 2x2 na Memória**<br>- Atualizar quickActionsRow existente.<br>- Adicionar a segunda row com margem superior apropriada (`spacing.md`). | - Desalinhamento visual nos cards.<br>- Quebra de interface em viewports menores. | - `app/memoria/index.tsx` | - Validação visual no simulador iOS (iPhone SE e iPhone 13+). |
| **3. Inserção de Ações de Dose e Peso**<br>- Inserir os botões adicionais com links para `/dose/registrar` e `/peso/registrar`. | - Falha ao abrir modais/bottom sheets de registro. | - `app/memoria/index.tsx` | - Clicar nos botões e confirmar a exibição correta dos modais correspondentes. |
| **4. Ajuste da Copy da Tela**<br>- Substituir as strings verbais "Anotar nota" e "Anotar custo" por "Nota" e "Custo". | - Esquecer alguma tradução ou string remanescente. | - `app/memoria/index.tsx` | - Utilizar `grep` para provar a ausência da copy antiga. |

---

## Unified Diff Planejado

### `components/home/HomeV7Content.tsx`
```diff
@@ -115,7 +115,7 @@
         <NextDoseSection
           nextDose={doseSummary?.nextDose ?? null}
           hasDoseHistory={(doseSummary?.history.length ?? 0) > 0}
-          onPressBody={() => router.push('/perfil/protocolo')}
+          onPressBody={() => router.push('/(tabs)/doses' as Href)}
           isLoading={doseQuery.isLoading}
           error={doseQuery.error ? mapQueryError(doseQuery.error) : null}
           onRetry={() => void doseQuery.refetch()}
```

### `app/memoria/index.tsx`
```diff
@@ -257,17 +257,33 @@
         {/* 5. Seção Ações Rápidas */}
         <Text style={styles.sectionEyebrow}>Outros Registros</Text>
         <View style={styles.quickActionsRow}>
           <TouchableOpacity
             onPress={() => router.push('/diario/anotar-memoria' as Href)}
             style={styles.quickActionBtn}
           >
             <SymbolView name="note.text" size={18} tintColor={colors.brand} style={{ width: 18, height: 18 }} />
-            <Text style={styles.quickActionText}>Anotar nota</Text>
+            <Text style={styles.quickActionText}>Nota</Text>
           </TouchableOpacity>
           <TouchableOpacity
             onPress={() => router.push('/diario/anotar-custo' as Href)}
             style={styles.quickActionBtn}
           >
             <SymbolView name="dollarsign.circle" size={18} tintColor={colors.brand} style={{ width: 18, height: 18 }} />
-            <Text style={styles.quickActionText}>Anotar custo</Text>
+            <Text style={styles.quickActionText}>Custo</Text>
           </TouchableOpacity>
         </View>
+
+        <View style={[styles.quickActionsRow, { marginTop: spacing.md }]}>
+          <TouchableOpacity
+            onPress={() => router.push('/dose/registrar' as Href)}
+            style={styles.quickActionBtn}
+          >
+            <SymbolView name="cross.case" size={18} tintColor={colors.brand} style={{ width: 18, height: 18 }} />
+            <Text style={styles.quickActionText}>Dose</Text>
+          </TouchableOpacity>
+          <TouchableOpacity
+            onPress={() => router.push('/peso/registrar' as Href)}
+            style={styles.quickActionBtn}
+          >
+            <SymbolView name="scalemass" size={18} tintColor={colors.brand} style={{ width: 18, height: 18 }} />
+            <Text style={styles.quickActionText}>Peso</Text>
+          </TouchableOpacity>
+        </View>
```
