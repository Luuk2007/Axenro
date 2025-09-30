import { Trophy, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChallengeBadges } from '@/hooks/useChallengeBadges';
import { format } from 'date-fns';

export const ChallengeBadges = () => {
  const { badges, loading } = useChallengeBadges();

  const getBadgeEmoji = (type: string) => {
    switch (type) {
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '🏅';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'gold': return 'from-yellow-500 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-400';
      case 'bronze': return 'from-orange-500 to-orange-600';
      default: return 'from-primary to-primary/80';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading badges...</div>;
  }

  if (badges.length === 0) {
    return (
      <Card className="glassy-card">
        <CardContent className="py-12 text-center">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">No badges yet</p>
          <p className="text-sm text-muted-foreground">
            Complete challenges to earn badges and show off your achievements!
          </p>
        </CardContent>
      </Card>
    );
  }

  const badgesByType = {
    gold: badges.filter(b => b.badge_type === 'gold').length,
    silver: badges.filter(b => b.badge_type === 'silver').length,
    bronze: badges.filter(b => b.badge_type === 'bronze').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="glassy-card">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-2">🥇</div>
            <div className="text-2xl font-bold">{badgesByType.gold}</div>
            <div className="text-sm text-muted-foreground">Gold</div>
          </CardContent>
        </Card>
        <Card className="glassy-card">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-2">🥈</div>
            <div className="text-2xl font-bold">{badgesByType.silver}</div>
            <div className="text-sm text-muted-foreground">Silver</div>
          </CardContent>
        </Card>
        <Card className="glassy-card">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-2">🥉</div>
            <div className="text-2xl font-bold">{badgesByType.bronze}</div>
            <div className="text-sm text-muted-foreground">Bronze</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge) => (
          <Card key={badge.id} className="glassy-card overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${getBadgeColor(badge.badge_type)}`} />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{getBadgeEmoji(badge.badge_type)}</span>
                  <div>
                    <CardTitle className="text-lg">{badge.badge_type.toUpperCase()}</CardTitle>
                    <CardDescription className="capitalize">
                      {badge.challenge?.title || 'Challenge'}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">{badge.completion_percentage.toFixed(0)}%</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Earned {format(new Date(badge.earned_at), 'MMM d, yyyy')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
