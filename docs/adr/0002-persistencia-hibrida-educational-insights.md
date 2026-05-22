# ADR 0002 — Persistência híbrida de `educational_insights` sem migration

**Data:** 2026-05-20
**Status:** Aceito
**Origem:** Prompt 33 (contrato estruturado do onboarding insight)
**Decisores:** Léo (PO) + Codex App (arquitetura) + Cowork (validação)

---

## Contexto

A tabela `educational_insights` no Supabase (mantida da V4) tem schema atual:

| Coluna | Tipo | Uso V4 |
|---|---|---|
| `id` | uuid PK | — |
| `user_id` | uuid FK | dono do insight |
| `headline` | text | título curto do insight |
| `body` | text | corpo do insight (texto livre) |
| `disclaimer` | text | disclaimer clínico/LGPD |
| `created_at` | timestamptz | auditoria |
| `context` | jsonb (opcional) | metadados de geração |

O Prompt 33 introduz contrato estruturado com 8 campos (ver ADR 0001). Pergunta: como persistir esse contrato em `educational_insights`?

Opções:
1. **Migration ALTER TABLE** — adicionar colunas `stage_label`, `medication_label`, etc.
2. **Persistência híbrida** — salvar colunas legacy (`headline`, `body`, `disclaimer`) derivadas do contrato + salvar contrato completo em `context` (jsonb)
3. **Nova tabela** — `onboarding_insights` separada da `educational_insights`

## Decisão

**Opção 2 — persistência híbrida sem migration.**

Estratégia de gravação na Edge Function:

```typescript
const contract = buildContract(...)
const insight = {
  user_id,
  headline: contract.stageLabel,
  body: `${contract.shortInsight}\n\n${contract.nextStep}\n\n${contract.contextBullets.join('\n')}`,
  disclaimer: contract.disclaimer,
  context: {
    schemaVersion: 'onboarding_insight_v2',
    contract_version: 'v2',
    input,
    output: contract,
  },
}
await supabase.from('educational_insights').upsert(insight)
```

Estratégia de leitura:
- Cliente novo (Result V5 + Home V5) lê `context.output` jsonb e renderiza contrato estruturado
- Código legacy V4 (se existir em algum cache local de migração) continua lendo `headline/body/disclaimer` e funciona
- Schema TypeScript do client trata `context.output` como `OnboardingInsightContract | null` — fallback pra `{headline, body, disclaimer}` se `context.output` for null

### Atualização 2026-05-21 — `schemaVersion` canônico

O Prompt 33b adiciona `schemaVersion: 'onboarding_insight_v2'` ao próprio payload `context.output`. A versão canônica do contrato passa a ser o campo dentro do payload, porque é isso que os readers do app validam antes de renderizar.

`context.schemaVersion` também é gravado no wrapper para auditoria rápida. `context.contract_version = 'v2'` permanece por compatibilidade com registros e readers intermediários, mas está deprecated: novos readers devem usar `context.output.schemaVersion` e rejeitar versão ausente ou diferente.

## Alternativas consideradas

| Alternativa | Por que rejeitada |
|---|---|
| Migration ALTER TABLE | Operação de migração em tabela com dados de produção (V4). Risco de breaking change. Exige plano de rollback. Lentidão pra varrer linhas antigas. Não justifica pra fase 1 de redesign |
| Nova tabela `onboarding_insights` | Duplica modelo de dados. Quebra queries existentes em `educational_insights`. Adiciona complexidade de manutenção (RLS duplicada, índices duplicados) |
| Salvar **apenas** em `context` (sem preencher legacy) | Quebra qualquer caminho de leitura V4 ainda existente. Sem fallback seguro |

## Consequências

### Positivas
- Zero migration → zero risco em produção
- Backward compatible com V4 (se houver cache de queries antigas)
- Mudar contrato no futuro é só editar a Edge Function — sem migração
- `context` jsonb é flexível pra futuras extensões (ex: adicionar `confidenceScore`)

### Negativas
- Duplicação de informação: `stageLabel` aparece em `headline` E em `context.output.stageLabel`. Se algum write futuro atualizar `headline` direto, contrato fica fora de sync
- Queries que dependam só de colunas tipadas (`headline`) perdem capacidade analítica (não há `WHERE stage_label = 'Semana 8'` direto)

### Mitigações
- **Regra de ouro:** nenhum código fora da Edge Function escreve em `educational_insights`. Toda escrita passa pela Edge Function. Se isso quebrar, sync legacy/context quebra junto
- Pra analytics: se precisar agregar por stage, criar view materializada que extrai `context->'output'->>'stageLabel'` no futuro

## Reversibilidade

**Média.** Pra reverter pra schema legacy puro (sem `context`):
1. Edge Function para de escrever em `context`
2. Client para de ler `context` e volta a renderizar `{headline, body, disclaimer}` cru

Pra reverter pra schema ALTER TABLE (Opção 1):
1. Migration adiciona colunas tipadas
2. Backfill copia de `context` → colunas
3. Edge Function escreve nas colunas novas
4. Drop `context` quando seguro

Ambos caminhos são executáveis. ADR não é one-way door.

## Implementação

Ver Prompt 33 etapa 5 (schema Zod) + etapa 9 (deploy) + plano persistido em `docs/superpowers/plans/2026-05-20-edge-onboarding-insight-contrato.md`.
