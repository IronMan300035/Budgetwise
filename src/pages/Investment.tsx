
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useInvestments } from "@/hooks/useInvestments";
import { InvestmentCard } from "@/components/InvestmentCard";
import { InvestmentOptions } from "@/components/InvestmentOptions";
import { InvestmentTracker } from "@/components/InvestmentTracker";
import { BankAccountLink } from "@/components/BankAccountLink";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieChartIcon, 
  BarChart4, 
  Plus, 
  Landmark,
  BadgeDollarSign,
  GoldCoin
} from "lucide-react";
import { toast } from "sonner";
import { useActivityLogs } from "@/hooks/useActivityLogs";

export default function Investment() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { investments, loading, addInvestment, getInvestmentTotal, getInvestmentsByType } = useInvestments();
  const { addActivityLog } = useActivityLogs();
  const [newInvestment, setNewInvestment] = useState({
    type: "stock",
    name: "",
    amount: "",
    purchase_date: new Date().toISOString().split("T")[0],
    notes: ""
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewInvestment(prev => ({
      ...prev,
      [name]: name === "amount" ? value.replace(/[^\d.]/g, "") : value
    }));
  };
  
  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newInvestment.name || !newInvestment.amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      const result = await addInvestment({
        ...newInvestment,
        amount: parseFloat(newInvestment.amount)
      });
      
      if (result) {
        await addActivityLog(
          "investment", 
          `Added new ${newInvestment.type} investment: ₹${newInvestment.amount} - ${newInvestment.name}`
        );
        
        setNewInvestment({
          type: "stock",
          name: "",
          amount: "",
          purchase_date: new Date().toISOString().split("T")[0],
          notes: ""
        });
        
        setIsDialogOpen(false);
        toast.success("Investment added successfully");
      }
    } catch (error) {
      console.error("Error adding investment:", error);
      toast.error("Failed to add investment");
    }
  };
  
  const investmentTotal = getInvestmentTotal();
  const investmentsByType = getInvestmentsByType();
  
  // Convert the investmentsByType object to an array for the pie chart
  const pieChartData = Object.entries(investmentsByType).map(([type, amount]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
    value: amount
  }));
  
  // Colors for the pie chart
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];
  
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Loading investments...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold mb-2 md:mb-0 bg-gradient-to-r from-primary to-blue-600 text-transparent bg-clip-text">Investments</h1>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" /> Add Investment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Investment</DialogTitle>
                  <DialogDescription>
                    Enter the details of your investment below
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleAddInvestment} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="type" className="text-sm font-medium">Investment Type</label>
                      <select
                        id="type"
                        name="type"
                        value={newInvestment.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      >
                        <option value="stock">Stock</option>
                        <option value="mutual_fund">Mutual Fund</option>
                        <option value="sip">SIP</option>
                        <option value="crypto">Cryptocurrency</option>
                        <option value="fd">Fixed Deposit</option>
                        <option value="rd">Recurring Deposit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="purchase_date" className="text-sm font-medium">Purchase Date</label>
                      <Input
                        id="purchase_date"
                        name="purchase_date"
                        type="date"
                        value={newInvestment.purchase_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Investment Name</label>
                    <Input
                      id="name"
                      name="name"
                      value={newInvestment.name}
                      onChange={handleInputChange}
                      placeholder="e.g., HDFC Bank, Nifty Index Fund"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium">Amount (₹)</label>
                    <Input
                      id="amount"
                      name="amount"
                      value={newInvestment.amount}
                      onChange={handleInputChange}
                      placeholder="e.g., 10000"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={newInvestment.notes}
                      onChange={handleInputChange}
                      placeholder="Any additional details about this investment"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit">Add Investment</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Summary Cards */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <BadgeDollarSign className="h-5 w-5 text-primary" />
                  <CardTitle>Total Invested</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{investmentTotal.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">Across {investments.length} investments</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  <CardTitle>Portfolio Allocation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="h-[120px]">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`₹${value}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No investments yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Landmark className="h-5 w-5 text-primary" />
                  <CardTitle>Link Bank Account</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Connect your bank account for real-time tracking</p>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => document.getElementById('bank-account-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Connect Account
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Investment Tracker */}
          <div className="mb-8">
            <InvestmentTracker />
          </div>
          
          {/* Investment Options */}
          <div className="mb-8">
            <InvestmentOptions />
          </div>
          
          {/* Bank Account Linking */}
          <div id="bank-account-section" className="mb-8">
            <BankAccountLink />
          </div>
          
          {/* Current Investments */}
          <Card className="shadow-md mb-8">
            <CardHeader>
              <CardTitle>Your Investments</CardTitle>
              <CardDescription>View and manage your current investments</CardDescription>
            </CardHeader>
            <CardContent>
              {investments.length === 0 ? (
                <div className="text-center py-10">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No investments yet</h3>
                  <p className="text-muted-foreground mb-4">Start building your portfolio by adding your first investment</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Investment
                  </Button>
                </div>
              ) : (
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid grid-cols-7 mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="stock">Stocks</TabsTrigger>
                    <TabsTrigger value="mutual_fund">Mutual Funds</TabsTrigger>
                    <TabsTrigger value="sip">SIPs</TabsTrigger>
                    <TabsTrigger value="crypto">Crypto</TabsTrigger>
                    <TabsTrigger value="fd">FDs</TabsTrigger>
                    <TabsTrigger value="rd">RDs</TabsTrigger>
                  </TabsList>
                  
                  {["all", "stock", "mutual_fund", "sip", "crypto", "fd", "rd"].map((type) => (
                    <TabsContent key={type} value={type} className="space-y-4">
                      <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="px-4 py-3 text-left">Type</th>
                              <th className="px-4 py-3 text-left">Name</th>
                              <th className="px-4 py-3 text-left">Purchase Date</th>
                              <th className="px-4 py-3 text-right">Amount</th>
                              <th className="px-4 py-3 text-left">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {investments
                              .filter(inv => type === "all" || inv.type === type)
                              .map((investment) => (
                                <tr key={investment.id} className="border-t hover:bg-muted/30">
                                  <td className="px-4 py-3">
                                    <span className="px-2 py-1 rounded-full text-xs bg-muted">
                                      {investment.type.replace('_', ' ')}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-medium">{investment.name}</td>
                                  <td className="px-4 py-3">
                                    {new Date(investment.purchase_date).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-3 text-right font-medium">₹{Number(investment.amount).toLocaleString()}</td>
                                  <td className="px-4 py-3 text-muted-foreground">
                                    {investment.notes || "-"}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
