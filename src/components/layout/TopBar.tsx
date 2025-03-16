
import React, { useState } from 'react';
import { BellIcon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import UserMenu from '@/components/auth/UserMenu';
import NotificationsDialog from '@/components/auth/NotificationsDialog';

export default function TopBar() {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  
  // Mark notifications as read when the notification dialog is opened
  const handleOpenNotifications = () => {
    setShowNotifications(true);
    setHasUnreadNotifications(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
      <div className="flex items-center gap-4">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-accent"
              onClick={handleOpenNotifications}
            >
              <BellIcon className="h-5 w-5" />
              <span className="sr-only">{t("notifications")}</span>
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
              )}
            </Button>
          </DialogTrigger>
          <NotificationsDialog open={showNotifications} setOpen={setShowNotifications} />
        </Dialog>
        
        <UserMenu />
      </div>
    </header>
  );
}
