import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface DailySummarySkeletonProps {
  className?: string;
}

export default function DailySummarySkeleton({ className }: DailySummarySkeletonProps) {
  return (
    <div className={`grid grid-cols-1 gap-3 ${className}`}>
      <div className="border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-3 shadow-sm">
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-1.5 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
