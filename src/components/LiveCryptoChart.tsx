
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";

interface CryptoData {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  chartData: { timestamp: number; price: number }[];
}

export function LiveCryptoChart() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCryptoData = async () => {
    try {
      // In a real app, this would be a call to CoinMarketCap API
      // For this demo, we'll generate mock data
      const generateMockData = () => {
        const coins = [
          { name: "Bitcoin", symbol: "BTC" },
          { name: "Ethereum", symbol: "ETH" },
          { name: "Binance Coin", symbol: "BNB" },
          { name: "Solana", symbol: "SOL" },
          { name: "Cardano", symbol: "ADA" }
        ];
        
        return coins.map(coin => {
          const basePrice = coin.symbol === "BTC" ? 60000 : 
                            coin.symbol === "ETH" ? 3000 : 
                            coin.symbol === "BNB" ? 500 : 
                            coin.symbol === "SOL" ? 100 : 50;
          
          const variance = Math.random() * 0.05 - 0.025; // -2.5% to +2.5%
          const price = basePrice * (1 + variance);
          const change24h = variance * 100;
          
          // Generate chart data for last 24 hours (24 data points)
          const chartData = Array.from({ length: 24 }, (_, i) => {
            const hourVariance = Math.random() * 0.08 - 0.04; // -4% to +4%
            return {
              timestamp: Date.now() - (23 - i) * 3600000,
              price: basePrice * (1 + hourVariance)
            };
          });
          
          // Make sure the last data point matches the current price
          chartData.push({
            timestamp: Date.now(),
            price
          });
          
          return {
            name: coin.name,
            symbol: coin.symbol,
            price,
            change24h,
            marketCap: price * (coin.symbol === "BTC" ? 19000000 : 
                                coin.symbol === "ETH" ? 120000000 : 
                                coin.symbol === "BNB" ? 170000000 : 
                                coin.symbol === "SOL" ? 350000000 : 450000000),
            volume24h: price * (Math.random() * 1000000 + 500000),
            chartData
          };
        });
      };
      
      setCryptoData(generateMockData());
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch cryptocurrency data");
      setLoading(false);
      console.error("Error fetching crypto data:", err);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    // Update every 10 seconds
    const interval = setInterval(fetchCryptoData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Live Cryptocurrency Market</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {cryptoData.map((crypto) => (
            <div key={crypto.symbol} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-bold">{crypto.name} ({crypto.symbol})</h3>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold">₹{crypto.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    <span className={`ml-2 flex items-center text-sm ${crypto.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {crypto.change24h >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                      {Math.abs(crypto.change24h).toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="font-medium">₹{(crypto.volume24h / 1000000).toFixed(2)}M</p>
                </div>
              </div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={crypto.chartData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id={`gradient${crypto.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={crypto.change24h >= 0 ? "#10B981" : "#EF4444"} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={crypto.change24h >= 0 ? "#10B981" : "#EF4444"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(tick) => new Date(tick).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, "Price"]}
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={crypto.change24h >= 0 ? "#10B981" : "#EF4444"} 
                      fillOpacity={1} 
                      fill={`url(#gradient${crypto.symbol})`} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
