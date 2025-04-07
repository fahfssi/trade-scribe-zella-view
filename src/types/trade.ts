
export type TradeDirection = 'long' | 'short';

export type TradingSession = 'Asia' | 'London' | 'New York AM' | 'New York PM' | 'London Close';

export interface TradeEntry {
  id: string;
  symbol: string;
  date: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  strategy: string;
  pnl: number;
  notes?: string;
  tags?: string[];
  session?: TradingSession;
  riskReward?: number;
  // Excel format specific fields
  buyFillId?: string;
  sellFillId?: string;
  buyPrice?: number;
  sellPrice?: number;
  boughtTimestamp?: string;
  soldTimestamp?: string;
  duration?: string;
  size?: number;
}

// New interface for imported CSV data
export interface BrokerReport {
  id: string;
  name: string;
  date: string;
  totalPnl: number;
  winRate: number;
  tradeCount: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  riskRewardRatio?: number;
}
