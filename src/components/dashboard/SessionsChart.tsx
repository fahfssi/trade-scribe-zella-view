
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface SessionChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  title?: string;
  description?: string;
}

const SessionsChart: React.FC<SessionChartProps> = ({ 
  data, 
  title = "Trading Sessions",
  description = "Performance distribution across different market sessions"
}) => {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  
  // Calculate percentages
  const dataWithPercent = data.map(item => ({
    ...item,
    percent: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0"
  }));
  
  const config = dataWithPercent.reduce((acc, item) => {
    acc[item.name] = { 
      color: item.color,
      label: item.name
    };
    return acc;
  }, {} as any);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col">
        <ChartContainer className="h-[300px]" config={config}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercent}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {dataWithPercent.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border border-border p-2 rounded-md shadow-md">
                      <p className="font-medium">{data.name}</p>
                      <p className="text-sm">{`${data.percent}% (${data.value} trades)`}</p>
                    </div>
                  );
                }
                return null;
              }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          {dataWithPercent.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }} 
              />
              <span className="text-sm">{entry.name}: {entry.percent}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionsChart;
