// @ts-nocheck
import {
  assertSafePatientFacingPayload,
  CORS_HEADERS,
  FIXED_DISCLAIMER,
  jsonResponse,
} from "../_shared/patient-facing-ai-safety.ts";
import { requireAuthenticatedRequest } from "../_shared/auth.ts";

const RESPONSE = {
  headline: "Check-in registrado",
  body: "Anotamos esse registro na memória do seu tratamento.",
  disclaimer: FIXED_DISCLAIMER,
  disabled: true,
  schemaVersion: "checkin_insight_containment_v1",
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
    console.warn(`[generate-checkin-insight] containment_error=${toLogMessage(err)}`);
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
});

function toLogMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
