
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProgressData {
  date: string;
  value: number;
  originalDate?: string; // For sorting and tooltip display purposes
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
  
  // Ensure data is sorted by date
  const sortedData = React.useMemo(() => {
    if (!data.length) return [];
    
    // Create a copy to avoid mutating original data
    return [...data].sort((a, b) => {
      // Use originalDate if available, otherwise use date
      const dateA = a.originalDate ? new Date(a.originalDate) : new Date(a.date);
      const dateB = b.originalDate ? new Date(b.originalDate) : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [data]);

  const latestValue = sortedData.length > 0 ? sortedData[sortedData.length - 1].value : 0;
  const previousValue = sortedData.length > 1 ? sortedData[sortedData.length - 2].value : 0;
  const difference = latestValue - previousValue;
  const isPositive = difference >= 0;

  // Calculate min and max for better scaling with expanded range
  const values = sortedData.map(item => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Add more padding for Y axis to show a wider range
  const yPaddingPercentage = 0.15; // 15% padding
  const range = max - min;
  
  // Calculate Y axis domain with padding
  const yMin = Math.max(0, min - (range * yPaddingPercentage));
  const yMax = max + (range * yPaddingPercentage);
  
  // Ensure min and max have a reasonable distance between them
  const yDomain = [
    Math.min(yMin, targetValue ? targetValue - (range * 0.1) : yMin),
    Math.max(yMax, targetValue ? targetValue + (range * 0.1) : yMax)
  ];
  
  // Get nice tick values
  const getYAxisTicks = () => {
    const tickCount = 5;
    const step = (yDomain[1] - yDomain[0]) / (tickCount - 1);
    return Array.from({ length: tickCount }, (_, i) => yDomain[0] + step * i);
  };

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
          {sortedData.length > 1 && (
            <span className={cn(
              "text-xs font-medium",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              {isPositive ? "+" : ""}{Math.abs(difference).toFixed(1)} {label}
            </span>
          )}
        </div>
        <div className="h-[180px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sortedData}
              margin={{ top: 10, right: 10, left: 35, bottom: 0 }}
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
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={yDomain}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                width={35}
                allowDecimals={true}
                tickCount={5}
                ticks={getYAxisTicks()}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid rgba(0,0,0,0.05)', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)' 
                }} 
                formatter={(value) => [`${value} ${label}`, '']}
                labelFormatter={(label, items) => {
                  // If we have originalDate in our payload, use it for the tooltip
                  const item = items[0]?.payload;
                  return item?.originalDate ? format(parseISO(item.originalDate), 'MMM d, yyyy') : label;
                }}
                animationDuration={300}
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
                activeDot={{ r: 5, strokeWidth: 1 }}
                dot={{ r: 3, strokeWidth: 1, fill: "white" }}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
