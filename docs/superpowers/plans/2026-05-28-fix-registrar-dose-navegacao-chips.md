# Plano de Implementação — Fix Registrar Dose e Navegação (Prompt 42f)

## Premissas e Suposições (Karpathy Guidelines)
1. **Contraste dos Chips**: Aumentar a luminância de fundo do `Chip` usando `colors.bgSurface` e intensificando o `borderColor` para `rgba(255,255,255,0.18)` resolve a falta de affordance. Adicionar fundo `rgba(0,212,170,0.15)` no estado selecionado torna a seleção nítida.
2. **Navegação Segura**: Adicionar fallback para a rota `/(tabs)/index` em todas as saídas de `registrar.tsx` e no botão de voltar de `doses.tsx` previne o erro "GO_BACK was not handled by any navigator".
3. **Botão de Voltar em Doses**: Adicionar o `chevron.left` alinhado à esquerda na `headlineRow` resolve o problema de o usuário ficar preso na tela de Doses. O layout flex `row` com `justifyContent: 'space-between'` distribui os 3 elementos simetricamente.

---

## Tabela: Plano + Riscos + Arquivos + Validação

| Etapa / Plano | Riscos Identificados | Arquivos Afetados | Critérios de Validação |
| :--- | :--- | :--- | :--- |
| **1. Contraste dos Chips**<br>- Atualizar estilos `chip` e `chipSelected` em `registrar.tsx`. | - Problemas de alinhamento visual ou quebra nos estilos do chip. | - `app/dose/registrar.tsx` | - Passar no type-check e validar visualmente. |
| **2. Função Dismiss com Fallback**<br>- Importar `type Href`.<br>- Criar função helper `dismiss` e substituir as 3 chamadas a `router.back()`. | - Erro de digitação no path de fallback.<br>- Erro de tipagem do TypeScript. | - `app/dose/registrar.tsx` | - Clicar no botão X, no modal e enviar com sucesso sem erro GO_BACK. |
| **3. Voltar na Tela de Doses**<br>- Importar `type Href`.<br>- Adicionar `chevron.left` na `headlineRow` (loading e normal). | - Desalinhamento do título "Doses" centralizado. | - `app/(tabs)/doses.tsx` | - Pressionar o chevron e voltar com sucesso para o Dashboard. |
| **4. Validação Geral e Clean**<br>- Rodar type-check e lint.<br>- Capturar as 4 screenshots requisitadas em `assets/screenshots/prompt42f/`. | - Acumular artefatos temporários no git status. | - Ambas as telas e diretório de screenshots | - `git status --short` limpo. |

---

## Unified Diff Planejado

### `app/dose/registrar.tsx`
```diff
@@ -10,6 +10,7 @@
   TouchableOpacity,
 } from 'react-native'
 import { SafeAreaView } from 'react-native-safe-area-context'
-import { useRouter } from 'expo-router'
+import { useRouter, type Href } from 'expo-router'
 import { SymbolView } from 'expo-symbols'
@@ -48,6 +49,14 @@
   const autoFilledRef = useRef(false)
 
+  function dismiss() {
+    if (router.canGoBack()) {
+      router.back()
+    } else {
+      router.replace('/(tabs)/index' as Href)
+    }
+  }
+
   useEffect(() => {
@@ -94,7 +103,7 @@
         }
 
-        router.back()
+        dismiss()
       },
       onError: (err) => {
@@ -108,7 +117,7 @@
         visible={showPermissionModal}
         onDismiss={() => {
           setShowPermissionModal(false)
-          router.back()
+          dismiss()
         }}
       />
       {/* Header */}
@@ -114,7 +123,7 @@
       <View style={styles.header}>
         <Pressable
-          onPress={() => router.back()}
+          onPress={dismiss}
           hitSlop={13}
           accessibilityLabel="Fechar"
@@ -356,7 +365,7 @@
     paddingVertical: spacing.xs,
     borderRadius: radius.full,
-    backgroundColor: colors.bgElevated,
+    backgroundColor: colors.bgSurface,
     borderWidth: 0.5,
-    borderColor: 'rgba(255,255,255,0.12)',
+    borderColor: 'rgba(255,255,255,0.18)',
   },
   chipSelected: {
+    backgroundColor: 'rgba(0,212,170,0.15)',
     borderColor: colors.brand,
     borderWidth: 1,
   },
```

### `app/(tabs)/doses.tsx`
```diff
@@ -1,5 +1,5 @@
-import { ScrollView, Text, View, ActivityIndicator, TouchableOpacity, Pressable, StyleSheet } from 'react-native'
+import { ScrollView, Text, View, ActivityIndicator, TouchableOpacity, Pressable, StyleSheet } from 'react-native'
 import { SafeAreaView } from 'react-native-safe-area-context'
-import { useRouter, useLocalSearchParams } from 'expo-router'
+import { useRouter, useLocalSearchParams, type Href } from 'expo-router'
 import { SymbolView } from 'expo-symbols'
@@ -35,7 +35,17 @@
         <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
           <View style={styles.headlineRow}>
-            <Text style={styles.headline}>Doses</Text>
+            <Pressable
+              onPress={() => {
+                if (router.canGoBack()) {
+                  router.back()
+                } else {
+                  router.replace('/(tabs)/index' as Href)
+                }
+              }}
+              hitSlop={8}
+              accessibilityRole="button"
+              accessibilityLabel="Voltar"
+            >
+              <SymbolView name="chevron.left" size={22} tintColor={colors.textPrimary} />
+            </Pressable>
+            <Text style={styles.headline}>Doses</Text>
             <Pressable
@@ -89,5 +99,15 @@
         <View style={styles.headlineRow}>
-          <Text style={styles.headline}>Doses</Text>
+          <Pressable
+            onPress={() => {
+              if (router.canGoBack()) {
+                router.back()
+              } else {
+                router.replace('/(tabs)/index' as Href)
+              }
+            }}
+            hitSlop={8}
+            accessibilityRole="button"
+            accessibilityLabel="Voltar"
+          >
+            <SymbolView name="chevron.left" size={22} tintColor={colors.textPrimary} />
+          </Pressable>
+          <Text style={styles.headline}>Doses</Text>
           <Pressable
```
