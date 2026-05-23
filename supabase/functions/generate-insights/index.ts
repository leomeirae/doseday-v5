// @ts-nocheck
import {
  assertSafePatientFacingPayload,
  CORS_HEADERS,
  jsonResponse,
  MEMORY_DISABLED_TEXT,
} from "../_shared/patient-facing-ai-safety.ts";
import { requireAuthenticatedRequest } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const startedAt = Date.now();

  try {
    const { userId, body } = await requireAuthenticatedRequest(req);
    const mode = body.mode === "report" ? "report" : "dashboard";
    const today = new Date().toISOString().slice(0, 10);

    const response = {
      user_id: userId,
      overview: MEMORY_DISABLED_TEXT,
      motivation: "A memória inteligente está em revisão para seguir as regras do DoseDay.",
      highlights: [],
      next_week: [],
      consult_ready: false,
      data_points: {
        doses: 0,
        weights: 0,
        symptoms: 0,
        lifestyle: 0,
        window_days: 0,
      },
      model_used: "disabled",
      tokens_used: 0,
      generation_time_ms: Date.now() - startedAt,
      period_start: today,
      period_end: today,
      language: "pt-BR",
      insight_type: "containment",
      metadata: {
        mode,
        disabled: true,
        reason: "p0_ai_compliance_containment",
        schemaVersion: "generate_insights_containment_v1",
      },
    };

    assertSafePatientFacingPayload(response);
    return jsonResponse(response);
  } catch (err) {
    console.warn(`[generate-insights] containment_error=${toLogMessage(err)}`);
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
});

function toLogMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
