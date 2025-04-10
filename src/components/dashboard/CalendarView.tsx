
import React, { useState } from 'react';
import TradeCalendar from '@/components/calendar/TradeCalendar';
import { TradeEntry } from '@/types/trade';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CalendarDays, Calendar as CalendarIcon, Grid2X2 } from 'lucide-react';

interface CalendarViewProps {
  trades: TradeEntry[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ trades }) => {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
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
          
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'month' | 'week' | 'day')}>
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
      <CardContent className="p-2">
        <div className="calendar-container" style={{ height: "calc(100vh - 10rem)" }}>
          <TradeCalendar trades={trades} onDateClick={handleDateClick} viewMode={viewMode} />
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView;
