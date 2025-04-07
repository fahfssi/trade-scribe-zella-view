
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileUp } from 'lucide-react';
import TradesList from '@/components/journal/TradesList';
import AddTradeForm from '@/components/journal/AddTradeForm';
import { TradeEntry, BrokerReport } from '@/types/trade';
import { getTradesFromStorage, addTrade, updateTrade, deleteTrade, importCSV } from '@/services/tradeService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const Journal = () => {
  const [trades, setTrades] = useState<TradeEntry[]>(() => getTradesFromStorage());
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
  const [brokerReports, setBrokerReports] = useState<BrokerReport[]>([]);
  const { toast } = useToast();

  const handleAddTrade = (newTrade: Omit<TradeEntry, 'id'>) => {
    const trade = addTrade(newTrade);
    setTrades([trade, ...trades.filter(t => t.id !== trade.id)]);
    
    toast({
      title: "Trade Added",
      description: `Successfully added ${newTrade.symbol} trade to your journal.`,
    });
  };

  const handleEditTrade = (id: string) => {
    setEditingTradeId(id);
    setIsAddTradeOpen(true);
  };

  const handleDeleteTrade = (id: string) => {
    deleteTrade(id);
    setTrades(trades.filter(t => t.id !== id));
    
    toast({
      title: "Trade Deleted",
      description: "Trade has been removed from your journal.",
    });
  };

  const handleUpdateTrade = (updatedTrade: TradeEntry) => {
    const updated = updateTrade(updatedTrade);
    setTrades(trades.map(t => t.id === updated.id ? updated : t));
    
    toast({
      title: "Trade Updated",
      description: `${updatedTrade.symbol} trade has been updated.`,
    });
  };
  
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (!e.target?.result) return;
      
      try {
        const result = importCSV(e.target.result as string);
        
        if (result.success) {
          setTrades(result.trades);
          setBrokerReports((prev) => [...prev, result.report]);
          
          toast({
            title: "CSV Imported",
            description: `Successfully imported ${result.trades.length} trades from ${file.name}.`,
          });
        } else {
          toast({
            title: "Import Failed",
            description: result.error || "Failed to parse CSV file",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "There was an error parsing the CSV file",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Trade Journal</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Input
              type="file"
              accept=".csv"
              id="csv-upload"
              className="hidden"
              onChange={handleCSVUpload}
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('csv-upload')?.click()}
            >
              <FileUp className="mr-2 h-4 w-4" /> Import CSV
            </Button>
          </div>
          <Button onClick={() => setIsAddTradeOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Trade
          </Button>
        </div>
      </div>
      
      {brokerReports.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Broker Reports</CardTitle>
            <CardDescription>
              Imported performance reports from your broker
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brokerReports.map((report, index) => (
                <Card key={index} className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{report.name}</CardTitle>
                    <CardDescription>{new Date(report.date).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1 pt-0 text-sm">
                    <div className="flex justify-between">
                      <span>Win Rate:</span>
                      <span className="font-medium">{report.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total P&L:</span>
                      <span className={`font-medium ${report.totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                        ${report.totalPnl.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trades:</span>
                      <span className="font-medium">{report.tradeCount}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <TradesList 
        trades={trades} 
        onEditTrade={handleEditTrade} 
        onDeleteTrade={handleDeleteTrade} 
      />
      
      <AddTradeForm
        isOpen={isAddTradeOpen}
        onClose={() => {
          setIsAddTradeOpen(false);
          setEditingTradeId(null);
        }}
        onAddTrade={handleAddTrade}
        onUpdateTrade={handleUpdateTrade}
        editingTrade={editingTradeId ? trades.find(t => t.id === editingTradeId) : undefined}
      />
    </div>
  );
};

export default Journal;
