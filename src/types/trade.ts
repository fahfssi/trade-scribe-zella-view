
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
}
