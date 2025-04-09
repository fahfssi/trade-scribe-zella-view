
import React from 'react';
import SessionsChart from '@/components/dashboard/SessionsChart';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface InsightsSectionProps {
  sessionData: any[];
  stats: {
    averageWin: number;
    averageLoss: number;
  };
}

const InsightsSection: React.FC<InsightsSectionProps> = ({ sessionData, stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-1">
        <SessionsChart 
          data={sessionData} 
          title="Trading Sessions" 
          description="Distribution of trades by market session"
        />
      </div>

      <div className="md:col-span-1">
        <div className="grid grid-cols-1 gap-4">
          <div className="p-6 bg-white rounded-lg border border-gray-200 flex justify-between items-center dark:bg-gray-800 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-medium mb-1">Best Trade</h3>
              <p className="text-2xl font-bold text-profit">
                +${stats.averageWin.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Average winning trade</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/20">
              <ArrowUp className="h-6 w-6 text-profit" />
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-lg border border-gray-200 flex justify-between items-center dark:bg-gray-800 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-medium mb-1">Worst Trade</h3>
              <p className="text-2xl font-bold text-loss">
                -${stats.averageLoss.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Average losing trade</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900/20">
              <ArrowDown className="h-6 w-6 text-loss" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsSection;
