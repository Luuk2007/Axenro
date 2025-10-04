import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { type LucideIcon } from 'lucide-react';

interface StatsCardSkeletonProps {
  icon: LucideIcon;
  className?: string;
}

export default function StatsCardSkeleton({ icon: Icon, className }: StatsCardSkeletonProps) {
  return (
    <div className={cn("glassy-card rounded-xl p-3 sm:p-5 card-shadow", className)}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-7 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="rounded-full bg-primary/10 p-1.5 sm:p-2.5 flex-shrink-0 ml-2">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary/30" />
        </div>
      </div>
    </div>
  );
}
