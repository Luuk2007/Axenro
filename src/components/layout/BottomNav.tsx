import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Utensils, Dumbbell, BarChart3, Settings, User, Sparkles, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const baseNavItems = [
  { titleKey: 'dashboard' as const, href: '/', icon: Home },
  { titleKey: 'nutrition' as const, href: '/nutrition', icon: Utensils },
  { titleKey: 'workouts' as const, href: '/workouts', icon: Dumbbell },
  { titleKey: 'progress' as const, href: '/progress', icon: BarChart3 },
  { titleKey: 'settings' as const, href: '/settings', icon: Settings },
  { titleKey: 'profile' as const, href: '/profile', icon: User },
  { label: 'Axenro AI', href: '/axenro-ai', icon: Sparkles },
];

export default function BottomNav() {
  const { t } = useLanguage();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdminAccess();

  const navItems = [
    ...baseNavItems,
    ...(user && isAdmin ? [{ label: 'Beheer', href: '/beheer', icon: ShieldCheck }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/30 bg-background/80 backdrop-blur-2xl safe-area-bottom">
      <div className="flex items-center h-16 overflow-x-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const label = 'titleKey' in item ? t(item.titleKey as any) : item.label;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className="relative flex flex-col items-center justify-center min-w-[64px] flex-shrink-0 h-full gap-0.5 tap-highlight-none px-2"
            >
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="bottomnav-indicator"
                    className="absolute -inset-2 rounded-xl bg-primary/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={cn(
                    "relative z-10 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200 whitespace-nowrap",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
