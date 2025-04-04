
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ExternalLink, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

// Sample crypto data until API integration
const cryptoSampleData = [
  { 
    name: "Bitcoin", 
    symbol: "BTC", 
    price: 4825250.15, 
    change: "+2.5%", 
    isPositive: true,
    data: Array.from({ length: 7 }, (_, i) => ({
      date: `Day ${i+1}`,
      price: 4700000 + Math.random() * 200000
    }))
  },
  { 
    name: "Ethereum", 
    symbol: "ETH", 
    price: 251490.80, 
    change: "-1.2%", 
    isPositive: false,
    data: Array.from({ length: 7 }, (_, i) => ({
      date: `Day ${i+1}`,
      price: 240000 + Math.random() * 20000
    }))
  },
  { 
    name: "Solana", 
    symbol: "SOL", 
    price: 12145.75, 
    change: "+3.5%", 
    isPositive: true,
    data: Array.from({ length: 7 }, (_, i) => ({
      date: `Day ${i+1}`,
      price: 11000 + Math.random() * 2000
    }))
  },
  { 
    name: "Binance Coin", 
    symbol: "BNB", 
    price: 36740.30, 
    change: "+0.8%", 
    isPositive: true,
    data: Array.from({ length: 7 }, (_, i) => ({
      date: `Day ${i+1}`,
      price: 35000 + Math.random() * 3000
    }))
  }
];

export function CryptoCurrencyChart() {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [cryptoData, setCryptoData] = useState(cryptoSampleData);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRefresh = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedData = cryptoData.map(crypto => {
        const changePercent = (Math.random() * 2 - 1); // Between -1% and +1%
        const changeValue = crypto.price * (changePercent / 100);
        const newPrice = crypto.price + changeValue;
        
        return {
          ...crypto,
          price: Math.round(newPrice * 100) / 100,
          change: changePercent > 0 ? `+${changePercent.toFixed(1)}%` : `${changePercent.toFixed(1)}%`,
          isPositive: changePercent > 0,
          data: crypto.data.map((point, index) => ({
            ...point,
            price: point.price * (1 + (Math.random() * 0.04 - 0.02)) // Small random fluctuation
          }))
        };
      });
      
      setCryptoData(updatedData);
      setIsLoading(false);
      toast.success("Cryptocurrency data updated");
    }, 1000);
  };
  
  const activeCrypto = cryptoData.find(c => c.symbol === selectedCrypto) || cryptoData[0];
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Cryptocurrency Market</CardTitle>
          <CardDescription>Current values and trends in INR</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open("https://coinmarketcap.com/", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            CoinMarketCap
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={selectedCrypto} onValueChange={setSelectedCrypto} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            {cryptoData.map(crypto => (
              <TabsTrigger key={crypto.symbol} value={crypto.symbol}>
                {crypto.symbol}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {cryptoData.map(crypto => (
            <TabsContent key={crypto.symbol} value={crypto.symbol} className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{crypto.name}</h3>
                  <div className="text-2xl font-bold">₹{crypto.price.toLocaleString()}</div>
                </div>
                <div className={`flex items-center ${crypto.isPositive ? "text-green-600" : "text-red-600"}`}>
                  {crypto.isPositive ? (
                    <TrendingUp className="h-5 w-5 mr-1" />
                  ) : (
                    <TrendingDown className="h-5 w-5 mr-1" />
                  )}
                  <span className="text-lg font-medium">{crypto.change}</span>
                </div>
              </div>
              
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={crypto.data}>
                    <defs>
                      <linearGradient id={`gradient-${crypto.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={crypto.isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={crypto.isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Price']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={crypto.isPositive ? "#10b981" : "#ef4444"} 
                      fillOpacity={1} 
                      fill={`url(#gradient-${crypto.symbol})`} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
