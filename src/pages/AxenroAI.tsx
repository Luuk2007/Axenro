
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dumbbell, Utensils, BarChart3, MessageCircle } from 'lucide-react';
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{t('Axenro AI')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('Please sign in to access AI features')}
          </p>
          <Button onClick={() => setShowAuthDialog(true)}>
            {t('auth.login')}
          </Button>
          <AuthenticationDialog 
            open={showAuthDialog} 
            onOpenChange={setShowAuthDialog}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          {t('Axenro AI')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('Your personal AI-powered fitness and nutrition assistant. Get customized workout plans, meal planning, progress analysis, and expert guidance.')}
        </p>
      </div>

      <Tabs defaultValue="workout" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workout" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">{t('Workout Coach')}</span>
            <span className="sm:hidden">{t('Workout')}</span>
          </TabsTrigger>
          <TabsTrigger value="meals" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            <span className="hidden sm:inline">{t('Meal Planner')}</span>
            <span className="sm:hidden">{t('Meals')}</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('Progress Analyzer')}</span>
            <span className="sm:hidden">{t('Progress')}</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{t('Knowledge Hub')}</span>
            <span className="sm:hidden">{t('Chat')}</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="workout" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{t('AI Workout Coach')}</h2>
                  <p className="text-muted-foreground">
                    {t('Get personalized workout plans based on your goals, experience, and available equipment')}
                  </p>
                </div>
              </div>
              <AIWorkoutCoach />
            </Card>
          </TabsContent>

          <TabsContent value="meals" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Utensils className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{t('AI Meal Planner')}</h2>
                  <p className="text-muted-foreground">
                    {t('Create customized meal plans with shopping lists based on your nutritional goals')}
                  </p>
                </div>
              </div>
              <AIMealPlanner />
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{t('AI Progress Analyzer')}</h2>
                  <p className="text-muted-foreground">
                    {t('Upload progress photos and get AI-powered analysis of your fitness journey')}
                  </p>
                </div>
              </div>
              <AIProgressAnalyzer />
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{t('AI Knowledge Hub')}</h2>
                  <p className="text-muted-foreground">
                    {t('Chat with our AI experts about fitness, nutrition, and health topics')}
                  </p>
                </div>
              </div>
              <AIChat />
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
