import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart3, Dumbbell, Home, LucideIcon, Settings, User2, Utensils, Sparkles, ChevronRight } from 'lucide-react';
import { useLanguage, TranslationKeys } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import { useSubscription } from '@/hooks/useSubscription';

type NavItem = {
  titleKey: TranslationKeys;
  href: string;
  icon: LucideIcon;
  requiresPremium?: boolean;
  gradient?: string;
};

const navItems: NavItem[] = [
  {
    titleKey: "dashboard",
    href: '/',
    icon: Home,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    titleKey: "Axenro AI",
    href: '/axenro-ai',
    icon: Sparkles,
    requiresPremium: true,
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    titleKey: "nutrition",
    href: '/nutrition',
    icon: Utensils,
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    titleKey: "workouts",
    href: '/workouts',
    icon: Dumbbell,
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    titleKey: "progress",
    href: '/progress',
    icon: BarChart3,
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    titleKey: "profile",
    href: '/profile',
    icon: User2,
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    titleKey: "settings",
    href: '/settings',
    icon: Settings,
    gradient: 'from-slate-500 to-gray-500',
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const { subscribed, subscription_tier, test_mode, test_subscription_tier, loading } = useSubscription();
  
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

  const getCurrentTier = () => {
    return test_mode ? test_subscription_tier : subscription_tier;
  };

  const getCurrentPlanDisplay = () => {
    if (loading) return t('Loading...');
    
    const currentTier = getCurrentTier();
    
    switch (currentTier) {
      case 'pro':
        return t('Pro plan');
      case 'premium':
        return t('Premium plan');
      default:
        return t('Free plan');
    }
  };

  const getPlanDescription = () => {
    if (loading) return '';
    
    const currentTier = getCurrentTier();
    
    switch (currentTier) {
      case 'pro':
        return t('Advanced features for consistent progress');
      case 'premium':
        return t('The complete solution for maximum results');
      default:
        return t('Essential tools to begin your fitness journey');
    }
  };

  const getPlanGradient = () => {
    const currentTier = getCurrentTier();
    switch (currentTier) {
      case 'premium':
        return 'from-violet-500 via-purple-500 to-fuchsia-500';
      case 'pro':
        return 'from-blue-500 via-cyan-500 to-teal-500';
      default:
        return 'from-slate-400 to-slate-500';
    }
  };

  const handleNavClick = () => {
    if (isMobile && onNavigate) {
      onNavigate();
    }
  };

  const handlePrivacyPolicyClick = () => {
    navigate('/privacypolicy');
    handleNavClick();
  };

  const handleTermsClick = () => {
    navigate('/termsandconditions');
    handleNavClick();
  };

  // Filter navigation items based on subscription tier
  const currentTier = getCurrentTier();
  const filteredNavItems = navItems.filter(item => {
    if (item.requiresPremium) {
      return currentTier === 'premium';
    }
    return true;
  });
  
  return (
    <>
      <aside className={cn(
        "flex flex-col bg-card/50 backdrop-blur-xl border-r border-border/50",
        isMobile ? "w-full h-full" : "w-72 hidden md:flex"
      )}>
        {/* Logo Section */}
        <div className="flex h-20 items-center justify-start px-6 pt-2">
          <img 
            src={isDarkTheme ? "/lovable-uploads/4df4b86d-bc17-46f1-ba5a-a9b628a52fbd.png" : "/lovable-uploads/a6bd449c-9a53-4c14-a15f-aee4b1ad983c.png"}
            alt="Axenro Logo" 
            className={cn(
              "w-auto object-contain transition-all duration-300",
              isMobile ? "h-14" : "h-16"
            )}
          />
        </div>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Navigation */}
          <nav className="flex-1 overflow-auto py-4 px-3">
            <ul className="space-y-1.5">
              {filteredNavItems.map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={item.href}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ease-out",
                        isActive ? 
                          "bg-primary/10 text-primary shadow-sm" : 
                          "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={cn(
                          "flex items-center justify-center rounded-lg p-2 transition-all duration-300",
                          isActive 
                            ? `bg-gradient-to-br ${item.gradient} shadow-lg`
                            : "bg-muted group-hover:bg-gradient-to-br group-hover:" + item.gradient
                        )}>
                          <item.icon 
                            size={18} 
                            className={cn(
                              "transition-all duration-300",
                              isActive ? "text-white" : "text-muted-foreground group-hover:text-white"
                            )} 
                          />
                        </div>
                        <span className={cn(
                          "font-medium transition-all duration-300",
                          isActive && "text-primary"
                        )}>
                          {t(item.titleKey)}
                        </span>
                        {isActive && (
                          <ChevronRight className="ml-auto h-4 w-4 text-primary/50" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Bottom section */}
          <div className="mt-auto">
            {/* Legal links */}
            <div className="px-6 pb-3">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handlePrivacyPolicyClick}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('Privacy Policy')}
                </button>
                <span className="text-muted-foreground/30">•</span>
                <button
                  onClick={handleTermsClick}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('Terms & Conditions')}
                </button>
              </div>
            </div>
            
            {/* Subscription plan card */}
            <div className="p-4">
              <div 
                className={cn(
                  "relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                  "bg-gradient-to-br",
                  getPlanGradient()
                )}
                onClick={() => setSubscriptionModalOpen(true)}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-white/90">{getCurrentPlanDisplay()}</p>
                  <p className="text-xs mt-1 text-white/70 leading-relaxed">{getPlanDescription()}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-white">
                    <span>Upgrade</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
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