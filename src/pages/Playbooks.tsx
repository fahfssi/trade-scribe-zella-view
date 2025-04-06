
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PlaybooksPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Strategy Playbooks</h1>
      <p className="text-muted-foreground">
        Create and manage your trading strategies and setups.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Breakout Strategy</CardTitle>
            <CardDescription>For momentum trading on high volume breakouts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This feature will be available in a future update. Here you will be able to create 
              detailed strategy playbooks, complete with entry/exit rules, risk management, and 
              example trades.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pullback Entry</CardTitle>
            <CardDescription>For entering trending stocks on retracements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This feature will be available in a future update. Here you will be able to create 
              detailed strategy playbooks, complete with entry/exit rules, risk management, and 
              example trades.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Reversal Pattern</CardTitle>
            <CardDescription>For counter-trend trading at key levels</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This feature will be available in a future update. Here you will be able to create 
              detailed strategy playbooks, complete with entry/exit rules, risk management, and 
              example trades.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlaybooksPage;
