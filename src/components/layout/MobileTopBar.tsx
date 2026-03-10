import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import UserMenu from '@/components/auth/UserMenu';
import { ThemeSwitch } from '@/components/ui/theme-switch-button';
import { LanguageSwitch } from '@/components/ui/language-switch-button';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

export default function MobileTopBar() {
  const { t } = useLanguage();
  const { test_mode, test_subscription_tier, subscription_tier } = useSubscription();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkTheme(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const currentTier = test_mode ? test_subscription_tier : subscription_tier;
  const showThemeSwitch = currentTier === 'pro' || currentTier === 'premium';

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between bg-background/80 backdrop-blur-2xl px-4">
      <div className="flex items-center">
        <img
          src={isDarkTheme
            ? "/lovable-uploads/4df4b86d-bc17-46f1-ba5a-a9b628a52fbd.png"
            : "/lovable-uploads/a6bd449c-9a53-4c14-a15f-aee4b1ad983c.png"}
          alt="Axenro Logo"
          className="h-8 w-auto object-contain"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <LanguageSwitch />
        {showThemeSwitch && <ThemeSwitch />}
        <UserMenu />
      </div>
    </header>
  );
}
