
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { 
  ExternalLink, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  BarChart3,
  Info,
  Wallet,
  Bitcoin,
  CreditCard
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useInvestments } from "@/hooks/useInvestments";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Sample crypto data until API integration
const cryptoSampleData = [
  { 
    name: "Bitcoin", 
    symbol: "BTC", 
    price: 4825250.15, 
    change: "+2.5%", 
    isPositive: true,
    data: Array.from({ length: 24 }, (_, i) => ({
      date: `${i}:00`,
      price: 4700000 + Math.random() * 200000
    }))
  },
  { 
    name: "Ethereum", 
    symbol: "ETH", 
    price: 251490.80, 
    change: "-1.2%", 
    isPositive: false,
    data: Array.from({ length: 24 }, (_, i) => ({
      date: `${i}:00`,
      price: 240000 + Math.random() * 20000
    }))
  },
  { 
    name: "Solana", 
    symbol: "SOL", 
    price: 12145.75, 
    change: "+3.5%", 
    isPositive: true,
    data: Array.from({ length: 24 }, (_, i) => ({
      date: `${i}:00`,
      price: 11000 + Math.random() * 2000
    }))
  },
  { 
    name: "Binance Coin", 
    symbol: "BNB", 
    price: 36740.30, 
    change: "+0.8%", 
    isPositive: true,
    data: Array.from({ length: 24 }, (_, i) => ({
      date: `${i}:00`,
      price: 35000 + Math.random() * 3000
    }))
  },
  {
    name: "Ripple",
    symbol: "XRP",
    price: 72.46,
    change: "+4.3%",
    isPositive: true,
    data: Array.from({ length: 24 }, (_, i) => ({
      date: `${i}:00`,
      price: 70 + Math.random() * 5
    }))
  },
  {
    name: "Cardano",
    symbol: "ADA",
    price: 48.92,
    change: "-0.7%",
    isPositive: false,
    data: Array.from({ length: 24 }, (_, i) => ({
      date: `${i}:00`,
      price: 48 + Math.random() * 3
    }))
  }
];

const marketData = {
  marketCap: "₹118.56T",
  volume24h: "₹4.32T",
  btcDominance: "52.4%",
  activeCoins: "21,258"
};

export function CryptoCurrencyChart() {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [cryptoData, setCryptoData] = useState(cryptoSampleData);
  const [isLoading, setIsLoading] = useState(false);
  const [showInvestDialog, setShowInvestDialog] = useState(false);
  const [investAmount, setInvestAmount] = useState("");
  const { addInvestment } = useInvestments();
  
  const handleRefresh = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedData = cryptoData.map(crypto => {
        const changePercent = (Math.random() * 4 - 2); // Between -2% and +2%
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

  useEffect(() => {
    // Set up automatic refreshing every 10 seconds
    const interval = setInterval(() => {
      handleRefresh();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleInvest = async () => {
    if (!investAmount || parseFloat(investAmount) <= 0) {
      toast.error("Please enter a valid investment amount");
      return;
    }

    const activeCrypto = cryptoData.find(c => c.symbol === selectedCrypto);
    if (!activeCrypto) return;
    
    try {
      const result = await addInvestment({
        type: 'crypto',
        name: activeCrypto.name,
        symbol: activeCrypto.symbol,
        amount: parseFloat(investAmount),
        quantity: parseFloat(investAmount) / activeCrypto.price,
        purchase_date: new Date().toISOString().split('T')[0],
        notes: `Investment in ${activeCrypto.name} cryptocurrency at price ₹${activeCrypto.price.toLocaleString()}`
      });

      if (result) {
        toast.success(`Successfully invested in ${activeCrypto.name}`);
        setShowInvestDialog(false);
        setInvestAmount("");
      }
    } catch (error) {
      console.error("Error investing in crypto:", error);
      toast.error("Failed to process cryptocurrency investment");
    }
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
          <Button variant="outline" size="sm" onClick={() => setShowInvestDialog(true)}>
            <Wallet className="h-4 w-4 mr-1" />
            Invest
          </Button>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
              <p className="font-bold">{marketData.marketCap}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
              <p className="font-bold">{marketData.volume24h}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">BTC Dominance</p>
              <p className="font-bold">{marketData.btcDominance}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Active Cryptocurrencies</p>
              <p className="font-bold">{marketData.activeCoins}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={selectedCrypto} onValueChange={setSelectedCrypto} className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full">
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
                      tickFormatter={(value) => 
                        value >= 1000000 
                          ? `₹${(value / 1000000).toFixed(2)}M` 
                          : value >= 1000 
                            ? `₹${(value / 1000).toFixed(0)}k` 
                            : `₹${value}`
                      }
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-2">
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Market trends suggest {crypto.isPositive ? "buying" : "holding"} {crypto.name} based on recent price movement.</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Volatility: {
                        crypto.symbol === "BTC" ? "Medium" : 
                        crypto.symbol === "ETH" ? "Medium" : "High"
                      }</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => window.open(`https://coinmarketcap.com/currencies/${crypto.name.toLowerCase()}/`, "_blank")}>
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Historical Data
                </Button>
                <Button 
                  className={crypto.isPositive ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                  onClick={() => setShowInvestDialog(true)}
                >
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  Invest Now
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Crypto Investment Dialog */}
        <Dialog open={showInvestDialog} onOpenChange={setShowInvestDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bitcoin className="h-5 w-5 text-orange-500" />
                Invest in {activeCrypto.name}
              </DialogTitle>
              <DialogDescription>
                Current price: ₹{activeCrypto.price.toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invest-amount">Investment Amount (₹)</Label>
                <Input
                  id="invest-amount"
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              
              {investAmount && parseFloat(investAmount) > 0 && (
                <div className="p-4 bg-accent/50 rounded-md">
                  <p className="text-sm font-medium mb-2">Investment Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Amount:</div>
                    <div className="font-medium">₹{parseFloat(investAmount).toLocaleString()}</div>
                    
                    <div>Quantity:</div>
                    <div className="font-medium">{(parseFloat(investAmount) / activeCrypto.price).toFixed(6)} {activeCrypto.symbol}</div>
                    
                    <div>Price per {activeCrypto.symbol}:</div>
                    <div className="font-medium">₹{activeCrypto.price.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInvestDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvest}>
                <Wallet className="h-4 w-4 mr-1" />
                Confirm Investment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
