
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define AI tools for adding meals and workouts
const tools = [
  {
    type: "function",
    function: {
      name: "add_food_log",
      description: "Add a food/meal to the user's nutrition log for a specific date. Use this when the user asks to log a meal, food item, or track nutrition.",
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
      description: "Add a workout or exercise to the user's workout log. Use this when the user asks to log a workout, exercise session, or track their training.",
      parameters: {
        type: "object",
        properties: {
          workout_name: { type: "string", description: "Name of the workout" },
          workout_type: { type: "string", enum: ["strength", "cardio", "flexibility", "sports"], description: "Type of workout" },
          duration: { type: "number", description: "Duration in minutes" },
          exercises: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                sets: { type: "number" },
                reps: { type: "number" },
                weight: { type: "number" }
              }
            },
            description: "List of exercises performed"
          },
          notes: { type: "string", description: "Additional notes about the workout" }
        },
        required: ["workout_name", "workout_type", "duration"]
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
            
            // Generate a unique meal_id
            const mealId = `${functionArgs.meal_type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            const { error: foodError } = await supabaseAdmin
              .from('food_logs')
              .insert({
                user_id: user.id,
                meal_id: mealId,
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
              toolResults.push(`Successfully added ${functionArgs.food_name} to your ${functionArgs.meal_type} log for ${date}`);
            }
          } else if (functionName === 'add_workout') {
            const { error: workoutError } = await supabaseAdmin
              .from('workouts')
              .insert({
                user_id: user.id,
                name: functionArgs.workout_name,
                type: functionArgs.workout_type,
                duration: functionArgs.duration,
                exercises: functionArgs.exercises || [],
                notes: functionArgs.notes || '',
                date: new Date().toISOString().split('T')[0]
              });
            
            if (workoutError) {
              console.error('Error adding workout:', workoutError);
              toolResults.push(`Failed to add workout: ${workoutError.message}`);
            } else {
              toolResults.push(`Successfully logged your ${functionArgs.workout_name} workout`);
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
