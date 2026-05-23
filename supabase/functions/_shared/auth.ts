// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

export type AuthContext = {
  userId: string;
  isServiceRole: boolean;
  body: Record<string, unknown>;
};

export async function requireAuthenticatedRequest(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch (_) {
    body = {};
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (serviceRoleKey && token === serviceRoleKey) {
    const userId = typeof body.user_id === "string" ? body.user_id : null;
    if (!userId) throw new Error("Missing user_id in body for service role execution");
    return { userId, isServiceRole: true, body };
  }

  try {
    const payloadBase64 = token.split(".")[1];
    if (payloadBase64) {
      const payload = JSON.parse(atob(payloadBase64));
      if (payload.role === "service_role") {
        const userId = typeof body.user_id === "string" ? body.user_id : null;
        if (!userId) throw new Error("Missing user_id in body for service role execution");
        return { userId, isServiceRole: true, body };
      }
    }
  } catch (_) {
    // Fall through to standard user auth.
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new Error("Unauthorized");

  return { userId: user.id, isServiceRole: false, body };
}
