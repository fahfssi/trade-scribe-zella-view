
import React, { useEffect, useState } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import ProfitLossChart from '@/components/dashboard/ProfitLossChart';
import PerformanceByStrategy from '@/components/dashboard/PerformanceByStrategy';
import { getTradeStatistics, getPnlByDay, getPerformanceByStrategy, getTradesFromStorage } from '@/services/tradeService';
import { ArrowUp, ArrowDown, Percent, DollarSign, TrendingUp, Clock } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(getTradeStatistics());
  const [pnlByDay, setPnlByDay] = useState(getPnlByDay());
  const [performanceByStrategy, setPerformanceByStrategy] = useState(getPerformanceByStrategy());
  
  // Re-fetch data when the component is mounted or when changes happen
  useEffect(() => {
    // Use a storage event listener to detect changes from other components
    const updateDashboard = () => {
      setStats(getTradeStatistics());
      setPnlByDay(getPnlByDay());
      setPerformanceByStrategy(getPerformanceByStrategy());
    };
    
    // Poll for changes every second (for development)
    const intervalId = setInterval(updateDashboard, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
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
          title="Total Trades"
          value={stats.totalTrades}
          icon={<Clock size={20} />}
          description="All time trades"
        />
      </div>
      
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium mb-1">Best Trade</h3>
            <p className="text-2xl font-bold text-profit">
              +${stats.averageWin.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">Average winning trade</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <ArrowUp className="h-6 w-6 text-profit" />
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium mb-1">Worst Trade</h3>
            <p className="text-2xl font-bold text-loss">
              -${stats.averageLoss.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">Average losing trade</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <ArrowDown className="h-6 w-6 text-loss" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
