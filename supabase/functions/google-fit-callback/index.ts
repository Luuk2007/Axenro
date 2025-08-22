
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state') // This is the user_id
    const error = url.searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${Deno.env.get('SUPABASE_URL').replace('.supabase.co', '')}.netlify.app/?error=auth_failed` }
      })
    }

    if (!code || !state) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${Deno.env.get('SUPABASE_URL').replace('.supabase.co', '')}.netlify.app/?error=missing_params` }
      })
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_FIT_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_FIT_CLIENT_SECRET')!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-fit-callback`
      })
    })

    const tokens = await tokenResponse.json()

    if (!tokens.access_token) {
      console.error('Failed to get access token:', tokens)
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${Deno.env.get('SUPABASE_URL').replace('.supabase.co', '')}.netlify.app/?error=token_failed` }
      })
    }

    // Store the connection in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const expiresAt = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null

    const { error: dbError } = await supabase
      .from('health_connections')
      .upsert({
        user_id: state,
        provider: 'google_fit',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt,
        is_active: true
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${Deno.env.get('SUPABASE_URL').replace('.supabase.co', '')}.netlify.app/?error=db_failed` }
      })
    }

    // Redirect back to app with success
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${Deno.env.get('SUPABASE_URL').replace('.supabase.co', '')}.netlify.app/?success=connected` }
    })

  } catch (error) {
    console.error('Callback error:', error)
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${Deno.env.get('SUPABASE_URL').replace('.supabase.co', '')}.netlify.app/?error=server_error` }
    })
  }
})
