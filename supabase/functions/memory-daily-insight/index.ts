// @ts-nocheck
import {
  assertSafePatientFacingPayload,
  CORS_HEADERS,
  jsonResponse,
  MEMORY_DISABLED_TEXT,
} from "../_shared/patient-facing-ai-safety.ts";
import { requireAuthenticatedRequest } from "../_shared/auth.ts";

const RESPONSE = {
  id: null,
  content: null,
  mode: "fallback",
  insight_text: MEMORY_DISABLED_TEXT,
  generated_at: null,
  disabled: true,
  schemaVersion: "memory_daily_containment_v1",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    await requireAuthenticatedRequest(req);
    assertSafePatientFacingPayload(RESPONSE);
    return jsonResponse(RESPONSE);
  } catch (err) {
    console.warn(`[memory-daily-insight] containment_error=${toLogMessage(err)}`);
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
});

function toLogMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
