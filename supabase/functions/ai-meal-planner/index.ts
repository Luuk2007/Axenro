
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
      calorieGoal, 
      proteinGoal, 
      carbGoal, 
      fatGoal, 
      dietType, 
      allergies, 
      mealsPerDay 
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

    const prompt = `Create a comprehensive 7-day meal plan based on:
    - Daily Calories: ${calorieGoal}
    - Protein: ${proteinGoal}g
    - Carbs: ${carbGoal}g
    - Fat: ${fatGoal}g
    - Diet Type: ${dietType}
    - Allergies: ${allergies.length ? allergies.join(', ') : 'None'}
    - Meals per Day: ${mealsPerDay}

    Generate:
    1. Complete 7-day meal plan with recipes
    2. Nutritional breakdown for each meal
    3. Comprehensive shopping list organized by category
    4. Meal prep instructions

    Format as structured, readable text with clear sections, days, and meals.`;

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
            content: 'You are an expert nutritionist. Create detailed, healthy meal plans with accurate nutritional information and clear formatting.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to get AI response');
    }

    const aiData = await openAIResponse.json();
    const mealPlan = aiData.choices[0].message.content;

    // Save to database
    const title = `${dietType} Plan - ${calorieGoal} cal`;
    const { data, error } = await supabase
      .from('ai_meal_plans')
      .insert({
        user_id: user.id,
        title,
        calorie_goal: calorieGoal,
        protein_goal: proteinGoal,
        carb_goal: carbGoal,
        fat_goal: fatGoal,
        diet_type: dietType,
        allergies,
        meals_per_day: mealsPerDay,
        meal_plan: { content: mealPlan },
        shopping_list: { generated: true }
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving meal plan:', error);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      mealPlan: mealPlan,
      savedPlan: data 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-meal-planner:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
