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
        "group relative overflow-hidden rounded-2xl bg-card p-5 transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1",
        "border border-border/50",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Subtle gradient overlay on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300",
        "bg-gradient-to-br",
        gradientClass
      )} />
      
      {/* Top gradient line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
        gradientClass
      )} />
      
      <div className="relative flex items-start justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium text-muted-foreground truncate">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight">
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground/80 truncate mt-1">
              {description}
            </p>
          )}
        </div>
        
        <div className={cn(
          "flex-shrink-0 ml-4 rounded-xl p-3",
          "bg-gradient-to-br shadow-lg",
          gradientClass
        )}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}