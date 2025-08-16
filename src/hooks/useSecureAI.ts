
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { validateChatInput, checkRateLimit } from '@/utils/securityUtils';
import { toast } from 'sonner';

interface AIFunctionParams {
  functionName: 'ai-chat' | 'ai-meal-planner' | 'ai-workout-coach' | 'ai-progress-analyzer' | 'ai-meal-analyzer';
  body: any;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useSecureAI = () => {
  const [loading, setLoading] = useState(false);
  const { user, session } = useAuth();

  const callAIFunction = async ({ functionName, body, onSuccess, onError }: AIFunctionParams) => {
    if (!user || !session) {
      toast.error('Authentication required');
      return;
    }

    setLoading(true);

    try {
      // Validate input if it's a chat message
      if (functionName === 'ai-chat' && body.message) {
        const validation = validateChatInput(body.message);
        if (!validation.isValid) {
          toast.error(validation.error || 'Invalid input');
          setLoading(false);
          return;
        }
      }

      // Validate meal description for meal analyzer
      if (functionName === 'ai-meal-analyzer' && body.mealDescription) {
        const validation = validateChatInput(body.mealDescription);
        if (!validation.isValid) {
          toast.error(validation.error || 'Invalid meal description');
          setLoading(false);
          return;
        }
      }

      // Check rate limiting
      const rateLimitCheck = await checkRateLimit(functionName, user.id);
      if (!rateLimitCheck.allowed) {
        toast.error(rateLimitCheck.error || 'Rate limit exceeded');
        setLoading(false);
        return;
      }

      // Call the function
      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        if (onError) {
          onError(error);
        } else {
          toast.error('An error occurred. Please try again.');
        }
        return;
      }

      if (onSuccess) {
        onSuccess(data);
      }

      return data;
    } catch (error) {
      console.error(`Unexpected error calling ${functionName}:`, error);
      if (onError) {
        onError(error);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    callAIFunction,
    loading
  };
};
