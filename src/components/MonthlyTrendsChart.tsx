
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { useTransactions } from "@/hooks/useTransactions";
import { subMonths, format, isAfter, isBefore, parseISO, startOfMonth, endOfMonth, getMonth, getYear } from "date-fns";

export function MonthlyTrendsChart() {
  const { transactions } = useTransactions();
  const [chartType, setChartType] = useState<"line" | "area">("area");
  
  // Get last 6 months
  const months = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(today, i);
      return {
        name: format(date, "MMM yy"),
        month: getMonth(date),
        year: getYear(date),
        startDate: startOfMonth(date),
        endDate: endOfMonth(date)
      };
    }).reverse();
  }, []);

  // Calculate monthly totals
  const monthlyData = useMemo(() => {
    return months.map(monthData => {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = parseISO(t.transaction_date);
        return isAfter(transactionDate, monthData.startDate) && 
               isBefore(transactionDate, monthData.endDate);
      });
      
      const income = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      return {
        name: monthData.name,
        income,
        expenses,
        balance: income - expenses
      };
    });
  }, [transactions, months]);

  const toggleChartType = () => {
    setChartType(prev => prev === "line" ? "area" : "line");
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <div>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>Financial trends over the past 6 months</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={toggleChartType}
        >
          {chartType === "line" ? "Show Area Chart" : "Show Line Chart"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart
                data={monthlyData}
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#10b981"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#ef4444"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  name="Balance"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            ) : (
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#expensesGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  name="Balance"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#balanceGradient)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
