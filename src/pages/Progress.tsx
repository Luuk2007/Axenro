
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import WeightTracker from '@/components/progress/WeightTracker';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import MeasurementItem, { Measurement } from '@/components/progress/MeasurementItem';
import ProgressPhotos from '@/components/progress/ProgressPhotos';

const measurementFormSchema = z.object({
  type: z.string().min(1, {
    message: "Please select a measurement type.",
  }),
  value: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid number greater than 0.",
  }),
});

const measurementTypes = [
  { value: 'chest', label: 'Chest', unit: 'cm' },
  { value: 'waist', label: 'Waist', unit: 'cm' },
  { value: 'hips', label: 'Hips', unit: 'cm' },
  { value: 'biceps', label: 'Biceps', unit: 'cm' },
  { value: 'thighs', label: 'Thighs', unit: 'cm' },
  { value: 'bodyfat', label: 'Body Fat', unit: '%' },
  { value: 'neck', label: 'Neck', unit: 'cm' },
  { value: 'shoulders', label: 'Shoulders', unit: 'cm' },
  { value: 'forearms', label: 'Forearms', unit: 'cm' },
  { value: 'calves', label: 'Calves', unit: 'cm' },
];

export default function Progress() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('weight');
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof measurementFormSchema>>({
    resolver: zodResolver(measurementFormSchema),
    defaultValues: {
      type: '',
      value: '',
    },
  });

  // Load measurements from localStorage on component mount
  useEffect(() => {
    const savedMeasurements = localStorage.getItem('bodyMeasurements');
    if (savedMeasurements) {
      try {
        setMeasurements(JSON.parse(savedMeasurements));
      } catch (error) {
        console.error('Error parsing body measurements:', error);
      }
    }
  }, []);

  // Save measurements to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bodyMeasurements', JSON.stringify(measurements));
  }, [measurements]);

  const getMeasurementLabel = (value: string) => {
    const type = measurementTypes.find(type => type.value === value);
    return type ? type.label : value;
  };

  const getMeasurementUnit = (value: string) => {
    const type = measurementTypes.find(type => type.value === value);
    return type ? type.unit : 'cm';
  };

  const onSubmitMeasurement = (data: z.infer<typeof measurementFormSchema>) => {
    const newMeasurement: Measurement = {
      id: uuid(),
      type: getMeasurementLabel(data.type),
      value: Number(data.value),
      unit: getMeasurementUnit(data.type),
      date: new Date().toISOString(),
    };

    setMeasurements(prev => [newMeasurement, ...prev]);
    setIsMeasurementDialogOpen(false);
    toast.success(`${newMeasurement.type} measurement added successfully`);
    form.reset();
  };

  const handleDeleteMeasurement = (id: string) => {
    setMeasurements(prev => prev.filter(measurement => measurement.id !== id));
    toast.success('Measurement deleted successfully');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("progress")}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="weight">{t("weight")}</TabsTrigger>
          <TabsTrigger value="measurements">{t("measurements")}</TabsTrigger>
          <TabsTrigger value="photos">{t("photos")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weight" className="pt-6">
          <WeightTracker />
        </TabsContent>
        
        <TabsContent value="measurements" className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">{t("bodyMeasurements")}</h2>
            <Dialog open={isMeasurementDialogOpen} onOpenChange={setIsMeasurementDialogOpen}>
              <DialogTrigger asChild>
                <Button>{t("addMeasurement")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("addMeasurement")}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitMeasurement)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("type")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select measurement type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {measurementTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label} ({type.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("value")}</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">{t("add")}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {measurements.length > 0 ? (
            <div className="border rounded-lg overflow-hidden divide-y">
              {measurements.map(measurement => (
                <MeasurementItem 
                  key={measurement.id} 
                  measurement={measurement}
                  onDelete={handleDeleteMeasurement}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 border rounded-lg">
              <h3 className="font-semibold mb-1">{t("noMeasurementsYet")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("startTrackingMeasurements")}
              </p>
              <Button onClick={() => setIsMeasurementDialogOpen(true)}>
                {t("addMeasurement")}
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="photos" className="pt-6">
          <ProgressPhotos />
        </TabsContent>
      </Tabs>
    </div>
  );
}
