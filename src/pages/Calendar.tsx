
import React, { useEffect, useState } from 'react';
import TradeCalendar from '@/components/calendar/TradeCalendar';
import { getTradesFromStorage } from '@/services/tradeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TradeEntry } from '@/types/trade';

const CalendarPage = () => {
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const loadedTrades = getTradesFromStorage();
      setTrades(loadedTrades);
    } catch (err) {
      console.error('Error loading trades for calendar:', err);
      setError('Could not load trades data. Please try refreshing the page.');
    }
  }, []);

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    // In a future version, we could show trades for this date or link to the journal
  };

  return (
    <div className="container mx-auto px-2 py-4 max-w-full">
      <Card className="w-full border-none shadow-none bg-transparent">
        <CardHeader className="pb-0">
          <CardTitle className="text-3xl font-bold">Trade Calendar</CardTitle>
          <p className="text-muted-foreground">
            View your trades in a calendar format. Days with trades display profit/loss information.
          </p>
        </CardHeader>
        <CardContent className="p-2">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
              {error}
            </div>
          ) : (
            <div className="calendar-container" style={{ height: "calc(100vh - 10rem)" }}>
              <TradeCalendar trades={trades} onDateClick={handleDateClick} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
