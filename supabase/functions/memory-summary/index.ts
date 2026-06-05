// @ts-nocheck
// memory-summary — memory_summary_v1
// IMPORTANTE: Este arquivo RE-HABILITA a Edge Function após containment P0 de 2026-05-23.
// Aprovação do PO: 2026-06-02. Contrato: memory_summary_v1. Ver plano em
// docs/superpowers/plans/2026-06-02-premium-memory-summary.md
import OpenAI from "npm:openai@4.104.0";
import { z } from "npm:zod@4.4.3";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  assertSafePatientFacingPayload,
  containsForbiddenPatientFacingText,
  CORS_HEADERS,
  FIXED_DISCLAIMER,
  jsonResponse,
} from "../_shared/patient-facing-ai-safety.ts";
import { requireAuthenticatedRequest } from "../_shared/auth.ts";

const SCHEMA_VERSION = "memory_summary_v1";
const PROMPT_VERSION = "memory-summary-contract-v3";

// Rótulos PT determinísticos p/ tipos de sintoma (espelha QUICK_LOG_LABELS de
// lib/validation/diarioSchemas.ts — a edge function Deno não importa @lib/*).
// 'other' vira "Outros registros" no contexto do resumo. Fallback = key cru.
const SYMPTOM_LABELS_PT = {
  nausea: "Náusea",
  headache: "Dor de cabeça",
  fatigue: "Cansaço",
  diarrhea: "Diarreia",
  constipation: "Constipação",
  heartburn: "Azia",
  injection_pain: "Dor na injeção",
  alcohol: "Bebi álcool",
  feeling_good: "Bem hoje",
  other: "Outros registros",
};
const MODEL_ENV_KEY = "MEMORY_SUMMARY_MODEL";

// ── Fallback determinístico (específico e positivo) ───────────────────────────
const FALLBACK_PERIOD_SUMMARY =
  "Seus dados do período estão organizados. Continue registrando doses, peso e sintomas para enriquecer sua memória do tratamento.";
const FALLBACK_KEY_FACTS = [
  "Doses do período registradas no histórico",
  "Registros de peso disponíveis na linha do tempo",
];
const FALLBACK_CONSULT_POINTS = [
  "Leve seus registros de dose e evolução de peso para a consulta",
];

// ── Input schema (apenas dados estruturados — sem texto livre) ────────────────
const DoseWeekSchema = z.object({
  weekStart: z.string(),
  applied: z.number().int().nonnegative(),
});

const WeightPointSchema = z.object({
  date: z.string(),
  weight: z.number().positive(),
  notes: z.string().nullable().optional(),
});

const SymptomCountSchema = z.object({
  type: z.string().min(1),
  count: z.number().int().nonnegative(),
});

const TreatmentContextSchema = z.object({
  treatmentWeek: z.number().int().nonnegative().nullable().optional(),
  daysSinceLastDose: z.number().int().nonnegative().nullable().optional(),
  currentDoseMg: z.number().positive().nullable().optional(),
  medication_name: z.string().nullable().optional(),
});

const MemorySummaryInputSchema = z
  .object({
    period_days: z.number().int().positive(),
    doses: z.array(DoseWeekSchema),
    weight_points: z.array(WeightPointSchema),
    symptom_counts: z.array(SymptomCountSchema),
    treatment_context: TreatmentContextSchema,
  })
  .strict();

// ── Output schema (raw LLM — schemaVersion adicionado pelo servidor) ──────────
const memorySummaryRawSchema = z
  .object({
    periodSummary: z.string().trim().min(40).max(280),
    keyFacts: z.array(z.string().trim().min(15).max(120)).min(2).max(3),
    consultPoints: z.array(z.string().trim().min(20).max(150)).min(1).max(3),
    disclaimer: z.string().trim().min(1),
  })
  .strict();

// ── Structured Outputs JSON schema ───────────────────────────────────────────
const MEMORY_SUMMARY_RESPONSE_FORMAT = {
  name: "memory_summary",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["periodSummary", "keyFacts", "consultPoints", "disclaimer"],
    properties: {
      periodSummary: { type: "string" },
      keyFacts: { type: "array", items: { type: "string" } },
      consultPoints: { type: "array", items: { type: "string" } },
      disclaimer: { type: "string" },
    },
  },
};

// ── System prompt — restrito a organizar/resumir apenas o que está no input ───
const SYSTEM_PROMPT =
  `Você é uma ferramenta de organização de memória do tratamento do paciente.

Sua função ÚNICA é organizar e resumir dados que o próprio paciente registrou.
Você NÃO analisa, diagnostica, recomenda, avalia eficácia, nem sugere mudanças.

PROIBIDO (nunca inclua):
- Diagnóstico ou avaliação médica de qualquer tipo
- Recomendação de conduta, dose ou medicamento
- Inferência de causalidade entre dose e sintoma
- Linguagem de conselho ou prescrição ("você deveria", "recomendo", "considere")
- Promessas de resultado ou afirmações sobre eficácia
- Tom motivacional, celebratório ou alarmante
- Qualquer afirmação além dos dados fornecidos

PERMITIDO (apenas isso):
- Resumir os dados registrados em linguagem simples de paciente
- Listar fatos registrados sem juízo de valor
- Sugerir tópicos factuais para mencionar na próxima consulta, baseados apenas nos dados

Idioma: português brasileiro. Tom: neutro, organizado, factual.`;

function buildUserPrompt(ctx) {
  const tc = ctx.treatment_context;
  const med = tc.medication_name ?? "medicamento";
  const dose = tc.currentDoseMg != null ? `${tc.currentDoseMg}mg` : "dose não informada";
  const week = tc.treatmentWeek != null ? `semana ${tc.treatmentWeek}` : "início não informado";
  const lastDose =
    tc.daysSinceLastDose != null ? `${tc.daysSinceLastDose} dias atrás` : "não informado";

  const dosesStr = ctx.doses
    .map((d) => `  Semana de ${String(d.weekStart).slice(0, 10)}: ${d.applied} dose(s)`)
    .join("\n");

  let weightStr;
  if (ctx.weight_points.length > 0) {
    const pts = ctx.weight_points;
    const first = pts[0];
    const last = pts[pts.length - 1];
    const delta = last.weight - first.weight;
    const deltaStr = `${delta > 0 ? "+" : ""}${delta.toFixed(1).replace(".", ",")} kg`;
    // Primeiro e último registro do HISTÓRICO COMPLETO + variação real (evita o
    // viés de só mandar os últimos pontos, que escondia a perda total do
    // tratamento). Rótulos sem "período" pra não conflitar com "últimos 30 dias".
    const overview =
      `  Primeiro registro (${String(first.date).slice(0, 10)}): ${first.weight}kg\n` +
      `  Último registro (${String(last.date).slice(0, 10)}): ${last.weight}kg\n` +
      `  Variação total (primeiro→último): ${deltaStr}`;
    const recent = pts
      .slice(-6)
      .map((w) => `  ${String(w.date).slice(0, 10)}: ${w.weight}kg`)
      .join("\n");
    weightStr = `${overview}\n  Pontos recentes:\n${recent}`;
  } else {
    weightStr = "  Nenhum peso registrado";
  }

  const symptomsStr =
    ctx.symptom_counts.length > 0
      ? ctx.symptom_counts
          .slice(0, 5)
          .map((s) => `  ${SYMPTOM_LABELS_PT[s.type] ?? s.type}: ${s.count}x`)
          .join("\n")
      : "  Nenhum sintoma registrado";

  return `Organize a memória do tratamento com base nos dados abaixo.

Período: últimos ${ctx.period_days} dias
Medicamento: ${med} ${dose} | ${week} | última dose: ${lastDose}

Doses aplicadas (por semana, últimas 8 semanas):
${dosesStr}

Evolução de peso (registro completo — independe do período de 30 dias):
${weightStr}
IMPORTANTE: Na variação de peso, reporte SEMPRE a variação TOTAL entre o primeiro e o último registro (com as datas), não apenas a dos últimos 30 dias.

Sintomas mais frequentes (últimos 30 dias):
${symptomsStr}

Gere:
1. periodSummary: resumo factual do período em linguagem simples (40-280 chars)
2. keyFacts: 2-3 fatos principais registrados, baseados nos dados acima (cada 15-120 chars)
3. consultPoints: 1-3 tópicos para mencionar na consulta, baseados APENAS nos dados (cada 20-150 chars)
4. disclaimer: use EXATAMENTE este texto: "${FIXED_DISCLAIMER}"`;
}

function buildContract(raw) {
  return { ...raw, schemaVersion: SCHEMA_VERSION, disclaimer: FIXED_DISCLAIMER };
}

function buildFallbackContract() {
  return {
    schemaVersion: SCHEMA_VERSION,
    periodSummary: FALLBACK_PERIOD_SUMMARY,
    keyFacts: FALLBACK_KEY_FACTS,
    consultPoints: FALLBACK_CONSULT_POINTS,
    disclaimer: FIXED_DISCLAIMER,
  };
}

async function upsertContract(userId, input, contract, fallbackReason) {
  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const context = {
    schemaVersion: SCHEMA_VERSION,
    prompt_version: PROMPT_VERSION,
    input,
    output: contract,
  };
  if (fallbackReason) context.fallback_reason = fallbackReason;

  const { error } = await serviceClient.from("educational_insights").upsert(
    {
      user_id: userId,
      trigger_source: "memory_summary",
      context,
      headline: "Memória do Tratamento",
      body: contract.periodSummary,
      disclaimer: contract.disclaimer,
      model: Deno.env.get(MODEL_ENV_KEY) ?? "gpt-5",
      prompt_version: PROMPT_VERSION,
    },
    { onConflict: "user_id,trigger_source" },
  );

  if (error) throw new Error(error.message ?? "Upsert failed");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  // 1. Auth
  let userId;
  let body;
  try {
    const result = await requireAuthenticatedRequest(req);
    userId = result.userId;
    body = result.body;
  } catch (err) {
    console.warn(`[memory-summary] auth_fail=${toLogMessage(err)}`);
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  // 2. Input validation
  let input;
  try {
    input = MemorySummaryInputSchema.parse(body);
  } catch (err) {
    console.warn(`[memory-summary] input_invalid=${toLogMessage(err)}`);
    return jsonResponse({ error: "Invalid input" }, 400);
  }

  // 3. OpenAI call
  const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });
  const model = Deno.env.get(MODEL_ENV_KEY) ?? "gpt-5";

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
      max_completion_tokens: 1500,
      reasoning_effort: "low",
      response_format: {
        type: "json_schema",
        json_schema: MEMORY_SUMMARY_RESPONSE_FORMAT,
      },
    });

    const raw = completion.choices?.[0]?.message?.content;
    if (typeof raw !== "string" || raw.trim().length === 0) {
      throw new Error("OpenAI returned empty content");
    }

    const parsed = JSON.parse(raw);
    const validated = memorySummaryRawSchema.parse(parsed);
    const contract = buildContract(validated);

    // 4. Safety check (defense-in-depth)
    const forbidden = containsForbiddenPatientFacingText(contract);
    if (forbidden) {
      console.warn(`[memory-summary] forbidden_text=${forbidden} → fallback`);
      const fallback = buildFallbackContract();
      assertSafePatientFacingPayload(fallback);
      await upsertContract(userId, input, fallback, "forbidden_text").catch((e) =>
        console.error(`[memory-summary] upsert_fail=${toLogMessage(e)}`),
      );
      return jsonResponse(fallback);
    }

    assertSafePatientFacingPayload(contract);

    await upsertContract(userId, input, contract).catch((e) =>
      console.error(`[memory-summary] upsert_fail=${toLogMessage(e)}`),
    );

    console.log(`[memory-summary] ok model=${model}`);
    return jsonResponse(contract);
  } catch (err) {
    console.warn(`[memory-summary] ai_fail=${toLogMessage(err)} → fallback`);
    const fallback = buildFallbackContract();
    assertSafePatientFacingPayload(fallback);
    await upsertContract(userId, input, fallback, "openai_fail").catch((e) =>
      console.error(`[memory-summary] upsert_fail=${toLogMessage(e)}`),
    );
    return jsonResponse(fallback);
  }
});

function toLogMessage(err) {
  return err instanceof Error ? err.message : String(err);
}
