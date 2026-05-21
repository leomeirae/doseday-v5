# PR 33 — Contrato Estruturado do Onboarding Insight

## Contexto

Implementar o contrato estruturado da Edge Function `generate-onboarding-insight`, conforme `BUG ONB-08`, `D015` e decisão canônica `P009=A`.

Decisões aprovadas:

- Manter OpenAI/GPT como provedor da função.
- Usar Structured Outputs com `response_format: { type: 'json_schema' }`.
- Não usar Anthropic SDK neste PR.
- Usar `verify_jwt=true` no deploy da Edge Function.
- Remover auth manual duplicada; Supabase Auth nativo valida o JWT antes da execução.
- Usar `service_role` apenas em escrita server-side em `educational_insights`.
- Remover citações nominais a estudos clínicos do output.
- Criar dois ADRs: labels determinísticos e persistência híbrida.
- Capturar screenshot real do Result novo.

## Skills

| Fase | Skill | Uso |
|---|---|---|
| Planejamento | `grill-with-docs` | Validar contrato contra domínio disponível; `CONTEXT.md` não existe no workspace. |
| Persistência | `superpowers:writing-plans` | Salvar este plano antes de tocar código. |
| Supabase | `supabase` | Edge Function, deploy com `verify_jwt=true`, secrets server-side. |
| OpenAI | `openai-docs` | Structured Outputs via JSON Schema. |
| React Native | `react-native-best-practices` | Ajuste mínimo no consumidor Expo/RN. |
| Publicação | `github:yeet` | Commit, push e PR ready for review. |

## Plano

1. Versionar a Edge Function em `supabase/functions/generate-onboarding-insight/`.
2. Definir o contrato compartilhado em `types/api.ts`.
3. Ajustar a função para:
   - manter OpenAI;
   - usar JSON Schema estrito;
   - derivar labels determinísticos no servidor;
   - validar output antes de retornar;
   - bloquear `SURMOUNT`, `SURPASS`, `STEP`, `clinical trial` e `estudo clínico`;
   - persistir compatibilidade legacy em `headline/body/disclaimer` e contrato completo no `context`.
4. Atualizar `lib/supabase/queries/insights.ts`, `hooks/useOnboardingInsight.ts` e o Result do onboarding para consumir o novo contrato.
5. Criar ADRs em `docs/adr/`.
6. Rodar validações locais e deploy MCP com `verify_jwt=true`.
7. Invocar a função autenticada com fixture real.
8. Validar tela Result no simulador e salvar screenshot em `assets/screenshots/2026-05-20-fase-2-pr33/`.
9. Abrir PR `feature/33-edge-onboarding-insight-contrato` com referência a `BUG ONB-08` e `D015`, marcado ready for review.

## Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| Função remota estava ativa mas não versionada localmente. | Criar fonte local antes do deploy e manter como IaC legível. |
| `verify_jwt=true` remove execução para requests anônimos. | Cliente já usa `supabase.functions.invoke(...)` com sessão autenticada; sem mudança no client. |
| Structured Outputs não substitui validação de domínio. | Validar schema + conteúdo proibido antes do return. |
| PHI em logs. | Logs sem peso, dose, prompt completo, output completo ou nome de usuário. |
| Persistência legacy não acomoda o contrato inteiro. | Guardar resumo em colunas existentes e contrato completo no JSON `context`, sem migration. |
| Home D0/D1 ainda não consome o contrato. | Expor tipo estável agora; Prompts 31/32 podem consumir depois. |

## Arquivos

| Arquivo | Ação |
|---|---|
| `supabase/functions/generate-onboarding-insight/index.ts` | Criar |
| `supabase/functions/generate-onboarding-insight/deno.json` | Criar |
| `types/api.ts` | Criar |
| `lib/supabase/queries/insights.ts` | Editar |
| `hooks/useOnboardingInsight.ts` | Editar |
| `app/(onboarding)/result.tsx` | Editar mínimo |
| `docs/adr/0001-labels-deterministicos-edge-onboarding.md` | Criar |
| `docs/adr/0002-persistencia-hibrida-educational-insights.md` | Criar |
| `assets/screenshots/2026-05-20-fase-2-pr33/` | Criar screenshot real |

## Validação

- `npm run type-check`
- `npm run lint`
- Invoke autenticado da Edge Function.
- Verificar campos exatos do contrato.
- Grep anti-citação no código e no output.
- Security review: `verify_jwt=true`, secrets server-side, sem PHI em logs, `service_role` limitado ao upsert.
- Screenshot real do Result novo no simulador.

## Critérios de sucesso

- A função retorna exatamente o contrato estruturado obrigatório.
- Nenhuma saída nominaliza estudos clínicos.
- O cliente compila e renderiza o Result sem fallback quebrado.
- Edge Function está deployada com `verify_jwt=true`.
- PR pronto para revisão manual do Léo.
