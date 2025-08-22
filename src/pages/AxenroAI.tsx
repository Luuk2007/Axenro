
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dumbbell, Utensils, BarChart3, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AIWorkoutCoach from '@/components/ai/AIWorkoutCoach';
import AIMealPlanner from '@/components/ai/AIMealPlanner';
import AIProgressAnalyzer from '@/components/ai/AIProgressAnalyzer';
import AIChat from '@/components/ai/AIChat';
import AuthenticationDialog from '@/components/auth/AuthenticationDialog';

export default function AxenroAI() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  if (!user) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight">Axenro AI</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your personal AI-powered fitness and nutrition assistant. Get customized workout plans, 
              meal planning, progress analysis, and expert guidance.
            </p>
          </div>
          
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Sign in to access your personal AI fitness coach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowAuthDialog(true)} className="w-full">
                {t('auth.login')}
              </Button>
            </CardContent>
          </Card>
          
          <AuthenticationDialog 
            open={showAuthDialog} 
            onOpenChange={setShowAuthDialog}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Axenro AI</h1>
          </div>
          <p className="text-muted-foreground">
            Your intelligent fitness companion, powered by AI
          </p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">AI Assistant</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="workout" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Workout Coach</span>
            <span className="sm:hidden">Workout</span>
          </TabsTrigger>
          <TabsTrigger value="meals" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            <span className="hidden sm:inline">Meal Planner</span>
            <span className="sm:hidden">Meals</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Progress Analyzer</span>
            <span className="sm:hidden">Progress</span>
          </TabsTrigger>
        </TabsList>

        <div className="space-y-6">
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-semibold">AI Assistant</CardTitle>
                    <CardDescription>
                      Chat with your personal AI coach. Switch between Nutrition Coach, Workout Planner, 
                      and Progress Analyst modes for specialized advice.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AIChat />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workout">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Dumbbell className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-semibold">{t('AI Workout Coach')}</CardTitle>
                    <CardDescription>
                      {t('Get personalized workout plans based on your goals, experience, and available equipment')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AIWorkoutCoach />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meals">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Utensils className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-semibold">{t('AI Meal Planner')}</CardTitle>
                    <CardDescription>
                      {t('Create customized meal plans with shopping lists based on your nutritional goals')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AIMealPlanner />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-semibold">{t('AI Progress Analyzer')}</CardTitle>
                    <CardDescription>
                      {t('Upload progress photos and get AI-powered analysis of your fitness journey')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AIProgressAnalyzer />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
