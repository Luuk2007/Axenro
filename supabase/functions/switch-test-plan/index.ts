
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SWITCH-TEST-PLAN] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { planId } = await req.json();
    if (!planId) throw new Error("Plan ID is required");
    
    const validPlans = ['free', 'pro', 'premium'];
    if (!validPlans.includes(planId)) {
      throw new Error("Invalid plan ID");
    }
    logStep("Plan ID validated", { planId });

    // Update the user's test subscription tier
    const subscriptionEnd = planId === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now for paid plans
    
    const { data, error } = await supabaseClient
      .from("subscribers")
      .upsert({
        email: user.email,
        user_id: user.id,
        test_mode: true,
        test_subscription_tier: planId,
        subscribed: planId !== 'free',
        subscription_tier: planId === 'free' ? null : planId,
        subscription_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (error) {
      logStep("Database update error", { error });
      throw new Error(`Failed to update subscription: ${error.message}`);
    }

    logStep("Successfully updated test plan", { planId, subscribed: planId !== 'free' });

    return new Response(JSON.stringify({
      success: true,
      subscribed: planId !== 'free',
      subscription_tier: planId === 'free' ? null : planId,
      test_subscription_tier: planId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in switch-test-plan", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
