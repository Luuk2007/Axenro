
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, ScanBarcode } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import DailySummary from '@/components/nutrition/DailySummary';
import WaterTracking from '@/components/nutrition/WaterTracking';
import { format } from 'date-fns';

export default function Nutrition() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date()
  });
  
  // Go to barcode scanner page
  const handleScanBarcode = () => {
    navigate('/nutrition/barcode');
  };

  const handleAddFood = () => {
    // Implementation for adding food manually
    console.log('Add food manually');
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);
    
    if (value === 'week') {
      // Set start to beginning of week
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for week starting on Monday
      start.setDate(now.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      
      // Set end to end of week
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (value === 'month') {
      // Set start to beginning of month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Set end to end of month
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      // Today
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }
    
    setDateRange({ start, end });
  };

  // Generate a display string for the selected date range
  const getDateRangeDisplay = () => {
    if (activeTab === 'today') {
      return format(dateRange.start, 'PPP');
    } else if (activeTab === 'week') {
      return `${format(dateRange.start, 'PP')} - ${format(dateRange.end, 'PP')}`;
    } else if (activeTab === 'month') {
      return format(dateRange.start, 'MMMM yyyy');
    }
    return '';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("nutrition")}
          </h1>
          <p className="text-sm text-muted-foreground">{getDateRangeDisplay()}</p>
        </div>
      </div>

      {/* Time period tabs */}
      <Tabs 
        defaultValue="today" 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="border-b mb-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="today" className="flex-1">
              {t("today")}
            </TabsTrigger>
            <TabsTrigger value="week" className="flex-1">
              {t("week")}
            </TabsTrigger>
            <TabsTrigger value="month" className="flex-1">
              {t("month")}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab contents */}
        <TabsContent value="today" className="mt-0 pt-0">
          <DailySummary />
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <WaterTracking />
          </div>

          <div className="mt-8 flex gap-4">
            <Button onClick={handleAddFood} className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
              {t("addFood")}
            </Button>
            <Button onClick={handleScanBarcode} variant="outline" className="flex-1">
              <ScanBarcode className="mr-2 h-4 w-4" />
              {t("scanBarcode")}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="week" className="mt-0 pt-0">
          <h2 className="text-xl font-medium mb-4">{t("weeklyNutrition")}</h2>
          {/* Weekly nutrition content will go here */}
          <div className="flex flex-col items-center justify-center h-[300px] border rounded-lg">
            <p className="text-muted-foreground">
              {t("weeklyNutrition")} {t("comingSoon")}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="month" className="mt-0 pt-0">
          <h2 className="text-xl font-medium mb-4">{t("monthlyNutrition")}</h2>
          {/* Monthly nutrition content will go here */}
          <div className="flex flex-col items-center justify-center h-[300px] border rounded-lg">
            <p className="text-muted-foreground">
              {t("monthlyNutrition")} {t("comingSoon")}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
