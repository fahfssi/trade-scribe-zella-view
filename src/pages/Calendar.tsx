
import React from 'react';
import TradeCalendar from '@/components/calendar/TradeCalendar';
import { getTradesFromStorage } from '@/services/tradeService';

const CalendarPage = () => {
  const trades = getTradesFromStorage();

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    // In a future version, we could show trades for this date or link to the journal
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trade Calendar</h1>
      <p className="text-muted-foreground">
        View your trades in a calendar format. Days with trades are highlighted. Click on a day to see details.
      </p>
      
      <TradeCalendar trades={trades} onDateClick={handleDateClick} />
    </div>
  );
};

export default CalendarPage;
