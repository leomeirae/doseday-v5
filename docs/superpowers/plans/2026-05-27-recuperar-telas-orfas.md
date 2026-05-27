# Plano de Implementação — Prompt 42a: Recuperar Telas Órfãs e Entrypoints

Recuperar do `git stash` (`stash@{0}`) as 3 telas funcionais (`app/memoria/index.tsx`, `app/diario/custos.tsx`, `app/diario/notas.tsx`), hooks correspondentes e consultas ao Supabase. Configurar entrypoints no Dashboard (`HomeV7Content.tsx`) sem aplicar redesenho para NativeWind (mantendo StyleSheet atual).

---

## 🛠️ Tabela de Planejamento Geral

| Item | Descrição / Ação |
| :--- | :--- |
| **Branch de Trabalho** | `feature/42a-recuperar-telas-orfas` (confirmada e ativa) |
| **PR Alvo** | `main` |
| **Estratégia de Extração** | Extrair cirurgicamente os arquivos rastreados de `stash@{0}` e arquivos novos (untracked) de `stash@{0}^3`. |
| **Visual / Estilo** | **Preservar StyleSheet.** Não migrar para NativeWind ou alterar layouts originais do stash neste PR. |
| **Garantia de Não-Regressão** | Preservar `app/configuracoes/` (Settings Hub) e as configurações de base do NativeWind intactas. |

---

## 📂 Arquivos Envolvidos

### Criar (Extraídos de `stash@{0}^3` - Untracked)
- `app/diario/custos.tsx`
- `app/diario/notas.tsx`
- `app/memoria/index.tsx`
- `hooks/useMemoryNotes.ts`
- `hooks/usePurchases.ts`
- `hooks/useSymptoms.ts`

### Modificar (Mesclados cirurgicamente de `stash@{0}`)
- `lib/supabase/queries/diario.ts` — Adicionar `getMemoryNotes` e tipo `MemoryNoteRecord`.
- `lib/supabase/queries/purchases.ts` — Adicionar `recentPurchase` ao summary, `getPurchases` e helpers.
- `lib/supabase/queries/symptoms.ts` — Adicionar `getSymptoms` e tipo `SymptomRecord`.

### Modificar (Manualmente)
- `components/home/HomeV7Content.tsx` — Adicionar entrypoints e chevrons para as novas telas.

---

## ⚙️ Detalhamento das Alterações em HomeV7Content.tsx

### 1. Padrão "Body + Add" (Consistência de UX)
Adotaremos o padrão consistente em todas as seções onde o clique no **corpo do card** navega para a tela de visualização/histórico (leitura) e o clique no **botão `+` (SectionHeaderRow)** navega para o fluxo de inserção rápida (escrita).

- **Próxima Dose:**
  - `onPressBody`: Aponta para `/(tabs)/doses` (Histórico de doses)
  - `onPressAdd`: Aponta para `/dose/registrar` (Registrar dose)
- **Peso:**
  - `onPressBody`: Aponta para `/peso/historico` (Histórico de peso)
  - `onPressAdd`: Aponta para `/peso/registrar` (Anotar peso)
- **Memória Recente (Notas):**
  - `onPressBody`: Aponta para `/memoria` (Histórico unificado)
  - `onPressAdd`: Aponta para `/diario/anotar-memoria` (Registrar nota livre)
- **Custos Registrados:**
  - `onPressBody`: Aponta para `/diario/custos` (Lista de gastos)
  - `onPressAdd`: Aponta para `/diario/anotar-custo` (Registrar gasto)

### 2. Affordance Visual (Chevron)
Cada card com navegação de corpo `onPressBody` receberá um chevron visual (`SymbolView name="chevron.right"`) à direita ou como `trailing` no header para tornar explícito que a seção inteira é clicável.

### 3. Engrenagem no Header
Restauraremos o botão de engrenagem no `HeaderMemory` para permitir acesso ao Settings Hub (`/configuracoes`), adicionando um Pressable com `SymbolView name="gearshape"` posicionado à direita do título principal.

---

## ⚡ Riscos & Mitigações

| Risco Identificado | Gravidade | Mitigação Proposta |
| :--- | :--- | :--- |
| **Sobrescrever queries em main** com deltas defasados do stash | Alta | **Mescla manual:** Não usar `git checkout` para as queries. Copiaremos apenas as novas funções (`getMemoryNotes`, `getPurchases`, `getSymptoms`) e tipos para os arquivos da main. |
| **Conflito de estilos e quebra de layout** no Dashboard | Média | **Mudança cirúrgica:** Adicionar os chevrons de navegação como `trailing` nos headers de seção sem alterar o visual dos cards ou aplicar classes NativeWind do stash. |
| **Erros de tipagem ou imports** após extração | Média | Rodar `npm run type-check` imediatamente após a extração e corrigir qualquer import órfão. |

---

## 🧪 Plano de Validação

### Testes Automatizados
- Executar `npm run type-check` (deve passar sem erros).
- Executar `npm run lint` (apenas o warning em `lib/i18n/index.ts` é aceitável).

### Validação Manual
- Iniciar o Expo localmente (`npx expo start --clear`).
- **Affordance dos Chevrons & Botões `+`:** Verificar se todos os 4 fluxos "Card -> Leitura" e "Botão + -> Registro" estão mapeados e funcionando.
- **Engrenagem do Header:** Tocar na engrenagem no Dashboard e validar que abre as Configurações.
- **Card de Custos:** Garantir que o card "Custos registrados" está visível no dashboard mesmo se o total for 0.
- **Limpeza do Staging:** Rodar `git status --short` antes de comitar para confirmar que não constam arquivos de tooling, mockups antigos ou temporários (como `graphify-out/*`, `.codegraph/*` ou `assets/screenshots/prompt42/`). Fazer `git restore --staged <path>` caso existam.
- **Screenshots:** Capturar 4 imagens (Dashboard, Memória, Custos, Notas) e salvar em `assets/screenshots/prompt42a/`.
