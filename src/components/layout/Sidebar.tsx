import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart3, Dumbbell, Home, LucideIcon, Settings, User2, Utensils } from 'lucide-react';
import { useLanguage, TranslationKeys } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

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
  
  // Check if dark theme is active
  const isDarkTheme = document.documentElement.classList.contains('dark');
  
  return (
    <aside className={cn(
      "flex flex-col border-border bg-card/50 backdrop-blur-sm",
      isMobile ? "w-full border-b" : "w-64 border-r hidden md:flex"
    )}>
      <div className="flex h-16 items-center px-6">
        <img 
          src={isDarkTheme ? "/lovable-uploads/4e0637d9-9c94-49fe-9f8c-f51ba36232ca.png" : "/lovable-uploads/5a043003-b31b-4592-a628-4f1d3a423ae2.png"}
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
          <div className="glassy-card rounded-lg p-4 subtle-shadow">
            <p className="text-xs font-medium text-muted-foreground">{t("premium")}</p>
            <p className="text-sm mt-1">{t("trackFitness")}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
