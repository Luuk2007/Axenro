
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, GlassWater, Calculator, Droplet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useWaterTracking } from '@/hooks/useWaterTracking';

export default function WaterTracking() {
  const { t } = useLanguage();
  const [bodyWeight, setBodyWeight] = useState<string>('70');
  const {
    totalWater,
    waterLog,
    waterGoal,
    loading,
    addWater,
    deleteWaterEntry,
    updateWaterGoal
  } = useWaterTracking();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateWaterIntake = () => {
    const weightNum = parseFloat(bodyWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      return;
    }
    
    // Formula: 35ml * body weight in kg
    const recommendedIntake = Math.round(35 * weightNum);
    updateWaterGoal(recommendedIntake);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBodyWeight(e.target.value);
  };

  const calculatePercentage = () => {
    return Math.min(Math.round((totalWater / waterGoal) * 100), 100);
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">{t("Loading")}...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Water Progress Card */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
        <CardContent className="pt-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-3">
              <Droplet className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">{totalWater}ml</p>
              <p className="text-sm text-muted-foreground">/ {waterGoal}ml {t("target")}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-500">{calculatePercentage()}%</p>
              <p className="text-xs text-muted-foreground">{t("completed")}</p>
            </div>
          </div>
          <Progress value={calculatePercentage()} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-cyan-500" />
        </CardContent>
      </Card>

      <Tabs defaultValue="tracking" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="tracking">
            <Droplet className="mr-2 h-4 w-4" />
            {t("Water tracking")}
          </TabsTrigger>
          <TabsTrigger value="calculator">
            <Calculator className="mr-2 h-4 w-4" />
            {t("Water calculator")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tracking" className="space-y-4">
          {/* Quick Add Buttons */}
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <GlassWater className="h-4 w-4 text-blue-500" />
                {t("Quick add")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => addWater(100)} variant="outline" size="sm" className="flex-1 min-w-[80px]">100ml</Button>
                <Button onClick={() => addWater(250)} variant="outline" size="sm" className="flex-1 min-w-[80px]">250ml</Button>
                <Button onClick={() => addWater(500)} variant="outline" size="sm" className="flex-1 min-w-[80px]">500ml</Button>
                <Button onClick={() => addWater(750)} variant="outline" size="sm" className="flex-1 min-w-[80px]">750ml</Button>
                <Button onClick={() => addWater(1000)} variant="outline" size="sm" className="flex-1 min-w-[80px]">1L</Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Water Log */}
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-cyan-500 to-teal-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("Water log")}</CardTitle>
            </CardHeader>
            <CardContent>
              {waterLog.length === 0 ? (
                <div className="text-center py-6">
                  <div className="rounded-full bg-blue-500/10 p-3 w-fit mx-auto mb-3">
                    <GlassWater className="h-6 w-6 text-blue-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">{t("No water entries")}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                  {waterLog.map((entry) => (
                    <Card key={entry.id} className="overflow-hidden">
                      <div className="h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-500/10 p-1.5">
                              <GlassWater className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{entry.amount}ml</p>
                              <p className="text-xs text-muted-foreground">{formatTime(entry.timestamp)}</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            onClick={() => deleteWaterEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calculator" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-500" />
                {t("Water calculator")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="bodyWeight" className="text-sm font-medium">
                  {t("Bodyweight")} (kg)
                </label>
                <div className="flex gap-2">
                  <Input 
                    id="bodyWeight" 
                    type="number" 
                    value={bodyWeight} 
                    onChange={handleWeightChange}
                    className="flex-1"
                    placeholder="70"
                  />
                  <Button onClick={calculateWaterIntake}>
                    {t("Calculate")}
                  </Button>
                </div>
              </div>
              
              <Card className="overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-cyan-500 to-teal-500" />
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-2">
                      <Droplet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("Recommended water intake")}</p>
                      <p className="text-2xl font-bold text-blue-500">{waterGoal} ml</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    {t("Based on formula")}: 35ml × {bodyWeight || '0'}kg
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
