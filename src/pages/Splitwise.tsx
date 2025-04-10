import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Split, 
  Plus, 
  Users, 
  UserPlus, 
  CircleDollarSign, 
  Calendar as CalendarIcon, 
  ArrowRight, 
  Check, 
  X, 
  CreditCard, 
  Divide, 
  Receipt
} from "lucide-react";

// Interfaces
interface Friend {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  status: "pending" | "active";
}

interface Group {
  id: string;
  name: string;
  members: Friend[];
  expenses: Expense[];
  created_at: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  payer_id: string;
  date: string;
  group_id?: string;
  splits: Split[];
  settled: boolean;
}

interface Split {
  user_id: string;
  amount: number;
  paid: boolean;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Exchange rate to base currency (INR)
}

export default function Splitwise() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newFriendEmail, setNewFriendEmail] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([
    { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 1 },
    { code: "USD", symbol: "$", name: "US Dollar", rate: 83.12 },
    { code: "EUR", symbol: "€", name: "Euro", rate: 90.51 },
    { code: "GBP", symbol: "£", name: "British Pound", rate: 105.67 },
    { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 0.55 }
  ]);
  const [defaultCurrency, setDefaultCurrency] = useState<string>("INR");
  const [activeTab, setActiveTab] = useState<string>("friends");
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    currency: "INR",
    payer_id: "",
    date: new Date(),
    group_id: "",
    split_type: "equal" as "equal" | "exact" | "percentage",
    splits: [] as Array<{ id: string; amount: string; percentage: string }>,
  });
  const [selectedGroupForExpense, setSelectedGroupForExpense] = useState<string>("");
  const [selectedFriendForExpense, setSelectedFriendForExpense] = useState<string[]>([]);
  
  const splitMethodRef = useRef<HTMLDivElement | null>(null);
  
  const profile = {
    id: user?.id || "current-user",
    email: user?.email || "user@example.com",
    first_name: "You",
    last_name: "",
    avatar_url: "",
    status: "active" as const
  };
  
  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchGroups();
      fetchExpenses();
    }
  }, [user]);
  
  // When adding a new expense, set the current user as the default payer
  useEffect(() => {
    if (user && isAddingExpense) {
      setNewExpense(prev => ({
        ...prev,
        payer_id: user.id
      }));
    }
  }, [isAddingExpense, user]);
  
  // When selecting a group for expense, set the group members for splitting
  useEffect(() => {
    if (selectedGroupForExpense) {
      const group = groups.find(g => g.id === selectedGroupForExpense);
      if (group) {
        const memberIds = group.members.map(m => m.id);
        setSelectedFriendForExpense(memberIds);
        
        // Initialize splits for all group members
        const initialSplits = group.members.map(member => ({
          id: member.id,
          amount: "",
          percentage: ""
        }));
        
        setNewExpense(prev => ({
          ...prev,
          splits: initialSplits
        }));
      }
    }
  }, [selectedGroupForExpense, groups]);
  
  // When selecting individual friends for expense, update splits
  useEffect(() => {
    if (!selectedGroupForExpense && selectedFriendForExpense.length > 0) {
      // Add current user if not already in the list
      if (!selectedFriendForExpense.includes(user?.id || "")) {
        selectedFriendForExpense.push(user?.id || "");
      }
      
      const initialSplits = selectedFriendForExpense.map(id => ({
        id,
        amount: "",
        percentage: ""
      }));
      
      setNewExpense(prev => ({
        ...prev,
        splits: initialSplits
      }));
    }
  }, [selectedFriendForExpense, user?.id, selectedGroupForExpense]);
  
  // Update split amounts when expense amount or split type changes
  useEffect(() => {
    if (newExpense.amount && newExpense.splits.length > 0) {
      updateSplitAmounts();
    }
  }, [newExpense.amount, newExpense.split_type, newExpense.splits.length]);
  
  // Scroll to split method section when it becomes visible
  useEffect(() => {
    if (isAddingExpense && 
        newExpense.description && 
        newExpense.amount && 
        (selectedGroupForExpense || selectedFriendForExpense.length > 0)) {
      setTimeout(() => {
        splitMethodRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isAddingExpense, newExpense.description, newExpense.amount, selectedGroupForExpense, selectedFriendForExpense]);
  
  const fetchFriends = () => {
    // Mock data for demonstration
    setFriends([
      {
        id: "friend-1",
        email: "rohit@example.com",
        first_name: "Rohit",
        last_name: "Sharma",
        avatar_url: "",
        status: "active"
      },
      {
        id: "friend-2",
        email: "priya@example.com",
        first_name: "Priya",
        last_name: "Patel",
        avatar_url: "",
        status: "active"
      },
      {
        id: "friend-3",
        email: "amit@example.com",
        first_name: "Amit",
        last_name: "Kumar",
        avatar_url: "",
        status: "pending"
      }
    ]);
  };
  
  const fetchGroups = () => {
    // Mock data for demonstration
    setGroups([
      {
        id: "group-1",
        name: "Goa Trip",
        members: [
          {
            id: user?.id || "current-user",
            email: user?.email || "user@example.com",
            first_name: "You",
            last_name: "",
            avatar_url: "",
            status: "active"
          },
          {
            id: "friend-1",
            email: "rohit@example.com",
            first_name: "Rohit",
            last_name: "Sharma",
            avatar_url: "",
            status: "active"
          },
          {
            id: "friend-2",
            email: "priya@example.com",
            first_name: "Priya",
            last_name: "Patel",
            avatar_url: "",
            status: "active"
          }
        ],
        expenses: [],
        created_at: new Date().toISOString()
      },
      {
        id: "group-2",
        name: "Monthly Apartment",
        members: [
          {
            id: user?.id || "current-user",
            email: user?.email || "user@example.com",
            first_name: "You",
            last_name: "",
            avatar_url: "",
            status: "active"
          },
          {
            id: "friend-2",
            email: "priya@example.com",
            first_name: "Priya",
            last_name: "Patel",
            avatar_url: "",
            status: "active"
          }
        ],
        expenses: [],
        created_at: new Date().toISOString()
      }
    ]);
  };
  
  const fetchExpenses = () => {
    // Mock data for demonstration
    setExpenses([
      {
        id: "expense-1",
        description: "Dinner at Taj",
        amount: 3600,
        currency: "INR",
        payer_id: user?.id || "current-user",
        date: new Date(2025, 3, 5).toISOString(),
        group_id: "group-1",
        splits: [
          { user_id: user?.id || "current-user", amount: 1200, paid: true },
          { user_id: "friend-1", amount: 1200, paid: false },
          { user_id: "friend-2", amount: 1200, paid: false }
        ],
        settled: false
      },
      {
        id: "expense-2",
        description: "Movie tickets",
        amount: 1500,
        currency: "INR",
        payer_id: "friend-1",
        date: new Date(2025, 3, 8).toISOString(),
        group_id: "group-1",
        splits: [
          { user_id: user?.id || "current-user", amount: 500, paid: false },
          { user_id: "friend-1", amount: 500, paid: true },
          { user_id: "friend-2", amount: 500, paid: false }
        ],
        settled: false
      },
      {
        id: "expense-3",
        description: "Electricity Bill",
        amount: 2400,
        currency: "INR",
        payer_id: "friend-2",
        date: new Date(2025, 3, 1).toISOString(),
        group_id: "group-2",
        splits: [
          { user_id: user?.id || "current-user", amount: 1200, paid: false },
          { user_id: "friend-2", amount: 1200, paid: true }
        ],
        settled: false
      }
    ]);
  };
  
  const handleAddFriend = () => {
    if (!newFriendEmail.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newFriend: Friend = {
        id: `friend-${Date.now()}`,
        email: newFriendEmail.trim(),
        status: "pending"
      };
      
      setFriends([...friends, newFriend]);
      setNewFriendEmail("");
      setIsAddingFriend(false);
      setIsLoading(false);
      
      toast.success("Friend invitation sent", {
        description: `An invitation has been sent to ${newFriendEmail}`
      });
    }, 1000);
  };
  
  const handleCreateGroup = () => {
    if (!newGroupName.trim() || selectedFriends.length === 0) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const selectedFriendsData = friends.filter(friend => 
        selectedFriends.includes(friend.id)
      );
      
      const newGroup: Group = {
        id: `group-${Date.now()}`,
        name: newGroupName.trim(),
        members: [
          {
            id: user?.id || "current-user",
            email: user?.email || "user@example.com",
            first_name: "You",
            last_name: "",
            avatar_url: "",
            status: "active"
          },
          ...selectedFriendsData
        ],
        expenses: [],
        created_at: new Date().toISOString()
      };
      
      setGroups([...groups, newGroup]);
      setNewGroupName("");
      setSelectedFriends([]);
      setIsAddingGroup(false);
      setIsLoading(false);
      
      toast.success("Group created successfully");
    }, 1000);
  };
  
  const updateSplitAmounts = () => {
    const totalAmount = parseFloat(newExpense.amount || "0");
    if (totalAmount <= 0 || newExpense.splits.length === 0) return;
    
    const updatedSplits = [...newExpense.splits];
    
    if (newExpense.split_type === "equal") {
      // Equal split
      const equalAmount = (totalAmount / updatedSplits.length).toFixed(2);
      updatedSplits.forEach(split => {
        split.amount = equalAmount;
        split.percentage = (100 / updatedSplits.length).toFixed(2);
      });
    } else if (newExpense.split_type === "percentage") {
      // Percentage split - keep percentages but update amounts
      updatedSplits.forEach(split => {
        if (split.percentage) {
          const percentage = parseFloat(split.percentage);
          split.amount = ((percentage / 100) * totalAmount).toFixed(2);
        }
      });
    }
    // For 'exact' split type, we don't update any amounts automatically
    
    setNewExpense(prev => ({
      ...prev,
      splits: updatedSplits
    }));
  };
  
  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Validate that splits add up to the total
    const totalAmount = parseFloat(newExpense.amount);
    const splitSum = newExpense.splits.reduce((sum, split) => sum + parseFloat(split.amount || "0"), 0);
    
    if (Math.abs(totalAmount - splitSum) > 0.01) {
      toast.error("Split amounts must add up to the total expense amount");
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newExpenseData: Expense = {
        id: `expense-${Date.now()}`,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        currency: newExpense.currency,
        payer_id: newExpense.payer_id,
        date: newExpense.date.toISOString(),
        group_id: selectedGroupForExpense || undefined,
        splits: newExpense.splits.map(split => ({
          user_id: split.id,
          amount: parseFloat(split.amount || "0"),
          paid: split.id === newExpense.payer_id // Payer has already paid their share
        })),
        settled: false
      };
      
      setExpenses([...expenses, newExpenseData]);
      
      // Reset form
      setNewExpense({
        description: "",
        amount: "",
        currency: defaultCurrency,
        payer_id: user?.id || "",
        date: new Date(),
        group_id: "",
        split_type: "equal",
        splits: []
      });
      
      setSelectedGroupForExpense("");
      setSelectedFriendForExpense([]);
      setIsAddingExpense(false);
      setIsLoading(false);
      
      toast.success("Expense added successfully");
    }, 1000);
  };
  
  const handleSettleUp = (expenseId: string, userId: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Update the expense splits to mark the user's share as paid
      const updatedExpenses = expenses.map(expense => {
        if (expense.id === expenseId) {
          const updatedSplits = expense.splits.map(split => {
            if (split.user_id === userId) {
              return { ...split, paid: true };
            }
            return split;
          });
          
          // Check if all splits are paid, if so, mark expense as settled
          const allPaid = updatedSplits.every(split => split.paid);
          
          return {
            ...expense,
            splits: updatedSplits,
            settled: allPaid
          };
        }
        return expense;
      });
      
      setExpenses(updatedExpenses);
      setIsLoading(false);
      
      toast.success("Payment marked as settled");
    }, 1000);
  };
  
  const calculateBalances = () => {
    const balances: Record<string, { owed: number; owes: number }> = {};
    
    // Initialize balances for current user and all friends
    const allUsers = [
      user?.id || "current-user",
      ...friends.map(friend => friend.id)
    ];
    
    allUsers.forEach(userId => {
      balances[userId] = { owed: 0, owes: 0 };
    });
    
    // Calculate balances from all expenses
    expenses.forEach(expense => {
      const payerId = expense.payer_id;
      
      expense.splits.forEach(split => {
        if (!split.paid && split.user_id !== payerId) {
          // This user owes money to the payer
          balances[split.user_id].owes += split.amount;
          balances[payerId].owed += split.amount;
        }
      });
    });
    
    return balances;
  };
  
  const getCurrencySymbol = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? currency.symbol : "₹";
  };
  
  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
    const from = currencies.find(c => c.code === fromCurrency);
    const to = currencies.find(c => c.code === toCurrency);
    
    if (!from || !to) return amount;
    
    // Convert to base currency (INR) then to target currency
    // In a real app, you would use actual exchange rates from an API
    return (amount * from.rate) / to.rate;
  };
  
  const getFriendName = (friendId: string) => {
    if (friendId === user?.id) return "You";
    
    const friend = friends.find(f => f.id === friendId);
    return friend?.first_name || friend?.email || "Unknown";
  };
  
  const getGroupName = (groupId?: string) => {
    if (!groupId) return "Individual expense";
    
    const group = groups.find(g => g.id === groupId);
    return group?.name || "Unknown group";
  };
  
  const getGroupMembers = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group?.members || [];
  };
  
  const getExpensesForGroup = (groupId: string) => {
    return expenses.filter(expense => expense.group_id === groupId);
  };
  
  const getTotalBalance = () => {
    const balances = calculateBalances();
    const userId = user?.id || "current-user";
    
    return {
      owed: balances[userId]?.owed || 0,
      owes: balances[userId]?.owes || 0,
      net: (balances[userId]?.owed || 0) - (balances[userId]?.owes || 0)
    };
  };
  
  const getBalanceWithFriend = (friendId: string) => {
    let youOwe = 0;
    let theyOwe = 0;
    
    expenses.forEach(expense => {
      if (expense.payer_id === user?.id) {
        // You paid, they owe you
        const friendSplit = expense.splits.find(split => split.user_id === friendId);
        if (friendSplit && !friendSplit.paid) {
          theyOwe += friendSplit.amount;
        }
      } else if (expense.payer_id === friendId) {
        // They paid, you owe them
        const yourSplit = expense.splits.find(split => split.user_id === user?.id);
        if (yourSplit && !yourSplit.paid) {
          youOwe += yourSplit.amount;
        }
      }
    });
    
    return { youOwe, theyOwe, net: theyOwe - youOwe };
  };
  
  const getExpensesWithFriend = (friendId: string) => {
    return expenses.filter(expense => 
      expense.splits.some(split => split.user_id === friendId) &&
      expense.splits.some(split => split.user_id === user?.id)
    );
  };
  
  const balances = calculateBalances();
  const totalBalance = getTotalBalance();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Split className="h-6 w-6 mr-2" />
              Splitwise
            </h1>
            <p className="text-muted-foreground">
              Split expenses with friends in multiple currencies
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsAddingFriend(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Friend
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setIsAddingGroup(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              Create Group
            </Button>
            
            <Button
              onClick={() => setIsAddingExpense(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle>Total Balance</CardTitle>
              <CardDescription>Your current balance with all friends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">You owe</p>
                    <p className="text-xl font-semibold text-red-500">
                      {getCurrencySymbol(defaultCurrency)}{totalBalance.owes.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">You are owed</p>
                    <p className="text-xl font-semibold text-green-500">
                      {getCurrencySymbol(defaultCurrency)}{totalBalance.owed.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Net balance</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    totalBalance.net > 0 ? "text-green-500" : 
                    totalBalance.net < 0 ? "text-red-500" : "text-muted-foreground"
                  )}>
                    {totalBalance.net > 0 ? "+" : ""}
                    {getCurrencySymbol(defaultCurrency)}{totalBalance.net.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 pt-3">
              <div className="space-y-1 w-full">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select 
                  value={defaultCurrency} 
                  onValueChange={setDefaultCurrency}
                >
                  <SelectTrigger id="defaultCurrency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  All balances will be shown in this currency
                </p>
              </div>
            </CardFooter>
          </Card>
          
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your most recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.length === 0 ? (
                  <div className="text-center p-4">
                    <p className="text-muted-foreground">No expenses yet. Add your first expense to get started.</p>
                  </div>
                ) : (
                  expenses.slice(0, 3).map(expense => (
                    <div key={expense.id} className="flex items-start justify-between border-b pb-3">
                      <div className="flex items-start space-x-3">
                        <Receipt className="h-10 w-10 text-primary/60 mt-1" />
                        <div>
                          <h4 className="font-medium">{expense.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {getGroupName(expense.group_id)} • {format(new Date(expense.date), "dd MMM yyyy")}
                          </p>
                          <div className="mt-1">
                            <span className="text-sm">
                              {getFriendName(expense.payer_id)} paid {getCurrencySymbol(expense.currency)}{expense.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            expense.settled ? "border-green-500 text-green-500" : "border-orange-500 text-orange-500"
                          )}
                        >
                          {expense.settled ? "Settled" : "Unsettled"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 pt-3 flex justify-center">
              <Button variant="link" className="w-full" onClick={() => setActiveTab("expenses")}>
                View all expenses
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <Tabs defaultValue="friends" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="friends" className="flex items-center">
              <UserPlus className="h-4 w-4 mr-2" /> Friends
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center">
              <Users className="h-4 w-4 mr-2" /> Groups
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center">
              <Receipt className="h-4 w-4 mr-2" /> Expenses
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends" className="space-y-6">
            {friends.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Friends Yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Add friends to start splitting expenses with them.
                  </p>
                  <Button onClick={() => setIsAddingFriend(true)}>
                    <UserPlus className="h-4 w-4 mr-2" /> Add Friend
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map(friend => {
                  const balance = getBalanceWithFriend(friend.id);
                  return (
                    <Card key={friend.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {friend.first_name?.charAt(0) || friend.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">
                                {friend.first_name || friend.email}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {friend.email}
                              </CardDescription>
                            </div>
                          </div>
                          {friend.status === "pending" && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">You owe</p>
                            <p className="font-medium text-red-500">
                              {getCurrencySymbol(defaultCurrency)}{balance.youOwe.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">They owe</p>
                            <p className="font-medium text-green-500">
                              {getCurrencySymbol(defaultCurrency)}{balance.theyOwe.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground">Net balance</p>
                          <p className={cn(
                            "font-bold",
                            balance.net > 0 ? "text-green-500" : 
                            balance.net < 0 ? "text-red-500" : "text-muted-foreground"
                          )}>
                            {balance.net === 0 ? "Settled up" : (
                              balance.net > 0 
                                ? `They owe you ${getCurrencySymbol(defaultCurrency)}${balance.net.toFixed(2)}`
                                : `You owe them ${getCurrencySymbol(defaultCurrency)}${Math.abs(balance.net).toFixed(2)}`
                            )}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2 pb-3">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedFriendForExpense([friend.id]);
                            setIsAddingExpense(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Expense
                        </Button>
                        
                        {balance.net !== 0 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (balance.net < 0) {
                                // You owe them
                                const expense = getExpensesWithFriend(friend.id).find(e => 
                                  e.payer_id === friend.id && 
                                  e.splits.some(s => s.user_id === user?.id && !s.paid)
                                );
                                
                                if (expense) {
                                  handleSettleUp(expense.id, user?.id || "");
                                }
                              } else if (balance.net > 0) {
                                // They owe you
                                const expense = getExpensesWithFriend(friend.id).find(e => 
                                  e.payer_id === user?.id && 
                                  e.splits.some(s => s.user_id === friend.id && !s.paid)
                                );
                                
                                if (expense) {
                                  handleSettleUp(expense.id, friend.id);
                                }
                              }
                            }}
                          >
                            Settle Up
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="groups" className="space-y-6">
            {groups.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Groups Yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Create a group to easily split expenses among multiple people.
                  </p>
                  <Button onClick={() => setIsAddingGroup(true)}>
                    <Users className="h-4 w-4 mr-2" /> Create Group
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map(group => (
                  <Card key={group.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription>
                        {group.members.length} members • {getExpensesForGroup(group.id).length} expenses
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {group.members.map(member => (
                          <Avatar key={member.id} className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {member.first_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Recent Expenses</p>
                        {getExpensesForGroup(group.id).length === 0 ? (
                          <p className="text-sm text-muted-foreground">No expenses yet</p>
                        ) : (
                          getExpensesForGroup(group.id).slice(0, 2).map(expense => (
                            <div key={expense.id} className="text-sm flex justify-between">
                              <span>{expense.description}</span>
                              <span className="font-medium">
                                {getCurrencySymbol(expense.currency)}{expense.amount.toFixed(2)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2 pb-3">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedGroupForExpense(group.id);
                          setIsAddingExpense(true);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Expense
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="expenses" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>All Expenses</CardTitle>
                  <CardDescription>
                    View and manage all your expenses
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddingExpense(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Expense
                </Button>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="text-center p-6">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Expenses Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Add your first expense to start tracking and splitting.
                    </p>
                    <Button onClick={() => setIsAddingExpense(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Add Expense
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left p-3">Date</th>
                            <th className="text-left p-3">Description</th>
                            <th className="text-left p-3">Group/Friends</th>
                            <th className="text-left p-3">Paid by</th>
                            <th className="text-right p-3">Amount</th>
                            <th className="text-right p-3">Status</th>
                            <th className="text-right p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenses.map((expense) => (
                            <tr key={expense.id} className="border-t">
                              <td className="p-3">
                                {format(new Date(expense.date), "dd MMM yyyy")}
                              </td>
                              <td className="p-3 font-medium">{expense.description}</td>
                              <td className="p-3">{getGroupName(expense.group_id)}</td>
                              <td className="p-3">{getFriendName(expense.payer_id)}</td>
                              <td className="p-3 text-right font-medium">
                                {getCurrencySymbol(expense.currency)}{expense.amount.toFixed(2)}
                              </td>
                              <td className="p-3 text-right">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    expense.settled ? "border-green-500 text-green-500" : "border-orange-500 text-orange-500"
                                  )}
                                >
                                  {expense.settled ? "Settled" : "Unsettled"}
                                </Badge>
                              </td>
                              <td className="p-3 text-right">
                                {!expense.settled && expense.payer_id !== user?.id && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      const userSplit = expense.splits.find(s => s.user_id === user?.id);
                                      if (userSplit && !userSplit.paid) {
                                        handleSettleUp(expense.id, user?.id || "");
                                      }
                                    }}
                                  >
                                    Settle Up
                                  </Button>
                                )}
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
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Add Friend Dialog */}
      <Dialog open={isAddingFriend} onOpenChange={setIsAddingFriend}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Friend</DialogTitle>
            <DialogDescription>
              Enter your friend's email to send them an invitation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="friendEmail">Email</Label>
              <Input
                id="friendEmail"
                placeholder="friend@example.com"
                value={newFriendEmail}
                onChange={(e) => setNewFriendEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingFriend(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFriend} disabled={!newFriendEmail.trim() || isLoading}>
              {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Group Dialog */}
      <Dialog open={isAddingGroup} onOpenChange={setIsAddingGroup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a Group</DialogTitle>
            <DialogDescription>
              Create a group to easily split expenses with multiple friends.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                placeholder="e.g. Vacation, Apartment, Dinner"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Select Friends</Label>
              <ScrollArea className="h-40 rounded-md border p-2">
                <div className="space-y-2">
                  {friends.filter(f => f.status === "active").map(friend => (
                    <div key={friend.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`friend-${friend.id}`}
                        checked={selectedFriends.includes(friend.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFriends([...selectedFriends, friend.id]);
                          } else {
                            setSelectedFriends(selectedFriends.filter(id => id !== friend.id));
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={`friend-${friend.id}`} className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {friend.first_name?.charAt(0) || friend.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{friend.first_name || friend.email}</span>
                      </Label>
                    </div>
                  ))}
                  
                  {friends.filter(f => f.status === "active").length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">
                      No active friends yet. Add friends first to create a group.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingGroup(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGroup} 
              disabled={!newGroupName.trim() || selectedFriends.length === 0 || isLoading}
            >
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Expense Dialog */}
      <Dialog 
        open={isAddingExpense} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingExpense(false);
            setSelectedGroupForExpense("");
            setSelectedFriendForExpense([]);
            setNewExpense({
              description: "",
              amount: "",
              currency: defaultCurrency,
              payer_id: user?.id || "",
              date: new Date(),
              group_id: "",
              split_type: "equal",
              splits: []
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Add an Expense</DialogTitle>
            <DialogDescription>
              Enter expense details and how to split it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Expense Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expenseDescription">Description</Label>
                <Input
                  id="expenseDescription"
                  placeholder="e.g. Dinner, Movie tickets, etc."
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expenseAmount">Amount</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-muted-foreground">
                        {getCurrencySymbol(newExpense.currency)}
                      </span>
                    </div>
                    <Input
                      id="expenseAmount"
                      type="number"
                      placeholder="0.00"
                      className="pl-8"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expenseCurrency">Currency</Label>
                  <Select 
                    value={newExpense.currency} 
                    onValueChange={(value) => setNewExpense({ ...newExpense, currency: value })}
                  >
                    <SelectTrigger id="expenseCurrency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expenseDate">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="expenseDate"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newExpense.date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newExpense.date}
                      onSelect={(date) => setNewExpense({ ...newExpense, date: date || new Date() })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expensePayer">Paid by</Label>
                <Select 
                  value={newExpense.payer_id} 
                  onValueChange={(value) => setNewExpense({ ...newExpense, payer_id: value })}
                >
                  <SelectTrigger id="expensePayer">
                    <SelectValue placeholder="Who paid?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={user?.id || "current-user"}>
                      You
                    </SelectItem>
                    {friends
                      .filter(f => f.status === "active" && 
                                (selectedFriendForExpense.includes(f.id) || 
                                 (selectedGroupForExpense && getGroupMembers(selectedGroupForExpense).some(m => m.id === f.id))))
                      .map(friend => (
                        <SelectItem key={friend.id} value={friend.id}>
                          {friend.first_name || friend.email}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />
            
            {/* Select Group or Friends */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Split with</Label>
                <Tabs defaultValue="group">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="group">Group</TabsTrigger>
                    <TabsTrigger value="friends">Individual Friends</TabsTrigger>
                  </TabsList>
                  <TabsContent value="group" className="space-y-4">
                    <div className="space-y-2 mt-4">
                      <Select 
                        value={selectedGroupForExpense} 
                        onValueChange={setSelectedGroupForExpense}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a group" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map(group => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedGroupForExpense && (
                        <div className="mt-2">
                          <p className="text-sm mb-2">Group members:</p>
                          <div className="flex flex-wrap gap-2">
                            {getGroupMembers(selectedGroupForExpense).map(member => (
                              <Badge key={member.id} variant="secondary">
                                {member.first_name || member.email}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="friends" className="space-y-4">
                    <div className="space-y-2 mt-4">
                      <div className="rounded-md border p-2">
                        <div className="space-y-2">
                          {friends.filter(f => f.status === "active").map(friend => (
                            <div key={friend.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`expense-friend-${friend.id}`}
                                checked={selectedFriendForExpense.includes(friend.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedFriendForExpense([...selectedFriendForExpense, friend.id]);
                                  } else {
                                    setSelectedFriendForExpense(selectedFriendForExpense.filter(id => id !== friend.id));
                                  }
                                }}
                                className="rounded"
                              />
                              <Label htmlFor={`expense-friend-${friend.id}`} className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback className="text-xs">
                                    {friend.first_name?.charAt(0) || friend.email.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {friend.first_name || friend.email}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {(selectedGroupForExpense || selectedFriendForExpense.length > 0) && 
             newExpense.description && 
             newExpense.amount && (
              <div ref={splitMethodRef}>
                <Separator className="my-4" />
                
                {/* Split Method */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Split Details</h3>
                  
                  <div className="space-y-2">
                    <Label>Split Method</Label>
                    <Select 
                      value={newExpense.split_type} 
                      onValueChange={(value) => setNewExpense({ 
                        ...newExpense, 
                        split_type: value as "equal" | "exact" | "percentage" 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How to split?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equal">Equal</SelectItem>
                        <SelectItem value="exact">Exact Amounts</SelectItem>
                        <SelectItem value="percentage">Percentages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left p-2">Person</th>
                            <th className="text-right p-2">
                              {newExpense.split_type === "percentage" ? "Percentage" : "Amount"}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {newExpense.splits.map((split, index) => {
                            // Find the person name
                            let personName = "You";
                            if (split.id !== user?.id) {
                              const friend = friends.find(f => f.id === split.id);
                              personName = friend?.first_name || friend?.email || "Unknown";
                            }
                            
                            return (
                              <tr key={split.id} className="border-t">
                                <td className="p-2">{personName}</td>
                                <td className="p-2 text-right">
                                  {newExpense.split_type === "equal" ? (
                                    <div className="text-right font-medium">
                                      {getCurrencySymbol(newExpense.currency)}
                                      {split.amount}
                                    </div>
                                  ) : newExpense.split_type === "percentage" ? (
                                    <div className="flex items-center justify-end">
                                      <Input
                                        type="number"
                                        value={split.percentage}
                                        onChange={(e) => {
                                          const updatedSplits = [...newExpense.splits];
                                          updatedSplits[index] = {
                                            ...split,
                                            percentage: e.target.value,
                                            amount: ((parseFloat(e.target.value) / 100) * parseFloat(newExpense.amount || "0")).toFixed(2)
                                          };
                                          setNewExpense({ ...newExpense, splits: updatedSplits });
                                        }}
                                        className="w-20 text-right"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                      />
                                      <span className="ml-1">%</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-end">
                                      <span className="mr-1">{getCurrencySymbol(newExpense.currency)}</span>
                                      <Input
                                        type="number"
                                        value={split.amount}
                                        onChange={(e) => {
                                          const updatedSplits = [...newExpense.splits];
                                          updatedSplits[index] = {
                                            ...split,
                                            amount: e.target.value,
                                            percentage: ((parseFloat(e.target.value) / parseFloat(newExpense.amount || "1")) * 100).toFixed(2)
                                          };
                                          setNewExpense({ ...newExpense, splits: updatedSplits });
                                        }}
                                        className="w-24 text-right"
                                        step="0.01"
                                        min="0"
                                      />
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-muted/30">
                          <tr className="border-t">
                            <td className="p-2 font-medium">Total</td>
                            <td className="p-2 text-right font-medium">
                              {newExpense.split_type === "percentage" ? (
                                <div>
                                  {newExpense.splits.reduce((sum, split) => sum + parseFloat(split.percentage || "0"), 0).toFixed(2)}%
                                </div>
                              ) : (
                                <div>
                                  {getCurrencySymbol(newExpense.currency)}
                                  {newExpense.splits.reduce((sum, split) => sum + parseFloat(split.amount || "0"), 0).toFixed(2)}
                                </div>
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    
                    {newExpense.split_type !== "equal" && (
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setNewExpense({
                              ...newExpense,
                              split_type: "equal"
                            });
                            // This will trigger the useEffect to update split amounts
                          }}
                        >
                          <Divide className="h-3.5 w-3.5 mr-1.5" /> Reset to Equal Split
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingExpense(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddExpense} 
              disabled={
                !newExpense.description || 
                !newExpense.amount || 
                parseFloat(newExpense.amount) <= 0 || 
                (!selectedGroupForExpense && selectedFriendForExpense.length === 0) ||
                isLoading
              }
            >
              {isLoading ? "Adding..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
