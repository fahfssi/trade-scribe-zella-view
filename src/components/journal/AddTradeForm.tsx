import React, { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TradeEntry } from '@/types/trade';
import { Badge } from '@/components/ui/badge';

const tradingSessions = [
  "Asia",
  "London",
  "New York AM",
  "New York PM",
  "London Close"
] as const;

const formSchema = z.object({
  symbol: z.string().min(1, { message: "Symbol is required" }),
  date: z.date(),
  direction: z.enum(['long', 'short']),
  entryPrice: z.number().min(0),
  exitPrice: z.number().min(0),
  pnl: z.number(),
  strategy: z.string().min(1, { message: "Strategy is required" }),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  session: z.enum(tradingSessions),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTradeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrade: (trade: Omit<TradeEntry, 'id'>) => void;
  onUpdateTrade?: (trade: TradeEntry) => void;
  editingTrade?: TradeEntry;
}

const AddTradeForm: React.FC<AddTradeFormProps> = ({ 
  isOpen, 
  onClose, 
  onAddTrade,
  onUpdateTrade,
  editingTrade 
}) => {
  const [tags, setTags] = React.useState<string[]>([]);
  const [newTag, setNewTag] = React.useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: '',
      date: new Date(),
      direction: 'long',
      entryPrice: 0,
      exitPrice: 0,
      pnl: 0,
      strategy: '',
      notes: '',
      tags: [],
      session: 'New York AM',
    },
  });

  useEffect(() => {
    if (editingTrade) {
      form.reset({
        symbol: editingTrade.symbol,
        date: new Date(editingTrade.date),
        direction: editingTrade.direction,
        entryPrice: editingTrade.entryPrice,
        exitPrice: editingTrade.exitPrice,
        pnl: editingTrade.pnl,
        strategy: editingTrade.strategy,
        notes: editingTrade.notes || '',
        tags: editingTrade.tags,
        session: editingTrade.session || 'New York AM',
      });
      setTags(editingTrade.tags || []);
    } else {
      form.reset({
        symbol: '',
        date: new Date(),
        direction: 'long',
        entryPrice: 0,
        exitPrice: 0,
        pnl: 0,
        strategy: '',
        notes: '',
        tags: [],
        session: 'New York AM',
      });
      setTags([]);
    }
  }, [editingTrade, form]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = (values: FormValues) => {
    if (editingTrade && onUpdateTrade) {
      onUpdateTrade({
        ...editingTrade,
        symbol: values.symbol,
        date: values.date.toISOString(),
        direction: values.direction,
        entryPrice: values.entryPrice,
        exitPrice: values.exitPrice,
        quantity: 1, // Default to 1 since we're not using quantity anymore
        strategy: values.strategy,
        notes: values.notes || '',
        tags: tags,
        pnl: parseFloat(values.pnl.toFixed(2)),
        session: values.session,
      });
    } else {
      onAddTrade({
        symbol: values.symbol,
        date: values.date.toISOString(),
        direction: values.direction,
        entryPrice: values.entryPrice,
        exitPrice: values.exitPrice,
        quantity: 1, // Default to 1 since we're not using quantity anymore
        strategy: values.strategy,
        notes: values.notes || '',
        tags: tags,
        pnl: parseFloat(values.pnl.toFixed(2)),
        session: values.session,
      });
    }

    form.reset();
    setTags([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingTrade ? 'Edit Trade' : 'Add New Trade'}</DialogTitle>
          <DialogDescription>
            Record your trade details and track your performance over time.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., AAPL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="long">Long</SelectItem>
                        <SelectItem value="short">Short</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        value={field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="exitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exit Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        value={field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pnl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profit & Loss</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        inputMode="decimal" 
                        placeholder="-100.00 or 100.00" 
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? 0 : parseFloat(value));
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter negative value for loss (e.g. -100.25), positive for profit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="strategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strategy</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Breakout" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="session"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trading Session</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trading session" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tradingSessions.map((session) => (
                        <SelectItem key={session} value={session}>
                          {session}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select which market session this trade was executed in
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" size="icon" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="py-1 px-2">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </FormItem>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add your trade notes here..." 
                      className="resize-none min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Document your thoughts, emotions, or observations about this trade.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{editingTrade ? 'Update' : 'Save'} Trade</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTradeForm;
