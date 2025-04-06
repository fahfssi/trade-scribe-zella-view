
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TradeEntry } from '@/types/trade';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CircleDollarSign } from 'lucide-react';

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
  
  // Get the current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Find the first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Find the number of days in the month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // Format the date in YYYY-MM-DD format for lookup
    const dateStr = format(date, 'yyyy-MM-dd');
    const tradesForDate = tradesByDate[dateStr]?.trades || [];
    
    setTradesForSelectedDate(tradesForDate);
    setIsDialogOpen(tradesForDate.length > 0);
    
    onDateClick(date);
  };

  const renderDayCell = (day: number) => {
    if (day === 0) return null; // Empty cell
    
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = tradesByDate[dateStr];
    
    const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
    
    if (!dayData) {
      return (
        <div 
          className={cn(
            "h-full flex flex-col items-center justify-start p-2 cursor-pointer rounded-lg hover:bg-gray-100",
            isToday && "border-2 border-primary"
          )}
          onClick={() => handleDateSelect(date)}
        >
          <div className="text-sm font-medium">{day}</div>
        </div>
      );
    }
    
    const { trades, pnl } = dayData;
    const isProfitable = pnl >= 0;
    const pnlColor = isProfitable ? 'bg-profit/20' : 'bg-loss/20';
    const pnlTextColor = isProfitable ? 'text-profit' : 'text-loss';
    
    return (
      <div 
        className={cn(
          "h-full min-h-[90px] flex flex-col items-center p-2 cursor-pointer rounded-lg hover:bg-gray-100",
          isToday && "border-2 border-primary"
        )}
        onClick={() => handleDateSelect(date)}
      >
        <div className="text-sm font-medium mb-2">{day}</div>
        <div className={`w-12 h-12 rounded-full ${pnlColor} flex items-center justify-center mb-1`}>
          <span className={`text-sm font-medium ${pnlTextColor}`}>
            {isProfitable ? '+' : ''}{Math.abs(pnl).toFixed(2)}
          </span>
        </div>
        <Badge variant="outline" className={cn(
          "text-xs whitespace-nowrap",
          isProfitable ? "border-profit text-profit" : "border-loss text-loss"
        )}>
          {trades.length} {trades.length === 1 ? 'trade' : 'trades'}
        </Badge>
      </div>
    );
  };

  // Create array of days for the month with empty cells for days before the month starts
  const calendarDays = Array(42).fill(0).map((_, index) => {
    const dayNumber = index - startingDayOfWeek + 1;
    return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : 0;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
          <div key={dayName} className="text-center text-sm font-medium text-muted-foreground p-2">
            {dayName}
          </div>
        ))}
        
        {calendarDays.map((day, i) => (
          <div key={i} className="aspect-square border rounded-lg overflow-hidden">
            {renderDayCell(day)}
          </div>
        ))}
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
          <div className="space-y-4">
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
    </div>
  );
};

export default TradeCalendar;
