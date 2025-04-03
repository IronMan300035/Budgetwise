
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowDown, ArrowUp, LineChart, PieChart, DollarSign, TrendingUp, Wallet, Plus, ArrowRight } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data - will be replaced with actual data from Supabase
const mockExpenses = [
  { name: "Housing", value: 1200 },
  { name: "Food", value: 400 },
  { name: "Transportation", value: 200 },
  { name: "Entertainment", value: 150 },
  { name: "Utilities", value: 180 },
  { name: "Other", value: 120 },
];

const mockIncome = [
  { name: "Salary", value: 2800 },
  { name: "Side Hustle", value: 500 },
  { name: "Investments", value: 300 },
];

const mockTrends = [
  { month: "Jan", income: 3500, expenses: 2800 },
  { month: "Feb", income: 3600, expenses: 2750 },
  { month: "Mar", income: 3700, expenses: 2900 },
  { month: "Apr", income: 3650, expenses: 2800 },
  { month: "May", income: 3800, expenses: 2750 },
  { month: "Jun", income: 3850, expenses: 2900 },
];

const mockTransactions = [
  { id: 1, description: "Grocery Store", amount: -82.57, date: "2023-04-01", category: "Food" },
  { id: 2, description: "Salary Deposit", amount: 2800, date: "2023-04-01", category: "Income" },
  { id: 3, description: "Electric Bill", amount: -94.62, date: "2023-04-02", category: "Utilities" },
  { id: 4, description: "Coffee Shop", amount: -4.85, date: "2023-04-02", category: "Food" },
  { id: 5, description: "Gas Station", amount: -45.25, date: "2023-04-03", category: "Transportation" },
];

const mockAccounts = [
  { id: 1, name: "Checking Account", balance: 4850.45, institution: "Bank of America" },
  { id: 2, name: "Savings Account", balance: 12500.00, institution: "Bank of America" },
  { id: 3, name: "Credit Card", balance: -1240.58, institution: "Chase" },
  { id: 4, name: "Investment Account", balance: 32450.75, institution: "Fidelity" },
];

// Mock data for 3D chart elements
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
    }

    // Calculate totals
    const incomeSum = mockIncome.reduce((sum, item) => sum + item.value, 0);
    const expenseSum = mockExpenses.reduce((sum, item) => sum + item.value, 0);
    
    setTotalIncome(incomeSum);
    setTotalExpenses(expenseSum);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card hover-scale">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Balance</h3>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold">${(totalIncome - totalExpenses).toLocaleString()}</div>
                <div className="mt-2 text-sm text-green-600 flex items-center">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span>5.2% from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover-scale">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Income</h3>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold">${totalIncome.toLocaleString()}</div>
                <div className="mt-2 text-sm text-green-600 flex items-center">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span>3.8% from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover-scale">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Expenses</h3>
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold">${totalExpenses.toLocaleString()}</div>
                <div className="mt-2 text-sm text-red-600 flex items-center">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  <span>2.5% from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover-scale">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Savings Rate</h3>
                  <div className="h-8 w-8 rounded-full bg-budget-gold/20 flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-budget-gold" />
                  </div>
                </div>
                <div className="text-3xl font-bold">
                  {Math.round((totalIncome - totalExpenses) / totalIncome * 100)}%
                </div>
                <div className="mt-2 text-sm text-green-600 flex items-center">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span>1.2% from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Trends Chart */}
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Your income and expenses over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockTrends} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="income" stackId="1" stroke="#4ade80" fill="#4ade80" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="expenses" stackId="2" stroke="#f87171" fill="#f87171" fillOpacity={0.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Expenses Breakdown */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Expenses Breakdown</CardTitle>
                <CardDescription>Where your money is going</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={mockExpenses}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {mockExpenses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Amount']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Accounts and Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Accounts */}
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Accounts</CardTitle>
                  <CardDescription>Your linked financial accounts</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">{account.institution}</div>
                      </div>
                      <div className={`font-semibold ${account.balance < 0 ? 'text-red-500' : ''}`}>
                        ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Transactions */}
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest financial activities</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="font-medium">{tx.description}</div>
                        <div className="flex items-center">
                          <div className="text-sm text-muted-foreground mr-2">{tx.date}</div>
                          <div className="text-xs px-2 py-0.5 rounded-full bg-muted">{tx.category}</div>
                        </div>
                      </div>
                      <div className={`font-semibold ${tx.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Budget Progress */}
          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle>Budget Progress</CardTitle>
              <CardDescription>Your spending against monthly budget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockExpenses.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm">
                        ${category.value} / ${Math.round(category.value * 1.2)}
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${Math.min((category.value / (category.value * 1.2)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-right text-muted-foreground">
                      {Math.round((category.value / (category.value * 1.2)) * 100)}% of budget
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
