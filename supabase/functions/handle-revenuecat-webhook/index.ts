// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req) => {
  // Define CORS rules
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const bodyText = await req.text();
    let payload;

    try {
      payload = JSON.parse(bodyText);
    } catch (e) {
      return new Response("Invalid JSON", { status: 400, headers });
    }

    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse RevenueCat Payload
    const event = payload?.event;
    if (!event) {
      return new Response("No event found", { status: 400, headers });
    }

    const { type, app_user_id, product_id, environment } = event;

    // Optional: Ignore Sandbox events if you only want Production. 
    // Here we'll process both.

    console.log(`[RC Webhook] Received ${type} for user ${app_user_id}`);

    // If app_user_id is not a valid uuid mapping to our auth.users, skip or handle accordingly.
    // Assuming app_user_id IS the Supabase user UUID.
    
    // Check if the event means they are actively entitled to "Pro"
    // Usually, INITIAL_PURCHASE and RENEWAL mean active.
    // CANCELLATION means auto-renew is off, but they might still have time remaining. 
    // EXPIRATION means it actually expired.
    
    let isProStatus = false;
    if (["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION"].includes(type)) {
      isProStatus = true;
    } else if (["CANCELLATION", "EXPIRATION", "BILLING_ISSUE"].includes(type)) {
      isProStatus = false;
    } else {
      // Ignored events (TEST, NON_RENEWING_PURCHASE, etc)
      return new Response(JSON.stringify({ received: true, ignored: true }), { headers });
    }

    // Log the action to perform
    console.log(`[RC Webhook] Setting user ${app_user_id} is_pro to ${isProStatus}`);

    const { error } = await supabase.auth.admin.updateUserById(
      app_user_id,
      { user_metadata: { is_pro: isProStatus } }
    );

    if (error) {
       console.error(`[RC Webhook] Error updating user metadata:`, error);
       return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ success: true, updated: app_user_id, is_pro: isProStatus }), { headers });
  } catch (err: any) {
    console.error("Webhook Error", err);
    return new Response(JSON.stringify({ error: "Server Error" }), { status: 500, headers });
  }
});
