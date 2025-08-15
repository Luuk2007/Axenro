
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { format, addDays, isToday, isTomorrow, isYesterday } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
// Import only needed date-fns locales
import { nl, enUS } from 'date-fns/locale';

interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

const DateNavigation = ({ selectedDate, onDateChange, className }: DateNavigationProps) => {
  const { t, language } = useLanguage();

  // Get appropriate locale based on current language
  const getLocale = () => {
    switch (language) {
      case 'dutch': return nl;
      default: return enUS;
    }
  };

  const formatDateDisplay = (date: Date) => {
    if (isToday(date)) {
      return t('Today');
    } else if (isYesterday(date)) {
      return t('Yesterday');
    } else if (isTomorrow(date)) {
      return t('Tomorrow');
    } else {
      return format(date, 'EEEE, MMM d', { locale: getLocale() });
    }
  };

  const goToPrevDay = () => {
    onDateChange(addDays(selectedDate, -1));
  };

  const goToNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className={`flex justify-between items-center ${className}`}>
      <Button variant="ghost" size="icon" onClick={goToPrevDay} aria-label="Previous day">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="px-3 py-1">
            <Calendar className="mr-2 h-4 w-4" />
            <h2 className="text-lg font-medium">{formatDateDisplay(selectedDate)}</h2>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateChange(date)}
            initialFocus
          />
          <div className="p-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={goToToday} className="w-full">
              {t('Today')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      <Button variant="ghost" size="icon" onClick={goToNextDay} aria-label="Next day">
        <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default DateNavigation;
