
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Star } from 'lucide-react';

interface PlanBadgeProps {
  tier: 'pro' | 'premium';
  size?: 'sm' | 'md';
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({ tier, size = 'sm' }) => {
  const isSmall = size === 'sm';
  
  return (
    <Badge 
      variant={tier === 'premium' ? 'default' : 'secondary'}
      className={`gap-1 ${isSmall ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}
    >
      {tier === 'premium' ? (
        <Crown className={isSmall ? 'h-3 w-3' : 'h-4 w-4'} />
      ) : (
        <Star className={isSmall ? 'h-3 w-3' : 'h-4 w-4'} />
      )}
      {tier === 'premium' ? 'Premium' : 'Pro'}
    </Badge>
  );
};
