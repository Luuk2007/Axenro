import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChallenges, Challenge } from '@/hooks/useChallenges';
import { Trophy, Flame, Zap, Target, Clock, CheckCircle2, Play, X, Award, Star, ChevronRight, Loader2, Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import { LoginPrompt } from '@/components/auth/LoginPrompt';

const difficultyConfig = {
  easy: { label: 'Makkelijk', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: Zap },
  medium: { label: 'Gemiddeld', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Flame },
  hard: { label: 'Moeilijk', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: Target },
};

const categoryIcons: Record<string, string> = {
  strength: '💪',
  fitness: '🏃',
  legs: '🦵',
  core: '🔥',
  flexibility: '🧘',
  cardio: '❤️',
  upper_body: '💪',
  full_body: '🏋️',
  endurance: '🏃‍♂️',
  mobility: '🤸',
};

const Challenges: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { challenges, userChallenges, challengeProgress, badges, loading, joinChallenge, logDay, abandonChallenge } = useChallenges();
  const [selectedTab, setSelectedTab] = useState<'discover' | 'active' | 'badges'>('discover');
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logTarget, setLogTarget] = useState<{ ucId: string; dayNumber: number; challengeTitle: string } | null>(null);
  const [logNotes, setLogNotes] = useState('');
  const [logMood, setLogMood] = useState<string>('good');
  const [logDifficulty, setLogDifficulty] = useState<string>('medium');

  if (!user) return <LoginPrompt />;

  const activeChallenges = userChallenges.filter(uc => uc.status === 'active');
  const completedChallenges = userChallenges.filter(uc => uc.status === 'completed');
  // Only show as joined if status is 'active'
  const activeJoinedIds = activeChallenges.map(uc => uc.challenge_id);

  const getChallenge = (id: string) => challenges.find(c => c.id === id);

  const tabs = [
    { key: 'discover' as const, label: 'Ontdekken', icon: Zap, count: challenges.length },
    { key: 'active' as const, label: 'Actief', icon: Flame, count: activeChallenges.length },
    { key: 'badges' as const, label: 'Badges', icon: Trophy, count: badges.length },
  ];

  const openLogModal = (ucId: string, dayNumber: number, challengeTitle: string) => {
    setLogTarget({ ucId, dayNumber, challengeTitle });
    setLogNotes('');
    setLogMood('good');
    setLogDifficulty('medium');
    setLogModalOpen(true);
  };

  const handleLogSubmit = async () => {
    if (!logTarget) return;
    const notes = [
      logNotes,
      `Gevoel: ${logMood}`,
      `Moeilijkheid: ${logDifficulty}`,
    ].filter(Boolean).join(' | ');
    await logDay(logTarget.ucId, logTarget.dayNumber, notes);
    setLogModalOpen(false);
    setLogTarget(null);
  };

  const moodOptions = [
    { value: 'great', label: '🔥 Geweldig', desc: 'Vol energie' },
    { value: 'good', label: '💪 Goed', desc: 'Lekker gedaan' },
    { value: 'okay', label: '😐 Oké', desc: 'Kon beter' },
    { value: 'tough', label: '😤 Zwaar', desc: 'Moeilijke dag' },
  ];

  const diffOptions = [
    { value: 'easy', label: 'Makkelijk' },
    { value: 'medium', label: 'Gemiddeld' },
    { value: 'hard', label: 'Zwaar' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-8">
      {/* Header - consistent with other pages */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
            {t('Challenges') || 'Challenges'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('challengesDesc') || 'Verleg je grenzen met dagelijkse challenges'}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{completedChallenges.length}</p>
              <p className="text-xs text-muted-foreground">Voltooid</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Flame className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{activeChallenges.length}</p>
              <p className="text-xs text-muted-foreground">Actief</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Award className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{badges.length}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/50">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {selectedTab === 'discover' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid gap-3"
            >
              {challenges.map((challenge, i) => {
                const diff = difficultyConfig[challenge.difficulty_level];
                const DiffIcon = diff.icon;
                const isJoined = activeJoinedIds.includes(challenge.id);
                const emoji = categoryIcons[challenge.category] || '🏋️';

                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="overflow-hidden border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground truncate">{challenge.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{challenge.description}</p>
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge variant="outline" className={`${diff.bg} ${diff.color} border text-xs`}>
                                <DiffIcon className="h-3 w-3 mr-1" />
                                {diff.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {challenge.duration_days} dagen
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                🥇 {challenge.badge_gold_threshold}%
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {isJoined ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Actief
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => joinChallenge(challenge.id)}
                                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25"
                              >
                                <Play className="h-3.5 w-3.5 mr-1" />
                                Start
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {selectedTab === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid gap-3"
            >
              {activeChallenges.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                      <Target className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Geen actieve challenges</h3>
                    <p className="text-sm text-muted-foreground mb-4">Doe mee aan een challenge om te beginnen!</p>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTab('discover')}
                    >
                      Ontdek Challenges
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                activeChallenges.map((uc, i) => {
                  const challenge = getChallenge(uc.challenge_id);
                  if (!challenge) return null;
                  const progress = challengeProgress[uc.id] || [];
                  const completedDays = progress.length;
                  const pct = Math.round((completedDays / challenge.duration_days) * 100);
                  const nextDay = completedDays + 1;
                  const todayLogged = progress.some(p => {
                    const d = new Date(p.completed_at);
                    const now = new Date();
                    return d.toDateString() === now.toDateString();
                  });
                  const emoji = categoryIcons[challenge.category] || '🏋️';
                  const diff = difficultyConfig[challenge.difficulty_level];

                  // Calculate streak
                  let streak = 0;
                  const sortedProgress = [...progress].sort((a, b) => b.day_number - a.day_number);
                  for (let d = 0; d < sortedProgress.length; d++) {
                    if (sortedProgress[d].day_number === completedDays - d) {
                      streak++;
                    } else break;
                  }

                  return (
                    <motion.div
                      key={uc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="overflow-hidden border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{emoji}</span>
                              <div>
                                <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-muted-foreground">
                                    Dag {completedDays} / {challenge.duration_days}
                                  </span>
                                  {streak > 1 && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-400 border-amber-500/20">
                                      🔥 {streak} streak
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => abandonChallenge(uc.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Progress bar */}
                          <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden mb-3">
                            <motion.div
                              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-foreground drop-shadow-sm">{pct}%</span>
                            </div>
                          </div>

                          {/* Badge thresholds */}
                          <div className="flex items-center gap-2 mb-3 text-[10px] text-muted-foreground">
                            <span>🥉 {challenge.badge_bronze_threshold}%</span>
                            <span>🥈 {challenge.badge_silver_threshold}%</span>
                            <span>🥇 {challenge.badge_gold_threshold}%</span>
                          </div>

                          {/* Day grid */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {Array.from({ length: Math.min(challenge.duration_days, 30) }, (_, idx) => {
                              const dayNum = idx + 1;
                              const done = progress.some(p => p.day_number === dayNum);
                              return (
                                <div
                                  key={dayNum}
                                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-medium transition-all ${
                                    done
                                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm'
                                      : dayNum === nextDay
                                        ? 'bg-primary/10 text-primary border border-primary/30'
                                        : 'bg-muted/30 text-muted-foreground'
                                  }`}
                                >
                                  {done ? '✓' : dayNum}
                                </div>
                              );
                            })}
                          </div>

                          {/* Log button */}
                          {!todayLogged && completedDays < challenge.duration_days && (
                            <Button
                              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                              onClick={() => openLogModal(uc.id, nextDay, challenge.title)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Dag {nextDay} loggen
                            </Button>
                          )}
                          {todayLogged && (
                            <div className="text-center text-sm text-emerald-400 font-medium flex items-center justify-center gap-2 py-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Vandaag voltooid! 🎉
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {selectedTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {badges.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                      <Award className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Nog geen badges</h3>
                    <p className="text-sm text-muted-foreground">Voltooi challenges om badges te verdienen!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {badges.map((badge, i) => {
                    const challenge = challenges.find(c => c.id === badge.challenge_id);
                    const badgeColors = {
                      bronze: 'from-amber-700 to-amber-900',
                      silver: 'from-slate-300 to-slate-500',
                      gold: 'from-amber-400 to-yellow-500',
                    };
                    const badgeEmoji = { bronze: '🥉', silver: '🥈', gold: '🥇' };

                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="border-border/50 overflow-hidden">
                          <CardContent className="p-4 text-center">
                            <div className={`mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br ${badgeColors[badge.badge_type]} flex items-center justify-center mb-3 shadow-lg`}>
                              <span className="text-2xl">{badgeEmoji[badge.badge_type]}</span>
                            </div>
                            <p className="text-xs font-semibold text-foreground truncate">
                              {challenge?.title || 'Challenge'}
                            </p>
                            <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                              {badge.badge_type} • {Math.round(badge.completion_percentage)}%
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Log Day Modal */}
      <Dialog open={logModalOpen} onOpenChange={setLogModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-500" />
              Dag {logTarget?.dayNumber} loggen
            </DialogTitle>
            <DialogDescription>
              {logTarget?.challengeTitle}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            {/* Mood selection */}
            <div>
              <label className="text-sm font-medium block mb-2">Hoe voelde je je?</label>
              <div className="grid grid-cols-2 gap-2">
                {moodOptions.map(mood => (
                  <button
                    key={mood.value}
                    onClick={() => setLogMood(mood.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      logMood === mood.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-border/80 hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{mood.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{mood.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-sm font-medium block mb-2">Moeilijkheidsgraad</label>
              <div className="flex gap-2">
                {diffOptions.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setLogDifficulty(d.value)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      logDifficulty === d.value
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium block mb-2">Notities (optioneel)</label>
              <Textarea
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="Hoe ging het vandaag? Wat heb je gedaan?"
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setLogModalOpen(false)} className="flex-1">
                Annuleren
              </Button>
              <Button 
                onClick={handleLogSubmit}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Dag loggen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Challenges;
