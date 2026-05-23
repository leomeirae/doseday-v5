export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept-language",
};

export const FIXED_DISCLAIMER =
  "Isso é uma anotação inteligente, não orientação médica. Sempre fale com um profissional de saúde.";

export const MEMORY_DISABLED_TEXT = "Sua memória será atualizada em breve.";

export const FORBIDDEN_PATIENT_FACING_PATTERNS = [
  /\bSURMOUNT\b/i,
  /\bSURPASS\b/i,
  /\bSTEP\b/i,
  /\bSUSTAIN\b/i,
  /\bSELECT\b/i,
  /\btrial\b/i,
  /\btrials\b/i,
  /\bestudo clínico\b/i,
  /\bestudos clínicos\b/i,
  /\bensaio clínico\b/i,
  /\bensaios clínicos\b/i,
  /\bcoach\b/i,
  /\bmotivacional\b/i,
  /\bcelebrat/i,
  /\bparabéns\b/i,
  /\bjornada\b/i,
  /\bpós-dose\b/i,
  /\bpos-dose\b/i,
  /\bcausad[oa]\b/i,
  /\bcausou\b/i,
  /\baumente a dose\b/i,
  /\breduza a dose\b/i,
  /\bpare de tomar\b/i,
  /\bpare de usar\b/i,
  /\bajuste a dose\b/i,
  /\bajuste sua dose\b/i,
  /\btome .{0,40}remédio\b/i,
  /\bprocure imediatamente\b/i,
  /\bavaliação médica recomendada\b/i,
];

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

export function containsForbiddenPatientFacingText(value: unknown): string | null {
  const text = collectText(value).join(" ");
  for (const pattern of FORBIDDEN_PATIENT_FACING_PATTERNS) {
    if (pattern.test(text)) return pattern.source;
  }
  return null;
}

export function assertSafePatientFacingPayload(payload: unknown): void {
  const forbidden = containsForbiddenPatientFacingText(payload);
  if (forbidden) {
    throw new Error(`Forbidden patient-facing text matched: ${forbidden}`);
  }
}

function collectText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(collectText);
  }
  return [];
}
