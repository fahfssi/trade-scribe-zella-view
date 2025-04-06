
import { TradeEntry } from '@/types/trade';

// Sample data for the app
const sampleTrades: TradeEntry[] = [
  {
    id: '1',
    symbol: 'AAPL',
    date: '2025-04-01T09:30:00Z',
    direction: 'long',
    entryPrice: 198.45,
    exitPrice: 203.75,
    quantity: 10,
    strategy: 'Breakout',
    notes: 'Strong market open, followed momentum after earnings announcement.',
    tags: ['momentum', 'earnings'],
    pnl: 53.00,
  },
  {
    id: '2',
    symbol: 'TSLA',
    date: '2025-04-02T10:15:00Z',
    direction: 'short',
    entryPrice: 172.30,
    exitPrice: 168.50,
    quantity: 5,
    strategy: 'Reversal',
    notes: 'Technical overbought signal on hourly chart.',
    tags: ['technical', 'overbought'],
    pnl: 19.00,
  },
  {
    id: '3',
    symbol: 'MSFT',
    date: '2025-04-03T11:05:00Z',
    direction: 'long',
    entryPrice: 415.20,
    exitPrice: 410.75,
    quantity: 3,
    strategy: 'Gap Fill',
    notes: 'Trade didn\'t work out, market reversed shortly after entry.',
    tags: ['gap fill', 'loss'],
    pnl: -13.35,
  },
  {
    id: '4',
    symbol: 'AMZN',
    date: '2025-04-03T13:45:00Z',
    direction: 'long',
    entryPrice: 185.30,
    exitPrice: 186.75,
    quantity: 15,
    strategy: 'Support Bounce',
    notes: 'Took profit too early, stock continued higher afterward.',
    tags: ['support', 'partial profit'],
    pnl: 21.75,
  },
  {
    id: '5',
    symbol: 'META',
    date: '2025-04-04T09:45:00Z',
    direction: 'short',
    entryPrice: 493.80,
    exitPrice: 498.25,
    quantity: 8,
    strategy: 'Trend Fade',
    notes: 'Poor trade, market was in strong uptrend.',
    tags: ['countertrend', 'loss'],
    pnl: -35.60,
  },
  {
    id: '6',
    symbol: 'NVDA',
    date: '2025-04-05T14:30:00Z',
    direction: 'long',
    entryPrice: 932.50,
    exitPrice: 945.75,
    quantity: 2,
    strategy: 'Breakout',
    notes: 'Clean break of resistance level, held for afternoon run.',
    tags: ['momentum', 'breakout'],
    pnl: 26.50,
  },
];

// In a real app, this would be replaced with API calls
export const getTradesFromStorage = (): TradeEntry[] => {
  const storedTrades = localStorage.getItem('trades');
  if (storedTrades) {
    return JSON.parse(storedTrades);
  }
  // Initialize with sample data if no trades exist
  localStorage.setItem('trades', JSON.stringify(sampleTrades));
  return sampleTrades;
};

export const saveTradesToStorage = (trades: TradeEntry[]): void => {
  localStorage.setItem('trades', JSON.stringify(trades));
};

export const addTrade = (trade: Omit<TradeEntry, 'id'>): TradeEntry => {
  const trades = getTradesFromStorage();
  const newTrade = {
    ...trade,
    id: Math.random().toString(36).substr(2, 9), // Simple ID generation
  };
  
  const updatedTrades = [newTrade, ...trades];
  saveTradesToStorage(updatedTrades);
  return newTrade;
};

export const updateTrade = (updatedTrade: TradeEntry): TradeEntry => {
  const trades = getTradesFromStorage();
  const updatedTrades = trades.map(trade => 
    trade.id === updatedTrade.id ? updatedTrade : trade
  );
  
  saveTradesToStorage(updatedTrades);
  return updatedTrade;
};

export const deleteTrade = (id: string): void => {
  const trades = getTradesFromStorage();
  const updatedTrades = trades.filter(trade => trade.id !== id);
  saveTradesToStorage(updatedTrades);
};

// Analytics functions
export const getTradeStatistics = () => {
  const trades = getTradesFromStorage();
  
  // No trades case
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      profitFactor: 0,
      totalPnl: 0,
      averagePnl: 0,
      averageWin: 0,
      averageLoss: 0,
    };
  }
  
  const winningTrades = trades.filter(trade => trade.pnl > 0);
  const losingTrades = trades.filter(trade => trade.pnl < 0);
  
  const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalProfit = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
  
  return {
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: (winningTrades.length / trades.length) * 100,
    profitFactor: totalLoss === 0 ? totalProfit : totalProfit / totalLoss,
    totalPnl: totalPnl,
    averagePnl: totalPnl / trades.length,
    averageWin: winningTrades.length > 0 ? totalProfit / winningTrades.length : 0,
    averageLoss: losingTrades.length > 0 ? totalLoss / losingTrades.length : 0,
  };
};

export const getPnlByDay = () => {
  const trades = getTradesFromStorage();
  
  // Group trades by date
  const pnlByDay = trades.reduce((acc: Record<string, number>, trade) => {
    const date = trade.date.split('T')[0];
    acc[date] = (acc[date] || 0) + trade.pnl;
    return acc;
  }, {});
  
  // Convert to array format for charts
  return Object.entries(pnlByDay)
    .map(([date, pnl]) => ({ date, pnl }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const getPerformanceByStrategy = () => {
  const trades = getTradesFromStorage();
  
  // Group trades by strategy
  const strategyMap = trades.reduce((acc: Record<string, {trades: TradeEntry[], totalPnl: number}>, trade) => {
    if (!acc[trade.strategy]) {
      acc[trade.strategy] = { trades: [], totalPnl: 0 };
    }
    
    acc[trade.strategy].trades.push(trade);
    acc[trade.strategy].totalPnl += trade.pnl;
    
    return acc;
  }, {});
  
  // Calculate win rate and total P&L for each strategy
  return Object.entries(strategyMap).map(([strategy, data]) => {
    const { trades, totalPnl } = data;
    const winningTrades = trades.filter(trade => trade.pnl > 0);
    const winRate = (winningTrades.length / trades.length) * 100;
    
    return {
      strategy,
      winRate: parseFloat(winRate.toFixed(1)),
      pnl: parseFloat(totalPnl.toFixed(2)),
      tradeCount: trades.length
    };
  }).sort((a, b) => b.pnl - a.pnl);
};
