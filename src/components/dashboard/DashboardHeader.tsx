
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  showBrokerData: boolean;
  onToggleChange: (checked: boolean) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeTab,
  setActiveTab,
  showBrokerData,
  onToggleChange
}) => {
  return (
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
            onCheckedChange={onToggleChange}
          />
          <Label htmlFor="data-toggle" className="text-sm font-medium">
            {showBrokerData ? "Broker Reports" : "Manual Trades"}
          </Label>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
