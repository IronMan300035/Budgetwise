import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useBudgets } from "@/hooks/useBudgets";
import { useTransactions } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LiveCryptoChart } from "@/components/LiveCryptoChart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Plus, AlertTriangle, Check, ArrowRight, PiggyBank, Wallet, CreditCard, ShoppingCart, Pencil, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function Budget() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { budgets, loading: budgetsLoading, addBudget, updateBudget, deleteBudget } = useBudgets();
  const { transactions, getTransactionSummary } = useTransactions();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);
  
  const resetForm = () => {
    setCategory("");
    setAmount("");
    setPeriod("monthly");
  };
  
  const handleAddBudget = async () => {
    if (!category || !amount) return;
    
    await addBudget({
      category,
      amount: parseFloat(amount),
      period
    });
    
    resetForm();
    setIsAddOpen(false);
  };
  
  const handleEditBudget = async () => {
    if (!editingBudget || !category || !amount) return;
    
    await updateBudget(editingBudget.id, {
      category,
      amount: parseFloat(amount),
      period
    });
    
    setEditingBudget(null);
    setIsEditOpen(false);
  };
  
  const openEditDialog = (budget: any) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setAmount(budget.amount.toString());
    setPeriod(budget.period);
    setIsEditOpen(true);
  };
  
  const getBudgetUsage = (budgetItem: any) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    let filteredTransactions = transactions.filter(tx => 
      tx.type === 'expense' && 
      tx.category === budgetItem.category
    );
    
    if (budgetItem.period === 'monthly') {
      filteredTransactions = filteredTransactions.filter(tx => {
        const txDate = new Date(tx.transaction_date);
        return (
          txDate.getMonth() + 1 === currentMonth &&
          txDate.getFullYear() === currentYear
        );
      });
    } else {
      filteredTransactions = filteredTransactions.filter(tx => {
        const txDate = new Date(tx.transaction_date);
        return txDate.getFullYear() === currentYear;
      });
    }
    
    const used = filteredTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    return {
      used,
      percentage: Math.round((used / Number(budgetItem.amount)) * 100),
      remaining: Number(budgetItem.amount) - used
    };
  };
  
  const expenseCategories = [
    "Housing", "Transportation", "Food", "Utilities", "Insurance",
    "Medical", "Entertainment", "Personal", "Education", "Savings", "Debt", "Other"
  ];
  
  if (authLoading || budgetsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Loading budgets...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Budget Manager</h1>
            <p className="text-muted-foreground">Monitor and manage your spending limits</p>
          </div>
          
          <Button 
            onClick={() => setIsAddOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-1" /> Create Budget
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {budgets.length === 0 ? (
            <Card className="col-span-1 md:col-span-2 lg:col-span-3 overflow-hidden shadow-lg">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <PieChart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Budgets Created</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Start managing your finances by creating budget categories for your expenses.
                </p>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Create Your First Budget
                </Button>
              </CardContent>
            </Card>
          ) : (
            budgets.map(budget => {
              const usage = getBudgetUsage(budget);
              const isOverBudget = usage.percentage > 100;
              const isCloseToLimit = usage.percentage >= 90 && usage.percentage <= 100;
              
              return (
                <Card 
                  key={budget.id} 
                  className={`overflow-hidden shadow-lg hover:shadow-xl transition-shadow
                    ${isOverBudget ? 'border-red-500' : ''}
                    ${isCloseToLimit ? 'border-yellow-500' : ''}
                  `}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{budget.category}</CardTitle>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => openEditDialog(budget)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-100"
                          onClick={() => deleteBudget(budget.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {budget.period === 'monthly' ? 'Monthly' : 'Yearly'} Budget
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            ₹{usage.used.toLocaleString()} of ₹{Number(budget.amount).toLocaleString()}
                          </span>
                          <span 
                            className={`text-sm font-medium
                              ${isOverBudget ? 'text-red-500' : ''}
                              ${isCloseToLimit ? 'text-yellow-500' : ''}
                            `}
                          >
                            {usage.percentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full
                              ${isOverBudget ? 'bg-red-500' : ''}
                              ${isCloseToLimit ? 'bg-yellow-500' : 'bg-green-500'}
                            `} 
                            style={{ width: `${Math.min(usage.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isOverBudget ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-500">
                              Over budget by ₹{Math.abs(usage.remaining).toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-500">
                              ₹{usage.remaining.toLocaleString()} remaining
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 text-xs text-muted-foreground">
                    Last updated on {format(new Date(budget.updated_at), "MMM dd, yyyy")}
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Cryptocurrency Markets</h2>
          <LiveCryptoChart />
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>
                Set a spending limit for a specific category.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget-category" className="text-right">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="budget-category" className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget-amount" className="text-right">
                  Amount (₹)
                </Label>
                <Input
                  id="budget-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget-period" className="text-right">
                  Period
                </Label>
                <Select value={period} onValueChange={(value) => setPeriod(value as "monthly" | "yearly")}>
                  <SelectTrigger id="budget-period" className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddBudget}>Create Budget</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Budget</DialogTitle>
              <DialogDescription>
                Update your budget settings.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-budget-category" className="text-right">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="edit-budget-category" className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-budget-amount" className="text-right">
                  Amount (₹)
                </Label>
                <Input
                  id="edit-budget-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-budget-period" className="text-right">
                  Period
                </Label>
                <Select value={period} onValueChange={(value) => setPeriod(value as "monthly" | "yearly")}>
                  <SelectTrigger id="edit-budget-period" className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEditBudget}>Update Budget</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
}
