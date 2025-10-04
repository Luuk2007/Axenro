import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Utensils } from 'lucide-react';

interface MealsListSkeletonProps {
  title: string;
  className?: string;
}

export default function MealsListSkeleton({ title, className }: MealsListSkeletonProps) {
  return (
    <div className={cn("glassy-card rounded-xl card-shadow h-full flex flex-col", className)}>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-medium tracking-tight">{title}</h3>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex-1">
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Utensils className="h-5 w-5 text-primary/30" />
                </div>
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
