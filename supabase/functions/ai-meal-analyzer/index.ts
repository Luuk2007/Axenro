
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

    // Create a detailed prompt for nutritional analysis
    const prompt = `Analyze the following meal description and provide nutritional information per serving. 
    
Meal: "${mealDescription}"
Portion size multiplier: ${portionSize}

Please provide a JSON response with the following structure:
{
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams),
  "confidence": "high" | "medium" | "low",
  "notes": "brief explanation of estimation"
}

Consider standard serving sizes and multiply by the portion size provided. Be realistic with estimates based on typical ingredients and preparation methods. If the description is vague, make reasonable assumptions and indicate lower confidence.`;

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
            content: 'You are a nutrition expert. Analyze meal descriptions and provide accurate nutritional estimates in JSON format. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
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
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Parse the JSON response from AI
    let nutritionData;
    try {
      nutritionData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid response from AI' }), {
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
