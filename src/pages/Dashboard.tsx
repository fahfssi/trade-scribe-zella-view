
import React, { useEffect, useState } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import ProfitLossChart from '@/components/dashboard/ProfitLossChart';
import PerformanceByStrategy from '@/components/dashboard/PerformanceByStrategy';
import SessionsChart from '@/components/dashboard/SessionsChart';
import { getTradeStatistics, getPnlByDay, getPerformanceByStrategy, getTradesFromStorage, getBrokerReportStatistics } from '@/services/tradeService';
import { ArrowUp, ArrowDown, Percent, DollarSign, TrendingUp, Clock, Scale } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Dashboard = () => {
  const [stats, setStats] = useState(getTradeStatistics());
  const [pnlByDay, setPnlByDay] = useState(getPnlByDay());
  const [performanceByStrategy, setPerformanceByStrategy] = useState(getPerformanceByStrategy());
  const [sessionData, setSessionData] = useState<any[]>([]);
  const [brokerReports, setBrokerReports] = useState<any[]>([]);
  const [showBrokerData, setShowBrokerData] = useState(false);
  const [selectedBrokerReport, setSelectedBrokerReport] = useState<string | null>(null);
  const [brokerStats, setBrokerStats] = useState<any>(null);
  
  const getSessionsData = () => {
    const trades = getTradesFromStorage();
    const sessionCounts: Record<string, number> = {};
    const sessionPnl: Record<string, number> = {};
    
    const sessionColors: Record<string, string> = {
      'Asia': '#4ade80',
      'London': '#3b82f6',
      'New York AM': '#f97316',
      'New York PM': '#ec4899',
      'London Close': '#8b5cf6',
    };
    
    ['Asia', 'London', 'New York AM', 'New York PM', 'London Close'].forEach(session => {
      sessionCounts[session] = 0;
      sessionPnl[session] = 0;
    });
    
    trades.forEach(trade => {
      const session = trade.session || 'New York AM';
      sessionCounts[session] = (sessionCounts[session] || 0) + 1;
      sessionPnl[session] = (sessionPnl[session] || 0) + trade.pnl;
    });
    
    return Object.keys(sessionCounts).map(session => ({
      name: session,
      value: sessionCounts[session],
      pnl: sessionPnl[session],
      color: sessionColors[session] || '#6b7280'
    }));
  };
  
  useEffect(() => {
    const updateDashboard = () => {
      if (!showBrokerData) {
        // Manual trade data
        setStats(getTradeStatistics());
        setPnlByDay(getPnlByDay());
        setPerformanceByStrategy(getPerformanceByStrategy());
        setSessionData(getSessionsData());
      } else if (selectedBrokerReport) {
        // Broker report data
        const brokerStats = getBrokerReportStatistics(selectedBrokerReport);
        setBrokerStats(brokerStats);
      }
      
      // Get broker reports from localStorage
      const storedReports = localStorage.getItem('brokerReports');
      if (storedReports) {
        const reports = JSON.parse(storedReports);
        setBrokerReports(reports);
        
        // Set the first report as default if none selected
        if (reports.length > 0 && !selectedBrokerReport) {
          setSelectedBrokerReport(reports[0].id);
        }
      }
    };
    
    updateDashboard();
    
    const intervalId = setInterval(updateDashboard, 1000);
    
    return () => clearInterval(intervalId);
  }, [showBrokerData, selectedBrokerReport]);

  const handleToggleChange = (checked: boolean) => {
    setShowBrokerData(checked);
  };

  const handleBrokerReportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBrokerReport(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="data-toggle"
              checked={showBrokerData}
              onCheckedChange={handleToggleChange}
            />
            <Label htmlFor="data-toggle" className="text-sm font-medium">
              {showBrokerData ? "Broker Reports" : "Manual Trades"}
            </Label>
          </div>
          
          {showBrokerData && brokerReports.length > 0 && (
            <select 
              value={selectedBrokerReport || ''} 
              onChange={handleBrokerReportChange}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {brokerReports.map(report => (
                <option key={report.id} value={report.id}>
                  {report.name} - {report.date}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      
      {!showBrokerData ? (
        // Manual trades dashboard content
        <>
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
          </div>
        </>
      ) : (
        // Broker reports dashboard content
        selectedBrokerReport && brokerStats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Win Rate"
                value={`${brokerStats.winRate.toFixed(1)}%`}
                icon={<Percent size={20} />}
                description={`${brokerStats.winningTrades} winning, ${brokerStats.losingTrades} losing`}
                trend={brokerStats.winRate > 50 ? 'up' : 'down'}
              />
              <StatCard
                title="Total P&L"
                value={`$${brokerStats.totalPnl.toFixed(2)}`}
                icon={<DollarSign size={20} />}
                description={`Avg: $${brokerStats.averagePnl.toFixed(2)} per trade`}
                trend={brokerStats.totalPnl > 0 ? 'up' : 'down'}
              />
              <StatCard
                title="Profit Factor"
                value={brokerStats.profitFactor ? brokerStats.profitFactor.toFixed(2) : 'N/A'}
                icon={<TrendingUp size={20} />}
                description="Gross profit / gross loss"
                trend={brokerStats.profitFactor > 1 ? 'up' : 'down'}
              />
              <StatCard
                title="Risk:Reward"
                value={brokerStats.riskRewardRatio ? brokerStats.riskRewardRatio.toFixed(1) : 'N/A'}
                icon={<Scale size={20} />}
                description={`From ${brokerStats.tradeCount} trades`}
                trend={brokerStats.riskRewardRatio > 1 ? 'up' : 'down'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Trade Count:</span>
                    <span>{brokerStats.tradeCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Average Win:</span>
                    <span className="text-profit">${brokerStats.averageWin.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Average Loss:</span>
                    <span className="text-loss">${brokerStats.averageLoss.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Largest Win:</span>
                    <span className="text-profit">${brokerStats.largestWin.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Largest Loss:</span>
                    <span className="text-loss">${brokerStats.largestLoss.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium mb-1">Best Trade</h3>
                    <p className="text-2xl font-bold text-profit">
                      +${brokerStats.averageWin.toFixed(2)}
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
                      -${brokerStats.averageLoss.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Average losing trade</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <ArrowDown className="h-6 w-6 text-loss" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No broker report selected or available. Please import a broker report in the Journal page.</p>
          </div>
        )
      )}
    </div>
  );
};

export default Dashboard;
