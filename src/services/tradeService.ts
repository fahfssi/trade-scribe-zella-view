import { TradeEntry, BrokerReport, TradeDirection, TradingSession } from '@/types/trade';

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
    session: 'New York AM',
    riskReward: 2.5,
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
    session: 'New York AM',
    riskReward: 1.8,
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
    session: 'New York PM',
    riskReward: 1.2,
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
    session: 'New York PM',
    riskReward: 3.0,
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
    session: 'London',
    riskReward: 0.5,
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
    session: 'London Close',
    riskReward: 2.1,
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

// CSV import functionality
export const importCSV = (csvText: string): { 
  success: boolean; 
  trades?: TradeEntry[]; 
  report?: BrokerReport;
  error?: string 
} => {
  try {
    // Basic CSV parsing (in a real app, you'd want a more robust CSV parser)
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Map Excel headers to our internal structure
    const headerMap: Record<string, string> = {
      'symbol': 'symbol',
      '_priceFormat': 'strategy', // Using this as strategy
      '_priceFormatTy': 'tags',
      'tickSize': 'tickSize',
      'buyFillId': 'buyFillId',
      'sellFillId': 'sellFillId',
      'qty': 'quantity',
      'buyPrice': 'entryPrice',
      'sellPrice': 'exitPrice',
      'pnl': 'pnl',
      'boughtTimestamp': 'boughtTimestamp',
      'soldTimestamp': 'soldTimestamp',
      'duration': 'duration'
    };
    
    // Check if we have at least the minimal required columns
    const hasMinimalColumns = headers.some(h => h.toLowerCase().includes('symbol')) && 
                              headers.some(h => h.toLowerCase().includes('pnl'));
    
    if (!hasMinimalColumns) {
      return {
        success: false,
        error: 'CSV format not recognized. Please ensure it contains at least Symbol and PNL columns.'
      };
    }
    
    const trades = getTradesFromStorage();
    const newTrades: TradeEntry[] = [];
    let totalPnl = 0;
    let winCount = 0;
    let lossCount = 0;
    let totalWin = 0;
    let totalLoss = 0;
    let largestWin = 0;
    let largestLoss = 0;
    let totalRiskReward = 0;
    let tradesWithRR = 0;
    
    // Parse each line after the header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      if (values.length < 3) continue; // Need at least a few columns
      
      // Create a map of header->value
      const rowData: Record<string, string> = {};
      headers.forEach((header, index) => {
        if (index < values.length) {
          rowData[header.toLowerCase()] = values[index];
        }
      });
      
      // Extract data based on our mapping or with sensible defaults
      const symbol = rowData.symbol || '';
      
      if (!symbol) continue; // Skip rows without a symbol
      
      // Determine direction based on PNL and buy/sell prices
      const pnl = parseFloat(rowData.pnl?.replace(/[()$]/g, '') || '0');
      let direction: TradeDirection = 'long';
      
      // If we have buy and sell prices, we can determine direction
      const buyPrice = parseFloat(rowData.buyprice || '0');
      const sellPrice = parseFloat(rowData.sellprice || '0');
      
      if (buyPrice && sellPrice) {
        direction = sellPrice > buyPrice ? 'long' : 'short';
      } else {
        // Otherwise use the sign of PNL with _priceFormat
        const priceFormat = parseInt(rowData._priceformat || '0');
        direction = (priceFormat < 0) ? 'short' : 'long';
      }
      
      // Handle timestamps
      let date = new Date().toISOString();
      if (rowData.boughttimestamp) {
        try {
          date = new Date(rowData.boughttimestamp).toISOString();
        } catch (e) {
          // Use current date if parsing fails
        }
      }
      
      // Calculate or parse risk:reward if available
      const tickSize = parseFloat(rowData.ticksize || '0');
      let riskReward: number | undefined = undefined;
      
      if (tickSize && pnl) {
        // Simple estimate based on tick size and PNL
        riskReward = Math.abs(pnl) / (tickSize * 2);
        
        if (riskReward > 0) {
          totalRiskReward += riskReward;
          tradesWithRR++;
        }
      }
      
      // Determine session based on timestamp
      let session: TradingSession | undefined = undefined;
      if (rowData.boughttimestamp) {
        const tradeHour = new Date(rowData.boughttimestamp).getUTCHours();
        
        if (tradeHour >= 0 && tradeHour < 8) {
          session = 'Asia';
        } else if (tradeHour >= 8 && tradeHour < 12) {
          session = 'London';
        } else if (tradeHour >= 12 && tradeHour < 16) {
          session = 'New York AM';
        } else if (tradeHour >= 16 && tradeHour < 20) {
          session = 'New York PM';
        } else {
          session = 'London Close';
        }
      }
      
      // Extract tags if available
      const tags = rowData._priceformatty ? [rowData._priceformatty] : [];
      
      // Create trade object
      const newTrade: TradeEntry = {
        id: Math.random().toString(36).substr(2, 9),
        symbol,
        date,
        direction,
        entryPrice: buyPrice || 0,
        exitPrice: sellPrice || 0,
        quantity: parseInt(rowData.qty || '1'),
        strategy: rowData._priceformat || 'Unknown',
        pnl,
        tags,
        session,
        riskReward,
        buyFillId: rowData.buyfillid,
        sellFillId: rowData.sellfillid,
        boughtTimestamp: rowData.boughttimestamp,
        soldTimestamp: rowData.soldtimestamp,
        duration: rowData.duration,
      };
      
      newTrades.push(newTrade);
      
      // Calculate statistics
      totalPnl += pnl;
      if (pnl > 0) {
        winCount++;
        totalWin += pnl;
        largestWin = Math.max(largestWin, pnl);
      } else if (pnl < 0) {
        lossCount++;
        totalLoss += Math.abs(pnl);
        largestLoss = Math.max(largestLoss, Math.abs(pnl));
      }
    }

    // Skip if no trades were found
    if (newTrades.length === 0) {
      return {
        success: false,
        error: 'No valid trades found in the CSV file.'
      };
    }
    
    // Create broker report
    const report: BrokerReport = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Imported Report ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      totalPnl,
      winRate: winCount / (winCount + lossCount) * 100 || 0,
      tradeCount: newTrades.length,
      averageWin: winCount > 0 ? totalWin / winCount : 0,
      averageLoss: lossCount > 0 ? totalLoss / lossCount : 0,
      largestWin,
      largestLoss,
      riskRewardRatio: tradesWithRR > 0 ? totalRiskReward / tradesWithRR : undefined
    };
    
    // Store broker report
    const existingReports = JSON.parse(localStorage.getItem('brokerReports') || '[]');
    localStorage.setItem('brokerReports', JSON.stringify([...existingReports, report]));
    
    // Save all trades
    saveTradesToStorage([...newTrades, ...trades]);
    
    return {
      success: true,
      trades: [...newTrades, ...trades],
      report
    };
  } catch (error) {
    console.error('CSV import error:', error);
    return {
      success: false,
      error: 'Failed to parse CSV file. Please check the format and try again.'
    };
  }
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
      averageRiskReward: 0,
    };
  }
  
  const winningTrades = trades.filter(trade => trade.pnl > 0);
  const losingTrades = trades.filter(trade => trade.pnl < 0);
  
  const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalProfit = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
  
  // Calculate average risk-reward ratio
  const tradesWithRR = trades.filter(trade => trade.riskReward !== undefined && trade.riskReward > 0);
  const averageRiskReward = tradesWithRR.length > 0 
    ? tradesWithRR.reduce((sum, trade) => sum + (trade.riskReward || 0), 0) / tradesWithRR.length
    : 0;
  
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
    averageRiskReward: averageRiskReward,
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

export const getSessionStatistics = () => {
  const trades = getTradesFromStorage();
  
  // Define session data structure
  const sessionStats: Record<string, { 
    count: number; 
    pnl: number;
    winCount: number;
    lossCount: number;
  }> = {};
  
  // Initialize sessions
  ['Asia', 'London', 'New York AM', 'New York PM', 'London Close'].forEach(session => {
    sessionStats[session] = { count: 0, pnl: 0, winCount: 0, lossCount: 0 };
  });
  
  // Calculate stats per session
  trades.forEach(trade => {
    const session = trade.session || 'New York AM'; // Default if not set
    const stats = sessionStats[session];
    
    stats.count++;
    stats.pnl += trade.pnl;
    
    if (trade.pnl > 0) {
      stats.winCount++;
    } else if (trade.pnl < 0) {
      stats.lossCount++;
    }
  });
  
  return sessionStats;
};
