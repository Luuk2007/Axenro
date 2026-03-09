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
  data, title, label, color, className, onViewAll, targetValue 
}: ProgressChartProps) {
  const { t } = useLanguage();
  
  const sortedData = React.useMemo(() => {
    if (!data.length) return [];
    return [...data].sort((a, b) => {
      const dateA = a.originalDate ? new Date(a.originalDate) : new Date(a.date);
      const dateB = b.originalDate ? new Date(b.originalDate) : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [data]);

  const values = sortedData.map(item => item.value);
  if (targetValue) values.push(targetValue);
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const padding = Math.max(range * 0.1, 1);
  const yMin = Math.max(0, min - padding);
  const yMax = max + padding;

  return (
    <div className={cn("rounded-2xl border border-border/40 bg-card h-full flex flex-col", className)} style={{ boxShadow: 'var(--shadow-sm)' }}>
      {title && (
        <div className="flex items-center justify-between p-5 border-b border-border/30">
          <h3 className="font-semibold tracking-tight">{title}</h3>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs">
              {t("viewAll")}
            </Button>
          )}
        </div>
      )}
      
      {sortedData.length > 0 ? (
        <div className="flex-1 p-4">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={sortedData} margin={{ top: 10, right: 15, left: 40, bottom: 20 }}>
              <defs>
                <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.3)" />
              
              <XAxis 
                dataKey="date" axisLine={false} tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                padding={{ left: 10, right: 10 }} interval="preserveStartEnd"
              />
              
              <YAxis 
                domain={[yMin, yMax]} axisLine={false} tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                width={35} allowDecimals={true}
                tickFormatter={(value) => value.toFixed(1)}
              />
              
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid hsl(var(--border))', 
                  boxShadow: 'var(--shadow-lg)',
                  background: 'hsl(var(--card))',
                  fontSize: '13px',
                }} 
                formatter={(value: number) => [`${value} ${label}`, '']}
                labelFormatter={(label, items) => {
                  const item = items?.[0]?.payload;
                  return item?.originalDate ? format(parseISO(item.originalDate), 'MMM d, yyyy') : label;
                }}
                animationDuration={200}
              />
              
              {targetValue && (
                <ReferenceLine 
                  y={targetValue} stroke="#FF6B6B" strokeDasharray="5 5" strokeWidth={1.5}
                  label={{ position: 'right', value: `Target: ${targetValue}${label}`, fill: '#FF6B6B', fontSize: 10, offset: 10 }}
                />
              )}
              
              <Area 
                type="monotone" dataKey="value" stroke={color} fillOpacity={1}
                fill={`url(#gradient-${color.replace('#', '')})`}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2, fill: "hsl(var(--card))", stroke: color }}
                activeDot={{ r: 5, strokeWidth: 2, fill: color }}
                isAnimationActive={true} animationDuration={800}
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
