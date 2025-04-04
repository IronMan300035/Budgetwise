
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, IndianRupee, ArrowRight, Search, Landmark } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { format, subDays } from "date-fns";
import { useInvestments } from "@/hooks/useInvestments";
import { toast } from "sonner";

// Mock stock data
const stocksData = [
  { name: "RELIANCE", price: 2845.75, change: "+1.2%", isPositive: true },
  { name: "TCS", price: 3490.80, change: "+2.1%", isPositive: true },
  { name: "HDFC BANK", price: 1680.30, change: "-0.8%", isPositive: false },
  { name: "INFOSYS", price: 1560.25, change: "+1.5%", isPositive: true },
  { name: "ICICI BANK", price: 1025.40, change: "+0.6%", isPositive: true },
  { name: "BHARTI AIRTEL", price: 1275.90, change: "-0.3%", isPositive: false },
  { name: "MARUTI SUZUKI", price: 10425.75, change: "+0.9%", isPositive: true },
  { name: "TATA MOTORS", price: 875.55, change: "+1.8%", isPositive: true },
  { name: "ASIAN PAINTS", price: 3250.20, change: "-0.5%", isPositive: false }
];

// Generate historical data for each stock
const generateStockHistory = (stockName: string, currentPrice: number) => {
  // Different volatility and trends based on stock name
  let volatility = 0.01;
  let trend = 0; // neutral
  
  if (stockName === "RELIANCE" || stockName === "TCS") {
    volatility = 0.015;
    trend = 0.002; // upward trend
  } else if (stockName === "HDFC BANK") {
    volatility = 0.02;
    trend = -0.001; // slight downward trend
  }
  
  let price = currentPrice * 0.9; // Start at 90% of current price
  
  return Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 30 - i - 1);
    const change = (Math.random() * volatility * 2) - volatility + trend;
    price = price * (1 + change);
    
    return {
      date: format(date, 'yyyy-MM-dd'),
      price: Math.round(price * 100) / 100
    };
  });
};

// Enhance stock data with historical data
const enhancedStocksData = stocksData.map(stock => ({
  ...stock,
  historicalData: generateStockHistory(stock.name, stock.price)
}));

export function StocksInvestment() {
  const [stocks, setStocks] = useState(enhancedStocksData);
  const [selectedStock, setSelectedStock] = useState(enhancedStocksData[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInvestDialogOpen, setIsInvestDialogOpen] = useState(false);
  const [investAmount, setInvestAmount] = useState("");
  const [quantity, setQuantity] = useState<number | null>(null);
  
  const { addInvestment } = useInvestments();
  
  // Filter stocks based on search term
  const filteredStocks = stocks.filter(stock => 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate quantity based on investment amount
  useEffect(() => {
    if (investAmount && selectedStock) {
      const amount = parseFloat(investAmount);
      if (!isNaN(amount) && amount > 0) {
        setQuantity(parseFloat((amount / selectedStock.price).toFixed(2)));
      } else {
        setQuantity(null);
      }
    } else {
      setQuantity(null);
    }
  }, [investAmount, selectedStock]);
  
  const handleStockSelect = (stock: typeof selectedStock) => {
    setSelectedStock(stock);
  };
  
  const handleInvestNow = () => {
    setIsInvestDialogOpen(true);
  };
  
  const handleConfirmInvestment = async () => {
    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid investment amount");
      return;
    }
    
    try {
      await addInvestment({
        type: "stock",
        name: selectedStock.name,
        amount,
        quantity: quantity || 0,
        symbol: selectedStock.name,
        notes: `Invested at ₹${selectedStock.price} per share`,
        purchase_date: format(new Date(), "yyyy-MM-dd"),
      });
      
      setIsInvestDialogOpen(false);
      setInvestAmount("");
      
      toast.success(`Successfully invested ₹${amount.toLocaleString()} in ${selectedStock.name}`);
    } catch (error) {
      toast.error("Failed to make investment");
      console.error(error);
    }
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Landmark className="h-5 w-5 mr-2 text-blue-600" />
          Stock Market Investments
        </CardTitle>
        <CardDescription>Invest in the Indian stock market</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Stock List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock) => (
            <div
              key={stock.name}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedStock.name === stock.name 
                  ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" 
                  : "hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
              }`}
              onClick={() => handleStockSelect(stock)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{stock.name}</div>
                  <div className="text-sm text-muted-foreground">NSE</div>
                </div>
                <div className="text-right">
                  <div className="font-medium flex items-center justify-end">
                    <IndianRupee className="h-3.5 w-3.5 mr-1" />
                    {stock.price.toLocaleString()}
                  </div>
                  <div className={`text-sm flex items-center justify-end ${stock.isPositive ? "text-green-600" : "text-red-600"}`}>
                    {stock.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {stock.change}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Selected Stock Details */}
        {selectedStock && (
          <div className="mt-6 pt-6 border-t space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{selectedStock.name}</h3>
                <p className="text-sm text-muted-foreground">National Stock Exchange of India</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end text-2xl font-bold">
                  <IndianRupee className="h-5 w-5 mr-1" />
                  {selectedStock.price.toLocaleString()}
                </div>
                <div className={`flex items-center justify-end ${selectedStock.isPositive ? "text-green-600" : "text-red-600"}`}>
                  {selectedStock.isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {selectedStock.change} today
                </div>
              </div>
            </div>
            
            {/* Stock Price Chart */}
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedStock.historicalData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), "MMM d")}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₹${value.toFixed(0)}`}
                    tick={{ fontSize: 12 }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Price']}
                    labelFormatter={(date) => format(new Date(date), "MMMM d, yyyy")}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={selectedStock.isPositive ? "#10b981" : "#ef4444"} 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleInvestNow}
            >
              Invest Now in {selectedStock.name}
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Investment Dialog */}
      <Dialog open={isInvestDialogOpen} onOpenChange={setIsInvestDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invest in {selectedStock?.name}</DialogTitle>
            <DialogDescription>
              Current price: ₹{selectedStock?.price.toLocaleString()} per share
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="investment-amount" className="text-right">
                Amount (₹)
              </Label>
              <Input
                id="investment-amount"
                type="number"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="col-span-3"
                placeholder="Enter amount to invest"
              />
            </div>
            
            {quantity !== null && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Shares</Label>
                <div className="col-span-3">
                  <div className="px-3 py-2 rounded-md bg-muted">
                    {quantity.toFixed(2)} shares at ₹{selectedStock?.price.toLocaleString()} each
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmInvestment}>
              Confirm Investment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
