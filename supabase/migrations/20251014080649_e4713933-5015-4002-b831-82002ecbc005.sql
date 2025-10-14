-- Add service role policies for ai_chat_history to allow edge functions to insert
-- This allows the edge function to insert chat history on behalf of authenticated users

CREATE POLICY "Service role can insert chat history"
ON public.ai_chat_history
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update chat history"
ON public.ai_chat_history
FOR UPDATE
TO service_role
USING (true);