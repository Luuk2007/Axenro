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

    const { profilePictureUrl } = await req.json();
    if (!profilePictureUrl) {
      throw new Error('Profile picture URL is required');
    }

    console.log('Starting AI avatar generation for user:', user.id);

    // Update status to generating
    await supabaseClient
      .from('profiles')
      .update({ ai_avatar_status: 'generating' })
      .eq('id', user.id);

    // Download the profile picture
    const imageResponse = await fetch(profilePictureUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download profile picture');
    }
    
    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    // Generate AI avatar using Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Generate a simplified, cartoon-style fitness coach avatar from this photo. Style: friendly, energetic, digital illustration, clean lines, vibrant colors suitable for a fitness app. Make it recognizable but stylized. Keep the facial features similar but more cartoonish and appealing.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI generation failed:', aiResponse.status, errorText);
      throw new Error('AI generation failed');
    }

    const aiData = await aiResponse.json();
    const generatedImageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      throw new Error('No image generated');
    }

    // Convert base64 to blob and upload to storage
    const base64Data = generatedImageUrl.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const fileName = `${user.id}/ai-avatar-${Date.now()}.png`;
    
    const { error: uploadError } = await supabaseClient.storage
      .from('ai-avatars')
      .upload(fileName, bytes, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload avatar');
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from('ai-avatars')
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;

    // Update profile with avatar URL
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        ai_avatar_url: avatarUrl,
        ai_avatar_generated_at: new Date().toISOString(),
        ai_avatar_status: 'completed'
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Failed to update profile');
    }

    console.log('Avatar generated successfully:', avatarUrl);

    return new Response(
      JSON.stringify({
        success: true,
        avatarUrl,
        status: 'completed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-ai-avatar:', error);
    
    // Try to update status to failed
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
      );

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        await supabaseClient
          .from('profiles')
          .update({ ai_avatar_status: 'failed' })
          .eq('id', user.id);
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        status: 'failed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
