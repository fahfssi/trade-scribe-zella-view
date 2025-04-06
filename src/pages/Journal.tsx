
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TradesList from '@/components/journal/TradesList';
import AddTradeForm from '@/components/journal/AddTradeForm';
import { TradeEntry } from '@/types/trade';
import { getTradesFromStorage, addTrade, updateTrade } from '@/services/tradeService';
import { useToast } from '@/hooks/use-toast';

const Journal = () => {
  const [trades, setTrades] = useState<TradeEntry[]>(() => getTradesFromStorage());
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Trade Journal</h1>
        <Button onClick={() => setIsAddTradeOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Trade
        </Button>
      </div>
      
      <TradesList trades={trades} onEditTrade={handleEditTrade} />
      
      <AddTradeForm
        isOpen={isAddTradeOpen}
        onClose={() => {
          setIsAddTradeOpen(false);
          setEditingTradeId(null);
        }}
        onAddTrade={handleAddTrade}
      />
    </div>
  );
};

export default Journal;
