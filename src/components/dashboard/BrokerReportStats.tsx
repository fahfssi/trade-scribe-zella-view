
import React from 'react';
import StatCard from '@/components/dashboard/StatCard';
import { Percent, DollarSign, TrendingUp, Scale, ArrowUp, ArrowDown } from 'lucide-react';

interface BrokerReportStatsProps {
  brokerStats: any;
}

const safeToFixed = (value: number | undefined | null, digits: number = 2): string => {
  if (value === undefined || value === null) {
    return '0.00';
  }
  return value.toFixed(digits);
};

const BrokerReportStats: React.FC<BrokerReportStatsProps> = ({ brokerStats }) => {
  if (!brokerStats) return null;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Win Rate"
          value={`${safeToFixed(brokerStats?.winRate, 1)}%`}
          icon={<Percent size={20} />}
          description={`${brokerStats?.winningTrades || 0} winning, ${brokerStats?.losingTrades || 0} losing`}
          trend={(brokerStats?.winRate || 0) > 50 ? 'up' : 'down'}
        />
        <StatCard
          title="Total P&L"
          value={`$${safeToFixed(brokerStats?.totalPnl)}`}
          icon={<DollarSign size={20} />}
          description={`Avg: $${safeToFixed(brokerStats?.averagePnl)} per trade`}
          trend={(brokerStats?.totalPnl || 0) > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Profit Factor"
          value={brokerStats?.profitFactor ? safeToFixed(brokerStats.profitFactor) : 'N/A'}
          icon={<TrendingUp size={20} />}
          description="Gross profit / gross loss"
          trend={(brokerStats?.profitFactor || 0) > 1 ? 'up' : 'down'}
        />
        <StatCard
          title="Risk:Reward"
          value={brokerStats?.riskRewardRatio ? safeToFixed(brokerStats.riskRewardRatio, 1) : 'N/A'}
          icon={<Scale size={20} />}
          description={`From ${brokerStats?.tradeCount || 0} trades`}
          trend={(brokerStats?.riskRewardRatio || 0) > 1 ? 'up' : 'down'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded dark:bg-gray-700">
              <span className="font-medium">Trade Count:</span>
              <span>{brokerStats?.tradeCount || 0}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded dark:bg-gray-700">
              <span className="font-medium">Average Win:</span>
              <span className="text-profit">${safeToFixed(brokerStats?.averageWin)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded dark:bg-gray-700">
              <span className="font-medium">Average Loss:</span>
              <span className="text-loss">${safeToFixed(brokerStats?.averageLoss)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded dark:bg-gray-700">
              <span className="font-medium">Largest Win:</span>
              <span className="text-profit">${safeToFixed(brokerStats?.largestWin)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded dark:bg-gray-700">
              <span className="font-medium">Largest Loss:</span>
              <span className="text-loss">${safeToFixed(brokerStats?.largestLoss)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-6 bg-white rounded-lg border border-gray-200 flex justify-between items-center dark:bg-gray-800 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-medium mb-1">Best Trade</h3>
              <p className="text-2xl font-bold text-profit">
                +${safeToFixed(brokerStats?.averageWin)}
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
                -${safeToFixed(brokerStats?.averageLoss)}
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

export default BrokerReportStats;
