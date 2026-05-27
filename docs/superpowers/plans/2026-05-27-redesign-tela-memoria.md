# Plano de Implementação — Redesign da Tela de Memória (Prompt 42c)

## Premissas e Suposições (Karpathy Guidelines)
1. **useProfile Fields**: O hook `useProfile` expõe os campos `currentMedication`, `currentDose` e `doseFrequencyDays` através do tipo `Profile`. Eles correspondem às informações do protocolo do usuário.
2. **Registro Inline de Sintoma**: Traremos a lógica de input + chips de sintomas frequentes de `anotar-sintoma.tsx` para dentro da tela de memória, usando `useRegisterSymptom` e `useFrequentSymptoms`. Não fecharemos a tela após salvar (apenas limparemos o input e atualizaremos a timeline).
3. **Timeline Preservada**: A função `buildEvents` e a listagem de eventos no histórico permanecem idênticas, garantindo o menor impacto no código existente.
4. **StyleSheet**: O layout da tela continua usando `StyleSheet` e `lib/theme/tokens.ts`, sem migrar para NativeWind.

---

## Tabela: Plano + Riscos + Arquivos + Validação

| Etapa / Plano | Riscos Identificados | Arquivos Afetados | Critérios de Validação |
| :--- | :--- | :--- | :--- |
| **1. Validação de Imports e Hooks**<br>- Adicionar imports de `useState`, `useRef`, `useProfile`, `useRegisterSymptom`, `useFrequentSymptoms`. | - Conflitos de importação ou falta de dependências. | - `app/memoria/index.tsx` | - `npm run type-check` sem erros de importação. |
| **2. Layout das 6 Seções em `app/memoria/index.tsx`**<br>- Header (Voltar + Título)<br>- Subtitle (Copy ativa)<br>- Protocolo (Card c/ info e link de editar)<br>- Registro Sintoma Inline (Textarea + Chips + Salvar)<br>- Ações Rápidas (Grid "Anotar nota" e "Anotar custo")<br>- Histórico (Timeline unificada existente) | - Desalinhamento visual nos cards.<br>- Estilos StyleSheet órfãos ou duplicados. | - `app/memoria/index.tsx` | - Verificação visual de cada seção no simulador iOS.<br>- Comportamento dos inputs de texto. |
| **3. Integração de Registro Inline**<br>- Implementar `symptomText` state, ref de TextInput.<br>- Adicionar função `insertChip` e lidar com chips padrão se lista de frequentes vazia.<br>- Chamar mutation no botão "Salvar sintoma". | - Mutação falhar silenciosamente ou não atualizar timeline.<br>- Chips padrão inserirem formato incorreto no input. | - `app/memoria/index.tsx` | - Adicionar sintoma, ver o toast de sucesso e validar o surgimento automático do evento no histórico. |
| **4. Validação Geral e Limpeza**<br>- Executar verificações estáticas e de build.<br>- Capturar screenshots dos fluxos.<br>- Limpar o staging de arquivos temporários antes de criar o PR. | - Submeter arquivos temporários ou de build (`graphify-out/*`). | - `app/memoria/index.tsx`<br>- Diretório de staging | - Executar `git status --short` e validar que não há arquivos espúrios. |

---

## Unified Diff Planejado para `app/memoria/index.tsx`

```diff
@@ -1,13 +1,18 @@
-import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
+import { useState, useRef } from 'react'
+import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
 import { SafeAreaView } from 'react-native-safe-area-context'
 import { useRouter, type Href } from 'expo-router'
 import { SymbolView } from 'expo-symbols'
 import { AuthButton } from '@components/ui/AuthButton'
 import { useDiarioSummary } from '@hooks/useDiarioSummary'
 import { useDoseSummary } from '@hooks/useDoseSummary'
 import { usePurchases } from '@hooks/usePurchases'
 import { useSymptoms } from '@hooks/useSymptoms'
 import { useWeightLogs } from '@hooks/useWeightLogs'
+import { useProfile } from '@hooks/useProfile'
+import { useRegisterSymptom } from '@hooks/useRegisterSymptom'
+import { useFrequentSymptoms } from '@hooks/useFrequentSymptoms'
 import { mapQueryError } from '@lib/supabase/queries/errors'
 import { colors, radius, spacing, typography } from '@lib/theme/tokens'
-import { QUICK_LOG_LABELS } from '@lib/validation/diarioSchemas'
+import { QUICK_LOG_LABELS, symptomNoteSchema } from '@lib/validation/diarioSchemas'
+import { showErrorToast, showSuccessToast } from '@lib/utils/showToast'
@@ -39,2 +44,14 @@
 
+const SYMPTOM_LABELS: Record<string, string> = {
+  constipation: 'Constipação',
+  diarrhea: 'Diarreia',
+  fatigue: 'Cansaço',
+  headache: 'Dor de cabeça',
+  heartburn: 'Azia',
+  injection_pain: 'Dor na injeção',
+  nausea: 'Náusea',
+  vomiting: 'Vômito',
+}
+
+const DEFAULT_SYMPTOMS = ['nausea', 'constipation', 'diarrhea', 'fatigue']
+
 export default function TreatmentMemoryScreen() {
@@ -51,2 +68,7 @@
   const symptomQuery = useSymptoms()
   const purchasesQuery = usePurchases()
+  const profileQuery = useProfile()
+  const { mutate: registerSymptom, isPending: isRegisteringSymptom } = useRegisterSymptom()
+  const frequentSymptoms = useFrequentSymptoms()
+
+  const [symptomText, setSymptomText] = useState('')
+  const inputRef = useRef<TextInput | null>(null)
@@ -64,4 +86,11 @@
 
+  const profile = profileQuery.data
+  const hasProtocol =
+    profile?.currentMedication != null &&
+    profile?.currentDose != null &&
+    profile?.doseFrequencyDays != null
+
   const isLoading =
     doseQuery.isLoading ||
     weightQuery.isLoading ||
     diarioQuery.isLoading ||
     symptomQuery.isLoading ||
-    purchasesQuery.isLoading
+    purchasesQuery.isLoading ||
+    profileQuery.isLoading
   const error =
@@ -83,2 +112,27 @@
   })
 
+  const trimmedSymptom = symptomText.trim()
+  const canSubmitSymptom = trimmedSymptom.length > 0 && !isRegisteringSymptom
+  const frequent = frequentSymptoms.data ?? []
+  const chipsToRender = frequent.length > 0 ? frequent.map((f) => f.type) : DEFAULT_SYMPTOMS
+
+  function insertChip(type: string) {
+    const label = SYMPTOM_LABELS[type] ?? type
+    const needsSpace = symptomText.length > 0 && !symptomText.endsWith(' ') && !symptomText.endsWith('\n')
+    const next = `${symptomText}${needsSpace ? ' ' : ''}${label.toLowerCase()} `
+    setSymptomText(next)
+    inputRef.current?.focus()
+  }
+
+  function handleSaveSymptom() {
+    const parsed = symptomNoteSchema.safeParse({ rawText: trimmedSymptom })
+    if (!parsed.success) return
+
+    registerSymptom(parsed.data, {
+      onSuccess: () => {
+        setSymptomText('')
+        showSuccessToast('Sintoma anotado')
+        void symptomQuery.refetch()
+        void diarioQuery.refetch()
+      },
+      onError: (err) => {
+        showErrorToast(mapQueryError(err))
+      },
+    })
+  }
+
   return (
@@ -106,17 +160,86 @@
       >
         <Text style={styles.subtitle}>
-          Últimos registros de dose, peso, sintomas, notas e custos.
+          Registre o que aconteceu hoje e veja seu histórico abaixo.
         </Text>
 
-        <View style={styles.actions}>
-          <AuthButton
-            label="Notas do tratamento"
-            variant="secondary"
-            onPress={() => router.push('/diario/notas' as Href)}
-          />
-          <AuthButton
-            label="Registrar sintoma"
-            variant="secondary"
-            onPress={() => router.push('/diario/anotar-sintoma' as Href)}
-          />
-        </View>
+        {/* Seção 1: Protocolo Atual */}
+        <Text style={styles.sectionEyebrow}>Protocolo</Text>
+        {profileQuery.isLoading ? (
+          <View style={styles.protocolLoading}>
+            <ActivityIndicator size="small" color={colors.textSecondary} />
+          </View>
+        ) : hasProtocol && profile ? (
+          <View style={styles.protocolCard}>
+            <View style={styles.protocolInfo}>
+              <Text style={styles.protocolMedication}>
+                {profile.currentMedication} · {formatNumber(profile.currentDose)} mg
+              </Text>
+              <Text style={styles.protocolInterval}>
+                A cada {profile.doseFrequencyDays} {profile.doseFrequencyDays === 1 ? 'dia' : 'dias'}
+              </Text>
+            </View>
+            <Pressable
+              onPress={() => router.push('/perfil/protocolo' as Href)}
+              style={({ pressed }) => [styles.protocolLink, pressed && styles.pressed]}
+            >
+              <Text style={styles.protocolLinkText}>Editar protocolo</Text>
+            </Pressable>
+          </View>
+        ) : (
+          <View style={styles.protocolCard}>
+            <Text style={styles.protocolEmptyText}>
+              Configure seu protocolo para receber lembretes.
+            </Text>
+            <Pressable
+              onPress={() => router.push('/perfil/protocolo' as Href)}
+              style={({ pressed }) => [styles.protocolLink, pressed && styles.pressed]}
+            >
+              <Text style={styles.protocolLinkText}>Configurar</Text>
+            </Pressable>
+          </View>
+        )}
+
+        {/* Seção 2: Registrar Sintoma Inline */}
+        <Text style={styles.sectionEyebrow}>Registrar Sintoma</Text>
+        <View style={styles.symptomContainer}>
+          <TextInput
+            ref={inputRef}
+            value={symptomText}
+            onChangeText={setSymptomText}
+            multiline
+            numberOfLines={4}
+            maxLength={500}
+            placeholder="ex: náusea leve depois do almoço · azia ao deitar"
+            placeholderTextColor={colors.textTertiary}
+            selectionColor={colors.brand}
+            autoCapitalize="sentences"
+            autoCorrect
+            textAlignVertical="top"
+            style={styles.symptomInput}
+          />
+          <View style={styles.chipRow}>
+            {chipsToRender.map((type) => (
+              <Pressable
+                key={type}
+                onPress={() => insertChip(type)}
+                style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
+              >
+                <Text style={styles.chipLabel}>{SYMPTOM_LABELS[type] ?? type}</Text>
+              </Pressable>
+            ))}
+          </View>
+          <AuthButton
+            label="Salvar sintoma"
+            onPress={handleSaveSymptom}
+            loading={isRegisteringSymptom}
+            disabled={!canSubmitSymptom}
+          />
+        </View>
+
+        {/* Seção 3: Ações Rápidas */}
+        <Text style={styles.sectionEyebrow}>Outros Registros</Text>
+        <View style={styles.quickActionsRow}>
+          <Pressable
+            onPress={() => router.push('/diario/anotar-memoria' as Href)}
+            style={({ pressed }) => [styles.quickActionBtn, pressed && styles.pressed]}
+          >
+            <SymbolView name="note.text" size={18} tintColor={colors.brand} />
+            <Text style={styles.quickActionText}>Anotar nota</Text>
+          </Pressable>
+          <Pressable
+            onPress={() => router.push('/diario/anotar-custo' as Href)}
+            style={({ pressed }) => [styles.quickActionBtn, pressed && styles.pressed]}
+          >
+            <SymbolView name="dollarsign.circle" size={18} tintColor={colors.brand} />
+            <Text style={styles.quickActionText}>Anotar custo</Text>
+          </Pressable>
+        </View>
+
+        {/* Seção 4: Histórico */}
+        <Text style={styles.sectionEyebrow}>Histórico</Text>
```
