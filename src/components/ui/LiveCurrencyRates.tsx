
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface CurrencyData {
  code: string;
  name: string;
  rate: number;
  change: number;
  symbol: string;
  flagCode?: string;
}

export function LiveCurrencyRates() {
  const [currencies, setCurrencies] = useState<CurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchCurrencyRates = () => {
    setLoading(true);
    
    // In a real app, this would be a call to a currency API
    // For this demo, we'll generate mock data
    const basicCurrencies: CurrencyData[] = [
      { code: 'USD', name: 'US Dollar', rate: 82.5, change: 0, symbol: '$', flagCode: 'us' },
      { code: 'EUR', name: 'Euro', rate: 89.7, change: 0, symbol: '€', flagCode: 'eu' },
      { code: 'GBP', name: 'British Pound', rate: 105.6, change: 0, symbol: '£', flagCode: 'gb' },
      { code: 'JPY', name: 'Japanese Yen', rate: 0.55, change: 0, symbol: '¥', flagCode: 'jp' },
      { code: 'AUD', name: 'Australian Dollar', rate: 54.8, change: 0, symbol: 'A$', flagCode: 'au' },
      { code: 'CAD', name: 'Canadian Dollar', rate: 60.3, change: 0, symbol: 'C$', flagCode: 'ca' },
      { code: 'CNY', name: 'Chinese Yuan', rate: 11.4, change: 0, symbol: '¥', flagCode: 'cn' },
      { code: 'AED', name: 'UAE Dirham', rate: 22.5, change: 0, symbol: 'د.إ', flagCode: 'ae' },
      { code: 'SGD', name: 'Singapore Dollar', rate: 61.8, change: 0, symbol: 'S$', flagCode: 'sg' },
    ];
    
    // Add random changes to currency rates
    const updatedCurrencies = basicCurrencies.map(currency => {
      const changePercent = (Math.random() * 2 - 1) * 0.5; // -0.5% to +0.5%
      const newRate = currency.rate * (1 + changePercent / 100);
      return {
        ...currency,
        rate: parseFloat(newRate.toFixed(2)),
        change: changePercent
      };
    });
    
    setCurrencies(updatedCurrencies);
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchCurrencyRates();
    // Update every 10 seconds
    const interval = setInterval(fetchCurrencyRates, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Live Currency Exchange Rates</CardTitle>
        <div className="flex items-center text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3 mr-1" />
          Updated {lastUpdated.toLocaleTimeString()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currencies.map((currency) => (
            <div 
              key={currency.code} 
              className="flex items-center p-3 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <div className="mr-3">
                {currency.flagCode && (
                  <span className="text-2xl">
                    {currency.flagCode === 'eu' ? '🇪🇺' :
                     currency.flagCode === 'us' ? '🇺🇸' :
                     currency.flagCode === 'gb' ? '🇬🇧' :
                     currency.flagCode === 'jp' ? '🇯🇵' :
                     currency.flagCode === 'au' ? '🇦🇺' :
                     currency.flagCode === 'ca' ? '🇨🇦' :
                     currency.flagCode === 'cn' ? '🇨🇳' :
                     currency.flagCode === 'ae' ? '🇦🇪' :
                     currency.flagCode === 'sg' ? '🇸🇬' : '🌐'}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium">{currency.code}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {currency.symbol}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">{currency.name}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">₹{currency.rate}</div>
                <div className={`flex items-center justify-end text-xs ${
                  currency.change > 0 ? 'text-green-600' : 
                  currency.change < 0 ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  {currency.change > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : currency.change < 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : null}
                  {currency.change > 0 ? '+' : ''}{currency.change.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
