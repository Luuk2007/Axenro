
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Send, User, Bot } from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  message_type: string;
  created_at: string;
}

export default function AIChat() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('fitness');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, [messageType]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('message_type', messageType)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) throw error;
      setChatHistory(data || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const currentMessage = message;
    setMessage('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: currentMessage,
          messageType: messageType
        }
      });

      if (error) throw error;

      // Add new message to chat history
      const newMessage = {
        id: Date.now().toString(),
        message: currentMessage,
        response: data.response,
        message_type: messageType,
        created_at: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('Failed to send message'));
      setMessage(currentMessage); // Restore message
    } finally {
      setLoading(false);
    }
  };

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
          onClick={() => setChatHistory([])}
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
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 mt-1 text-primary" />
                <div className="flex-1 bg-primary/10 rounded-lg p-3">
                  <p className="text-sm">{chat.message}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Bot className="h-5 w-5 mt-1 text-muted-foreground" />
                <div className="flex-1 bg-muted rounded-lg p-3">
                  <p className="text-sm whitespace-pre-wrap">{chat.response}</p>
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
