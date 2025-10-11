import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Sparkles } from 'lucide-react';
import { useAIAvatar } from '@/hooks/useAIAvatar';
import { cn } from '@/lib/utils';

interface AvatarCoachProps {
  onAvatarClick: () => void;
}

const AvatarCoach: React.FC<AvatarCoachProps> = ({ onAvatarClick }) => {
  const { avatarUrl, avatarStatus, motivation, loading } = useAIAvatar();

  // Don't show if no avatar
  if (!avatarUrl && avatarStatus !== 'generating') {
    return null;
  }

  const isGenerating = avatarStatus === 'generating' || loading;

  return (
    <div className="px-4 py-3 border-t border-border">
      <div 
        onClick={onAvatarClick}
        className={cn(
          "cursor-pointer hover:bg-accent/50 rounded-lg p-3 transition-all duration-300",
          "avatar-coach-enter"
        )}
      >
        <div className="flex flex-col items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <Avatar className={cn(
              "h-14 w-14 border-2 border-primary/30 transition-all",
              !isGenerating && "hover:scale-105"
            )}>
              {avatarUrl && <AvatarImage src={avatarUrl} alt="AI Coach" />}
              <AvatarFallback className="bg-primary/10">
                {isGenerating ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <Sparkles className="h-6 w-6 text-primary" />
                )}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Status or Motivation Message */}
          {isGenerating ? (
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              ✨ Creating your coach...
            </p>
          ) : motivation ? (
            <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-[160px]">
              {motivation}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              💪 Your AI Coach
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarCoach;
