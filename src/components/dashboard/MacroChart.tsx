
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface MacroChartItem {
  name: string;
  value: number;
  color: string;
}

interface MacroChartProps {
  data: MacroChartItem[];
  total: number;
  simplified?: boolean;
}

export default function MacroChart({ data, total, simplified = false }: MacroChartProps) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  
  if (simplified) {
    // Simplified version for the nutrition page header
    return (
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={15}
              outerRadius={25}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center">
      <div className="relative h-[180px] w-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground">calories</p>
        </div>
      </div>
      <div className="ml-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            ></div>
            <div className="text-sm">
              <span className="font-medium">{item.name}:</span> {Math.round((item.value / totalValue) * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
