
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { format, addDays, isToday, isTomorrow, isYesterday } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

const DateNavigation = ({ selectedDate, onDateChange, className }: DateNavigationProps) => {
  const { t } = useLanguage();

  const formatDateDisplay = (date: Date) => {
    if (isToday(date)) {
      return t('today');
    } else if (isYesterday(date)) {
      return t('yesterday');
    } else if (isTomorrow(date)) {
      return t('tomorrow');
    } else {
      return format(date, 'EEEE, MMM d');
    }
  };

  const goToPrevDay = () => {
    onDateChange(addDays(selectedDate, -1));
  };

  const goToNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  return (
    <div className={`flex justify-between items-center ${className}`}>
      <Button variant="ghost" size="icon" onClick={goToPrevDay}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h2 className="text-lg font-medium">{formatDateDisplay(selectedDate)}</h2>
      <Button variant="ghost" size="icon" onClick={goToNextDay}>
        <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default DateNavigation;
