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

export default function AIChat() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('fitness');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      loadChatHistory();
    }
  }, [messageType, session]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('message_type', messageType)
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
        .eq('message_type', messageType);

      if (error) throw error;

      setChatHistory([]);
      toast.success('Chat history cleared');
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast.error('Failed to clear chat history');
    }
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
          messageType: messageType
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      // Reload chat history to get the updated list
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
        <Select value={messageType} onValueChange={setMessageType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fitness">{t('Fitness Coach')}</SelectItem>
            <SelectItem value="nutrition">{t('Nutrition Expert')}</SelectItem>
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

      <Card className="h-96 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="mx-auto h-12 w-12 mb-2" />
            <p>{t('Start a conversation with your AI assistant!')}</p>
          </div>
        ) : (
          chatHistory.map((chat) => (
            <div key={chat.id} className="space-y-2">
              <div className="flex items-start gap-2 group">
                <User className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                <div className="flex-1 bg-primary/10 rounded-lg p-3">
                  <p className="text-sm">{chat.message}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteChatMessage(chat.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-start gap-2">
                <Bot className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 bg-muted rounded-lg p-3">
                  <div className="text-sm prose prose-sm max-w-none">
                    <ReactMarkdown>{chat.response}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{t('AI is thinking...')}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('Ask a question about fitness or nutrition...')}
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
