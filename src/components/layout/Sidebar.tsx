import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart3, Dumbbell, Home, LucideIcon, Settings, User2, Utensils } from 'lucide-react';
import { useLanguage, TranslationKeys } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';

type NavItem = {
  titleKey: TranslationKeys;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  {
    titleKey: "dashboard",
    href: '/',
    icon: Home,
  },
  {
    titleKey: "nutrition",
    href: '/nutrition',
    icon: Utensils,
  },
  {
    titleKey: "workouts",
    href: '/workouts',
    icon: Dumbbell,
  },
  {
    titleKey: "progress",
    href: '/progress',
    icon: BarChart3,
  },
  {
    titleKey: "profile",
    href: '/profile',
    icon: User2,
  },
  {
    titleKey: "settings",
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  
  // Monitor theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkTheme(document.documentElement.classList.contains('dark'));
    };
    
    // Initial check
    checkTheme();
    
    // Create observer to watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <>
      <aside className={cn(
        "flex flex-col border-border bg-card/50 backdrop-blur-sm",
        isMobile ? "w-full border-b" : "w-64 border-r hidden md:flex"
      )}>
        <div className="flex h-16 items-center px-6">
          <img 
            src={isDarkTheme ? "/lovable-uploads/4c2ef019-f56c-4d5e-a2dc-2976a3b85f08.png" : "/lovable-uploads/6b406cc5-7fc7-419d-8d30-e7acd9762371.png"}
            alt="Progresa Logo" 
            className="h-16 w-auto object-contain max-w-full"
          />
        </div>
        <nav className="flex-1 overflow-auto py-6">
          <ul className="grid gap-1 px-2">
            {navItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 ease-in-out text-muted-foreground hover:text-foreground",
                      isActive ? 
                        "bg-primary/10 text-primary font-medium" : 
                        "hover:bg-accent"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon 
                        size={18} 
                        className={cn(
                          "transition-transform duration-300",
                          isActive && "text-primary"
                        )} 
                      />
                      <span>{t(item.titleKey)}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        {!isMobile && (
          <div className="border-t border-border p-4">
            <div 
              className="glassy-card rounded-lg p-4 subtle-shadow cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setSubscriptionModalOpen(true)}
            >
              <p className="text-xs font-medium text-muted-foreground">{t("premium")}</p>
              <p className="text-sm mt-1">{t("trackFitness")}</p>
            </div>
          </div>
        )}
      </aside>
      
      <SubscriptionModal 
        open={subscriptionModalOpen} 
        onOpenChange={setSubscriptionModalOpen} 
      />
    </>
  );
}
