// @ts-nocheck
/**
 * DOSE DAY - TRIGGER SCHEDULED TASKS (CRON)
 *
 * Purpose: Iterate through all users and trigger scheduled tasks based on their treatment timeline.
 * Tasks:
 *  1. Weekly Reports (Every 7 days)
 *  2. AI Insights (Every 3 days)
 *
 * Frequency: Daily (via Cron)
 */

import { createClient } from "npm:@supabase/supabase-js@2.95.0";

Deno.serve(async (req) => {
  try {
    // Security: Ensure this is called by a trusted source (Cron with Service Key)
    // Security: Validate the token is a Service Role token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Decode (simple check) to verify it claims to be service_role
    // We can't easily verify signature without a known good secret, but using it
    // against the DB below acts as the verification.
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.role !== "service_role") {
          console.error("[Scheduler] Role is not service_role:", payload.role);
          return new Response(
            JSON.stringify({ error: "Unauthorized: Role mismatch" }),
            { status: 401 },
          );
        }
      }
    } catch (e) {
      console.error("[Scheduler] Failed to parse token:", e);
      return new Response(JSON.stringify({ error: "Invalid Token" }), {
        status: 401,
      });
    }

    // Initialize Client using the PROVIDED token (bypassing potentially broken Env Var)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      token, // Use the header token as the key
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // 1. Get eligible users via RPC (Scalable filtering at DB level)
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      /* Check date might strictly be in body */
    }

    // Allow overriding 'today' for testing purposes (e.g., simulating Day 21)
    const today = body.check_date || new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    console.log(`[Scheduler] Check Date: ${today}`);

    const { data: eligibleUsers, error } = await serviceClient.rpc(
      "get_users_for_scheduling",
      { check_date: today },
    );

    if (error) {
      console.error("[Scheduler] RPC Error:", error);
      throw error;
    }

    console.log(
      `[Scheduler] Check complete. Found ${eligibleUsers?.length || 0} users requiring action.`,
    );

    if (!eligibleUsers || eligibleUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No scheduled tasks for today." }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 2. Batch Processing Configuration
    const BATCH_SIZE = 10;
    const actionsResults = [];
    let triggeredReports = 0;

    // Helper to process a single user safely
    const processUser = async (user: any) => {
      const userActions = [];

      // TASK 1: Weekly Report
      if (user.needs_report) {
        try {
          const { error: invokeError } = await serviceClient.functions.invoke(
            "generate-report",
            {
              body: { user_id: user.user_id, period_days: 7 },
            },
          );

          if (invokeError) throw invokeError;

          triggeredReports++;
          userActions.push({ type: "report", status: "success" });
          console.log(`[Scheduler] Report triggered for ${user.user_id}`);
        } catch (err) {
          console.error(`[Scheduler] Report FAILED for ${user.user_id}:`, err);
          userActions.push({
            type: "report",
            status: "failed",
            error: err.message,
          });
        }
      }

      return { user: user.user_id, actions: userActions };
    };

    // 3. Execute in Batches
    for (let i = 0; i < eligibleUsers.length; i += BATCH_SIZE) {
      const chunk = eligibleUsers.slice(i, i + BATCH_SIZE);
      console.log(
        `[Scheduler] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}...`,
      );

      const batchResults = await Promise.all(
        chunk.map((user) => processUser(user)),
      );
      actionsResults.push(...batchResults);
    }

    // 4. Summary Response
    return new Response(
      JSON.stringify({
        message: `Processed ${eligibleUsers.length} users in batches of ${BATCH_SIZE}.`,
        stats: {
          reports_triggered: triggeredReports,
        },
        details: actionsResults,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[Scheduler] Fatal Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
