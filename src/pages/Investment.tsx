
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useInvestments } from "@/hooks/useInvestments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, TrendingUp, TrendingDown, RefreshCw, LineChart, BarChart4, ChevronUp, ChevronDown, DollarSign, Coins, Landmark, Wallet, ArrowRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Mock market data - in a real app, this would come from an API
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
];

const CHART_COLORS = ["#4f46e5", "#0891b2", "#0d9488", "#f59e0b", "#dc2626", "#8b5cf6"];

export default function Investment() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { investments, loading: investmentsLoading, addInvestment, deleteInvestment, getInvestmentsByType } = useInvestments();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isMarketLoading, setIsMarketLoading] = useState(true);
  
  // Form state
  const [investType, setInvestType] = useState<"sip" | "stock" | "mutual_fund" | "crypto" | "other">("stock");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [symbol, setSymbol] = useState("");
  const [notes, setNotes] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);
  
  // Simulate market data loading
  useEffect(() => {
    setTimeout(() => {
      setIsMarketLoading(false);
    }, 1000);
  }, []);
  
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
    if (!name || !amount) return;
    
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
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold mb-2 md:mb-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Investment Portfolio</h1>
            
            <Button 
              onClick={() => setIsAddOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Investment
            </Button>
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
            
            {mockMarketData.indices.slice(0, 3).map((index, i) => (
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
                      <RechartsTooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']} />
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
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
                <CardDescription>Historical performance of major indices</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isMarketLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary mr-2" />
                    <span>Loading market data...</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={mockMarketData.historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[4500000, 5000000]} />
                      <RechartsTooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="nifty" name="NIFTY 50" stroke="#4f46e5" activeDot={{ r: 8 }} />
                      <Line yAxisId="left" type="monotone" dataKey="sensex" name="SENSEX" stroke="#0891b2" />
                      <Line yAxisId="right" type="monotone" dataKey="bitcoin" name="Bitcoin (₹)" stroke="#f59e0b" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {investmentOptions.map((option, index) => {
                  const IconComponent = option.icon;
                  return (
                    <Card key={index} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all">
                      <div className="flex p-6">
                        <div className="mr-4">
                          <div 
                            className="h-12 w-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${option.color}20`, color: option.color }}
                          >
                            <IconComponent className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{option.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                          <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                            <div>
                              <div className="text-muted-foreground">Returns</div>
                              <div className="font-medium">{option.returns}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Risk</div>
                              <div className="font-medium">{option.risk}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Min. Investment</div>
                              <div className="font-medium">{option.minInvestment}</div>
                            </div>
                          </div>
                          <Button 
                            onClick={() => {
                              setInvestType(
                                option.title.toLowerCase().includes('sip') ? 'sip' :
                                option.title.toLowerCase().includes('stocks') ? 'stock' :
                                option.title.toLowerCase().includes('mutual') ? 'mutual_fund' :
                                option.title.toLowerCase().includes('crypto') ? 'crypto' : 'other'
                              );
                              setIsAddOpen(true);
                            }}
                            className="w-full"
                            style={{ backgroundColor: option.color }}
                          >
                            Invest Now
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
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
                                {investment.type === 'sip' && <Calendar className="h-4 w-4 mr-2 text-indigo-600" />}
                                {investment.type === 'stock' && <Landmark className="h-4 w-4 mr-2 text-blue-600" />}
                                {investment.type === 'mutual_fund' && <BarChart4 className="h-4 w-4 mr-2 text-teal-600" />}
                                {investment.type === 'crypto' && <Coins className="h-4 w-4 mr-2 text-amber-600" />}
                                {investment.type === 'other' && <DollarSign className="h-4 w-4 mr-2 text-gray-600" />}
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
                              {format(new Date(investment.purchase_date), "MMM dd, yyyy")}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              ₹{Number(investment.amount).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {investment.quantity ? investment.quantity : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-100"
                                  onClick={() => deleteInvestment(investment.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Market Overview */}
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow mb-8">
            <CardHeader>
              <CardTitle>Market Overview</CardTitle>
              <CardDescription>Latest market data & trends</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="stocks" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="stocks">Stocks</TabsTrigger>
                  <TabsTrigger value="crypto">Crypto</TabsTrigger>
                  <TabsTrigger value="mutual_funds">Mutual Funds</TabsTrigger>
                </TabsList>
                
                <TabsContent value="stocks">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {mockMarketData.topStocks.map((stock, index) => (
                      <div key={index} className="flex justify-between items-center p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                        <div>
                          <div className="font-medium">{stock.name}</div>
                          <div className="text-sm text-muted-foreground">NSE</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{stock.price.toLocaleString()}</div>
                          <div className={`text-sm ${stock.isPositive ? "text-green-600" : "text-red-600"} flex items-center justify-end`}>
                            {stock.isPositive ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                            {stock.change}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="crypto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockMarketData.cryptos.map((crypto, index) => (
                      <div key={index} className="flex justify-between items-center p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-4">
                            <Coins className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{crypto.name}</div>
                            <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{crypto.price.toLocaleString()}</div>
                          <div className={`text-sm ${crypto.isPositive ? "text-green-600" : "text-red-600"} flex items-center justify-end`}>
                            {crypto.isPositive ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                            {crypto.change}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="mutual_funds">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Axis Bluechip Fund Direct Growth</CardTitle>
                          <CardDescription>Large Cap</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm text-muted-foreground">NAV</div>
                              <div className="font-medium">₹58.23</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">1Y Returns</div>
                              <div className="font-medium text-green-600">+14.8%</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Risk</div>
                              <div className="font-medium">Moderate</div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full" variant="outline">
                            View Details <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Mirae Asset Emerging Bluechip</CardTitle>
                          <CardDescription>Large & Mid Cap</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm text-muted-foreground">NAV</div>
                              <div className="font-medium">₹103.45</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">1Y Returns</div>
                              <div className="font-medium text-green-600">+18.2%</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Risk</div>
                              <div className="font-medium">High</div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full" variant="outline">
                            View Details <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                    
                    <div className="text-center">
                      <Button>View All Mutual Funds</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Add Investment Dialog */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Investment</DialogTitle>
                <DialogDescription>
                  Record details of your investment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="investment-type" className="text-right">
                    Type
                  </Label>
                  <Select value={investType} onValueChange={(value) => setInvestType(value as any)}>
                    <SelectTrigger id="investment-type" className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sip">SIP</SelectItem>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="investment-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="investment-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                    placeholder={
                      investType === 'sip' ? 'E.g., HDFC SIP Plan' :
                      investType === 'stock' ? 'E.g., Reliance Industries' :
                      investType === 'mutual_fund' ? 'E.g., Axis Bluechip Fund' :
                      investType === 'crypto' ? 'E.g., Bitcoin' : 'Investment Name'
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="investment-amount" className="text-right">
                    Amount (₹)
                  </Label>
                  <Input
                    id="investment-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                {(investType === 'stock' || investType === 'crypto') && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="investment-quantity" className="text-right">
                      Quantity
                    </Label>
                    <Input
                      id="investment-quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                )}
                {(investType === 'stock' || investType === 'crypto') && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="investment-symbol" className="text-right">
                      Symbol
                    </Label>
                    <Input
                      id="investment-symbol"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      className="col-span-3"
                      placeholder={investType === 'stock' ? 'E.g., RELIANCE' : 'E.g., BTC'}
                    />
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="investment-date" className="text-right">
                    Purchase Date
                  </Label>
                  <Input
                    id="investment-date"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="investment-notes" className="text-right">
                    Notes
                  </Label>
                  <Input
                    id="investment-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddInvestment}>Add Investment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
