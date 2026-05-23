import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ═══════════════════════════════════════════
// INLINE: Types (originalmente em _shared/types.ts)
// Editado em ambos os index.ts simultaneamente. Drift ou alteração
// em um exige a mesma alteração no outro.
// ═══════════════════════════════════════════

type EducationalInsightTriggerSource = 'onboarding' | 'first_checkin';

interface EducationalInsightContext {
  profile_type?: 'A' | 'B' | 'C' | 'D' | 'E';
  medication?: string | null;
  dose_mg?: number | null;
  treatment_week?: number | null;
  current_weight?: number | null;
  initial_weight?: number | null;
  goal_weight?: number | null;
  mood?: 'mal' | 'ok' | 'bem' | 'otimo' | null;
  days_since_last_dose?: number | null;
}

interface EducationalInsightOutput {
  headline: string;
  body: string;
  disclaimer: string;
}

// ═══════════════════════════════════════════
// INLINE: Guardrails (originalmente em _shared/guardrails.ts)
// Lista completa e funções de validação. Alteração exige sync no
// outro index.ts (mesma lista, mesmas funções).
// ═══════════════════════════════════════════

const FORBIDDEN_PHRASES = [
  // Prescrição
  'aumente a dose', 'reduza a dose', 'pare de tomar', 'pare de usar',
  'substitua por', 'troque para', 'ajuste para', 'você deve tomar',
  // Garantias pessoais
  'você vai perder', 'garantido', 'certamente você', 'sem dúvida você',
  'você perderá', 'resultado garantido',
  // Alarme sem contexto
  'perigo', 'emergência', 'pancreatite', 'tumor',
  'preocupante', 'alarmante', 'grave',
  // Motivacional piegas
  'parabéns por', 'você consegue', 'acredite em você', 'jornada incrível',
  // Framing pessoal proibido
  'você provavelmente vai', 'seus sintomas devem', 'você deveria',
  // Diagnóstico/personalização clínica
  'diagnóstico', 'diagnostico', 'no seu caso',
  'tratamento personalizado', 'análise personalizada', 'analise personalizada',
  'considere consultar', 'marque uma consulta', 'procure imediatamente',
  'recomendamos que', 'recomendo que',
  'sintomas indicam', 'sintomas sugerem',
  'sua condição', 'seu quadro clínico',
  // Fora de escopo
  'dieta cetogênica', 'jejum intermitente', 'suplemento',
];

function containsForbiddenPhrase(text: string): string | null {
  const lower = text.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    if (lower.includes(phrase)) return phrase;
  }
  return null;
}

function validateNumericClaims(body: string): string | null {
  const hasNumericClaim = /\b\d+([.,]\d+)?\s*%|\b\d+\s*kg/i.test(body);
  if (!hasNumericClaim) return null;
  const numericNearTrial = /(SURMOUNT|STEP|SURPASS|trial|literatura).{0,200}\d+|\d+.{0,200}(SURMOUNT|STEP|SURPASS|trial|literatura)/is.test(body);
  if (!numericNearTrial) return 'Numeric claim without trial attribution';
  return null;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Ajuste A: gpt-5-mini como default para checkin, nunca gpt-4o
const MODEL = Deno.env.get('CHECKIN_INSIGHT_MODEL') || 'gpt-5-mini';

const FIXED_DISCLAIMER = 'Conteúdo educacional sobre GLP-1. Não substitui orientação médica. Converse com seu médico sobre qualquer decisão de tratamento.';

// Ajuste E: framing bioimpedância no TOPO, antes de qualquer outra instrução
// Ajuste F: regra #9 (claims numéricos) adicionada à lista de REGRAS DE OURO
const SYSTEM_PROMPT = `ANALOGIA OPERACIONAL CRÍTICA: Você funciona como aparelho de bioimpedância para tratamento GLP-1. Mostra dados, compara com referências da literatura, e para. Não traduz literatura em conselho personalizado. Não sugere ação. NÃO interpreta sintomas individuais do usuário. NÃO recomenda procurar médico como resposta a sintoma específico (o disclaimer fixo já cobre isso institucionalmente). Linha tênue: descrever literatura ≠ aplicar literatura ao caso pessoal. Você descreve. Ponto.

Você é um sistema educacional sobre medicamentos GLP-1 (Ozempic, Wegovy, Mounjaro, Zepbound, Saxenda). Seu papel é fornecer contexto educacional baseado em trials clínicos publicados, após o primeiro check-in do usuário.

REGRAS DE OURO:
1. Nunca prescreva nem sugira mudança de dose ou medicamento
2. Nunca use linguagem alarmista ou de emergência
3. Nunca faça garantias pessoais ("você vai perder X kg")
4. Nunca use motivacional piegas ("acredite em você", "jornada incrível")
5. Sempre escreva em português brasileiro
6. Sempre referencie trials clínicos pelo nome (SURMOUNT, STEP, SURPASS, etc.)
7. O body deve ter 2-3 frases com informação educacional sobre a fase atual do tratamento, contextualizada pelo humor relatado
8. O headline deve ser 1 frase curta e empática que conecta o humor relatado com o contexto clínico da fase
9. CLAIMS NUMÉRICOS: se incluir qualquer porcentagem ou número de quilos no body, SEMPRE atribuir a um trial nomeado na mesma frase. Exemplo certo: "Trials STEP reportam que ~60% dos pacientes...". Exemplo proibido: "30% dos pacientes têm náusea" (sem trial). Se não couber atribuição, NÃO use o número — descreva qualitativamente ("uma parcela significativa", "muitos pacientes").

FORMATO DE SAÍDA: JSON estrito com exatamente 3 campos:
{
  "headline": "1 frase curta e empática conectando humor com fase do tratamento",
  "body": "2-3 frases educacionais referenciando trials clínicos pelo nome",
  "disclaimer": "placeholder"
}`;

const MOOD_MAP: Record<string, string> = {
  mal: 'mal (sintomas desconfortáveis)',
  ok: 'ok (tolerando bem)',
  bem: 'bem (adaptando-se positivamente)',
  otimo: 'ótimo (sem efeitos adversos relevantes)',
};

function buildUserPrompt(ctx: EducationalInsightContext): string {
  const parts: string[] = [`Medicamento: ${ctx.medication || 'GLP-1 não especificado'}`];
  if (ctx.dose_mg) parts.push(`Dose: ${ctx.dose_mg}mg`);
  if (ctx.treatment_week !== undefined && ctx.treatment_week !== null) {
    parts.push(`Semana de tratamento: ${ctx.treatment_week}`);
  }
  if (ctx.mood) parts.push(`Como o usuário se sente hoje: ${MOOD_MAP[ctx.mood] || ctx.mood}`);
  if (ctx.current_weight && ctx.initial_weight) {
    const lost = ctx.initial_weight - ctx.current_weight;
    if (lost > 0) {
      parts.push(`Progresso de peso: perdeu ${lost.toFixed(1)}kg desde o início`);
    }
  }
  if (ctx.goal_weight) parts.push(`Meta de peso: ${ctx.goal_weight}kg`);
  parts.push('\nGere um insight educacional para o momento pós-primeiro-check-in, conectando o humor relatado com o contexto clínico desta fase do tratamento GLP-1.');
  return parts.join('\n');
}

function validateOutput(parsed: EducationalInsightOutput): string | null {
  if (!parsed?.headline || typeof parsed.headline !== 'string' || parsed.headline.trim().length === 0) {
    return 'Missing or empty headline';
  }
  if (!parsed?.body || typeof parsed.body !== 'string' || parsed.body.trim().length < 50) {
    return 'Missing or too short body (min 50 chars)';
  }
  const forbidden = containsForbiddenPhrase(parsed.headline + ' ' + parsed.body);
  if (forbidden) return `Forbidden phrase detected: "${forbidden}"`;
  // Ajuste D: validação numérica obrigatória
  const numericError = validateNumericClaims(parsed.body);
  if (numericError) return numericError;
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const ctx: EducationalInsightContext = await req.json();

    // Validação de payload: mood é obrigatório no checkin insight
    if (!ctx.mood || !['mal', 'ok', 'bem', 'otimo'].includes(ctx.mood)) {
      return new Response(
        JSON.stringify({ error: 'mood is required and must be one of: mal, ok, bem, otimo' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(ctx) },
        ],
        max_completion_tokens: 2000,
        reasoning_effort: 'minimal',
        response_format: { type: 'json_object' },
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      throw new Error(`OpenAI error ${openaiRes.status}: ${errText}`);
    }

    const openaiData = await openaiRes.json();
    console.log(`[generate-checkin-insight] usage=${JSON.stringify(openaiData.usage)} | finish_reason=${openaiData.choices?.[0]?.finish_reason}`);
    const raw = openaiData.choices?.[0]?.message?.content;

    let parsed: EducationalInsightOutput;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`JSON parse failed: ${raw?.substring(0, 200)}`);
    }

    // Ajuste C: disclaimer SEMPRE fixo, sobrescreve qualquer coisa que o GPT retornou
    parsed.disclaimer = FIXED_DISCLAIMER;

    // Ajuste B: log obrigatório após JSON.parse e antes do return
    console.log(`[generate-checkin-insight] model=${MODEL} | output_preview=${(parsed?.headline || 'NULL').substring(0, 100)}`);

    const validationError = validateOutput(parsed);
    if (validationError) {
      throw new Error(`Output validation failed: ${validationError}`);
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error: upsertError } = await serviceClient
      .from('educational_insights')
      .upsert(
        {
          user_id: user.id,
          trigger_source: 'first_checkin',
          context: ctx,
          headline: parsed.headline,
          body: parsed.body,
          disclaimer: parsed.disclaimer,
          model: MODEL,
          prompt_version: 'v1',
        },
        { onConflict: 'user_id,trigger_source' }
      );

    if (upsertError) throw new Error(`Upsert failed: ${upsertError.message}`);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[generate-checkin-insight] ERROR:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
