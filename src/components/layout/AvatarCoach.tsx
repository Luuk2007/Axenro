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
    <div className="border-t border-border">
      <div 
        onClick={onAvatarClick}
        className={cn(
          "cursor-pointer hover:bg-accent/50 transition-all duration-300 relative overflow-hidden group",
          "avatar-coach-enter"
        )}
      >
        <div className="flex flex-col">
          {/* Full-body 3D Avatar */}
          <div className="relative w-full aspect-[9/16] bg-gradient-to-b from-background to-accent/20">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground text-center px-4">
                  ✨ Creating your 3D coach...
                </p>
              </div>
            ) : avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="AI Coach" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-primary/50" />
              </div>
            )}
          </div>

          {/* Motivation Message Overlay */}
          {!isGenerating && (
            <div className="px-3 py-2 bg-gradient-to-t from-background/95 to-transparent">
              {motivation ? (
                <p className="text-xs text-foreground text-center leading-relaxed font-medium">
                  {motivation}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  💪 Your AI Coach
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarCoach;
