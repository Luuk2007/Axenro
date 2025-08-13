
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      goals, 
      experienceLevel, 
      trainingDays, 
      sessionLength, 
      equipment, 
      injuries 
    } = await req.json();

    // Create Supabase client with proper auth handling
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get the authorization header and set it for the supabase client
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Set the auth token for this request
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Authentication failed');
    }

    console.log('Authenticated user:', user.id);

    const prompt = `Create a comprehensive workout plan based on:
    - Goals: ${goals}
    - Experience Level: ${experienceLevel}
    - Training Days per Week: ${trainingDays}
    - Session Length: ${sessionLength} minutes
    - Available Equipment: ${equipment.join(', ')}
    - Injuries/Limitations: ${injuries || 'None'}

    Generate a detailed workout plan with:
    1. Weekly schedule
    2. Specific exercises for each day
    3. Sets, reps, and rest periods
    4. Progression guidelines
    5. Tips and modifications

    Format as a structured, readable text with clear sections and bullet points.`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert personal trainer. Create detailed, safe, and effective workout plans with clear structure and formatting.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to get AI response');
    }

    const aiData = await openAIResponse.json();
    const workoutPlan = aiData.choices[0].message.content;

    // Save to database
    const title = `${goals} - ${trainingDays} Days/Week`;
    const { data, error } = await supabase
      .from('ai_workout_plans')
      .insert({
        user_id: user.id,
        title,
        goals,
        experience_level: experienceLevel,
        training_days: trainingDays,
        session_length: sessionLength,
        available_equipment: equipment,
        injuries,
        workout_plan: { content: workoutPlan }
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving workout plan:', error);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      workoutPlan: workoutPlan,
      savedPlan: data 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-workout-coach:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
