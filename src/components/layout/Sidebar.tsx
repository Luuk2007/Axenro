import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart3, Dumbbell, Home, LucideIcon, Settings, User2, Utensils, Sparkles, MessageSquare } from 'lucide-react';
import { useLanguage, TranslationKeys } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import ReviewsModal from '@/components/reviews/ReviewsModal';
import { useSubscription } from '@/hooks/useSubscription';

type NavItem = {
  titleKey: TranslationKeys;
  href: string;
  icon: LucideIcon;
  requiresPremium?: boolean;
};

const navItems: NavItem[] = [
  {
    titleKey: "dashboard",
    href: '/',
    icon: Home,
  },
  {
    titleKey: "Axenro AI",
    href: '/axenro-ai',
    icon: Sparkles,
    requiresPremium: true,
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
  const navigate = useNavigate();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
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
        "flex flex-col border-border bg-card/50 backdrop-blur-sm",
        isMobile ? "w-full border-b h-full" : "w-64 border-r hidden md:flex"
      )}>
        <div className="flex h-20 items-center justify-start px-4 pt-2">
          <img 
            src={isDarkTheme ? "/lovable-uploads/4df4b86d-bc17-46f1-ba5a-a9b628a52fbd.png" : "/lovable-uploads/a6bd449c-9a53-4c14-a15f-aee4b1ad983c.png"}
            alt="Axenro Logo" 
            className={cn(
              "w-auto object-contain",
              isMobile ? "h-16" : "h-18"
            )}
          />
        </div>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <nav className="flex-1 overflow-auto py-2">
            <ul className="grid gap-1 px-2">
              {filteredNavItems.map((item, index) => (
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
          
          {/* Bottom section with reviews, legal links and subscription plan */}
          <div className="mt-auto">
            {/* Reviews section */}
            <div className="px-4 pb-2">
              <button
                onClick={() => setReviewsModalOpen(true)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2"
              >
                <MessageSquare size={14} />
                <span>Reviews</span>
              </button>
            </div>
            
            {/* Legal links section */}
            <div className="px-4 pb-2">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handlePrivacyPolicyClick}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  {t('Privacy Policy')}
                </button>
                <span className="text-xs text-muted-foreground">•</span>
                <button
                  onClick={handleTermsClick}
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
      
      <ReviewsModal 
        open={reviewsModalOpen} 
        onOpenChange={setReviewsModalOpen} 
      />
    </>
  );
}
