
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { TradeEntry } from '@/types/trade';
import { cn } from '@/lib/utils';

interface TradesListProps {
  trades: TradeEntry[];
  onEditTrade: (id: string) => void;
  onDeleteTrade: (id: string) => void;
}

type SortField = 'date' | 'symbol' | 'strategy' | 'type' | 'pnl';
type SortDirection = 'asc' | 'desc';

const TradesList: React.FC<TradesListProps> = ({ trades, onEditTrade, onDeleteTrade }) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTrades = [...trades].sort((a, b) => {
    if (sortField === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    
    if (sortField === 'pnl') {
      return sortDirection === 'asc' ? a.pnl - b.pnl : b.pnl - a.pnl;
    }
    
    // For string comparisons
    const aVal = a[sortField]?.toString().toLowerCase() || '';
    const bVal = b[sortField]?.toString().toLowerCase() || '';
    
    return sortDirection === 'asc'
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center">
                Date {getSortIcon('date')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('symbol')}
            >
              <div className="flex items-center">
                Symbol {getSortIcon('symbol')}
              </div>
            </TableHead>
            <TableHead>Direction</TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('strategy')}
            >
              <div className="flex items-center">
                Strategy {getSortIcon('strategy')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('pnl')}
            >
              <div className="flex items-center">
                P&L {getSortIcon('pnl')}
              </div>
            </TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell>{new Date(trade.date).toLocaleDateString()}</TableCell>
              <TableCell>{trade.symbol}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {trade.direction === 'long' ? (
                    <ArrowUpRight className="mr-1 h-4 w-4 text-profit" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-4 w-4 text-loss" />
                  )}
                  {trade.direction === 'long' ? 'Long' : 'Short'}
                </div>
              </TableCell>
              <TableCell>{trade.strategy}</TableCell>
              <TableCell className={cn(
                trade.pnl >= 0 ? 'text-profit' : 'text-loss',
                'font-medium'
              )}>
                ${trade.pnl.toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {trade.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditTrade(trade.id)}
                    aria-label="Edit trade"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteTrade(trade.id)}
                    className="text-destructive hover:bg-destructive/10"
                    aria-label="Delete trade"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TradesList;
