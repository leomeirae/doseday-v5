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

  try {
    const { body } = await requireAuthenticatedRequest(req);
    const periodDays = typeof body.period_days === "number" ? body.period_days : 7;
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodEnd.getDate() - periodDays);

    const response = {
      success: false,
      disabled: true,
      report_id: null,
      period: {
        start: periodStart.toISOString().slice(0, 10),
        end: periodEnd.toISOString().slice(0, 10),
        days: periodDays,
      },
      summary: null,
      report_data: null,
      clinical_summary: {
        status: MEMORY_DISABLED_TEXT,
        schemaVersion: "generate_report_containment_v1",
      },
      metadata: {
        reason: "p0_ai_compliance_containment",
        tokens_used: 0,
        model_used: "disabled",
      },
    };

    assertSafePatientFacingPayload(response);
    return jsonResponse(response);
  } catch (err) {
    console.warn(`[generate-report] containment_error=${toLogMessage(err)}`);
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
});

function toLogMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
