
export interface TradeEntry {
  id: string;
  symbol: string;
  date: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  strategy: string;
  notes: string;
  tags: string[];
  pnl: number;
}
