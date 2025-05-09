
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileUp, Download } from 'lucide-react';
import TradesList from '@/components/journal/TradesList';
import AddTradeForm from '@/components/journal/AddTradeForm';
import { TradeEntry } from '@/types/trade';
import { getTradesFromStorage, addTrade, updateTrade, deleteTrade, importCSV } from '@/services/tradeService';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

const Journal = () => {
  const [trades, setTrades] = useState<TradeEntry[]>(() => getTradesFromStorage());
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
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
    setIsImporting(true);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (!e.target?.result) {
        setIsImporting(false);
        return;
      }
      
      try {
        const result = importCSV(e.target.result as string);
        
        if (result.success) {
          setTrades(result.trades || []);
          
          toast({
            title: "CSV Imported",
            description: `Successfully imported ${result.trades?.length || 0} trades from ${file.name}.`,
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
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Import Failed",
        description: "Error reading the file",
        variant: "destructive"
      });
      setIsImporting(false);
    };
    
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    if (trades.length === 0) {
      toast({
        title: "Export Failed",
        description: "No trades available to export",
        variant: "destructive"
      });
      return;
    }
    
    // Create CSV content
    const headers = [
      'Symbol', 'Date', 'Direction', 'Entry Price', 'Exit Price', 
      'Quantity', 'Strategy', 'P&L', 'Session', 'Risk:Reward', 'Tags', 'Notes'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    trades.forEach(trade => {
      const row = [
        trade.symbol,
        new Date(trade.date).toISOString(),
        trade.direction,
        trade.entryPrice,
        trade.exitPrice,
        trade.quantity,
        trade.strategy,
        trade.pnl,
        trade.session || '',
        trade.riskReward || '',
        (trade.tags || []).join(';'),
        (trade.notes || '').replace(/,/g, ';')
      ];
      
      csvContent += row.join(',') + '\n';
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `trade_journal_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: `Successfully exported ${trades.length} trades to CSV.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Trade Journal</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportToCSV}
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <div className="relative">
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              id="csv-upload"
              className="hidden"
              onChange={handleCSVUpload}
              disabled={isImporting}
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('csv-upload')?.click()}
              disabled={isImporting}
            >
              <FileUp className="mr-2 h-4 w-4" /> {isImporting ? 'Importing...' : 'Import CSV'}
            </Button>
          </div>
          <Button onClick={() => setIsAddTradeOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Trade
          </Button>
        </div>
      </div>
      
      <Alert>
        <AlertTitle>Import CSV Format</AlertTitle>
        <AlertDescription>
          You can import your broker data in CSV format. The import supports Excel format with columns like symbol, buyFillId, 
          sellFillId, buyPrice, sellPrice, pnl, boughtTimestamp, soldTimestamp, and duration.
        </AlertDescription>
      </Alert>
      
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
