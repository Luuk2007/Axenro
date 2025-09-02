
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
    const { message, messageType = 'nutrition', userContext, systemPrompt } = await req.json();

    // Create Supabase client with proper auth handling
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Set the auth token for this request - this ensures RLS works correctly
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Authentication failed');
    }

    // Set the session for the supabase client to ensure RLS policies work
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: '', // Not needed for this operation
    });

    console.log('Authenticated user:', user.id);

    // Get recent chat history for context (last 5 messages)
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
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to get AI response');
    }

    const aiData = await openAIResponse.json();
    const response = aiData.choices[0].message.content;

    console.log('Received response from OpenAI, saving to database');

    // Save chat history with proper auth context
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
    } else {
      console.log('Chat history saved successfully');
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
