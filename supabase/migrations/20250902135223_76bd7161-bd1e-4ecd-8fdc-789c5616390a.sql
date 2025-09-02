-- Enable RLS on ai_chat_history table if not already enabled
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own chat history
CREATE POLICY "Users can view their own chat history" 
ON ai_chat_history 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for users to insert their own chat history
CREATE POLICY "Users can insert their own chat history" 
ON ai_chat_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own chat history
CREATE POLICY "Users can delete their own chat history" 
ON ai_chat_history 
FOR DELETE 
USING (auth.uid() = user_id);