import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { TradeEntry } from '@/types/trade';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TradeCalendarProps {
  trades: TradeEntry[];
  onDateClick: (date: Date) => void;
}

interface DateWithTrades {
  date: Date;
  trades: TradeEntry[];
  pnl: number;
}

const TradeCalendar: React.FC<TradeCalendarProps> = ({ trades, onDateClick }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tradesForSelectedDate, setTradesForSelectedDate] = useState<TradeEntry[]>([]);

  // Group trades by date
  const tradesByDate = trades.reduce<Record<string, DateWithTrades>>((acc, trade) => {
    const dateStr = trade.date.split('T')[0]; // Get YYYY-MM-DD
    
    if (!acc[dateStr]) {
      acc[dateStr] = {
        date: new Date(dateStr),
        trades: [],
        pnl: 0
      };
    }
    
    acc[dateStr].trades.push(trade);
    acc[dateStr].pnl += trade.pnl;
    
    return acc;
  }, {});

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    
    // Format the date in YYYY-MM-DD format for lookup
    const dateStr = format(date, 'yyyy-MM-dd');
    const tradesForDate = tradesByDate[dateStr]?.trades || [];
    
    setTradesForSelectedDate(tradesForDate);
    setIsDialogOpen(tradesForDate.length > 0);
    
    onDateClick(date);
  };

  // Custom day renderer
  const renderDay = (day: Date) => {
    // Use format from date-fns to ensure consistent date string formatting
    const dateStr = format(day, 'yyyy-MM-dd');
    const dateData = tradesByDate[dateStr];
    
    if (!dateData) return undefined;
    
    const { trades, pnl } = dateData;
    const isProfitable = pnl >= 0;
    
    return (
      <div className="relative w-full h-full">
        <div className={cn(
          "absolute inset-0 mt-1",
          isProfitable ? "bg-profit/10" : "bg-loss/10",
          "rounded-md"
        )} />
        <div className="relative flex flex-col h-full justify-between p-1">
          <div>{day.getDate()}</div>
          <div className="flex justify-center">
            <Badge variant="outline" className={cn(
              "text-[9px] px-1 py-0 whitespace-nowrap",
              isProfitable ? "border-profit text-profit" : "border-loss text-loss"
            )}>
              {trades.length} {trades.length === 1 ? 'trade' : 'trades'}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Trade Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border pointer-events-auto"
            components={{
              Day: ({ date, ...props }) => {
                // Ensure date is a valid Date object
                if (!date) return null;
                
                return (
                  <button
                    {...props}
                    className={
                      "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                    }
                  >
                    {renderDay(date) || date.getDate()}
                  </button>
                );
              },
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Trades on {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {tradesForSelectedDate.map((trade) => (
              <Card key={trade.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{trade.symbol}</h3>
                    <Badge variant={trade.pnl >= 0 ? "default" : "destructive"}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>Strategy: {trade.strategy}</div>
                    <div>Direction: {trade.direction === 'long' ? 'Long' : 'Short'}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {trade.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TradeCalendar;
