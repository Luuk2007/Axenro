import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart3, Dumbbell, Home, LucideIcon, Settings, User2, Utensils } from 'lucide-react';
import { useLanguage, TranslationKeys } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import { useSubscription } from '@/hooks/useSubscription';
import PrivacyPolicyModal from '@/components/legal/PrivacyPolicyModal';
import TermsConditionsModal from '@/components/legal/TermsConditionsModal';

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
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
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
    if (loading) return t('Loading...');
    if (!subscribed) return t('Free Plan');
    return `${subscription_tier} ${t('Plan')}`;
  };

  const getPlanDescription = () => {
    if (loading) return '';
    if (!subscribed) return t('Get started with the basics — track your progress for free');
    if (subscription_tier === 'Pro') return t('Unlock smarter tracking with added features and flexibility');
    if (subscription_tier === 'Premium') return t('Experience the full potential — all features, zero limits');
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
        isMobile ? "w-full border-b h-full" : "w-64 border-r hidden md:flex"
      )}>
        <div className="flex h-20 items-center justify-start px-4 pt-2">
          <img 
            src={isDarkTheme ? "/lovable-uploads/b94d76e9-30f7-400c-8294-58d72b2d16cf.png" : "/lovable-uploads/2622c944-7422-4825-b6cb-9803e827ef96.png"}
            alt="Axenro Logo" 
            className="h-18 w-auto object-contain"
          />
        </div>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <nav className="flex-1 overflow-auto py-2">
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
          
          {/* Bottom section with legal links and subscription plan */}
          <div className="mt-auto">
            {/* Legal links section */}
            <div className="px-4 pb-2">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setPrivacyModalOpen(true)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  {t('Privacy Policy')}
                </button>
                <span className="text-xs text-muted-foreground">•</span>
                <button
                  onClick={() => setTermsModalOpen(true)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  {t('Terms & Conditions')}
                </button>
              </div>
            </div>
            
            {/* Subscription plan section */}
            <div className="border-t border-border p-4">
              <div 
                className="glassy-card rounded-lg p-4 subtle-shadow cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setSubscriptionModalOpen(true)}
              >
                <p className="text-xs font-medium text-muted-foreground">{getCurrentPlanDisplay()}</p>
                <p className="text-xs mt-1 text-muted-foreground leading-relaxed">{getPlanDescription()}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      <SubscriptionModal 
        open={subscriptionModalOpen} 
        onOpenChange={setSubscriptionModalOpen} 
      />
      
      <PrivacyPolicyModal 
        open={privacyModalOpen} 
        onOpenChange={setPrivacyModalOpen} 
      />
      
      <TermsConditionsModal 
        open={termsModalOpen} 
        onOpenChange={setTermsModalOpen} 
      />
    </>
  );
}
