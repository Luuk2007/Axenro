import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Generating motivation for user:', user.id);

    // Fetch user data for context
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [workoutsData, nutritionData, profileData, weightData, progressPhotos] = await Promise.all([
      supabaseClient
        .from('workouts_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false }),
      supabaseClient
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0]),
      supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabaseClient
        .from('weight_data')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10),
      supabaseClient
        .from('progress_photos')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5)
    ]);

    const workouts = workoutsData.data || [];
    const nutrition = nutritionData.data || [];
    const profile = profileData.data;
    const weight = weightData.data || [];
    const photos = progressPhotos.data || [];

    // Prepare context for AI
    const context = {
      recentWorkouts: workouts.length,
      lastWorkoutDate: workouts[0]?.date || null,
      weeklyGoal: profile?.weekly_workout_goal || 3,
      nutritionDays: nutrition.length,
      weightTrend: weight.length > 1 ? (weight[0].weight - weight[weight.length - 1].weight) : 0,
      recentPhotos: photos.length,
      fitnessGoal: profile?.fitness_goal || 'general'
    };

    // Calculate days since last workout
    let daysSinceWorkout = 0;
    if (context.lastWorkoutDate) {
      const lastDate = new Date(context.lastWorkoutDate);
      const today = new Date();
      daysSinceWorkout = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Use Lovable AI to generate motivation
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an enthusiastic fitness coach. Generate a SHORT motivational message (max 60 characters) based on the user's recent activity. 
Rules:
- Use emojis appropriately (🔥💪🎯👏🧠⚡)
- Be encouraging and specific
- Reference actual data when possible
- Keep it under 60 characters
- Make it friendly and energetic`;

    const userPrompt = `User activity:
- Workouts this week: ${context.recentWorkouts}/${context.weeklyGoal}
- Days since last workout: ${daysSinceWorkout}
- Weight trend: ${context.weightTrend > 0 ? 'up' : context.weightTrend < 0 ? 'down' : 'stable'} ${Math.abs(context.weightTrend).toFixed(1)} kg
- Nutrition tracked days: ${context.nutritionDays}
- Recent progress photos: ${context.recentPhotos}
- Goal: ${context.fitnessGoal}

Generate a motivational message.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI generation failed');
    }

    const aiData = await aiResponse.json();
    let motivation = aiData.choices?.[0]?.message?.content || '💪 Keep pushing forward!';

    // Ensure it's under 60 characters
    if (motivation.length > 60) {
      motivation = motivation.substring(0, 57) + '...';
    }

    // Update profile with motivation
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        last_motivation_message: motivation,
        last_motivation_generated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    console.log('Motivation generated:', motivation);

    return new Response(
      JSON.stringify({ success: true, motivation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-avatar-motivation:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
