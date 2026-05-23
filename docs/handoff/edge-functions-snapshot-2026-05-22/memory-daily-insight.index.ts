// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept-language",
};

const FALLBACK = { insight_text: "Sua memória será atualizada em breve.", id: null };

function buildSystemPrompt(locale: string): string {
  return `
[PLACEHOLDER — será preenchido pelo PO]
Diretrizes obrigatórias:
- Voz: segunda pessoa
- Idioma de saída: ${locale}
- Comprimento: máximo 60 palavras
- Não prescrever, não diagnosticar
- Conectar dados recentes a contexto de tratamento
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

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const token = authHeader.replace("Bearer ", "").trim();
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    if (authError || !user) return json({ error: "Unauthorized" }, 401);
    const userId = user.id;

    // Entitlement gate — free users receive static placeholder (no AI call)
    const nowISO = new Date().toISOString();
    const { data: sub } = await serviceClient
      .from("user_subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .or(`expires_date.is.null,expires_date.gt."${nowISO}"`)
      .limit(1)
      .maybeSingle();

    if (!sub) {
      return json({
        content: null,
        mode: "free_placeholder",
        placeholder_key: "dashboard.insightToday.freePlaceholder",
      });
    }

    // Profile (locale + dados clínicos do onboarding)
    const { data: profile } = await serviceClient
      .from("user_profiles")
      .select("locale, current_medication, current_dose, initial_weight, current_weight, goal_weight, treatment_start_date, main_concerns, next_appointment_date")
      .eq("user_id", userId)
      .single();
    const locale = profile?.locale ?? "pt-BR";

    // Cooldown 24h — return cached if found
    const { data: cached } = await serviceClient
      .from("memory_daily_insights")
      .select("id, insight_text, generated_at")
      .eq("user_id", userId)
      .gt("generated_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached) {
      return json({ id: cached.id, insight_text: cached.insight_text, generated_at: cached.generated_at });
    }

    // Data window: últimos 30 dias
    const windowEnd = new Date();
    const windowStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const windowStartDate = windowStart.toISOString().substring(0, 10);
    const todayDate = new Date().toISOString().slice(0, 10);

    const [dosesRes, weightsRes, symptomsRes, checkinsRes, nextVisitRes] = await Promise.all([
      serviceClient
        .from("medication_applications")
        .select("medication_name, dose, application_date, side_effects")
        .eq("user_id", userId)
        .gte("application_date", windowStart.toISOString())
        .order("application_date", { ascending: false }),
      serviceClient
        .from("weight_logs")
        .select("weight, date")
        .eq("user_id", userId)
        .gte("date", windowStartDate)
        .order("date", { ascending: false }),
      serviceClient
        .from("symptom_logs")
        .select("symptom_type, intensity, symptom_date")
        .eq("user_id", userId)
        .gte("symptom_date", windowStartDate)
        .order("symptom_date", { ascending: false }),
      serviceClient
        .from("daily_checkins")
        .select("date, symptoms, emotional_state, current_dose_mg")
        .eq("user_id", userId)
        .gte("date", windowStartDate)
        .order("date", { ascending: false }),
      // Optional: próxima consulta para contextualizar o insight
      serviceClient
        .from("medical_visits")
        .select("next_visit_date")
        .eq("user_id", userId)
        .gt("next_visit_date", todayDate)
        .order("next_visit_date", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    const userData = {
      profile: {
        current_medication: profile?.current_medication ?? null,
        current_dose: profile?.current_dose ?? null,
        initial_weight: profile?.initial_weight ?? null,
        current_weight: profile?.current_weight ?? null,
        goal_weight: profile?.goal_weight ?? null,
        treatment_start_date: profile?.treatment_start_date ?? null,
        main_concerns: profile?.main_concerns ?? [],
        next_appointment_date: profile?.next_appointment_date ?? null,
      },
      doses: dosesRes.data ?? [],
      weights: weightsRes.data ?? [],
      symptoms: symptomsRes.data ?? [],
      checkins: checkinsRes.data ?? [],
      next_visit: nextVisitRes.data?.next_visit_date ?? null,
    };

    // Call OpenAI (premium path)
    let insightText: string;
    try {
      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: Deno.env.get("DAILY_INSIGHT_MODEL") || "gpt-5-nano",
          messages: [
            { role: "system", content: buildSystemPrompt(locale) },
            { role: "user", content: `Dados clínicos dos últimos 30 dias: ${JSON.stringify(userData)}` },
          ],
          temperature: 0.4,
          max_completion_tokens: 150,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(`OpenAI: ${data.error.message}`);
      insightText = data.choices[0].message.content.trim();
    } catch (aiErr) {
      console.error("[memory-daily-insight] OpenAI error:", aiErr);
      return json({ ...FALLBACK, generated_at: new Date().toISOString() });
    }

    // Persist
    const { data: saved, error: insertErr } = await serviceClient
      .from("memory_daily_insights")
      .insert({
        user_id: userId,
        insight_text: insightText,
        data_window_start: windowStart.toISOString(),
        data_window_end: windowEnd.toISOString(),
      })
      .select("id, insight_text, generated_at")
      .single();

    if (insertErr) {
      console.error("[memory-daily-insight] insert error:", insertErr);
      return json({ ...FALLBACK, insight_text: insightText, generated_at: new Date().toISOString() });
    }

    return json({ id: saved.id, insight_text: saved.insight_text, generated_at: saved.generated_at });
  } catch (err) {
    console.error("[memory-daily-insight] unexpected error:", err);
    return json({ ...FALLBACK, generated_at: new Date().toISOString() });
  }
});
