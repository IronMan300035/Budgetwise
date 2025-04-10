import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PlusCircle, Minus, UserPlus, DollarSign, Euro, PoundSterling, CircleDollarSign, UserRound, RotateCcw, Share2 } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useProfiles } from "@/hooks/useProfiles";

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.012 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.011 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.0095 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 1.82 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 0.018 }
];

interface Participant {
  id: string;
  name: string;
  email: string;
  paid: number;
  owes: number;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  paidBy: string;
  date: string;
  participants: string[];
  split: 'equal' | 'custom';
  customSplits?: Record<string, number>;
}

interface ExpenseGroup {
  id: string;
  name: string;
  participants: Participant[];
  expenses: Expense[];
  currency: string;
}

export default function Splitwise() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfiles();
  const [groups, setGroups] = useState<ExpenseGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<ExpenseGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expensePaidBy, setExpensePaidBy] = useState("");
  const [expenseSplit, setExpenseSplit] = useState<'equal' | 'custom'>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, number>>({});
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);
  
  useEffect(() => {
    if (user) {
      const sampleGroups: ExpenseGroup[] = [
        {
          id: "1",
          name: "Goa Trip",
          currency: "INR",
          participants: [
            { id: "1", name: profile?.first_name || user.email?.split('@')[0] || "You", email: user.email || "", paid: 5000, owes: 0 },
            { id: "2", name: "Rahul", email: "rahul@example.com", paid: 3000, owes: 1000 },
            { id: "3", name: "Priya", email: "priya@example.com", paid: 0, owes: 2000 },
            { id: "4", name: "Amit", email: "amit@example.com", paid: 0, owes: 2000 }
          ],
          expenses: [
            {
              id: "1",
              title: "Hotel Stay",
              amount: 8000,
              currency: "INR",
              paidBy: "1",
              date: "2025-04-08",
              participants: ["1", "2", "3", "4"],
              split: "equal"
            }
          ]
        }
      ];
      
      setGroups(sampleGroups);
      if (sampleGroups.length > 0) {
        setActiveGroup(sampleGroups[0]);
      }
    }
  }, [user, profile]);
  
  const createNewGroup = () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    
    const newGroup: ExpenseGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName,
      currency: selectedCurrency,
      participants: [
        { 
          id: user?.id || "current-user", 
          name: profile?.first_name || user?.email?.split('@')[0] || "You", 
          email: user?.email || "", 
          paid: 0, 
          owes: 0 
        }
      ],
      expenses: []
    };
    
    setGroups([...groups, newGroup]);
    setActiveGroup(newGroup);
    setNewGroupName("");
    
    toast.success(`Group "${newGroupName}" created successfully`);
  };
  
  const addParticipant = () => {
    if (!activeGroup) return;
    
    if (!newParticipantName.trim()) {
      toast.error("Please enter participant name");
      return;
    }
    
    const newParticipant: Participant = {
      id: `participant-${Date.now()}`,
      name: newParticipantName,
      email: newParticipantEmail,
      paid: 0,
      owes: 0
    };
    
    const updatedGroup = {
      ...activeGroup,
      participants: [...activeGroup.participants, newParticipant]
    };
    
    setGroups(groups.map(group => 
      group.id === activeGroup.id ? updatedGroup : group
    ));
    
    setActiveGroup(updatedGroup);
    setNewParticipantName("");
    setNewParticipantEmail("");
    
    toast.success(`${newParticipantName} added to group`);
  };
  
  const addExpense = () => {
    if (!activeGroup) return;
    
    if (!expenseTitle.trim()) {
      toast.error("Please enter expense title");
      return;
    }
    
    if (!expenseAmount || isNaN(parseFloat(expenseAmount)) || parseFloat(expenseAmount) <= 0) {
      toast.error("Please enter a valid expense amount");
      return;
    }
    
    if (!expensePaidBy) {
      toast.error("Please select who paid for this expense");
      return;
    }
    
    if (selectedParticipants.length === 0) {
      toast.error("Please select at least one participant who shares this expense");
      return;
    }
    
    const amount = parseFloat(expenseAmount);
    let splitDetails: Record<string, number> = {};
    
    if (expenseSplit === 'equal') {
      const splitAmount = amount / selectedParticipants.length;
      selectedParticipants.forEach(id => {
        splitDetails[id] = splitAmount;
      });
    } else {
      splitDetails = customSplits;
      
      const totalSplit = Object.values(customSplits).reduce((sum, val) => sum + val, 0);
      if (Math.abs(totalSplit - amount) > 0.01) {
        toast.error("Split amounts must add up to the total expense");
        return;
      }
    }
    
    const newExpense: Expense = {
      id: `expense-${Date.now()}`,
      title: expenseTitle,
      amount,
      currency: activeGroup.currency,
      paidBy: expensePaidBy,
      date: new Date().toISOString().split('T')[0],
      participants: selectedParticipants,
      split: expenseSplit,
      customSplits: expenseSplit === 'custom' ? customSplits : undefined
    };
    
    const updatedParticipants = [...activeGroup.participants];
    
    const payerIndex = updatedParticipants.findIndex(p => p.id === expensePaidBy);
    if (payerIndex !== -1) {
      updatedParticipants[payerIndex].paid += amount;
    }
    
    selectedParticipants.forEach(participantId => {
      if (participantId !== expensePaidBy) {
        const index = updatedParticipants.findIndex(p => p.id === participantId);
        if (index !== -1) {
          const splitAmount = splitDetails[participantId] || amount / selectedParticipants.length;
          updatedParticipants[index].owes += splitAmount;
        }
      }
    });
    
    const updatedGroup = {
      ...activeGroup,
      expenses: [...activeGroup.expenses, newExpense],
      participants: updatedParticipants
    };
    
    setGroups(groups.map(group => 
      group.id === activeGroup.id ? updatedGroup : group
    ));
    
    setActiveGroup(updatedGroup);
    setExpenseTitle("");
    setExpenseAmount("");
    setExpensePaidBy("");
    setSelectedParticipants([]);
    setCustomSplits({});
    
    toast.success("Expense added successfully");
  };
  
  const handleSetExpenseAmount = (value: string) => {
    setExpenseAmount(value);
    
    if (selectedParticipants.length > 0 && value) {
      const amount = parseFloat(value);
      if (!isNaN(amount)) {
        const splitAmount = amount / selectedParticipants.length;
        const splits: Record<string, number> = {};
        
        selectedParticipants.forEach(id => {
          splits[id] = splitAmount;
        });
        
        setCustomSplits(splits);
      }
    }
  };
  
  const handleParticipantSelection = (id: string, selected: boolean) => {
    let newSelected: string[];
    
    if (selected) {
      newSelected = [...selectedParticipants, id];
    } else {
      newSelected = selectedParticipants.filter(p => p !== id);
    }
    
    setSelectedParticipants(newSelected);
    
    if (expenseAmount) {
      const amount = parseFloat(expenseAmount);
      if (!isNaN(amount) && newSelected.length > 0) {
        const splitAmount = amount / newSelected.length;
        const splits: Record<string, number> = {};
        
        newSelected.forEach(partId => {
          splits[partId] = splitAmount;
        });
        
        setCustomSplits(splits);
      }
    }
  };
  
  const updateCustomSplit = (id: string, value: string) => {
    const amount = parseFloat(value);
    
    if (!isNaN(amount)) {
      setCustomSplits({
        ...customSplits,
        [id]: amount
      });
    }
  };
  
  const getParticipantName = (id: string) => {
    const participant = activeGroup?.participants.find(p => p.id === id);
    return participant?.name || "Unknown";
  };
  
  const getCurrencySymbol = (code: string) => {
    const currency = CURRENCIES.find(c => c.code === code);
    return currency?.symbol || code;
  };
  
  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
    const from = CURRENCIES.find(c => c.code === fromCurrency);
    const to = CURRENCIES.find(c => c.code === toCurrency);
    
    if (!from || !to) return amount;
    
    const inINR = amount / from.rate;
    return inINR * to.rate;
  };
  
  const settlementSummary = () => {
    if (!activeGroup) return [];
    
    const settlements: {from: string, to: string, amount: number}[] = [];
    const participants = [...activeGroup.participants];
    
    const balances = participants.map(p => {
      const totalPaid = p.paid;
      const totalOwed = p.owes;
      const netBalance = totalPaid - totalOwed;
      
      return {
        id: p.id,
        name: p.name,
        balance: netBalance
      };
    });
    
    balances.sort((a, b) => a.balance - b.balance);
    
    let i = 0;
    let j = balances.length - 1;
    
    while (i < j) {
      const debtor = balances[i];
      const creditor = balances[j];
      
      if (Math.abs(debtor.balance) < 0.01) {
        i++;
        continue;
      }
      
      if (Math.abs(creditor.balance) < 0.01) {
        j--;
        continue;
      }
      
      const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
      
      if (amount > 0) {
        settlements.push({
          from: debtor.id,
          to: creditor.id,
          amount
        });
        
        debtor.balance += amount;
        creditor.balance -= amount;
      }
      
      if (Math.abs(debtor.balance) < 0.01) i++;
      if (Math.abs(creditor.balance) < 0.01) j--;
    }
    
    return settlements;
  };
  
  const shareGroup = () => {
    navigator.clipboard.writeText(`BudgetWise - Join my expense group: ${activeGroup?.name}`);
    toast.success("Invitation link copied to clipboard");
  };
  
  const handleAddFirstExpenseClick = () => {
    const addButton = document.querySelector('[data-value="add"]');
    if (addButton && addButton instanceof HTMLElement) {
      addButton.click();
    }
  };
  
  const handleCreateFirstGroupClick = () => {
    const createButton = document.querySelector('button:has(svg[data-lucide="PlusCircle"])');
    if (createButton && createButton instanceof HTMLElement) {
      createButton.click();
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Split Expenses</h1>
        <p className="text-muted-foreground mb-8">Split bills and settle expenses with friends</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Groups</CardTitle>
                <CardDescription>Select or create a group to split expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {groups.length > 0 ? (
                  <div className="space-y-2">
                    {groups.map(group => (
                      <Button
                        key={group.id}
                        variant={activeGroup?.id === group.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setActiveGroup(group)}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        {group.name}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No groups yet</p>
                  </div>
                )}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create New Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a New Group</DialogTitle>
                      <DialogDescription>
                        Give your group a name and set the default currency
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="group-name">Group Name</Label>
                        <Input
                          id="group-name"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          placeholder="E.g., Goa Trip, Roommates, Lunch Group"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="currency">Default Currency</Label>
                        <Select
                          value={selectedCurrency}
                          onValueChange={setSelectedCurrency}
                        >
                          <SelectTrigger id="currency">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map(currency => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.symbol} {currency.name} ({currency.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button onClick={createNewGroup}>Create Group</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
            
            {activeGroup && (
              <Card>
                <CardHeader>
                  <CardTitle>Group Summary</CardTitle>
                  <CardDescription>
                    {activeGroup.name} • {activeGroup.participants.length} participants
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Participants</h4>
                    {activeGroup.participants.map(person => (
                      <div key={person.id} className="flex justify-between items-center text-sm py-1 border-b last:border-0">
                        <span>{person.name}</span>
                        <span className={person.paid > person.owes ? "text-green-600" : person.owes > 0 ? "text-red-600" : ""}>
                          {getCurrencySymbol(activeGroup.currency)}{(person.paid - person.owes).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-2">Settlement Summary</h4>
                    {settlementSummary().length > 0 ? (
                      settlementSummary().map((settlement, index) => (
                        <div key={index} className="flex justify-between items-center text-sm py-1 border-b last:border-0">
                          <span>
                            {getParticipantName(settlement.from)} owes {getParticipantName(settlement.to)}
                          </span>
                          <span className="font-medium">
                            {getCurrencySymbol(activeGroup.currency)}{settlement.amount.toFixed(2)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">All settled up!</p>
                    )}
                  </div>
                  
                  <Button className="w-full" variant="outline" onClick={shareGroup}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Group
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-6">
            {activeGroup ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{activeGroup.name}</CardTitle>
                        <CardDescription>
                          {activeGroup.currency} • {activeGroup.participants.length} participants
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => shareGroup()}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="expenses">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="expenses">Expenses</TabsTrigger>
                        <TabsTrigger value="people">People</TabsTrigger>
                        <TabsTrigger value="add">Add Expense</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="expenses" className="space-y-4 pt-4">
                        {activeGroup.expenses.length > 0 ? (
                          activeGroup.expenses.map(expense => (
                            <Card key={expense.id}>
                              <CardHeader className="pb-2">
                                <div className="flex justify-between">
                                  <CardTitle className="text-lg">{expense.title}</CardTitle>
                                  <span className="font-bold">
                                    {getCurrencySymbol(expense.currency)}{expense.amount.toFixed(2)}
                                  </span>
                                </div>
                                <CardDescription>
                                  {new Date(expense.date).toLocaleDateString()} • Paid by {getParticipantName(expense.paidBy)}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="text-sm">
                                  Split between: {expense.participants.map(id => getParticipantName(id)).join(', ')}
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground mb-2">No expenses yet</p>
                            <Button variant="outline" onClick={handleAddFirstExpenseClick}>
                              Add your first expense
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="people" className="pt-4">
                        <div className="space-y-4">
                          {activeGroup.participants.map(person => (
                            <div key={person.id} className="flex justify-between items-center p-3 border rounded-md">
                              <div>
                                <h4 className="font-medium">{person.name}</h4>
                                {person.email && <p className="text-sm text-muted-foreground">{person.email}</p>}
                              </div>
                              <div className="text-right">
                                <div className="text-sm">
                                  Paid: <span className="font-medium">{getCurrencySymbol(activeGroup.currency)}{person.paid.toFixed(2)}</span>
                                </div>
                                <div className="text-sm">
                                  Owes: <span className="font-medium text-red-500">{getCurrencySymbol(activeGroup.currency)}{person.owes.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <div className="pt-4">
                            <h4 className="text-sm font-medium mb-2">Add a new person</h4>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="Name" 
                                value={newParticipantName} 
                                onChange={(e) => setNewParticipantName(e.target.value)}
                              />
                              <Input 
                                placeholder="Email (optional)" 
                                value={newParticipantEmail} 
                                onChange={(e) => setNewParticipantEmail(e.target.value)}
                              />
                              <Button onClick={addParticipant}>
                                <UserPlus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="add" className="pt-4">
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="expense-title">What was it for?</Label>
                            <Input
                              id="expense-title"
                              placeholder="E.g., Dinner, Taxi, Movie tickets"
                              value={expenseTitle}
                              onChange={(e) => setExpenseTitle(e.target.value)}
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="expense-amount">How much was it?</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                {getCurrencySymbol(activeGroup.currency)}
                              </span>
                              <Input
                                id="expense-amount"
                                type="number"
                                className="pl-8"
                                placeholder="0.00"
                                value={expenseAmount}
                                onChange={(e) => handleSetExpenseAmount(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="paid-by">Who paid?</Label>
                            <Select
                              value={expensePaidBy}
                              onValueChange={setExpensePaidBy}
                            >
                              <SelectTrigger id="paid-by">
                                <SelectValue placeholder="Select person" />
                              </SelectTrigger>
                              <SelectContent>
                                {activeGroup.participants.map(person => (
                                  <SelectItem key={person.id} value={person.id}>
                                    {person.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label>Split between</Label>
                            <div className="space-y-2 border rounded-md p-3">
                              {activeGroup.participants.map(person => (
                                <div key={person.id} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`participant-${person.id}`}
                                    className="mr-2"
                                    checked={selectedParticipants.includes(person.id)}
                                    onChange={(e) => handleParticipantSelection(person.id, e.target.checked)}
                                  />
                                  <Label htmlFor={`participant-${person.id}`} className="cursor-pointer">
                                    {person.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label>Split type</Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant={expenseSplit === 'equal' ? 'default' : 'outline'}
                                className="flex-1"
                                onClick={() => setExpenseSplit('equal')}
                              >
                                Split equally
                              </Button>
                              <Button
                                type="button"
                                variant={expenseSplit === 'custom' ? 'default' : 'outline'}
                                className="flex-1"
                                onClick={() => setExpenseSplit('custom')}
                              >
                                Custom amounts
                              </Button>
                            </div>
                          </div>
                          
                          {expenseSplit === 'custom' && selectedParticipants.length > 0 && (
                            <div className="grid gap-2">
                              <Label>Custom split amounts</Label>
                              <div className="space-y-2 border rounded-md p-3">
                                {selectedParticipants.map(id => {
                                  const person = activeGroup.participants.find(p => p.id === id);
                                  if (!person) return null;
                                  
                                  return (
                                    <div key={id} className="flex items-center gap-2">
                                      <span className="w-1/3">{person.name}</span>
                                      <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                          {getCurrencySymbol(activeGroup.currency)}
                                        </span>
                                        <Input
                                          type="number"
                                          className="pl-8"
                                          value={customSplits[id] || ''}
                                          onChange={(e) => updateCustomSplit(id, e.target.value)}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                                
                                <div className="flex justify-between items-center pt-2 border-t mt-2">
                                  <span>Total:</span>
                                  <span className="font-medium">
                                    {getCurrencySymbol(activeGroup.currency)}
                                    {Object.values(customSplits).reduce((sum, val) => sum + val, 0).toFixed(2)}
                                  </span>
                                </div>
                                
                                {expenseAmount && Math.abs(
                                  Object.values(customSplits).reduce((sum, val) => sum + val, 0) -
                                  parseFloat(expenseAmount)
                                ) > 0.01 && (
                                  <div className="text-sm text-red-500 pt-1">
                                    The total doesn't match the expense amount.
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <Button className="w-full" onClick={addExpense}>
                            Add Expense
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex items-center justify-center h-full py-20">
                <div className="text-center max-w-md mx-auto">
                  <Share2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Split Expenses with Friends</h2>
                  <p className="text-muted-foreground mb-6">
                    Create a group to start splitting expenses with friends, roommates or colleagues.
                  </p>
                  <Button onClick={handleCreateFirstGroupClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Group
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
