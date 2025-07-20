
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
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  className,
  onClick,
}: StatsCardProps) {
  return (
    <div 
      className={cn(
        "glassy-card rounded-xl p-3 sm:p-5 card-shadow hover-scale",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-semibold tracking-tight">{value}</p>
          {description && (
            <p className="mt-0.5 sm:mt-1 text-xs text-muted-foreground truncate">{description}</p>
          )}
        </div>
        <div className="rounded-full bg-primary/10 p-1.5 sm:p-2.5 flex-shrink-0 ml-2">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
