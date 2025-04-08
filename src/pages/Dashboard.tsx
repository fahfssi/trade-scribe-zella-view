
import React, { useEffect, useState } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import ProfitLossChart from '@/components/dashboard/ProfitLossChart';
import PerformanceByStrategy from '@/components/dashboard/PerformanceByStrategy';
import SessionsChart from '@/components/dashboard/SessionsChart';
import TradeCalendar from '@/components/calendar/TradeCalendar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getTradeStatistics, getPnlByDay, getPerformanceByStrategy, getTradesFromStorage, getBrokerReportStatistics, deleteBrokerReport } from '@/services/tradeService';
import { ArrowUp, ArrowDown, Percent, DollarSign, TrendingUp, Clock, Scale, Trash2, Calendar } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const Dashboard = () => {
  const [stats, setStats] = useState(getTradeStatistics());
  const [pnlByDay, setPnlByDay] = useState(getPnlByDay());
  const [performanceByStrategy, setPerformanceByStrategy] = useState(getPerformanceByStrategy());
  const [sessionData, setSessionData] = useState<any[]>([]);
  const [brokerReports, setBrokerReports] = useState<any[]>([]);
  const [showBrokerData, setShowBrokerData] = useState(false);
  const [selectedBrokerReport, setSelectedBrokerReport] = useState<string | null>(null);
  const [brokerStats, setBrokerStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [trades, setTrades] = useState<any[]>([]);
  const { toast } = useToast();
  
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
        
        try {
          const loadedTrades = getTradesFromStorage() || [];
          setTrades(loadedTrades);
        } catch (err) {
          console.error('Error loading trades for calendar:', err);
        }
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
        } else if (reports.length === 0) {
          setSelectedBrokerReport(null);
        } else if (selectedBrokerReport && !reports.find(r => r.id === selectedBrokerReport)) {
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

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    // In a future version, we could show trades for this date or link to the journal
  };

  const handleDeleteReport = (reportId: string) => {
    deleteBrokerReport(reportId);
    
    // Update the broker reports list
    const updatedReports = brokerReports.filter(report => report.id !== reportId);
    setBrokerReports(updatedReports);
    
    // Update selected report if needed
    if (selectedBrokerReport === reportId) {
      if (updatedReports.length > 0) {
        setSelectedBrokerReport(updatedReports[0].id);
      } else {
        setSelectedBrokerReport(null);
      }
    }
    
    toast({
      title: "Report deleted",
      description: "The broker report has been deleted successfully"
    });
  };

  const safeToFixed = (value: number | undefined | null, digits: number = 2): string => {
    if (value === undefined || value === null) {
      return '0.00';
    }
    return value.toFixed(digits);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
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
            <div className="flex space-x-2 items-center">
              <select 
                value={selectedBrokerReport || ''} 
                onChange={handleBrokerReportChange}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {brokerReports.map(report => (
                  <option key={report.id} value={report.id}>
                    {report.name} - {new Date(report.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Broker Report</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this broker report? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => selectedBrokerReport && handleDeleteReport(selectedBrokerReport)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
      
      <TabsContent value="overview" className="mt-0">
        {!showBrokerData ? (
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
          </>
        ) : (
          selectedBrokerReport && brokerStats ? (
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
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No broker report selected or available. Please import a broker report in the Journal page.</p>
            </div>
          )
        )}
      </TabsContent>
      
      <TabsContent value="calendar" className="mt-0">
        <div className="w-full border-none shadow-none bg-transparent">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Trade Calendar</h2>
            <p className="text-muted-foreground">
              View your trades in a calendar format. Days with trades display profit/loss information.
            </p>
          </div>
          <div className="p-2">
            <div className="calendar-container" style={{ height: "calc(100vh - 10rem)" }}>
              <TradeCalendar trades={trades} onDateClick={handleDateClick} />
            </div>
          </div>
        </div>
      </TabsContent>
    </div>
  );
};

export default Dashboard;
