import { useState } from 'react';
import { Plus, Trophy, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { CreateChallengeDialog } from '@/components/challenges/CreateChallengeDialog';
import { DailyCheckIn } from '@/components/challenges/DailyCheckIn';
import { ChallengeBadges } from '@/components/challenges/ChallengeBadges';
import { useChallenges, Challenge } from '@/hooks/useChallenges';
import { useUserChallenges } from '@/hooks/useUserChallenges';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticationDialog from '@/components/auth/AuthenticationDialog';

export default function Challenges() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { challenges, loading: challengesLoading } = useChallenges();
  const { userChallenges, loading: userChallengesLoading, joinChallenge } = useUserChallenges();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const activeChallenges = userChallenges.filter(uc => uc.status === 'active');
  const completedChallenges = userChallenges.filter(uc => uc.status === 'completed');

  const handleJoinChallenge = (challengeId: string) => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    joinChallenge(challengeId);
  };

  const handleViewDetails = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const selectedUserChallenge = activeChallenges.find(
    uc => uc.challenge_id === selectedChallenge?.id
  );

  const { progress } = useChallengeProgress(selectedUserChallenge?.id);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary" />
            Challenges
          </h1>
          <p className="text-muted-foreground">
            Join challenges, track progress, and earn badges
          </p>
        </div>
        {user && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Challenge
          </Button>
        )}
      </div>

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">
            <Trophy className="w-4 h-4 mr-2" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="my-challenges">
            <TrendingUp className="w-4 h-4 mr-2" />
            My Challenges
          </TabsTrigger>
          <TabsTrigger value="progress">
            <Users className="w-4 h-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Trophy className="w-4 h-4 mr-2" />
            Badges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {challengesLoading ? (
            <div className="text-center py-12">Loading challenges...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => {
                const userChallenge = userChallenges.find(
                  uc => uc.challenge_id === challenge.id && uc.status === 'active'
                );
                return (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    userChallenge={userChallenge}
                    onJoin={handleJoinChallenge}
                    onViewDetails={handleViewDetails}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-challenges" className="space-y-6">
          {!user ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Sign in to view your challenges</p>
              <Button onClick={() => setAuthDialogOpen(true)}>Sign In</Button>
            </div>
          ) : userChallengesLoading ? (
            <div className="text-center py-12">Loading your challenges...</div>
          ) : activeChallenges.length === 0 && completedChallenges.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No challenges yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Join a challenge to get started on your fitness journey!
              </p>
              <Button onClick={() => (document.querySelector('[value="discover"]') as HTMLElement)?.click()}>
                Browse Challenges
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {activeChallenges.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Active Challenges</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeChallenges.map((uc) => (
                      <ChallengeCard
                        key={uc.id}
                        challenge={uc.challenge!}
                        userChallenge={uc}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                </div>
              )}

              {completedChallenges.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Completed Challenges</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {completedChallenges.map((uc) => (
                      <ChallengeCard
                        key={uc.id}
                        challenge={uc.challenge!}
                        userChallenge={uc}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {!user ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Sign in to track your progress</p>
              <Button onClick={() => setAuthDialogOpen(true)}>Sign In</Button>
            </div>
          ) : selectedUserChallenge && selectedChallenge ? (
            <div>
              <Button
                variant="ghost"
                onClick={() => setSelectedChallenge(null)}
                className="mb-4"
              >
                ← Back to challenges
              </Button>
              <DailyCheckIn userChallenge={selectedUserChallenge} progress={progress} />
            </div>
          ) : activeChallenges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Join a challenge to start tracking progress</p>
              <Button onClick={() => (document.querySelector('[value="discover"]') as HTMLElement)?.click()}>
                Browse Challenges
              </Button>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold mb-4">Select a challenge to track progress</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeChallenges.map((uc) => (
                  <ChallengeCard
                    key={uc.id}
                    challenge={uc.challenge!}
                    userChallenge={uc}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="badges">
          {!user ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Sign in to view your badges</p>
              <Button onClick={() => setAuthDialogOpen(true)}>Sign In</Button>
            </div>
          ) : (
            <ChallengeBadges />
          )}
        </TabsContent>
      </Tabs>

      <CreateChallengeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <AuthenticationDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
      />
    </div>
  );
}
