
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, TrendingUp, TrendingDown, Bitcoin, IndianRupee } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { format, subDays } from "date-fns";
import { toast } from "sonner";

// Mock crypto data - in a real app, this would come from an API
const mockCryptoData = [
  { name: "Bitcoin", symbol: "BTC", price: 4825250.15, change: "+2.5%", isPositive: true },
  { name: "Ethereum", symbol: "ETH", price: 251490.80, change: "-1.2%", isPositive: false },
  { name: "Binance Coin", symbol: "BNB", price: 36740.30, change: "+0.8%", isPositive: true },
  { name: "Solana", symbol: "SOL", price: 12145.75, change: "+3.5%", isPositive: true },
];

// Generate historical data for charts
const generateHistoricalData = (days = 30, startPrice = 4500000, volatility = 0.02) => {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - i - 1);
    const changePercent = (Math.random() * volatility * 2) - volatility;
    const price = startPrice * (1 + changePercent);
    startPrice = price; // For the next iteration
    
    return {
      date: format(date, 'yyyy-MM-dd'),
      price: Math.round(price * 100) / 100,
    };
  });
};

interface CryptoCoin {
  name: string;
  symbol: string;
  price: number;
  change: string;
  isPositive: boolean;
  historicalData?: { date: string; price: number }[];
}

export function CryptoTracker() {
  const [cryptos, setCryptos] = useState<CryptoCoin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<CryptoCoin | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Enhance mock data with historical data
      const enhancedData = mockCryptoData.map(coin => ({
        ...coin,
        historicalData: generateHistoricalData(
          30, 
          coin.price * 0.85, 
          coin.name === "Bitcoin" ? 0.03 : 0.04
        )
      }));
      
      setCryptos(enhancedData);
      setSelectedCoin(enhancedData[0]); // Select Bitcoin by default
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleCoinSelect = (coin: CryptoCoin) => {
    setSelectedCoin(coin);
  };
  
  const handleViewOnCoinMarketCap = (symbol: string) => {
    window.open(`https://coinmarketcap.com/currencies/${symbol.toLowerCase()}`, '_blank');
  };
  
  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="py-6">
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="ml-4 text-lg">Loading cryptocurrency data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bitcoin className="h-5 w-5 mr-2 text-amber-500" />
          Cryptocurrency Market
        </CardTitle>
        <CardDescription>Real-time cryptocurrency prices and trends</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Coin Selector */}
        <div className="flex flex-wrap gap-3">
          {cryptos.map((coin) => (
            <Button
              key={coin.symbol}
              variant={selectedCoin?.symbol === coin.symbol ? "default" : "outline"}
              size="sm"
              onClick={() => handleCoinSelect(coin)}
              className="flex items-center gap-2"
            >
              {coin.symbol}
              <span className={coin.isPositive ? "text-green-500" : "text-red-500"}>
                {coin.change}
              </span>
            </Button>
          ))}
        </div>
        
        {/* Selected Coin Details */}
        {selectedCoin && (
          <div className="space-y-6">
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <h3 className="text-xl font-bold">{selectedCoin.name}</h3>
                <p className="text-muted-foreground">{selectedCoin.symbol}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end text-2xl font-bold">
                  <IndianRupee className="h-5 w-5 mr-1" />
                  {selectedCoin.price.toLocaleString()}
                </div>
                <div className={`flex items-center ${selectedCoin.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {selectedCoin.isPositive ? 
                    <TrendingUp className="h-4 w-4 mr-1" /> : 
                    <TrendingDown className="h-4 w-4 mr-1" />
                  }
                  {selectedCoin.change}
                </div>
              </div>
            </div>
            
            {/* Coin Price Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={selectedCoin.historicalData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), "MMM d")}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Price']}
                    labelFormatter={(date) => format(new Date(date), "MMMM d, yyyy")}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#f59e0b" 
                    fillOpacity={1}
                    fill="url(#colorPrice)" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* CoinMarketCap Link */}
            <Button 
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              onClick={() => handleViewOnCoinMarketCap(selectedCoin.name.toLowerCase())}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on CoinMarketCap
            </Button>
            
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-800 dark:text-amber-200">
              <p><strong>Note:</strong> Cryptocurrency investments are subject to market risks. Always do your research before investing.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
