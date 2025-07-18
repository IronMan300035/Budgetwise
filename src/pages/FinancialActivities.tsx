
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search,
  Calendar,
  Clock,
  RefreshCw,
  Filter
} from "lucide-react";

export default function FinancialActivities() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    transactions, 
    loading: transactionsLoading, 
    dateRange, 
    setDateRange,
    refreshTransactions
  } = useTransactions();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range ? { start: range.from || null, end: range.to || null } : { start: null, end: null });
  };
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);
  
  // Filter transactions by search term and type
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      activeTab === "all" || 
      (activeTab === "income" && transaction.type === "income") ||
      (activeTab === "expense" && transaction.type === "expense");
    
    return matchesSearch && matchesType;
  });
  
  // Set up real-time refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        refreshTransactions();
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [user, refreshTransactions]);

  if (authLoading || transactionsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Loading financial activities...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-3xl font-bold mb-4 md:mb-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Financial Activities
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => refreshTransactions()}
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
              
              <DateRangePicker 
                dateRange={dateRange ? {
                  from: dateRange.start ? new Date(dateRange.start) : undefined,
                  to: dateRange.end ? new Date(dateRange.end) : undefined
                } : undefined} 
                onDateRangeChange={handleDateRangeChange} 
              />
            </div>
          </div>
          
          <Card className="overflow-hidden shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your financial activities</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search transactions..."
                    className="w-full pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="income">Income</TabsTrigger>
                    <TabsTrigger value="expense">Expenses</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {filteredTransactions.length === 0 ? (
                <div className="py-10 text-center">
                  <RefreshCw className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Transactions Found</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    {searchTerm || dateRange?.start || dateRange?.end 
                      ? "Try adjusting your search or date filters"
                      : "Add your first transaction to get started"}
                  </p>
                  {searchTerm || dateRange?.start || dateRange?.end ? (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("");
                        setDateRange({ start: null, end: null });
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                  {filteredTransactions.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className={`rounded-full p-2 ${
                        transaction.type === "income" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}>
                        {transaction.type === "income" 
                          ? <ArrowUpRight className="h-4 w-4" /> 
                          : <ArrowDownLeft className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-1">
                          <div>
                            <div className="font-medium">{transaction.category}</div>
                            <div className="text-sm text-muted-foreground">{transaction.description || "No description"}</div>
                          </div>
                          <div className={`font-mono font-medium ${
                            transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          }`}>
                            {transaction.type === "income" ? "+" : "-"}
                            {transaction.displayAmount
                              ? transaction.displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            }
                          </div>
                        </div>
                        <div className="mt-1 flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {format(new Date(transaction.date), "MMM dd, yyyy")}
                          <span className="mx-2">•</span>
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {format(new Date(transaction.created_at), "h:mm a")}
                        </div>
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
    </div>
  );
}
