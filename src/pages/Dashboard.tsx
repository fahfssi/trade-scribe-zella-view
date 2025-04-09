
import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Trash2 } from 'lucide-react';
import { getTradeStatistics, getPnlByDay, getPerformanceByStrategy, getTradesFromStorage, getBrokerReportStatistics, deleteBrokerReport } from '@/services/tradeService';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ChartsSection from '@/components/dashboard/ChartsSection';
import InsightsSection from '@/components/dashboard/InsightsSection';
import BrokerReportStats from '@/components/dashboard/BrokerReportStats';
import CalendarView from '@/components/dashboard/CalendarView';

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
          
            <div className="sr-only">
              {/* These are here just to ensure the Tabs component properly initializes */}
              <TabsContent value="overview" />
              <TabsContent value="calendar" />
            </div>
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-0">
        <TabsContent value="overview" className="mt-0 space-y-6">
          {!showBrokerData ? (
            <>
              <DashboardStats stats={stats} />
              <ChartsSection pnlByDay={pnlByDay} performanceByStrategy={performanceByStrategy} />
              <InsightsSection sessionData={sessionData} stats={stats} />
            </>
          ) : (
            selectedBrokerReport && brokerStats ? (
              <BrokerReportStats brokerStats={brokerStats} />
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No broker report selected or available. Please import a broker report in the Journal page.</p>
              </div>
            )
          )}
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-0">
          <CalendarView trades={trades} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
