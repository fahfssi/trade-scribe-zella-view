
import React from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import DashboardStats from '@/components/dashboard/DashboardStats';
import ChartsSection from '@/components/dashboard/ChartsSection';
import InsightsSection from '@/components/dashboard/InsightsSection';
import BrokerReportStats from '@/components/dashboard/BrokerReportStats';
import CalendarView from '@/components/dashboard/CalendarView';

interface DashboardContentProps {
  activeTab: string;
  showBrokerData: boolean;
  stats: any;
  pnlByDay: any[];
  performanceByStrategy: any[];
  sessionData: any[];
  selectedBrokerReport: string | null;
  brokerStats: any;
  trades: any[];
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  activeTab,
  showBrokerData,
  stats,
  pnlByDay,
  performanceByStrategy,
  sessionData,
  selectedBrokerReport,
  brokerStats,
  trades
}) => {
  return (
    <Tabs value={activeTab} className="mt-0">
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
  );
};

export default DashboardContent;
