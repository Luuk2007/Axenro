
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // First check if user exists in subscribers table and get test mode status
    const { data: existingSubscriber } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("email", user.email)
      .single();

    // Check if user is whitelisted (admin access) - grants full premium access
    if (existingSubscriber?.is_whitelisted) {
      logStep("User is whitelisted, granting premium access", { email: user.email });
      
      return new Response(JSON.stringify({
        subscribed: true,
        subscription_tier: 'premium',
        subscription_end: null, // No expiration for whitelisted users
        test_mode: false,
        test_subscription_tier: 'premium',
        is_whitelisted: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If user is in test mode, return test subscription data
    if (existingSubscriber?.test_mode) {
      logStep("User is in test mode, returning test subscription data", { 
        testSubscriptionTier: existingSubscriber.test_subscription_tier 
      });
      
      const testTier = existingSubscriber.test_subscription_tier || 'free';
      const isSubscribed = testTier !== 'free';
      const subscriptionEnd = isSubscribed ? existingSubscriber.subscription_end : null;

      return new Response(JSON.stringify({
        subscribed: isSubscribed,
        subscription_tier: isSubscribed ? testTier : null,
        subscription_end: subscriptionEnd,
        test_mode: true,
        test_subscription_tier: testTier
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If not in test mode, check Stripe as before
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        test_mode: existingSubscriber?.test_mode ?? true,
        test_subscription_tier: existingSubscriber?.test_subscription_tier ?? 'free',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      return new Response(JSON.stringify({ 
        subscribed: false,
        test_mode: existingSubscriber?.test_mode ?? true,
        test_subscription_tier: existingSubscriber?.test_subscription_tier ?? 'free'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Determine subscription tier from your new Stripe price IDs
      const priceId = subscription.items.data[0].price.id;
      if (priceId === "price_1RolU1RtLPgCAftzGpargdZc" || priceId === "price_1RolcgRtLPgCAftzTeK0rEEJ") {
        subscriptionTier = "pro";
      } else if (priceId === "price_1RolfZRtLPgCAftzsrh5TkUb" || priceId === "price_1RolgQRtLPgCAftzzprZbszL") {
        subscriptionTier = "premium";
      } else {
        subscriptionTier = "pro"; // fallback
      }
      logStep("Determined subscription tier", { priceId, subscriptionTier });
    } else {
      logStep("No active subscription found");
    }

    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      test_mode: existingSubscriber?.test_mode ?? false,
      test_subscription_tier: existingSubscriber?.test_subscription_tier ?? 'free',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, subscriptionTier });
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      test_mode: existingSubscriber?.test_mode ?? false,
      test_subscription_tier: existingSubscriber?.test_subscription_tier ?? 'free'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
