
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define AI tools for interacting with user data
const tools = [
  {
    type: "function",
    function: {
      name: "add_food_log",
      description: "Add a food/meal to the user's nutrition log. IMPORTANT: Only add ONE food item per function call. If the user mentions multiple items, call this function once for EACH item separately. Never combine multiple items into one call to avoid duplicates.",
      parameters: {
        type: "object",
        properties: {
          food_name: { type: "string", description: "Name of the food item" },
          calories: { type: "number", description: "Calories in the food" },
          protein: { type: "number", description: "Protein in grams" },
          carbs: { type: "number", description: "Carbohydrates in grams" },
          fat: { type: "number", description: "Fat in grams" },
          serving_size: { type: "string", description: "Serving size, e.g., '100g' or '1 cup'" },
          meal_type: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"], description: "Type of meal" },
          date: { type: "string", description: "Date in YYYY-MM-DD format, defaults to today" }
        },
        required: ["food_name", "calories", "protein", "carbs", "fat", "meal_type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_workout",
      description: "Add a workout or exercise to the user's workout log. For strength training, provide exercise details. For cardio (running, cycling, etc.), provide duration in seconds and distance in km.",
      parameters: {
        type: "object",
        properties: {
          workout_name: { type: "string", description: "Name of the workout (e.g., 'Morning Run', 'Chest Day')" },
          exercise_name: { type: "string", description: "Name of the primary exercise (e.g., 'Running', 'Bench Press')" },
          is_cardio: { type: "boolean", description: "True for cardio exercises (running, cycling, etc.), false for strength" },
          duration_seconds: { type: "number", description: "For cardio: total duration in seconds" },
          distance_km: { type: "number", description: "For cardio: total distance in kilometers" },
          sets: { type: "number", description: "For strength: number of sets performed" },
          reps: { type: "number", description: "For strength: reps per set" },
          weight_kg: { type: "number", description: "For strength: weight in kilograms per set" }
        },
        required: ["workout_name", "exercise_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_nutrition_data",
      description: "Get the user's nutrition/food logs for analysis. Use this to answer questions about what they've eaten, calories consumed, macros, etc.",
      parameters: {
        type: "object",
        properties: {
          days: { type: "number", description: "Number of days to retrieve, defaults to 7" },
          date: { type: "string", description: "Specific date in YYYY-MM-DD format" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_workout_data",
      description: "Get the user's workout history and exercise data. Use this to answer questions about their training, exercises performed, progress, etc.",
      parameters: {
        type: "object",
        properties: {
          days: { type: "number", description: "Number of days to retrieve, defaults to 30" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_weight_data",
      description: "Get the user's weight tracking data. Use this to analyze weight trends, progress towards goals, etc.",
      parameters: {
        type: "object",
        properties: {
          days: { type: "number", description: "Number of days to retrieve, defaults to 90" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_weight_entry",
      description: "Add a weight measurement for the user. Use this when they want to log their current weight.",
      parameters: {
        type: "object",
        properties: {
          weight: { type: "number", description: "Weight value in kg" },
          date: { type: "string", description: "Date in YYYY-MM-DD format, defaults to today" }
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
    const { message, messageType = 'nutrition', userContext, systemPrompt } = await req.json();

    // Create Supabase clients - one with user auth, one with service role for chat history
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Authenticate the user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Authentication failed');
    }

    console.log('Authenticated user:', user.id);

    // Get recent chat history for context (last 5 messages)
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

    // Build enhanced system prompt with user context
    let enhancedSystemPrompt = systemPrompt || 'You are a helpful fitness and nutrition assistant.';
    
    if (userContext) {
      if (userContext.recentFoodLogs && userContext.recentFoodLogs.length > 0) {
        const foodSummary = userContext.recentFoodLogs.slice(0, 3).map((log: any) => 
          `${log.date}: ${log.food_item.name} (${log.food_item.calories} calories, ${log.food_item.protein}g protein, ${log.food_item.carbs}g carbs, ${log.food_item.fat}g fat)`
        ).join(', ');
        enhancedSystemPrompt += ` Recent nutrition data: ${foodSummary}.`;
      }
      
      if (userContext.profile && userContext.profile.full_name) {
        enhancedSystemPrompt += ` User's name: ${userContext.profile.full_name}.`;
      }
    }

    enhancedSystemPrompt += ' Provide personalized, helpful advice based on the user\'s data and chat context. Keep responses conversational and encouraging.';

    const messages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...(conversationContext ? [{ role: 'user', content: `Previous conversation context:\n${conversationContext}` }] : []),
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI with context for user:', user.id);

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 800,
        tools,
        tool_choice: 'auto'
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to get AI response');
    }

    const aiData = await openAIResponse.json();
    const choice = aiData.choices[0];
    let response = choice.message.content || '';
    const toolCalls = choice.message.tool_calls;

    console.log('Received response from OpenAI');

    // Handle tool calls
    const toolResults = [];
    if (toolCalls && toolCalls.length > 0) {
      console.log('Processing tool calls:', toolCalls.length);
      
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        console.log(`Executing tool: ${functionName}`, functionArgs);
        
        try {
          if (functionName === 'add_food_log') {
            const today = new Date().toISOString().split('T')[0];
            const date = functionArgs.date || today;
            
            console.log(`[AI-CHAT] Adding food log: ${functionArgs.food_name} to ${functionArgs.meal_type} on ${date}`);
            
            const { error: foodError } = await supabaseAdmin
              .from('food_logs')
              .insert({
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
                date: date
              });
            
            if (foodError) {
              console.error('Error adding food log:', foodError);
              toolResults.push(`Failed to add food: ${foodError.message}`);
            } else {
              console.log(`[AI-CHAT] Successfully added ${functionArgs.food_name} to database`);
              toolResults.push(`✅ Successfully added ${functionArgs.food_name} to your ${functionArgs.meal_type} log for ${date}`);
            }
          } else if (functionName === 'add_workout') {
            // Create proper exercise structure based on workout type
            const exercises = [];
            
            if (functionArgs.is_cardio) {
              // For cardio: create one exercise with one set containing duration and distance
              exercises.push({
                id: functionArgs.exercise_name.toLowerCase().replace(/\s+/g, '-'),
                name: functionArgs.exercise_name,
                sets: [
                  {
                    id: 1,
                    reps: functionArgs.duration_seconds || 0,
                    weight: functionArgs.distance_km || 0,
                    completed: true,
                    isCardio: true
                  }
                ],
                muscleGroup: 'cardio'
              });
            } else {
              // For strength: create exercise with multiple sets
              const numSets = functionArgs.sets || 3;
              const setArray = [];
              for (let i = 1; i <= numSets; i++) {
                setArray.push({
                  id: i,
                  reps: functionArgs.reps || 10,
                  weight: functionArgs.weight_kg || 0,
                  completed: true
                });
              }
              
              exercises.push({
                id: functionArgs.exercise_name.toLowerCase().replace(/\s+/g, '-'),
                name: functionArgs.exercise_name,
                sets: setArray,
                muscleGroup: 'general'
              });
            }
            
            const { error: workoutError } = await supabaseAdmin
              .from('workouts')
              .insert({
                user_id: user.id,
                name: functionArgs.workout_name,
                workout_id: `workout-${Date.now()}`,
                exercises: exercises,
                date: new Date().toISOString().split('T')[0],
                completed: true
              });
            
            if (workoutError) {
              console.error('Error adding workout:', workoutError);
              toolResults.push(`Failed to add workout: ${workoutError.message}`);
            } else {
              toolResults.push(`✅ Successfully logged your ${functionArgs.workout_name} workout`);
            }
          } else if (functionName === 'get_nutrition_data') {
            const days = functionArgs.days || 7;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const { data: foodData, error: foodError } = await supabaseAdmin
              .from('food_logs')
              .select('*')
              .eq('user_id', user.id)
              .gte('date', startDate.toISOString().split('T')[0])
              .order('date', { ascending: false });
            
            if (foodError) {
              toolResults.push(`Error retrieving nutrition data: ${foodError.message}`);
            } else {
              const summary = foodData.map(log => 
                `${log.date} - ${log.meal_id}: ${log.food_item.name} (${log.food_item.calories}cal, P:${log.food_item.protein}g, C:${log.food_item.carbs}g, F:${log.food_item.fat}g)`
              ).join('\n');
              toolResults.push(`Nutrition data for last ${days} days:\n${summary}`);
            }
          } else if (functionName === 'get_workout_data') {
            const days = functionArgs.days || 30;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const { data: workoutData, error: workoutError } = await supabaseAdmin
              .from('workouts')
              .select('*')
              .eq('user_id', user.id)
              .gte('date', startDate.toISOString().split('T')[0])
              .order('date', { ascending: false });
            
            if (workoutError) {
              toolResults.push(`Error retrieving workout data: ${workoutError.message}`);
            } else {
              const summary = workoutData.map(workout => {
                const exerciseList = workout.exercises.map((ex: any) => 
                  `${ex.name} (${ex.sets}x${ex.reps}${ex.weight ? ` @ ${ex.weight}kg` : ''})`
                ).join(', ');
                return `${workout.date} - ${workout.name}: ${exerciseList}`;
              }).join('\n');
              toolResults.push(`Workout data for last ${days} days:\n${summary}`);
            }
          } else if (functionName === 'get_weight_data') {
            const days = functionArgs.days || 90;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const { data: weightData, error: weightError } = await supabaseAdmin
              .from('weight_data')
              .select('*')
              .eq('user_id', user.id)
              .gte('date', startDate.toISOString().split('T')[0])
              .order('date', { ascending: false });
            
            if (weightError) {
              toolResults.push(`Error retrieving weight data: ${weightError.message}`);
            } else {
              const summary = weightData.map(w => `${w.date}: ${w.weight}kg`).join('\n');
              toolResults.push(`Weight data for last ${days} days:\n${summary}`);
            }
          } else if (functionName === 'add_weight_entry') {
            const today = new Date().toISOString().split('T')[0];
            const date = functionArgs.date || today;
            
            const { error: weightError } = await supabaseAdmin
              .from('weight_data')
              .insert({
                user_id: user.id,
                weight: functionArgs.weight,
                date: date
              });
            
            if (weightError) {
              toolResults.push(`Failed to add weight: ${weightError.message}`);
            } else {
              toolResults.push(`✅ Successfully logged weight: ${functionArgs.weight}kg for ${date}`);
            }
          }
        } catch (error) {
          console.error(`Error executing ${functionName}:`, error);
          toolResults.push(`Error: ${error.message}`);
        }
      }
      
      // Add tool results to the response
      if (toolResults.length > 0) {
        response = toolResults.join('\n\n') + (response ? '\n\n' + response : '');
      }
    }

    console.log('Saving to database');

    // Save chat history using service role to bypass RLS
    const { error } = await supabaseAdmin
      .from('ai_chat_history')
      .insert({
        user_id: user.id,
        message,
        response,
        message_type: messageType
      });

    if (error) {
      console.error('Error saving chat history:', error);
    } else {
      console.log('Chat history saved successfully');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      response: response,
      tool_results: toolResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
