
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MonthlyTrendsChart } from "@/components/MonthlyTrendsChart";
import { DateRangePicker } from "@/components/DateRangePicker";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  FileSpreadsheet,
  Plus,
  Edit,
  Trash2,
  Download,
  FileText,
  FilePdf,
  FileUp,
  Check,
  X,
  Calendar as CalendarIcon
} from "lucide-react";

interface BudgetSheet {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  transaction_date: string;
  sheet_id: string;
}

export default function BudgetDiary() {
  const { user } = useAuth();
  const [sheets, setSheets] = useState<BudgetSheet[]>([]);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [isAddingSheet, setIsAddingSheet] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [editingSheetName, setEditingSheetName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionFilter, setTransactionFilter] = useState({
    type: "all",
    category: "all",
    date: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date()
    }
  });
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchBudgetSheets();
    }
  }, [user]);
  
  // When active sheet changes, fetch its transactions
  useEffect(() => {
    if (activeSheet) {
      fetchTransactions(activeSheet);
    }
  }, [activeSheet, transactionFilter]);
  
  const fetchBudgetSheets = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // For demonstration, we're simulating fetching from Supabase
      // In a real implementation, this would be an actual Supabase query
      const demoSheets: BudgetSheet[] = [
        {
          id: "1",
          name: "Monthly Budget",
          user_id: user.id,
          created_at: new Date().toISOString(),
          transactions: []
        },
        {
          id: "2",
          name: "Vacation Expenses",
          user_id: user.id,
          created_at: new Date().toISOString(),
          transactions: []
        },
        {
          id: "3",
          name: "Freelance Income",
          user_id: user.id,
          created_at: new Date().toISOString(),
          transactions: []
        }
      ];
      
      setSheets(demoSheets);
      
      // Set the first sheet as active if none is selected
      if (demoSheets.length > 0 && !activeSheet) {
        setActiveSheet(demoSheets[0].id);
      }
    } catch (error) {
      console.error("Error fetching budget sheets:", error);
      toast.error("Failed to load budget sheets");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTransactions = async (sheetId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // For demonstration, simulate fetching transactions for the active sheet
      // Apply filters
      const { from, to } = transactionFilter.date;
      
      // Sample transactions for demo
      const demoTransactions: Transaction[] = [
        {
          id: "t1",
          type: "income",
          amount: 5000,
          category: "Salary",
          description: "Monthly salary",
          transaction_date: new Date(2025, 3, 5).toISOString(),
          sheet_id: sheetId
        },
        {
          id: "t2",
          type: "expense",
          amount: 1500,
          category: "Rent",
          description: "Monthly rent",
          transaction_date: new Date(2025, 3, 2).toISOString(),
          sheet_id: sheetId
        },
        {
          id: "t3",
          type: "expense",
          amount: 400,
          category: "Groceries",
          description: "Weekly groceries",
          transaction_date: new Date(2025, 3, 8).toISOString(),
          sheet_id: sheetId
        },
        {
          id: "t4",
          type: "income",
          amount: 1000,
          category: "Freelance",
          description: "Website project",
          transaction_date: new Date(2025, 3, 15).toISOString(),
          sheet_id: sheetId
        }
      ];
      
      // Apply filtering
      const filteredTransactions = demoTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.transaction_date);
        
        // Filter by transaction type
        if (transactionFilter.type !== "all" && transaction.type !== transactionFilter.type) {
          return false;
        }
        
        // Filter by category
        if (transactionFilter.category !== "all" && transaction.category !== transactionFilter.category) {
          return false;
        }
        
        // Filter by date range
        return (
          (!from || transactionDate >= from) &&
          (!to || transactionDate <= to)
        );
      });
      
      setTransactions(filteredTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateSheet = async () => {
    if (!user || !newSheetName.trim()) return;
    
    setIsLoading(true);
    try {
      // For demonstration, simulate adding a new sheet
      const newSheet: BudgetSheet = {
        id: `new-${Date.now()}`,
        name: newSheetName.trim(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        transactions: []
      };
      
      setSheets([...sheets, newSheet]);
      setActiveSheet(newSheet.id);
      setNewSheetName("");
      setIsAddingSheet(false);
      
      toast.success("Budget sheet created successfully");
    } catch (error) {
      console.error("Error creating budget sheet:", error);
      toast.error("Failed to create budget sheet");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateSheetName = async () => {
    if (!editingSheetId || !editingSheetName.trim()) return;
    
    setIsLoading(true);
    try {
      // For demonstration, simulate updating sheet name
      const updatedSheets = sheets.map(sheet => 
        sheet.id === editingSheetId ? { ...sheet, name: editingSheetName.trim() } : sheet
      );
      
      setSheets(updatedSheets);
      setEditingSheetId(null);
      setEditingSheetName("");
      
      toast.success("Budget sheet renamed successfully");
    } catch (error) {
      console.error("Error updating budget sheet:", error);
      toast.error("Failed to rename budget sheet");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteSheet = async (sheetId: string) => {
    if (!user) return;
    
    if (sheets.length <= 1) {
      toast.error("Cannot delete the only budget sheet");
      return;
    }
    
    setIsLoading(true);
    try {
      // For demonstration, simulate deleting a sheet
      const remainingSheets = sheets.filter(sheet => sheet.id !== sheetId);
      setSheets(remainingSheets);
      
      // If the active sheet was deleted, set the first remaining sheet as active
      if (activeSheet === sheetId && remainingSheets.length > 0) {
        setActiveSheet(remainingSheets[0].id);
      }
      
      toast.success("Budget sheet deleted successfully");
    } catch (error) {
      console.error("Error deleting budget sheet:", error);
      toast.error("Failed to delete budget sheet");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddTransaction = async (data: any) => {
    if (!user || !activeSheet) return;
    
    setIsLoading(true);
    try {
      // For demonstration, simulate adding a transaction
      const newTransaction: Transaction = {
        id: `new-${Date.now()}`,
        type: data.type,
        amount: parseFloat(data.amount),
        category: data.category,
        description: data.description || "",
        transaction_date: data.date.toISOString(),
        sheet_id: activeSheet
      };
      
      setTransactions([...transactions, newTransaction]);
      setIsAddingTransaction(false);
      
      toast.success("Transaction added successfully");
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditTransaction = async (data: any) => {
    if (!user || !activeSheet || !transactionToEdit) return;
    
    setIsLoading(true);
    try {
      // For demonstration, simulate editing a transaction
      const updatedTransactions = transactions.map(transaction => 
        transaction.id === transactionToEdit.id 
          ? {
              ...transaction,
              type: data.type,
              amount: parseFloat(data.amount),
              category: data.category,
              description: data.description || "",
              transaction_date: data.date.toISOString()
            }
          : transaction
      );
      
      setTransactions(updatedTransactions);
      setTransactionToEdit(null);
      
      toast.success("Transaction updated successfully");
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user || !activeSheet) return;
    
    setIsLoading(true);
    try {
      // For demonstration, simulate deleting a transaction
      const updatedTransactions = transactions.filter(transaction => transaction.id !== transactionId);
      setTransactions(updatedTransactions);
      
      toast.success("Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    } finally {
      setIsLoading(false);
    }
  };
  
  const exportToExcel = () => {
    // In a real implementation, this would generate and download an Excel file
    toast.success("Exporting to Excel...");
    setTimeout(() => {
      toast.success("Budget data exported to Excel successfully");
    }, 1500);
  };
  
  const exportToPDF = () => {
    // In a real implementation, this would generate and download a PDF file
    toast.success("Exporting to PDF...");
    setTimeout(() => {
      toast.success("Budget data exported to PDF successfully");
    }, 1500);
  };
  
  const exportToCSV = () => {
    // In a real implementation, this would generate and download a CSV file
    toast.success("Exporting to CSV...");
    setTimeout(() => {
      toast.success("Budget data exported to CSV successfully");
    }, 1500);
  };
  
  // Calculate summary statistics
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpenses;
  
  // Get unique categories for filtering
  const categories = [...new Set(transactions.map(t => t.category))];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <FileSpreadsheet className="h-6 w-6 mr-2" />
              Budget Diary
            </h1>
            <p className="text-muted-foreground">
              Manage multiple budget sheets for different purposes
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" /> Export
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={exportToExcel}
                  >
                    <FileText className="h-4 w-4 mr-2" /> Excel (.xlsx)
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={exportToPDF}
                  >
                    <FilePdf className="h-4 w-4 mr-2" /> PDF (.pdf)
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={exportToCSV}
                  >
                    <FileUp className="h-4 w-4 mr-2" /> CSV (.csv)
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Dialog open={isAddingSheet} onOpenChange={setIsAddingSheet}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Sheet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Budget Sheet</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sheetName">Sheet Name</Label>
                    <Input
                      id="sheetName"
                      placeholder="e.g., Monthly Budget, Vacation Plan"
                      value={newSheetName}
                      onChange={(e) => setNewSheetName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingSheet(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSheet} disabled={!newSheetName.trim()}>
                    Create Sheet
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {sheets.length > 0 ? (
          <div className="space-y-6">
            <Card>
              <CardHeader className="p-4">
                <div className="overflow-x-auto">
                  <TabsList className="h-12">
                    {sheets.map((sheet) => (
                      <TabsTrigger
                        key={sheet.id}
                        value={sheet.id}
                        className={cn(
                          "h-10 px-4 min-w-[150px] flex items-center justify-between",
                          activeSheet === sheet.id && "pr-2"
                        )}
                        onClick={() => setActiveSheet(sheet.id)}
                      >
                        {editingSheetId === sheet.id ? (
                          <div className="flex-1 flex items-center space-x-2">
                            <Input
                              value={editingSheetName}
                              onChange={(e) => setEditingSheetName(e.target.value)}
                              className="h-7 min-w-[100px]"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleUpdateSheetName();
                                } else if (e.key === "Escape") {
                                  setEditingSheetId(null);
                                }
                                e.stopPropagation();
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateSheetName();
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSheetId(null);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span>{sheet.name}</span>
                            {activeSheet === sheet.id && (
                              <div className="flex items-center ml-2" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    setEditingSheetId(sheet.id);
                                    setEditingSheetName(sheet.name);
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive"
                                  onClick={() => handleDeleteSheet(sheet.id)}
                                  disabled={sheets.length <= 1}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </CardHeader>
            </Card>
            
            {activeSheet && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-xl font-medium">Total Income</h3>
                        <p className="text-2xl font-bold text-green-500 mt-2">₹{totalIncome.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-xl font-medium">Total Expenses</h3>
                        <p className="text-2xl font-bold text-red-500 mt-2">₹{totalExpenses.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-xl font-medium">Balance</h3>
                        <p className={cn(
                          "text-2xl font-bold mt-2",
                          balance >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          ₹{balance.toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle>Transactions</CardTitle>
                      <Button onClick={() => setIsAddingTransaction(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Add Transaction
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <Label htmlFor="typeFilter">Type</Label>
                          <Select 
                            defaultValue="all"
                            onValueChange={(value) => setTransactionFilter(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger id="typeFilter">
                              <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="income">Income</SelectItem>
                              <SelectItem value="expense">Expense</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="categoryFilter">Category</Label>
                          <Select 
                            defaultValue="all"
                            onValueChange={(value) => setTransactionFilter(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger id="categoryFilter">
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {categories.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Date Range</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {transactionFilter.date.from ? (
                                  transactionFilter.date.to ? (
                                    <>
                                      {format(transactionFilter.date.from, "LLL dd, y")} -{" "}
                                      {format(transactionFilter.date.to, "LLL dd, y")}
                                    </>
                                  ) : (
                                    format(transactionFilter.date.from, "LLL dd, y")
                                  )
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="range"
                                selected={transactionFilter.date}
                                onSelect={(range) => setTransactionFilter(prev => ({ ...prev, date: range || { from: new Date(), to: new Date() }}))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div className="rounded-md border">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="text-left p-3">Date</th>
                                <th className="text-left p-3">Type</th>
                                <th className="text-left p-3">Category</th>
                                <th className="text-left p-3">Description</th>
                                <th className="text-right p-3">Amount</th>
                                <th className="text-right p-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {transactions.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-3 text-center text-muted-foreground">
                                    No transactions found. Add a transaction to get started.
                                  </td>
                                </tr>
                              ) : (
                                transactions.map((transaction) => (
                                  <tr key={transaction.id} className="border-t">
                                    <td className="p-3">
                                      {format(new Date(transaction.transaction_date), "dd MMM yyyy")}
                                    </td>
                                    <td className="p-3">
                                      <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium",
                                        transaction.type === "income" 
                                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                      )}>
                                        {transaction.type === "income" ? "Income" : "Expense"}
                                      </span>
                                    </td>
                                    <td className="p-3">{transaction.category}</td>
                                    <td className="p-3">{transaction.description}</td>
                                    <td className="p-3 text-right font-medium">
                                      <span className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                                        {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                                      </span>
                                    </td>
                                    <td className="p-3 text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          onClick={() => {
                                            setTransactionToEdit(transaction);
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          className="text-destructive"
                                          onClick={() => handleDeleteTransaction(transaction.id)}
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
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MonthlyTrendsChart />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileSpreadsheet className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Budget Sheets</h3>
              <p className="text-muted-foreground text-center mb-6">
                You don't have any budget sheets yet. Create your first sheet to start tracking your finances.
              </p>
              <Button onClick={() => setIsAddingSheet(true)}>
                <Plus className="h-4 w-4 mr-2" /> Create Budget Sheet
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
      
      {/* Add Transaction Dialog */}
      <Dialog 
        open={isAddingTransaction || !!transactionToEdit} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingTransaction(false);
            setTransactionToEdit(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {transactionToEdit ? "Edit Transaction" : "Add New Transaction"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="transactionType">Type</Label>
                <Select 
                  defaultValue={transactionToEdit?.type || "expense"}
                >
                  <SelectTrigger id="transactionType">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="transactionAmount">Amount</Label>
                <Input 
                  id="transactionAmount" 
                  type="number" 
                  placeholder="0.00"
                  defaultValue={transactionToEdit?.amount || ""}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="transactionCategory">Category</Label>
              <Select defaultValue={transactionToEdit?.category || ""}>
                <SelectTrigger id="transactionCategory">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salary">Salary</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Investments">Investments</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Groceries">Groceries</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="transactionDate">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {transactionToEdit ? (
                      format(new Date(transactionToEdit.transaction_date), "PPP")
                    ) : (
                      format(new Date(), "PPP")
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="transactionDescription">Description</Label>
              <Input 
                id="transactionDescription" 
                placeholder="Description (optional)"
                defaultValue={transactionToEdit?.description || ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddingTransaction(false);
                setTransactionToEdit(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => {
              // Mock transaction data for demonstration
              const data = {
                type: "income",
                amount: "1000",
                category: "Salary",
                description: "Monthly salary",
                date: new Date()
              };
              
              if (transactionToEdit) {
                handleEditTransaction(data);
              } else {
                handleAddTransaction(data);
              }
            }}>
              {transactionToEdit ? "Update" : "Add"} Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
