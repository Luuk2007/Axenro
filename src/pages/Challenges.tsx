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
import { Trophy, Flame, Zap, Target, Clock, CheckCircle2, Play, X, Award, Star, ChevronRight, ChevronLeft, Loader2, Calendar, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';
import { LoginPrompt } from '@/components/auth/LoginPrompt';

const difficultyConfig = {
  easy: { labelKey: 'diffEasy', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: Zap },
  medium: { labelKey: 'diffMedium', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Flame },
  hard: { labelKey: 'diffHard', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: Target },
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
  nutrition: '🥗',
  mental: '🧠',
  recovery: '💆',
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
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [abandonModalOpen, setAbandonModalOpen] = useState(false);
  const [abandonTarget, setAbandonTarget] = useState<string | null>(null);
  const [abandonReason, setAbandonReason] = useState('');

  if (!user) return <LoginPrompt />;

  const activeChallenges = userChallenges.filter(uc => uc.status === 'active');
  const completedChallenges = userChallenges.filter(uc => uc.status === 'completed');
  const activeJoinedIds = activeChallenges.map(uc => uc.challenge_id);

  const getChallenge = (id: string) => challenges.find(c => c.id === id);

  const tabs = [
    { key: 'discover' as const, label: t('chDiscover'), icon: Zap, count: challenges.length },
    { key: 'active' as const, label: t('chActive'), icon: Flame, count: activeChallenges.length },
    { key: 'badges' as const, label: t('chBadges'), icon: Trophy, count: badges.length },
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
      `${t('chFeeling')}: ${logMood}`,
      `${t('chDifficultyLabel')}: ${logDifficulty}`,
    ].filter(Boolean).join(' | ');
    await logDay(logTarget.ucId, logTarget.dayNumber, notes);
    setLogModalOpen(false);
    setLogTarget(null);
  };

  const openAbandonModal = (ucId: string) => {
    setAbandonTarget(ucId);
    setAbandonReason('');
    setAbandonModalOpen(true);
  };

  const handleAbandonSubmit = async () => {
    if (!abandonTarget) return;
    await abandonChallenge(abandonTarget);
    setAbandonModalOpen(false);
    setAbandonTarget(null);
    setAbandonReason('');
  };

  const openChallengeDetail = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setDetailModalOpen(true);
  };

  const moodOptions = [
    { value: 'great', label: `🔥 ${t('moodGreat')}`, desc: t('moodGreatDesc') },
    { value: 'good', label: `💪 ${t('moodGood')}`, desc: t('moodGoodDesc') },
    { value: 'okay', label: `😐 ${t('moodOkay')}`, desc: t('moodOkayDesc') },
    { value: 'tough', label: `😤 ${t('moodTough')}`, desc: t('moodToughDesc') },
  ];

  const diffOptions = [
    { value: 'easy', label: t('diffEasy') },
    { value: 'medium', label: t('diffMedium') },
    { value: 'hard', label: t('diffHard') },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-24 md:pb-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
            {t('challenges')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('challengesDesc')}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-border/50">
          <CardContent className="p-2.5 sm:p-4 flex items-center gap-2">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-bold text-foreground">{completedChallenges.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{t('chCompleted')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-2.5 sm:p-4 flex items-center gap-2">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-bold text-foreground">{activeChallenges.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{t('chActive')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-2.5 sm:p-4 flex items-center gap-2">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-bold text-foreground">{badges.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{t('chBadges')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border/50">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              selectedTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
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
          {/* DISCOVER TAB */}
          {selectedTab === 'discover' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid gap-2.5"
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
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card
                      className="overflow-hidden border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg cursor-pointer active:scale-[0.99]"
                      onClick={() => openChallengeDetail(challenge)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl flex-shrink-0 mt-0.5">{emoji}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-sm leading-tight pr-1">{challenge.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-2">{challenge.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={`${diff.bg} ${diff.color} border text-[10px]`}>
                                <DiffIcon className="h-3 w-3 mr-1" />
                                {t(diff.labelKey)}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {challenge.duration_days}{t('chDayAbbrev')}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {isJoined ? (
                              <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); joinChallenge(challenge.id); }}
                                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 h-8 px-3 text-xs"
                              >
                                <Play className="h-3 w-3 mr-1" />
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

          {/* ACTIVE TAB */}
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
                    <h3 className="font-semibold text-foreground mb-1">{t('No active challenges')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t('Join a challenge to get started!')}</p>
                    <Button variant="outline" onClick={() => setSelectedTab('discover')}>
                      {t('Discover Challenges')}
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
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-2xl flex-shrink-0">{emoji}</span>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-foreground text-sm truncate">{challenge.title}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-muted-foreground">
                                    {t('chDay')} {completedDays} / {challenge.duration_days}
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
                              className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                              onClick={() => openAbandonModal(uc.id)}
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
                              {t('chLogDay')} {nextDay}
                            </Button>
                          )}
                          {todayLogged && (
                            <div className="text-center text-sm text-emerald-400 font-medium flex items-center justify-center gap-2 py-2">
                              <CheckCircle2 className="h-4 w-4" />
                              {t('Today completed!')} 🎉
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

          {/* BADGES TAB */}
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
                    <h3 className="font-semibold text-foreground mb-1">{t('No badges yet')}</h3>
                    <p className="text-sm text-muted-foreground">{t('Complete challenges to earn badges!')}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                          <CardContent className="p-3 text-center">
                            <div className={`mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br ${badgeColors[badge.badge_type]} flex items-center justify-center mb-2 shadow-lg`}>
                              <span className="text-xl">{badgeEmoji[badge.badge_type]}</span>
                            </div>
                            <p className="text-[10px] font-semibold text-foreground line-clamp-2">
                              {challenge?.title || 'Challenge'}
                            </p>
                            <p className="text-[9px] text-muted-foreground capitalize mt-0.5">
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

      {/* Challenge Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          {selectedChallenge && (() => {
            const diff = difficultyConfig[selectedChallenge.difficulty_level];
            const DiffIcon = diff.icon;
            const emoji = categoryIcons[selectedChallenge.category] || '🏋️';
            const isJoined = activeJoinedIds.includes(selectedChallenge.id);

            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-3xl">{emoji}</span>
                    <div>
                      <DialogTitle className="text-lg leading-tight">{selectedChallenge.title}</DialogTitle>
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-muted-foreground">{selectedChallenge.description}</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('chDuration')}</p>
                      <p className="text-lg font-bold text-foreground">{selectedChallenge.duration_days} {t('chDays')}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('chDifficultyLabel')}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <DiffIcon className={`h-4 w-4 ${diff.color}`} />
                        <span className="font-semibold text-foreground">{t(diff.labelKey)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{t('chBadgeThresholds')}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>🥉 {t('chBronze')} — {selectedChallenge.badge_bronze_threshold}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span>🥈 {t('chSilver')} — {selectedChallenge.badge_silver_threshold}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span>🥇 {t('chGold')} — {selectedChallenge.badge_gold_threshold}%</span>
                    </div>
                  </div>

                  {isJoined ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">{t('chAlreadyJoined')}</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                      onClick={() => { joinChallenge(selectedChallenge.id); setDetailModalOpen(false); }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {t('chStartChallenge')}
                    </Button>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Abandon Challenge Modal */}
      <Dialog open={abandonModalOpen} onOpenChange={setAbandonModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t('chAbandonTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('chAbandonDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium block mb-2">{t('chAbandonReason')}</label>
              <Select value={abandonReason} onValueChange={setAbandonReason}>
                <SelectTrigger>
                  <SelectValue placeholder={t('chSelectReason')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="too_hard">{t('chReasonTooHard')}</SelectItem>
                  <SelectItem value="no_time">{t('chReasonNoTime')}</SelectItem>
                  <SelectItem value="injury">{t('chReasonInjury')}</SelectItem>
                  <SelectItem value="not_interested">{t('chReasonNotInterested')}</SelectItem>
                  <SelectItem value="other">{t('chReasonOther')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAbandonModalOpen(false)} className="flex-1">
                {t('chCancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleAbandonSubmit}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                {t('chConfirmAbandon')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Day Modal */}
      <Dialog open={logModalOpen} onOpenChange={setLogModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-500" />
              {t('chLogDay')} {logTarget?.dayNumber}
            </DialogTitle>
            <DialogDescription>
              {logTarget?.challengeTitle}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium block mb-2">{t('chHowDidYouFeel')}</label>
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

            <div>
              <label className="text-sm font-medium block mb-2">{t('chDifficultyLabel')}</label>
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

            <div>
              <label className="text-sm font-medium block mb-2">{t('chNotesOptional')}</label>
              <Textarea
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder={t('chNotesPlaceholder')}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setLogModalOpen(false)} className="flex-1">
                {t('chCancel')}
              </Button>
              <Button 
                onClick={handleLogSubmit}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t('chLogDayBtn')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Challenges;
