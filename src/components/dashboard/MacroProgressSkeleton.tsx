import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MacroProgressSkeleton() {
  const { t } = useLanguage();
  
  return (
    <div className="glassy-card rounded-xl overflow-hidden card-shadow">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-medium tracking-tight">{t("Daily nutrition tracker")}</h3>
      </div>
      <div className="p-5 space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between mb-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
        
        <div className="mt-6 pt-4 border-t border-border">
          <Skeleton className="h-4 w-48 mb-3" />
          <div className="flex justify-between gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
