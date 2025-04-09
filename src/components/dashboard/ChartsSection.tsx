
import React from 'react';
import ProfitLossChart from '@/components/dashboard/ProfitLossChart';
import PerformanceByStrategy from '@/components/dashboard/PerformanceByStrategy';

interface ChartsSectionProps {
  pnlByDay: { date: string; pnl: number }[];
  performanceByStrategy: { strategy: string; winRate: number; pnl: number }[];
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ pnlByDay, performanceByStrategy }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProfitLossChart
        data={pnlByDay}
        title="Daily P&L"
        description="Your daily profit and loss performance"
      />
      <PerformanceByStrategy
        data={performanceByStrategy}
        title="Strategy Performance"
        description="Win rate and P&L by strategy"
      />
    </div>
  );
};

export default ChartsSection;
