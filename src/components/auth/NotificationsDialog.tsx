
import React from 'react';
import { BellIcon } from 'lucide-react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function NotificationsDialog({ open, setOpen }: NotificationsDialogProps) {
  const { t } = useLanguage();

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{t("notifications")}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-2 py-4">
        <div className="flex items-start gap-4 border-b border-border pb-4">
          <div className="rounded-full bg-primary/10 p-2">
            <BellIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">Workout Reminder</p>
            <p className="text-sm text-muted-foreground">Your scheduled workout "Upper Body Strength" is due in 30 minutes.</p>
            <p className="text-xs text-muted-foreground mt-1">Today, 9:00 AM</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-2">
            <BellIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">Goal Reached!</p>
            <p className="text-sm text-muted-foreground">Congratulations! You've reached your daily step goal of 10,000 steps.</p>
            <p className="text-xs text-muted-foreground mt-1">Yesterday, 8:30 PM</p>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
