import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowDown, ArrowUp, LineChart, PieChart, DollarSign, TrendingUp, Wallet, Plus, ArrowRight, Trash2, Search, Calendar } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    transactions, 
    loading: txLoading, 
    addTransaction, 
    dateRange, 
    setDateRange, 
    fetchTransactions,
    financialSummary 
  } = useTransactions();
  
  const [addIncomeOpen, setAddIncomeOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [datePickerRange, setDatePickerRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (datePickerRange?.from && datePickerRange?.to) {
      setDateRange({
        start: datePickerRange.from,
        end: datePickerRange.to
      });
    }
  }, [datePickerRange, setDateRange]);

  const handleResetData = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'reset',
        description: `Reset financial data`
      });
      
      fetchTransactions();
      
      toast.success("All data has been reset successfully", {
        className: "bg-green-100 text-green-800 border-green-200",
      });
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error("Failed to reset data", {
        className: "bg-red-100 text-red-800 border-red-200",
      });
    }
  };

  const expensesByCategory = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, tx) => {
      const category = tx.category;
      if (!acc[category]) acc[category] = 0;
      acc[category] += Number(tx.amount);
      return acc;
    }, {} as Record<string, number>);

  const expensesPieData = Object.keys(expensesByCategory).map(category => ({
    name: category,
    value: expensesByCategory[category]
  }));

  const incomeByCategory = transactions
    .filter(tx => tx.type === 'income')
    .reduce((acc, tx) => {
      const category = tx.category;
      if (!acc[category]) acc[category] = 0;
      acc[category] += Number(tx.amount);
      return acc;
    }, {} as Record<string, number>);

  const incomePieData = Object.keys(incomeByCategory).map(category => ({
    name: category,
    value: incomeByCategory[category]
  }));

  const trendsData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return format(date, 'yyyy-MM-dd');
    });
    
    const dateMap = last30Days.reduce((acc, date) => {
      acc[date] = { date, income: 0, expenses: 0 };
      return acc;
    }, {} as Record<string, { date: string; income: number; expenses: number }>);
    
    transactions.forEach(tx => {
      const date = tx.transaction_date.split('T')[0];
      if (dateMap[date]) {
        if (tx.type === 'income') {
          dateMap[date].income += Number(tx.amount);
        } else {
          dateMap[date].expenses += Number(tx.amount);
        }
      }
    });
    
    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  const { income: totalIncome, expenses: totalExpenses, balance } = financialSummary;

  if (authLoading || txLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold mb-2 md:mb-0 bg-gradient-to-r from-primary to-blue-600 text-transparent bg-clip-text">Dashboard</h1>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setAddIncomeOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Income
              </Button>
              
              <Button 
                onClick={() => setAddExpenseOpen(true)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Expense
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleResetData}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Reset Data
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <DateRangePicker 
                dateRange={datePickerRange}
                onDateRangeChange={setDatePickerRange}
              />
              <div className="text-sm text-muted-foreground">
                Filter transactions by date range
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="overflow-hidden shadow-lg border-t-4 border-t-green-500 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Income</h3>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold">₹{totalIncome.toLocaleString()}</div>
                <div className="mt-2 text-sm text-green-600 flex items-center">
                  <div className="flex items-center justify-center p-1 bg-green-100 rounded-full mr-2">
                    <Plus className="h-3 w-3" />
                  </div>
                  <span>From {transactions.filter(t => t.type === 'income').length} transactions</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden shadow-lg border-t-4 border-t-red-500 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold">₹{totalExpenses.toLocaleString()}</div>
                <div className="mt-2 text-sm text-red-600 flex items-center">
                  <div className="flex items-center justify-center p-1 bg-red-100 rounded-full mr-2">
                    <Minus className="h-3 w-3" />
                  </div>
                  <span>From {transactions.filter(t => t.type === 'expense').length} transactions</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden shadow-lg border-t-4 border-t-blue-500 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Current Balance</h3>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className={`text-3xl font-bold ${balance < 0 ? 'text-red-600' : ''}`}>
                  ₹{balance.toLocaleString()}
                </div>
                <div className={`mt-2 text-sm flex items-center ${balance < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  {balance >= 0 ? (
                    <>
                      <div className="flex items-center justify-center p-1 bg-blue-100 rounded-full mr-2">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                      <span>Positive balance</span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center p-1 bg-red-100 rounded-full mr-2">
                        <TrendingDown className="h-3 w-3" />
                      </div>
                      <span>Negative balance</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Your income and expenses over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {trendsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4ade80" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f87171" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => {
                          return format(new Date(date), "dd/MM");
                        }}
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <YAxis 
                        tickFormatter={(value) => `₹${value}`}
                        tick={{ fontSize: 12 }}
                      />
                      <RechartsTooltip 
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                        labelFormatter={(date) => format(new Date(date), "MMM dd, yyyy")}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 10 }} />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        name="Income" 
                        stroke="#4ade80" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#incomeGradient)" 
                        activeDot={{ r: 6 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        name="Expenses" 
                        stroke="#f87171" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#expenseGradient)" 
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center flex-col">
                    <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No transaction data to display</p>
                    <p className="text-sm text-muted-foreground">Add transactions to see your trends</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>Expenses Breakdown</CardTitle>
                <CardDescription>Where your money is going</CardDescription>
              </CardHeader>
              <CardContent>
                {expensesPieData.length > 0 ? (
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={expensesPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {expensesPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center flex-col">
                    <PieChart className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No expense data to display</p>
                    <p className="text-sm text-muted-foreground">Add expenses to see your breakdown</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activities</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/transactions')}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="font-medium">{tx.description || tx.category}</div>
                        <div className="flex items-center">
                          <div className="text-sm text-muted-foreground mr-2">{
                            format(new Date(tx.transaction_date), "MMM dd, yyyy")
                          }</div>
                          <div className="text-xs px-2 py-0.5 rounded-full bg-muted">{tx.category}</div>
                        </div>
                      </div>
                      <div className={`font-semibold ${tx.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                        {tx.type === 'expense' ? '-' : '+'}₹{Number(tx.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No transactions found. Add income or expenses to get started.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          <AddTransactionDialog 
            open={addIncomeOpen} 
            onOpenChange={setAddIncomeOpen}
            type="income" 
          />
          
          <AddTransactionDialog 
            open={addExpenseOpen} 
            onOpenChange={setAddExpenseOpen}
            type="expense" 
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function Minus({ className }: { className?: string }) {
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
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrendingDown({ className }: { className?: string }) {
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
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
