import { Trophy, Calendar, Flame } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Challenge } from '@/hooks/useChallenges';
import { UserChallenge } from '@/hooks/useUserChallenges';

interface ChallengeCardProps {
  challenge: Challenge;
  userChallenge?: UserChallenge;
  onJoin?: (challengeId: string) => void;
  onViewDetails?: (challenge: Challenge) => void;
}

export const ChallengeCard = ({ challenge, userChallenge, onJoin, onViewDetails }: ChallengeCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary/10 text-primary border-primary/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'abandoned': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const progressPercentage = userChallenge 
    ? (userChallenge.current_day / challenge.duration_days) * 100 
    : 0;

  return (
    <Card className="glassy-card hover:shadow-lg transition-all cursor-pointer" onClick={() => onViewDetails?.(challenge)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-primary" />
              {challenge.title}
            </CardTitle>
            <CardDescription className="mt-1">{challenge.description}</CardDescription>
          </div>
          {userChallenge && (
            <Badge className={getStatusColor(userChallenge.status)}>
              {userChallenge.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {challenge.duration_days} days
          </div>
          <Badge className={getDifficultyColor(challenge.difficulty_level)}>
            {challenge.difficulty_level}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {challenge.category}
          </Badge>
        </div>

        {userChallenge && userChallenge.status === 'active' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium flex items-center gap-1">
                <Flame className="w-4 h-4 text-primary" />
                Day {userChallenge.current_day}/{challenge.duration_days}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {!userChallenge && onJoin && (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onJoin(challenge.id);
            }} 
            className="w-full"
          >
            Join Challenge
          </Button>
        )}

        {userChallenge && userChallenge.status === 'active' && (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(challenge);
            }} 
            variant="outline" 
            className="w-full"
          >
            Continue Challenge
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
