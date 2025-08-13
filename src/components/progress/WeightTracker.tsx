
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { useMeasurementSystem } from "@/hooks/useMeasurementSystem";
import { convertWeight, getWeightUnit, formatWeight } from "@/utils/unitConversions";

interface WeightEntry {
  date: string;
  value: number; // Always stored in kg (metric)
}

const WeightTracker = () => {
  const { t } = useLanguage();
  const { measurementSystem } = useMeasurementSystem();
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [newWeight, setNewWeight] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Load weight data from localStorage
    const savedData = localStorage.getItem("weightData");
    if (savedData) {
      try {
        setWeightData(JSON.parse(savedData));
      } catch (error) {
        console.error("Error loading weight data:", error);
      }
    }
  }, []);

  const saveWeightData = (data: WeightEntry[]) => {
    localStorage.setItem("weightData", JSON.stringify(data));
    setWeightData(data);
  };

  const addWeight = () => {
    if (!newWeight || !newDate) {
      toast.error(t("pleaseEnterValue"));
      return;
    }

    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) {
      toast.error(t("pleaseEnterValidValue"));
      return;
    }

    // Convert input weight to metric for storage
    const metricWeight = convertWeight(weight, measurementSystem, 'metric');

    const newEntry: WeightEntry = {
      date: newDate,
      value: metricWeight // Store in metric
    };

    // Check if date already exists
    const existingIndex = weightData.findIndex(entry => entry.date === newDate);
    let updatedData;
    
    if (existingIndex >= 0) {
      // Update existing entry
      updatedData = [...weightData];
      updatedData[existingIndex] = newEntry;
      toast.success(t("weightUpdated"));
    } else {
      // Add new entry
      updatedData = [...weightData, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      toast.success(t("Weight added"));
    }

    saveWeightData(updatedData);
    setNewWeight("");
    setNewDate(new Date().toISOString().split('T')[0]);
  };

  const deleteWeight = (date: string) => {
    const updatedData = weightData.filter(entry => entry.date !== date);
    saveWeightData(updatedData);
    toast.success(t("weightEntryDeleted"));
  };

  // Convert data for chart display
  const chartData = weightData.map(entry => ({
    date: entry.date,
    weight: convertWeight(entry.value, 'metric', measurementSystem) // Convert for display
  }));

  const formatTooltipValue = (value: number) => {
    return `${formatWeight(value, measurementSystem)} ${getWeightUnit(measurementSystem)}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("Add weight")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                {t("weight")} ({getWeightUnit(measurementSystem)})
              </label>
              <Input
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Enter weight"
                step="0.1"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">{t("date")}</label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <Button onClick={addWeight}>
              <Plus className="h-4 w-4 mr-2" />
              {t("add")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {weightData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("Weight progress")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium mb-3">{t("Weight entries")}</h4>
              {weightData.map((entry, index) => {
                const displayWeight = convertWeight(entry.value, 'metric', measurementSystem);
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <span className="font-medium">{entry.date}</span>
                    <div className="flex items-center gap-3">
                      <span>{formatWeight(displayWeight, measurementSystem)} {getWeightUnit(measurementSystem)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWeight(entry.date)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeightTracker;
