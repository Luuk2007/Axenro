
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const tools = [
  {
    type: "function",
    function: {
      name: "add_food_log",
      description: "Add a food/meal to the user's nutrition log. Only add ONE food item per call.",
      parameters: {
        type: "object",
        properties: {
          food_name: { type: "string", description: "Name of the food item" },
          calories: { type: "number", description: "Calories in the food" },
          protein: { type: "number", description: "Protein in grams" },
          carbs: { type: "number", description: "Carbohydrates in grams" },
          fat: { type: "number", description: "Fat in grams" },
          serving_size: { type: "string", description: "Serving size" },
          meal_type: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"], description: "Type of meal" },
          date: { type: "string", description: "Date in YYYY-MM-DD format" }
        },
        required: ["food_name", "calories", "protein", "carbs", "fat", "meal_type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_workout",
      description: "Add a workout to the user's log.",
      parameters: {
        type: "object",
        properties: {
          workout_name: { type: "string" },
          exercise_name: { type: "string" },
          is_cardio: { type: "boolean" },
          duration_seconds: { type: "number" },
          distance_km: { type: "number" },
          sets: { type: "number" },
          reps: { type: "number" },
          weight_kg: { type: "number" }
        },
        required: ["workout_name", "exercise_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_nutrition_data",
      description: "Get the user's nutrition/food logs.",
      parameters: {
        type: "object",
        properties: {
          days: { type: "number", description: "Number of days, defaults to 7" },
          date: { type: "string", description: "Specific date YYYY-MM-DD" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_workout_data",
      description: "Get the user's workout history.",
      parameters: {
        type: "object",
        properties: {
          days: { type: "number", description: "Number of days, defaults to 30" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_weight_data",
      description: "Get the user's weight data.",
      parameters: {
        type: "object",
        properties: {
          days: { type: "number", description: "Number of days, defaults to 90" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_weight_entry",
      description: "Add a weight measurement.",
      parameters: {
        type: "object",
        properties: {
          weight: { type: "number", description: "Weight in kg" },
          date: { type: "string", description: "Date YYYY-MM-DD" }
        },
        required: ["weight"]
      }
    }
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, messageType = 'general', userContext, systemPrompt } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !user) throw new Error('Authentication failed');

    // Get recent chat history for context
    const { data: recentChats } = await supabaseAdmin
      .from('ai_chat_history')
      .select('message, response')
      .eq('user_id', user.id)
      .eq('message_type', messageType)
      .order('created_at', { ascending: false })
      .limit(5);

    const conversationContext = recentChats
      ?.reverse()
      .map(chat => `Human: ${chat.message}\nAssistant: ${chat.response}`)
      .join('\n\n') || '';

    let enhancedSystemPrompt = systemPrompt || 'You are Axenro AI, an expert fitness and nutrition assistant. Be concise, use markdown, be encouraging.';
    
    if (userContext?.profile?.full_name) {
      enhancedSystemPrompt += ` User's name: ${userContext.profile.full_name}.`;
    }

    const messages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...(conversationContext ? [{ role: 'user', content: `Previous context:\n${conversationContext}` }] : []),
      { role: 'user', content: message }
    ];

    // Use Lovable AI Gateway for faster responses
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    let apiUrl: string;
    let apiKey: string;
    let model: string;

    if (LOVABLE_API_KEY) {
      apiUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';
      apiKey = LOVABLE_API_KEY;
      model = 'google/gemini-3-flash-preview';
    } else if (OPENAI_API_KEY) {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      apiKey = OPENAI_API_KEY;
      model = 'gpt-4o-mini';
    } else {
      throw new Error('No AI API key configured');
    }

    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        tools,
        tool_choice: 'auto'
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error('Failed to get AI response');
    }

    const aiData = await aiResponse.json();
    const choice = aiData.choices[0];
    let response = choice.message.content || '';
    const toolCalls = choice.message.tool_calls;

    // Handle tool calls (same as before)
    const toolResults: string[] = [];
    if (toolCalls && toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        try {
          if (functionName === 'add_food_log') {
            const date = functionArgs.date || new Date().toISOString().split('T')[0];
            const { error: foodError } = await supabaseAdmin.from('food_logs').insert({
              user_id: user.id,
              meal_id: functionArgs.meal_type,
              food_item: {
                name: functionArgs.food_name,
                calories: functionArgs.calories,
                protein: functionArgs.protein,
                carbs: functionArgs.carbs,
                fat: functionArgs.fat,
                serving_size: functionArgs.serving_size || '1 serving'
              },
              date
            });
            toolResults.push(foodError
              ? `Failed to add food: ${foodError.message}`
              : `✅ Successfully added ${functionArgs.food_name} to your ${functionArgs.meal_type} log`);
          } else if (functionName === 'add_workout') {
            const exercises = [];
            if (functionArgs.is_cardio) {
              exercises.push({
                id: functionArgs.exercise_name.toLowerCase().replace(/\s+/g, '-'),
                name: functionArgs.exercise_name,
                sets: [{ id: 1, reps: functionArgs.duration_seconds || 0, weight: functionArgs.distance_km || 0, completed: true, isCardio: true }],
                muscleGroup: 'cardio'
              });
            } else {
              const setArray = [];
              for (let i = 1; i <= (functionArgs.sets || 3); i++) {
                setArray.push({ id: i, reps: functionArgs.reps || 10, weight: functionArgs.weight_kg || 0, completed: true });
              }
              exercises.push({
                id: functionArgs.exercise_name.toLowerCase().replace(/\s+/g, '-'),
                name: functionArgs.exercise_name,
                sets: setArray,
                muscleGroup: 'general'
              });
            }
            const { error: workoutError } = await supabaseAdmin.from('workouts').insert({
              user_id: user.id, name: functionArgs.workout_name, workout_id: `workout-${Date.now()}`,
              exercises, date: new Date().toISOString().split('T')[0], completed: true
            });
            toolResults.push(workoutError ? `Failed: ${workoutError.message}` : `✅ Logged ${functionArgs.workout_name}`);
          } else if (functionName === 'get_nutrition_data') {
            const days = functionArgs.days || 7;
            const startDate = new Date(); startDate.setDate(startDate.getDate() - days);
            const { data: foodData } = await supabaseAdmin.from('food_logs').select('*').eq('user_id', user.id)
              .gte('date', startDate.toISOString().split('T')[0]).order('date', { ascending: false });
            const summary = (foodData || []).map(log => 
              `${log.date} - ${log.meal_id}: ${(log.food_item as any).name} (${(log.food_item as any).calories}cal)`
            ).join('\n');
            toolResults.push(`Nutrition data:\n${summary}`);
          } else if (functionName === 'get_workout_data') {
            const days = functionArgs.days || 30;
            const startDate = new Date(); startDate.setDate(startDate.getDate() - days);
            const { data: workoutData } = await supabaseAdmin.from('workouts').select('*').eq('user_id', user.id)
              .gte('date', startDate.toISOString().split('T')[0]).order('date', { ascending: false });
            const summary = (workoutData || []).map(w => `${w.date} - ${w.name}`).join('\n');
            toolResults.push(`Workout data:\n${summary}`);
          } else if (functionName === 'get_weight_data') {
            const days = functionArgs.days || 90;
            const startDate = new Date(); startDate.setDate(startDate.getDate() - days);
            const { data: weightData } = await supabaseAdmin.from('weight_data').select('*').eq('user_id', user.id)
              .gte('date', startDate.toISOString().split('T')[0]).order('date', { ascending: false });
            const summary = (weightData || []).map(w => `${w.date}: ${w.weight}kg`).join('\n');
            toolResults.push(`Weight data:\n${summary}`);
          } else if (functionName === 'add_weight_entry') {
            const date = functionArgs.date || new Date().toISOString().split('T')[0];
            const { error: weightError } = await supabaseAdmin.from('weight_data').insert({
              user_id: user.id, weight: functionArgs.weight, date
            });
            toolResults.push(weightError ? `Failed: ${weightError.message}` : `✅ Logged ${functionArgs.weight}kg`);
          }
        } catch (error) {
          toolResults.push(`Error: ${error.message}`);
        }
      }
      if (toolResults.length > 0) {
        response = toolResults.join('\n\n') + (response ? '\n\n' + response : '');
      }
    }

    // Save chat history
    await supabaseAdmin.from('ai_chat_history').insert({
      user_id: user.id, message, response, message_type: messageType
    });

    return new Response(JSON.stringify({ success: true, response, tool_results: toolResults }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
