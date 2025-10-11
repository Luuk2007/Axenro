import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Sparkles, TrendingUp, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAIAvatar } from '@/hooks/useAIAvatar';
import { useLanguage } from '@/contexts/LanguageContext';

interface AICoachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AICoachModal: React.FC<AICoachModalProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { avatarUrl, motivation } = useAIAvatar();
  const { t } = useLanguage();

  const handleChatClick = () => {
    onOpenChange(false);
    navigate('/axenro-ai');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Your AI Coach')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* Large Avatar */}
          <Avatar className="h-32 w-32 border-4 border-primary/30">
            <AvatarImage src={avatarUrl} alt="AI Coach" />
            <AvatarFallback className="bg-primary/10">
              <Sparkles className="h-12 w-12 text-primary" />
            </AvatarFallback>
          </Avatar>

          {/* Motivational Message */}
          {motivation && (
            <div className="text-center px-6">
              <p className="text-lg font-medium text-foreground mb-2">
                {motivation}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{t('Weekly Summary')}</p>
                <p className="text-sm font-medium">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{t('Recent Achievements')}</p>
                <p className="text-sm font-medium">Growing</p>
              </div>
            </div>
          </div>

          {/* Chat Button */}
          <Button 
            onClick={handleChatClick}
            className="w-full gap-2"
            size="lg"
          >
            <MessageCircle className="h-5 w-5" />
            {t('Chat with me')}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {t('Avatar Tooltip')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AICoachModal;
