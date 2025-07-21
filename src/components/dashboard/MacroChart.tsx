
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MacroChartProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const MacroChart: React.FC<MacroChartProps> = ({ calories, protein, carbs, fat }) => {
  // Calculate calories from macros (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatCals = fat * 9;
  
  const data = [
    { name: 'Protein', value: proteinCals, color: '#8884d8', grams: protein },
    { name: 'Carbs', value: carbsCals, color: '#82ca9d', grams: carbs },
    { name: 'Fat', value: fatCals, color: '#ffc658', grams: fat },
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{data.grams}g ({data.value} cal)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
