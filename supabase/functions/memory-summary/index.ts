// @ts-nocheck
import {
  assertSafePatientFacingPayload,
  CORS_HEADERS,
  jsonResponse,
  MEMORY_DISABLED_TEXT,
} from "../_shared/patient-facing-ai-safety.ts";
import { requireAuthenticatedRequest } from "../_shared/auth.ts";

const EMPTY_CONTENT = {
  status: null,
  peso: null,
  aplicacoes: null,
  sintomas: null,
  perguntas: [],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { body } = await requireAuthenticatedRequest(req);
    const mode = typeof body.mode === "string" ? body.mode : "template";
    const response = {
      id: null,
      mode,
      content: EMPTY_CONTENT,
      generated_at: null,
      disabled: true,
      message: MEMORY_DISABLED_TEXT,
      schemaVersion: "memory_summary_containment_v1",
    };

    assertSafePatientFacingPayload(response);
    return jsonResponse(response);
  } catch (err) {
    console.warn(`[memory-summary] containment_error=${toLogMessage(err)}`);
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
});

function toLogMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
