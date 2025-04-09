
import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import BrokerReportSelector from '@/components/dashboard/BrokerReportSelector';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const {
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
  } = useDashboardData();

  return (
    <div className="space-y-6">
      <DashboardHeader 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showBrokerData={showBrokerData}
        onToggleChange={handleToggleChange}
      />
      
      {showBrokerData && brokerReports.length > 0 && (
        <BrokerReportSelector 
          brokerReports={brokerReports}
          selectedBrokerReport={selectedBrokerReport}
          onReportChange={handleBrokerReportChange}
          onDeleteReport={handleDeleteReport}
        />
      )}
      
      <DashboardContent 
        activeTab={activeTab}
        showBrokerData={showBrokerData}
        stats={stats}
        pnlByDay={pnlByDay}
        performanceByStrategy={performanceByStrategy}
        sessionData={sessionData}
        selectedBrokerReport={selectedBrokerReport}
        brokerStats={brokerStats}
        trades={trades}
      />
    </div>
  );
};

export default Dashboard;
