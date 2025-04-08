
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Activity, Calendar, Clock, FileText, BarChart4, Wallet, Search, UserRound } from "lucide-react";

export default function ActivityLog() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { logs, loading: logsLoading } = useActivityLogs();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);
  
  const getActivityIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'transaction':
        return <Wallet className="h-4 w-4" />;
      case 'investment':
        return <BarChart4 className="h-4 w-4" />;
      case 'login':
        return <UserRound className="h-4 w-4" />;
      case 'logout':
        return <UserRound className="h-4 w-4" />;
      case 'budget':
        return <FileText className="h-4 w-4" />;
      case 'banking':
        return <Wallet className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch(type.toLowerCase()) {
      case 'transaction':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case 'investment':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case 'login':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case 'logout':
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case 'budget':
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case 'banking':
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };
  
  const filteredLogs = logs
    .filter(log => {
      // Filter by tab
      if (activeTab !== "all" && log.activity_type.toLowerCase() !== activeTab) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm && !log.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  
  if (authLoading || logsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Loading activity logs...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            Activity Log
          </h1>
          
          <Card className="overflow-hidden shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Your Activity History</CardTitle>
              <CardDescription>Track your actions across the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                  <TabsList className="grid grid-cols-3 sm:grid-cols-6">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="transaction">Transactions</TabsTrigger>
                    <TabsTrigger value="investment">Investments</TabsTrigger>
                    <TabsTrigger value="budget">Budgets</TabsTrigger>
                    <TabsTrigger value="login">Logins</TabsTrigger>
                    <TabsTrigger value="banking">Banking</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search activities..."
                    className="w-full pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {filteredLogs.length === 0 ? (
                <div className="py-10 text-center">
                  <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Activity Found</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    {searchTerm || activeTab !== "all"
                      ? "Try adjusting your search or filters"
                      : "As you use the app, your activities will appear here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                  {filteredLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className={`rounded-full p-2 ${getTypeColor(log.activity_type)}`}>
                        {getActivityIcon(log.activity_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-1">
                          <div className="font-medium">{log.description}</div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {format(new Date(log.created_at), "MMM dd, yyyy")} at {format(new Date(log.created_at), "h:mm a")}
                          </div>
                        </div>
                        <div className="mt-1">
                          <Badge variant="outline" className={`${getTypeColor(log.activity_type)} border-none`}>
                            {log.activity_type}
                          </Badge>
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
