-- Check if policies exist and drop/recreate them to ensure they work properly
DROP POLICY IF EXISTS "Users can view their own chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can insert their own chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can delete their own chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can create their own AI chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can update their own AI chat history" ON ai_chat_history;

-- Recreate clean policies
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