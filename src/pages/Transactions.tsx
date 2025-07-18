import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { Plus, Search, Filter, ArrowDownUp, Trash2, Edit, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Transactions() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    transactions, 
    loading: txLoading, 
    deleteTransaction, 
    dateRange, 
    setDateRange,
    refreshTransactions
  } = useTransactions();
  const [addIncomeOpen, setAddIncomeOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "date",
    direction: "desc"
  });
  const [datePickerRange, setDatePickerRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
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
  
  useEffect(() => {
    refreshTransactions();
    
    const intervalId = setInterval(() => {
      refreshTransactions();
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, [refreshTransactions]);
  
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions',
      }, (payload) => {
        console.log('Transaction change detected:', payload);
        refreshTransactions();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshTransactions]);
  
  const filteredTransactions = transactions.filter(tx => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tx.description?.toLowerCase().includes(searchLower) ||
      tx.category.toLowerCase().includes(searchLower) ||
      tx.amount.toString().includes(searchTerm)
    );
  });
  
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy.field === "date") {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortBy.direction === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    }
    
    if (sortBy.field === "amount") {
      return sortBy.direction === "asc" ? a.amount - b.amount : b.amount - a.amount;
    }
    
    if (sortBy.field === "category") {
      return sortBy.direction === "asc" 
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    }
    
    return 0;
  });
  
  const handleSort = (field: string) => {
    setSortBy({
      field,
      direction: sortBy.field === field && sortBy.direction === "asc" ? "desc" : "asc"
    });
  };
  
  const handleTransactionAdded = () => {
    refreshTransactions();
  };
  
  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
    refreshTransactions();
  };
  
  if (authLoading || txLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Loading transactions...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold mb-2 md:mb-0 bg-gradient-to-r from-primary to-blue-600 text-transparent bg-clip-text">Transactions</h1>
            
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
                onClick={() => refreshTransactions()}
                variant="outline"
                className="border-blue-300 hover:bg-blue-50"
              >
                <Loader2 className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </div>
          </div>
          
          <Card className="overflow-hidden shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View, filter, and manage your financial transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search transactions..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <DateRangePicker 
                  dateRange={datePickerRange}
                  onDateRangeChange={setDatePickerRange}
                />
              </div>
              
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th 
                          className="px-4 py-3 text-left cursor-pointer hover:bg-muted"
                          onClick={() => handleSort("date")}
                        >
                          <div className="flex items-center">
                            Date
                            {sortBy.field === "date" && (
                              <ArrowDownUp 
                                className={`h-3 w-3 ml-1 ${sortBy.direction === "desc" ? "rotate-180" : ""}`} 
                              />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left">Description</th>
                        <th 
                          className="px-4 py-3 text-left cursor-pointer hover:bg-muted"
                          onClick={() => handleSort("category")}
                        >
                          <div className="flex items-center">
                            Category
                            {sortBy.field === "category" && (
                              <ArrowDownUp 
                                className={`h-3 w-3 ml-1 ${sortBy.direction === "desc" ? "rotate-180" : ""}`} 
                              />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-right cursor-pointer hover:bg-muted"
                          onClick={() => handleSort("amount")}
                        >
                          <div className="flex items-center justify-end">
                            Amount
                            {sortBy.field === "amount" && (
                              <ArrowDownUp 
                                className={`h-3 w-3 ml-1 ${sortBy.direction === "desc" ? "rotate-180" : ""}`} 
                              />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                            No transactions found. Use the buttons above to add income or expenses.
                          </td>
                        </tr>
                      ) : (
                        sortedTransactions.map((tx) => (
                          <tr key={tx.id} className="border-t hover:bg-muted/30">
                            <td className="px-4 py-3">
                              {format(new Date(tx.date), "MMM dd, yyyy")}
                            </td>
                            <td className="px-4 py-3">
                              {tx.description || tx.category}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 rounded-full text-xs bg-muted">{tx.category}</span>
                            </td>
                            <td className={`px-4 py-3 text-right font-medium ${tx.type === "expense" ? "text-red-500" : "text-green-500"}`}>
                              {tx.type === "expense" ? "-" : "+"}₹{Number(tx.amount).toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {}}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-100"
                                  onClick={() => handleDeleteTransaction(tx.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <AddTransactionDialog 
            open={addIncomeOpen} 
            onOpenChange={setAddIncomeOpen}
            type="income" 
            onSuccess={handleTransactionAdded}
          />
          
          <AddTransactionDialog 
            open={addExpenseOpen} 
            onOpenChange={setAddExpenseOpen}
            type="expense" 
            onSuccess={handleTransactionAdded}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
