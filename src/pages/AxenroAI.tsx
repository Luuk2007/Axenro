
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Send, User, Bot, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AuthenticationDialog from '@/components/auth/AuthenticationDialog';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  message_type: string;
  created_at: string;
}

type AIMode = 'general' | 'workout' | 'nutrition' | 'progress';

const modeStarterSuggestions = {
  general: [
    "Give me a full-body workout",
    "How do I stay consistent?",
    "Create a balanced fitness plan"
  ],
  workout: [
    "Generate a push day workout",
    "Best leg exercises?",
    "Weekly strength program"
  ],
  nutrition: [
    "Plan 3 high-protein meals",
    "Calorie estimate for pasta dish",
    "Snack ideas under 200 calories"
  ],
  progress: [
    "Show my workout progress",
    "Track weight changes",
    "Summarize my last 7 days"
  ]
};

export default function AxenroAI() {
  const { t } = useLanguage();
  const { session, user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [aiMode, setAiMode] = useState<AIMode>('general');
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
      general: 'You are Axenro AI, a comprehensive fitness and wellness assistant. Provide helpful advice on fitness, nutrition, health, and wellness topics. Be encouraging and supportive.',
      workout: 'You are an expert fitness coach and personal trainer. Provide helpful, accurate advice about exercise, fitness, and workout planning. Focus on proper form, progression, and safety.',
      nutrition: 'You are an expert nutritionist and dietitian. Provide helpful, accurate advice about nutrition, diet, and healthy eating habits. Focus on evidence-based recommendations.',
      progress: 'You are an expert fitness progress analyst. Help users understand their fitness journey, analyze their progress, and provide motivation and guidance for achieving their goals.'
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

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !session) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: messageText,
          messageType: aiMode,
          userContext: userContext,
          systemPrompt: getModePrompt(aiMode)
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      await loadChatHistory();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMessage = message;
    setMessage('');
    await sendMessage(currentMessage);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
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
      general: 'General Assistant',
      workout: 'Workout Coach',
      nutrition: 'Nutrition Coach',
      progress: 'Progress Analyst'
    };
    return labels[mode];
  };

  if (!user) {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Axenro AI</h1>
          <p className="text-muted-foreground">
            Your intelligent fitness companion, powered by AI
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Your personal AI-powered fitness and nutrition assistant. Get customized workout plans, 
            meal planning, progress analysis, and expert guidance.
          </p>
          
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <Button onClick={() => setShowAuthDialog(true)} className="w-full">
                {t('auth.login')}
              </Button>
            </CardContent>
          </Card>
          
          <AuthenticationDialog 
            open={showAuthDialog} 
            onOpenChange={setShowAuthDialog}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Axenro AI</h1>
        <p className="text-muted-foreground">
          Your intelligent fitness companion, powered by AI
        </p>
      </div>

      <div className="space-y-4">
        {/* Mode Selector */}
        <div className="flex items-center justify-between">
          <Select value={aiMode} onValueChange={(value: AIMode) => setAiMode(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">🤖 General Assistant</SelectItem>
              <SelectItem value="workout">💪 Workout Coach</SelectItem>
              <SelectItem value="nutrition">🥗 Nutrition Coach</SelectItem>
              <SelectItem value="progress">📊 Progress Analyst</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={clearChatHistory}
          >
            Clear Chat
          </Button>
        </div>

        {/* Chat Window */}
        <Card className="h-96 overflow-y-auto p-4 space-y-4 bg-background">
          {chatHistory.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="mx-auto h-12 w-12 mb-4" />
              <p className="font-medium mb-4">Chat with your {getModeLabel(aiMode)}</p>
              <p className="text-sm mb-6">Try asking about:</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                {modeStarterSuggestions[aiMode].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
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

        {/* Input Box */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me anything about fitness, workouts, or nutrition…"
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
