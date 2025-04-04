import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useInvestments } from "@/hooks/useInvestments";
import { CryptoTracker } from "@/components/CryptoTracker";
import { StocksInvestment } from "@/components/StocksInvestment";
import { SIPInvestment } from "@/components/SIPInvestment";
import { InvestmentCard } from "@/components/InvestmentCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trash2, TrendingUp, TrendingDown, RefreshCw, IndianRupee, Coins, 
  Landmark, Wallet, ArrowRight, Calendar, Plus, Activity, AlertTriangle,
  Briefcase, PiggyBank, Check, BarChart, Bookmark 
} from "lucide-react";
import { format } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip
} from "recharts";
import { toast } from "sonner";

// Investment options for the quick selection cards
const investmentOptions = [
  {
    title: "Systematic Investment Plan (SIP)",
    description: "Regular investments in mutual funds for long-term wealth creation",
    icon: Calendar,
    color: "#4f46e5",
    returns: "12-15% p.a. (Expected)",
    risk: "Moderate",
    minInvestment: "₹500/month",
    section: "sip"
  },
  {
    title: "Stocks",
    description: "Direct equity investments in Indian and global companies",
    icon: Landmark,
    color: "#0891b2",
    returns: "15-18% p.a. (Historical)",
    risk: "High",
    minInvestment: "Variable",
    section: "stocks"
  },
  {
    title: "Cryptocurrency",
    description: "Digital assets using blockchain technology for investment",
    icon: Coins,
    color: "#f59e0b",
    returns: "Highly Variable",
    risk: "Very High",
    minInvestment: "₹100",
    section: "crypto"
  },
  {
    title: "Fixed Deposits",
    description: "Safe and guaranteed returns with bank deposits",
    icon: Wallet,
    color: "#10b981",
    returns: "5-7% p.a.",
    risk: "Very Low",
    minInvestment: "₹1,000",
    section: "other"
  },
  {
    title: "Government Bonds",
    description: "Sovereign debt securities with fixed interest payments",
    icon: Briefcase,
    color: "#6366f1",
    returns: "7-8% p.a.",
    risk: "Low",
    minInvestment: "₹1,000",
    section: "other"
  }
];

const CHART_COLORS = ["#4f46e5", "#0891b2", "#0d9488", "#f59e0b", "#dc2626", "#8b5cf6"];

export default function Investment() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { investments, loading: investmentsLoading, addInvestment, deleteInvestment, getInvestmentsByType } = useInvestments();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("portfolio");
  const [investmentSuccessful, setInvestmentSuccessful] = useState(false);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true);
  
  const [investType, setInvestType] = useState<"sip" | "stock" | "mutual_fund" | "crypto" | "other">("stock");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [symbol, setSymbol] = useState("");
  const [notes, setNotes] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);
  
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
      case 'mutual_fund': return <BarChart className="h-4 w-4 mr-2 text-teal-600" />;
      case 'crypto': return <Coins className="h-4 w-4 mr-2 text-amber-600" />;
      default: return <IndianRupee className="h-4 w-4 mr-2 text-gray-600" />;
    }
  };
  
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      setActiveTab("invest"); // Switch to invest tab
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 border border-indigo-100 dark:border-indigo-800/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Investment</h3>
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-800/50 flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold flex items-center">
                  <IndianRupee className="h-6 w-6 mr-1" />
                  {totalInvestment.toLocaleString()}
                </div>
                <div className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 flex items-center">
                  <div className="flex items-center justify-center p-1 bg-indigo-100 dark:bg-indigo-800/50 rounded-full mr-2">
                    <Plus className="h-3 w-3" />
                  </div>
                  <span>From {investments.length} investments</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1 md:col-span-2 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle>Portfolio Distribution</CardTitle>
                <CardDescription>Your investments by category</CardDescription>
              </CardHeader>
              <CardContent className="h-48">
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
                      <RechartsTooltip 
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
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
          </div>
          
          {/* Main Content Tabs */}
          <Tabs defaultValue="portfolio" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="invest">Invest</TabsTrigger>
              <TabsTrigger value="learn">Learn</TabsTrigger>
            </TabsList>
            
            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="space-y-6">
              {/* Investment History */}
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Investments</CardTitle>
                    <CardDescription>Your investment portfolio</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {investments.length === 0 ? (
                    <div className="py-8 text-center">
                      <BarChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Investments Yet</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Start building your investment portfolio to track your wealth growth and financial future.
                      </p>
                      <Button onClick={() => setActiveTab("invest")}>
                        <Plus className="h-4 w-4 mr-1" /> Explore Investment Options
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
                              <th className="px-4 py-3 text-right">Amount (₹)</th>
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
                                  {format(new Date(investment.purchase_date), "MMM dd, yyyy")}
                                </td>
                                <td className="px-4 py-3 text-right font-medium">
                                  {Number(investment.amount).toLocaleString()}
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
              
              {/* Investment Options Cards */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Investment Options</h2>
                
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
                      onClick={() => scrollToSection(option.section)}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Invest Tab */}
            <TabsContent value="invest" className="space-y-12">
              {/* SIP Section */}
              <section id="sip" className="scroll-mt-16">
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-semibold flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                      Systematic Investment Plans (SIP)
                    </h2>
                    <p className="text-muted-foreground">Build wealth with regular investments</p>
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300">Recommended</Badge>
                </div>
                
                <SIPInvestment />
              </section>
              
              {/* Stocks Section */}
              <section id="stocks" className="scroll-mt-16">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold flex items-center">
                    <Landmark className="h-5 w-5 mr-2 text-blue-600" />
                    Stock Market Investments
                  </h2>
                  <p className="text-muted-foreground">Direct equity investments in Indian companies</p>
                </div>
                
                <StocksInvestment />
              </section>
              
              {/* Crypto Section */}
              <section id="crypto" className="scroll-mt-16">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold flex items-center">
                    <Coins className="h-5 w-5 mr-2 text-amber-600" />
                    Cryptocurrency
                  </h2>
                  <p className="text-muted-foreground">Digital assets with high growth potential</p>
                </div>
                
                <CryptoTracker />
              </section>
              
              {/* Other Investment Options */}
              <section id="other" className="scroll-mt-16">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold">Other Investment Options</h2>
                  <p className="text-muted-foreground">Explore more ways to grow your wealth</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fixed Deposits */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Wallet className="h-5 w-5 mr-2 text-emerald-600" />
                        Fixed Deposits
                      </CardTitle>
                      <CardDescription>Safe and guaranteed returns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Interest Rate</p>
                            <p className="text-lg font-medium">5.5% - 7.0% p.a.</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Min. Investment</p>
                            <p className="text-lg font-medium">₹1,000</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Risk Level</p>
                            <p className="text-lg font-medium">Very Low</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Lock-in Period</p>
                            <p className="text-lg font-medium">1 month - 10 years</p>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-md text-sm">
                          <p>Fixed deposits provide guaranteed returns and are ideal for risk-averse investors.</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => {
                          setInvestType("other");
                          setName("Fixed Deposit");
                          setIsAddOpen(true);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        Invest in Fixed Deposit
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Government Bonds */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                        Government Bonds
                      </CardTitle>
                      <CardDescription>Sovereign-backed debt securities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Interest Rate</p>
                            <p className="text-lg font-medium">7.0% - 8.0% p.a.</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Min. Investment</p>
                            <p className="text-lg font-medium">₹1,000</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Risk Level</p>
                            <p className="text-lg font-medium">Low</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Tenure</p>
                            <p className="text-lg font-medium">5 - 30 years</p>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm">
                          <p>Government bonds provide stable income with the safety of government backing.</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => {
                          setInvestType("other");
                          setName("Government Bond");
                          setIsAddOpen(true);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Invest in Government Bonds
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </section>
            </TabsContent>
            
            {/* Learn Tab */}
            <TabsContent value="learn" className="space-y-6">
              <Card className="overflow-hidden shadow-lg bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
                <div className="p-6 sm:p-10 flex flex-col md:flex-row items-center gap-6">
                  <div className="md:w-2/3">
                    <h2 className="text-2xl font-bold mb-4">Financial Education Hub</h2>
                    <p className="mb-6 opacity-90">
                      Access free courses, webinars, and resources to enhance your investment knowledge and make informed financial decisions.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button className="bg-white text-indigo-700 hover:bg-indigo-100">
                        <Bookmark className="h-4 w-4 mr-1" /> Free Courses
                      </Button>
                      <Button variant="outline" className="border-white text-white hover:bg-white/20">
                        <Activity className="h-4 w-4 mr-1" /> Market Insights
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-center md:w-1/3 md:justify-end">
                    <div className="w-40 h-40 rounded-full bg-white/20 flex items-center justify-center">
                      <BarChart className="h-20 w-20 text-white" />
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Investment Guides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Beginner's Guide to Investing</CardTitle>
                    <CardDescription>Learn the basics of investing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                        <div className="font-bold text-indigo-700">1</div>
                      </div>
                      <div>
                        <h3 className="font-medium">Understanding Investment Types</h3>
                        <p className="text-sm text-muted-foreground">Learn about different investment options and their risk-return profiles.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                        <div className="font-bold text-indigo-700">2</div>
                      </div>
                      <div>
                        <h3 className="font-medium">Creating an Investment Plan</h3>
                        <p className="text-sm text-muted-foreground">Set financial goals and create a personalized investment strategy.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                        <div className="font-bold text-indigo-700">3</div>
                      </div>
                      <div>
                        <h3 className="font-medium">Risk Management</h3>
                        <p className="text-sm text-muted-foreground">Learn how to manage risk through diversification and asset allocation.</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Start Learning <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Investment Strategies</CardTitle>
                    <CardDescription>Take your investments to the next level</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <div className="font-bold text-blue-700">1</div>
                      </div>
                      <div>
                        <h3 className="font-medium">Technical Analysis</h3>
                        <p className="text-sm text-muted-foreground">Learn to analyze charts and identify patterns for better entry and exit points.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <div className="font-bold text-blue-700">2</div>
                      </div>
                      <div>
                        <h3 className="font-medium">Fundamental Analysis</h3>
                        <p className="text-sm text-muted-foreground">Evaluate companies based on financial statements and business models.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <div className="font-bold text-blue-700">3</div>
                      </div>
                      <div>
                        <h3 className="font-medium">Tax-Efficient Investing</h3>
                        <p className="text-sm text-muted-foreground">Optimize your investment returns by minimizing tax liabilities.</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Explore Strategies <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              {/* Investment Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Investment Tips</CardTitle>
                  <CardDescription>Key principles for successful investing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-medium">Start Early</h3>
                      <p className="text-sm text-muted-foreground">The power of compounding works best over long time periods.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <PiggyBank className="h-5 w-5 text-amber-600" />
                      </div>
                      <h3 className="font-medium">Regular Investments</h3>
                      <p className="text-sm text-muted-foreground">Consistent, periodic investments help average out market volatility.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-medium">Diversify</h3>
                      <p className="text-sm text-muted-foreground">Spread investments across different asset classes to reduce risk.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <h3 className="font-medium">Avoid Emotional Decisions</h3>
                      <p className="text-sm text-muted-foreground">Make investment decisions based on research, not market fear or greed.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <BarChart className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="font-medium">Monitor & Rebalance</h3>
                      <p className="text-sm text-muted-foreground">Regularly review your portfolio and adjust according to your goals.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Bookmark className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h3 className="font-medium">Stay Informed</h3>
                      <p className="text-sm text-muted-foreground">Keep learning about markets, economy and investment strategies.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
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
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
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
