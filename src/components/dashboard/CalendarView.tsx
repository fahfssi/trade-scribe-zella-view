
import React, { useState } from 'react';
import { TradeEntry } from '@/types/trade';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Calendar as CalendarIcon, Grid2X2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  trades: TradeEntry[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ trades }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tradesForSelectedDate, setTradesForSelectedDate] = useState<TradeEntry[]>([]);
  
  // Helper function to get trades by date
  const getTradesByDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return trades.filter(trade => trade.date.startsWith(dateStr));
  };

  // Group trades by date for easier lookup
  const tradesByDate = trades.reduce<Record<string, { trades: TradeEntry[], pnl: number }>>(
    (acc, trade) => {
      const dateStr = trade.date.split('T')[0]; // Get YYYY-MM-DD
      
      if (!acc[dateStr]) {
        acc[dateStr] = {
          trades: [],
          pnl: 0
        };
      }
      
      acc[dateStr].trades.push(trade);
      acc[dateStr].pnl += trade.pnl;
      
      return acc;
    }, 
    {}
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // Get trades for the selected date
    const tradesForDate = getTradesByDate(date);
    
    setTradesForSelectedDate(tradesForDate);
    setIsDialogOpen(tradesForDate.length > 0);
  };

  // Navigate to previous/next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? addMonths(prev, -1) : addMonths(prev, 1)
    );
  };

  // Generate calendar data
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get day of the week that the month starts on (0 = Sunday, 1 = Monday, etc)
  const startDay = monthStart.getDay();
  
  // Create array for the grid, with empty slots for days before the month starts
  const calendarDays = Array(42).fill(null).map((_, index) => {
    const dayIndex = index - startDay;
    const date = new Date(monthStart);
    date.setDate(date.getDate() + dayIndex);
    return date;
  });

  // Calculate total PnL for the current month
  const currentMonthPnl = trades
    .filter(trade => {
      const tradeDate = new Date(trade.date);
      return isSameMonth(tradeDate, currentMonth);
    })
    .reduce((sum, trade) => sum + trade.pnl, 0);

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle className="text-2xl font-bold">Trade Calendar</CardTitle>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <h3 className="text-xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
          <div className="text-sm">
            Month P&L: 
            <span className={cn(
              "ml-2 font-bold",
              currentMonthPnl >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {currentMonthPnl >= 0 ? '+' : ''}{currentMonthPnl.toFixed(2)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar header - days of week */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, i) => {
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isToday = isSameDay(date, new Date());
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayData = tradesByDate[dateStr];
            
            return (
              <div 
                key={i}
                onClick={() => isCurrentMonth && handleDateSelect(date)}
                className={cn(
                  "p-2 h-24 border rounded-md relative",
                  !isCurrentMonth && "opacity-30",
                  isCurrentMonth && "cursor-pointer hover:bg-muted/50",
                  isToday && "border-primary border-2",
                  isSelected && "bg-muted",
                  dayData && dayData.pnl >= 0 && "bg-green-50/30",
                  dayData && dayData.pnl < 0 && "bg-red-50/30"
                )}
              >
                <div className="text-right text-sm font-medium">
                  {date.getDate()}
                </div>
                {dayData && (
                  <div className="mt-1">
                    <div className={cn(
                      "text-sm font-semibold",
                      dayData.pnl >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {dayData.pnl >= 0 ? '+' : ''}{dayData.pnl.toFixed(2)}
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {dayData.trades.length} {dayData.trades.length === 1 ? 'trade' : 'trades'}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Trades on {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
              </DialogTitle>
              <DialogDescription>
                Details of trades executed on this day
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {tradesForSelectedDate.map((trade) => (
                <div key={trade.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-lg">{trade.symbol}</h3>
                    <Badge variant={trade.pnl >= 0 ? "default" : "destructive"} className="text-sm">
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>Strategy: {trade.strategy}</div>
                    <div>Direction: {trade.direction === 'long' ? 'Long' : 'Short'}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {trade.tags?.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    {trade.notes && (
                      <div className="mt-2 p-2 bg-muted/50 rounded">
                        <p className="text-xs font-medium">Notes:</p>
                        <p className="text-xs">{trade.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CalendarView;
