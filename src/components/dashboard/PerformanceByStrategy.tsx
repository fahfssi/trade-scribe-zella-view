
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PerformanceByStrategyProps {
  data: { strategy: string; winRate: number; pnl: number }[];
  title: string;
  description?: string;
}

const PerformanceByStrategy: React.FC<PerformanceByStrategyProps> = ({ data, title, description }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="strategy" />
              <YAxis yAxisId="left" orientation="left" stroke="#1e40af" />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'pnl') return [`$${value.toFixed(2)}`, 'P&L'];
                  if (name === 'winRate') return [`${value}%`, 'Win Rate'];
                  return [value, name];
                }}
              />
              <Bar yAxisId="left" dataKey="pnl" name="P&L" fill="#1e40af" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#1e40af' : '#ef4444'} />
                ))}
              </Bar>
              <Bar yAxisId="right" dataKey="winRate" name="Win Rate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceByStrategy;
