// @ts-nocheck
// Edge Functions run on Deno runtime, not Node.js
// These imports work in Supabase Edge Functions environment

import { createClient } from "npm:@supabase/supabase-js@2.95.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept-language',
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Extract JWT or Service Key
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header')
    }

    let userId: string;
    let userClient; // Will be initialized as either anon/JWT client or service client

    // Check if called with Service Role Key (Cron/System)
    if (authHeader === `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) {
        // Create Service Client
        const serviceClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        // Parse body early to get user_id
        let body = {};
        try { body = await req.json(); } catch (e) {}
        
        if (!body.user_id) {
             throw new Error('Missing user_id in body for service role execution')
        }
        userId = body.user_id;
        userClient = serviceClient; // Use service client for queries
        console.log(`[System] Generating insight for user ${userId} via Scheduler`);
        
        // Re-inject body for later use if needed (hacky but keeps flow)
        req.json = async () => body; 
        
    } else {
        // Standard User JWT Auth
        const jwt = authHeader.replace('Bearer ', '')
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        )
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt)
        if (authError || !user) {
          throw new Error(`Unauthorized: ${authError?.message || 'No user'}`)
        }
        userId = user.id;
        userClient = supabaseClient; // Use JWT-authenticated client for queries
    }

    // Parse Request Body (again/first time depending on flow)
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // Body might be empty
    }

    const mode = body.mode || 'dashboard'; // 'dashboard' or 'report'
    
    // LOGGING: Structured log for debugging scheduler calls
    console.log(`[Insight Generator] Starting for User: ${userId} | Mode: ${mode}`)
    
    // 2. Check Cache (Only for dashboard mode)
    if (mode === 'dashboard') {
      const { data: cachedInsight } = await userClient
        .from('ai_insights')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (cachedInsight) {
        return new Response(JSON.stringify({ ...cachedInsight, cached: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // 3. Targeted Data Fetching Strategy
    // Optimization: Fetch specific windows relevant for pattern recognition
    
    const now = new Date();
    
    // Window definitions
    const clinicalWindowDays = 21; // 21 days (3 weeks) to catch cyclical patterns
    const weightWindowDays = 30; // 30 days for weight trends
    
    const clinicalStartDate = new Date(now);
    clinicalStartDate.setDate(now.getDate() - clinicalWindowDays);
    
    const weightStartDate = new Date(now);
    weightStartDate.setDate(now.getDate() - weightWindowDays);
    
    const [profile, applications, weights, purchases, checkins] = await Promise.all([
      // Profile: Need full data for metrics calculation
      userClient.from('user_profiles').select('full_name, goal_weight, initial_weight, treatment_start_date').eq('user_id', userId).single(),
      
      // Doses: Last 4 doses (specific query for last 4 items)
      userClient.from('medication_applications')
        .select('application_date, medication_name, dose, injection_site')
        .eq('user_id', userId)
        .order('application_date', { ascending: false })
        .limit(4),
        
      // Weight: Last 30 days
      userClient.from('weight_logs')
        .select('date, weight')
        .eq('user_id', userId)
        .gte('date', weightStartDate.toISOString())
        .order('date', { ascending: true }),
        
      // Purchases: Last 4 (context for medication changes)
      userClient.from('purchases')
        .select('purchase_date, medication_name, quantity')
        .eq('user_id', userId)
        .order('purchase_date', { ascending: false })
        .limit(4),
        
      // Checkins: Last 21 days (symptoms and symptom_triggers arrays)
      userClient.from('daily_checkins')
        .select('date, has_adverse_reaction, symptoms, symptom_triggers, notes')
        .eq('user_id', userId)
        .gte('date', clinicalStartDate.toISOString())
        .order('date', { ascending: true })
    ])
    
    // Sort applications to ascending for AI context
    const recentDoses = applications.data ? [...applications.data].reverse() : [];
    
    // ============ BUG 4 FIX: PRÉ-CÁLCULO DE MÉTRICAS (antes de enviar para IA) ============
    const preCalculated = {
        // PESO
        weight_change: null as string | null,
        weekly_rate: null as string | null,
        goal_distance: null as string | null,
        weight_trend: null as string | null,
        
        // ADERÊNCIA
        adherence_rate: null as number | null,
        doses_on_time: null as string | null,
        
        // SINTOMAS
        days_with_symptoms: 0,
        total_checkin_days: checkins.data?.length || 0,
        top_symptoms: [] as string[],
        
        // CONTEXTO
        days_of_data: 0,
        treatment_week: 0,
        total_weight_change: null as string | null,
    };

    // Peso
    const weightData = weights.data || [];
    if (weightData.length >= 2) {
        const firstW = weightData[0].weight;
        const lastW = weightData[weightData.length - 1].weight;
        const change = lastW - firstW;
        const days = Math.max(1, Math.floor(
            (new Date(weightData[weightData.length - 1].date).getTime() - new Date(weightData[0].date).getTime()) 
            / (1000 * 60 * 60 * 24)
        ));
        const weeklyRate = (Math.abs(change) / days) * 7;
        
        preCalculated.weight_change = `${change > 0 ? '+' : ''}${change.toFixed(1)}kg em ${days} dias`;
        preCalculated.weekly_rate = `${weeklyRate.toFixed(1)}kg/semana`;
        preCalculated.weight_trend = change < -0.5 ? 'loss' : change > 0.5 ? 'gain' : 'stable';
    }

    // Goal distance calculation
    if (profile.data?.goal_weight && weightData.length > 0) {
      const currentWeight = weightData[weightData.length - 1].weight;
      const remaining = currentWeight - profile.data.goal_weight;
      if (remaining > 0) {
        preCalculated.goal_distance = `Faltam ${remaining.toFixed(1)}kg para a meta`;
      } else {
        preCalculated.goal_distance = `Meta atingida! ${Math.abs(remaining).toFixed(1)}kg abaixo`;
      }
    }

    // Aderência (intervalo entre doses)
    if (recentDoses.length >= 2) {
        const intervals: number[] = [];
        for (let i = 1; i < recentDoses.length; i++) {
            const curr = new Date(recentDoses[i].application_date).getTime();
            const prev = new Date(recentDoses[i - 1].application_date).getTime();
            intervals.push(Math.floor((curr - prev) / (1000 * 60 * 60 * 24)));
        }
        const onTime = intervals.filter(i => i >= 6 && i <= 8).length;
        preCalculated.adherence_rate = Math.round((onTime / intervals.length) * 100);
        preCalculated.doses_on_time = `${onTime}/${intervals.length} intervalos no prazo`;
    }

    // Sintomas
    const checkinData = checkins.data || [];
    const symptomCounts: Record<string, number> = {};
    checkinData.forEach(c => {
        if (c.symptoms && c.symptoms.length > 0) {
            preCalculated.days_with_symptoms++;
            c.symptoms.forEach((s: string) => {
                symptomCounts[s] = (symptomCounts[s] || 0) + 1;
            });
        }
    });
    preCalculated.top_symptoms = Object.entries(symptomCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => `${name} (${count}x)`);

    // Treatment week calculation
    if (profile.data?.treatment_start_date) {
      const startDate = new Date(profile.data.treatment_start_date);
      const today = new Date();
      const daysSinceStart = Math.floor(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      preCalculated.treatment_week = Math.max(1, Math.ceil(daysSinceStart / 7));
    }

    // Total weight change from initial
    if (profile.data?.initial_weight && weightData.length > 0) {
      const currentWeight = weightData[weightData.length - 1].weight;
      const totalChange = currentWeight - profile.data.initial_weight;
      preCalculated.total_weight_change = `${totalChange > 0 ? "+" : ""}${totalChange.toFixed(1)}kg desde o início`;
    }

    // Dias de dados únicos
    const uniqueDates = new Set<string>();
    recentDoses.forEach(d => uniqueDates.add(d.application_date));
    weightData.forEach(w => uniqueDates.add(w.date));
    checkinData.forEach(c => uniqueDates.add(c.date));
    preCalculated.days_of_data = uniqueDates.size;
    // ============ END BUG 4 FIX ============
    
    // Process Checkins to extract symptom occurrences (keep for legacy compatibility)
    const hasSymptomData = checkinData.some(c => c.symptoms && c.symptoms.length > 0);

    // 4. Data availability check (for logging only, AI handles cold_start via prompt)
    // NOTE: Removed early-return block - AI will generate cold_start dynamically
    const hasData = (recentDoses.length > 0) || (weights.data?.length > 0) || hasSymptomData;
    console.log(`[Insight Generator] Data availability: hasData=${hasData}, doses=${recentDoses.length}, weights=${weights.data?.length || 0}, symptoms=${hasSymptomData}`);

    // 5. Determine Language
    const acceptLanguage = req.headers.get('Accept-Language') || 'pt-BR'
    const userLanguage = acceptLanguage.split(',')[0].trim()

    // 6. Construct Prompt
    // Include purchases to detect medication/dose changes
    const recentPurchases = purchases.data || [];
    
    const userDataSummary = {
      user_name: profile.data?.full_name?.split(' ')[0] || "Usuário",
      
      // BUG 4 FIX: MÉTRICAS PRÉ-CALCULADAS (IA deve usar ESTES números, não calcular)
      computed_metrics: preCalculated,
      
      // DADOS BRUTOS (contexto para correlações, não para cálculos)
      recent_doses: recentDoses,
      recent_purchases: recentPurchases, // For medication change detection
      weight_history_30d: weights.data,
      clinical_journal_last_21d: checkinData, // Passed raw checkins with arrays
      
      current_date: new Date().toISOString().split('T')[0],
      context: mode
    }

    const systemPrompt = `
      PERSONA: COACH DE SAÚDE DIGITAL
      Você é o Coach de Saúde do ${userDataSummary.user_name} no Dose Day.
      Tom: motivacional, empático, celebratório das vitórias.
      
      REGRAS ABSOLUTAS:
      1. NUNCA mencione dados que o usuário já conhece (nome completo, idade, medicação, período).
      2. FOQUE em: progresso, padrões descobertos, próximo passo acionável.
      3. USE números concretos quando disponíveis (kg perdidos, % de melhoria).
      4. SE houver alerta clínico (perda >2kg/semana), use o campo "alert".
      5. USE as métricas em "computed_metrics" como VERDADE ABSOLUTA. 
         NUNCA recalcule peso, aderência ou contagens a partir dos dados brutos.
         Os dados brutos servem APENAS para descobrir correlações e padrões.
         Se computed_metrics.weight_change diz "-3.2kg", USE "-3.2kg" — não recalcule.
         Se computed_metrics.adherence_rate diz "17", USE "17%" — não conte doses manualmente.
      
      TRATAMENTO DE DADOS INSUFICIENTES:
      Se o usuário tem menos de 7 dias de dados OU não registrou peso:
      - insight_type: "cold_start"
      - data_quality: "insufficient"
      - headline: Mensagem encorajadora (ex: "Vamos começar sua jornada! 🚀")
      - metrics: null
      - highlight: null
      - action: Próximo passo específico (ex: "Registre seu peso hoje para começar a ver seu progresso")
      
      Se tem dados parciais (7+ dias mas falta algum tipo):
      - data_quality: "partial"
      - Preencha métricas disponíveis, use null para as ausentes
      
      Se tem dados completos:
      - data_quality: "complete"
      - Preencha todos os campos
      
      FORMATO DE SAÍDA (JSON):
      {
        "insight_type": "celebration" | "correlation" | "encouragement" | "gentle_alert" | "cold_start",
        "data_quality": "complete" | "partial" | "insufficient",
        "headline": "Frase curta e impactante (máx 8 palavras + emoji opcional)",
        "metrics": {
          "weight_change": "Variação de peso com contexto (ex: -3.2kg no último mês)" | null,
          "rate": "Ritmo semanal (ex: 0.8kg/semana ✓)" | null,
          "goal_distance": "Distância até meta (ex: Faltam 6.8kg)" | null
        } | null,
        "highlight": "1 padrão ou correlação descoberta (1-2 frases)" | null,
        "action": "Próximo passo prático e positivo (1 frase)",
        "alert": "Alerta clínico SE necessário" | null
      }
      
      EXEMPLOS POR ESTADO:
      
      COLD_START (sem dados):
      {
        "insight_type": "cold_start",
        "data_quality": "insufficient",
        "headline": "Vamos começar sua jornada! 🚀",
        "metrics": null,
        "highlight": null,
        "action": "Registre seu peso e primeira dose para desbloquear insights personalizados",
        "alert": null
      }
      
      PARTIAL (tem peso mas não tem meta):
      {
        "insight_type": "encouragement",
        "data_quality": "partial",
        "headline": "2.1kg perdidos, continue assim! 💪",
        "metrics": {
          "weight_change": "-2.1kg em 10 dias",
          "rate": "Ritmo: 1.5kg/semana",
          "goal_distance": null
        },
        "highlight": "Você tem registrado peso consistentemente",
        "action": "Defina sua meta de peso para acompanhar seu progresso",
        "alert": null
      }
      
      COMPLETE (todos os dados):
      {
        "insight_type": "celebration",
        "data_quality": "complete",
        "headline": "3.2kg perdidos este mês! 🎉",
        "metrics": {
          "weight_change": "-3.2kg no último mês",
          "rate": "0.8kg/semana ✓",
          "goal_distance": "Faltam 6.8kg"
        },
        "highlight": "Sintomas GI reduziram 60% vs semana 1",
        "action": "Continue o ritmo e reavalie sintomas na próxima dose",
        "alert": null
      }
      
      Idioma: ${userLanguage === 'pt-BR' ? 'Portuguese (Brazil)' : 'English'}
    `


    const startTime = Date.now()

    // 7. Call OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    // LOGGING FOR TRAINING (USER REQUEST)
    console.log("--- [TRAINING DATA] INPUT SUMMARY ---");
    console.log(JSON.stringify(userDataSummary, null, 2));

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Low cost model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this clinical data: ${JSON.stringify(userDataSummary)}` }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    })

    const openAIData = await openAIResponse.json()
    
    if (openAIData.error) {
      console.error('OpenAI API Error:', openAIData.error)
      throw new Error(`OpenAI Error: ${openAIData.error.message || JSON.stringify(openAIData.error)}`)
    }

    const content = openAIData.choices[0].message.content
    
    // LOGGING FOR TRAINING (USER REQUEST)
    console.log("--- [TRAINING DATA] AI OUTPUT ---");
    console.log(content);

    let result
    try {
      result = JSON.parse(content)
      
      // MAPPING STRATEGY (New Format -> DB Columns):
      // headline -> overview
      // highlight -> motivation (or better mapping?)
      // action -> highlights[0]
      
      result.overview = result.headline;
      result.motivation = result.highlight || "Continue registrando para mais insights."; // Fallback
      result.highlights = result.action ? [result.action] : [];
      result.next_week = []; // Legacy field, empty

    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON:', content)
      throw new Error('Failed to parse AI response as JSON')
    }
    
    const usage = openAIData.usage
    const duration = Date.now() - startTime

    // 8. Save to DB (Only for dashboard mode)
    // Counts need to be derived from the checkin arrays
    const totalSymptoms = checkinData.reduce((acc, curr) => acc + (curr.symptoms ? curr.symptoms.length : 0), 0);
    const totalTriggers = checkinData.reduce(
      (acc, curr) =>
        acc + (curr.symptom_triggers ? curr.symptom_triggers.length : 0),
      0,
    );

    const insightData = {
      user_id: userId,
      overview: result.overview,
      motivation: result.motivation,
      highlights: result.highlights,
      next_week: [],
      consult_ready: false,
      data_points: {
        doses: recentDoses.length,
        weights: weights.data?.length || 0,
        symptoms: totalSymptoms,
        lifestyle: totalTriggers,
        window_days: clinicalWindowDays
      },
      model_used: 'gpt-4o-mini',
      tokens_used: usage?.total_tokens,
      generation_time_ms: duration,
      period_start: clinicalStartDate.toISOString().split('T')[0],
      period_end: now.toISOString().split('T')[0],
      language: userLanguage,
      insight_type: result.insight_type, 
      metadata: {
         insight_type: result.insight_type,
         action_item: result.action, // was action_item in old prompt
         original_title: result.headline, // was title in old prompt
         raw_result: result
      }
    }

    if (mode === 'dashboard') {
      // Use service client for upsert to ensure permissions if needed, but userClient is already set correctly above
      
      const { data: savedInsight, error: insertError } = await userClient
        .from('ai_insights')
        .upsert(insightData, { onConflict: 'user_id' })
        .select()
        .single()

      if (insertError) {
        console.error('Error saving insight:', insertError)
        throw insertError
      }
      
      return new Response(JSON.stringify(savedInsight), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // In report mode, return the data without saving to persistent cache
    return new Response(JSON.stringify(insightData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
