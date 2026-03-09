import React from 'react';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  onClick?: () => void;
  gradient?: string;
}

const defaultGradients: Record<string, string> = {
  'Flame': 'from-orange-500 to-amber-500',
  'Footprints': 'from-blue-500 to-cyan-500',
  'Dumbbell': 'from-emerald-500 to-teal-500',
  'Weight': 'from-violet-500 to-purple-500',
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  className,
  onClick,
  gradient,
}: StatsCardProps) {
  const iconName = Icon.displayName || Icon.name || '';
  const gradientClass = gradient || defaultGradients[iconName] || 'from-primary to-blue-400';
  
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card p-4 sm:p-5 transition-all duration-300",
        "border border-border/40",
        "hover:-translate-y-0.5",
        onClick && "cursor-pointer",
        className
      )}
      style={{ boxShadow: 'var(--shadow-sm)' }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      {/* Top accent line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-60",
        gradientClass
      )} />
      
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
            {value}
          </p>
          {description && (
            <p className="text-[10px] sm:text-xs text-muted-foreground/70 truncate mt-0.5">
              {description}
            </p>
          )}
        </div>
        
        <div className={cn(
          "flex-shrink-0 rounded-xl p-2 sm:p-2.5",
          "bg-gradient-to-br",
          gradientClass
        )}
        style={{ boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.15)' }}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
