import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, Calculator, Share2, Receipt, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  participants: string[];
  date: string;
  category: string;
}

interface Group {
  id: string;
  name: string;
  members: string[];
  expenses: Expense[];
  balances: Record<string, number>;
}

export default function Splitwise() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'Food',
    participants: [] as string[]
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // Sample data for demo
  useEffect(() => {
    if (user) {
      const sampleGroups: Group[] = [
        {
          id: '1',
          name: 'Roommates',
          members: [user.email!, 'alice@example.com', 'bob@example.com'],
          expenses: [
            {
              id: '1',
              description: 'Groceries',
              amount: 150,
              paidBy: user.email!,
              participants: [user.email!, 'alice@example.com', 'bob@example.com'],
              date: new Date().toISOString().split('T')[0],
              category: 'Food'
            }
          ],
          balances: {
            [user.email!]: 100,
            'alice@example.com': -50,
            'bob@example.com': -50
          }
        }
      ];
      setGroups(sampleGroups);
    }
  }, [user]);

  const createGroup = () => {
    if (!newGroupName.trim() || !user) return;

    const newGroup: Group = {
      id: Date.now().toString(),
      name: newGroupName,
      members: [user.email!],
      expenses: [],
      balances: {}
    };

    setGroups([...groups, newGroup]);
    setNewGroupName('');
    toast.success('Group created successfully!');
  };

  const addMember = (groupId: string) => {
    if (!newMemberEmail.trim()) return;

    setGroups(groups.map(group => {
      if (group.id === groupId && !group.members.includes(newMemberEmail)) {
        return {
          ...group,
          members: [...group.members, newMemberEmail],
          balances: { ...group.balances, [newMemberEmail]: 0 }
        };
      }
      return group;
    }));

    setNewMemberEmail('');
    toast.success('Member added successfully!');
  };

  const addExpense = (groupId: string) => {
    if (!expenseForm.description || !expenseForm.amount || !user) return;

    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const amount = parseFloat(expenseForm.amount);
    const splitAmount = amount / expenseForm.participants.length;

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: expenseForm.description,
      amount,
      paidBy: user.email!,
      participants: expenseForm.participants,
      date: new Date().toISOString().split('T')[0],
      category: expenseForm.category
    };

    // Update balances
    const newBalances = { ...group.balances };
    newBalances[user.email!] = (newBalances[user.email!] || 0) + amount - splitAmount;
    
    expenseForm.participants.forEach(participant => {
      if (participant !== user.email!) {
        newBalances[participant] = (newBalances[participant] || 0) - splitAmount;
      }
    });

    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          expenses: [...g.expenses, newExpense],
          balances: newBalances
        };
      }
      return g;
    }));

    setExpenseForm({ description: '', amount: '', category: 'Food', participants: [] });
    toast.success('Expense added successfully!');
  };

  const selectedGroupData = groups.find(g => g.id === selectedGroup);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Users className="mr-3 h-8 w-8" />
            Split Expenses
          </h1>
          <p className="text-muted-foreground">Split bills and track shared expenses with friends</p>
        </div>

        <Tabs defaultValue="groups" className="space-y-6">
          <TabsList>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="balances">Balances</TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Group</CardTitle>
                <CardDescription>Start splitting expenses with friends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Group name (e.g., Roommates, Trip to Goa)"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                  <Button onClick={createGroup}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map(group => (
                <Card key={group.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {group.name}
                      <Badge variant="outline">{group.members.length} members</Badge>
                    </CardTitle>
                    <CardDescription>
                      {group.expenses.length} expense{group.expenses.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex -space-x-2 mb-4">
                      {group.members.slice(0, 3).map((member, index) => (
                        <Avatar key={member} className="w-8 h-8 border-2 border-background">
                          <AvatarFallback className="text-xs">
                            {member.split('@')[0].slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {group.members.length > 3 && (
                        <Avatar className="w-8 h-8 border-2 border-background">
                          <AvatarFallback className="text-xs">+{group.members.length - 3}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedGroup(group.id)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            {selectedGroupData && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Expense - {selectedGroupData.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="What was this for?"
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Split between</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedGroupData.members.map(member => (
                        <Badge 
                          key={member}
                          variant={expenseForm.participants.includes(member) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (expenseForm.participants.includes(member)) {
                              setExpenseForm({
                                ...expenseForm,
                                participants: expenseForm.participants.filter(p => p !== member)
                              });
                            } else {
                              setExpenseForm({
                                ...expenseForm,
                                participants: [...expenseForm.participants, member]
                              });
                            }
                          }}
                        >
                          {member.split('@')[0]}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button onClick={() => addExpense(selectedGroupData.id)}>
                    <Calculator className="h-4 w-4 mr-1" />
                    Split Expense
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {groups.flatMap(group => 
                group.expenses.map(expense => (
                  <Card key={expense.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{expense.description}</h3>
                          <p className="text-sm text-muted-foreground">
                            Paid by {expense.paidBy.split('@')[0]} • {expense.date}
                          </p>
                          <p className="text-sm">
                            Split between {expense.participants.length} people
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">₹{expense.amount}</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{(expense.amount / expense.participants.length).toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="balances" className="space-y-6">
            {groups.map(group => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle>{group.name} - Balances</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(group.balances).map(([member, balance]) => (
                      <div key={member} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {member.split('@')[0].slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.split('@')[0]}</span>
                        </div>
                        <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {balance >= 0 ? '+' : ''}₹{balance.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}