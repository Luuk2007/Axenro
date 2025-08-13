
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
    const { images, measurements, analysisTitle } = await req.json();

    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Store images in Supabase Storage
    const imageUrls: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const fileName = `${user.id}/${Date.now()}_${i}.jpg`;
      
      // Convert base64 to blob
      const response = await fetch(image);
      const blob = await response.blob();
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('progress-images')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('progress-images')
        .getPublicUrl(fileName);
      
      imageUrls.push(urlData.publicUrl);
    }

    // Analyze images with OpenAI Vision
    const analysisPrompt = `Analyze these progress photos and body measurements for fitness/body composition changes:

    ${measurements ? `Measurements: ${JSON.stringify(measurements)}` : 'No measurements provided'}
    
    Provide:
    1. Detailed analysis of visible changes
    2. Areas of improvement and progress
    3. Specific recommendations for continued progress
    4. Motivation and encouragement
    5. Suggestions for tracking methods

    Be constructive, encouraging, and specific in your analysis.`;

    const messages = [
      { 
        role: 'system', 
        content: 'You are an expert fitness coach analyzing progress photos. Provide detailed, encouraging, and constructive feedback.' 
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: analysisPrompt },
          ...images.map((image: string) => ({
            type: 'image_url',
            image_url: { url: image }
          }))
        ]
      }
    ];

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 1000,
      }),
    });

    const aiData = await openAIResponse.json();
    const analysis = aiData.choices[0].message.content;

    // Save analysis to database
    const { data, error } = await supabase
      .from('ai_progress_analysis')
      .insert({
        user_id: user.id,
        title: analysisTitle || 'Progress Analysis',
        analysis_text: analysis,
        progress_images: imageUrls,
        measurements: measurements
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: analysis,
      savedAnalysis: data 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-progress-analyzer:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
