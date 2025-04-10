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
import { format, parseISO, startOfMonth, endOfMonth, isSameMonth, subMonths } from "date-fns";
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
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    transactions, 
    financialSummary, 
    fetchTransactions, 
    setDateRange, 
    refreshTransactions
  } = useTransactions();
  const { budgets, fetchBudgets } = useBudgets();
  const { investments, getInvestmentTotal, fetchInvestments } = useInvestments();
  const { logs, fetchLogs } = useActivityLogs();
  
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [previousMonthSummary, setPreviousMonthSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);
  
  useEffect(() => {
    const handleAddIncome = () => setIsAddIncomeOpen(true);
    document.addEventListener('budgetwise:add-income', handleAddIncome);
    
    const handleAddExpense = () => setIsAddExpenseOpen(true);
    document.addEventListener('budgetwise:add-expense', handleAddExpense);
    
    const handleResetDashboard = () => resetDashboard();
    document.addEventListener('budgetwise:reset-dashboard', handleResetDashboard);
    
    return () => {
      document.removeEventListener('budgetwise:add-income', handleAddIncome);
      document.removeEventListener('budgetwise:add-expense', handleAddExpense);
      document.removeEventListener('budgetwise:reset-dashboard', handleResetDashboard);
    };
  }, []);
  
  useEffect(() => {
    refreshTransactions();
    fetchInvestments();
    
    const fetchPreviousMonthData = async () => {
      if (!user) return;
      
      const lastMonth = subMonths(new Date(), 1);
      const startDate = startOfMonth(lastMonth);
      const endDate = endOfMonth(lastMonth);
      
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .gte('transaction_date', format(startDate, 'yyyy-MM-dd'))
          .lte('transaction_date', format(endDate, 'yyyy-MM-dd'));
          
        if (error) throw error;
        
        if (data) {
          const income = data.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
          const expenses = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
          
          setPreviousMonthSummary({
            income,
            expenses,
            balance: income - expenses
          });
        }
      } catch (error) {
        console.error("Error fetching previous month data:", error);
      }
    };
    
    fetchPreviousMonthData();
    
    const intervalId = setInterval(() => {
      refreshTransactions();
      fetchInvestments();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  const recentTransactions = useMemo(() => {
    return transactions
      .slice(0, 5)
      .map(transaction => ({
        ...transaction,
        formattedDate: format(new Date(transaction.transaction_date), "MMM dd, yyyy")
      }));
  }, [transactions]);
  
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
  
  const totalInvestments = useMemo(() => {
    return getInvestmentTotal();
  }, [investments, getInvestmentTotal]);
  
  const netWorth = useMemo(() => {
    return financialSummary.balance - totalInvestments;
  }, [financialSummary.balance, totalInvestments]);
  
  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  const incomeChange = calculatePercentChange(financialSummary.income, previousMonthSummary.income);
  const expenseChange = calculatePercentChange(financialSummary.expenses, previousMonthSummary.expenses);
  const balanceChange = calculatePercentChange(financialSummary.balance, previousMonthSummary.balance);
  
  const EXPENSE_COLORS = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", 
    "#FF9F40", "#8AC24A", "#EA80FC", "#607D8B", "#E57373"
  ];

  const resetDashboard = async () => {
    if (!user) return;
    
    setIsResetting(true);
    try {
      const { error: transactionError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);
      
      if (transactionError) throw transactionError;
      
      const { error: budgetError } = await supabase
        .from('budgets')
        .delete()
        .eq('user_id', user.id);
      
      if (budgetError) throw budgetError;
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'system',
        description: 'Reset dashboard data'
      });
      
      await Promise.all([
        fetchTransactions(),
        fetchBudgets(),
        fetchInvestments(),
        fetchLogs()
      ]);
      
      setDateRange({
        start: null,
        end: null,
      });
      
      toast.success("Dashboard has been reset successfully", {
        className: "bg-green-100 text-green-800 border-green-200",
      });
    } catch (error) {
      console.error("Error resetting dashboard:", error);
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
  
  const handleAddTransaction = (type: 'income' | 'expense') => {
    if (type === 'income') {
      setIsAddIncomeOpen(false);
    } else {
      setIsAddExpenseOpen(false);
    }
    setTimeout(() => {
      refreshTransactions();
      fetchInvestments();
    }, 300);
  };
  
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
                    This will delete all your transactions, budgets and reset your dashboard to its initial state. This action cannot be undone.
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-green-800 dark:text-green-300">Total Income</CardTitle>
              {incomeChange !== 0 && (
                <div className={`text-xs flex items-center ${incomeChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {incomeChange > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(incomeChange).toFixed(1)}% from last month
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-2xl font-bold text-green-800 dark:text-green-200 mb-1">
                  ₹{financialSummary.income.toLocaleString()}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="h-10 w-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-700 dark:text-green-300" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="block">Monthly target: ₹{(financialSummary.income * 1.1).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                    <span className="block">Top source: Salary</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-red-800 dark:text-red-300">Total Expenses</CardTitle>
              {expenseChange !== 0 && (
                <div className={`text-xs flex items-center ${expenseChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {expenseChange < 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(expenseChange).toFixed(1)}% from last month
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-2xl font-bold text-red-800 dark:text-red-200 mb-1">
                  ₹{financialSummary.expenses.toLocaleString()}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="h-10 w-10 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-red-700 dark:text-red-300" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="block">Budget limit: ₹{(financialSummary.income * 0.7).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                    <span className="block">Investments: ₹{totalInvestments.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`${
            financialSummary.balance >= 0 
              ? "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-900/50" 
              : "bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-900/50"
          }`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-base font-medium ${
                financialSummary.balance >= 0 
                  ? "text-blue-800 dark:text-blue-300"
                  : "text-red-800 dark:text-red-300"
              }`}>
                Net Balance {financialSummary.balance < 0 && "(Negative)"}
              </CardTitle>
              {balanceChange !== 0 && (
                <div className={`text-xs flex items-center ${balanceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {balanceChange > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(balanceChange).toFixed(1)}% from last month
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className={`text-2xl font-bold mb-1 ${
                  financialSummary.balance >= 0 
                    ? "text-blue-800 dark:text-blue-200"
                    : "text-red-800 dark:text-red-200"
                }`}>
                  {financialSummary.balance < 0 ? '-' : ''}₹{Math.abs(financialSummary.balance).toLocaleString()}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    financialSummary.balance >= 0 
                      ? "bg-blue-200 dark:bg-blue-800" 
                      : "bg-red-200 dark:bg-red-800"
                  }`}>
                    <Wallet className={`h-5 w-5 ${
                      financialSummary.balance >= 0 
                        ? "text-blue-700 dark:text-blue-300" 
                        : "text-red-700 dark:text-red-300"
                    }`} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="block">Net worth: ₹{netWorth.toLocaleString()}</span>
                    <span className="block">Savings rate: {financialSummary.income > 0 ? ((financialSummary.balance / financialSummary.income) * 100).toFixed(1) : 0}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <MonthlyTrendsChart key={transactions.length} />
          </div>
          
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
        
        <div className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Recent Transactions</h3>
                <CardDescription>Your latest financial activities</CardDescription>
              </div>
              <Link 
                to="/financial-activities" 
                className="text-sm text-primary hover:underline flex items-center"
              >
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
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
      
      <AddTransactionDialog 
        open={isAddIncomeOpen} 
        onOpenChange={setIsAddIncomeOpen} 
        type="income" 
        onSuccess={() => handleAddTransaction('income')}
      />
      
      <AddTransactionDialog 
        open={isAddExpenseOpen} 
        onOpenChange={setIsAddExpenseOpen} 
        type="expense" 
        onSuccess={() => handleAddTransaction('expense')}
      />
    </div>
  );
}
