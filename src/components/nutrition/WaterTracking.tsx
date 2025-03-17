
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trash } from 'lucide-react';
import { toast } from 'sonner';

type WaterEntry = {
  id: string;
  amount: number;
  timestamp: number;
};

export default function WaterTracking() {
  const { t } = useLanguage();
  const [totalWater, setTotalWater] = useState(0);
  const [waterLog, setWaterLog] = useState<WaterEntry[]>([]);
  const [waterGoal] = useState(2000); // 2 liters per day

  // Load water data on component mount
  useEffect(() => {
    const savedWaterData = localStorage.getItem("todayWaterLog");
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
    }
  }, []);

  // Save water data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("todayWaterLog", JSON.stringify(waterLog));
  }, [waterLog]);

  const addWater = (amount: number) => {
    const newEntry: WaterEntry = {
      id: Date.now().toString(),
      amount,
      timestamp: Date.now(),
    };
    
    const updatedLog = [...waterLog, newEntry];
    setWaterLog(updatedLog);
    
    // Recalculate total water
    const newTotal = updatedLog.reduce((sum, entry) => sum + entry.amount, 0);
    setTotalWater(newTotal);
    
    toast.success(`Added ${amount}ml of water`);
  };

  const deleteWaterEntry = (id: string) => {
    const entryToDelete = waterLog.find(entry => entry.id === id);
    if (entryToDelete) {
      const updatedLog = waterLog.filter(entry => entry.id !== id);
      setWaterLog(updatedLog);
      
      // Recalculate total water after deletion
      const newTotal = updatedLog.reduce((sum, entry) => sum + entry.amount, 0);
      setTotalWater(newTotal);
      
      toast.success(`Removed ${entryToDelete.amount}ml of water`);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">{t("waterIntake")}</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{totalWater}ml</span>
            <span>{waterGoal}ml</span>
          </div>
          <Progress value={(totalWater / waterGoal) * 100} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => addWater(100)} variant="outline" size="sm">{t("add100ml")}</Button>
        <Button onClick={() => addWater(250)} variant="outline" size="sm">{t("add250ml")}</Button>
        <Button onClick={() => addWater(500)} variant="outline" size="sm">{t("add500ml")}</Button>
        <Button onClick={() => addWater(750)} variant="outline" size="sm">{t("add750ml")}</Button>
        <Button onClick={() => addWater(1000)} variant="outline" size="sm">{t("add1l")}</Button>
      </div>
      
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2">Water Log</h4>
        {waterLog.length === 0 ? (
          <p className="text-sm text-muted-foreground">No water entries yet.</p>
        ) : (
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
            {waterLog.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center">
                  <span className="text-sm font-medium">{entry.amount}ml</span>
                  <span className="ml-2 text-xs text-muted-foreground">{formatTime(entry.timestamp)}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => deleteWaterEntry(entry.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
