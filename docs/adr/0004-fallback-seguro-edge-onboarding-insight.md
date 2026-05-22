# ADR 0004 — Fallback seguro na Edge Function `generate-onboarding-insight`

**Data:** 2026-05-21
**Status:** Aceito
**Origem:** Prompt 33b (hardening do contrato de onboarding insight)
**Decisores:** Léo (PO) + Codex App (arquitetura) + Cowork (validação)

---

## Contexto

A Edge Function `generate-onboarding-insight` gera o contrato estruturado usado
no Result do onboarding e reaproveitado pela Home D0. Antes do hardening, qualquer
falha downstream do LLM retornava `500`:

- falha no OpenAI;
- JSON inválido;
- output fora do schema Zod;
- output com termo proibido;
- falha de upsert em `educational_insights`.

Isso fazia o cliente cair em erro mesmo quando havia uma alternativa segura:
contrato fallback determinístico com labels calculados pelo servidor e textos
fixos aprovados pelo produto.

## Decisão

Separar falhas em duas classes:

| Classe                          | Status                | Motivo                                                                       |
| ------------------------------- | --------------------- | ---------------------------------------------------------------------------- |
| Auth inválida                   | `401`                 | O cliente não tem usuário autenticado                                        |
| Input inválido                  | `400`                 | O cliente enviou payload fora do contrato                                    |
| Falha LLM-side                  | `200 + fallback`      | O usuário não tem ação possível; o servidor tem fallback seguro              |
| Upsert falha após contrato real | `200 + contrato real` | O insight já foi gerado; falha de persistência não deve apagar a experiência |
| Upsert falha no fallback path   | `200 + fallback`      | A UI continua funcional e a próxima invocação tenta persistir novamente      |

O fallback é montado por função pura:

```typescript
buildFallbackContract(ctx, reason)
```

Regras do fallback:

- `schemaVersion: 'onboarding_insight_v2'` injetado pelo servidor;
- labels factuais derivadas deterministicamente;
- `shortInsight`, `nextStep` e `contextBullets` são strings fixas no código;
- passa pelos mesmos bloqueios legais de output;
- logs registram apenas razão categórica, sem PHI.

## Alternativas consideradas

| Alternativa                       | Por que rejeitada                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| Manter `500` para qualquer falha  | Quebra a promessa emocional do onboarding por falha que o usuário não entende nem resolve |
| Fazer retry automático no cliente | Pode repetir custo de LLM sem resolver JSON inválido ou termo proibido                    |
| Fallback no cliente               | Duplica regra clínica/produto e perde persistência em `educational_insights`              |
| Gerar fallback por LLM            | Remove o principal benefício do fallback: ser determinístico e seguro                     |

## Consequências

### Positivas

- Result/Home recebem contrato renderizável mesmo quando o LLM falha.
- Fallback fica testável por Deno sem depender de segredo de produção.
- Logs ganham razão categórica (`openai_fail`, `json_invalid`, `raw_zod_fail`,
  `forbidden_text`, `upsert_fail`) sem vazar input clínico.
- Reader da Home pode rejeitar contratos antigos sem quebrar UI.

### Negativas

- Métricas HTTP não distinguem falha LLM-side por status code; é preciso observar
  logs e `context.fallback_reason`.
- Se upsert falhar, a experiência do usuário continua, mas a persistência pode
  não existir até a próxima invocação.

## Implementação

- `index.ts` fica apenas com `Deno.serve(handleRequest)`.
- `handler.ts` concentra funções puras, `handleRequest` e injeção de dependências.
- `handler.test.ts` valida fallback, parse em duas etapas e mocks de auth/OpenAI.
- `educational_insights.context` grava:
  - `schemaVersion`;
  - `contract_version` legado;
  - `input`;
  - `output`;
  - `fallback_reason` quando aplicável.

## Reversibilidade

Alta. Para voltar ao comportamento antigo:

1. remover fallback path;
2. voltar a lançar erro em falhas LLM-side;
3. manter `schemaVersion` no contrato, pois ele é independente da política de
   fallback.

Não recomendado, porque reintroduz dead-end de UX.
