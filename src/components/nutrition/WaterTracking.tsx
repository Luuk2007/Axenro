
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trash2, GlassWater, Calculator, Droplet } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

type WaterEntry = {
  id: string;
  amount: number;
  timestamp: number;
};

export default function WaterTracking() {
  const { t } = useLanguage();
  const [totalWater, setTotalWater] = useState(0);
  const [waterLog, setWaterLog] = useState<WaterEntry[]>([]);
  const [waterGoal, setWaterGoal] = useState(2000); // Default 2 liters
  const [bodyWeight, setBodyWeight] = useState<string>('70'); // Default 70kg

  // Load water data and user weight on component mount
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US');
    const savedWaterData = localStorage.getItem(`waterLog_${today}`);
    
    if (savedWaterData) {
      try {
        const parsedData = JSON.parse(savedWaterData);
        setWaterLog(parsedData);
        
        // Calculate total water from the log
        const total = parsedData.reduce((sum: number, entry: WaterEntry) => sum + entry.amount, 0);
        setTotalWater(total);
      } catch (error) {
        console.error("Error parsing water data:", error);
      }
    } else {
      // Reset for new day
      setWaterLog([]);
      setTotalWater(0);
    }

    // Load user profile to get weight if available
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.weight) {
          setBodyWeight(profile.weight.toString());
          // Calculate recommended water intake: 35ml * body weight in kg
          const recommendedIntake = Math.round(35 * profile.weight);
          setWaterGoal(recommendedIntake);
        }
      } catch (error) {
        console.error("Error parsing user profile:", error);
      }
    }
  }, []);

  // Save water data to localStorage whenever it changes
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US');
    localStorage.setItem(`waterLog_${today}`, JSON.stringify(waterLog));
  }, [waterLog]);

  const addWater = (amount: number) => {
    const newEntry: WaterEntry = {
      id: Date.now().toString(),
      amount,
      timestamp: Date.now(),
    };
    
    const updatedLog = [...waterLog, newEntry];
    setWaterLog(updatedLog);
    setTotalWater(prevTotal => prevTotal + amount);
    toast.success(`Added ${amount}ml of water`);
  };

  const deleteWaterEntry = (id: string) => {
    const entryToDelete = waterLog.find(entry => entry.id === id);
    if (entryToDelete) {
      const amountToRemove = entryToDelete.amount;
      
      // Update total water
      setTotalWater(prevTotal => prevTotal - amountToRemove);
      
      // Remove from log
      const updatedLog = waterLog.filter(entry => entry.id !== id);
      setWaterLog(updatedLog);
      
      toast.success(`Removed ${amountToRemove}ml of water`);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateWaterIntake = () => {
    const weightNum = parseFloat(bodyWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast.error("Please enter a valid body weight");
      return;
    }
    
    // Formula: 35ml * body weight in kg
    const recommendedIntake = Math.round(35 * weightNum);
    setWaterGoal(recommendedIntake);
    toast.success(`Water goal updated to ${recommendedIntake}ml`);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBodyWeight(e.target.value);
  };

  return (
    <div className="space-y-4">
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
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">{t("Water intake")}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{totalWater}ml</span>
                <span>{waterGoal}ml</span>
              </div>
              <Progress value={(totalWater / waterGoal) * 100} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => addWater(100)} variant="outline" size="sm">{t("Add 100ml")}</Button>
            <Button onClick={() => addWater(250)} variant="outline" size="sm">{t("Add 250ml")}</Button>
            <Button onClick={() => addWater(500)} variant="outline" size="sm">{t("Add 500ml")}</Button>
            <Button onClick={() => addWater(750)} variant="outline" size="sm">{t("Add 750ml")}</Button>
            <Button onClick={() => addWater(1000)} variant="outline" size="sm">{t("Add 1l")}</Button>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">{t("Water log")}</h4>
            {waterLog.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("No water entries")}</p>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                {waterLog.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center">
                      <GlassWater className="h-4 w-4 text-blue-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium">{entry.amount}ml</p>
                        <p className="text-xs text-muted-foreground">{formatTime(entry.timestamp)}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={() => deleteWaterEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="calculator" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">{t("Water calculator")}</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="bodyWeight" className="text-sm font-medium">
                    {t("Body weight")} (kg)
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
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">{t("Recommended water intake")}</h4>
                <p className="text-2xl font-bold text-blue-500">{waterGoal} ml</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("Based on formula")}: 35ml × {bodyWeight || '0'}kg
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
