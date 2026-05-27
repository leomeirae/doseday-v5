# Plano de Implementação — Padrão Apple Health no Dashboard (Prompt 42b)

## Premissas e Suposições (Karpathy Guidelines)
1. **Padrão Apple Health**: Cada card do dashboard deve ser inteiramente clicável (corpo do card), apontando para a tela de detalhes correspondente via chevron (`PanelChevron`). Os botões `+` (adicionar) no topo dos headers dos cards serão totalmente removidos para simplificar a carga cognitiva.
2. **Estilo Nativo (StyleSheet)**: Nenhuma alteração visual deve migrar para NativeWind neste prompt. Devemos manter estritamente o uso de `StyleSheet` e os tokens de design do repositório (`lib/theme/tokens.ts`).
3. **CTA nas Telas Detalhadas**: A inserção de custos e notas passa a ser feita exclusivamente dentro de suas respectivas telas detalhadas (`/diario/custos` e `/diario/notas`). O botão de adicionar custo deve ser um botão fixo no rodapé (já existente, apenas padronizaremos o texto e visibilidade) e o mesmo para notas.
4. **Sheet Anotar Custo**: Corrigir a tela de `/diario/anotar-custo` adicionando o botão "Salvar" no header alinhado à direita para corresponder ao padrão do prompt e do design de forms.

---

## Tabela: Plano + Riscos + Arquivos + Validação

| Etapa / Plano | Riscos Identificados | Arquivos Afetados | Critérios de Validação |
| :--- | :--- | :--- | :--- |
| **1. Simplificar `HomeV7Content.tsx`**<br>- Remover props `onPressAdd` e `addLabel` de `SectionHeaderRow`. <br>- Remover botões `+` de todos os headers de seção.<br>- Garantir que todos os cards de dados são `Pressable` apontando para `onPressBody`. | - Quebrar tipagem ou compilação por props removidas.<br>- Omitir navegação em algum card (ex: sintomas). | - `components/home/HomeV7Content.tsx` | - `npm run type-check` sem erros.<br>- Verificação visual de que não há mais botões `+` nos headers do dashboard. |
| **2. Botão "Registrar custo" em `custos.tsx`**<br>- Padronizar botão no rodapé fixo para "Registrar custo" (em vez de "Adicionar custo").<br>- Garantir visibilidade permanente (inclusive com lista vazia). | - Botão ficar oculto em telas menores se mal posicionado. | - `app/diario/custos.tsx` | - Validação visual no simulador com lista de custos vazia e populada. |
| **3. Botão "Registrar nota" em `notas.tsx`**<br>- Padronizar botão no rodapé fixo para "Registrar nota" (em vez de "Nova nota").<br>- Garantir visibilidade permanente. | - Discrepância de nomenclatura com a tela de custos. | - `app/diario/notas.tsx` | - FlatList / ScrollView rolando corretamente e botão sempre visível no rodapé. |
| **4. Botão "Salvar" no header de `anotar-custo.tsx`**<br>- Substituir `headerSpacer` por um `Pressable` "Salvar" no canto superior direito.<br>- Vincular ao `handleSubmit` com validação de Zod e estado de `isPending`. | - Botão de salvar no header disparar submit incompleto/inválido. | - `app/diario/anotar-custo.tsx` | - Preencher formulário e validar que o botão no header fica habilitado e envia com sucesso para o banco. |
| **5. Validação Geral e Limpeza**<br>- Executar verificações estáticas e de build.<br>- Capturar screenshots dos fluxos.<br>- Limpar o staging de arquivos temporários antes de criar o PR. | - Submeter arquivos gerados por ferramentas de automação (ex: `.codegraph`). | - Todos os acima<br>- Diretório de staging | - Executar `git status --short` e validar que não há arquivos espúrios. |

---

## Confirmação de Posicionamento do Botão em `app/diario/custos.tsx`

Seguindo a análise dos arquivos, confirmamos que a tela `/diario/custos` (assim como `/diario/notas`) **já possui um rodapé fixo** (`styles.footer` posicionado fora do `ScrollView` dentro da `SafeAreaView`). Esse padrão de rodapé é o melhor para telas de listagem, pois:
1. Garante que o botão de registrar está **100% visível a todo momento** (inclusive no zero-state ou enquanto os dados carregam).
2. Evita os problemas comuns de FAB (Floating Action Button) de sobrepor o último item da lista ou necessitar de paddings extras complexos no ScrollView.
3. Mantém a consistência de design já estabelecida em `app/diario/notas.tsx` e nas próprias telas de inserção.

Portanto, **seguiremos o padrão de rodapé fixo**, alterando apenas os textos para os termos exatos do prompt:
- **Custos**: De `"Adicionar custo"` para `"Registrar custo"`.
- **Notas**: De `"Nova nota"` para `"Registrar nota"`.

---

## Diff Planejado de `components/home/HomeV7Content.tsx`

Abaixo está o diff planejado linha por linha, mostrando exatamente as remoções e simplificações que faremos no dashboard:

```diff
<<<<
function SectionHeaderRow({
  label,
  onPressAdd,
  addLabel,
  trailing,
}: {
  label: string
  onPressAdd: () => void
  addLabel: string
  trailing?: React.ReactNode
}) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.eyebrow}>{label}</Text>
      <View style={styles.sectionHeaderTrailing}>
        {trailing}
        <Pressable
          onPress={onPressAdd}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={addLabel}
          accessibilityHint="Abre o registro em um sheet."
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        >
          <SymbolView name="plus" size={14} tintColor={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  )
}
====
function SectionHeaderRow({
  label,
  trailing,
}: {
  label: string
  trailing?: React.ReactNode
}) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.eyebrow}>{label}</Text>
      {trailing && <View style={styles.sectionHeaderTrailing}>{trailing}</View>}
    </View>
  )
}
>>>>

<<<<
        <NextDoseSection
          nextDose={doseSummary?.nextDose ?? null}
          hasDoseHistory={(doseSummary?.history.length ?? 0) > 0}
          onPressBody={() => router.push('/perfil/protocolo')}
          onPressAdd={() => router.push('/dose/registrar')}
          isLoading={doseQuery.isLoading}
          error={doseQuery.error ? mapQueryError(doseQuery.error) : null}
          onRetry={() => void doseQuery.refetch()}
        />
====
        <NextDoseSection
          nextDose={doseSummary?.nextDose ?? null}
          hasDoseHistory={(doseSummary?.history.length ?? 0) > 0}
          onPressBody={() => router.push('/perfil/protocolo')}
          isLoading={doseQuery.isLoading}
          error={doseQuery.error ? mapQueryError(doseQuery.error) : null}
          onRetry={() => void doseQuery.refetch()}
        />
>>>>

<<<<
        <WeightSection
          currentWeight={currentWeight}
          delta={weightDelta}
          logs={weightLogs}
          isLoading={weightIsLoading}
          error={weightError ? mapQueryError(weightError) : null}
          onRetry={() => {
            void weightQuery.refetch()
            if (needsProfileForWeight) void profileQuery.refetch()
          }}
          onPressBody={() => router.push('/peso/historico' as Href)}
          onPressAdd={() => router.push('/peso/registrar')}
        />
====
        <WeightSection
          currentWeight={currentWeight}
          delta={weightDelta}
          logs={weightLogs}
          isLoading={weightIsLoading}
          error={weightError ? mapQueryError(weightError) : null}
          onRetry={() => {
            void weightQuery.refetch()
            if (needsProfileForWeight) void profileQuery.refetch()
          }}
          onPressBody={() => router.push('/peso/historico' as Href)}
        />
>>>>

<<<<
  const recentMemorySection = (
    <RecentMemoryTimeline
      items={timeline}
      isLoading={timelineIsLoading}
      error={timelineError ? mapQueryError(timelineError) : null}
      onRetry={() => {
        void doseQuery.refetch()
        void diarioQuery.refetch()
        void weightQuery.refetch()
      }}
      onPressAdd={() => router.push('/diario/anotar-memoria' as Href)}
      onPressBody={() => router.push('/memoria' as Href)}
    />
  )
  const observationSection = (
    <ObservationMemoryCard
      symptom={symptomQuery.data ?? null}
      isLoading={symptomQuery.isLoading}
      error={symptomQuery.error ? mapQueryError(symptomQuery.error) : null}
      onRetry={() => void symptomQuery.refetch()}
      onPressAdd={() => router.push('/diario/anotar-sintoma' as Href)}
    />
  )
====
  const recentMemorySection = (
    <RecentMemoryTimeline
      items={timeline}
      isLoading={timelineIsLoading}
      error={timelineError ? mapQueryError(timelineError) : null}
      onRetry={() => {
        void doseQuery.refetch()
        void diarioQuery.refetch()
        void weightQuery.refetch()
      }}
      onPressBody={() => router.push('/memoria' as Href)}
    />
  )
  const observationSection = (
    <ObservationMemoryCard
      symptom={symptomQuery.data ?? null}
      isLoading={symptomQuery.isLoading}
      error={symptomQuery.error ? mapQueryError(symptomQuery.error) : null}
      onRetry={() => void symptomQuery.refetch()}
      onPressBody={() => router.push('/memoria' as Href)}
    />
  )
>>>>>

<<<<
        <ExpensesSection
          total={purchaseSummary?.total ?? 0}
          isLoading={purchaseQuery.isLoading}
          error={purchaseQuery.error ? mapQueryError(purchaseQuery.error) : null}
          onRetry={() => void purchaseQuery.refetch()}
          onPressAdd={() => router.push('/diario/anotar-custo' as Href)}
          onPressBody={() => router.push('/diario/custos' as Href)}
        />
====
        <ExpensesSection
          total={purchaseSummary?.total ?? 0}
          isLoading={purchaseQuery.isLoading}
          error={purchaseQuery.error ? mapQueryError(purchaseQuery.error) : null}
          onRetry={() => void purchaseQuery.refetch()}
          onPressBody={() => router.push('/diario/custos' as Href)}
        />
>>>>

<<<<
function NextDoseSection({
  nextDose,
  hasDoseHistory,
  onPressBody,
  onPressAdd,
  isLoading,
  error,
  onRetry,
}: {
  nextDose: NextDoseData | null
  hasDoseHistory: boolean
  onPressBody: () => void
  onPressAdd: () => void
  isLoading: boolean
  error: string | null
  onRetry: () => void
}) {
  const value = nextDose ? formatNextDoseValue(nextDose) : 'A definir'
  const helper = nextDose
    ? format(nextDose.scheduledDate, "EEEE, d 'de' MMMM", { locale: ptBR })
    : hasDoseHistory
      ? 'Defina seu intervalo para calcular a próxima dose.'
      : 'Anote sua primeira dose para iniciar a memória do tratamento.'
  const medicationDetail = nextDose
    ? `${nextDose.medicationName}${nextDose.dose !== null ? ` · ${formatNumber(nextDose.dose)}mg` : ''}`
    : null

  return (
    <View style={styles.nextDoseBlock}>
      <SectionHeaderRow
        label="Próxima dose"
        onPressAdd={onPressAdd}
        addLabel="Anotar dose"
      />
====
function NextDoseSection({
  nextDose,
  hasDoseHistory,
  onPressBody,
  isLoading,
  error,
  onRetry,
}: {
  nextDose: NextDoseData | null
  hasDoseHistory: boolean
  onPressBody: () => void
  isLoading: boolean
  error: string | null
  onRetry: () => void
}) {
  const value = nextDose ? formatNextDoseValue(nextDose) : 'A definir'
  const helper = nextDose
    ? format(nextDose.scheduledDate, "EEEE, d 'de' MMMM", { locale: ptBR })
    : hasDoseHistory
      ? 'Defina seu intervalo para calcular a próxima dose.'
      : 'Anote sua primeira dose para iniciar a memória do tratamento.'
  const medicationDetail = nextDose
    ? `${nextDose.medicationName}${nextDose.dose !== null ? ` · ${formatNumber(nextDose.dose)}mg` : ''}`
    : null

  return (
    <View style={styles.nextDoseBlock}>
      <SectionHeaderRow label="Próxima dose" />
>>>>

<<<<
function WeightSection({
  currentWeight,
  delta,
  logs,
  isLoading,
  error,
  onRetry,
  onPressBody,
  onPressAdd,
}: {
  currentWeight: number | null
  delta: number | null
  logs: WeightLog[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressBody: () => void
  onPressAdd: () => void
}) {
  const trailing =
    delta !== null && !isLoading && !error ? (
      <Text style={styles.weightDelta}>{formatDelta(delta)}</Text>
    ) : null

  return (
    <View>
      <SectionHeaderRow
        label="Peso"
        onPressAdd={onPressAdd}
        addLabel="Anotar peso"
        trailing={trailing}
      />
====
function WeightSection({
  currentWeight,
  delta,
  logs,
  isLoading,
  error,
  onRetry,
  onPressBody,
}: {
  currentWeight: number | null
  delta: number | null
  logs: WeightLog[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressBody: () => void
}) {
  const trailing =
    delta !== null && !isLoading && !error ? (
      <Text style={styles.weightDelta}>{formatDelta(delta)}</Text>
    ) : null

  return (
    <View>
      <SectionHeaderRow label="Peso" trailing={trailing} />
>>>>

<<<<
      ) : (
        <Text style={styles.emptyText}>Nenhum peso registrado ainda.</Text>
      )}
====
      ) : (
        <Pressable
          onPress={onPressBody}
          accessibilityRole="button"
          accessibilityLabel="Ver histórico de peso"
          accessibilityHint="Abre o histórico completo de peso."
          style={({ pressed }) => [styles.sectionBodyRow, pressed && styles.sectionBodyPressed]}
        >
          <View style={styles.sectionBodyContent}>
            <Text style={styles.emptyText}>Nenhum peso registrado ainda.</Text>
          </View>
          <PanelChevron />
        </Pressable>
      )}
>>>>

<<<<
function RecentMemoryTimeline({
  items,
  isLoading,
  error,
  onRetry,
  onPressAdd,
  onPressBody,
}: {
  items: TimelineItem[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressAdd: () => void
  onPressBody: () => void
}) {
  const isEmpty = !isLoading && !error && items.length === 0

  return (
    <>
      <Divider />
      <View>
        <SectionHeaderRow
          label="Memória recente"
          onPressAdd={onPressAdd}
          addLabel="Anotar nota"
        />
====
function RecentMemoryTimeline({
  items,
  isLoading,
  error,
  onRetry,
  onPressBody,
}: {
  items: TimelineItem[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressBody: () => void
}) {
  const isEmpty = !isLoading && !error && items.length === 0

  return (
    <>
      <Divider />
      <View>
        <SectionHeaderRow label="Memória recente" />
>>>>

<<<<
function ObservationMemoryCard({
  symptom,
  isLoading,
  error,
  onRetry,
  onPressAdd,
}: {
  symptom: RecentSymptom | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressAdd: () => void
}) {
  return (
    <>
      <Divider />
      <View style={styles.observation}>
        <SectionHeaderRow
          label="Sintomas"
          onPressAdd={onPressAdd}
          addLabel="Anotar sintoma"
        />
        {isLoading || error ? (
          <SectionReadState
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            loadingLabel="Carregando sintomas."
          />
        ) : symptom ? (
          <View style={styles.observationCard}>
            <SymbolView name="circle" size={16} tintColor={colors.semanticMuted} />
            <Text style={styles.observationText}>{formatSymptomMemory(symptom)}</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>Nenhum sintoma registrado ainda.</Text>
        )}
      </View>
    </>
  )
}
====
function ObservationMemoryCard({
  symptom,
  isLoading,
  error,
  onRetry,
  onPressBody,
}: {
  symptom: RecentSymptom | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressBody: () => void
}) {
  return (
    <>
      <Divider />
      <View style={styles.observation}>
        <SectionHeaderRow label="Sintomas" />
        {isLoading || error ? (
          <SectionReadState
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            loadingLabel="Carregando sintomas."
          />
        ) : (
          <Pressable
            onPress={onPressBody}
            accessibilityRole="button"
            accessibilityLabel="Ver diário de sintomas"
            accessibilityHint="Abre o diário para ver sintomas."
            style={({ pressed }) => [styles.sectionBodyRow, pressed && styles.sectionBodyPressed]}
          >
            <View style={styles.sectionBodyContent}>
              {symptom ? (
                <View style={styles.observationCard}>
                  <SymbolView name="circle" size={16} tintColor={colors.semanticMuted} />
                  <Text style={styles.observationText}>{formatSymptomMemory(symptom)}</Text>
                </View>
              ) : (
                <Text style={styles.emptyText}>Nenhum sintoma registrado ainda.</Text>
              )}
            </View>
            <PanelChevron />
          </Pressable>
        )}
      </View>
    </>
  )
}
>>>>

<<<<
function ExpensesSection({
  total,
  isLoading,
  error,
  onRetry,
  onPressAdd,
  onPressBody,
}: {
  total: number
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressAdd: () => void
  onPressBody: () => void
}) {
  return (
    <View style={styles.expenses}>
      <SectionHeaderRow
        label="Custos registrados"
        onPressAdd={onPressAdd}
        addLabel="Anotar custo"
      />
====
function ExpensesSection({
  total,
  isLoading,
  error,
  onRetry,
  onPressBody,
}: {
  total: number
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressBody: () => void
}) {
  return (
    <View style={styles.expenses}>
      <SectionHeaderRow label="Custos registrados" />
>>>>
```
