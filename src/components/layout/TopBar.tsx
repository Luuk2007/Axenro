
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import UserMenu from '@/components/auth/UserMenu';
import { ThemeSwitch } from '@/components/ui/theme-switch-button';
import { LanguageSwitch } from '@/components/ui/language-switch-button';

export default function TopBar() {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarNavigate = () => {
    setSidebarOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
      <div className="flex items-center gap-4">
        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar onNavigate={handleSidebarNavigate} />
            </SheetContent>
          </Sheet>
        )}
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitch />
        <ThemeSwitch />
        <UserMenu />
      </div>
    </header>
  );
}
