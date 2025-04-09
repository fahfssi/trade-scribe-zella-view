
import React from 'react';
import StatCard from '@/components/dashboard/StatCard';
import { Percent, DollarSign, TrendingUp, Scale } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    winRate: number;
    winningTrades: number;
    losingTrades: number;
    totalPnl: number;
    averagePnl: number;
    profitFactor: number;
    averageRiskReward: number;
    totalTrades: number;
    averageWin: number;
    averageLoss: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Win Rate"
        value={`${stats.winRate.toFixed(1)}%`}
        icon={<Percent size={20} />}
        description={`${stats.winningTrades} winning, ${stats.losingTrades} losing`}
        trend={stats.winRate > 50 ? 'up' : 'down'}
      />
      <StatCard
        title="Total P&L"
        value={`$${stats.totalPnl.toFixed(2)}`}
        icon={<DollarSign size={20} />}
        description={`Avg: $${stats.averagePnl.toFixed(2)} per trade`}
        trend={stats.totalPnl > 0 ? 'up' : 'down'}
      />
      <StatCard
        title="Profit Factor"
        value={stats.profitFactor.toFixed(2)}
        icon={<TrendingUp size={20} />}
        description="Gross profit / gross loss"
        trend={stats.profitFactor > 1 ? 'up' : 'down'}
      />
      <StatCard
        title="Avg Risk:Reward"
        value={stats.averageRiskReward.toFixed(1)}
        icon={<Scale size={20} />}
        description={`From ${stats.totalTrades} trades`}
        trend={stats.averageRiskReward > 1 ? 'up' : 'down'}
      />
    </div>
  );
};

export default DashboardStats;
