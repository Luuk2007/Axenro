import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, Bot, Trash2, Plus, MessageSquare, Sparkles, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AuthenticationDialog from '@/components/auth/AuthenticationDialog';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  message_type: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  created_at: string;
}

const AI_LIMITS: Record<string, number> = {
  free: 10,
  pro: 50,
  premium: -1, // unlimited
};

const starterSuggestions = [
  { icon: '💪', text: 'Create a push day workout for me' },
  { icon: '🥗', text: 'Plan 3 high-protein meals under 500 cal' },
  { icon: '📊', text: 'Analyze my workout progress this week' },
  { icon: '🏃', text: 'Give me a beginner running program' },
];

export default function AxenroAI() {
  const { t } = useLanguage();
  const { session, user } = useAuth();
  const isMobile = useIsMobile();
  const { subscription_tier, test_mode, test_subscription_tier } = useSubscription();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [questionsUsedToday, setQuestionsUsedToday] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const effectiveTier = test_mode && test_subscription_tier ? test_subscription_tier : (subscription_tier || 'free');
  const questionLimit = AI_LIMITS[effectiveTier.toLowerCase()] ?? AI_LIMITS.free;
  const canAsk = questionLimit === -1 || questionsUsedToday < questionLimit;

  useEffect(() => {
    if (session) {
      loadConversations();
      loadQuestionsUsedToday();
    }
  }, [session]);

  useEffect(() => {
    if (activeConversationId && session) {
      loadChatHistory(activeConversationId);
    } else {
      setChatHistory([]);
    }
  }, [activeConversationId, session]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, streamingResponse]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadQuestionsUsedToday = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('ai_chat_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00`);
    setQuestionsUsedToday(count || 0);
  };

  const loadConversations = async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('message_type, message, created_at')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      // Group by message_type as conversation identifier
      const convMap = new Map<string, Conversation>();
      (data || []).forEach((msg) => {
        const key = msg.message_type;
        if (!convMap.has(key)) {
          convMap.set(key, {
            id: key,
            title: msg.message.slice(0, 40) + (msg.message.length > 40 ? '...' : ''),
            lastMessage: msg.message,
            created_at: msg.created_at,
          });
        }
      });

      setConversations(Array.from(convMap.values()));
      
      // Auto-select first conversation if none active
      if (!activeConversationId && convMap.size > 0) {
        const firstKey = Array.from(convMap.keys())[0];
        setActiveConversationId(firstKey);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadChatHistory = async (conversationId: string) => {
    if (!session) return;
    try {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('message_type', conversationId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setChatHistory(data || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const startNewChat = () => {
    const newId = `chat-${Date.now()}`;
    setActiveConversationId(newId);
    setChatHistory([]);
    setStreamingResponse('');
    if (isMobile) setSidebarOpen(false);
  };

  const deleteConversation = async (convId: string) => {
    try {
      const { error } = await supabase
        .from('ai_chat_history')
        .delete()
        .eq('message_type', convId);

      if (error) throw error;

      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        setActiveConversationId(null);
        setChatHistory([]);
      }
      toast.success('Gesprek verwijderd');
    } catch {
      toast.error('Verwijderen mislukt');
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !session || loading) return;
    if (!canAsk) {
      toast.error('Je hebt je dagelijkse limiet bereikt. Upgrade je abonnement voor meer vragen.');
      return;
    }

    const convId = activeConversationId || `chat-${Date.now()}`;
    if (!activeConversationId) setActiveConversationId(convId);

    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      message: messageText,
      response: '',
      message_type: convId,
      created_at: new Date().toISOString(),
    };
    setChatHistory((prev) => [...prev, tempMessage]);
    setMessage('');
    setLoading(true);
    setStreamingResponse('');

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: messageText,
          messageType: convId,
          systemPrompt: 'You are Axenro AI, an expert fitness and nutrition assistant. Respond concisely, use markdown formatting. Be encouraging and knowledgeable.',
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Update temp message with response
      const responseText = data?.response || 'Sorry, ik kon geen antwoord genereren.';
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, response: responseText } : msg
        )
      );

      // Animate the response appearing
      animateResponse(responseText, tempMessage.id);

      setQuestionsUsedToday((prev) => prev + 1);
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Bericht verzenden mislukt');
      setChatHistory((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const animateResponse = (fullText: string, messageId: string) => {
    let i = 0;
    const chunkSize = 3;
    const interval = setInterval(() => {
      i += chunkSize;
      if (i >= fullText.length) {
        clearInterval(interval);
        setStreamingResponse('');
        // Ensure full text is set
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, response: fullText } : msg
          )
        );
      } else {
        setStreamingResponse(fullText.slice(0, i));
      }
    }, 10);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(message);
    }
  };

  const deleteChatMessage = async (chatId: string) => {
    if (!session || chatId.startsWith('temp-')) return;
    try {
      const { error } = await supabase.from('ai_chat_history').delete().eq('id', chatId);
      if (error) throw error;
      setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
    } catch {
      toast.error('Verwijderen mislukt');
    }
  };

  if (!user) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Axenro AI</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Jouw persoonlijke AI fitness & voeding assistent</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Log in om te starten</h2>
            <p className="text-muted-foreground mb-6">Krijg gepersonaliseerd advies over fitness, voeding en voortgang.</p>
            <Button onClick={() => setShowAuthDialog(true)} size="lg">{t('auth.login')}</Button>
          </div>
        </div>
        <AuthenticationDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      </div>
    );
  }

  const isLastMessageStreaming = loading && streamingResponse;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header - consistent with other pages */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Axenro AI</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Jouw persoonlijke AI fitness & voeding assistent</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Question counter */}
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted border border-border">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">
              {questionLimit === -1
                ? `${questionsUsedToday} vragen vandaag`
                : `${questionLimit - questionsUsedToday} van ${questionLimit} over`}
            </span>
          </div>
        </div>
      </div>

      {/* Main chat layout */}
      <div className="flex gap-0 h-[calc(100vh-220px)] min-h-[400px] rounded-xl border border-border overflow-hidden bg-background">
        {/* Sidebar */}
        <div
          className={cn(
            'flex-shrink-0 border-r border-border bg-muted/30 flex flex-col transition-all duration-200',
            sidebarOpen ? 'w-64' : 'w-0',
            isMobile && sidebarOpen && 'absolute inset-y-0 left-0 z-50 w-72 shadow-xl'
          )}
        >
          {sidebarOpen && (
            <>
              <div className="p-3 border-b border-border">
                <Button onClick={startNewChat} variant="outline" className="w-full justify-start gap-2" size="sm">
                  <Plus className="h-4 w-4" />
                  Nieuw gesprek
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {conversations.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Geen gesprekken</p>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={cn(
                        'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors',
                        activeConversationId === conv.id
                          ? 'bg-primary/10 text-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                      onClick={() => {
                        setActiveConversationId(conv.id);
                        if (isMobile) setSidebarOpen(false);
                      }}
                    >
                      <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate flex-1">{conv.title}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 h-5 w-5 p-0 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toggle sidebar button */}
          <div className="flex items-center p-2 border-b border-border bg-background">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            {activeConversationId && (
              <span className="text-sm font-medium ml-2 truncate">
                {conversations.find((c) => c.id === activeConversationId)?.title || 'Nieuw gesprek'}
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {chatHistory.length === 0 && !loading ? (
              <div className="flex items-center justify-center h-full p-6">
                <div className="text-center max-w-lg">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold mb-1">Hoe kan ik je helpen?</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Stel een vraag over fitness, voeding of je voortgang.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {starterSuggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s.text)}
                        className="text-left p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors text-sm"
                      >
                        <span className="mr-2">{s.icon}</span>
                        {s.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {chatHistory.map((chat, idx) => {
                  const isLastMsg = idx === chatHistory.length - 1;
                  const displayResponse =
                    isLastMsg && streamingResponse ? streamingResponse : chat.response;

                  return (
                    <div key={chat.id} className="space-y-4">
                      {/* User message */}
                      <div className="flex justify-end">
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] shadow-sm">
                          <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                        </div>
                      </div>

                      {/* AI response */}
                      {displayResponse ? (
                        <div className="flex gap-3 group">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-li:my-0.5 prose-headings:mb-2 prose-headings:mt-3">
                              <ReactMarkdown>{displayResponse}</ReactMarkdown>
                            </div>
                            {!chat.id.startsWith('temp-') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 mt-1"
                                onClick={() => deleteChatMessage(chat.id)}
                              >
                                <Trash2 className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : loading && isLastMsg ? (
                        <div className="flex gap-3">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground py-2">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-xs">Axenro AI is aan het denken...</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 bg-background">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="relative flex items-end gap-2 bg-muted/50 rounded-xl border border-border p-2 focus-within:border-primary/50 transition-colors">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={canAsk ? 'Stel een vraag...' : 'Dagelijkse limiet bereikt'}
                  disabled={loading || !canAsk}
                  className="flex-1 min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-1 text-sm"
                  rows={1}
                />
                <Button
                  type="submit"
                  disabled={loading || !message.trim() || !canAsk}
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg flex-shrink-0"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                Axenro AI kan fouten maken. Controleer belangrijk advies altijd.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
