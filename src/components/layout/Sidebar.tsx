
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart3, Dumbbell, Home, LucideIcon, Settings, User2, Utensils } from 'lucide-react';
import { useLanguage, TranslationKeys } from '@/contexts/LanguageContext';

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
  
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur-sm">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-semibold tracking-tight">Progresa</h1>
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
      <div className="border-t border-border p-4">
        <div className="glassy-card rounded-lg p-4 subtle-shadow">
          <p className="text-xs font-medium text-muted-foreground">{t("premium")}</p>
          <p className="text-sm mt-1">{t("trackFitness")}</p>
        </div>
      </div>
    </aside>
  );
}
