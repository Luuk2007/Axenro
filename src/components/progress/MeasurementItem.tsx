
import React from 'react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Measurement {
  id: string;
  type: string;
  value: number;
  unit: string;
  date: string;
}

interface MeasurementItemProps {
  measurement: Measurement;
  onDelete: (id: string) => void;
}

export default function MeasurementItem({ measurement, onDelete }: MeasurementItemProps) {
  const { t } = useLanguage();
  
  // Format the date nicely
  const formatDisplayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PP');
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="flex items-center justify-between p-4 border-b border-border last:border-0">
      <div>
        <h3 className="font-medium">{measurement.type}</h3>
        <p className="text-sm text-muted-foreground">{formatDisplayDate(measurement.date)}</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-xl font-bold">
          {measurement.value} {measurement.unit}
        </span>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(measurement.id)}
          title={t("deleteMeasurement")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
