
import React from 'react';
import TradeCalendar from '@/components/calendar/TradeCalendar';
import { getTradesFromStorage } from '@/services/tradeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CalendarPage = () => {
  const trades = getTradesFromStorage();

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    // In a future version, we could show trades for this date or link to the journal
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Trade Calendar</CardTitle>
          <p className="text-muted-foreground">
            View your trades in a calendar format. Days with trades are highlighted with profit/loss information.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="calendar-container" style={{ height: "calc(100vh - 16rem)" }}>
            <TradeCalendar trades={trades} onDateClick={handleDateClick} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
