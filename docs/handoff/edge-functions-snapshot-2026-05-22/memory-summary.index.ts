// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

interface TemplateSummaryInput {
  daysInTreatment: number | null;
  medication: string | null;
  currentDoseMg: number | null;
  weightDeltaKg: number | null;
  weightDeltaPct: number | null;
  appliedCount: number;
  expectedCount: number;
  adherencePct: number | null;
  topSymptoms: Array<{ name: string; count: number }>;
  lastVisit: { date: string; doctor: string | null } | null;
  nextVisit: { date: string } | null;
  locale: "pt-BR" | "en";
}

function buildTemplateSummary(input: TemplateSummaryInput): string {
  const pt = input.locale === "pt-BR";
  const sections: string[] = [];

  const treatmentLines: string[] = [];
  if (input.daysInTreatment != null) {
    treatmentLines.push(
      pt
        ? `Você está em tratamento há ${input.daysInTreatment} dias.`
        : `You have been in treatment for ${input.daysInTreatment} days.`,
    );
  }
  if (input.medication) {
    const dosePart = input.currentDoseMg != null
      ? (pt ? ` na dose de ${input.currentDoseMg}mg` : ` at ${input.currentDoseMg}mg`)
      : "";
    treatmentLines.push(
      pt
        ? `Medicação atual: ${input.medication}${dosePart}.`
        : `Current medication: ${input.medication}${dosePart}.`,
    );
  }
  if (treatmentLines.length > 0) sections.push(treatmentLines.join(" "));

  if (input.weightDeltaKg != null) {
    const sign = input.weightDeltaKg > 0 ? "+" : "";
    const pctPart = input.weightDeltaPct != null ? ` (${sign}${input.weightDeltaPct}%)` : "";
    sections.push(
      pt
        ? `Variação de peso: ${sign}${input.weightDeltaKg}kg${pctPart}.`
        : `Weight change: ${sign}${input.weightDeltaKg}kg${pctPart}.`,
    );
  }

  const adherenceLines: string[] = [];
  if (input.appliedCount > 0) {
    adherenceLines.push(
      pt
        ? `Aplicações registradas: ${input.appliedCount}${input.expectedCount > 0 ? ` de ${input.expectedCount} esperadas` : ""}.`
        : `Recorded applications: ${input.appliedCount}${input.expectedCount > 0 ? ` of ${input.expectedCount} expected` : ""}.`,
    );
  }
  if (input.adherencePct != null) {
    adherenceLines.push(pt ? `Adesão: ${input.adherencePct}%.` : `Adherence: ${input.adherencePct}%.`);
  }
  if (adherenceLines.length > 0) sections.push(adherenceLines.join(" "));

  if (input.topSymptoms.length > 0) {
    const list = input.topSymptoms.map((s) => `${s.name} (${s.count}×)`).join(", ");
    sections.push(
      pt
        ? `Principais sintomas nos últimos 30 dias: ${list}.`
        : `Top symptoms in the last 30 days: ${list}.`,
    );
  }

  const visitLines: string[] = [];
  if (input.lastVisit) {
    const doctorPart = input.lastVisit.doctor
      ? (pt ? ` com ${input.lastVisit.doctor}` : ` with ${input.lastVisit.doctor}`)
      : "";
    visitLines.push(
      pt
        ? `Última consulta${doctorPart}: ${input.lastVisit.date}.`
        : `Last visit${doctorPart}: ${input.lastVisit.date}.`,
    );
  }
  if (input.nextVisit) {
    visitLines.push(
      pt
        ? `Próxima consulta prevista: ${input.nextVisit.date}.`
        : `Next appointment: ${input.nextVisit.date}.`,
    );
  }
  if (visitLines.length > 0) sections.push(visitLines.join(" "));

  return sections.join("\n\n");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept-language",
};

const FALLBACK_CONTENT = {
  status: null,
  peso: null,
  adesao: null,
  sintomas: null,
  perguntas: [],
};

function buildSystemPrompt(locale: string): string {
  return `
[PLACEHOLDER — será preenchido pelo PO]
Diretrizes obrigatórias:
- Voz: segunda pessoa, conversacional, primeira pessoa do paciente quando fizer sentido
- Idioma de saída: ${locale}
- 5 seções fixas: status / peso / adesao / sintomas / perguntas
- Cada seção máximo 3 parágrafos
- Não prescrever, não diagnosticar
- Sem alarmismo, sem jargão clínico desnecessário
- Retornar JSON com chaves: status, peso, adesao, sintomas, perguntas
`.trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Parse body
    let body: { mode?: string } = {};
    try {
      body = await req.json();
    } catch (_) { /* empty body */ }

    const mode = body.mode;
    if (!["template", "skeleton", "full"].includes(mode as string)) {
      return json({ error: "mode must be 'template', 'skeleton' or 'full'" }, 400);
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Auth
    const token = authHeader.replace("Bearer ", "").trim();
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    if (authError || !user) return json({ error: "Unauthorized" }, 401);
    const userId = user.id;

    // Entitlement check + cooldown 24h — only for mode=full
    if (mode === "full") {
      const { data: sub } = await serviceClient
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "active")
        .or(`expires_date.is.null,expires_date.gt."${new Date().toISOString().replace(/\.\d+Z$/, "Z")}"`)
        .limit(1)
        .maybeSingle();

      if (!sub) {
        return json({ error: "premium_required" }, 403);
      }

      const { data: cached } = await serviceClient
        .from("memory_summaries")
        .select("id, content, mode, generated_at")
        .eq("user_id", userId)
        .eq("mode", mode)
        .gt("generated_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cached) {
        const nextAvailableAt = new Date(
          new Date(cached.generated_at).getTime() + 24 * 60 * 60 * 1000,
        ).toISOString();
        return json({
          id: cached.id,
          content: cached.content,
          mode: cached.mode,
          generated_at: cached.generated_at,
          next_available_at: nextAvailableAt,
        });
      }
    }

    // Fetch common data (all modes)
    const [profileRes, dosesRes, weightsRes, symptomsRes, checkinsRes] = await Promise.all([
      serviceClient
        .from("user_profiles")
        .select("initial_weight, current_weight, treatment_start_date, current_medication, current_dose, locale")
        .eq("user_id", userId)
        .single(),
      serviceClient
        .from("medication_applications")
        .select("medication_name, dose, application_date, days_until_next_dose")
        .eq("user_id", userId)
        .order("application_date", { ascending: true }),
      serviceClient
        .from("weight_logs")
        .select("weight, date")
        .eq("user_id", userId)
        .order("date", { ascending: true }),
      serviceClient
        .from("symptom_logs")
        .select("symptom_type, intensity, symptom_date")
        .eq("user_id", userId)
        .gte("symptom_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10))
        .order("symptom_date", { ascending: false }),
      serviceClient
        .from("daily_checkins")
        .select("date, symptoms, emotional_state, current_dose_mg")
        .eq("user_id", userId)
        .order("date", { ascending: false }),
    ]);

    const profile = profileRes.data;
    const doses = dosesRes.data ?? [];
    const weights = weightsRes.data ?? [];
    const symptoms = symptomsRes.data ?? [];
    const locale = profile?.locale ?? "pt-BR";

    // Calculate base metrics
    const now = new Date();
    const treatmentStart = profile?.treatment_start_date ? new Date(profile.treatment_start_date) : null;
    const daysInTreatment = treatmentStart
      ? Math.floor((now.getTime() - treatmentStart.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const doseHistory = doses.reduce<{ medication: string; dose: number; from: string }[]>((acc, d) => {
      const last = acc[acc.length - 1];
      if (!last || last.medication !== d.medication_name || last.dose !== d.dose) {
        acc.push({ medication: d.medication_name, dose: d.dose, from: d.application_date });
      }
      return acc;
    }, []);

    const initialWeight = profile?.initial_weight ?? null;
    const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : (profile?.current_weight ?? null);
    const deltaKg = initialWeight && latestWeight ? Number((latestWeight - initialWeight).toFixed(2)) : null;
    const deltaPct = initialWeight && deltaKg !== null ? Number(((deltaKg / initialWeight) * 100).toFixed(1)) : null;
    const weeklyPace = daysInTreatment && daysInTreatment > 0 && deltaKg !== null
      ? Number((deltaKg / (daysInTreatment / 7)).toFixed(2))
      : null;

    const applied = doses.length;
    const avgInterval = doses.length > 0
      ? doses.reduce((sum, d) => sum + (d.days_until_next_dose ?? 7), 0) / doses.length
      : 7;
    const expected = daysInTreatment ? Math.floor(daysInTreatment / avgInterval) : null;
    const missed = expected !== null ? Math.max(0, expected - applied) : null;

    let delays = 0;
    for (let i = 1; i < doses.length; i++) {
      const prev = new Date(doses[i - 1].application_date);
      const curr = new Date(doses[i].application_date);
      const actualDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      const scheduledDays = doses[i - 1].days_until_next_dose ?? 7;
      if (actualDays > scheduledDays + 1) delays++;
    }

    const symptomCounts: Record<string, number> = {};
    for (const s of symptoms) {
      symptomCounts[s.symptom_type] = (symptomCounts[s.symptom_type] ?? 0) + 1;
    }
    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));

    const skeletonContent = {
      status: {
        days_in_treatment: daysInTreatment,
        current_medication: profile?.current_medication ?? null,
        current_dose: profile?.current_dose ?? null,
        dose_history: doseHistory,
      },
      peso: {
        initial: initialWeight,
        current: latestWeight,
        delta_kg: deltaKg,
        delta_pct: deltaPct,
        weekly_pace: weeklyPace,
      },
      adesao: { applied, expected, missed, delays },
      sintomas: topSymptoms,
      perguntas: [],
    };

    // mode=skeleton: retrocompat — structured object, no cooldown, no AI, no persist
    if (mode === "skeleton") {
      return json({
        id: null,
        content: skeletonContent,
        mode,
        generated_at: new Date().toISOString(),
      });
    }

    // mode=template: zero AI, returns formatted string with optional visit context
    if (mode === "template") {
      const { data: latestVisit } = await serviceClient
        .from("medical_visits")
        .select("visit_date, doctor_name, next_visit_date")
        .eq("user_id", userId)
        .order("visit_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      const adherencePct = expected && expected > 0 ? Math.round((applied / expected) * 100) : null;

      const content = buildTemplateSummary({
        daysInTreatment,
        medication: profile?.current_medication ?? null,
        currentDoseMg: profile?.current_dose ?? null,
        weightDeltaKg: deltaKg,
        weightDeltaPct: deltaPct,
        appliedCount: applied,
        expectedCount: expected ?? 0,
        adherencePct,
        topSymptoms: topSymptoms.map((s) => ({ name: s.type, count: s.count })),
        lastVisit: latestVisit ? { date: latestVisit.visit_date, doctor: latestVisit.doctor_name } : null,
        nextVisit: latestVisit?.next_visit_date ? { date: latestVisit.next_visit_date } : null,
        locale: locale as "pt-BR" | "en",
      });

      return json({ content, mode, generated_at: new Date().toISOString() });
    }

    // mode=full: fetch medical_visits structured fields only (NO doctor_notes, NO attachments)
    const { data: visitsData } = await serviceClient
      .from("medical_visits")
      .select("visit_date, current_dose_mg, next_visit_date, recommendations")
      .eq("user_id", userId)
      .order("visit_date", { ascending: false })
      .limit(5);

    const fullData = {
      ...skeletonContent,
      medical_visits: (visitsData ?? []).map((v) => ({
        visit_date: v.visit_date,
        current_dose_mg: v.current_dose_mg,
        next_visit_date: v.next_visit_date,
        recommendations: (v.recommendations ?? []).map((r: any) => ({
          type: r.type,
          when: r.when,
        })),
      })),
    };

    let content: object;
    try {
      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: Deno.env.get("SUMMARY_MODEL") || "gpt-5-mini",
          messages: [
            { role: "system", content: buildSystemPrompt(locale) },
            {
              role: "user",
              content: `Dados estruturados do paciente: ${JSON.stringify(fullData)}`,
            },
          ],
          reasoning_effort: "minimal",
          max_completion_tokens: 3000,
          response_format: { type: "json_object" },
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(`OpenAI: ${data.error.message}`);
      content = JSON.parse(data.choices[0].message.content);
    } catch (aiErr) {
      console.error("[memory-summary] OpenAI error:", aiErr);
      return json({
        id: null,
        content: { ...FALLBACK_CONTENT, _fallback: true },
        mode,
        generated_at: new Date().toISOString(),
      });
    }

    // Persist full summary
    const { data: saved, error: insertErr } = await serviceClient
      .from("memory_summaries")
      .insert({ user_id: userId, mode, content })
      .select("id, content, mode, generated_at")
      .single();

    if (insertErr) {
      console.error("[memory-summary] insert error:", insertErr);
      return json({ id: null, content, mode, generated_at: new Date().toISOString() });
    }

    return json({
      id: saved.id,
      content: saved.content,
      mode: saved.mode,
      generated_at: saved.generated_at,
    });
  } catch (err) {
    console.error("[memory-summary] unexpected error:", err);
    return json({
      id: null,
      content: { ...FALLBACK_CONTENT, _fallback: true },
      mode: "skeleton",
      generated_at: new Date().toISOString(),
    });
  }
});
