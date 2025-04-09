
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface BrokerReportSelectorProps {
  brokerReports: any[];
  selectedBrokerReport: string | null;
  onReportChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onDeleteReport: (reportId: string) => void;
}

const BrokerReportSelector: React.FC<BrokerReportSelectorProps> = ({
  brokerReports,
  selectedBrokerReport,
  onReportChange,
  onDeleteReport,
}) => {
  if (brokerReports.length === 0) return null;
  
  return (
    <div className="flex space-x-2 items-center">
      <select 
        value={selectedBrokerReport || ''} 
        onChange={onReportChange}
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
            <AlertDialogAction onClick={() => selectedBrokerReport && onDeleteReport(selectedBrokerReport)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BrokerReportSelector;
