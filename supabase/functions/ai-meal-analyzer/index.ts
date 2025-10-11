
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mealDescription, portionSize = 1 } = await req.json();

    if (!mealDescription || typeof mealDescription !== 'string') {
      return new Response(JSON.stringify({ error: 'Meal description is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing meal:', mealDescription, 'Portion size:', portionSize);

    // Create a detailed prompt for nutritional analysis with better handling of multiple foods
    const systemPrompt = `You are a professional nutritionist with expertise in food analysis. 
Your task is to analyze meal descriptions and provide accurate nutritional estimates.

CRITICAL INSTRUCTIONS FOR MULTIPLE FOODS:
1. When multiple foods are mentioned, analyze EACH item separately first
2. Calculate the nutrition for each food item individually
3. Sum up all the values to get the TOTAL nutrition
4. Show your breakdown in the notes

ACCURACY GUIDELINES:
- Use standard portion sizes (e.g., 1 slice of bread = 30g, 100g chicken breast, 1 medium apple = 180g)
- For quantities like "2 slices" or "3 eggs", multiply the standard portion
- Account for cooking methods (fried vs grilled affects calories)
- Be conservative with estimates if unclear

CONFIDENCE LEVELS:
- "high": Specific quantities and common foods (e.g., "2 slices whole wheat bread")
- "medium": General descriptions (e.g., "chicken sandwich")
- "low": Vague descriptions (e.g., "some pasta")`;

    const userPrompt = `Analyze this meal and provide total nutritional values:

Meal Description: "${mealDescription}"
Portion Multiplier: ${portionSize}x

Instructions:
1. Identify all food items in the description
2. Calculate nutrition for each item separately
3. Multiply each by the portion multiplier (${portionSize})
4. Sum all values for the total
5. In notes, briefly show your breakdown (e.g., "Bread: 150cal + Chicken: 200cal + Cheese: 100cal = 450cal total")

Provide accurate totals in the response.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_nutrition_analysis",
              description: "Provide detailed nutritional analysis for a meal",
              parameters: {
                type: "object",
                properties: {
                  calories: {
                    type: "number",
                    description: "Total calories for the entire meal"
                  },
                  protein: {
                    type: "number",
                    description: "Total protein in grams"
                  },
                  carbs: {
                    type: "number",
                    description: "Total carbohydrates in grams"
                  },
                  fat: {
                    type: "number",
                    description: "Total fat in grams"
                  },
                  confidence: {
                    type: "string",
                    enum: ["high", "medium", "low"],
                    description: "Confidence level of the estimate"
                  },
                  notes: {
                    type: "string",
                    description: "Brief breakdown showing individual food items and their contributions to the total"
                  }
                },
                required: ["calories", "protein", "carbs", "fat", "confidence", "notes"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: {
          type: "function",
          function: { name: "provide_nutrition_analysis" }
        },
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return new Response(JSON.stringify({ error: 'Failed to analyze meal with AI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Full AI Response:', JSON.stringify(data, null, 2));

    // Extract nutrition data from tool call response
    let nutritionData;
    try {
      const toolCall = data.choices[0]?.message?.tool_calls?.[0];
      
      if (!toolCall || !toolCall.function || !toolCall.function.arguments) {
        console.error('No tool call in response:', data);
        return new Response(JSON.stringify({ error: 'Invalid AI response format' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      nutritionData = JSON.parse(toolCall.function.arguments);
      console.log('Parsed nutrition data:', nutritionData);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(JSON.stringify({ error: 'Failed to parse AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate the response structure
    if (!nutritionData.calories || !nutritionData.protein || !nutritionData.carbs || !nutritionData.fat) {
      console.error('Invalid nutrition data structure:', nutritionData);
      return new Response(JSON.stringify({ error: 'Incomplete nutrition analysis' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Round values to reasonable precision
    const result = {
      calories: Math.round(nutritionData.calories),
      protein: Math.round(nutritionData.protein * 10) / 10,
      carbs: Math.round(nutritionData.carbs * 10) / 10,
      fat: Math.round(nutritionData.fat * 10) / 10,
      confidence: nutritionData.confidence || 'medium',
      notes: nutritionData.notes || 'Nutritional estimate based on meal description'
    };

    console.log('Final result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-meal-analyzer function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
