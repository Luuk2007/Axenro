
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (key: string, maxRequests: number = 5, windowMs: number = 300000): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
};

const logSecurityEvent = (event: string, details?: any) => {
  console.warn('[SECURITY EVENT]', event, {
    timestamp: new Date().toISOString(),
    ...details
  });
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate request method
  if (req.method !== "POST") {
    logSecurityEvent('invalid_request_method', { method: req.method });
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logSecurityEvent('missing_stripe_key');
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logSecurityEvent('missing_auth_header', { 
        userAgent: req.headers.get("User-Agent"),
        origin: req.headers.get("Origin")
      });
      throw new Error("No authorization header provided");
    }
    logStep("Authorization header found");

    // Extract and validate token
    const token = authHeader.replace("Bearer ", "");
    if (!token || token.length < 20 || token === authHeader) {
      logSecurityEvent('invalid_auth_token');
      throw new Error("Invalid authorization token");
    }

    // Rate limiting based on token
    const tokenHash = token.substring(0, 10);
    if (!checkRateLimit(`portal_access_${tokenHash}`, 5, 300000)) { // 5 requests per 5 minutes
      logSecurityEvent('rate_limit_exceeded', { tokenHash });
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logSecurityEvent('auth_failure', { error: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    const user = userData.user;
    if (!user?.email) {
      logSecurityEvent('invalid_user_data');
      throw new Error("User not authenticated or email not available");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      logSecurityEvent('invalid_email_format', { email: user.email });
      throw new Error("Invalid email format");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logSecurityEvent('no_stripe_customer_found', { email: user.email });
      throw new Error("No Stripe customer found for this user");
    }
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Validate origin for return URL
    const origin = req.headers.get("origin") || "https://localhost:3000";
    const allowedOrigins = [
      "http://localhost:3000",
      "https://localhost:3000",
      "https://your-domain.com" // Add your production domain
    ];
    
    let returnUrl = "https://localhost:3000/";
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      returnUrl = `${origin}/`;
    } else {
      logSecurityEvent('invalid_origin', { origin });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    logStep("Customer portal session created", { sessionId: portalSession.id, url: portalSession.url });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
