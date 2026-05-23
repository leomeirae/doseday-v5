# DoseDay — Contrato de Memoria para Consulta

**Data:** 2026-05-23  
**Status:** direcao tecnica pre-design. Nao e prompt de execucao.  
**Escopo:** relatorio/memoria para consulta, `medical_reports`, futura Edge Function de relatorio, dados legados v48.

Este documento existe para impedir que a tela unica seja desenhada em cima de uma ideia errada de "relatorio medico". A direcao atual do produto e: **DoseDay e memoria do tratamento para o usuario, compartilhavel com quem acompanha o tratamento quando o usuario quiser.**

---

## 1. Decisao central

O relatorio do DoseDay nao e prontuario, parecer medico, painel clinico nem recomendacao. Ele e uma **memoria organizada do tratamento**.

| Tema | Decisao |
|---|---|
| Publico primario | Usuario/paciente |
| Publico secundario | Profissional de saude, somente quando o usuario decide compartilhar |
| Tom | Linguagem do paciente, clara, sem jargao clinico |
| Funcao | Ajudar o usuario a lembrar o que aconteceu e conversar melhor na consulta |
| IA | Apenas no Pro, como memoria inteligente; nunca como autoridade medica |
| PDF | Acao secundaria. A leitura primaria acontece dentro do app |

**Regra:** se uma frase do relatorio parece escrita para um medico avaliar o paciente, ela esta errada para a v1. Ela pode ate ser util no futuro, mas nao pertence ao escopo atual.

---

## 2. O que a auditoria confirmou

### 2.1 Estado seguro atual

`supabase/functions/generate-report/index.ts` esta em modo de contencao:

- nao chama OpenAI;
- nao le tabelas;
- nao grava relatorio;
- retorna `disabled: true`;
- passa por `assertSafePatientFacingPayload`;
- esta deployada como v49 em producao com `verify_jwt=true`.

Isso significa que a geracao viva insegura esta contida.

### 2.2 Divida real

A versao v48 gerou 91 rows em `medical_reports` antes da contencao. Essa versao era incompatível com a nova direcao:

| Achado v48 | Por que bloqueia |
|---|---|
| Prompt com `ROLE: Revisor Clinico Senior para Relatorios Medicos` | Direcao errada: medico como leitor primario |
| `recommendations` no JSON | Abre porta para conduta/orientacao |
| `concern_level` (`none`, `mild`, `moderate`, `concerning`) | Classificacao clinica desnecessaria para usuario |
| `temporal_pattern` pos-dose, D+0/D+1, pico, alivio D+3 | Presume janela biologica e causalidade temporal |
| Aderencia baseada em intervalo semanal 6-8 dias | Invalido sem protocolo confirmado pelo usuario |
| `Avaliação médica recomendada` hardcoded | Orientacao clinica explicita |
| Logs com `userId` e possiveis erros ricos | Risco PHI/LGPD |
| `pdf_url: null` sempre | PDF nao existia de fato |

**Classificacao:** risco P0 se qualquer UI futura listar ou abrir esses 91 relatorios legados sem filtro. Enquanto nao ha UI que consuma `medical_reports`, o risco esta contido, mas nao resolvido.

---

## 3. Politica para os 91 relatorios legados

Decisao recomendada:

1. Marcar todos os relatorios gerados antes da contencao como legado v48.
2. Nao exibir relatorios legados no app.
3. Nao reprocessar automaticamente agora.
4. Nao deletar agora sem plano explicito.

Motivo: deletar dado sensivel sem politica e ruim; exibir dado desalinhado e pior; reprocessar batch agora cria trabalho de IA antes de termos contrato novo.

### 3.1 Migration recomendada futura

Adicionar metadados em `medical_reports`:

| Campo | Tipo | Regra |
|---|---|---|
| `schema_version` | `text null` | Novo relatorio deve preencher, ex: `patient_report_v1` |
| `audience` | `text null` | Check futuro: `patient` |
| `legacy_source` | `text null` | Ex: `generate_report_v48` |
| `is_legacy_blocked` | `boolean not null default false` | `true` para v48 antiga |

Para as 91 rows existentes: `legacy_source = 'generate_report_v48'` e `is_legacy_blocked = true`.

**Nao criar RLS nova sem security-review.** Primeiro confirmar como as politicas atuais de `medical_reports` funcionam. Se a UI filtrar `is_legacy_blocked=false`, ja evitamos reexposicao acidental. Bloqueio por RLS pode vir depois, se necessario.

---

## 4. Fontes canonicas de dados

O relatorio deve usar apenas fontes que representem memoria real do usuario.

| Dado | Fonte canonica | Uso permitido |
|---|---|---|
| Perfil basico | `user_profiles` | Nome, medicamento atual, dose atual, protocolo confirmado, proxima consulta se informada |
| Frequencia/protocolo | `user_profiles.dose_frequency_days`, `dose_frequency_source` | Calculos de proxima dose e regularidade apenas quando confirmado |
| Doses aplicadas | `medication_applications` | Cronologia factual de aplicacoes |
| Peso | `weight_logs` | Evolucao factual, sem promessa de resultado |
| Efeitos/sintomas | `symptom_logs` | Fonte canonica futura para efeitos |
| Check-ins antigos | `daily_checkins` | Legado. Usar somente em migracao/fallback planejado |
| Registro rapido | `quick_logs` | Atalho. Se for sintoma relevante, deve alimentar `symptom_logs` |
| Preocupacoes | `user_profiles.main_concerns` | Contexto declarado pelo usuario; nao diagnostico |
| Custos | `purchases` | Memoria pessoal; nao entra no relatorio para profissional na v1 |

**Regra:** `daily_checkins.symptoms` nao deve ser a base futura do relatorio inteligente. A base futura de efeitos e `symptom_logs`.

---

## 5. Estrutura do relatorio v1

O relatorio deve ser escaneavel e factual. Recomenda-se este contrato:

```ts
type PatientReportV1 = {
  schema_version: 'patient_report_v1'
  period: {
    start: string
    end: string
  }
  treatment_snapshot: {
    medication_name: string | null
    current_dose: string | null
    protocol: {
      frequency_days: number | null
      source: 'user_confirmed' | 'user_edited' | null
      status: 'confirmed' | 'unknown'
    }
  }
  timeline: Array<{
    date: string
    type: 'dose' | 'weight' | 'symptom' | 'note'
    title: string
    detail: string | null
  }>
  concerns: Array<{
    concern: string
    user_marked_this: boolean
    related_records_count: number
    records: Array<{
      date: string
      label: string
    }>
  }>
  factual_summary: {
    doses_registered: number
    weights_registered: number
    symptoms_registered: number
    protocol_known: boolean
  }
  talking_points: string[]
  disclaimer: string
}
```

### 5.1 O que entra em `talking_points`

Permitido:

- "Voce registrou nausea 2 vezes neste periodo."
- "Voce marcou nausea como uma preocupacao no inicio do tratamento."
- "Ha 3 pesos registrados neste periodo."
- "Seu protocolo ainda nao foi definido no DoseDay; por isso nao calculamos regularidade."
- "Voce pode levar esta memoria para conversar com quem acompanha seu tratamento."

Proibido:

- "A nausea foi causada pela dose."
- "Isso e esperado apos a aplicacao."
- "Procure avaliacao medica."
- "Aderencia 100%" sem protocolo.
- "Tolerabilidade leve/moderada/concerning."
- "Pico D+1", "pos-dose", "alivio D+3".
- Citar trials, estudos, SURPASS, SURMOUNT, STEP, SUSTAIN.

---

## 6. Free vs Pro

| Camada | Free | Pro |
|---|---|---|
| Relatorio no app | Lista cronologica basica | Memoria organizada com agrupamentos factuais |
| IA | Nao | Sim |
| Preocupacoes | Mostra o que o usuario marcou + registros relacionados | Cruza factualmente contagens e recorrencia |
| Talking points | Templates deterministicos | Gerados/selecionados por IA com guardrails |
| PDF | Opcional futuro, basico | Opcional futuro, completo |
| Compartilhar | Share basico quando existir tela | Share + PDF quando existir tela |

**Regra:** Free pode organizar dados. Free nao interpreta dados com IA.

---

## 7. Edge Function futura

Recomendacao: criar uma nova funcao chamada `generate-patient-report` em vez de reabilitar diretamente `generate-report`.

Motivos:

- separa historico v48 de contrato novo;
- evita reativar sem querer o modelo antigo;
- deixa claro que o relatorio e do paciente;
- permite manter `generate-report` como stub/deprecated ate a migracao completar.

### 7.1 Requisitos da nova EF

| Requisito | Obrigatorio |
|---|---|
| `verify_jwt=true` | Sim |
| Auth manual com `getUser` para usuario comum | Sim |
| Service role apenas para jobs internos explicitamente permitidos | Sim |
| `schemaVersion` no output | Sim |
| Zod ou JSON schema estrito | Sim |
| `response_format: json_schema` | Sim, se usar OpenAI |
| `_shared/patient-facing-ai-safety.ts` | Sim |
| `_shared/redaction.ts` para logs | Sim |
| Logs sem userId bruto/PHI | Sim |
| Sem trial/estudo/marca | Sim |
| Sem conduta/orientacao | Sim |
| Sem causalidade dose-sintoma | Sim |
| Sem aderencia sem protocolo | Sim |

### 7.2 Logs

Nao logar:

- `userId` bruto;
- nome;
- peso;
- medicamento;
- sintomas;
- notes;
- payload completo;
- erro Postgres sem sanitizacao.

Log permitido:

- request id;
- hash curto do usuario, se necessario;
- schema version;
- status (`generated`, `blocked_legacy`, `insufficient_data`, `disabled`);
- duracao;
- contagem de registros sem conteudo textual.

---

## 8. PDF

Decisao recomendada para v1: **client-side PDF com `expo-print`/share sheet**, nao server-side.

Motivos:

- evita criar bucket/storage sensivel agora;
- evita servico externo para PDF;
- reduz superficie LGPD;
- respeita a decisao de que a leitura primaria e dentro do app;
- PDF vira exportacao local sob acao explicita do usuario.

Se no futuro houver PDF server-side:

- criar bucket privado;
- usar URLs assinadas curtas;
- registrar audit log de criacao/leitura;
- revisar retencao;
- rodar security-review antes.

---

## 9. Cron e relatorios automaticos

Decisao recomendada: **pausar a geracao automatica semanal enquanto o contrato novo nao existir.**

`trigger-weekly-reports` ainda chama `generate-report`. Com a v49 em contencao, isso pode produzir falso sucesso operacional ou ruido nos logs.

### 9.1 Janela do relatorio nao e protocolo de dose

`period_days` e `dose_frequency_days` sao conceitos ortogonais.

| Conceito | O que mede | Quem define |
|---|---|---|
| `dose_frequency_days` | Intervalo entre aplicacoes do medicamento | Usuario, no protocolo do tratamento |
| `period_days` | Janela de leitura do relatorio | Produto/contexto: sob demanda, pre-consulta, desde a ultima consulta |

Exemplos validos:

- usuario semanal com relatorio dos ultimos 30 dias;
- usuario diario com relatorio dos ultimos 7 dias;
- usuario quinzenal com relatorio desde a ultima consulta.

**Regra:** nunca derivar `period_days` diretamente de `dose_frequency_days`. O protocolo informa a memoria do ciclo; o periodo do relatorio informa a janela de leitura.

Direcao:

1. Relatorio v1 deve ser gerado sob demanda pelo usuario.
2. Cron pode voltar depois como "preparar memoria antes da consulta", nao como relatorio semanal fixo.
3. O gatilho ideal futuro e consulta proxima, nao calendario semanal arbitrario.
4. Se um scheduler continuar existindo, ele deve validar o body da EF (`success`, `disabled`, `report_id`) antes de contar sucesso operacional.
5. Logs de scheduler e EFs que tocam PHI nao devem registrar `user_id` bruto; usar `request_id` ou hash redigido.

---

## 10. Relacao com a tela unica

A tela unica nao deve desenhar um "card de IA" generico. Ela deve ter uma area de memoria baseada neste contrato.

Antes do design final, a tela unica precisa saber:

| Bloco | Fonte |
|---|---|
| Estado do tratamento | `user_profiles` + `medication_applications` |
| Proxima dose | somente se protocolo confirmado |
| Peso | `weight_logs` |
| Efeitos relevantes | `symptom_logs` + `main_concerns` |
| Memoria para consulta | `PatientReportV1` ou preview do mesmo contrato |
| Custo | `purchases`, separado do relatorio profissional |

**Regra de design:** a memoria deve parecer uma devolucao do que o usuario registrou, nao uma opiniao da IA.

---

## 11. Proximas tarefas pre-design

| Ordem | Tarefa | Dono sugerido |
|---|---|---|
| 1 | Auditar `trigger-weekly-reports` e RPC `get_users_for_scheduling` | Cowork |
| 2 | Decidir politica dos 91 relatorios legados | Leo + Cowork |
| 3 | Planejar migration de metadados legacy em `medical_reports` | Cowork |
| 4 | Planejar pausa/ajuste do cron de relatorios sem amarrar `period_days` a protocolo de dose | Cowork |
| 5 | Definir contrato final `PatientReportV1` com Zod/JSON schema | Codex |
| 6 | Criar prompt/contrato da futura `generate-patient-report` | Codex |
| 7 | So depois: alvo visual Stitch/Figma da tela unica | Leo + Codex |

---

## 12. Respostas recomendadas as 4 perguntas bloqueantes

| Pergunta | Resposta recomendada |
|---|---|
| O que fazer com os 91 relatorios legados? | Marcar como legado e bloquear exibicao no app. Nao deletar agora. Nao reprocessar agora. |
| PDF server-side ou client-side? | Client-side na v1. Server-side so se houver necessidade real depois. |
| Nome da nova EF | `generate-patient-report`. Manter `generate-report` como deprecated/stub. |
| Cron semanal | Pausar ou neutralizar ate o novo contrato existir. Futuro gatilho deve ser sob demanda ou pre-consulta, nao semanal fixo. `period_days` nao deve ser derivado de `dose_frequency_days`. |

---

## 13. Guardrail para prompts futuros

```text
BLOQUEANTE: respeitar docs/REPORT_MEMORY_CONTRACT.md e docs/PRODUCT_COHERENCE.md.

Relatorio do DoseDay e memoria do tratamento para o usuario, nao parecer medico.

Nao usar:
- recommendations
- concern_level
- temporal_pattern pos-dose
- D+0/D+1/pico/alivio
- avaliacao medica recomendada
- aderencia sem protocolo confirmado
- trial/estudo/SURPASS/SURMOUNT/STEP/SUSTAIN
- causalidade dose-sintoma
- userId bruto em logs

Toda frase deve ser factual ou uma organizacao clara do que o usuario registrou.
```
