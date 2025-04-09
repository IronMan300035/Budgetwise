
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, BarChart3 } from 'lucide-react';

interface StockAnalysisViewProps {
  stockName: string;
  stockSymbol: string;
  purchasePrice: number;
  currentPrice: number;
  performanceData: Array<{
    date: string;
    price: number;
  }>;
  analysisPoints: Array<{
    title: string;
    description: string;
    type: 'positive' | 'negative' | 'neutral';
  }>;
}

export function StockAnalysisView({ 
  stockName, 
  stockSymbol, 
  purchasePrice, 
  currentPrice, 
  performanceData, 
  analysisPoints 
}: StockAnalysisViewProps) {
  
  const priceChange = currentPrice - purchasePrice;
  const percentChange = (priceChange / purchasePrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {stockName} 
            <span className="text-muted-foreground font-normal text-sm">({stockSymbol})</span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-semibold">${currentPrice.toFixed(2)}</span>
            <Badge className={isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {isPositive ? "+" : ""}{priceChange.toFixed(2)} ({isPositive ? "+" : ""}{percentChange.toFixed(2)}%)
            </Badge>
            {isPositive ? 
              <TrendingUp className="h-5 w-5 text-green-600" /> : 
              <TrendingDown className="h-5 w-5 text-red-600" />
            }
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Performance History
          </CardTitle>
          <CardDescription>
            Stock performance since purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={isPositive ? "#10b981" : "#ef4444"} 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" /> Analysis Insights
          </CardTitle>
          <CardDescription>
            Expert analysis for {stockName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisPoints.map((point, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  {point.type === 'positive' && <Badge className="bg-green-100 text-green-800">Positive</Badge>}
                  {point.type === 'negative' && <Badge className="bg-red-100 text-red-800">Negative</Badge>}
                  {point.type === 'neutral' && <Badge className="bg-blue-100 text-blue-800">Neutral</Badge>}
                  {point.title}
                </h3>
                <p className="mt-1 text-muted-foreground">{point.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Investment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Purchase Price</p>
              <p className="text-xl font-semibold">${purchasePrice.toFixed(2)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-xl font-semibold">${currentPrice.toFixed(2)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Return</p>
              <p className={`text-xl font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
