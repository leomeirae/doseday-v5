// @ts-nocheck — This file runs in the Supabase Edge Runtime (Deno).
// TypeScript errors about Deno globals and URL imports are expected in a Node/VS Code context.
// The function is deployed and executed correctly in the Deno runtime on Supabase.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const payload = await req.json();
    const { userId, pushToken: directToken, title, body, mediaUrl, data } =
      payload;

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "title and body are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let expoPushToken: string | null = directToken ?? null;

    // Look up token from Supabase if userId provided
    if (!expoPushToken && userId) {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const { data: profile, error } = await supabaseAdmin
        .from("user_profiles")
        .select("exp_push_token")
        .eq("id", userId)
        .single();

      if (error || !profile?.exp_push_token) {
        return new Response(
          JSON.stringify({
            error: "No push token found for this user",
            details: error?.message,
          }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      expoPushToken = profile.exp_push_token;
    }

    if (!expoPushToken) {
      return new Response(
        JSON.stringify({ error: "userId or pushToken is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build Expo Push Message
    const message = {
      to: expoPushToken,
      title,
      body,
      sound: "default",
      priority: "high",
      // Required for iOS Notification Service Extension to intercept and attach the image
      mutableContent: true,
      data: {
        ...(data ?? {}),
        ...(mediaUrl ? { mediaUrl } : {}),
      },
    };

    // Send to Expo Push API
    const expoResponse = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await expoResponse.json();

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
