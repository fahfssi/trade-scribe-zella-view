
import React, { useState, useMemo } from 'react';
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
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, eachDayOfInterval, isSameDay, addDays } from 'date-fns';
import { CircleDollarSign } from 'lucide-react';

interface TradeCalendarProps {
  trades: TradeEntry[];
  onDateClick: (date: Date) => void;
  viewMode: 'month' | 'week' | 'day';
}

interface DateWithTrades {
  date: Date;
  trades: TradeEntry[];
  pnl: number;
}

const TradeCalendar: React.FC<TradeCalendarProps> = ({ trades, onDateClick, viewMode }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tradesForSelectedDate, setTradesForSelectedDate] = useState<TradeEntry[]>([]);
  
  // Get the current month and year
  const currentDate = selectedDate;
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Group trades by date
  const tradesByDate = useMemo(() => {
    return trades.reduce<Record<string, DateWithTrades>>((acc, trade) => {
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
  }, [trades]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // Format the date in YYYY-MM-DD format for lookup
    const dateStr = format(date, 'yyyy-MM-dd');
    const tradesForDate = tradesByDate[dateStr]?.trades || [];
    
    setTradesForSelectedDate(tradesForDate);
    setIsDialogOpen(tradesForDate.length > 0);
    
    onDateClick(date);
  };

  const handleNavigatePrevious = () => {
    if (viewMode === 'month') {
      setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (viewMode === 'week') {
      setSelectedDate(addDays(selectedDate, -7));
    } else {
      setSelectedDate(addDays(selectedDate, -1));
    }
  };

  const handleNavigateNext = () => {
    if (viewMode === 'month') {
      setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (viewMode === 'week') {
      setSelectedDate(addDays(selectedDate, 7));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
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

  const renderDailyView = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayData = tradesByDate[dateStr];
    
    return (
      <div className="h-full flex flex-col space-y-4 p-4">
        <div className="text-center">
          <h3 className="text-xl font-bold">{format(selectedDate, 'MMMM d, yyyy')}</h3>
          <div className="flex justify-center space-x-4 my-2">
            <button onClick={handleNavigatePrevious} className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80">Previous Day</button>
            <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80">Today</button>
            <button onClick={handleNavigateNext} className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80">Next Day</button>
          </div>
        </div>
        
        {!dayData ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">No trades on this day</p>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto">
            <div className="p-4 border rounded-lg bg-card/50">
              <h4 className="font-semibold mb-2">Day Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm text-muted-foreground">Total Trades</span>
                  <span className="text-xl font-bold">{dayData.trades.length}</span>
                </div>
                <div>
                  <span className="block text-sm text-muted-foreground">P&L</span>
                  <span className={cn(
                    "text-xl font-bold",
                    dayData.pnl >= 0 ? "text-profit" : "text-loss"
                  )}>
                    {dayData.pnl >= 0 ? '+' : ''}{dayData.pnl.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            {dayData.trades.map((trade) => (
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
        )}
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekEnd = endOfWeek(selectedDate);
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return (
      <div className="h-full flex flex-col space-y-4 p-4">
        <div className="text-center">
          <h3 className="text-xl font-bold">
            Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h3>
          <div className="flex justify-center space-x-4 my-2">
            <button onClick={handleNavigatePrevious} className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80">Previous Week</button>
            <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80">Current Week</button>
            <button onClick={handleNavigateNext} className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80">Next Week</button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-4">
          {daysInWeek.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayData = tradesByDate[dateStr];
            const isCurrentDay = isSameDay(day, new Date());
            
            return (
              <div 
                key={dateStr}
                className={cn(
                  "border rounded-lg p-3 cursor-pointer hover:bg-muted/50",
                  isCurrentDay && "border-2 border-primary"
                )}
                onClick={() => handleDateSelect(day)}
              >
                <div className="text-center mb-2">
                  <div className="text-sm text-muted-foreground">{format(day, 'EEE')}</div>
                  <div className="font-medium">{format(day, 'd')}</div>
                </div>
                
                {dayData ? (
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "text-sm font-semibold",
                      dayData.pnl >= 0 ? "text-profit" : "text-loss"
                    )}>
                      {dayData.pnl >= 0 ? '+' : ''}{dayData.pnl.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {dayData.trades.length} {dayData.trades.length === 1 ? 'trade' : 'trades'}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-xs text-muted-foreground">No trades</div>
                )}
              </div>
            );
          })}
        </div>
        
        {selectedDate && (
          <div className="flex-1 overflow-y-auto">
            <h4 className="font-semibold mb-2 mt-4">Week Summary</h4>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-card/50 mb-4">
              {(() => {
                const weeklyTrades = daysInWeek.flatMap(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  return tradesByDate[dateStr]?.trades || [];
                });
                
                const weeklyPnL = weeklyTrades.reduce((sum, trade) => sum + trade.pnl, 0);
                
                return (
                  <>
                    <div>
                      <span className="block text-sm text-muted-foreground">Total Trades</span>
                      <span className="text-xl font-bold">{weeklyTrades.length}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-muted-foreground">P&L</span>
                      <span className={cn(
                        "text-xl font-bold",
                        weeklyPnL >= 0 ? "text-profit" : "text-loss"
                      )}>
                        {weeklyPnL >= 0 ? '+' : ''}{weeklyPnL.toFixed(2)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMonthlyView = () => {
    // Find the first day of the month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Find the number of days in the month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Create array of days for the month with empty cells for days before the month starts
    const calendarDays = Array(42).fill(0).map((_, index) => {
      const dayNumber = index - startingDayOfWeek + 1;
      return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : 0;
    });

    // Monthly summary
    const monthlyTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear;
    });
    
    const monthlyPnL = monthlyTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold">{format(new Date(currentYear, currentMonth), 'MMMM yyyy')}</h3>
          <div className="flex justify-center space-x-4 my-2">
            <button onClick={handleNavigatePrevious} className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80">Previous Month</button>
            <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80">Current Month</button>
            <button onClick={handleNavigateNext} className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80">Next Month</button>
          </div>
        </div>

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
        
        {/* Monthly summary */}
        <div className="p-4 border rounded-lg bg-card/50">
          <h4 className="font-semibold mb-2">Month Summary</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm text-muted-foreground">Total Trades</span>
              <span className="text-xl font-bold">{monthlyTrades.length}</span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">P&L</span>
              <span className={cn(
                "text-xl font-bold",
                monthlyPnL >= 0 ? "text-profit" : "text-loss"
              )}>
                {monthlyPnL >= 0 ? '+' : ''}{monthlyPnL.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendarView = () => {
    switch (viewMode) {
      case 'day':
        return renderDailyView();
      case 'week':
        return renderWeeklyView();
      case 'month':
      default:
        return renderMonthlyView();
    }
  };

  return (
    <div className="space-y-4">
      {renderCalendarView()}

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
