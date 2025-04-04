
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useInvestments } from "@/hooks/useInvestments";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { MonthlyTrendsChart } from "@/components/MonthlyTrendsChart";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowRight, ArrowUpRight, CreditCard, DollarSign, IndianRupee, LineChart as LineChartIcon, PiggyBank, Plus, RefreshCw, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// Dashboard
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { transactions, financialSummary, fetchTransactions } = useTransactions();
  const { budgets } = useBudgets();
  const { investments, getInvestmentTotal } = useInvestments();
  const { logs } = useActivityLogs();
  
  // Dialog state for adding transactions
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);
  
  // Calculate recent transactions
  const recentTransactions = useMemo(() => {
    return transactions
      .slice(0, 5)
      .map(transaction => ({
        ...transaction,
        formattedDate: format(new Date(transaction.transaction_date), "MMM dd, yyyy")
      }));
  }, [transactions]);
  
  // Prepare expense data for pie chart
  const expensesByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = transaction.category;
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += Number(transaction.amount);
      });
    
    return Object.keys(categories).map(category => ({
      name: category,
      value: categories[category]
    }));
  }, [transactions]);
  
  // Colors for the pie chart
  const EXPENSE_COLORS = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", 
    "#FF9F40", "#8AC24A", "#EA80FC", "#607D8B", "#E57373"
  ];

  // Reset dashboard data function
  const resetDashboard = async () => {
    setIsResetting(true);
    try {
      // Refetch transactions to reset data
      await fetchTransactions();
      toast.success("Dashboard has been reset successfully", {
        className: "bg-green-100 text-green-800 border-green-200",
      });
    } catch (error) {
      toast.error("Failed to reset dashboard", {
        className: "bg-red-100 text-red-800 border-red-200",
      });
    } finally {
      setIsResetting(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Dashboard</h1>
            <p className="text-muted-foreground">Welcome back to your financial overview</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Button 
              onClick={() => setIsAddIncomeOpen(true)} 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Income
            </Button>
            <Button 
              onClick={() => setIsAddExpenseOpen(true)} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Expense
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  disabled={isResetting}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isResetting ? 'animate-spin' : ''}`} /> 
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Dashboard</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset the dashboard to its default state. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetDashboard}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-green-800 dark:text-green-300">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                  ₹{financialSummary.income.toLocaleString()}
                </div>
                <div className="h-10 w-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-700 dark:text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-red-800 dark:text-red-300">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                  ₹{financialSummary.expenses.toLocaleString()}
                </div>
                <div className="h-10 w-10 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-700 dark:text-red-300" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-blue-800 dark:text-blue-300">Net Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  ₹{financialSummary.balance.toLocaleString()}
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Monthly Trends and Expenses Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <MonthlyTrendsChart />
          </div>
          
          {/* Expense Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Distribution</CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No expense data to display</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Transactions */}
        <div className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activities</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/transactions")}>
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${
                          transaction.type === "income" 
                            ? "bg-green-100 dark:bg-green-900/30" 
                            : "bg-red-100 dark:bg-red-900/30"
                        }`}>
                          {transaction.type === "income" 
                            ? <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" /> 
                            : <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{transaction.category}</p>
                          <p className="text-sm text-muted-foreground">{transaction.formattedDate}</p>
                        </div>
                      </div>
                      <div className={`font-medium ${
                        transaction.type === "income" 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-red-600 dark:text-red-400"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}₹{Number(transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
      
      {/* Transaction Dialogs */}
      <AddTransactionDialog 
        open={isAddIncomeOpen} 
        onOpenChange={setIsAddIncomeOpen} 
        type="income" 
      />
      
      <AddTransactionDialog 
        open={isAddExpenseOpen} 
        onOpenChange={setIsAddExpenseOpen} 
        type="expense" 
      />
    </div>
  );
}
