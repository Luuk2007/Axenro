
import React from 'react';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  'Dumbbell': 'from-green-500 to-emerald-500',
  'Weight': 'from-purple-500 to-pink-500',
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
  const gradientClass = gradient || defaultGradients[iconName] || 'from-primary to-primary/60';
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-md",
        onClick && "cursor-pointer hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <div className={`h-1 bg-gradient-to-r ${gradientClass}`} />
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="mt-0.5 sm:mt-1 text-xs text-muted-foreground truncate">{description}</p>
            )}
          </div>
          <div className={`rounded-full p-2 sm:p-2.5 flex-shrink-0 ml-2 bg-gradient-to-br ${gradientClass} bg-opacity-10`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
