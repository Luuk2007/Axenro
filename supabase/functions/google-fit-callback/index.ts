
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state') // This is the user_id
    const error = url.searchParams.get('error')

    console.log('Callback received:', { code: !!code, state: !!state, error })

    // Get the origin from the request headers to determine redirect URL
    const origin = req.headers.get('origin')
    const referer = req.headers.get('referer')
    
    // Try to determine the correct redirect URL
    let redirectBase = 'http://localhost:5173' // Default for local development
    
    if (origin && origin.includes('lovable.dev')) {
      redirectBase = origin
    } else if (referer && referer.includes('lovable.dev')) {
      redirectBase = new URL(referer).origin
    } else if (origin && origin.includes('netlify.app')) {
      redirectBase = origin
    } else if (referer && referer.includes('netlify.app')) {
      redirectBase = new URL(referer).origin
    }

    console.log('Redirect base determined:', redirectBase)

    if (error) {
      console.error('OAuth error:', error)
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${redirectBase}/?error=auth_failed` }
      })
    }

    if (!code || !state) {
      console.error('Missing code or state:', { code: !!code, state: !!state })
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${redirectBase}/?error=missing_params` }
      })
    }

    // Exchange code for tokens
    const clientId = Deno.env.get('GOOGLE_FIT_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_FIT_CLIENT_SECRET')
    
    if (!clientId || !clientSecret) {
      console.error('Missing Google Fit credentials')
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${redirectBase}/?error=config_error` }
      })
    }

    console.log('Exchanging code for tokens...')

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-fit-callback`
      })
    })

    const tokens = await tokenResponse.json()
    console.log('Token response:', { success: !!tokens.access_token, error: tokens.error })

    if (!tokens.access_token) {
      console.error('Failed to get access token:', tokens)
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${redirectBase}/?error=token_failed` }
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

    console.log('Storing connection in database for user:', state)

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
        headers: { 'Location': `${redirectBase}/?error=db_failed` }
      })
    }

    console.log('Successfully stored Google Fit connection for user:', state)

    // Redirect back to app with success
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${redirectBase}/?success=connected` }
    })

  } catch (error) {
    console.error('Callback error:', error)
    
    // Fallback redirect URL
    let redirectBase = 'http://localhost:5173'
    try {
      const origin = req.headers.get('origin')
      const referer = req.headers.get('referer')
      
      if (origin && (origin.includes('lovable.dev') || origin.includes('netlify.app'))) {
        redirectBase = origin
      } else if (referer && (referer.includes('lovable.dev') || referer.includes('netlify.app'))) {
        redirectBase = new URL(referer).origin
      }
    } catch (e) {
      console.error('Error determining redirect URL:', e)
    }
    
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${redirectBase}/?error=server_error` }
    })
  }
})
