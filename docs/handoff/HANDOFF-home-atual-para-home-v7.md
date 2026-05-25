# Handoff — Mapeamento Home atual para Home v7

**Data:** 2026-05-24  
**Modo:** read-only de codigo + documentacao. Nenhum codigo de app alterado.  
**Base de destino:** `docs/HOME_DESIGN_DIRECTION.md` + `docs/handoff/HANDOFF-figma-make-home-v7.md`  
**Arquivos lidos:** `app/(tabs)/index.tsx`, `components/home/*`, `lib/supabase/queries/{doses,weight,reports,diario,profile}.ts`, hooks relacionados.

## Veredito

A Home atual e pequena e funcional, mas ainda representa a arquitetura antiga:

1. saudacao pessoal;
2. card de proxima dose ou empty dose;
3. duas quick actions;
4. card de insight.

A Home v7 muda a tese da tela: deixa de ser "atalhos + card de dose + insight" e vira **memoria organizada em scroll unico**.

## Estado atual verificado

| Area | Codigo atual | Evidencia |
|---|---|---|
| Tela Home | `app/(tabs)/index.tsx` | Renderiza `GreetingHeader`, `NextDoseCard`/`EmptyDoseStateCard`, `HomeQuickActions`, `InsightCard`. |
| Header | `components/home/GreetingHeader.tsx` | Usa `Bom dia/Boa tarde/Boa noite, {nome}` + data. |
| Proxima dose | `components/home/NextDoseCard.tsx` | Usa hero number/card. Se `nextDose=null`, nao renderiza estado `A definir`; a tela troca para empty state apenas quando nao ha dose. |
| Empty dose | `components/home/EmptyDoseStateCard.tsx` | Card grande com CTA para registrar dose. |
| Quick actions | `components/home/HomeQuickActions.tsx` | So tem `Registrar dose` se `hasDose=true` e `Registrar peso` sempre. Nao tem `Adicionar memoria`. |
| Insight | `components/home/InsightCard.tsx` | Mostra `Insight do dia`, onboarding/daily insight ou fallback `Vamos acompanhar seu tratamento dia a dia.` |
| Dose query | `lib/supabase/queries/doses.ts` | `daysUntilNextDose: number | null`; se null, retorna `nextDose:null` com historico preservado. Insert de dose envia `days_until_next_dose:null`. |
| Peso | `lib/supabase/queries/weight.ts`, `hooks/useWeightLogs.ts` | Ja existe fonte para ultimo peso e delta, mas Home atual nao usa. |
| Custos | `types/database.ts` (`purchases`) | Tabela/tipos existem; nao ha query/hook de custos no app atual. |
| Diario/memoria | `lib/supabase/queries/diario.ts`, `app/(tabs)/diario.tsx` | Ja ha quick logs/checkins e timeline no Diario, mas Home atual nao usa. |
| Consulta | Onboarding tem `doctor_name`; nao ha componente Home para memoria de consulta. | Sera componente novo. |

## Mapeamento por bloco v7

| Bloco v7 | Existe hoje? | Reusar | Criar/alterar |
|---|---:|---|---|
| Topo de memoria | Parcial | `GreetingHeader` so como referencia de data | Criar `HomeHeaderMemory` com headline fixa/dinamica: `Seu tratamento esta organizado ate aqui.` |
| Acoes rapidas | Parcial | `HomeQuickActions` como base tecnica de Pressable/a11y | Alterar para 3 acoes sempre visiveis: `Anotar dose`, `Anotar peso`, `Adicionar memoria`. Remover dependencia de `hasDose` para mostrar dose. |
| Proxima dose | Parcial | `getDoseSummary` e parte do `NextDoseCard` | Criar `NextDoseMemorySection`. Se ha historico mas `nextDose=null`, mostrar `A definir` + helper. Nao usar hero number/card enquanto protocolo desconhecido. |
| Peso atual | Parcial | `getWeightLogs`/`useWeightLogs` ou `profile.currentWeight/initialWeight` | Criar `WeightMemorySection` na Home. Preferir ultimo `weight_logs`; fallback para profile. |
| Memoria recente | Parcial | `dose.history`, `weight_logs`, `quick_logs`, `daily_checkins` | Criar agregador simples `useHomeMemoryTimeline` ou mapper local. Cada item precisa ser fato especifico. |
| Observacoes | Parcial | `quick_logs`, futuro `symptom_logs`, `daily_checkins` legado | Criar `ObservationMemoryCard`. V1 pode ficar oculto se nao houver observacao segura. |
| Para a consulta | Nao | Nada direto | Criar `ConsultationMemorySection` com dados manuais/futuros. Nao inventar itens. Ocultar se vazio ou usar CTA discreto de adicionar memoria. |
| Custos registrados | Schema apenas | `purchases` tipos | Criar query/hook `getRecentPurchasesSummary` depois. Exibir somente se count > 0. |
| Disclaimer | Nao | `InsightDisclaimer` como referencia de limite | Criar `MedicalDisclaimer` com copy v7. |

## Principais substituicoes

| Atual | Destino |
|---|---|
| `GreetingHeader` | Substituir por `HomeHeaderMemory`. Saudacao por nome deixa de ser hero da Home. |
| `NextDoseCard` | Nao portar visualmente. Reaproveitar regra de query/erro/loading se necessario. |
| `EmptyDoseStateCard` | Nao portar como card grande. O estado vazio de dose deve viver em `NextDoseMemorySection` + quick action `Anotar dose`. |
| `HomeQuickActions` | Reescrever visualmente e ampliar para 3 acoes. |
| `InsightCard` | Remover da Home v7 Free. Pro futura pode ter memoria inteligente, mas nao como `Insight do dia` automatico. |

## Dados que ja estao prontos

| Dado | Status |
|---|---|
| Historico de doses | Pronto em `getDoseSummary`. |
| Protocolo desconhecido | Pronto: `daysUntilNextDose=null` faz `nextDose=null`. |
| Peso | Pronto via `getWeightLogs`; Home ainda nao usa. |
| Perfil | Pronto parcialmente via `useProfile`, mas ainda nao seleciona `dose_frequency_days`, `main_concerns`, `next_appointment_date` no mapper atual. |
| Quick logs/check-ins | Pronto no Diario, mas precisa filtro/copy segura para Home. |

## Dados faltantes ou incompletos

| Dado | Gap |
|---|---|
| `dose_frequency_days/source` no perfil local | Migration existe, mas `getProfile` ainda nao seleciona/mapeia esses campos. |
| Custos na Home | Tabela `purchases` existe, mas nao ha query/hook. |
| Memoria para consulta | Nao ha tabela/componente dedicado no app atual. Pode comecar como `Adicionar memoria` sem renderizar lista ate fonte existir. |
| `symptom_logs` como fonte canonica | Schema existe, mas app atual ainda usa `daily_checkins`/`quick_logs` para sintomas. |
| Plano Free/Pro na Home | `InsightCard` ainda pode mostrar daily/onboarding insight; v7 precisa respeitar Free sem IA recorrente. |

## Riscos de implementacao

| Risco | Mitigacao |
|---|---|
| Recriar Home como dashboard de cards | Usar separadores finos e blocos lineares da v7. |
| Mostrar `A definir` errado quando nao ha dose nenhuma | Distinguir `sem dose` de `ha dose, sem protocolo`. Ambos podem ser seguros, mas copy deve mudar. |
| Timeline virar meta-log | Proibir `Registro adicionado ao historico`; usar evento especifico. |
| Custos aparecerem vazios | Exibir somente se houver pelo menos um registro em `purchases`. |
| IA voltar como `Insight do dia` | Nao portar `InsightCard` como bloco default da Home v7. |
| Tokens divergirem | Resolver `#0B1017` v7 vs `colors.bgBase #050B12` antes de codar. |

## Sequencia recomendada para PR futura

1. Decidir token de fundo: adaptar v7 aos tokens atuais ou promover graphite v7.
2. Criar rota/flag experimental para Home v7, sem substituir a Home atual.
3. Implementar componentes estaticos primeiro: header, quick actions, disclaimer.
4. Conectar dados seguros: dose summary, weight logs.
5. Adicionar timeline factual com mapper pequeno.
6. Deixar observacoes/consulta/custos condicionais ate haver fonte confiavel.
7. Validar em simulador com screenshots reais.
8. Rodar `npm run type-check`, `npm run lint` e `/impeccable critique`.

## Proxima decisao bloqueante

**Token graphite v7 vs token atual.**

| Opcao | Consequencia |
|---|---|
| Usar tokens atuais (`#050B12`, `#0E1620`, `#1B2433`) | Menor impacto e menos churn no design system. Pode ficar um pouco mais duro que a v7. |
| Promover graphite v7 (`#0B1017`, `#121923`, `#1C2330`) | Mais fiel ao Figma Make aprovado. Exige atualizar tokens/docs e revisar telas existentes. |

Recomendacao tecnica inicial: implementar a rota experimental com **aliases locais derivados dos tokens atuais**, tirar screenshot, e so promover graphite globalmente se a diferenca visual for realmente melhor no simulador.

