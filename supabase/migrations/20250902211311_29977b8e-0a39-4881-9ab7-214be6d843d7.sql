-- Clean up all existing duplicate/broken policies on ai_chat_history
DROP POLICY IF EXISTS "Users can view their own AI chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can select their own chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can insert their own chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can update their own chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can delete their own chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can delete their own AI chat history" ON ai_chat_history;

-- Create clean, working RLS policies
CREATE POLICY "Users can select their own chat history" 
ON ai_chat_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat history" 
ON ai_chat_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat history" 
ON ai_chat_history 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat history" 
ON ai_chat_history 
FOR DELETE 
USING (auth.uid() = user_id);