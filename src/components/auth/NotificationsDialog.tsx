
import React, { useState } from 'react';
import { BellIcon, X } from 'lucide-react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
}

export default function NotificationsDialog({ open, setOpen }: NotificationsDialogProps) {
  const { t } = useLanguage();
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Workout Reminder',
      message: 'Your scheduled workout "Upper Body Strength" is due in 30 minutes.',
      timestamp: 'Today, 9:00 AM'
    },
    {
      id: '2',
      title: 'Goal Reached!',
      message: 'Congratulations! You\'ve reached your daily step goal of 10,000 steps.',
      timestamp: 'Yesterday, 8:30 PM'
    }
  ]);

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{t("notifications")}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-2 py-4">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div key={notification.id} className={`flex items-start gap-4 ${index < notifications.length - 1 ? 'border-b border-border pb-4' : ''}`}>
              <div className="rounded-full bg-primary/10 p-2">
                <BellIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteNotification(notification.id)}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No notifications</p>
          </div>
        )}
      </div>
    </DialogContent>
  );
}
