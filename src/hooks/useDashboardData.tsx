
import { useState, useEffect } from 'react';
import { getTradeStatistics, getPnlByDay, getPerformanceByStrategy, getTradesFromStorage, getBrokerReportStatistics, deleteBrokerReport } from '@/services/tradeService';
import { useToast } from '@/hooks/use-toast';

export const useDashboardData = () => {
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

  return {
    stats,
    pnlByDay,
    performanceByStrategy,
    sessionData,
    brokerReports,
    showBrokerData,
    selectedBrokerReport,
    brokerStats,
    activeTab,
    trades,
    handleToggleChange,
    handleBrokerReportChange,
    handleDeleteReport,
    setActiveTab
  };
};
