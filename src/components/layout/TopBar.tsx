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
import { useSubscription } from '@/hooks/useSubscription';

export default function TopBar() {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const { test_mode, test_subscription_tier, subscription_tier } = useSubscription();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentTier = test_mode ? test_subscription_tier : subscription_tier;
  const showThemeSwitch = currentTier === 'pro' || currentTier === 'premium';

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/30 bg-background/80 backdrop-blur-xl px-4 md:px-6">
      <div className="flex items-center gap-4">
        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-xl h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <LanguageSwitch />
        {showThemeSwitch && <ThemeSwitch />}
        <UserMenu />
      </div>
    </header>
  );
}
