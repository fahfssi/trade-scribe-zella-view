
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
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Trade Calendar</CardTitle>
          <p className="text-muted-foreground">
            View your trades in a calendar format. Days with trades are highlighted. Click on a day to see details.
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <TradeCalendar trades={trades} onDateClick={handleDateClick} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
