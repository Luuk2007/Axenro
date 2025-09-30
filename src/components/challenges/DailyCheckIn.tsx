import { useState } from 'react';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useChallengeProgress, ChallengeProgress } from '@/hooks/useChallengeProgress';
import { UserChallenge } from '@/hooks/useUserChallenges';
import { format, differenceInDays, startOfDay } from 'date-fns';

interface DailyCheckInProps {
  userChallenge: UserChallenge;
  progress: ChallengeProgress[];
}

export const DailyCheckIn = ({ userChallenge, progress }: DailyCheckInProps) => {
  const { checkInDay } = useChallengeProgress(userChallenge.id);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const challenge = userChallenge.challenge;
  if (!challenge) return null;

  const joinedDate = new Date(userChallenge.joined_at);
  const today = startOfDay(new Date());
  const daysSinceJoined = differenceInDays(today, startOfDay(joinedDate)) + 1;
  const currentDay = Math.min(daysSinceJoined, challenge.duration_days);
  
  const completedDays = new Set(progress.map(p => p.day_number));
  const todayCompleted = completedDays.has(currentDay);

  const handleCheckIn = async () => {
    if (todayCompleted) return;
    
    setIsSubmitting(true);
    try {
      await checkInDay(currentDay, notes);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDayStatus = (dayNum: number) => {
    if (completedDays.has(dayNum)) return 'completed';
    if (dayNum < currentDay) return 'missed';
    if (dayNum === currentDay) return 'current';
    return 'upcoming';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'missed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'current': return <Circle className="w-5 h-5 text-primary fill-primary" />;
      default: return <Circle className="w-5 h-5 text-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glassy-card">
        <CardHeader>
          <CardTitle>Today's Check-in</CardTitle>
          <CardDescription>
            Day {currentDay} of {challenge.duration_days} • {format(today, 'MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!todayCompleted ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="notes">How did it go? (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Share your thoughts, progress, or challenges..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleCheckIn} 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Checking in...' : 'Complete Day ✅'}
              </Button>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-lg font-medium">Great job! You've checked in for today! 🎉</p>
              <p className="text-sm text-muted-foreground mt-1">Come back tomorrow to continue your streak</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glassy-card">
        <CardHeader>
          <CardTitle>Progress Calendar</CardTitle>
          <CardDescription>Your daily check-in history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: challenge.duration_days }, (_, i) => {
              const dayNum = i + 1;
              const status = getDayStatus(dayNum);
              
              return (
                <div
                  key={dayNum}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border ${
                    status === 'current' ? 'border-primary bg-primary/5' :
                    status === 'completed' ? 'border-green-500/20 bg-green-500/5' :
                    status === 'missed' ? 'border-red-500/20 bg-red-500/5' :
                    'border-border bg-background'
                  }`}
                >
                  <span className="text-xs text-muted-foreground">Day {dayNum}</span>
                  {getStatusIcon(status)}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-muted-foreground">Completed: {completedDays.size}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-muted-foreground">Missed: {Math.max(0, currentDay - 1 - completedDays.size)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
