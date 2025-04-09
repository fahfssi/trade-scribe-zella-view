
import React, { useState } from 'react';
import TradeCalendar from '@/components/calendar/TradeCalendar';
import { TradeEntry } from '@/types/trade';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CalendarViewProps {
  trades: TradeEntry[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ trades }) => {
  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    // In a future version, we could show trades for this date or link to the journal
  };

  return (
    <Card className="w-full border-none shadow-none bg-transparent">
      <CardHeader className="pb-0">
        <CardTitle className="text-2xl font-bold">Trade Calendar</CardTitle>
        <p className="text-muted-foreground">
          View your trades in a calendar format. Days with trades display profit/loss information.
        </p>
      </CardHeader>
      <CardContent className="p-2">
        <div className="calendar-container" style={{ height: "calc(100vh - 10rem)" }}>
          <TradeCalendar trades={trades} onDateClick={handleDateClick} />
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView;
