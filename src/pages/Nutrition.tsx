
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import DailySummary from "@/components/nutrition/DailySummary";
import WaterTracking from "@/components/nutrition/WaterTracking";

const Nutrition = () => {
  const { t } = useLanguage();
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("nutrition")}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("nutritionOverview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="today" className="w-full" onValueChange={(value) => setTimeframe(value as 'today' | 'week' | 'month')}>
              <TabsList>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
              <TabsContent value="today">
                <DailySummary timeframe="today" />
              </TabsContent>
              <TabsContent value="week">
                <DailySummary timeframe="week" />
              </TabsContent>
              <TabsContent value="month">
                <DailySummary timeframe="month" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("waterIntake")}</CardTitle>
          </CardHeader>
          <CardContent>
            <WaterTracking />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Nutrition;
