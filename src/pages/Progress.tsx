
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, TrendingUp, Target, Camera } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { WeightTracker } from "@/components/progress/WeightTracker";
import ProgressChart from "@/components/dashboard/ProgressChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MeasurementEntry {
  id: string;
  date: string;
  waist: number;
  hips: number;
  chest: number;
  arms: number;
  thighs: number;
}

const Progress = () => {
  const { t } = useLanguage();
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState<string>('waist');
  const [newMeasurement, setNewMeasurement] = useState({
    waist: '',
    hips: '',
    chest: '',
    arms: '',
    thighs: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('measurements');
    if (saved) {
      const parsedMeasurements = JSON.parse(saved);
      setMeasurements(parsedMeasurements);
      
      // Find the first measurement type that has data
      if (parsedMeasurements.length > 0) {
        const measurementTypes = ['waist', 'hips', 'chest', 'arms', 'thighs'];
        const firstMeasurementWithData = measurementTypes.find(type => 
          parsedMeasurements.some((m: MeasurementEntry) => Number(m[type as keyof MeasurementEntry]) > 0)
        );
        if (firstMeasurementWithData) {
          setSelectedMeasurement(firstMeasurementWithData);
        }
      }
    }
  }, []);

  const addMeasurement = () => {
    const hasData = Object.values(newMeasurement).some(value => value !== '');
    if (!hasData) {
      toast.error(t("pleaseEnterValue"));
      return;
    }

    const entry: MeasurementEntry = {
      id: Date.now().toString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      waist: parseFloat(newMeasurement.waist) || 0,
      hips: parseFloat(newMeasurement.hips) || 0,
      chest: parseFloat(newMeasurement.chest) || 0,
      arms: parseFloat(newMeasurement.arms) || 0,
      thighs: parseFloat(newMeasurement.thighs) || 0,
    };

    const updatedMeasurements = [...measurements, entry];
    setMeasurements(updatedMeasurements);
    localStorage.setItem('measurements', JSON.stringify(updatedMeasurements));
    setNewMeasurement({
      waist: '',
      hips: '',
      chest: '',
      arms: '',
      thighs: ''
    });
    toast.success(t("measurementAdded"));
  };

  const getMeasurementData = (type: string) => {
    return measurements
      .filter(m => Number(m[type as keyof MeasurementEntry]) > 0)
      .map(m => ({
        date: format(new Date(m.date), 'MMM dd'),
        value: Number(m[type as keyof MeasurementEntry]),
        originalDate: m.date
      }));
  };

  const measurementTypes = [
    { key: 'waist', label: t('waist') },
    { key: 'hips', label: t('hips') },
    { key: 'chest', label: t('chest') },
    { key: 'arms', label: t('arms') },
    { key: 'thighs', label: t('thighs') }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("progressOverview")}</h1>
      </div>

      <Tabs defaultValue="weight" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weight">{t("weight")}</TabsTrigger>
          <TabsTrigger value="measurements">{t("measurements")}</TabsTrigger>
          <TabsTrigger value="photos">{t("photos")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weight" className="space-y-4">
          <WeightTracker />
        </TabsContent>
        
        <TabsContent value="measurements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {t("addMeasurement")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="waist">{t("waist")} ({t("cm")})</Label>
                    <Input
                      id="waist"
                      type="number"
                      value={newMeasurement.waist}
                      onChange={(e) => setNewMeasurement({...newMeasurement, waist: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hips">{t("hips")} ({t("cm")})</Label>
                    <Input
                      id="hips"
                      type="number"
                      value={newMeasurement.hips}
                      onChange={(e) => setNewMeasurement({...newMeasurement, hips: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chest">{t("chest")} ({t("cm")})</Label>
                    <Input
                      id="chest"
                      type="number"
                      value={newMeasurement.chest}
                      onChange={(e) => setNewMeasurement({...newMeasurement, chest: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="arms">{t("arms")} ({t("cm")})</Label>
                    <Input
                      id="arms"
                      type="number"
                      value={newMeasurement.arms}
                      onChange={(e) => setNewMeasurement({...newMeasurement, arms: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thighs">{t("thighs")} ({t("cm")})</Label>
                    <Input
                      id="thighs"
                      type="number"
                      value={newMeasurement.thighs}
                      onChange={(e) => setNewMeasurement({...newMeasurement, thighs: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <Button onClick={addMeasurement} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("add")}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Measurement Trends
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedMeasurement} onValueChange={setSelectedMeasurement}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {measurementTypes.map(type => (
                        <SelectItem key={type.key} value={type.key}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ProgressChart
                  data={getMeasurementData(selectedMeasurement)}
                  title=""
                  label="cm"
                  color="#3b82f6"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                {t("photos")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Progress photos feature coming soon</p>
                <Button disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addPhoto")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Progress;
