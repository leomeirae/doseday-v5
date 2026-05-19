// @ts-nocheck
/**
 * DOSE DAY - GENERATE MEDICAL REPORT
 * Phase 6: Backend Infrastructure
 *
 * Purpose: Generate comprehensive medical report with PDF
 * Frequency: Max 1 per week (7-day cooldown)
 * Target table: medical_reports
 */

import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept-language",
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 0. Parse body first (we need it for both auth override and parameters)
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // Empty body is fine
    }

    // Extract JWT or Service Key
    const authHeader = req.headers.get("Authorization");
    
    // Create Supabase clients
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    let userId: string;
    let isServiceRole = false;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();

      // Check if the token is the exact env key
      if (token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
        isServiceRole = true;
      } else {
        // Since Kong (Supabase API Gateway) verifies the JWT signature before invoking the function,
        // we can safely parse the payload to check for the service_role claim.
        try {
          const payloadBase64 = token.split(".")[1];
          if (payloadBase64) {
            const payload = JSON.parse(atob(payloadBase64));
            if (payload.role === "service_role") {
              isServiceRole = true;
            }
          }
        } catch (e) {
          // Ignore parse errors, let it fall through to standard auth
        }
      }

      if (isServiceRole) {
        if (!body.user_id) {
          throw new Error("Missing user_id in body for service role execution");
        }
        userId = body.user_id;
        console.log(
          `[System] Generating report for user ${userId} via Scheduler`,
        );
      } else {
        // Standard User JWT Auth
        const userClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          { global: { headers: { Authorization: authHeader } } },
        );
        const {
          data: { user },
          error: authError,
        } = await userClient.auth.getUser(token);
        if (authError || !user) {
          throw new Error("Unauthorized");
        }
        userId = user.id;
      }
    } else if (body.user_id) {
      // Fallback: No auth header but user_id in body (scheduler/internal calls)
      userId = body.user_id;
      isServiceRole = true;
      console.log(
        `[System] Generating report for user ${userId} via internal call (no auth header)`,
      );
    } else {
      throw new Error("Missing Authorization header and user_id in body");
    }

    // 1. Check cooldown (6 days - allows for time skew in weekly cron)
    // HARDENING: Use Calendar Date comparison (YYYY-MM-DD) to ignore time-of-day drift
    const today = new Date();
    const cooldownThresholdDate = new Date(today);
    cooldownThresholdDate.setDate(today.getDate() - 6);
    cooldownThresholdDate.setHours(0, 0, 0, 0); // Reset time to start of day

    const { data: lastReport, error: checkError } = await serviceClient
      .from("medical_reports")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)
      .limit(1)
      .single();

    if (!checkError && lastReport) {
      const lastReportDate = new Date(lastReport.created_at);
      // Normalize last report to start of its day for fair comparison
      const lastReportDay = new Date(lastReportDate);
      lastReportDay.setHours(0, 0, 0, 0);

      if (lastReportDay > cooldownThresholdDate) {
        // Calculate next available based on the actual last report date + 7 days
        const nextAvailable = new Date(lastReportDate);
        nextAvailable.setDate(nextAvailable.getDate() + 7);

        // Fetch the full existing report to return (NO AI CALL)
        const { data: existingReport, error: fetchError } = await serviceClient
          .from("medical_reports")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (fetchError || !existingReport) {
          return new Response(
            JSON.stringify({
              error: "Cooldown active",
              message: "Você gerou um relatório recentemente",
              next_available: nextAvailable.toISOString(),
              days_remaining: Math.ceil(
                (nextAvailable.getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        // Return the cached report with metadata
        return new Response(
          JSON.stringify({
            cached: true,
            report_id: existingReport.id,
            period: {
              start: existingReport.period_start,
              end: existingReport.period_end,
            },
            summary: existingReport.report_data?.summary,
            clinical_summary: existingReport.clinical_summary,
            report_data: existingReport.report_data,
            created_at: existingReport.created_at,
            next_available: nextAvailable.toISOString(),
            days_remaining: Math.ceil(
              (nextAvailable.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          }),
          {
            status: 200, // 200 OK instead of 429 - we're returning useful data
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // 2. Get period from request body (default 7 days)
    // body is already parsed above

    const periodDays = body.period_days || 7;
    const startDateObj = new Date();
    startDateObj.setDate(startDateObj.getDate() - periodDays);
    const periodStart = startDateObj.toISOString().split("T")[0];
    const periodEnd = new Date().toISOString().split("T")[0];

    // 3. Fetch all user data
    const [profile, doses, weights, checkins] = await Promise.all([
      serviceClient
        .from("user_profiles")
        .select(
          "full_name, initial_weight, goal_weight, treatment_start_date, doctor_name, age, biological_sex, gender_custom",
        )
        .eq("user_id", userId)
        .single(),

      serviceClient
        .from("medication_applications")
        .select(
          "application_date, medication_name, dose, injection_site, notes",
        )
        .eq("user_id", userId)
        .gte("application_date", periodStart)
        .order("application_date", { ascending: true }),

      serviceClient
        .from("weight_logs")
        .select("date, weight")
        .eq("user_id", userId)
        .gte("date", periodStart)
        .order("date", { ascending: true }),

      serviceClient
        .from("daily_checkins")
        .select(
          "date, has_adverse_reaction, symptoms, symptom_details, details, data_quality_score, symptom_triggers, days_since_last_dose, notes",
        )
        .eq("user_id", userId)
        .gte("date", periodStart)
        .order("date", { ascending: true }),

    ]);

    // 4. Validate minimum data (at least 7 days)
    const totalDataDays = Math.max(
      doses.data?.length || 0,
      weights.data?.length || 0,
      checkins.data?.length || 0,
    );

    // NOTE: Minimum data requirement removed to allow reports with any amount of data
    // The AI will handle insufficient data gracefully via the prompt instructions

    // 5. Calculate summary metrics
    // Use profile.initial_weight as the absolute baseline from onboarding
    const initialWeight = profile.data?.initial_weight || 0;

    let summary = {
      initial_weight: initialWeight, // From onboarding (absolute baseline)
      period_start_weight: 0, // First weight in this report period
      current_weight: 0,
      total_weight_change: 0, // From initial_weight (absolute)
      period_weight_change: 0, // From period start (temporal)
      weight_change_percent: 0,
      goal_weight: profile.data?.goal_weight || 0,
      weight_to_goal: 0,
      avg_loss_per_week: 0,
      rapid_weight_loss_alert: false, // BUG 4: Flag for >2kg/week loss
    };

    if (weights.data && weights.data.length > 0) {
      const firstWeight = weights.data[0].weight;
      const lastWeight = weights.data[weights.data.length - 1].weight;
      const periodChange = lastWeight - firstWeight;
      const weeks = periodDays / 7;

      summary.period_start_weight = firstWeight;
      summary.current_weight = lastWeight;
      summary.period_weight_change = periodChange;

      // Calculate total change from initial_weight if available
      if (initialWeight > 0) {
        summary.total_weight_change = lastWeight - initialWeight;
        summary.weight_change_percent =
          (summary.total_weight_change / initialWeight) * 100;
      } else if (firstWeight > 0) {
        // Fallback if no initial_weight in profile
        summary.total_weight_change = periodChange;
        summary.weight_change_percent = (periodChange / firstWeight) * 100;
      } else {
        // Safety: avoid division by zero
        summary.total_weight_change = 0;
        summary.weight_change_percent = 0;
      }

      summary.weight_to_goal = lastWeight - (profile.data?.goal_weight || 0);
      // Safety: avoid division by zero or NaN
      summary.avg_loss_per_week =
        weeks > 0 ? Math.round((Math.abs(periodChange) / weeks) * 10) / 10 : 0;
      // BUG 4 FIX: Alert if losing more than 2kg per week
      summary.rapid_weight_loss_alert =
        weeks > 0 ? Math.abs(periodChange / weeks) > 2.0 : false;
    } else if (initialWeight > 0) {
      summary.period_start_weight = initialWeight;
      summary.current_weight = initialWeight;
    }

    // 6. Process symptoms with HYBRID PARSER (Legacy + New JSONB)
    const symptomMap: Record<
      string,
      {
        frequency: number;
        total_days: number;
        max_intensity: string;
        details: string[];
      }
    > = {};
    let daysWithReaction = 0;

    // Translation Helpers for Prompt Context
    const translateIntensity = (i: string) =>
      ({ mild: "leve", moderate: "moderada", severe: "forte" })[i] || i;
    const translateTiming = (t: string) =>
      ({ early: "pós-dose", mid: "horas depois", late: "dia seguinte" })[t] ||
      t;

    if (checkins.data) {
      checkins.data.forEach((checkin) => {
        if (checkin.has_adverse_reaction) daysWithReaction++;

        const processSymptom = (name: string, detail?: any) => {
          if (!symptomMap[name]) {
            symptomMap[name] = {
              frequency: 0,
              total_days: periodDays,
              max_intensity: "unknown",
              details: [],
            };
          }
          symptomMap[name].frequency++;

          if (detail) {
            // Normalize intensity to lowercase (DB stores UPPERCASE: "MILD", "MODERATE", "SEVERE")
            const intensity = (detail.intensity || "").toLowerCase();
            const currentMax = symptomMap[name].max_intensity;
            if (intensity === "severe")
              symptomMap[name].max_intensity = "severe";
            else if (intensity === "moderate" && currentMax !== "severe")
              symptomMap[name].max_intensity = "moderate";
            else if (intensity === "mild" && currentMax === "unknown")
              symptomMap[name].max_intensity = "mild";

            // Add detail string if significant
            if (
              intensity === "severe" ||
              (detail.functional_impact || "").toLowerCase() === "severe"
            ) {
              symptomMap[name].details.push(
                `${translateIntensity(intensity)} (${translateTiming(detail.onset_timing || "")})` +
                  ((detail.functional_impact || "").toLowerCase() === "severe"
                    ? " - AFETOU ROTINA"
                    : ""),
              );
            }
          }
        };

        // Priority 1: symptom_details array (structured, if populated)
        if (
          checkin.symptom_details &&
          Array.isArray(checkin.symptom_details) &&
          checkin.symptom_details.length > 0
        ) {
          checkin.symptom_details.forEach((d: any) =>
            processSymptom(d.name, d),
          );
        }
        // Priority 2: details JSONB object (current app format)
        // Format: {"nausea": {"id": "nausea", "intensity": "MILD"}, ...}
        else if (
          checkin.details &&
          typeof checkin.details === "object" &&
          !Array.isArray(checkin.details) &&
          Object.keys(checkin.details).length > 0
        ) {
          Object.entries(checkin.details).forEach(([name, detail]: [string, any]) => {
            processSymptom(name, detail);
          });
        }
        // Priority 3: Legacy symptoms array (names only, no intensity)
        else if (checkin.symptoms && Array.isArray(checkin.symptoms)) {
          checkin.symptoms.forEach((s: string) => processSymptom(s));
        }
      });
    }

    const totalCheckinDays = checkins.data?.length || 0;
    const reactionPercentage =
      totalCheckinDays > 0
        ? Math.round((daysWithReaction / totalCheckinDays) * 100)
        : 0;

    // 7. Collect notes
    const notes =
      checkins.data
        ?.filter((c) => c.notes && c.notes.trim().length > 0)
        .map((c) => c.notes) || [];

    // 8. Calculate adherence using interval-based compliance (BUG 1 FIX)
    let adherenceRate = 0;
    let dosesOnTime = 0;
    let totalIntervals = 0;
    let averageIntervalDays = 0;

    if (doses.data && doses.data.length >= 2) {
      // Sort doses chronologically (ascending by date)
      const sortedDoses = [...doses.data].sort(
        (a, b) =>
          new Date(a.application_date).getTime() -
          new Date(b.application_date).getTime(),
      );

      // Calculate intervals between consecutive doses
      const intervals: number[] = [];
      for (let i = 1; i < sortedDoses.length; i++) {
        const current = new Date(sortedDoses[i].application_date);
        const previous = new Date(sortedDoses[i - 1].application_date);
        const daysDiff = Math.floor(
          (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24),
        );
        intervals.push(daysDiff);
      }

      // On-time = interval between 6-8 days (weekly dose with tolerance)
      dosesOnTime = intervals.filter((i) => i >= 6 && i <= 8).length;
      totalIntervals = intervals.length;
      adherenceRate =
        totalIntervals > 0
          ? Math.round((dosesOnTime / totalIntervals) * 100)
          : 0;
      averageIntervalDays =
        totalIntervals > 0
          ? Math.round(
              (intervals.reduce((a, b) => a + b, 0) / totalIntervals) * 10,
            ) / 10
          : 0;
    } else if (doses.data && doses.data.length === 1) {
      // Single dose in period — for weekly medications (GLP-1), 
      // 1 dose in a 7-day window = full adherence
      const expectedDosesInPeriod = Math.ceil(periodDays / 7);
      if (expectedDosesInPeriod <= 1) {
        adherenceRate = 100; // 1 dose covers the full weekly period
      } else {
        // Period longer than 7 days but only 1 dose = partial adherence
        adherenceRate = Math.round((1 / expectedDosesInPeriod) * 100);
      }
      totalIntervals = 0;
    }

    // 9. Prepare report data structure
    const reportData = {
      summary,
      doses:
        doses.data?.map((d) => ({
          date: d.application_date ? d.application_date.substring(0, 10) : d.application_date,
          dose_mg: d.dose,
          medication: d.medication_name,
          notes: d.notes,
        })) || [],
      weight_logs:
        weights.data?.map((w) => ({
          date: w.date,
          weight: w.weight,
        })) || [],
      symptoms: symptomMap,
      insights: [],
      notes,
      metadata: {
        total_days: periodDays,
        checkin_count: checkins.data?.length || 0,
        adherence_rate: Math.round(adherenceRate),
        doses_on_time: dosesOnTime,
        total_intervals: totalIntervals,
        average_interval_days: averageIntervalDays,
        total_doses: doses.data?.length || 0,
      },
      // BUG 3 FIX: Tolerability section with accurate reaction tracking
      tolerability: {
        days_with_reaction: daysWithReaction,
        total_checkin_days: totalCheckinDays,
        reaction_percentage: reactionPercentage,
      },
      // Symptom triggers aggregation
      triggers: (() => {
        const triggerMap: Record<string, number> = {};
        checkins.data?.forEach((c) => {
          if (c.symptom_triggers && Array.isArray(c.symptom_triggers)) {
            c.symptom_triggers.forEach((t: string) => {
              triggerMap[t] = (triggerMap[t] || 0) + 1;
            });
          }
        });
        return triggerMap;
      })(),
      // Temporal correlation: symptoms by days_since_last_dose
      temporal_correlation: (() => {
        const correlation: Record<number, { symptoms: string[]; count: number }> = {};
        checkins.data?.forEach((c) => {
          const day = c.days_since_last_dose;
          if (day !== null && day !== undefined && c.has_adverse_reaction) {
            if (!correlation[day]) {
              correlation[day] = { symptoms: [], count: 0 };
            }
            correlation[day].count++;
            const daySymptoms = c.symptoms || Object.keys(c.details || {});
            daySymptoms.forEach((s: string) => {
              if (!correlation[day].symptoms.includes(s)) {
                correlation[day].symptoms.push(s);
              }
            });
          }
        });
        return correlation;
      })(),
      // Injection details from doses
      injection_sites: (() => {
        const siteMap: Record<string, number> = {};
        doses.data?.forEach((d) => {
          if (d.injection_site) {
            siteMap[d.injection_site] = (siteMap[d.injection_site] || 0) + 1;
          }
        });
        return siteMap;
      })(),
    };

    // 10. Generate clinical summary using AI
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const clinicalPrompt = `
      ROLE: Revisor Clínico Sênior para Relatórios Médicos (Dose Day)
      LANGUAGE: PORTUGUESE (PT-BR) - STRICTLY.
      CONTEXT: Você está escrevendo um resumo clínico estruturado para o médico do paciente.
      
      PATIENT DATA:
      ${JSON.stringify(
        {
          patient: profile.data?.full_name,
          treatment_period: `${periodStart} to ${periodEnd}`,
          summary: reportData.summary,
          symptoms_analysis: symptomMap,
          tolerability: reportData.tolerability,
          adherence: {
            rate: reportData.metadata.adherence_rate,
            total_doses: reportData.metadata.total_doses,
            doses_on_time: reportData.metadata.doses_on_time,
            average_interval_days: reportData.metadata.average_interval_days,
          },
          triggers: reportData.triggers,
          temporal_correlation: reportData.temporal_correlation,
          injection_sites: reportData.injection_sites,
        },
        null,
        2,
      )}
      
      CRITICAL INSTRUCTIONS:
      1. **LANGUAGE**: ALL OUTPUT MUST BE STRICTLY IN BRAZILIAN PORTUGUESE (pt-BR).
      2. **TERMINOLOGY TRANSLATION (MANDATORY)**:
         - The input data contains English technical terms ('mild', 'moderate', 'severe', 'early', 'late').
         - YOU MUST TRANSLATE THESE CONTEXTUALLY:
           * 'mild' -> 'leve'
           * 'moderate' -> 'moderada'
           * 'severe' -> 'forte', 'intensa' ou 'severa'
           * 'early' -> 'logo após a dose'
           * 'mid' -> 'horas depois'
           * 'late' -> 'no dia seguinte'
         - **FORBIDDEN**: NEVER write "dor severe", "náusea mild", or "reaction moderate" in the final text.
      3. **ALERTS**: If a symptom has 'max_intensity': 'severe' or 'AFETOU ROTINA', you MUST flag it in 'clinical_alerts' or 'tolerability'.
      4. **INSUFFICIENT DATA**: If data is missing, write "Análise pendente por falta de dados" (in PT-BR).

      OUTPUT FORMAT (JSON Only):
      {
        "treatment_overview": {
          "summary": "1-2 frases em PT-BR sobre medicação e aderência.",
          "adherence_assessment": "good" | "moderate" | "poor" | "pending",
          "interval_consistency": "Texto em PT-BR sobre intervalo entre doses"
        },
        "clinical_outcomes": {
          "weight_summary": "1-2 frases em PT-BR sobre evolução do peso.",
          "trajectory": "losing" | "stable" | "gaining" | "pending"
        },
        "tolerability": {
          "summary": "2-3 frases em PT-BR sobre reações adversas, INCLUINDO intensidade (leve/moderada/forte) de cada sintoma.",
          "concern_level": "none" | "mild" | "moderate" | "concerning" | "pending",
          "top_symptoms": [{"name": "Nome em PT-BR", "frequency": "Xd/7d", "max_intensity": "leve|moderada|forte"}]
        },
        "trigger_analysis": {
          "summary": "1-2 frases sobre gatilhos alimentares/comportamentais identificados. Se nenhum: null.",
          "top_triggers": [{"trigger": "Nome traduzido em PT-BR", "frequency": "N"}]
        },
        "temporal_pattern": {
          "summary": "1-2 frases sobre padrão temporal de sintomas pós-dose (ex: pico em D+0/D+1, alívio D+3).",
          "peak_day": "D+X (dia pós-dose com mais sintomas)"
        },
        "clinical_alerts": [
          {"type": "info" | "warning" | "critical", "message": "Texto do alerta em PT-BR"}
        ],
        "recommendations": "Opcional. Sugestão clínica em PT-BR ou null."
      }

      ADDITIONAL TRANSLATION RULES FOR TRIGGERS:
      - "fatty_food" -> "alimentos gordurosos"
      - "large_portion" -> "porções grandes"
      - "sweet_excess" -> "excesso de doces"
      - "alcohol" -> "consumo de álcool"
      - "poor_water" -> "baixa hidratação"
      - "spicy_food" -> "alimentos condimentados"
      - "dairy" -> "laticínios"
      - "caffeine" -> "cafeína"
      Traduza quaisquer outros triggers para PT-BR contextualmente.
    `;

    // Retry logic for OpenAI API (handles 429 rate limit)
    const callOpenAI = async (retries = 3, delay = 1000): Promise<any> => {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: clinicalPrompt },
              {
                role: "user",
                content: `Generate structured clinical summary for this patient data:\n${JSON.stringify(reportData)}`,
              },
            ],
            temperature: 0.2,
            max_tokens: 800,
            response_format: { type: "json_object" },
          }),
        },
      );

      const data = await response.json();

      if (response.status === 429 && retries > 0) {
        console.warn(
          `OpenAI rate limit hit, retrying in ${delay}ms... (${retries} retries left)`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return callOpenAI(retries - 1, delay * 2); // Exponential backoff
      }

      if (data.error) {
        console.error("OpenAI Error:", data.error);
        throw new Error(`AI summary generation failed: ${data.error.message}`);
      }

      return data;
    };

    const aiData = await callOpenAI();

    let clinicalSummary = aiData.choices[0].message.content;

    // ============ BUG 7 FIX: FACT-CHECK PÓS-IA ============
    // Garante que a IA não contradiz dados calculados
    try {
      const aiResult =
        typeof clinicalSummary === "string"
          ? JSON.parse(clinicalSummary)
          : clinicalSummary;

      // CHECK 1: Aderência — corrigir assessment se inconsistente
      if (aiResult.treatment_overview?.adherence_assessment) {
        // Single dose with full adherence — force "good" if AI says "pending"
        if (
          adherenceRate === 100 &&
          reportData.metadata.total_doses === 1 &&
          aiResult.treatment_overview.adherence_assessment === "pending"
        ) {
          aiResult.treatment_overview.adherence_assessment = "good";
          console.warn(
            '[FACT-CHECK] Corrigido: IA disse "pending" mas dose única = aderência 100%',
          );
        }

        if (
          adherenceRate < 50 &&
          aiResult.treatment_overview.adherence_assessment === "good"
        ) {
          aiResult.treatment_overview.adherence_assessment = "poor";
          console.warn(
            '[FACT-CHECK] Corrigido: IA disse "good" mas aderência é',
            adherenceRate + "%",
          );
        } else if (
          adherenceRate < 75 &&
          aiResult.treatment_overview.adherence_assessment === "good"
        ) {
          aiResult.treatment_overview.adherence_assessment = "moderate";
          console.warn(
            '[FACT-CHECK] Corrigido: IA disse "good" mas aderência é',
            adherenceRate + "%",
          );
        }
      }

      // CHECK 2: Alerta de perda rápida — forçar se dados exigem
      if (summary.rapid_weight_loss_alert && aiResult.clinical_alerts) {
        const hasWeightAlert = aiResult.clinical_alerts.some(
          (a: any) =>
            a.message?.toLowerCase().includes("peso") ||
            a.message?.toLowerCase().includes("weight") ||
            a.message?.toLowerCase().includes("perda"),
        );
        if (!hasWeightAlert) {
          aiResult.clinical_alerts.push({
            type: "warning",
            message: `Taxa de perda de peso acima de 2kg/semana (${summary.avg_loss_per_week}kg/sem). Avaliação médica recomendada.`,
          });
          console.warn(
            "[FACT-CHECK] Adicionado: Alerta de perda rápida ausente na resposta da IA",
          );
        }
      }

      // CHECK 3: Tolerabilidade — corrigir se IA ignora reações reportadas
      if (
        aiResult.tolerability?.concern_level === "none" &&
        daysWithReaction > 0
      ) {
        aiResult.tolerability.concern_level =
          daysWithReaction >= 3 ? "moderate" : "mild";
        console.warn(
          '[FACT-CHECK] Corrigido: IA disse "none" mas há',
          daysWithReaction,
          "dias com reação",
        );
      }

      // Sobrescrever clinicalSummary com versão corrigida
      clinicalSummary = JSON.stringify(aiResult);
    } catch (factCheckError) {
      // Se parse falhar, manter a versão original da IA — melhor que nada
      console.error(
        "[FACT-CHECK] Erro no fact-check (mantendo original):",
        factCheckError,
      );
    }
    // ============ END BUG 7 FIX ============

    // 11. Save report to database
    const { data: savedReport, error: insertError } = await serviceClient
      .from("medical_reports")
      .insert({
        user_id: userId,
        period_start: periodStart,
        period_end: periodEnd,
        report_data: reportData,
        clinical_summary: clinicalSummary,
        pdf_url: null, // PDF generation would be handled separately
        pdf_generated_at: null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving report:", insertError);
      throw new Error("Failed to save report to database");
    }

    // 12. (Skipped — included_in_report column not yet in schema)
    // Insights linkage will be implemented in a future migration

    // 13. Return success
    return new Response(
      JSON.stringify({
        success: true,
        report_id: savedReport.id,
        period: {
          start: periodStart,
          end: periodEnd,
          days: periodDays,
        },
        summary: reportData.summary,
        insights_included: 0,
        clinical_summary: clinicalSummary,
        tokens_used: aiData.usage?.total_tokens,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in generate-medical-report:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
