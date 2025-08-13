
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
    const { message, messageType = 'fitness' } = await req.json();

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

    // Get recent chat history for context
    const { data: recentChats } = await supabase
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

    const systemPrompt = messageType === 'nutrition' 
      ? 'You are an expert nutritionist and dietitian. Provide helpful, accurate advice about nutrition, diet, and healthy eating habits.'
      : 'You are an expert fitness coach and personal trainer. Provide helpful, accurate advice about exercise, fitness, and health.';

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationContext ? [{ role: 'user', content: `Previous conversation context:\n${conversationContext}` }] : []),
      { role: 'user', content: message }
    ];

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
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to get AI response');
    }

    const aiData = await openAIResponse.json();
    const response = aiData.choices[0].message.content;

    // Save chat history
    const { error } = await supabase
      .from('ai_chat_history')
      .insert({
        user_id: user.id,
        message,
        response,
        message_type: messageType
      });

    if (error) {
      console.error('Error saving chat history:', error);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      response: response 
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
