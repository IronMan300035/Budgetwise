import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useInvestments } from "@/hooks/useInvestments";
import { InvestmentCard } from "@/components/InvestmentCard";
import { MarketTrendGraph } from "@/components/MarketTrendGraph";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { 
  Trash2, TrendingUp, TrendingDown, RefreshCw, LineChart, BarChart4, ChevronUp, ChevronDown, 
  DollarSign, Coins, Landmark, Wallet, ArrowRight, Calendar, Plus, Activity, AlertTriangle,
  Briefcase, PiggyBank, Check, BarChart, Bookmark, IndianRupee
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// Mock data for real-time market information
const mockMarketData = {
  indices: [
    { name: "NIFTY 50", value: 22651.00, change: "+0.75%", changeValue: 168.35, isPositive: true },
    { name: "SENSEX", value: 74501.39, change: "+0.65%", changeValue: 480.24, isPositive: true },
    { name: "NIFTY BANK", value: 48325.85, change: "-0.15%", changeValue: -72.40, isPositive: false },
    { name: "NIFTY IT", value: 37289.90, change: "+1.25%", changeValue: 460.50, isPositive: true },
  ],
  topStocks: [
    { name: "RELIANCE", price: 2845.75, change: "+1.2%", isPositive: true },
    { name: "TCS", price: 3490.80, change: "+2.1%", isPositive: true },
    { name: "HDFC BANK", price: 1680.30, change: "-0.8%", isPositive: false },
    { name: "INFOSYS", price: 1560.25, change: "+1.5%", isPositive: true },
    { name: "ICICI BANK", price: 1025.40, change: "+0.6%", isPositive: true },
    { name: "BHARTI AIRTEL", price: 1275.90, change: "-0.3%", isPositive: false },
  ],
  cryptos: [
    { name: "Bitcoin", symbol: "BTC", price: 4825250.15, change: "+2.5%", isPositive: true },
    { name: "Ethereum", symbol: "ETH", price: 251490.80, change: "-1.2%", isPositive: false },
    { name: "Binance Coin", symbol: "BNB", price: 36740.30, change: "+0.8%", isPositive: true },
    { name: "Solana", symbol: "SOL", price: 12145.75, change: "+3.5%", isPositive: true },
  ],
  historicalData: [
    { date: "Apr 1", nifty: 22100, sensex: 73000, bitcoin: 4700000 },
    { date: "Apr 2", nifty: 22200, sensex: 73200, bitcoin: 4750000 },
    { date: "Apr 3", nifty: 22300, sensex: 73500, bitcoin: 4760000 },
    { date: "Apr 4", nifty: 22250, sensex: 73300, bitcoin: 4720000 },
    { date: "Apr 5", nifty: 22400, sensex: 73800, bitcoin: 4780000 },
    { date: "Apr 6", nifty: 22500, sensex: 74100, bitcoin: 4800000 },
    { date: "Apr 7", nifty: 22651, sensex: 74501, bitcoin: 4825250 },
  ],
  mutualFunds: [
    {
      name: "Axis Bluechip Fund",
      category: "Large Cap",
      nav: 58.23,
      returns1y: 14.8,
      returns3y: 42.5,
      risk: "Moderate",
      minInvestment: 1000,
      amc: "Axis Mutual Fund"
    },
    {
      name: "Mirae Asset Emerging Bluechip",
      category: "Large & Mid Cap",
      nav: 103.45,
      returns1y: 18.2,
      returns3y: 51.3,
      risk: "High",
      minInvestment: 1000,
      amc: "Mirae Asset"
    },
    {
      name: "SBI Small Cap Fund",
      category: "Small Cap",
      nav: 125.82,
      returns1y: 21.7,
      returns3y: 65.8,
      risk: "Very High",
      minInvestment: 5000,
      amc: "SBI Mutual Fund"
    },
    {
      name: "Parag Parikh Flexi Cap Fund",
      category: "Flexi Cap",
      nav: 68.45,
      returns1y: 16.9,
      returns3y: 48.2,
      risk: "Moderately High",
      minInvestment: 1000,
      amc: "PPFAS Mutual Fund"
    }
  ]
};

const investmentOptions = [
  {
    title: "Systematic Investment Plan (SIP)",
    description: "Regular investments in mutual funds for long-term wealth creation",
    icon: Calendar,
    color: "#4f46e5",
    returns: "12-15% p.a. (Expected)",
    risk: "Moderate",
    minInvestment: "₹500/month"
  },
  {
    title: "Stocks",
    description: "Direct equity investments in Indian and global companies",
    icon: Landmark,
    color: "#0891b2",
    returns: "15-18% p.a. (Historical)",
    risk: "High",
    minInvestment: "Variable"
  },
  {
    title: "Mutual Funds",
    description: "Professionally managed investment portfolios across asset classes",
    icon: BarChart4,
    color: "#0d9488",
    returns: "10-14% p.a. (Expected)",
    risk: "Low to High",
    minInvestment: "₹1,000"
  },
  {
    title: "Cryptocurrency",
    description: "Digital assets using blockchain technology for investment",
    icon: Coins,
    color: "#f59e0b",
    returns: "Highly Variable",
    risk: "Very High",
    minInvestment: "₹100"
  },
  {
    title: "Fixed Deposits",
    description: "Safe and guaranteed returns with bank deposits",
    icon: Wallet,
    color: "#10b981",
    returns: "5-7% p.a.",
    risk: "Very Low",
    minInvestment: "₹1,000"
  },
  {
    title: "Government Bonds",
    description: "Sovereign debt securities with fixed interest payments",
    icon: Briefcase,
    color: "#6366f1",
    returns: "7-8% p.a.",
    risk: "Low",
    minInvestment: "₹1,000"
  }
];

const CHART_COLORS = ["#4f46e5", "#0891b2", "#0d9488", "#f59e0b", "#dc2626", "#8b5cf6"];

// Stock investment options
const stockOptions = [
  { name: "RELIANCE", fullName: "Reliance Industries Ltd", sector: "Energy", price: 2845.75 },
  { name: "TCS", fullName: "Tata Consultancy Services", sector: "Technology", price: 3490.80 },
  { name: "HDFC BANK", fullName: "HDFC Bank Ltd", sector: "Banking", price: 1680.30 },
  { name: "INFOSYS", fullName: "Infosys Ltd", sector: "Technology", price: 1560.25 },
  { name: "ICICI BANK", fullName: "ICICI Bank Ltd", sector: "Banking", price: 1025.40 },
  { name: "BHARTI AIRTEL", fullName: "Bharti Airtel Ltd", sector: "Telecom", price: 1275.90 },
];

// SIP options
const sipOptions = [
  { name: "HDFC Balanced Advantage Fund", category: "Hybrid", nav: 325.45, minInvestment: 500 },
  { name: "Axis Bluechip Fund", category: "Large Cap", nav: 58.23, minInvestment: 500 },
  { name: "Mirae Asset Emerging Bluechip", category: "Large & Mid Cap", nav: 103.45, minInvestment: 1000 },
  { name: "SBI Small Cap Fund", category: "Small Cap", nav: 125.82, minInvestment: 5000 },
  { name: "Parag Parikh Flexi Cap Fund", category: "Flexi Cap", nav: 68.45, minInvestment: 1000 }
];

export default function Investment() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { investments, loading: investmentsLoading, addInvestment, deleteInvestment, getInvestmentsByType } = useInvestments();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isMarketLoading, setIsMarketLoading] = useState(true);
  const [activeMutualFund, setActiveMutualFund] = useState<any>(null);
  const [isMutualFundDetailOpen, setIsMutualFundDetailOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isSipDialogOpen, setIsSipDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("stocks");
  const [investmentSuccessful, setInvestmentSuccessful] = useState(false);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true);
  const [marketData, setMarketData] = useState(mockMarketData);
  
  const [investType, setInvestType] = useState<"sip" | "stock" | "mutual_fund" | "crypto" | "other">("stock");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [symbol, setSymbol] = useState("");
  const [notes, setNotes] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  // Stock dialog specific states
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [stockQuantity, setStockQuantity] = useState("");
  
  // SIP dialog specific states
  const [selectedSIP, setSelectedSIP] = useState<any>(null);
  const [sipAmount, setSipAmount] = useState("");
  const [sipFrequency, setSipFrequency] = useState("monthly");
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);
  
  // Simulate market data loading
  useEffect(() => {
    setTimeout(() => {
      setIsMarketLoading(false);
    }, 500);
  }, []);
  
  // Simulate live market updates
  useEffect(() => {
    if (!liveUpdatesEnabled) return;
    
    const interval = setInterval(() => {
      if (isMarketLoading) return;
      
      // Clone the current market data
      const updatedMarketData = { ...marketData };
      
      // Update indices with small random changes
      updatedMarketData.indices = updatedMarketData.indices.map(index => {
        const changePercent = (Math.random() * 0.4) - 0.2; // -0.2% to +0.2%
        const changeValue = index.value * (changePercent / 100);
        const newValue = index.value + changeValue;
        return {
          ...index,
          value: Math.round(newValue * 100) / 100,
          change: changeValue > 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
          changeValue: Math.round(Math.abs(changeValue) * 100) / 100,
          isPositive: changeValue > 0,
        };
      });
      
      // Update stocks
      updatedMarketData.topStocks = updatedMarketData.topStocks.map(stock => {
        const changePercent = (Math.random() * 0.6) - 0.3; // -0.3% to +0.3%
        const changeValue = stock.price * (changePercent / 100);
        const newPrice = stock.price + changeValue;
        return {
          ...stock,
          price: Math.round(newPrice * 100) / 100,
          change: changeValue > 0 ? `+${changePercent.toFixed(1)}%` : `${changePercent.toFixed(1)}%`,
          isPositive: changeValue > 0,
        };
      });
      
      // Update cryptos
      updatedMarketData.cryptos = updatedMarketData.cryptos.map(crypto => {
        const changePercent = (Math.random() * 1.0) - 0.5; // -0.5% to +0.5%
        const changeValue = crypto.price * (changePercent / 100);
        const newPrice = crypto.price + changeValue;
        return {
          ...crypto,
          price: Math.round(newPrice * 100) / 100,
          change: changeValue > 0 ? `+${changePercent.toFixed(1)}%` : `${changePercent.toFixed(1)}%`,
          isPositive: changeValue > 0,
        };
      });
      
      setMarketData(updatedMarketData);
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [liveUpdatesEnabled, isMarketLoading, marketData]);
  
  const resetForm = () => {
    setInvestType("stock");
    setName("");
    setAmount("");
    setQuantity("");
    setSymbol("");
    setNotes("");
    setPurchaseDate(format(new Date(), "yyyy-MM-dd"));
  };
  
  const handleAddInvestment = async () => {
    if (!name || !amount) {
      toast.error("Please fill in required fields");
      return;
    }
    
    try {
      await addInvestment({
        type: investType,
        name,
        amount: parseFloat(amount),
        quantity: quantity ? parseFloat(quantity) : undefined,
        symbol,
        notes,
        purchase_date: purchaseDate,
      });
      
      resetForm();
      setIsAddOpen(false);
      setInvestmentSuccessful(true);
      
      setTimeout(() => setInvestmentSuccessful(false), 3000);
    } catch (error) {
      toast.error("Failed to add investment");
    }
  };
  
  const handleAddStockInvestment = async () => {
    if (!selectedStock || !stockQuantity) {
      toast.error("Please select a stock and enter quantity");
      return;
    }
    
    const totalAmount = selectedStock.price * parseFloat(stockQuantity);
    
    try {
      await addInvestment({
        type: "stock",
        name: selectedStock.fullName,
        amount: totalAmount,
        quantity: parseFloat(stockQuantity),
        symbol: selectedStock.name,
        notes: `Sector: ${selectedStock.sector}`,
        purchase_date: format(new Date(), "yyyy-MM-dd"),
      });
      
      setIsStockDialogOpen(false);
      setInvestmentSuccessful(true);
      setSelectedStock(null);
      setStockQuantity("");
      
      setTimeout(() => setInvestmentSuccessful(false), 3000);
    } catch (error) {
      toast.error("Failed to add stock investment");
    }
  };
  
  const handleAddSIPInvestment = async () => {
    if (!selectedSIP || !sipAmount) {
      toast.error("Please select a fund and enter amount");
      return;
    }
    
    if (parseFloat(sipAmount) < selectedSIP.minInvestment) {
      toast.error(`Minimum investment for this fund is ₹${selectedSIP.minInvestment}`);
      return;
    }
    
    try {
      await addInvestment({
        type: "sip",
        name: selectedSIP.name,
        amount: parseFloat(sipAmount),
        notes: `Category: ${selectedSIP.category}, Frequency: ${sipFrequency}`,
        purchase_date: format(new Date(), "yyyy-MM-dd"),
      });
      
      setIsSipDialogOpen(false);
      setInvestmentSuccessful(true);
      setSelectedSIP(null);
      setSipAmount("");
      
      setTimeout(() => setInvestmentSuccessful(false), 3000);
    } catch (error) {
      toast.error("Failed to add SIP investment");
    }
  };
  
  const totalInvestment = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const investmentsByType = getInvestmentsByType();
  
  const portfolioChartData = Object.keys(investmentsByType).map(type => ({
    name: type === 'sip' ? 'SIP' : 
          type === 'stock' ? 'Stocks' : 
          type === 'mutual_fund' ? 'Mutual Funds' : 
          type === 'crypto' ? 'Crypto' : 'Other',
    value: investmentsByType[type]
  }));
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sip': return <Calendar className="h-4 w-4 mr-2 text-indigo-600" />;
      case 'stock': return <Landmark className="h-4 w-4 mr-2 text-blue-600" />;
      case 'mutual_fund': return <BarChart4 className="h-4 w-4 mr-2 text-teal-600" />;
      case 'crypto': return <Coins className="h-4 w-4 mr-2 text-amber-600" />;
      default: return <IndianRupee className="h-4 w-4 mr-2 text-gray-600" />;
    }
  };
  
  const openMutualFundDetail = (fund: any) => {
    setActiveMutualFund(fund);
    setIsMutualFundDetailOpen(true);
  };
  
  const handleInvestment = (investmentType: string) => {
    setInvestType(
      investmentType.toLowerCase().includes('sip') ? 'sip' :
      investmentType.toLowerCase().includes('stock') ? 'stock' :
      investmentType.toLowerCase().includes('mutual') ? 'mutual_fund' :
      investmentType.toLowerCase().includes('crypto') ? 'crypto' : 'other'
    );
    setIsAddOpen(true);
  };
  
  if (authLoading || investmentsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Loading investments...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      {/* Success notification */}
      {investmentSuccessful && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-md shadow-lg animate-fade-in-down">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5" />
            <p>Investment added successfully!</p>
          </div>
        </div>
      )}
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 md:mb-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Investment Portfolio</h1>
              <p className="text-muted-foreground">Grow your wealth with smart investments</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => setIsAddOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Investment
              </Button>
              
              <Button 
                onClick={() => setIsStockDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Landmark className="h-4 w-4 mr-1" /> Buy Stocks
              </Button>
              
              <Button 
                onClick={() => setIsSipDialogOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Calendar className="h-4 w-4 mr-1" /> Start SIP
              </Button>
              
              <Button 
                onClick={() => setLiveUpdatesEnabled(!liveUpdatesEnabled)} 
                variant={liveUpdatesEnabled ? "default" : "outline"}
                className={liveUpdatesEnabled ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {liveUpdatesEnabled ? (
                  <>
                    <span className="relative flex h-3 w-3 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Live Updates
                  </>
                ) : (
                  <>
                    <span className="h-3 w-3 mr-2 bg-gray-300 rounded-full"></span>
                    Enable Live
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 border border-indigo-100 dark:border-indigo-800/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Investment</h3>
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-800/50 flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold">₹{totalInvestment.toLocaleString()}</div>
                <div className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 flex items-center">
                  <div className="flex items-center justify-center p-1 bg-indigo-100 dark:bg-indigo-800/50 rounded-full mr-2">
                    <Plus className="h-3 w-3" />
                  </div>
                  <span>From {investments.length} investments</span>
                </div>
              </CardContent>
            </Card>
            
            {marketData.indices.slice(0, 3).map((index, i) => (
              <Card 
                key={index.name}
                className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{index.name}</h3>
                    <div className={`h-8 w-8 rounded-full ${index.isPositive ? 'bg-green-100 dark:bg-green-800/30' : 'bg-red-100 dark:bg-red-800/30'} flex items-center justify-center`}>
                      {index.isPositive ? 
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" /> : 
                        <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      }
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{index.value.toLocaleString()}</div>
                  <div className={`mt-2 text-sm flex items-center ${index.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    <div className={`flex items-center justify-center p-1 ${index.isPositive ? 'bg-green-100 dark:bg-green-800/30' : 'bg-red-100 dark:bg-red-800/30'} rounded-full mr-2`}>
                      {index.isPositive ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </div>
                    <span>{index.change} ({index.isPositive ? '+' : '-'}₹{Math.abs(index.changeValue).toLocaleString()})</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Portfolio Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="col-span-1 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>Portfolio Distribution</CardTitle>
                <CardDescription>Allocation across investment types</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {portfolioChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolioChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {portfolioChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center flex-col">
                    <PieChart className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No investment data to display</p>
                    <p className="text-sm text-muted-foreground">Add investments to see your portfolio distribution</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-1 md:col-span-2 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>Market Trends</CardTitle>
                  <CardDescription>Historical performance of major indices</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="h-80">
                <MarketTrendGraph />
              </CardContent>
            </Card>
          </div>
          
          {/* Investment Options */}
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow mb-8">
            <CardHeader>
              <CardTitle>Investment Options</CardTitle>
              <CardDescription>Explore various investment opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investmentOptions.map((option, index) => (
                  <InvestmentCard
                    key={index}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                    color={option.color}
                    returns={option.returns}
                    risk={option.risk}
                    minInvestment={option.minInvestment}
                    onClick={() => handleInvestment(option.title)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Investment History */}
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Investments</CardTitle>
                <CardDescription>Your investment portfolio</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {investments.length === 0 ? (
                <div className="py-8 text-center">
                  <LineChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Investments Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start building your investment portfolio to track your wealth growth and financial future.
                  </p>
                  <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Add Your First Investment
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-left">Type</th>
                          <th className="px-4 py-3 text-left">Name</th>
                          <th className="px-4 py-3 text-left">Purchase Date</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                          <th className="px-4 py-3 text-right">Quantity</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {investments.map((investment) => (
                          <tr key={investment.id} className="border-t hover:bg-muted/30">
                            <td className="px-4 py-3 capitalize">
                              <div className="flex items-center">
                                {getTypeIcon(investment.type)}
                                {investment.type.replace('_', ' ')}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium">{investment.name}</div>
                              {investment.symbol && (
                                <div className="text-xs text-muted-foreground">{investment.symbol}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {format(new Date(investment.
