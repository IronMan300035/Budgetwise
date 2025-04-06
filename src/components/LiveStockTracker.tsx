
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, LineChart as LineChartIcon, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useInvestments } from "@/hooks/useInvestments";

interface StockData {
  name: string;
  symbol: string;
  fullName: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  high52w: number;
  low52w: number;
  chartData: { time: string; price: number }[];
}

export function LiveStockTracker() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const { addInvestment } = useInvestments();

  const handleInvestNow = async (stock: StockData) => {
    setSelectedStock(stock);
    // In a real app, this would open a modal to enter quantity and confirm
    // For now, we'll add a default investment
    try {
      await addInvestment({
        type: 'stock',
        name: `${stock.name} (${stock.symbol})`,
        amount: stock.price * 10, // Default 10 shares
        quantity: 10,
        purchase_date: new Date().toISOString(),
        symbol: stock.symbol,
        notes: `Purchased at ₹${stock.price.toFixed(2)} per share`,
      });
      
      toast.success(`Successfully invested in ${stock.symbol}`, {
        description: `Invested in 10 shares at ₹${stock.price.toFixed(2)} per share`
      });
    } catch (error) {
      console.error('Error investing in stock:', error);
      toast.error(`Failed to invest in ${stock.symbol}`);
    }
  };

  useEffect(() => {
    const fetchStockData = () => {
      // In a real app, this would be a call to a stock API
      // For this demo, we'll generate mock data
      const generateMockStockData = () => {
        const stockList = [
          { name: "RELIANCE", fullName: "Reliance Industries Ltd", basePrice: 2800 },
          { name: "TCS", fullName: "Tata Consultancy Services Ltd", basePrice: 3600 },
          { name: "HDFCBANK", fullName: "HDFC Bank Ltd", basePrice: 1600 },
          { name: "INFY", fullName: "Infosys Ltd", basePrice: 1400 },
          { name: "BHARTIARTL", fullName: "Bharti Airtel Ltd", basePrice: 920 },
          { name: "ICICIBANK", fullName: "ICICI Bank Ltd", basePrice: 950 },
          { name: "KOTAKBANK", fullName: "Kotak Mahindra Bank Ltd", basePrice: 1850 },
          { name: "HINDUNILVR", fullName: "Hindustan Unilever Ltd", basePrice: 2400 }
        ];
        
        return stockList.map(stock => {
          const change = (Math.random() * 100 - 50) / 10; // -5 to +5
          const price = stock.basePrice + change;
          const changePercent = (change / stock.basePrice) * 100;
          
          // Generate chart data for the day (9:30 AM to 3:30 PM)
          const chartData = [];
          const now = new Date();
          const currentHour = now.getHours();
          const marketOpen = currentHour >= 9 && currentHour < 16; // 9 AM to 4 PM
          
          // If within market hours, show current day data
          if (marketOpen) {
            const startTime = new Date(now);
            startTime.setHours(9, 30, 0, 0);
            
            let currentTime = new Date(startTime);
            while (currentTime <= now) {
              // Minor random variation
              const timePrice = stock.basePrice * (1 + (Math.random() * 0.1 - 0.05) + (changePercent/200) * (currentTime.getHours() - 9) / 6);
              
              chartData.push({
                time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                price: timePrice
              });
              
              currentTime = new Date(currentTime.getTime() + 30 * 60000); // Add 30 minutes
            }
          } else {
            // If outside market hours, show a full day of historical data
            let time = new Date();
            time.setHours(9, 30, 0, 0);
            
            for (let i = 0; i < 12; i++) { // 9:30 AM to 3:30 PM (30 min intervals)
              const priceChange = (i / 11) * changePercent;
              const timePrice = stock.basePrice * (1 + (priceChange / 100) + (Math.random() * 0.02 - 0.01));
              
              chartData.push({
                time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                price: timePrice
              });
              
              time = new Date(time.getTime() + 30 * 60000); // Add 30 minutes
            }
          }
          
          return {
            name: stock.name,
            symbol: stock.name,
            fullName: stock.fullName,
            price,
            change,
            changePercent,
            marketCap: price * (Math.random() * 1000000000 + 100000000000),
            volume: Math.floor(Math.random() * 10000000 + 1000000),
            high52w: stock.basePrice * (1 + (Math.random() * 0.3)),
            low52w: stock.basePrice * (1 - (Math.random() * 0.3)),
            chartData
          };
        });
      };
      
      setStocks(generateMockStockData());
      setLoading(false);
    };
    
    fetchStockData();
    // Update every 10 seconds
    const interval = setInterval(fetchStockData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="shadow-md">
        <CardContent className="flex items-center justify-center h-64 p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <LineChartIcon className="mr-2 h-5 w-5 text-blue-600" />
              Live Stock Tracker
            </CardTitle>
            <CardDescription>Real-time Indian stock market data</CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            NSE
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stocks.map((stock) => (
            <div key={stock.symbol} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{stock.symbol}</h3>
                  <p className="text-sm text-muted-foreground">{stock.fullName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{stock.price.toFixed(2)}</p>
                  <div className={`flex items-center justify-end ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    <span>{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)</span>
                  </div>
                </div>
              </div>
              
              <div className="h-32 my-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stock.chartData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toFixed(2)}`, "Price"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={stock.change >= 0 ? "#10B981" : "#EF4444"} 
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div>
                  <span className="text-muted-foreground block">Volume</span>
                  <span className="font-medium">{(stock.volume / 1000000).toFixed(2)}M</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Market Cap</span>
                  <span className="font-medium">₹{(stock.marketCap / 10000000000).toFixed(2)}B</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">52W High</span>
                  <span className="font-medium">₹{stock.high52w.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">52W Low</span>
                  <span className="font-medium">₹{stock.low52w.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleInvestNow(stock)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <ArrowUpRight className="h-4 w-4 mr-1" />
                Invest Now
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
