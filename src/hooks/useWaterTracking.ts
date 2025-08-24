import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type WaterEntry = {
  id: string;
  amount: number;
  timestamp: number;
};

export const useWaterTracking = () => {
  const { user } = useAuth();
  const [totalWater, setTotalWater] = useState(0);
  const [waterLog, setWaterLog] = useState<WaterEntry[]>([]);
  const [waterGoal, setWaterGoal] = useState(2000);
  const [loading, setLoading] = useState(false);

  const loadWaterData = async () => {
    if (!user) {
      // For non-authenticated users, load from localStorage as fallback only
      const today = new Date().toLocaleDateString('en-US');
      const savedWaterData = localStorage.getItem(`waterLog_${today}`);
      
      if (savedWaterData) {
        try {
          const parsedData = JSON.parse(savedWaterData);
          setWaterLog(parsedData);
          const total = parsedData.reduce((sum: number, entry: WaterEntry) => sum + entry.amount, 0);
          setTotalWater(total);
        } catch (error) {
          console.error("Error parsing water data:", error);
        }
      }
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('water_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) {
        console.error('Error loading water data:', error);
        return;
      }

      if (data) {
        const entries = Array.isArray(data.entries) ? data.entries as WaterEntry[] : [];
        setWaterLog(entries);
        setTotalWater(data.total_water || 0);
        setWaterGoal(data.water_goal || 2000);
        
        // Keep localStorage as backup
        const today = new Date().toLocaleDateString('en-US');
        localStorage.setItem(`waterLog_${today}`, JSON.stringify(entries));
      } else {
        // No data for today, start fresh
        setWaterLog([]);
        setTotalWater(0);
        setWaterGoal(2000);
      }
    } catch (error) {
      console.error('Error loading water data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWaterData = async (entries: WaterEntry[], total: number, goal: number) => {
    if (!user) {
      // For non-authenticated users, save to localStorage only
      const today = new Date().toLocaleDateString('en-US');
      localStorage.setItem(`waterLog_${today}`, JSON.stringify(entries));
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('water_tracking')
        .upsert({
          user_id: user.id,
          date: today,
          entries: entries,
          total_water: total,
          water_goal: goal
        }, {
          onConflict: 'user_id,date'
        });

      if (error) {
        console.error('Error saving water data:', error);
      } else {
        // Keep localStorage as backup
        const today = new Date().toLocaleDateString('en-US');
        localStorage.setItem(`waterLog_${today}`, JSON.stringify(entries));
      }
    } catch (error) {
      console.error('Error saving water data:', error);
    }
  };

  const addWater = async (amount: number) => {
    const newEntry: WaterEntry = {
      id: Date.now().toString(),
      amount,
      timestamp: Date.now(),
    };
    
    const updatedLog = [...waterLog, newEntry];
    const newTotal = totalWater + amount;
    
    setWaterLog(updatedLog);
    setTotalWater(newTotal);
    
    await saveWaterData(updatedLog, newTotal, waterGoal);
    toast.success(`Added ${amount}ml of water`);
  };

  const deleteWaterEntry = async (id: string) => {
    const entryToDelete = waterLog.find(entry => entry.id === id);
    if (entryToDelete) {
      const amountToRemove = entryToDelete.amount;
      const newTotal = totalWater - amountToRemove;
      const updatedLog = waterLog.filter(entry => entry.id !== id);
      
      setTotalWater(newTotal);
      setWaterLog(updatedLog);
      
      await saveWaterData(updatedLog, newTotal, waterGoal);
      toast.success(`Removed ${amountToRemove}ml of water`);
    }
  };

  const updateWaterGoal = async (newGoal: number) => {
    setWaterGoal(newGoal);
    await saveWaterData(waterLog, totalWater, newGoal);
  };

  useEffect(() => {
    loadWaterData();
  }, [user]);

  return {
    totalWater,
    waterLog,
    waterGoal,
    loading,
    addWater,
    deleteWaterEntry,
    updateWaterGoal,
    loadWaterData
  };
};
