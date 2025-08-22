
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's Google Fit connection
    const { data: connection } = await supabase
      .from('health_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'google_fit')
      .eq('is_active', true)
      .single()

    if (!connection) {
      return new Response(
        JSON.stringify({ error: 'No Google Fit connection found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if token needs refresh
    let accessToken = connection.access_token
    if (connection.token_expires_at && new Date(connection.token_expires_at) <= new Date()) {
      // Refresh token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_FIT_CLIENT_ID')!,
          client_secret: Deno.env.get('GOOGLE_FIT_CLIENT_SECRET')!,
          refresh_token: connection.refresh_token,
          grant_type: 'refresh_token'
        })
      })

      const refreshTokens = await refreshResponse.json()
      if (refreshTokens.access_token) {
        accessToken = refreshTokens.access_token
        
        // Update stored tokens
        await supabase
          .from('health_connections')
          .update({
            access_token: accessToken,
            token_expires_at: refreshTokens.expires_in 
              ? new Date(Date.now() + refreshTokens.expires_in * 1000).toISOString()
              : null
          })
          .eq('id', connection.id)
      }
    }

    // Get steps data for the last 7 days
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000)

    const fitnessResponse = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aggregateBy: [{
            dataTypeName: 'com.google.step_count.delta',
            dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
          }],
          bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
          startTimeMillis: startTime.getTime(),
          endTimeMillis: endTime.getTime()
        })
      }
    )

    const fitnessData = await fitnessResponse.json()

    if (!fitnessResponse.ok) {
      console.error('Google Fit API error:', fitnessData)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch steps data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process and store steps data
    const stepsData = []
    if (fitnessData.bucket) {
      for (const bucket of fitnessData.bucket) {
        const date = new Date(parseInt(bucket.startTimeMillis))
        const dateStr = date.toISOString().split('T')[0]
        
        let totalSteps = 0
        if (bucket.dataset && bucket.dataset[0] && bucket.dataset[0].point) {
          for (const point of bucket.dataset[0].point) {
            if (point.value && point.value[0]) {
              totalSteps += point.value[0].intVal || 0
            }
          }
        }

        if (totalSteps > 0) {
          stepsData.push({
            user_id: user.id,
            date: dateStr,
            steps: totalSteps,
            source: 'google_fit'
          })
        }
      }
    }

    // Upsert steps data
    if (stepsData.length > 0) {
      const { error: insertError } = await supabase
        .from('daily_steps')
        .upsert(stepsData, { onConflict: 'user_id,date,source' })

      if (insertError) {
        console.error('Error inserting steps:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to save steps data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: stepsData.length,
        message: `Synced ${stepsData.length} days of step data`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error syncing Google Fit steps:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
