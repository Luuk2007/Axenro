
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart3, Dumbbell, Home, LucideIcon, Settings, User2, Utensils } from 'lucide-react';
import { useLanguage, TranslationKeys } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import { useSubscription } from '@/hooks/useSubscription';

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

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const { subscribed, subscription_tier, loading } = useSubscription();
  
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

  const getCurrentPlanDisplay = () => {
    if (loading) return 'Loading...';
    if (!subscribed) return 'Free Plan';
    return `${subscription_tier} Plan`;
  };

  const getPlanDescription = () => {
    if (loading) return '';
    if (!subscribed) return 'Get started with the basics — track your progress for free';
    if (subscription_tier === 'Pro') return 'Unlock smarter tracking with added features and flexibility';
    if (subscription_tier === 'Premium') return 'Experience the full potential — all features, zero limits';
    return '';
  };

  const handleNavClick = () => {
    if (isMobile && onNavigate) {
      onNavigate();
    }
  };
  
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
                  onClick={handleNavClick}
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
        
        {/* Show subscription plan on both mobile and desktop */}
        <div className="border-t border-border p-4">
          <div 
            className="glassy-card rounded-lg p-4 subtle-shadow cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setSubscriptionModalOpen(true)}
          >
            <p className="text-xs font-medium text-muted-foreground">{getCurrentPlanDisplay()}</p>
            <p className="text-xs mt-1 text-muted-foreground leading-relaxed">{getPlanDescription()}</p>
          </div>
        </div>
      </aside>
      
      <SubscriptionModal 
        open={subscriptionModalOpen} 
        onOpenChange={setSubscriptionModalOpen} 
      />
    </>
  );
}
