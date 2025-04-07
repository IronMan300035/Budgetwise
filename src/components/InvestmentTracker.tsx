
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, RefreshCcw } from 'lucide-react';

// Mock data for the charts
const generateMockData = (days: number, trend: 'up' | 'down' | 'volatile', baseValue: number) => {
  const data = [];
  let currentValue = baseValue;
  
  for (let i = 0; i < days; i++) {
    let change;
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    
    if (trend === 'up') {
      change = (Math.random() * 3) - 0.5; // Mostly up
    } else if (trend === 'down') {
      change = (Math.random() * 3) - 2.5; // Mostly down
    } else {
      change = (Math.random() * 6) - 3; // Volatile
    }
    
    // Ensure we don't go negative
    currentValue = Math.max(currentValue + change, 1);
    
    data.push({
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      value: currentValue,
    });
  }
  
  return data;
};

const investmentData = {
  sip: generateMockData(30, 'up', 100),
  stocks: generateMockData(30, 'volatile', 150),
  mutualFunds: generateMockData(30, 'up', 125),
  fd: generateMockData(30, 'up', 100),
  rd: generateMockData(30, 'up', 100),
  crypto: generateMockData(30, 'volatile', 200),
};

interface InvestmentTrackerProps {
  refreshInterval?: number;
}

export const InvestmentTracker: React.FC<InvestmentTrackerProps> = ({ 
  refreshInterval = 60000 // 1 minute default
}) => {
  const [activeTab, setActiveTab] = React.useState('sip');
  const [timeframe, setTimeframe] = React.useState('1m');
  const [lastUpdated, setLastUpdated] = React.useState(new Date());
  
  // Map timeframe to days
  const timeframeDays = {
    '1d': 1,
    '1w': 7,
    '1m': 30,
    '3m': 90,
    '6m': 180,
    '1y': 365,
  };
  
  // Create a mapper for each investment type
  const dataMapper = {
    sip: investmentData.sip,
    stocks: investmentData.stocks,
    mutualFunds: investmentData.mutualFunds,
    fd: investmentData.fd,
    rd: investmentData.rd,
    crypto: investmentData.crypto,
  };
  
  const getFilteredData = () => {
    const days = timeframeDays[timeframe as keyof typeof timeframeDays];
    const data = dataMapper[activeTab as keyof typeof dataMapper];
    return data.slice(-days);
  };
  
  // Calculate performance metrics
  const calculateMetrics = (data: { date: string; value: number }[]) => {
    if (data.length < 2) return { change: 0, percentChange: 0 };
    
    const startValue = data[0].value;
    const endValue = data[data.length - 1].value;
    const change = endValue - startValue;
    const percentChange = (change / startValue) * 100;
    
    return { change, percentChange };
  };
  
  const metrics = calculateMetrics(getFilteredData());
  const isPositive = metrics.change >= 0;
  
  const refreshData = () => {
    // In a real app, this would fetch new data from an API
    setLastUpdated(new Date());
  };
  
  // Refresh data on interval
  React.useEffect(() => {
    const intervalId = setInterval(refreshData, refreshInterval);
    return () => clearInterval(intervalId);
  }, [refreshInterval]);
  
  // Color based on trend
  const trendColor = isPositive ? '#10b981' : '#ef4444';
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Investment Tracker</CardTitle>
            <CardDescription>Real-time performance tracking of your investments</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <RefreshCcw className="h-3 w-3" />
            <span className="text-xs">Updated: {lastUpdated.toLocaleTimeString()}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Controls */}
          <div className="flex justify-between items-center">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="sip">SIPs</TabsTrigger>
                <TabsTrigger value="stocks">Stocks</TabsTrigger>
                <TabsTrigger value="mutualFunds">Mutual Funds</TabsTrigger>
                <TabsTrigger value="fd">FDs</TabsTrigger>
                <TabsTrigger value="rd">RDs</TabsTrigger>
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded flex items-center gap-1 text-sm ${isPositive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                {isPositive ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                <span>{metrics.percentChange.toFixed(2)}%</span>
              </div>
              <span className="text-sm text-muted-foreground">in {timeframe}</span>
            </div>
            
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1 Day</SelectItem>
                <SelectItem value="1w">1 Week</SelectItem>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Chart */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getFilteredData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  tickMargin={10}
                  axisLine={{ strokeOpacity: 0.1 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickMargin={10}
                  axisLine={{ strokeOpacity: 0.1 }} 
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  formatter={(value) => [`₹${value}`, 'Value']}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #f0f0f0',
                    borderRadius: '4px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={trendColor} 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Starting Value</p>
              <p className="text-lg font-semibold">
                ₹{getFilteredData()[0]?.value.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className="text-lg font-semibold">
                ₹{getFilteredData()[getFilteredData().length - 1]?.value.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Change</p>
              <p className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}₹{metrics.change.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
