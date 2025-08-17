
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Send, User, Bot, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  message_type: string;
  created_at: string;
}

type AIMode = 'nutrition' | 'workout' | 'progress';

export default function AIChat() {
  const { t } = useLanguage();
  const { session, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [aiMode, setAiMode] = useState<AIMode>('nutrition');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userContext, setUserContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      loadChatHistory();
      loadUserContext();
    }
  }, [aiMode, session]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadUserContext = async () => {
    if (!session) return;
    
    try {
      // Load user's nutrition, workout, and progress data for personalization
      const [foodLogs, profileData] = await Promise.all([
        supabase
          .from('food_logs')
          .select('*')
          .eq('user_id', user?.id)
          .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single()
      ]);

      setUserContext({
        recentFoodLogs: foodLogs.data || [],
        profile: profileData.data || {},
        userId: user?.id
      });
    } catch (error) {
      console.error('Error loading user context:', error);
    }
  };

  const loadChatHistory = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('message_type', aiMode)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setChatHistory(data || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast.error('Failed to load chat history');
    }
  };

  const clearChatHistory = async () => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('ai_chat_history')
        .delete()
        .eq('message_type', aiMode);

      if (error) throw error;

      setChatHistory([]);
      toast.success('Chat history cleared');
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast.error('Failed to clear chat history');
    }
  };

  const getModePrompt = (mode: AIMode) => {
    const basePrompts = {
      nutrition: 'You are an expert nutritionist and dietitian. Provide helpful, accurate advice about nutrition, diet, and healthy eating habits.',
      workout: 'You are an expert fitness coach and personal trainer. Provide helpful, accurate advice about exercise, fitness, and workout planning.',
      progress: 'You are an expert fitness progress analyst. Help users understand their fitness journey, analyze their progress, and provide motivation and guidance.'
    };

    let contextPrompt = basePrompts[mode];

    if (userContext && userContext.recentFoodLogs.length > 0 && mode === 'nutrition') {
      const recentFoods = userContext.recentFoodLogs.slice(0, 5).map((log: any) => 
        `${log.date}: ${log.food_item.name} (${log.food_item.calories} cal)`
      ).join(', ');
      contextPrompt += ` The user has recently logged these foods: ${recentFoods}. Use this context to provide personalized advice.`;
    }

    return contextPrompt;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !session) return;

    const currentMessage = message;
    setMessage('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: currentMessage,
          messageType: aiMode,
          userContext: userContext,
          systemPrompt: getModePrompt(aiMode)
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      // Reload chat history to get the updated conversation
      await loadChatHistory();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('Failed to send message'));
      setMessage(currentMessage); // Restore message
    } finally {
      setLoading(false);
    }
  };

  const deleteChatMessage = async (chatId: string) => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('ai_chat_history')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const getModeLabel = (mode: AIMode) => {
    const labels = {
      nutrition: 'Nutrition Coach',
      workout: 'Workout Planner', 
      progress: 'Progress Analyst'
    };
    return labels[mode];
  };

  const getModePlaceholder = (mode: AIMode) => {
    const placeholders = {
      nutrition: 'Ask about nutrition, meal planning, or dietary advice...',
      workout: 'Ask about workouts, exercise routines, or fitness goals...',
      progress: 'Ask about your progress, achievements, or motivation...'
    };
    return placeholders[mode];
  };

  if (!session) {
    return (
      <div className="text-center py-8">
        <Bot className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">{t('Please sign in to access AI chat')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={aiMode} onValueChange={(value: AIMode) => setAiMode(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nutrition">🥗 Nutrition Coach</SelectItem>
            <SelectItem value="workout">💪 Workout Planner</SelectItem>
            <SelectItem value="progress">📊 Progress Analyst</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={clearChatHistory}
        >
          {t('Clear Chat')}
        </Button>
      </div>

      <Card className="h-96 overflow-y-auto p-4 space-y-4 bg-background">
        {chatHistory.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="mx-auto h-12 w-12 mb-2" />
            <p className="font-medium">Chat with your {getModeLabel(aiMode)}</p>
            <p className="text-sm mt-1">Start a conversation to get personalized advice!</p>
          </div>
        ) : (
          chatHistory.map((chat) => (
            <div key={chat.id} className="space-y-3">
              {/* User Message */}
              <div className="flex items-start gap-3 justify-end group">
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={() => deleteChatMessage(chat.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-2 max-w-[80%]">
                  <p className="text-sm">{chat.message}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </div>
              
              {/* AI Response */}
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-muted p-2 flex-shrink-0">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%]">
                  <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{chat.response}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-muted p-2 flex-shrink-0">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={getModePlaceholder(aiMode)}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
