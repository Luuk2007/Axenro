
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, parseISO } from 'date-fns';

interface ProgressData {
  date: string;
  value: number;
  originalDate?: string;
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
    
    return [...data].sort((a, b) => {
      const dateA = a.originalDate ? new Date(a.originalDate) : new Date(a.date);
      const dateB = b.originalDate ? new Date(b.originalDate) : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [data]);

  const latestValue = sortedData.length > 0 ? sortedData[sortedData.length - 1].value : 0;
  const previousValue = sortedData.length > 1 ? sortedData[sortedData.length - 2].value : 0;
  const difference = latestValue - previousValue;
  const isPositive = difference >= 0;

  // Calculate Y-axis domain with proper padding and target value consideration
  const values = sortedData.map(item => item.value);
  if (targetValue) {
    values.push(targetValue);
  }
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const padding = Math.max(range * 0.1, 1); // At least 1 unit of padding
  
  const yMin = Math.max(0, min - padding);
  const yMax = max + padding;

  return (
    <div className={cn("glassy-card rounded-xl card-shadow hover-scale h-full flex flex-col", className)}>
      {title && (
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-medium tracking-tight">{title}</h3>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              {t("viewAll")}
            </Button>
          )}
        </div>
      )}
      
      {sortedData.length > 0 ? (
        <div className="flex-1 p-4">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart
               data={sortedData}
               margin={{ top: 10, right: 15, left: 40, bottom: 20 }}
             >
              <defs>
                <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
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
                domain={[yMin, yMax]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                width={35}
                allowDecimals={true}
                tickFormatter={(value) => value.toFixed(1)}
              />
              
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid rgba(0,0,0,0.05)', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)' 
                }} 
                formatter={(value: number) => [`${value} ${label}`, '']}
                labelFormatter={(label, items) => {
                  const item = items?.[0]?.payload;
                  return item?.originalDate ? format(parseISO(item.originalDate), 'MMM d, yyyy') : label;
                }}
                animationDuration={300}
              />
              
              {targetValue && (
                <ReferenceLine 
                  y={targetValue}
                  stroke="#FF6B6B"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    position: 'right',
                    value: `Target: ${targetValue}${label}`,
                    fill: '#FF6B6B',
                    fontSize: 10,
                    offset: 10
                  }}
                />
              )}
              
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                fillOpacity={1}
                fill={`url(#gradient-${color.replace('#', '')})`}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: "white", stroke: color }}
                activeDot={{ r: 6, strokeWidth: 2, fill: color }}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No data available</p>
          </div>
        </div>
      )}
    </div>
  );
}
