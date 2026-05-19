import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get("authorization");
    const secret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
    
    // Auth validation
    if (secret && authHeader !== `Bearer ${secret}`) {
      console.warn("Unauthorized request attempt");
      return new Response("Unauthorized", { status: 401 });
    }

    // Safely parse body
    let payload;
    try {
      payload = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }
    
    const event = payload?.event;
    if (!event) {
      // Return 200 for Test webhook (RevenueCat sometimes sends ping events)
      return new Response("PONG", { status: 200 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const app_user_id = event.app_user_id || event.aliases?.[0] || 'unknown';
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(app_user_id);
    const user_id = isUuid ? app_user_id : null;

    let status = 'unknown';
    const type = event.type;
    
    if (["INITIAL_PURCHASE", "RENEWAL", "PRODUCT_CHANGE", "UNCANCELLATION"].includes(type)) {
      status = 'active';
    } else if (type === "EXPIRATION") {
      status = 'expired';
    } else if (type === "CANCELLATION") {
      status = 'canceled';
    } else if (type === "BILLING_ISSUE") {
      status = 'billing_issue';
    }

    const expiresDateMs = event.expiration_at_ms || null;
    const expiresDate = expiresDateMs ? new Date(expiresDateMs).toISOString() : null;

    // Supabase upsert
    const upsertData: any = {
      app_user_id: app_user_id,
      status: status,
      entitlement_id: event.entitlement_id,
      product_id: event.product_id,
      original_transaction_id: event.original_transaction_id,
      expires_date: expiresDate,
      cancel_reason: event.cancel_reason,
      updated_at: new Date().toISOString()
    };
    
    if (user_id) upsertData.user_id = user_id;

    const { error } = await supabase
      .from('user_subscriptions')
      .upsert(upsertData, {
        onConflict: 'app_user_id'
      });

    if (error) {
      console.error("Supabase upsert error:", error);
      return new Response("Supabase Error", { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
