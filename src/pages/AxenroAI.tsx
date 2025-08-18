
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Brain, TrendingUp, Utensils } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import AIChat from "@/components/ai/AIChat";
import AIMealPlanner from "@/components/ai/AIMealPlanner";
import AIWorkoutCoach from "@/components/ai/AIWorkoutCoach";
import AIProgressAnalyzer from "@/components/ai/AIProgressAnalyzer";
import { FeatureGate } from "@/components/subscription/FeatureGate";

const AxenroAI = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            {t("Axenro AI")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("Your AI-powered fitness and nutrition assistant")}
          </p>
        </div>
      </div>

      <FeatureGate feature="aiFeatures">
        <Tabs defaultValue="chat" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              {t("AI Chat")}
            </TabsTrigger>
            <TabsTrigger value="meal-planner" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              {t("Meal Planner")}
            </TabsTrigger>
            <TabsTrigger value="workout-coach" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              {t("Workout Coach")}
            </TabsTrigger>
            <TabsTrigger value="progress-analyzer" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("Progress Analyzer")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  {t("AI Fitness Chat")}
                </CardTitle>
                <CardDescription>
                  {t("Chat with your AI fitness assistant about nutrition, workouts, and progress")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIChat />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meal-planner">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  {t("AI Meal Planner")}
                </CardTitle>
                <CardDescription>
                  {t("Generate personalized meal plans based on your goals and preferences")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIMealPlanner />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workout-coach">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {t("AI Workout Coach")}
                </CardTitle>
                <CardDescription>
                  {t("Get personalized workout plans tailored to your fitness level and goals")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIWorkoutCoach />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress-analyzer">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t("AI Progress Analyzer")}
                </CardTitle>
                <CardDescription>
                  {t("Analyze your fitness progress and get AI-powered insights and recommendations")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIProgressAnalyzer />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </FeatureGate>
    </div>
  );
};

export default AxenroAI;
