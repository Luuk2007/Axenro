
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are a professional nutritionist with expertise in food analysis. 
Your task is to analyze meal descriptions or photos and provide accurate nutritional estimates.

CRITICAL INSTRUCTIONS FOR MULTIPLE FOODS:
1. When multiple foods are mentioned or visible, analyze EACH item separately first
2. Calculate the nutrition for each food item individually
3. Sum up all the values to get the TOTAL nutrition
4. Show your breakdown in the notes

ACCURACY GUIDELINES:
- Use standard portion sizes (e.g., 1 slice of bread = 30g, 100g chicken breast, 1 medium apple = 180g)
- For quantities like "2 slices" or "3 eggs", multiply the standard portion
- Account for cooking methods (fried vs grilled affects calories)
- Be conservative with estimates if unclear

PHOTO ANALYSIS GUIDELINES (when analyzing a photo):
- Identify each distinct food item visible on the plate/in the image
- Estimate portion sizes based on plate size, utensils, or other reference objects
- If foods are mixed together (e.g., a stew), estimate total weight and composition
- Note any sauces, dressings, or toppings that add calories
- If the image is unclear or not food, say so in the notes and give low confidence

CONFIDENCE LEVELS:
- "high": Specific quantities and common foods clearly visible or described
- "medium": General descriptions or partially visible foods
- "low": Vague descriptions, blurry images, or mixed/unclear foods`;

const toolDefinition = {
  type: "function",
  function: {
    name: "provide_nutrition_analysis",
    description: "Provide detailed nutritional analysis for a meal",
    parameters: {
      type: "object",
      properties: {
        calories: { type: "number", description: "Total calories for the entire meal" },
        protein: { type: "number", description: "Total protein in grams" },
        carbs: { type: "number", description: "Total carbohydrates in grams" },
        fat: { type: "number", description: "Total fat in grams" },
        confidence: { type: "string", enum: ["high", "medium", "low"], description: "Confidence level of the estimate" },
        notes: { type: "string", description: "Brief breakdown showing individual food items and their contributions to the total" }
      },
      required: ["calories", "protein", "carbs", "fat", "confidence", "notes"],
      additionalProperties: false
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mealDescription, imageBase64, portionSize = 1 } = await req.json();

    const hasText = mealDescription && typeof mealDescription === 'string' && mealDescription.trim();
    const hasImage = imageBase64 && typeof imageBase64 === 'string';

    if (!hasText && !hasImage) {
      return new Response(JSON.stringify({ error: 'Meal description or image is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use Lovable AI Gateway (supports vision via Gemini)
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing meal:', hasText ? mealDescription : '(photo)', 'Portion size:', portionSize);

    // Build user message content
    const userContent: any[] = [];

    if (hasImage) {
      userContent.push({
        type: "image_url",
        image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` }
      });
      userContent.push({
        type: "text",
        text: hasText 
          ? `Analyze this photo of food along with the description: "${mealDescription}". Portion Multiplier: ${portionSize}x. Identify all food items, estimate portions, calculate nutrition for each, multiply by the portion multiplier, and sum all values. In notes, show your breakdown.`
          : `Analyze this photo of food. Portion Multiplier: ${portionSize}x. Identify all visible food items, estimate portion sizes based on visual cues, calculate nutrition for each item, multiply by the portion multiplier, and sum all values. In notes, show your breakdown and describe what you identified.`
      });
    } else {
      userContent.push({
        type: "text",
        text: `Analyze this meal and provide total nutritional values:\n\nMeal Description: "${mealDescription}"\nPortion Multiplier: ${portionSize}x\n\nInstructions:\n1. Identify all food items in the description\n2. Calculate nutrition for each item separately\n3. Multiply each by the portion multiplier (${portionSize})\n4. Sum all values for the total\n5. In notes, briefly show your breakdown`
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        tools: [toolDefinition],
        tool_choice: { type: "function", function: { name: "provide_nutrition_analysis" } },
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      console.error('AI API error:', status, response.statusText);
      if (status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Failed to analyze meal with AI' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('AI Response received');

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error('No tool call in response:', JSON.stringify(data));
      return new Response(JSON.stringify({ error: 'Invalid AI response format' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const nutritionData = JSON.parse(toolCall.function.arguments);

    if (!nutritionData.calories && !nutritionData.protein && !nutritionData.carbs && !nutritionData.fat) {
      return new Response(JSON.stringify({ error: 'Incomplete nutrition analysis' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = {
      calories: Math.round(nutritionData.calories || 0),
      protein: Math.round((nutritionData.protein || 0) * 10) / 10,
      carbs: Math.round((nutritionData.carbs || 0) * 10) / 10,
      fat: Math.round((nutritionData.fat || 0) * 10) / 10,
      confidence: nutritionData.confidence || 'medium',
      notes: nutritionData.notes || 'Nutritional estimate based on analysis'
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-meal-analyzer function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
