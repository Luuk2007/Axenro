
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProgressData {
  date: string;
  value: number;
}

interface ProgressChartProps {
  data: ProgressData[];
  title: string;
  label: string;
  color: string;
  className?: string;
  onViewAll?: () => void;
  targetValue?: number;
}

export default function ProgressChart({ 
  data, 
  title, 
  label, 
  color, 
  className, 
  onViewAll,
  targetValue 
}: ProgressChartProps) {
  const { t } = useLanguage();
  const latestValue = data.length > 0 ? data[data.length - 1].value : 0;
  const previousValue = data.length > 1 ? data[data.length - 2].value : 0;
  const difference = latestValue - previousValue;
  const isPositive = difference >= 0;

  // Calculate min and max for better scaling
  const values = data.map(item => item.value);
  const minValue = Math.min(...values) - 1; // Add some padding
  const maxValue = Math.max(...values) + 1; // Add some padding

  // Ensure min and max have a reasonable distance between them
  const yDomain = [
    Math.min(minValue, targetValue ? targetValue - 2 : minValue),
    Math.max(maxValue, targetValue ? targetValue + 2 : maxValue)
  ];

  return (
    <div className={cn("glassy-card rounded-xl overflow-hidden card-shadow hover-scale", className)}>
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-medium tracking-tight">{title}</h3>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              {t("viewAll")}
            </Button>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-baseline">
          <span className="text-2xl font-semibold tracking-tight mr-2">
            {latestValue} {label}
          </span>
          <span className={cn(
            "text-xs font-medium",
            isPositive ? "text-green-500" : "text-red-500"
          )}>
            {isPositive ? "+" : ""}{difference.toFixed(1)} {label}
          </span>
        </div>
        <div className="h-[180px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`color${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                domain={yDomain}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                width={30}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid rgba(0,0,0,0.05)', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)' 
                }} 
                formatter={(value) => [`${value} ${label}`, '']}
              />
              {targetValue && (
                <ReferenceLine 
                  y={targetValue}
                  stroke="#FF6B6B"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  label={{
                    position: 'right',
                    value: `${t("targetWeight")}: ${targetValue}${label}`,
                    fill: '#FF6B6B',
                    fontSize: 10
                  }}
                />
              )}
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                fillOpacity={1}
                fill={`url(#color${color})`} 
                strokeWidth={2}
                activeDot={{ r: 4, strokeWidth: 1 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
