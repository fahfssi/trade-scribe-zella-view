
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { TradeEntry } from '@/types/trade';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CalendarDays, Calendar as CalendarIcon, Grid2X2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  trades: TradeEntry[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ trades }) => {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tradesForSelectedDate, setTradesForSelectedDate] = useState<TradeEntry[]>([]);
  
  // Function to handle view mode toggle
  const handleViewModeChange = (value: string | undefined) => {
    if (value) {
      setViewMode(value as 'month' | 'week' | 'day');
    }
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

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    
    // Format the date in YYYY-MM-DD format for lookup
    const dateStr = format(date, 'yyyy-MM-dd');
    const tradesForDate = tradesByDate[dateStr]?.trades || [];
    
    setTradesForSelectedDate(tradesForDate);
    setIsDialogOpen(tradesForDate.length > 0);
  };

  return (
    <Card className="w-[60%] mx-auto border-none shadow-none bg-transparent">
      <CardHeader className="pb-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">Trade Calendar</CardTitle>
            <p className="text-muted-foreground">
              View your trades in a calendar format. Days with trades display profit/loss information.
            </p>
          </div>
          
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={handleViewModeChange} 
            className="border rounded-md"
          >
            <ToggleGroupItem value="month" aria-label="Monthly view">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Month
            </ToggleGroupItem>
            <ToggleGroupItem value="week" aria-label="Weekly view">
              <Grid2X2 className="h-4 w-4 mr-2" />
              Week
            </ToggleGroupItem>
            <ToggleGroupItem value="day" aria-label="Daily view">
              <CalendarDays className="h-4 w-4 mr-2" />
              Day
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="calendar-container">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border pointer-events-auto"
            modifiers={{
              hasTrades: (date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                return !!tradesByDate[dateStr];
              }
            }}
            modifiersStyles={{
              hasTrades: { fontWeight: 'bold' }
            }}
            components={{
              DayContent: (props) => {
                const dateStr = format(props.date, 'yyyy-MM-dd');
                const dayData = tradesByDate[dateStr];
                
                if (!dayData) {
                  return <div>{props.date.getDate()}</div>;
                }
                
                const { pnl } = dayData;
                const isProfitable = pnl >= 0;
                
                return (
                  <div className="relative flex flex-col items-center w-full h-full">
                    <div>{props.date.getDate()}</div>
                    {dayData && (
                      <Badge variant={isProfitable ? "default" : "destructive"} className="text-[10px] px-1 absolute bottom-0">
                        {isProfitable ? '+' : ''}{pnl.toFixed(0)}
                      </Badge>
                    )}
                  </div>
                );
              }
            }}
          />
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
      </CardContent>
    </Card>
  );
};

export default CalendarView;
