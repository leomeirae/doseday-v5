# DoseDay V5 — Prompt 36-MID-anotar-memoria-tela-dedicada

**Instância de destino:** Aba 1 (principal)
**Worktree:** `dose-day-v5/`
**Branch a criar:** `feature/36-anotar-memoria-tela-dedicada`
**Caveman:** N/A
**Modelo:** Sonnet/Opus (MID — decisão de arquitetura de UI + schema)

---

## Contexto obrigatório (leia ANTES de qualquer coisa, na ordem)

1. `CLAUDE.md` (raiz) — regras anti-pirraça 1–31
2. `@docs/karpathy.md` — escopo cirúrgico, zero suposição, success criteria verificáveis
3. `@docs/learnings.md` — aprendizados acumulados (regra obrigatória pré-MID/HIGH)
4. `@docs/HOME_DESIGN_DIRECTION.md` — especial atenção §7 (acoes rapidas), §10 (observacoes vs sintoma)
5. `@docs/PRODUCT_COHERENCE.md` — §6 (decisões), §11.3 (vocabulário público)
6. `@CONTEXT.md` — glossário: termos "memoria do tratamento", "anotar memoria", "observacao"
7. `@docs/DESIGN.md` — tokens, tipografia, elevação, padrões de formulário
8. `app/diario/quick-log.tsx` — tela atual a bifurcar (237 linhas)
9. `components/home/HomeV7Content.tsx` linha 63 — `onPressMemory` que precisa apontar pra rota nova
10. `lib/validation/diarioSchemas.ts` — `quickLogSchema`, `QUICK_LOG_TYPES`, `INTENSITY_LABELS`
11. `hooks/useRegisterQuickLog.ts` — mutation de quick log
12. Memórias auto-injetadas (regra 30) — se houver contexto da sessão anterior, ler primeiro
13. Rodar `npx claude-mem search "quick-log anotar memoria sintoma"` ANTES de planejar

---

## Objetivo desta tarefa

Bifurcar `app/diario/quick-log.tsx` em **duas telas conceitualmente distintas**, separando "Anotar memória" (nota livre, sem intensidade) de "Registrar sintoma" (tipo + intensidade Leve/Moderado/Forte).

**Problema atual:** o botão "Adicionar memória" da Home v7 navega pra `/diario/quick-log?type=other`, que renderiza uma tela polimórfica forçando campos sem sentido pra nota livre (campo "Tipo" readonly mostrando "Outro", chips Leve/Moderado/Forte, textarea Observações pequena de 3 linhas). Isso viola §7 do `HOME_DESIGN_DIRECTION.md` (memória é nota livre curta, não sintoma) e gera confusão UX.

**Solução:** criar rota dedicada `/diario/anotar-memoria` com **somente textarea grande** + CTA "Registrar". Manter `quick-log.tsx` exclusivamente pra sintomas (nausea, headache, fatigue, diarrhea, constipation). Remover suporte a `type=other` da tela legada.

---

## Critérios de aceitação

- [ ] Nova rota `/diario/anotar-memoria` existe em `app/diario/anotar-memoria.tsx`
- [ ] Nova tela contém **apenas**: header com X de fechar + título "Anotar memória" + textarea (mínimo 8 linhas visíveis, `maxLength=500`) + CTA "Registrar" no rodapé
- [ ] Sem campo "Tipo" readonly. Sem chips de intensidade. Sem qualquer label adicional.
- [ ] `components/home/HomeV7Content.tsx` linha 63 atualizada: `onPressMemory` navega pra `/diario/anotar-memoria` (sem query param)
- [ ] `lib/validation/diarioSchemas.ts`: criar `memoryNoteSchema` (apenas `notes: string` obrigatório, 1–500 chars). NÃO modificar `quickLogSchema` ainda.
- [ ] `hooks/useRegisterMemoryNote.ts` novo: mutation que insere em `quick_logs` com `logType='other'`, `intensity=null`, `notes=<texto>`
- [ ] `app/diario/quick-log.tsx`: remover `'other'` de `QUICK_LOG_TYPES`. Se rota receber `type=other` (legado), redirecionar pra `/diario/anotar-memoria`. Validar com `tsc --noEmit`.
- [ ] `app/_layout.tsx`: registrar rota `diario/anotar-memoria`
- [ ] Estilo da nova tela 100% consistente com tokens em `lib/theme/tokens` — não inventar cor, spacing, radius
- [ ] Touch target do CTA "Registrar" ≥ 44px (iOS HIG)
- [ ] `npm run type-check` PASS · `npm run lint` PASS (1 warning preexistente em `lib/i18n/index.ts` aceitável)
- [ ] Screenshot real em `assets/screenshots/anotar-memoria/` (mínimo 2: estado vazio + estado preenchido). Usar `react-native-devtools-mcp` ou simulador físico.
- [ ] `/impeccable critique app/diario/anotar-memoria.tsx` ≥ 32/40
- [ ] Migration de DB: confirmar que `quick_logs.intensity` aceita NULL no schema atual via Supabase MCP (`get_advisors` + verificar coluna). Se exigir NOT NULL, gerar migration `apply_migration` pra relaxar — mas só nesse caso.

---

## Restrições explícitas

- **NÃO mexer na tela `app/diario/quick-log.tsx` além de remover suporte a `type=other`.** A tela continua servindo sintomas (nausea/headache/fatigue/diarrhea/constipation) com a mesma UI.
- **NÃO refatorar `useRegisterQuickLog`.** O hook continua intacto. A nova tela usa hook próprio `useRegisterMemoryNote`.
- **NÃO mudar `quickLogSchema` por enquanto.** Criar schema separado evita drift e simplifica revert.
- **NÃO adicionar mint, gradient, glass na nova tela.** Mint segue restrito a Home (§5.4). CTA "Registrar" usa padrão `AuthButton` já existente.
- **NÃO usar `as any`, `// @ts-ignore`, `// eslint-disable`** sem justificativa explícita no plano.
- **NÃO tocar `QuickLogChips`** (`components/diario/QuickLogChips.tsx`) — chips do diário continuam navegando pra `quick-log?type=<sintoma>`.
- **NÃO introduzir nova lib.** `react-hook-form` + `zod` já estão no projeto; usar.
- **PT-BR obrigatório.** Header "Anotar memória", placeholder "Anote uma lembrança, observação ou item para a próxima consulta.", CTA "Registrar", toast "Memória registrada".
- **LGPD:** `notes` é PHI (texto livre do paciente). Confirmar que a RLS de `quick_logs` exige `auth.uid() = user_id` — se não exige, abrir tarefa #36b separada antes de mergear.
- **Karpathy §3 (escopo cirúrgico):** zero drive-by refactor. Cada linha alterada deve traçar de volta a um critério de aceitação explícito acima.

---

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Pré-leitura | `karpathy-guidelines` | Declarar assumptions, "could 50 lines do this?", success criteria verificáveis no plano |
| Pré-leitura | `claude-mem:mem-search` (`npx claude-mem search`) | Trazer trabalho prévio sobre quick-log/sintoma/memória pra evitar redescoberta |
| Planejamento | `grill-with-docs` | Toca conceito de domínio ("memória" vs "sintoma"). Pode atualizar `CONTEXT.md` glossário e/ou gerar ADR se decisão "schema separado por conceito" for não-óbvia. |
| Planejamento | `superpowers:writing-plans` | Persistir plano em `docs/superpowers/plans/2026-05-25-anotar-memoria-tela-dedicada.md` ANTES de tocar código (regra 21) |
| Implementação | `impeccable craft` | Criar nova tela com 6-seções (intent → flow → components → polish → accessibility → motion) |
| Implementação | `react-native-best-practices` | Padrões Expo/RN (KeyboardAvoidingView, SafeAreaView edges, ScrollView keyboardShouldPersistTaps) |
| Validação | `impeccable critique` | Crítica pré-PR da tela nova; gate ≥ 32/40 |
| Validação | `security-review` | Confirma RLS de `quick_logs` + valida que `notes` não vaza em logs/analytics |
| Persistência de memória | `claude-mem` (regra 30) | Compactação automática ao fim da sessão |

### B) Plano de execução

Lista numerada com checkpoints. Estimar tempo por etapa.

1. **Pré-leitura + mem-search** (5min) — checkpoint: confirmar contexto auto-injetado lido + 3 memórias relevantes citadas no plano
2. **Verificar RLS de `quick_logs`** via Supabase MCP `list_tables` + `execute_sql` (`SELECT * FROM pg_policies WHERE tablename = 'quick_logs'`) (3min) — checkpoint: política `auth.uid() = user_id` confirmada
3. **Verificar `quick_logs.intensity` NULL** via Supabase MCP `execute_sql` (`SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name='quick_logs' AND column_name='intensity'`) (2min) — checkpoint: documentar NULL=allowed ou propor migration
4. **Salvar plano** em `docs/superpowers/plans/2026-05-25-anotar-memoria-tela-dedicada.md` (5min) — checkpoint: arquivo criado, com assumptions explícitas Karpathy
5. **Criar branch** `feature/36-anotar-memoria-tela-dedicada` (1min)
6. **Criar `memoryNoteSchema`** em `lib/validation/diarioSchemas.ts` (5min) — checkpoint: schema exporta + tsc PASS
7. **Criar hook `useRegisterMemoryNote`** em `hooks/useRegisterMemoryNote.ts` (10min) — checkpoint: inserção em `quick_logs` com `logType='other'`, `intensity=null`, `notes=trimmed`
8. **Criar tela `app/diario/anotar-memoria.tsx`** seguindo impeccable craft 6-seções (40min) — checkpoint: render compila + screenshot vazio + screenshot preenchido
9. **Registrar rota** em `app/_layout.tsx` (3min) — checkpoint: tipos de Expo Router regerados sem erro
10. **Atualizar `HomeV7Content.tsx`** linha 63: `onPressMemory` → `/diario/anotar-memoria` (2min) — checkpoint: navegação real no simulador
11. **Remover `'other'` de `QUICK_LOG_TYPES`** + redirect legacy em `quick-log.tsx` (10min) — checkpoint: type-check PASS + tela de sintoma continua funcional
12. **Rodar `/impeccable critique`** na tela nova (10min) — checkpoint: ≥ 32/40, anotar pontos falhos no plano
13. **Rodar `security-review` da branch** (5min) — checkpoint: 0 findings críticos
14. **Capturar screenshots reais** (5min) — checkpoint: 2 PNGs em `assets/screenshots/anotar-memoria/`
15. **Atualizar `docs/history.md`** com entrada do prompt 36 (3min)
16. **Abrir PR** com template padrão (5min) — checkpoint: PR aberto, CI verde, screenshots embedados

### C) Riscos identificados

- **Risco 1:** `quick_logs.intensity` pode ter NOT NULL constraint → mutation falha silenciosamente. **Mitigação:** etapa 3 valida explicitamente antes de implementar; se NOT NULL, plano para com pedido de aprovação pra rodar migration relaxando.
- **Risco 2:** Remover `'other'` de `QUICK_LOG_TYPES` quebra `QuickLogChips` se algum chip usa esse type. **Mitigação:** etapa 11 inclui grep em `components/diario/QuickLogChips.tsx` + busca por `'other'` em todo `components/diario/` antes de mexer.
- **Risco 3:** Histórico de quick_logs antigos com `logType='other'` continua válido (já existem rows em produção). **Mitigação:** schema do banco não muda; só o flow de entrada. Rows existentes continuam aparecendo na timeline normalmente.
- **Risco 4:** Drift entre `quick-log.tsx` (sintoma) e `anotar-memoria.tsx` (memória) ao longo do tempo. **Mitigação:** documentar no CONTEXT.md a separação conceitual; futura unificação só via decisão explícita.
- **Risco 5:** Testar no simulador depende de Léo ter o app rodando. **Mitigação:** usar `react-native-devtools-mcp` (regra 20 CLAUDE.md) — Claude Code captura screenshots sem delegar.
- **Risco 6:** `impeccable critique` pode marcar < 32/40 e exigir rework. **Mitigação:** rodar critique antes do PR; se reprovar, iterar até passar OU pausar e pedir aprovação pra mergear com débito documentado.

### D) Arquivos que vai criar/editar

| Arquivo | Ação | Resumo |
|---|---|---|
| `docs/superpowers/plans/2026-05-25-anotar-memoria-tela-dedicada.md` | criar | Plano persistido (regra 21) |
| `app/diario/anotar-memoria.tsx` | criar | Nova tela: header + textarea + CTA |
| `lib/validation/diarioSchemas.ts` | editar | Adicionar `memoryNoteSchema` + remover `'other'` de `QUICK_LOG_TYPES` |
| `hooks/useRegisterMemoryNote.ts` | criar | Mutation dedicada — não tocar `useRegisterQuickLog` |
| `app/_layout.tsx` | editar | Registrar rota `diario/anotar-memoria` |
| `app/diario/quick-log.tsx` | editar | Remover suporte a `type=other` + redirect legacy |
| `components/home/HomeV7Content.tsx` | editar | Linha 63: `onPressMemory` → nova rota |
| `assets/screenshots/anotar-memoria/01-empty.png` | criar | Screenshot estado vazio |
| `assets/screenshots/anotar-memoria/02-filled.png` | criar | Screenshot estado preenchido |
| `docs/history.md` | editar | Entry do Prompt 36 |
| `CONTEXT.md` | editar (via grill-with-docs) | Glossário: "memória" vs "sintoma" |

### E) Como vai validar

- [ ] `npm run type-check` → 0 errors (via Bash, RTK comprime saída)
- [ ] `npm run lint` → 0 errors (warning preexistente em `lib/i18n/index.ts` aceitável)
- [ ] Simulador iOS: tap em "Adicionar memória" da Home v7 abre a tela nova
- [ ] Textarea aceita 500 chars; CTA disabled enquanto vazia
- [ ] Submit insere row em `quick_logs` com `logType='other'`, `intensity=null`, `notes=texto`
- [ ] Toast "Memória registrada" aparece
- [ ] Tela fecha; Home v7 timeline mostra nova entrada no topo
- [ ] Tap em chip de sintoma do Diário (Náusea, Dor de cabeça, etc.) ainda abre `quick-log.tsx` antiga com intensidade
- [ ] `/impeccable critique app/diario/anotar-memoria.tsx` ≥ 32/40
- [ ] `security-review` da branch → 0 críticos
- [ ] Screenshots embedados no PR

### F) Otimização de tokens

- Usar `rtk read app/diario/quick-log.tsx` (compressão estrutural) em vez de Read full
- Usar `rtk grep "QUICK_LOG_TYPES\|other" --type ts` em vez de grep full
- Outputs de `npm install` / `npm run *` ficam em arquivos temporários referenciados via `@file` (regra 25)
- Plano salvo em arquivo (regra 21) — não despejar no chat

---

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.

Retorno esperado do Claude Code:

1. Confirmação de leitura dos 12 itens do "Contexto obrigatório"
2. Output curto de `npx claude-mem search "quick-log anotar memoria sintoma"` com 3 memórias relevantes
3. Output da verificação de RLS + nullable de `quick_logs.intensity`
4. Tabela A (Skills) preenchida
5. Plano B numerado com tempos
6. Riscos C com mitigações concretas
7. Tabela D (arquivos) preenchida
8. Checklist E de validação
9. Nota F de otimização

**Sem código.** Sem screenshots ainda. Sem PR. Só plano.

Léo aprova → Claude Code executa etapas 4–16 em sequência, com checkpoints onde pausar se algo divergir.
