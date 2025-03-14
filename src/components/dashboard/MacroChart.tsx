
import React from 'react';

interface MacroData {
  name: string;
  value: number;
  color: string;
}

interface MacroChartProps {
  data: MacroData[];
  total: number;
}

export default function MacroChart({ data, total }: MacroChartProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percent = item.value / total;
            const strokeDasharray = circumference;
            const strokeDashoffset = circumference - (percent * circumference);
            const currentOffset = offset;
            offset += percent * circumference;

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r={radius}
                strokeWidth="12"
                fill="transparent"
                stroke={item.color}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{ strokeDashoffset: currentOffset }}
                className="transition-all duration-500 ease-in-out"
              />
            );
          })}
          <circle
            cx="50"
            cy="50"
            r="32"
            fill="white"
            className="dark:fill-card"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tracking-tight">{total}</span>
          <span className="text-xs text-muted-foreground">calories</span>
        </div>
      </div>
      <div className="mt-5 flex w-full justify-center gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <span
              className="block h-3 w-3 mr-1.5 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground">{item.value}g</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
